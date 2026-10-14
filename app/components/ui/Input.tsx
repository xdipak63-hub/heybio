
import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";
import { Eye, EyeOff } from "lucide-react";

export type InputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "size"
> & {
  label: string;
  hint?: string;
  error?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  containerClassName?: string;
};

const fieldStyle: React.CSSProperties = {
  width: "100%",
  minHeight: 48,
  border: "1px solid #D8DCD3",
  borderRadius: 14,
  padding: "12px 14px",
  background: "#FFFFFF",
  color: "#171817",
  fontSize: 14,
  outlineOffset: 3,
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      id,
      label,
      hint,
      error,
      leftIcon,
      rightIcon,
      type = "text",
      containerClassName,
      style,
      required,
      disabled,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    const [passwordVisible, setPasswordVisible] =
      useState(false);

    const isPassword = type === "password";
    const actualType =
      isPassword && passwordVisible ? "text" : type;

    const describedBy = [
      props["aria-describedby"],
      hint ? hintId : null,
      error ? errorId : null,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        className={containerClassName}
        style={{ display: "grid", gap: 7 }}
      >
        <label
          htmlFor={inputId}
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "#171817",
          }}
        >
          {label}
          {required && (
            <span
              style={{ color: "#B42318", marginLeft: 4 }}
              aria-hidden="true"
            >
              *
            </span>
          )}
        </label>

        <div style={{ position: "relative" }}>
          {leftIcon && (
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                left: 14,
                top: "50%",
                transform: "translateY(-50%)",
                display: "flex",
                color: "#777B72",
              }}
            >
              {leftIcon}
            </span>
          )}

          <input
            {...props}
            ref={ref}
            id={inputId}
            type={actualType}
            required={required}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={describedBy || undefined}
            style={{
              ...fieldStyle,
              paddingLeft: leftIcon ? 44 : 14,
              paddingRight:
                isPassword || rightIcon ? 48 : 14,
              borderColor: error ? "#DC2626" : "#D8DCD3",
              opacity: disabled ? 0.6 : 1,
              ...style,
            }}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() =>
                setPasswordVisible((value) => !value)
              }
              disabled={disabled}
              aria-label={
                passwordVisible
                  ? "Hide password"
                  : "Show password"
              }
              aria-pressed={passwordVisible}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                border: 0,
                background: "transparent",
                cursor: "pointer",
                display: "flex",
                padding: 5,
              }}
            >
              {passwordVisible ? (
                <EyeOff size={19} />
              ) : (
                <Eye size={19} />
              )}
            </button>
          ) : (
            rightIcon && (
              <span
                aria-hidden="true"
                style={{
                  position: "absolute",
                  right: 14,
                  top: "50%",
                  transform: "translateY(-50%)",
                  display: "flex",
                }}
              >
                {rightIcon}
              </span>
            )
          )}
        </div>

        {hint && !error && (
          <p
            id={hintId}
            style={{
              margin: 0,
              fontSize: 12,
              color: "#70756C",
            }}
          >
            {hint}
          </p>
        )}

        {error && (
          <p
            id={errorId}
            role="alert"
            style={{
              margin: 0,
              fontSize: 12,
              color: "#B42318",
            }}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);

export default Input;
