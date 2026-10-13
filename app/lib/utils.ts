export function cn(
  ...values: Array<
    string | false | null | undefined
  >
): string {
  return values.filter(Boolean).join(" ");
}

export function formatCurrency(
  amountInPaise: number,
  currency = "INR"
): string {
  if (
    !Number.isSafeInteger(amountInPaise) ||
    amountInPaise < 0
  ) {
    throw new RangeError(
      "Amount must be non-negative integer paise."
    );
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amountInPaise / 100);
}

export function formatDate(
  value: string | number | Date
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeZone: "Asia/Kolkata"
  }).format(date);
}

export function normalizeUsername(
  value: string
): string {
  return value
    .trim()
    .toLowerCase();
}

export function isValidUsername(
  value: string
): boolean {
  return /^[a-z0-9](?:[a-z0-9_-]{1,28}[a-z0-9])?$/.test(
    value
  );
}

export function truncateText(
  value: string,
  maxLength: number
): string {
  if (
    !Number.isSafeInteger(maxLength) ||
    maxLength < 1
  ) {
    throw new RangeError(
      "maxLength must be positive."
    );
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(
    0,
    Math.max(0, maxLength - 1)
  )}…`;
}

export function assertNever(
  value: never
): never {
  throw new Error(
    `Unexpected value: ${String(value)}`
  );
}

export function getErrorMessage(
  error: unknown
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}

export function isRecord(
  value: unknown
): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}