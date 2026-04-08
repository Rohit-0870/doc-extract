import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EditableTableCell } from "./EditableTableCell";
import { formatName } from "./DynamicValueRenderer";
import type { FieldValue } from "@/features/documentExtraction/documentTypes";

interface EditableTableProps {
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  isEditing: boolean;
  activeField?: string | null;
  setActiveField?: (field: string | null) => void;
  fieldName?: string;
  onFieldClick?: (fieldName: string | null) => void;
}

// Check if value is an array of objects (table data)
const isArrayOfObjects = (value: unknown): value is Record<string, unknown>[] => {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    typeof value[0] === "object" &&
    value[0] !== null &&
    !Array.isArray(value[0])
  );
};

// Check if value is a plain object (not array)
const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

export function EditableTable({
  value,
  onChange,
  isEditing,
  activeField,
  setActiveField,
  fieldName,
  onFieldClick,
}: EditableTableProps) {
  
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  // Handle array of objects (render as table)
  if (isArrayOfObjects(value)) {
    const columns = Array.from(
      new Set(value.flatMap((item) => Object.keys(item)))
    );

    const handleCellChange = (rowIdx: number, col: string, newValue: unknown) => {
      const newData = value.map((row, idx) =>
        idx === rowIdx ? { ...row, [col]: newValue } : row
      );
      onChange(newData);
    };

    return (
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((col) => (
                <TableHead key={col} className="font-medium text-muted-foreground whitespace-nowrap">
                  {formatName(col)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
          {value.map((row, rowIdx) => {
            const rowKey = `${fieldName}-${rowIdx}`;
            const isActive = activeField === rowKey;

            return (
              <TableRow
                key={rowIdx}
                className={`
                  cursor-pointer transition

                  ${
                    isActive
                      ? "bg-[rgba(255,235,59,0.25)] border-l-2 border-[rgba(255,215,0,0.8)] hover:!bg-[rgba(255,235,59,0.25)]"
                      : "hover:bg-[rgba(255,235,59,0.15)]"
                  }
                `}
                onClick={() => {
                  const key = `${fieldName}-${rowIdx}`;
                  const next = activeField === key ? null : key;

                  setActiveField?.(next);

                  // ✅ THIS FIXES RIGHT SIDE HIGHLIGHT
                  onFieldClick?.(next ? fieldName ?? null : null);
                }}
              >
                {columns.map((col) => (
                  <TableCell key={col} className="text-foreground">
                    <EditableTableCell
                      value={row[col]}
                      onChange={(newValue) =>
                        handleCellChange(rowIdx, col, newValue)
                      }
                      isEditing={isEditing}
                    />
                  </TableCell>
                ))}
              </TableRow>
            );
          })}
        </TableBody>
        </Table>
      </div>
    );
  }

  // Handle array of primitives
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-muted-foreground">Empty</span>;
    return (
      <div className="flex flex-wrap gap-1">
        {value.map((item, idx) => (
          <span
            key={idx}
            className="inline-block rounded-md bg-muted px-2 py-0.5 text-xs text-foreground"
          >
            {String(item)}
          </span>
        ))}
      </div>
    );
  }

  // Handle nested objects
  if (isPlainObject(value)) {
    const entries = Object.entries(value);
    
    if (entries.length === 0) return <span className="text-muted-foreground">Empty</span>;

    const handleObjectChange = (key: string, newValue: unknown) => {
      onChange({ ...value, [key]: newValue });
    };

    return (
      <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/20">
        {entries.map(([key, val]) => (
          <div key={key} className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-medium text-muted-foreground min-w-[100px]">
              {formatName(key)}:
            </span>
            <div className="text-sm text-foreground flex-1">
              <EditableTableCell
                value={val}
                onChange={(newValue) => handleObjectChange(key, newValue)}
                isEditing={isEditing}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Fallback for unknown types
  return <span className="text-muted-foreground">{String(value)}</span>;
}
