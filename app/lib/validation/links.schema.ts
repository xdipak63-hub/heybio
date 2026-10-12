
import {
  normalizeExternalUrl
} from "../security/safe-redirect";

export type CreatorLink = {
  id: string;
  title: string;
  url: string;
  description: string;
  position: number;
  is_active: boolean;
};

export type LinkInput = {
  title: string;
  url: string;
  description: string;
};

export type ValidationResult =
  | { success: true; value: LinkInput }
  | { success: false; error: string };

export function validateLinkInput(
  form: FormData
): ValidationResult {
  const title = String(
    form.get("title") ?? ""
  ).trim();

  const description = String(
    form.get("description") ?? ""
  ).trim();

  const rawUrl = String(
    form.get("url") ?? ""
  ).trim();

  if (title.length < 1 || title.length > 100) {
    return {
      success: false,
      error: "Link title must be 1–100 characters."
    };
  }

  if (description.length > 200) {
    return {
      success: false,
      error: "Description must not exceed 200 characters."
    };
  }

  const url = normalizeExternalUrl(rawUrl);

  if (!url) {
    return {
      success: false,
      error:
        "Enter a valid full http:// or https:// URL without credentials."
    };
  }

  return {
    success: true,
    value: {
      title,
      url,
      description
    }
  };
}