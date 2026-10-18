
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useBeforeUnload,
  useBlocker,
  type MetaFunction,
} from "react-router";

import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Globe2,
  LoaderCircle,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";

export const meta: MetaFunction = () => [
  { title: "Social Links — HEYBIO" },
  {
    name: "robots",
    content: "noindex, nofollow",
  },
];

const PLATFORMS = [
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
  "x",
  "linkedin",
  "github",
  "threads",
  "pinterest",
  "snapchat",
  "twitch",
  "website",
] as const;

type Platform =
  (typeof PLATFORMS)[number];

type SocialLink = {
  platform: Platform;
  url: string;
  is_visible: boolean;
};

type Snapshot = {
  links: SocialLink[];
  revision: number;
};

type Status =
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | null;

const LABELS: Record<Platform, string> = {
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  facebook: "Facebook",
  x: "X (Twitter)",
  linkedin: "LinkedIn",
  github: "GitHub",
  threads: "Threads",
  pinterest: "Pinterest",
  snapchat: "Snapchat",
  twitch: "Twitch",
  website: "Website",
};

function isPlatform(
  value: unknown,
): value is Platform {
  return (
    typeof value === "string" &&
    PLATFORMS.some(
      (platform) => platform === value,
    )
  );
}

function validUrl(
  value: string,
): boolean {
  const raw = value.trim();

  if (
    raw.length < 10 ||
    raw.length > 2048 ||
    /[\s\\\u0000-\u001f\u007f]/.test(raw)
  ) {
    return false;
  }

  try {
    const url = new URL(raw);

    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password &&
      url.href.length <= 2048
    );
  } catch {
    return false;
  }
}

function parseSnapshot(
  value: unknown,
): Snapshot {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    throw new Error("Invalid API response.");
  }

  const record = value as Record<
    string,
    unknown
  >;

  if (
    !Number.isSafeInteger(record.revision) ||
    typeof record.revision !== "number" ||
    record.revision < 0 ||
    !Array.isArray(record.links) ||
    record.links.length > 12
  ) {
    throw new Error(
      "Invalid social links response.",
    );
  }

  const seen = new Set<Platform>();
  const links: SocialLink[] = [];

  for (const item of record.links) {
    if (
      !item ||
      typeof item !== "object" ||
      Array.isArray(item)
    ) {
      throw new Error(
        "Invalid social link entry.",
      );
    }

    const link = item as Record<
      string,
      unknown
    >;

    if (
      !isPlatform(link.platform) ||
      typeof link.url !== "string" ||
      !validUrl(link.url) ||
      typeof link.is_visible !== "boolean" ||
      seen.has(link.platform)
    ) {
      throw new Error(
        "Invalid social link data.",
      );
    }

    seen.add(link.platform);

    links.push({
      platform: link.platform,
      url: link.url,
      is_visible: link.is_visible,
    });
  }

  return {
    links,
    revision: record.revision,
  };
}

function sameLinks(
  first: SocialLink[],
  second: SocialLink[],
): boolean {
  if (first.length !== second.length) {
    return false;
  }

  return first.every((item, index) => {
    const other = second[index];

    return (
      other !== undefined &&
      item.platform === other.platform &&
      item.url === other.url &&
      item.is_visible === other.is_visible
    );
  });
}

function normalizeForSave(
  links: SocialLink[],
): SocialLink[] {
  return links.map((link) => ({
    platform: link.platform,
    url: new URL(link.url.trim()).href,
    is_visible: link.is_visible,
  }));
}

async function readResponse(
  response: Response,
): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new Error(
      "Server returned an invalid response.",
    );
  }
}

function getErrorMessage(
  value: unknown,
): string | null {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return null;
  }

  const error = (
    value as Record<string, unknown>
  ).error;

  return typeof error === "string"
    ? error
    : null;
}

const buttonStyle = {
  border: "1px solid #dfe3e8",
  borderRadius: 12,
  background: "#fff",
  color: "#1d1d1f",
  padding: "10px 13px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  fontWeight: 650,
  cursor: "pointer",
} as const;

