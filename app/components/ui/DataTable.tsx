
import {
  useId,
  type Key,
  type ReactNode
} from "react";
import { ArrowDown, ArrowUp, Inbox } from "lucide-react";

export type DataTableColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  align?: "left" | "center" | "right";
  sortable?: boolean;
};

export type DataTableSort = {
  column: string;
  direction: "asc" | "desc";
};

export type DataTableProps<T> = {
  rows: readonly T[];
  columns: readonly DataTableColumn<T>[];
  getRowKey: (row: T) => Key;
  caption: string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  sort?: DataTableSort | null;
  onSortChange?: (sort: DataTableSort) => void;
  className?: string;
};

export function DataTable<T>({
  rows,
  columns,
  getRowKey,
  caption,
  loading = false,
  emptyTitle = "Nothing here yet",
  emptyDescription = "No records are available.",
  sort,
  onSortChange,
  className = ""
}: DataTableProps<T>) {
  const statusId = useId();

  function changeSort(column: string) {
    if (!onSortChange) return;

    onSortChange({
      column,
      direction:
        sort?.column === column &&
        sort.direction === "asc"
          ? "desc"
          : "asc"
    });
  }

  return (
    <section
      className={`hb-ui-table ${className}`}
      aria-busy={loading}
    >
      <div
        className="hb-ui-table__scroll"
        tabIndex={0}
        role="region"
        aria-label={`${caption} table`}
      >
        <table>
          <caption className="hb-ui-sr-only">
            {caption}
          </caption>

          <thead>
            <tr>
              {columns.map((column) => {
                const sorted = sort?.column === column.id;
                const canSort =
                  column.sortable && Boolean(onSortChange);

                return (
                  <th
                    key={column.id}
                    scope="col"
                    className={`hb-ui-align-${column.align ?? "left"}`}
                    aria-sort={
                      canSort
                        ? sorted
                          ? sort?.direction === "asc"
                            ? "ascending"
                            : "descending"
                          : "none"
                        : undefined
                    }
                  >
                    {canSort ? (
                      <button
                        type="button"
                        className="hb-ui-table__sort"
                        disabled={loading}
                        onClick={() => changeSort(column.id)}
                      >
                        {column.header}
                        {sorted && sort?.direction === "asc" ? (
                          <ArrowUp size={14} aria-hidden="true" />
                        ) : (
                          <ArrowDown
                            size={14}
                            aria-hidden="true"
                            className={sorted ? "" : "hb-ui-muted"}
                          />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td
                    key={column.id}
                    className={`hb-ui-align-${column.align ?? "left"}`}
                  >
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div
        id={statusId}
        className="hb-ui-sr-only"
        role="status"
        aria-live="polite"
      >
        {loading
          ? "Loading records"
          : `${rows.length} records displayed`}
      </div>

      {!loading && rows.length === 0 && (
        <div className="hb-ui-empty">
          <Inbox size={28} aria-hidden="true" />
          <strong>{emptyTitle}</strong>
          <p>{emptyDescription}</p>
        </div>
      )}

      {loading && (
        <div className="hb-ui-table__loading">
          <span className="hb-ui-spinner" aria-hidden="true" />
          Loading records…
        </div>
      )}
    </section>
  );
}

export default DataTable;
