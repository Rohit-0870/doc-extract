import { Input } from "@/components/ui/input";

interface EditableTableCellProps {
  value: unknown;
  onChange: (value: unknown) => void;
  isEditing: boolean;
}

export function EditableTableCell({ value, onChange, isEditing }: EditableTableCellProps) {
  const displayValue = value === null || value === undefined ? "" : String(value);

  if (!isEditing) {
    if (typeof value === "boolean") {
      return <span>{value ? "Yes" : "No"}</span>;
    }
    if (typeof value === "number") {
      return <span>{value.toLocaleString()}</span>;
    }
    return <span>{displayValue || "—"}</span>;
  }

  if (typeof value === "number") {
    return (
      <Input
        type="number"
        value={displayValue}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="h-7 text-xs min-w-[80px]"
      />
    );
  }

  return (
    <Input
      type="text"
      value={displayValue}
      onChange={(e) => onChange(e.target.value)}
      className="h-7 text-xs min-w-[100px]"
    />
  );
}
