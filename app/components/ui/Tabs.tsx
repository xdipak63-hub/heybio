
import {
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
};

export type TabsProps = {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
};

export function Tabs({
  items,
  value,
  onChange,
  className,
}: TabsProps) {
  const baseId = useId();
  const refs = useRef<Array<HTMLButtonElement | null>>([]);

  const active = items.find(
    (item) => item.id === value && !item.disabled,
  );

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    const enabled = items
      .map((item, position) => ({
        ...item,
        position,
      }))
      .filter((item) => !item.disabled);

    if (!enabled.length) return;

    const currentIndex = enabled.findIndex(
      (item) => item.position === index,
    );

    let nextIndex: number;

    switch (event.key) {
      case "ArrowRight":
        nextIndex =
          (currentIndex + 1) % enabled.length;
        break;
      case "ArrowLeft":
        nextIndex =
          (currentIndex - 1 + enabled.length) %
          enabled.length;
        break;
      case "Home":
        nextIndex = 0;
        break;
      case "End":
        nextIndex = enabled.length - 1;
        break;
      default:
        return;
    }

    event.preventDefault();

    const next = enabled[nextIndex];
    onChange(next.id);
    refs.current[next.position]?.focus();
  }

  if (!items.length) return null;

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label="Content sections"
        style={{
          display: "flex",
          gap: 6,
          padding: 5,
          borderRadius: 16,
          background: "#F0F2EC",
          overflowX: "auto",
        }}
      >
        {items.map((item, index) => {
          const selected = active?.id === item.id;

          return (
            <button
              key={item.id}
              ref={(element) => {
                refs.current[index] = element;
              }}
              id={`${baseId}-tab-${index}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${index}`}
              disabled={item.disabled}
              tabIndex={
                selected || (!active && index === 0)
                  ? 0
                  : -1
              }
              onClick={() => onChange(item.id)}
              onKeyDown={(event) =>
                handleKeyDown(event, index)
              }
              style={{
                padding: "12px 18px",
                border: 0,
                borderRadius: 12,
                background: selected
                  ? "#FFFFFF"
                  : "transparent",
                color: "#171817",
                fontSize: 13,
                fontWeight: 700,
                whiteSpace: "nowrap",
                cursor: "pointer",
                boxShadow: selected
                  ? "0 2px 10px #0000000B"
                  : "none",
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {items.map((item, index) => {
        const selected = active?.id === item.id;

        return (
          <div
            key={item.id}
            id={`${baseId}-panel-${index}`}
            role="tabpanel"
            aria-labelledby={`${baseId}-tab-${index}`}
            hidden={!selected}
            tabIndex={0}
            style={{
              paddingTop: 24,
              outlineOffset: 4,
            }}
          >
            {selected ? item.content : null}
          </div>
        );
      })}
    </div>
  );
}

export default Tabs;
