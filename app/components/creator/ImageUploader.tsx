
import {
  useEffect,
  useId,
  useRef,
  useState
} from "react";

import {
  Camera,
  Check,
  ImagePlus,
  LoaderCircle,
  Trash2,
  UploadCloud
} from "lucide-react";

export interface ImageUploaderProps {
  currentUrl?: string | null;
  onUpload: (file: File) => Promise<string>;
  onRemove?: () => Promise<void>;
  disabled?: boolean;
  maxSizeMB?: number;
  label?: string;
  className?: string;
}

const ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp"
]);

export default function ImageUploader({
  currentUrl,
  onUpload,
  onRemove,
  disabled = false,
  maxSizeMB = 2,
  label = "Profile photo",
  className = ""
}: ImageUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const busyRef = useRef(false);

  const [selected, setSelected] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(
    currentUrl ?? null
  );

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setUploadedUrl(currentUrl ?? null);
  }, [currentUrl]);

  useEffect(() => {
    if (!selected) {
      setPreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selected);
    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selected]);

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.has(file.type)) {
      return "Choose a JPEG, PNG or WebP image.";
    }

    if (file.size === 0) {
      return "The selected image is empty.";
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      return `Image must be smaller than ${maxSizeMB} MB.`;
    }

    return null;
  }

  function selectFile(file?: File) {
    if (!file || busyRef.current || disabled) return;

    setError("");
    setSuccess("");

    const validationError = validateFile(file);

    if (validationError) {
      setError(validationError);
      setSelected(null);
      return;
    }

    setSelected(file);
  }

  async function upload() {
    if (!selected || busyRef.current || disabled) return;

    const validationError = validateFile(selected);

    if (validationError) {
      setError(validationError);
      return;
    }

    busyRef.current = true;
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      const result = await onUpload(selected);

      const url = new URL(result);

      if (url.protocol !== "https:") {
        throw new Error("Invalid upload destination.");
      }

      setUploadedUrl(url.href);
      setSelected(null);
      setSuccess("Profile photo uploaded successfully.");
    } catch {
      setError(
        "Image upload failed. Please try again."
      );
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function remove() {
    if (!onRemove || busyRef.current || disabled) return;

    busyRef.current = true;
    setBusy(true);
    setError("");
    setSuccess("");

    try {
      await onRemove();

      setUploadedUrl(null);
      setSelected(null);
      setSuccess("Profile photo removed.");
    } catch {
      setError("Could not remove your profile photo.");
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  const image = preview || uploadedUrl;

  return (
    <section
      className={`hb-image-uploader ${className}`}
      aria-label={label}
      aria-busy={busy}
    >
      <div className="hb-image-uploader__heading">
        <div>
          <span className="hb-creator-eyebrow">
            MAKE IT YOURS
          </span>
          <h2>{label}</h2>
          <p>
            A great first impression starts with you.
          </p>
        </div>
        <Camera size={21} aria-hidden="true" />
      </div>

      <div className="hb-image-uploader__content">
        <div className="hb-image-uploader__preview">
          {image ? (
            <img
              src={image}
              alt="Profile photo preview"
            />
          ) : (
            <ImagePlus size={31} aria-hidden="true" />
          )}
        </div>

        <div className="hb-image-uploader__controls">
          <label
            htmlFor={inputId}
            className="hb-image-uploader__label"
          >
            Select a photo
          </label>

          <p>
            JPEG, PNG or WebP. Maximum {maxSizeMB} MB.
          </p>

          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={disabled || busy}
            onChange={(event) => {
              selectFile(event.target.files?.[0]);
              event.target.value = "";
            }}
          />

          <div className="hb-image-uploader__buttons">
            <button
              type="button"
              className="hb-creator-button hb-creator-button--primary"
              onClick={() => void upload()}
              disabled={!selected || busy || disabled}
            >
              {busy ? (
                <LoaderCircle
                  size={17}
                  className="hb-creator-spin"
                  aria-hidden="true"
                />
              ) : (
                <UploadCloud size={17} aria-hidden="true" />
              )}

              {busy ? "Processing…" : "Upload photo"}
            </button>

            {uploadedUrl && onRemove && (
              <button
                type="button"
                className="hb-creator-button hb-creator-button--secondary"
                onClick={() => void remove()}
                disabled={busy || disabled}
              >
                <Trash2 size={16} aria-hidden="true" />
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      {selected && (
        <p className="hb-image-uploader__selected">
          Selected: {selected.name}
        </p>
      )}

      {error && (
        <p className="hb-creator-error" role="alert">
          {error}
        </p>
      )}

      {success && (
        <p className="hb-creator-success" role="status">
          <Check size={16} aria-hidden="true" />
          {success}
        </p>
      )}
    </section>
  );
}
