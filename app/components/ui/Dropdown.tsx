
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode
} from "react";
import { ChevronDown } from "lucide-react";

export type DropdownItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  destructive?: boolean;
  onSelect: () => void;
};

export type DropdownProps = {
  label: string;
  items: readonly DropdownItem[];
  align?: "start" | "end";
  disabled?: boolean;
  className?: string;
};

export function Dropdown({
  label,
  items,
  align = "start",
  disabled = false,
  className = ""
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const menuId = useId();

  const enabledIndices = items
    .map((item, index) => (!item.disabled ? index : -1))
    .filter((index) => index >= 0);

  useEffect(() => {
    if (!open) return;

    function handlePointer(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointer);

    return () => {
      document.removeEventListener("pointerdown", handlePointer);
    };
  }, [open]);

  function focusItem(index: number) {
    itemRefs.current[index]?.focus();
  }

  function openMenu(last = false) {
    if (disabled || enabledIndices.length === 0) return;

    setOpen(true);

    requestAnimationFrame(() => {
      focusItem(
        last
          ? enabledIndices[enabledIndices.length - 1]
          : enabledIndices[0]
      );
    });
  }

  function closeMenu(restoreFocus = true) {
    setOpen(false);

    if (restoreFocus) {
      triggerRef.current?.focus();
    }
  }

  function selectItem(item: DropdownItem) {
    if (item.disabled) return;
    closeMenu();
    item.onSelect();
  }

  return (
    <div
      ref={rootRef}
      className={`hb-ui-dropdown ${className}`}
    >
      <button
        ref={triggerRef}
        type="button"
        className="hb-ui-dropdown__trigger"
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => {
          if (open) closeMenu(false);
          else openMenu();
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            openMenu();
          }

          if (event.key === "ArrowUp") {
            event.preventDefault();
            openMenu(true);
          }
        }}
      >
        <span>{label}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className={`hb-ui-dropdown__menu hb-ui-dropdown__menu--${align}`}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              closeMenu();
              return;
            }

            const current = itemRefs.current.findIndex(
              (element) => element === document.activeElement
            );

            const position = enabledIndices.indexOf(current);

            if (
              event.key === "ArrowDown" ||
              event.key === "ArrowUp"
            ) {
              event.preventDefault();

              const delta =
                event.key === "ArrowDown" ? 1 : -1;

              const next =
                (position + delta + enabledIndices.length) %
                enabledIndices.length;

              focusItem(enabledIndices[next]);
            }

            if (event.key === "Home") {
              event.preventDefault();
              focusItem(enabledIndices[0]);
            }

            if (event.key === "End") {
              event.preventDefault();
              focusItem(enabledIndices[enabledIndices.length - 1]);
            }

            if (event.key === "Tab") {
              setOpen(false);
            }
          }}
        >
          {items.map((item, index) => (
            <button
              key={item.id}
              ref={(element) => {
                itemRefs.current[index] = element;
              }}
              type="button"
              role="menuitem"
              tabIndex={-1}
              disabled={item.disabled}
              className={[
                "hb-ui-dropdown__item",
                item.destructive ? "is-destructive" : ""
              ].join(" ")}
              onClick={() => selectItem(item)}
            >
              {item.icon && (
                <span aria-hidden="true">{item.icon}</span>
              )}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
