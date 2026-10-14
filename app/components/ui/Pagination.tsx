
import {
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  disabled?: boolean;
};

function getPageItems(
  page: number,
  totalPages: number,
  siblingCount: number,
): Array<number | "ellipsis"> {
  const pages = new Set<number>([1, totalPages]);

  for (
    let current = page - siblingCount;
    current <= page + siblingCount;
    current++
  ) {
    if (current >= 1 && current <= totalPages) {
      pages.add(current);
    }
  }

  const sorted = [...pages].sort((a, b) => a - b);
  const result: Array<number | "ellipsis"> = [];

  sorted.forEach((current, index) => {
    const previous = sorted[index - 1];

    if (previous !== undefined && current - previous > 1) {
      if (current - previous === 2) {
        result.push(previous + 1);
      } else {
        result.push("ellipsis");
      }
    }

    result.push(current);
  });

  return result;
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  disabled = false,
}: PaginationProps) {
  const count = Math.max(1, Math.floor(totalPages));
  const current = Math.max(
    1,
    Math.min(Math.floor(page), count),
  );

  if (count <= 1) return null;

  const items = getPageItems(
    current,
    count,
    Math.max(0, Math.min(siblingCount, 3)),
  );

  const baseStyle: React.CSSProperties = {
    minWidth: 40,
    minHeight: 40,
    padding: "8px 12px",
    border: "1px solid #E0E4DA",
    borderRadius: 12,
    background: "#FFFFFF",
    color: "#171817",
    cursor: "pointer",
    fontWeight: 700,
  };

  return (
    <nav
      aria-label="Pagination"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
      }}
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={disabled || current === 1}
        onClick={() => onPageChange(current - 1)}
        style={baseStyle}
      >
        <ChevronLeft size={17} />
      </button>

      {items.map((item, index) =>
        item === "ellipsis" ? (
          <span
            key={`ellipsis-${index}`}
            aria-hidden="true"
            style={{ padding: "0 4px" }}
          >
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item}`}
            aria-current={
              item === current ? "page" : undefined
            }
            disabled={disabled}
            onClick={() => onPageChange(item)}
            style={{
              ...baseStyle,
              background:
                item === current
                  ? "#BDF806"
                  : "#FFFFFF",
              borderColor:
                item === current
                  ? "#BDF806"
                  : "#E0E4DA",
            }}
          >
            {item}
          </button>
        ),
      )}

      <button
        type="button"
        aria-label="Next page"
        disabled={disabled || current === count}
        onClick={() => onPageChange(current + 1)}
        style={baseStyle}
      >
        <ChevronRight size={17} />
      </button>
    </nav>
  );
}

export default Pagination;
