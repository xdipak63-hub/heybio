
import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";

import { LoaderCircle } from "lucide-react";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

type BaseProps = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  className?: string;
};

export type ButtonProps = BaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

export type ButtonLinkProps = Omit<
  BaseProps,
  "loading"
> &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> & {
    href: string;
  };

const variantStyles: Record<Variant, string> = {
  primary:
    "bg-[#BDF806] text-[#171817] hover:bg-[#D0FF43] " +
    "border-transparent",
  secondary:
    "bg-[#171817] text-white hover:bg-[#333633] " +
    "border-transparent",
  outline:
    "bg-transparent text-[#171817] border-[#D6D9D1] " +
    "hover:bg-[#F1F3ED]",
  ghost:
    "bg-transparent text-[#171817] border-transparent " +
    "hover:bg-[#F1F3ED]",
  danger:
    "bg-[#DC2626] text-white border-transparent " +
    "hover:bg-[#B91C1C]",
};

const sizeStyles: Record<Size, string> = {
  sm: "min-h-9 px-4 text-xs",
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-13 px-7 text-base",
};

function getClasses({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
}: Pick<
  BaseProps,
  "variant" | "size" | "fullWidth" | "className"
>) {
  return [
    "inline-flex items-center justify-center gap-2",
    "rounded-full border font-bold",
    "transition-colors duration-200",
    "focus-visible:outline focus-visible:outline-2",
    "focus-visible:outline-offset-2",
    "focus-visible:outline-[#648900]",
    "disabled:cursor-not-allowed disabled:opacity-50",
    variantStyles[variant],
    sizeStyles[size],
    fullWidth ? "w-full" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");
}

export const Button = forwardRef<
  HTMLButtonElement,
  ButtonProps
>(function Button(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    loading = false,
    disabled,
    leftIcon,
    rightIcon,
    children,
    className,
    type = "button",
    ...props
  },
  ref,
) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      {...props}
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={getClasses({
        variant,
        size,
        fullWidth,
        className,
      })}
    >
      {loading ? (
        <LoaderCircle
          size={18}
          className="animate-spin"
          aria-hidden="true"
        />
      ) : (
        leftIcon
      )}

      <span>{children}</span>

      {!loading && rightIcon}
    </button>
  );
});

export const ButtonLink = forwardRef<
  HTMLAnchorElement,
  ButtonLinkProps
>(function ButtonLink(
  {
    variant = "primary",
    size = "md",
    fullWidth = false,
    leftIcon,
    rightIcon,
    children,
    className,
    target,
    rel,
    ...props
  },
  ref,
) {
  const safeRel =
    target === "_blank"
      ? Array.from(
          new Set(
            `${rel ?? ""} noopener noreferrer`
              .trim()
              .split(/\s+/),
          ),
        ).join(" ")
      : rel;

  return (
    <a
      {...props}
      ref={ref}
      target={target}
      rel={safeRel}
      className={getClasses({
        variant,
        size,
        fullWidth,
        className,
      })}
    >
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </a>
  );
});

export default Button;
