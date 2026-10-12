
import { Check, Palette } from "lucide-react";

export const THEME_PRESETS = [
  {
    id: "classic",
    name: "Classic",
    background: "#F9F9F6",
    text: "#1A1B19"
  },
  {
    id: "midnight",
    name: "Midnight",
    background: "#171817",
    text: "#FFFFFF"
  },
  {
    id: "ice",
    name: "Ice Blue",
    background: "#D9EEFF",
    text: "#152A40"
  },
  {
    id: "peach",
    name: "Peach",
    background: "#FFE0D5",
    text: "#3D2520"
  },
  {
    id: "lavender",
    name: "Lavender",
    background: "#EDE3FF",
    text: "#302044"
  },
  {
    id: "minimal",
    name: "Minimal",
    background: "#FFFFFF",
    text: "#161616"
  }
] as const;

export const ACCENT_COLORS = [
  "#BDF806",
  "#C8E6FF",
  "#FFBFAE",
  "#D9C4FF",
  "#FFFFFF",
  "#FFDF70"
] as const;

export const BUTTON_STYLES = [
  {
    id: "rounded",
    name: "Rounded"
  },
  {
    id: "pill",
    name: "Pill"
  },
  {
    id: "square",
    name: "Square"
  }
] as const;

export type ThemePreset =
  (typeof THEME_PRESETS)[number]["id"];

export type AccentColor =
  (typeof ACCENT_COLORS)[number];

export type ButtonStyle =
  (typeof BUTTON_STYLES)[number]["id"];

export type ProfileTheme = {
  preset: ThemePreset;
  accent: AccentColor;
  buttonStyle: ButtonStyle;
};

type ThemePickerProps = {
  value: ProfileTheme;
  onChange: (value: ProfileTheme) => void;
};

export default function ThemePicker({
  value,
  onChange
}: ThemePickerProps) {
  return (
    <div className="theme-picker">
      <div className="theme-picker__section">
        <h3>
          <Palette size={19} />
          Choose your vibe
        </h3>

        <div className="theme-picker__grid">
          {THEME_PRESETS.map((theme) => {
            const selected =
              value.preset === theme.id;

            return (
              <button
                type="button"
                key={theme.id}
                className={`theme-picker__option ${
                  selected ? "is-selected" : ""
                }`}
                aria-pressed={selected}
                onClick={() =>
                  onChange({
                    ...value,
                    preset: theme.id
                  })
                }
              >
                <span
                  className="theme-picker__swatch"
                  style={{
                    backgroundColor: theme.background,
                    color: theme.text
                  }}
                >
                  <span className="theme-picker__avatar">
                    ✳
                  </span>
                  <span className="theme-picker__mock-link" />
                  <span className="theme-picker__mock-link" />
                </span>

                <span className="theme-picker__label">
                  {theme.name}
                  {selected && <Check size={16} />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="theme-picker__section">
        <h3>Accent color</h3>

        <div className="theme-picker__accents">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              className={`theme-picker__accent ${
                value.accent === color
                  ? "is-selected"
                  : ""
              }`}
              style={{
                backgroundColor: color
              }}
              aria-label={`Select ${color} accent`}
              aria-pressed={value.accent === color}
              onClick={() =>
                onChange({
                  ...value,
                  accent: color
                })
              }
            >
              {value.accent === color && (
                <Check
                  size={18}
                  color="#171817"
                  strokeWidth={3}
                />
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="theme-picker__section">
        <h3>Button shape</h3>

        <div className="theme-picker__shapes">
          {BUTTON_STYLES.map((style) => (
            <button
              type="button"
              key={style.id}
              aria-pressed={
                value.buttonStyle === style.id
              }
              className={
                value.buttonStyle === style.id
                  ? "is-selected"
                  : ""
              }
              onClick={() =>
                onChange({
                  ...value,
                  buttonStyle: style.id
                })
              }
            >
              {style.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}