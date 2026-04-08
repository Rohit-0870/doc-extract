
// import { useEffect, useMemo, useState } from "react";
// import { ConfidenceMeter } from "./ConfidenceMeter";
// import { isComplexValue, formatName } from "./DynamicValueRenderer";
// import { EditableField } from "./EditableField";
// import { EditableTable } from "./EditableTable";
// import { AutoFitText } from "./AutoFitText";
// import { Button } from "@/components/ui/button";
// import { Eye, Send, Pencil } from "lucide-react";
// import type { ExtractedValue, FieldValue } from "@/features/documentExtraction/documentTypes";

// interface ExtractedValuesCardProps {
//   extractedValues: ExtractedValue[];
//   onSubmit?: (values: ExtractedValue[]) => Promise<void> | void;
//   isSaving?: boolean;
//   onHoverFieldChange?: (fieldName: string | null) => void;
//   onFieldClick?: (fieldName: string) => void;
//   isAlreadyApproved?: boolean;
// }

// function safeUpper(value: unknown): string {
//   if (value === null || value === undefined) return "N/A";
//   return String(value).toUpperCase();
// }

// function getPageLabel(item: ExtractedValue): string {
//   if (item.page_number !== null && item.page_number !== undefined) {
//     return `Page ${item.page_number}`;
//   }
//   return "";
// }

// export function ExtractedValuesCard({
//   extractedValues,
//   onSubmit,
//   isSaving = false,
//   onHoverFieldChange,
//   onFieldClick,
//   isAlreadyApproved = false,
// }: ExtractedValuesCardProps) {
//   const [editedValues, setEditedValues] =
//     useState<ExtractedValue[]>(extractedValues);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isLocalApproved, setIsLocalApproved] = useState(false);

//   const isApproved = useMemo(() => {
//   // ✅ Backend truth FIRST
//   if (isAlreadyApproved) return true;

//   // ✅ Local optimistic lock
//   if (isLocalApproved) return true;

//   return false;
// }, [isAlreadyApproved, isLocalApproved]);

//  useEffect(() => {
//   if (!isAlreadyApproved && !isLocalApproved) {
//     setEditedValues(extractedValues);
//     setIsEditing(false);
//   }
// }, [extractedValues, isAlreadyApproved, isLocalApproved]);

//   const isLongTextField = (fieldName: string) => {
//     const key = fieldName.toLowerCase();
//     return (
//       key.includes("address") ||
//       key.includes("description") ||
//       key.includes("notes") ||
//       key.includes("remark") ||
//       key.includes("comments") ||
//       key.includes("terms")
//     );
//   };

//   const isEmpty = (val: any) => 
//   val === null || val === undefined || String(val).trim() === "";
  
//   const { scalarValues, complexValues } = useMemo(() => {
//     return {
//       scalarValues: editedValues.filter((v) => !isComplexValue(v.field_value)),
//       complexValues: editedValues.filter((v) => isComplexValue(v.field_value)),
//     };
//   }, [editedValues]);

//   const handleValueChange = (fieldName: string, newValue: FieldValue) => {
//     if (isApproved) return;
//     setEditedValues((prev) =>
//       prev.map((item) =>
//         item.field_name === fieldName ? { ...item, field_value: newValue } : item
//       )
//     );
//   };

//   const handleSubmit = async () => {
//   if (isApproved) return;
//   try {
//     setIsEditing(false); // Close edit mode immediately
//     await onSubmit?.(editedValues); // Wait for the fetch in DocumentExtractionViewer
    
//     // ✅ This is the key. 
//     // This state must persist until the user leaves the page or changes documents.
//     setIsLocalApproved(true); 
//   } catch (e) {
//     console.error("Submit error:", e);
//     // If it fails, we should probably allow them to try again
//     setIsLocalApproved(false);
//   }
// };

//   return (
//     <div className="animate-fade-in rounded-xl bg-card p-6 shadow-card">
//       <div className="flex items-center justify-between">
//         <div>
//           <h2 className="text-lg font-semibold text-foreground">
//             Extracted Values
//           </h2>
//           <p className="mt-1 text-sm text-muted-foreground">
//             Data extracted from your document
//           </p>
//         </div>

