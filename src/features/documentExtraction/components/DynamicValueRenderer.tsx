import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { FieldValue } from "@/features/documentExtraction/documentTypes";

interface DynamicValueRendererProps {
  value: FieldValue;
  fieldName?: string;
}

// Format column/field names to be readable
const formatName = (name: string): string => {
  return name
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Format primitive values
const formatPrimitive = (value: unknown): string => {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    // Format as currency if it looks like money
    if (Number.isFinite(value)) {
      return value.toLocaleString();
    }
  }
  return String(value);
};

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

// Render a dynamic table from array of objects
function DynamicTable({ data }: { data: Record<string, unknown>[] }) {
  if (data.length === 0) return <span className="text-muted-foreground">Empty</span>;

  // Get all unique keys from all objects
  const columns = Array.from(
    new Set(data.flatMap((item) => Object.keys(item)))
  );

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
          {data.map((row, idx) => (
            <TableRow key={idx} className="hover:bg-muted/30 transition-colors">
              {columns.map((col) => (
                <TableCell key={col} className="text-foreground">
                  <DynamicValueRenderer value={row[col]} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Render nested object as key-value pairs
function NestedObject({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data);
  
  if (entries.length === 0) return <span className="text-muted-foreground">Empty</span>;

  return (
    <div className="space-y-2 rounded-lg border border-border p-3 bg-muted/20">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-wrap gap-2">
          <span className="text-xs font-medium text-muted-foreground min-w-[100px]">
            {formatName(key)}:
          </span>
          <span className="text-sm text-foreground flex-1">
            <DynamicValueRenderer value={value} />
          </span>
        </div>
      ))}
    </div>
  );
}

// Main dynamic renderer component
export function DynamicValueRenderer({ value }: DynamicValueRendererProps) {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  // Handle primitives
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return <span>{formatPrimitive(value)}</span>;
  }

  // Handle array of objects (render as table)
  if (isArrayOfObjects(value)) {
    return <DynamicTable data={value} />;
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
            {formatPrimitive(item)}
          </span>
        ))}
      </div>
    );
  }

  // Handle nested objects
  if (isPlainObject(value)) {
    return <NestedObject data={value} />;
  }

  // Fallback for unknown types
  return <span className="text-muted-foreground">{String(value)}</span>;
}

// Helper to check if a value is "complex" (array or object)
export function isComplexValue(value: FieldValue): boolean {
  return (
    Array.isArray(value) ||
    (typeof value === "object" && value !== null)
  );
}

// Export formatName for use in parent components
export { formatName };
