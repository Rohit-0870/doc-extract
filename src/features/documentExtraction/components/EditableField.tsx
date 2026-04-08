import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { FieldValue } from "@/features/documentExtraction/documentTypes";

interface EditableFieldProps {
  value: FieldValue;
  onChange: (value: FieldValue) => void;
  isEditing: boolean;
}

export function EditableField({ value, onChange, isEditing }: EditableFieldProps) {
  const displayValue = value === null || value === undefined ? "" : String(value);

  if (!isEditing) {
    return <span>{displayValue || "—"}</span>;
  }

  // For longer text, use textarea
  if (typeof value === "string" && value.length > 50) {
    return (
      <Textarea
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[60px] text-sm"
      />
    );
  }

  // For numbers
  if (typeof value === "number") {
    return (
      <Input
        type="number"
        value={displayValue}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "") {
            onChange(""); // allow empty state
          } else {
            onChange(parseFloat(val));
          }
        }}
        className="h-8 text-sm"
      />
    );
  }

  // Default text input
  return (
    <Input
      type="text"
      value={displayValue}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 text-sm"
    />
  );
}