//         <div className="flex items-center gap-2">
//           <Button
//             variant={isEditing ? "secondary" : "outline"}
//             size="sm"
//             onClick={() => setIsEditing(!isEditing)}
//             className="gap-2"
//             disabled={isSaving || isApproved}
//           >
//             <Pencil className="w-4 h-4" />
//             {isEditing ? "Done" : "Edit"}
//           </Button>

//           <Button
//             size="sm"
//             onClick={handleSubmit}
//             className="gap-2"
//             disabled={isSaving || isApproved}
//           >
//             <Send className="w-4 h-4" />
//             {isSaving ? "Approving..." : isApproved ? "Approved" : "Approve"}
//           </Button>
//         </div>
//       </div>

//       {/* Scalar Values */}
//       {scalarValues.length > 0 && (
//         <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
//           {scalarValues.map((item, index) => {
//             const longField = isLongTextField(item.field_name);
//             const maxFontPx = longField ? 14 : 14;
//             const minFontPx = longField ? 0 : 0;

//             return (
//               <div
//                 key={item.field_name}
//                 style={{ animationDelay: `${(index + 1) * 50}ms` }}
//                 className="
//                   group relative h-[140px] overflow-hidden rounded-lg border border-border bg-background p-3
//                   flex flex-col cursor-pointer
//                   transition-all duration-200 ease-out
//                   hover:border-primary/30 hover:shadow-soft
//                   hover:scale-[1.03] hover:-translate-y-1 hover:z-10
//                   will-change-transform
//                 "
//                 onMouseEnter={() => onHoverFieldChange?.(item.field_name)}
//                 onMouseLeave={() => onHoverFieldChange?.(null)}
//                 onClick={() => onFieldClick?.(item.field_name)}
//               >
//                 <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
//                   {formatName(item.field_name)}
//                 </p>

//                 <div className="mt-1 flex-1 min-h-0">
//                   {isEditing && !isApproved ? (
//                     <EditableField
//                       value={item.field_value}
//                       onChange={(newValue) =>
//                         handleValueChange(item.field_name, newValue)
//                       }
//                       isEditing={isEditing}
//                     />
//                   ) : (
//                     <AutoFitText
//                       text={isEmpty(item.field_value) ? "-" : String(item.field_value)}
//                       maxFontPx={maxFontPx}
//                       minFontPx={minFontPx}
//                     />
//                   )}
//                 </div>

//                 <div className="mt-2">
//                   <ConfidenceMeter
//                     confidence={item.confidence ?? 0}
//                     size="sm"
//                   />
//                 </div>

//                 <p className="mt-1 text-[11px] text-muted-foreground">
//                   {getPageLabel(item)} · {safeUpper(item.extraction_method)}
//                   {item.was_corrected ? " · ✅ Corrected" : ""}
//                 </p>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Complex Values */}
//       {complexValues.map((item) => (
//         <div
//           key={item.field_name}
//           className="mt-6 cursor-pointer"
//           onMouseEnter={() => onHoverFieldChange?.(item.field_name)}
//           onMouseLeave={() => onHoverFieldChange?.(null)}
//           onClick={() => onFieldClick?.(item.field_name)}
//         >
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-sm font-semibold text-foreground">
//               {formatName(item.field_name)}
//             </h3>

//             <div className="flex items-center gap-3">
//               <ConfidenceMeter confidence={item.confidence ?? 0} size="sm" />
//               <span className="text-xs text-muted-foreground">
//                 Page {item.page_number ?? "-"} ·{" "}
//                 {safeUpper(item.extraction_method)}
//                 {item.was_corrected ? " · ✅ Corrected" : ""}
//               </span>
//             </div>
//           </div>

//           <EditableTable
//             value={item.field_value}
//             onChange={(newValue) =>
//               handleValueChange(item.field_name, newValue)
//             }
//             isEditing={isEditing && !isApproved}
//           />
//         </div>
//       ))}

//       {scalarValues.length === 0 && complexValues.length === 0 && (
//         <div className="mt-6 text-center text-muted-foreground py-8">
//           No extracted values found
//         </div>
//       )}
//     </div>
//   );
// }

