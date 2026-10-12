
export function normalizeExternalUrl(
  input: string
): string | null {
  const value = input.trim();

  if (!value || value.length > 2048) {
    return null;
  }

  try {
    const url = new URL(value);

    if (
      url.protocol !== "https:" &&
      url.protocol !== "http:"
    ) {
      return null;
    }

    if (
      !url.hostname ||
      url.username ||
      url.password
    ) {
      return null;
    }

    if (
      /[\u0000-\u001f\u007f\s]/u.test(value)
    ) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

export function safePublicUsername(
  value: string
): boolean {
  return /^[a-z][a-z0-9_]{2,29}$/.test(value);
}