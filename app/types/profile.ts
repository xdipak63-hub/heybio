
export type AccountStatus =
  | "active"
  | "suspended"
  | "deleted";

export type ThemePreset =
  | "classic"
  | "midnight"
  | "ice"
  | "peach"
  | "lavender"
  | "minimal";

export type ButtonStyle =
  | "rounded"
  | "pill"
  | "square";

export type ProfileRecord = {
  id: string;
  username: string | null;
  display_name: string;
  bio: string;
  avatar_path: string | null;
  account_status: AccountStatus;
  created_at: string;
  updated_at: string;
};

export type ProfileThemeRecord = {
  profile_id: string;
  preset: ThemePreset;
  accent: string;
  button_style: ButtonStyle;
  updated_at: string;
};

export type PublicCreatorProfile = {
  username: string;
  displayName: string;
  bio: string;
  theme: {
    preset: ThemePreset;
    accent: string;
    buttonStyle: ButtonStyle;
  };
  links: Array<{
    id: string;
    title: string;
    url: string;
    description: string | null;
  }>;
};

export function isValidUsername(
  value: string,
): boolean {
  return /^[a-z][a-z0-9_]{2,29}$/.test(
    value,
  );
}

export function normalizeUsername(
  value: string,
): string {
  return value.trim().toLowerCase();
}