import { useEffect, useMemo, useState, useRef  } from "react";
import { ConfidenceMeter } from "./ConfidenceMeter";
import { isComplexValue, formatName } from "./DynamicValueRenderer";
import { EditableField } from "./EditableField";
import { EditableTable } from "./EditableTable";
import { AutoFitText } from "./AutoFitText";
import { Button } from "@/components/ui/button";
import { Send, Pencil } from "lucide-react";
import type { ExtractedValue, FieldValue } from "@/features/documentExtraction/documentTypes";
import { SmartMultilineTooltip } from "@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ExtractedValuesCardProps {
  extractedValues: ExtractedValue[];
  onSubmit?: (values: ExtractedValue[]) => Promise<void> | void;
  isSaving?: boolean;
  onHoverFieldChange?: (fieldName: string | null) => void;
  onFieldClick?: (fieldName: string | null) => void;
  isAlreadyApproved?: boolean;
}

/* ---------------- helpers ---------------- */

function safeUpper(value: unknown): string {
  if (value === null || value === undefined) return "N/A";
  return String(value).toUpperCase();
}

function getPageLabel(item: ExtractedValue): string {
  if (item.page_number !== null && item.page_number !== undefined) {
    return `Page ${item.page_number}`;
  }
  return "";
}

// ✅ NEW: Confidence RAG
function getConfidenceColor(confidence: number) {
  if (confidence >= 90) return "bg-success/10 text-success border border-border";
  if (confidence >= 75) return "bg-warning/15 text-warning border border-warning/10";
  return "bg-destructive/10 text-destructive border border-destructive/10";
}

/* ---------------- component ---------------- */

