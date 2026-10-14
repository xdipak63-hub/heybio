
export type SeoMetaInput = {
  title: string;
  description: string;
  canonicalUrl?: string;
  imageUrl?: string;
  type?: "website" | "profile" | "article";
  noIndex?: boolean;
  siteName?: string;
};

export type SeoMetaDescriptor =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string }
  | { tagName: "link"; rel: "canonical"; href: string };

function safeHttpUrl(value?: string): string | undefined {
  if (!value) return undefined;

  try {
    const parsed = new URL(value);

    if (
      parsed.protocol !== "https:" &&
      parsed.protocol !== "http:"
    ) {
      return undefined;
    }

    return parsed.toString();
  } catch {
    return undefined;
  }
}

export function createSeoMeta({
  title,
  description,
  canonicalUrl,
  imageUrl,
  type = "website",
  noIndex = false,
  siteName = "HEYBIO",
}: SeoMetaInput): SeoMetaDescriptor[] {
  const canonical = safeHttpUrl(canonicalUrl);
  const image = safeHttpUrl(imageUrl);

  const result: SeoMetaDescriptor[] = [
    { title },
    { name: "description", content: description },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    {
      property: "og:description",
      content: description,
    },
    {
      property: "og:site_name",
      content: siteName,
    },
    {
      name: "twitter:card",
      content: image
        ? "summary_large_image"
        : "summary",
    },
    {
      name: "twitter:title",
      content: title,
    },
    {
      name: "twitter:description",
      content: description,
    },
    {
      name: "robots",
      content: noIndex
        ? "noindex, nofollow"
        : "index, follow",
    },
  ];

  if (canonical) {
    result.push({
      tagName: "link",
      rel: "canonical",
      href: canonical,
    });

    result.push({
      property: "og:url",
      content: canonical,
    });
  }

  if (image) {
    result.push({
      property: "og:image",
      content: image,
    });

    result.push({
      name: "twitter:image",
      content: image,
    });
  }

  return result;
}

export default createSeoMeta;