const cardStyle = {
  border: "1px solid #e6e8eb",
  borderRadius: 20,
  background: "#fff",
  padding: 20,
} as const;

export default function SocialLinksPage() {
  const [links, setLinks] =
    useState<SocialLink[]>([]);

  const [baseline, setBaseline] =
    useState<SocialLink[]>([]);

  const [revision, setRevision] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [conflict, setConflict] =
    useState(false);

  const [status, setStatus] =
    useState<Status>(null);

  const [adding, setAdding] =
    useState<Platform | "">("");

  const [latestServer, setLatestServer] =
    useState<Snapshot | null>(null);

  const mounted = useRef(true);

  const dirty = !sameLinks(
    links,
    baseline,
  );

  const busy = loading || saving;

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
    };
  }, []);

  const fetchSnapshot = useCallback(
    async (
      signal?: AbortSignal,
    ): Promise<Snapshot> => {
      const response = await fetch(
        "/api/social-links",
        {
          method: "GET",
          credentials: "same-origin",
          cache: "no-store",
          signal,
          headers: {
            Accept: "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load social links.",
        );
      }

      return parseSnapshot(
        await readResponse(response),
      );
    },
    [],
  );

  const loadInitial = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);

      try {
        const snapshot =
          await fetchSnapshot(signal);

        if (
          signal?.aborted ||
          !mounted.current
        ) {
          return;
        }

        setLinks(snapshot.links);
        setBaseline(snapshot.links);
        setRevision(snapshot.revision);
        setLatestServer(null);
        setConflict(false);
        setStatus(null);
      } catch (error) {
        if (
          signal?.aborted ||
          !mounted.current
        ) {
          return;
        }

        setStatus({
          kind: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load social links.",
        });
      } finally {
        if (
          !signal?.aborted &&
          mounted.current
        ) {
          setLoading(false);
        }
      }
    },
    [fetchSnapshot],
  );

  useEffect(() => {
    const controller =
      new AbortController();

    void loadInitial(
      controller.signal,
    );

    return () => controller.abort();
  }, [loadInitial]);

  useBeforeUnload(
    useCallback(
      (event: BeforeUnloadEvent) => {
        if (!dirty && !saving) {
          return;
        }

        event.preventDefault();
        event.returnValue = "";
      },
      [dirty, saving],
    ),
  );

  const blocker = useBlocker(
    useCallback(
      () => dirty || saving,
      [dirty, saving],
    ),
  );

  const available = PLATFORMS.filter(
    (platform) =>
      !links.some(
        (link) =>
          link.platform === platform,
      ),
  );

  function changeLink(
    index: number,
    changes: Partial<SocialLink>,
  ) {
    if (busy) return;

    setLinks((current) =>
      current.map((item, i) =>
        i === index
          ? { ...item, ...changes }
          : item,
      ),
    );

    setStatus(null);
  }

  function addLink() {
    if (
      !adding ||
      !isPlatform(adding) ||
      links.length >= 12 ||
      busy
    ) {
      return;
    }

    if (
      links.some(
        (link) =>
          link.platform === adding,
      )
    ) {
      return;
    }

    setLinks((current) => [
      ...current,
      {
        platform: adding,
        url: "",
        is_visible: true,
      },
    ]);

    setAdding("");
    setStatus(null);
  }

  function removeLink(
    index: number,
  ) {
    if (busy) return;

    setLinks((current) =>
      current.filter(
        (_, i) => i !== index,
      ),
    );

    setStatus(null);
  }

  function moveLink(
    index: number,
    direction: -1 | 1,
  ) {
    if (busy) return;

    setLinks((current) => {
      const target =
        index + direction;

      if (
        target < 0 ||
        target >= current.length
      ) {
        return current;
      }

      const next = [...current];

      const sourceItem =
        next[index];

      const targetItem =
        next[target];

      if (
        sourceItem === undefined ||
        targetItem === undefined
      ) {
        return current;
      }

      next[index] = targetItem;
      next[target] = sourceItem;

      return next;
    });

    setStatus(null);
  }

  function applySnapshot(
    snapshot: Snapshot,
  ) {
    setLinks(snapshot.links);
    setBaseline(snapshot.links);
    setRevision(snapshot.revision);
    setConflict(false);
    setLatestServer(null);
    setStatus(null);
  }

  async function checkLatest() {
    if (busy) return;

    setLoading(true);

    try {
      const snapshot =
        await fetchSnapshot();

      if (!mounted.current) return;

      if (
        revision !== null &&
        snapshot.revision !== revision
      ) {
        setLatestServer(snapshot);
        setConflict(true);

        setStatus({
          kind: "error",
          message:
            "Another tab or session changed your social links.",
        });
      } else if (!dirty) {
        applySnapshot(snapshot);
      } else {
        setStatus({
          kind: "success",
          message:
            "No newer server revision found. Your edits are still unsaved.",
        });
      }
    } catch {
      if (!mounted.current) return;

      setStatus({
        kind: "error",
        message:
          "Unable to check the latest version.",
      });
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }

  async function save() {
    if (
      busy ||
      revision === null ||
      !dirty ||
      conflict
    ) {
      return;
    }

    if (
      links.length > 12 ||
      links.some(
        (link) =>
          !validUrl(link.url),
      )
    ) {
      setStatus({
        kind: "error",
        message:
          "Every link needs a valid HTTPS URL.",
      });

      return;
    }

    let payload: SocialLink[];

    try {
      payload = normalizeForSave(
        links,
      );
    } catch {
      setStatus({
        kind: "error",
        message:
          "One or more URLs are invalid.",
      });

      return;
    }

    setSaving(true);
    setStatus(null);

    try {
      const response = await fetch(
        "/api/social-links",
        {
          method: "POST",
          credentials: "same-origin",
          cache: "no-store",
          headers: {
            "Content-Type":
              "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            expectedRevision: revision,
            links: payload,
          }),
        },
      );

      const result =
        await readResponse(response);

      if (!mounted.current) return;

      if (
        response.status === 409
      ) {
        setConflict(true);
        setLatestServer(null);

        setStatus({
          kind: "error",
          message:
            "Save blocked: another session has updated these links. Your edits are preserved.",
        });

        return;
      }

      if (!response.ok) {
        throw new Error(
          getErrorMessage(result) ??
            "Unable to save social links.",
        );
      }

      if (
        !result ||
        typeof result !== "object" ||
        Array.isArray(result)
      ) {
        throw new Error(
          "Invalid save confirmation.",
        );
      }

      const saved = result as Record<
        string,
        unknown
      >;

      if (
        saved.ok !== true ||
        typeof saved.revision !==
          "number" ||
        !Number.isSafeInteger(
          saved.revision,
        ) ||
        saved.revision <= revision
      ) {
        throw new Error(
          "Invalid revision returned by server.",
        );
      }

      setLinks(payload);
      setBaseline(payload);
      setRevision(saved.revision);
      setConflict(false);
      setLatestServer(null);

      setStatus({
        kind: "success",
        message:
          "Your social links were saved.",
      });
    } catch (error) {
      if (!mounted.current) return;

      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Save failed.",
      });
    } finally {
      if (mounted.current) {
        setSaving(false);
      }
    }
  }

  async function loadServerVersion() {
    if (busy) return;

    if (latestServer) {
      applySnapshot(latestServer);
      return;
    }

    setLoading(true);

    try {
      const snapshot =
        await fetchSnapshot();

      if (!mounted.current) return;

      applySnapshot(snapshot);
    } catch {
      if (!mounted.current) return;

      setStatus({
        kind: "error",
        message:
          "Could not reload the latest server version.",
      });
    } finally {
      if (mounted.current) {
        setLoading(false);
      }
    }
  }

  const visibleCount =
    links.filter(
      (link) => link.is_visible,
    ).length;

  return (
    <main
      style={{
        maxWidth: 1040,
        margin: "0 auto",
        padding: "28px 16px 90px",
        color: "#1d1d1f",
      }}
    >
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 26,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 1.5,
              color: "#617100",
              marginBottom: 8,
            }}
          >
            HEYBIO / CREATOR STUDIO
          </div>

          <h1
            style={{
              fontSize:
                "clamp(27px, 4vw, 38px)",
              letterSpacing: -1.4,
              margin: 0,
            }}
          >
            Social Links
          </h1>

          <p
            style={{
              color: "#686b73",
              marginTop: 8,
              lineHeight: 1.6,
            }}
          >
            Connect your world.
            Control what your
            visitors see.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            void save();
          }}
          disabled={
            busy ||
            !dirty ||
            conflict ||
            revision === null
          }
          style={{
            ...buttonStyle,
            background:
              busy ||
              !dirty ||
              conflict
                ? "#e8ebee"
                : "#BDF806",
            borderColor:
              busy ||
              !dirty ||
              conflict
                ? "#e8ebee"
                : "#BDF806",
            opacity:
              busy ? 0.7 : 1,
          }}
        >
          {saving ? (
            <LoaderCircle size={17} />
          ) : (
            <Save size={17} />
          )}
          {saving
            ? "Saving..."
            : "Save Changes"}
        </button>
      </header>

      <section
        aria-label="Social links overview"
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(150px, 1fr))",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {[
          {
            label: "Total Links",
            value: links.length,
          },
          {
            label: "Visible",
            value: visibleCount,
          },
          {
            label: "Available Slots",
            value: 12 - links.length,
          },
        ].map((item) => (
          <div
            key={item.label}
            style={cardStyle}
          >
            <div
              style={{
                color: "#6b6e75",
                fontSize: 13,
              }}
            >
              {item.label}
            </div>

            <div
              style={{
                fontSize: 30,
                fontWeight: 800,
                marginTop: 8,
              }}
            >
              {item.value}
            </div>
          </div>
        ))}
      </section>

      {status && (
        <div
          role={
            status.kind === "error"
              ? "alert"
              : "status"
          }
          style={{
            ...cardStyle,
            marginBottom: 18,
            display: "flex",
            gap: 12,
            alignItems: "flex-start",
            background:
              status.kind === "error"
                ? "#fff7f5"
                : "#f6faeb",
            borderColor:
              status.kind === "error"
                ? "#f1c9c1"
                : "#dce8c0",
          }}
        >
          {status.kind === "error" ? (
            <AlertTriangle size={20} />
          ) : (
            <Check size={20} />
          )}

          <span>
            {status.message}
          </span>
        </div>
      )}

      {conflict && (
        <section
          aria-label="Version conflict"
          style={{
            ...cardStyle,
            marginBottom: 20,
            borderColor: "#e7c3ad",
          }}
        >
          <h2
            style={{
              fontSize: 19,
              marginTop: 0,
            }}
          >
            Another version exists
          </h2>

          <p
            style={{
              color: "#686b73",
              lineHeight: 1.7,
            }}
          >
            Your current edits are
            still here. Saving is
            disabled to prevent
            overwriting changes made
            in another tab or session.
            Reloading the server
            version will discard
            your local unsaved edits.
          </p>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              style={buttonStyle}
              disabled={busy}
              onClick={() => {
                void loadServerVersion();
              }}
            >
              <RefreshCw size={16} />
              Load Server Version
            </button>

            <button
              type="button"
              style={buttonStyle}
              onClick={() => {
                const text =
                  JSON.stringify(
                    links,
                    null,
                    2,
                  );

                const blob = new Blob(
                  [text],
                  {
                    type: "application/json",
                  },
                );

                const url =
                  URL.createObjectURL(blob);

                const anchor =
                  document.createElement(
                    "a",
                  );

                anchor.href = url;
                anchor.download =
                  "heybio-social-links-unsaved.json";

                anchor.click();

                URL.revokeObjectURL(
                  url,
                );
              }}
            >
              Save Local Backup
            </button>
          </div>
        </section>
      )}

      <section
        style={{
          ...cardStyle,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
              }}
            >
              Your Platforms
            </h2>

            <p
              style={{
                color: "#777a80",
                fontSize: 13,
                marginBottom: 0,
              }}
            >
              Drag-free ordering
              using move controls.
            </p>
          </div>

          <button
            type="button"
            style={buttonStyle}
            disabled={busy}
            onClick={() => {
              void checkLatest();
            }}
          >
            <RefreshCw size={16} />
            Check Latest
          </button>
        </div>

        {loading && (
          <p role="status">
            Loading social links...
          </p>
        )}

        {!loading &&
          links.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "40px 12px",
                background: "#F5F5F7",
                borderRadius: 16,
              }}
            >
              <Globe2
                size={30}
                style={{
                  marginBottom: 12,
                }}
              />

              <h3>
                No social links yet
              </h3>

              <p
                style={{
                  color: "#686b73",
                }}
              >
                Add your first
                platform below.
              </p>
            </div>
          )}

        <div
          style={{
            display: "grid",
            gap: 12,
          }}
        >
          {links.map(
            (link, index) => (
              <article
                key={link.platform}
                style={{
                  padding: 16,
                  border:
                    "1px solid #e5e7eb",
                  borderRadius: 16,
                  background:
                    "#fafafa",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "space-between",
                    flexWrap:
                      "wrap",
                    gap: 10,
                    marginBottom: 14,
                  }}
                >
                  <strong>
                    {LABELS[
                      link.platform
                    ]}
                  </strong>

                  <div
                    style={{
                      display: "flex",
                      flexWrap:
                        "wrap",
                      gap: 6,
                    }}
                  >
                    <button
                      type="button"
                      aria-label={`Move ${
                        LABELS[
                          link.platform
                        ]
                      } up`}
                      title="Move up"
                      style={buttonStyle}
                      disabled={
                        busy ||
                        index === 0
                      }
                      onClick={() =>
                        moveLink(
                          index,
                          -1,
                        )
                      }
                    >
                      <ArrowUp
                        size={16}
                      />
                    </button>

                    <button
                      type="button"
                      aria-label={`Move ${
                        LABELS[
                          link.platform
                        ]
                      } down`}
                      title="Move down"
                      style={buttonStyle}
                      disabled={
                        busy ||
                        index ===
                          links.length -
                            1
                      }
                      onClick={() =>
                        moveLink(
                          index,
                          1,
                        )
                      }
                    >
                      <ArrowDown
                        size={16}
                      />
                    </button>

                    <button
                      type="button"
                      aria-label={`${
                        link.is_visible
                          ? "Hide"
                          : "Show"
                      } ${
                        LABELS[
                          link.platform
                        ]
                      }`}
                      style={buttonStyle}
                      disabled={busy}
                      onClick={() =>
                        changeLink(
                          index,
                          {
                            is_visible:
                              !link.is_visible,
                          },
                        )
                      }
                    >
                      {link.is_visible ? (
                        <Eye
                          size={16}
                        />
                      ) : (
                        <EyeOff
                          size={16}
                        />
                      )}
                    </button>

                    <button
                      type="button"
                      aria-label={`Remove ${
                        LABELS[
                          link.platform
                        ]
                      }`}
                      title="Remove"
                      style={buttonStyle}
                      disabled={busy}
                      onClick={() =>
                        removeLink(
                          index,
                        )
                      }
                    >
                      <Trash2
                        size={16}
                      />
                    </button>
                  </div>
                </div>

                <label
                  htmlFor={`social-${link.platform}`}
                  style={{
                    display:
                      "block",
                    fontSize: 13,
                    fontWeight:
                      650,
                    marginBottom:
                      7,
                  }}
                >
                  Profile URL
                </label>

                <div
                  style={{
                    display: "flex",
                    gap: 8,
                  }}
                >
                  <input
                    id={`social-${link.platform}`}
                    type="url"
                    inputMode="url"
                    autoComplete="url"
                    placeholder="https://example.com/profile"
                    value={
                      link.url
                    }
                    disabled={
                      busy
                    }
                    aria-invalid={
                      link.url.length >
                        0 &&
                      !validUrl(
                        link.url,
                      )
                    }
                    onChange={(
                      event,
                    ) =>
                      changeLink(
                        index,
                        {
                          url:
                            event
                              .target
                              .value,
                        },
                      )
                    }
                    style={{
                      minWidth:
                        0,
                      flex: 1,
                      padding:
                        "12px",
                      border:
                        "1px solid #dfe3e8",
                      borderRadius:
                        10,
                      fontSize:
                        14,
                      background:
                        "#fff",
                      color:
                        "#1d1d1f",
                    }}
                  />

                  {validUrl(
                    link.url,
                  ) && (
                    <a
                      href={
                        link.url
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Open ${
                        LABELS[
                          link.platform
                        ]
                      } link`}
                      style={{
                        ...buttonStyle,
                        textDecoration:
                          "none",
                      }}
                    >
                      <ExternalLink
                        size={16}
                      />
                    </a>
                  )}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color:
                      link.is_visible
                        ? "#536800"
                        : "#777a80",
                    marginTop: 9,
                  }}
                >
                  {link.is_visible
                    ? "Visible on your profile"
                    : "Hidden from your profile"}
                </div>
              </article>
            ),
          )}
        </div>
      </section>

      <section
        style={cardStyle}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: 20,
          }}
        >
          Add a Platform
        </h2>

        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <select
            aria-label="Select social platform"
            value={adding}
            disabled={
              busy ||
              available.length === 0
            }
            onChange={(event) => {
              const value =
                event.target.value;

              setAdding(
                isPlatform(value)
                  ? value
                  : "",
              );
            }}
            style={{
              flex: "1 1 220px",
              padding: 12,
              border:
                "1px solid #dfe3e8",
              borderRadius: 12,
              background: "#fff",
              color: "#1d1d1f",
            }}
          >
            <option value="">
              Choose platform
            </option>

            {available.map(
              (platform) => (
                <option
                  key={platform}
                  value={platform}
                >
                  {LABELS[
                    platform
                  ]}
                </option>
              ),
            )}
          </select>

          <button
            type="button"
            style={{
              ...buttonStyle,
              background:
                "#BDF806",
              borderColor:
                "#BDF806",
            }}
            disabled={
              busy ||
              !adding ||
              links.length >= 12
            }
            onClick={
              addLink
            }
          >
            <Plus size={17} />
            Add Platform
          </button>
        </div>

        <p
          style={{
            color: "#777a80",
            fontSize: 13,
            marginBottom: 0,
          }}
        >
          Maximum 12 platforms.
          HTTPS URLs only.
        </p>
      </section>

      <footer
        style={{
          marginTop: 20,
          display: "flex",
          flexWrap: "wrap",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: 12,
          color: "#686b73",
          fontSize: 13,
        }}
      >
        <span>
          <ShieldCheck
            size={15}
            style={{
              verticalAlign:
                "middle",
              marginRight: 6,
            }}
          />
          Revision:{" "}
          {revision ?? "—"}
          {dirty
            ? " · Unsaved changes"
            : " · Up to date"}
        </span>

        <span>
          HEYBIO by DIPO LABS
        </span>
      </footer>

      {blocker.state ===
        "blocked" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="unsaved-heading"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            display: "grid",
            placeItems: "center",
            padding: 20,
            background:
              "rgba(20,20,20,.55)",
          }}
        >
          <div
            style={{
              ...cardStyle,
              maxWidth: 440,
              width: "100%",
            }}
          >
            <h2
              id="unsaved-heading"
              style={{
                marginTop: 0,
              }}
            >
              Leave without saving?
            </h2>

            <p
              style={{
                color: "#686b73",
                lineHeight: 1.7,
              }}
            >
              Your unsaved social
              link changes will be
              lost if you leave.
            </p>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                style={{
                  ...buttonStyle,
                  background:
                    "#BDF806",
                  borderColor:
                    "#BDF806",
                }}
                onClick={() =>
                  blocker.reset()
                }
              >
                Keep Editing
              </button>

              <button
                type="button"
                style={buttonStyle}
                onClick={() =>
                  blocker.proceed()
                }
              >
                Leave Page
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