export function ExtractedValuesCard({
  extractedValues,
  onSubmit,
  isSaving = false,
  onHoverFieldChange,
  onFieldClick,
  isAlreadyApproved = false,
}: ExtractedValuesCardProps) {
  const [editedValues, setEditedValues] =
    useState<ExtractedValue[]>(extractedValues);
  const [isEditing, setIsEditing] = useState(false);
  const [isLocalApproved, setIsLocalApproved] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (!containerRef.current?.contains(e.target as Node)) {
      setActiveField(null);
      onFieldClick?.(null);
    }
  }

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
  }, []);

  const isApproved = useMemo(() => {
    if (isAlreadyApproved) return true;
    if (isLocalApproved) return true;
    return false;
  }, [isAlreadyApproved, isLocalApproved]);

  useEffect(() => {
    if (!isAlreadyApproved && !isLocalApproved) {
      setEditedValues(extractedValues);
      setIsEditing(false);
    }
  }, [extractedValues, isAlreadyApproved, isLocalApproved]);

  const isEmpty = (val: any) =>
    val === null || val === undefined || String(val).trim() === "";

  const { scalarValues, complexValues } = useMemo(() => {
    return {
      scalarValues: editedValues.filter((v) => !isComplexValue(v.field_value)),
      complexValues: editedValues.filter((v) => isComplexValue(v.field_value)),
    };
  }, [editedValues]);

  const handleValueChange = (fieldName: string, newValue: FieldValue) => {
    if (isApproved) return;
    setEditedValues((prev) =>
      prev.map((item) =>
        item.field_name === fieldName ? { ...item, field_value: newValue } : item
      )
    );
  };

  const handleSubmit = async () => {
    if (isApproved) return;
    try {
      setIsEditing(false);
      await onSubmit?.(editedValues);
      setIsLocalApproved(true);
    } catch (e) {
      console.error("Submit error:", e);
      setIsLocalApproved(false);
    }
  };

  return (
    <div
    ref={containerRef} 
    className="animate-fade-in rounded-xl bg-card px-6 py-5 shadow-card"
    >
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Extracted Values
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isEditing ? "secondary" : "outline"}
            size="sm"
            onClick={() => {
              if (isApproved) return;
              setIsEditing(!isEditing);
            }}
            title={isApproved ? "Document already approved" : ""}
            className={`gap-2 ${
              isApproved ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            <Pencil className="w-4 h-4" />
            {isEditing ? "Done" : "Edit"}
          </Button>

          <Button
            size="sm"
            onClick={() => {
              if (isApproved) return; // 🚫 block click
              handleSubmit();
            }}
            title={isApproved ? "Document already approved" : ""}
            className={`gap-2 ${
              isApproved ? "cursor-not-allowed opacity-60" : ""
            }`}
          >
            <Send className="w-4 h-4" />
            {isSaving ? "Approving..." : isApproved ? "Approved" : "Approve"}
          </Button>
        </div>
      </div>

      {/* =========================================================
          ✅ NEW TABLE UI
      ========================================================== */}
      {scalarValues.length > 0 && (
        <div className="mt-6 border border-border rounded-lg">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="px-3 py-2 text-left w-[40px]">#</TableHead>
                <TableHead className="px-3 py-2 text-left w-[40px]">
                  Pages
                </TableHead>
                <TableHead className="px-3 py-2 text-left w-[180px]">
                  Field Name
                </TableHead>
                <TableHead className="px-3 py-2 text-left w-[40%]">
                  Value
                </TableHead>
                <TableHead className="px-3 py-2 text-left w-[40px]">
                  Confidence
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {scalarValues.map((item, index) => {
                const confidence = Math.round((item.confidence ?? 0) * 100);

                return (
                  <TableRow
                      key={item.field_name}
                      className={`
                        transition
                        cursor-pointer

                        ${activeField === item.field_name
                          ? "bg-[rgba(255,235,59,0.25)] border-l-2 border-[rgba(255,215,0,0.8)] hover:!bg-[rgba(255,235,59,0.25)]"
                          : "hover:!bg-[rgba(255,235,59,0.15)]"
                        }
                      `}
                        onMouseEnter={() => {
                        onHoverFieldChange?.(item.field_name);
                      }}
                      onMouseLeave={() => {
                        onHoverFieldChange?.(null);
                      }}
                      onClick={() => {
                        const isSame = activeField === item.field_name;
                        const next = isSame ? null : item.field_name;

                        setActiveField(next);
                        onFieldClick?.(next); // ✅ no fallback
                      }}
                    >
                    <TableCell className="px-3 py-2 w-[40px]">
                      {index + 1}
                    </TableCell>

                    <TableCell className="px-3 py-2 w-[40px]">
                      {item.page_number ?? "-"}
                    </TableCell>

                    <TableCell className="px-3 py-2 font-medium w-[25%] break-words leading-snug">
                      {formatName(item.field_name)}
                    </TableCell>

                    <TableCell className="px-3 py-2 max-w-[300px] align-top w-[45%] break-words leading-snug">
                      {isEditing && !isApproved ? (
                        <EditableField
                          value={item.field_value}
                          onChange={(newValue) =>
                            handleValueChange(item.field_name, newValue)
                          }
                          isEditing={isEditing}
                        />
                      ) : (
                        <SmartMultilineTooltip content={String(item.field_value)}>
                          {isEmpty(item.field_value)
                            ? "-"
                            : String(item.field_value)}
                        </SmartMultilineTooltip>
                      )}
                    </TableCell>

                    <TableCell className="px-3 py-2 w-[40px]">
                      <span
                        className={`px-2 py-1 rounded-md text-xs font-medium ${getConfidenceColor(
                          confidence
                        )}`}
                      >
                        {confidence}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* =========================================================
          COMPLEX VALUES (UNCHANGED)
      ========================================================== */}
      {complexValues.map((item) => (
        <div
          key={item.field_name}
          className="mt-6 cursor-pointer"
          onMouseEnter={() => onHoverFieldChange?.(item.field_name)}
          onMouseLeave={() => onHoverFieldChange?.(null)}
          onClick={() => onFieldClick?.(item.field_name)}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              {formatName(item.field_name)}
            </h3>

            <div className="flex items-center gap-3">
              {/* 🔹 REPLACED ConfidenceMeter with scalar-style badge */}
              <span
                className={`px-2 py-1 rounded-md text-xs font-medium ${getConfidenceColor(
                  Math.round((item.confidence ?? 0) * 100)
                )}`}
              >
                {Math.round((item.confidence ?? 0) * 100)}%
              </span>

              <span className="text-xs text-muted-foreground">
                {item.was_corrected ? " · ✅ Corrected" : ""}
              </span>
            </div>
          </div>

          <EditableTable
            value={item.field_value}
            onChange={(newValue) =>
              handleValueChange(item.field_name, newValue)
            }
            isEditing={isEditing && !isApproved}
            activeField={activeField}
            setActiveField={setActiveField}
            fieldName={item.field_name}
            onFieldClick={onFieldClick} // ✅ pass down the onFieldClick prop
          />
        </div>
      ))}

      {scalarValues.length === 0 && complexValues.length === 0 && (
        <div className="mt-6 text-center text-muted-foreground py-8">
          No extracted values found
        </div>
      )}
    </div>
  );
}