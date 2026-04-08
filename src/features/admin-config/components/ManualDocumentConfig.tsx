
// import { FC, useState, useEffect, useMemo, useRef } from "react";
// import {
//   ArrowLeft,
//   GripVertical,
//   Plus,
//   Save,
//   Trash2,
//   ChevronDown,
// } from "lucide-react";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuRadioGroup,
//   DropdownMenuRadioItem,
// } from "@/components/ui/dropdown-menu";
// import { useToast } from "@/hooks/use-toast";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Switch } from "@/components/ui/switch";
// import { useCreateDocumentType } from "@/features/admin-config/hooks/useCreateDocumentType";
// import { useUpdateDocumentType } from "@/features/admin-config/hooks/useUpdateDocumentType";
// import { useApproveDocumentType } from "@/features/admin-config/hooks/useApproveDocumentType";
// import { useDocumentTypes } from "@/features/admin-config/hooks/useDocumentTypes";
// import { ConfirmDialog } from "@/features/admin-config/components/ConfirmDialog";

// /* ---------- Types ---------- */

// type FieldType = "text" | "number" | "date" | "currency";

// export type ExtractionField = {
//   id: string;
//   name: string;
//   type: FieldType;
//   required: boolean;
//   is_deleted?: boolean;
// };

// export type DocumentConfig = {
//   id?: string;
//   name: string;
//   fields: ExtractionField[];
//   status?: string;
//   is_approved?: boolean;
//   createdBy?: "system" | "Admin";
// };

// interface Props {
//   value?: DocumentConfig;
//   onBack: () => void;
//   source?: "manual" | "ai" | "system"; // NEW: indicates creation source
// }

// /* ---------- Constants ---------- */

// const FIELD_TYPES: { label: string; value: FieldType }[] = [
//   { label: "Text", value: "text" },
//   { label: "Numeric", value: "number" },
//   { label: "Date", value: "date" },
//   { label: "Currency", value: "currency" },
// ];

// const createEmptyField = (): ExtractionField => ({
//   id: crypto.randomUUID(),
//   name: "",
//   type: "text",
//   required: false,
//   is_deleted: false,
// });

// /* ---------- Component ---------- */

// const ManualDocumentConfig: FC<Props> = ({ value, onBack, source = "manual" }) => {
//   const { toast } = useToast();
//   const createMutation = useCreateDocumentType();
//   const updateMutation = useUpdateDocumentType();
//   const approveMutation = useApproveDocumentType();

//   const { data: existingData } = useDocumentTypes({ pageSize: 100 });

//   const [name, setName] = useState(value?.name ?? "");
//   const [fields, setFields] = useState<ExtractionField[]>([]);
//   const [serverError, setServerError] = useState<string | null>(null);
//   const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; id: string; fieldName: string }>({ isOpen: false, id: "", fieldName: "" });
//   const [isDirty, setIsDirty] = useState(false);
//   const [showExitConfirm, setShowExitConfirm] = useState(false);

//   const initialValues = useRef({
//     name: value?.name ?? "",
//     fields: value?.fields ?? [createEmptyField()]
//   });

//   /* ---------- Initialize Fields ---------- */
//   useEffect(() => {
//     initialValues.current = {
//       name: value?.name ?? "",
//       fields: value?.fields ?? [createEmptyField()]
//     };
//   }, [value]);

//   useEffect(() => {
//     if (value) {
//       setName(value.name);
//       const initializedFields = value.fields?.map(f => ({ ...f, id: f.id || crypto.randomUUID(), is_deleted: f.is_deleted ?? false })) || [createEmptyField()];
//       setFields(initializedFields);
//     } else setFields([createEmptyField()]);
//   }, [value]);

//   /* ---------- Dirty Tracking ---------- */
//   useEffect(() => {
//     if (!name && fields.length === 0) return;

//     const nameChanged = name !== initialValues.current.name;

//     const fieldsChanged = (() => {
//       const current = fields.filter(f => !f.is_deleted && f.name.trim() !== ""); // <-- only non-empty
//       const initial = initialValues.current.fields.filter(f => !f.is_deleted && f.name.trim() !== "");
//       if (current.length !== initial.length) return true;
//       for (let i = 0; i < current.length; i++) {
//         const c = current[i];
//         const t = initial[i];
//         if (c.name !== t.name || c.type !== t.type || c.required !== t.required) return true;
//       }
//       return false;
//     })();

//     if (value) {
//       setIsDirty(nameChanged || fieldsChanged);
//     } else {
//       const pristineEmpty =
//         name === "" &&
//         fields.filter(f => !f.is_deleted && f.name.trim() !== "").length === 0; // <-- ignore blank new fields
//       setIsDirty((nameChanged || fieldsChanged) && !pristineEmpty);
//     }
//     }, [name, fields, value]);

//     const handleBackAttempt = () => {
//       if (isDirty) setShowExitConfirm(true);
//       else onBack();
//   };

//   /* ---------- Server-side Duplicate Check ---------- */
//   useEffect(() => {
//     if (!name.trim() || name === value?.name) {
//       setServerError(null);
//       return;
//     }
//     const timer = setTimeout(() => {
//       const duplicate = existingData?.documentTypes.find(
//         (doc) => doc.name.toLowerCase() === name.trim().toLowerCase() && doc.id !== value?.id
//       );
//       if (duplicate) setServerError(`Document type '${name}' already exists. Please choose a different name.`);
//       else setServerError(null);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [name, existingData, value?.name, value?.id]);

//   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);

//   const isFormValid = useMemo(() => {
//     const activeFields = fields.filter(f => !f.is_deleted);
//     return name.trim().length > 0 && !serverError && activeFields.length > 0 && activeFields.every(f => f.name.trim().length > 0);
//   }, [name, fields, serverError]);

//   /* ---------- Field Actions ---------- */
//   const addField = () => setFields(prev => [...prev, createEmptyField()]);

//   const removeField = (id: string, fieldName: string) => {
//     const field = fields.find(f => f.id === id);
//     const isNewField = !field?.id || field.id.includes("-");
//     if (!value?.id || isNewField) {
//       setFields(prev => prev.filter(f => f.id !== id));
//       return;
//     }
//     setConfirmConfig({ isOpen: true, id, fieldName });
//   };

//   const executeFieldDelete = () => {
//     setFields(prev => prev.map(f => f.id === confirmConfig.id ? { ...f, is_deleted: true } : f));
//     setConfirmConfig({ isOpen: false, id: "", fieldName: "" });
//     toast({ title: "Field marked for removal", description: `"${confirmConfig.fieldName}" will be removed when you save the configuration.` });
//   };

//   const updateField = (id: string, updates: Partial<ExtractionField>) => setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));

//   /* ---------- Save / Approve Logic ---------- */
//   const handleSave = () => {
//   if (!isFormValid) return;
//   setServerError(null);

//   const fieldsPayload = fields.map(f => ({ ...f, is_deleted: !!f.is_deleted }));
//   const payload: DocumentConfig = {
//     id: value?.id,
//     name: name.trim(),
//     fields: fieldsPayload,
//     createdBy: source === "system" ? "system" : "Admin",
//     is_approved: source === "system" ? false : true,
//     status: "active",
//   };

//   const mutationOptions = {
//     onSuccess: () => {
//       toast({
//         variant: "success",
//         title: value?.id ? "Configuration Updated" : "Configuration Created",
//         description: `"${name}" has been saved and approved.`,
//       });

//       // AUTO APPROVE for system/pending docs AFTER successful save
//       if (value?.id && source === "system") {
//         approveMutation.mutate(value.id, {
//           onSuccess: () => {
//             toast({
//               variant: "success",
//               title: "Document Approved",
//               description: `"${name}" has been saved and approved.`,
//             });
//           },
//           onError: (err: any) => {
//             toast({
//               variant: "destructive",
//               title: "Approval Failed",
//               description: err?.message || "Failed to approve the system document.",
//             });
//           },
//         });
//       }

//       onBack();
//     },
//     onError: (err: any) => {
//       const backendDetail = err?.detail || err?.message || "An error occurred";
//       setServerError(backendDetail);
//       toast({ variant: "destructive", title: "Save Error", description: backendDetail });
//     },
//   };

//   if (value?.id) {
//     // If editing an existing doc
//     updateMutation.mutate(payload, mutationOptions);
//   } else {
//     // If creating a new doc
//     createMutation.mutate(payload, mutationOptions);
//   }
// };

//   /* ---------- Render ---------- */
//   return (
//     <div className="space-y-8 p-10">
//       <div className="flex items-start justify-between">
//         <div className="flex items-center gap-4">
//           <Button onClick={handleBackAttempt} variant="ghost"><ArrowLeft className="h-7 w-7" /></Button>
//           <div>
//             <p className="text-xs font-medium text-muted-foreground">DOCUMENT TYPE NAME</p>
//             <Input
//               value={name}
//               onChange={handleNameChange}
//               placeholder="Enter document type name"
//               className={`mt-2 w-80 ${serverError ? "border-destructive ring-destructive" : ""}`}
//             />
//             {serverError && <p className="text-xs font-medium text-destructive mt-1.5">{serverError}</p>}
//           </div>
//         </div>
//         <Button disabled={updateMutation.isPending || createMutation.isPending || !isFormValid} onClick={handleSave}>
//           <Save className="h-4 w-4" />
//           {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Save/Approve"}
//         </Button>
//       </div>

//       <div className="space-y-4">
//         <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">EXTRACTION FIELDS ({fields.filter(f => !f.is_deleted).length})</h2>
//         {fields.filter(f => !f.is_deleted).map((field) => (
//           <div key={field.id} className="flex items-center gap-4 rounded-xl border bg-background px-4 py-4 relative">
//             <GripVertical className="h-5 w-5 text-muted-foreground" />
//             <Input value={field.name} placeholder="Field name" className="flex-1" onChange={(e) => updateField(field.id, { name: e.target.value })} />
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline" className="w-40 justify-between font-normal">
//                   {FIELD_TYPES.find((t) => t.value === field.type)?.label}
//                   <ChevronDown className="h-4 w-4 text-muted-foreground" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent className="w-40">
//                 <DropdownMenuRadioGroup value={field.type} onValueChange={(v) => updateField(field.id, { type: v as FieldType })}>
//                   {FIELD_TYPES.map((type) => (<DropdownMenuRadioItem key={type.value} value={type.value}>{type.label}</DropdownMenuRadioItem>))}
//                 </DropdownMenuRadioGroup>
//               </DropdownMenuContent>
//             </DropdownMenu>

//             <div className="flex items-center gap-2">
//               <Switch checked={field.required} onCheckedChange={(checked) => updateField(field.id, { required: checked })} />
//               <span className="text-sm text-muted-foreground">Required</span>
//             </div>

//             <button onClick={() => removeField(field.id, field.name)} disabled={fields.filter(f => !f.is_deleted).length === 1} className="rounded-md p-2 text-muted-foreground hover:bg-accent disabled:opacity-40">
//               <Trash2 className="h-4 w-4" />
//             </button>
//           </div>
//         ))}

//         <button onClick={addField} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-2 text-sm text-muted-foreground hover:bg-accent">
//           <Plus className="h-4 w-4" />
//           Add New Field
//         </button>
//       </div>

//       <ConfirmDialog 
//         isOpen={showExitConfirm}
//         title="Unsaved Changes"
//         description="You have unsaved changes. Are you sure you want to go back without saving?"
//         confirmText="Yes, discard changes"
//         variant="destructive" 
//         onClose={() => setShowExitConfirm(false)}
//         onConfirm={() => { setShowExitConfirm(false); onBack(); }}
//       />

//       <ConfirmDialog 
//         isOpen={confirmConfig.isOpen}
//         title="Delete Field"
//         description={`Are you sure you want to remove "${confirmConfig.fieldName}"?`}
//         confirmText="Delete"
//         variant="destructive"
//         onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
//         onConfirm={executeFieldDelete}
//       />
//     </div>
//   );
// };

// export default ManualDocumentConfig;


import { FC, useState, useEffect, useMemo, useRef } from "react";
import {
  ArrowLeft,
  GripVertical,
  Plus,
  Save,
  Trash2,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useCreateDocumentType } from "@/features/admin-config/hooks/useCreateDocumentType";
import { useUpdateDocumentType } from "@/features/admin-config/hooks/useUpdateDocumentType";
import { useApproveDocumentType } from "@/features/admin-config/hooks/useApproveDocumentType";
import { useDocumentTypes } from "@/features/admin-config/hooks/useDocumentTypes";
import { ConfirmDialog } from "@/features/admin-config/components/ConfirmDialog";
import { cn } from "@/lib/utils";

/* ---------- Types ---------- */

export type FieldType = "text" | "number" | "date" | "currency" | "table";

export type ExtractionField = {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  is_deleted?: boolean;
  columns?: string[]; // Add this to store table headers
};

export type DocumentConfig = {
  id?: string;
  name: string;
  fields: ExtractionField[];
  status?: string;
  is_approved?: boolean;
  createdBy?: "system" | "Admin";
};

interface Props {
  value?: DocumentConfig;
  onBack: () => void;
  source?: "manual" | "ai" | "system";
}

/* ---------- Constants ---------- */

const FIELD_TYPES: { label: string; value: FieldType }[] = [
  { label: "Text", value: "text" },
  { label: "Numeric", value: "number" },
  { label: "Date", value: "date" },
  { label: "Currency", value: "currency" },
  { label: "Table", value: "table" },
];

const createEmptyField = (): ExtractionField => ({
  id: crypto.randomUUID(),
  name: "",
  type: "text",
  required: false,
  is_deleted: false,
});

/* ---------- Component ---------- */

const ManualDocumentConfig: FC<Props> = ({ value, onBack, source = "manual" }) => {
  const { toast } = useToast();
  const createMutation = useCreateDocumentType();
  const updateMutation = useUpdateDocumentType();
  const approveMutation = useApproveDocumentType();

  const { data: existingData } = useDocumentTypes({ pageSize: 100 });

  const [name, setName] = useState(value?.name ?? "");
  const [fields, setFields] = useState<ExtractionField[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{ isOpen: boolean; id: string; fieldName: string }>({ isOpen: false, id: "", fieldName: "" });
  const [isDirty, setIsDirty] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const initialValues = useRef({
    name: value?.name ?? "",
    fields: value?.fields ?? [createEmptyField()]
  });

  useEffect(() => {
    initialValues.current = {
      name: value?.name ?? "",
      fields: value?.fields ?? [createEmptyField()]
    };
  }, [value]);

  useEffect(() => {
    if (value) {
      setName(value.name);
      const initializedFields = value.fields?.map(f => ({ ...f, id: f.id || crypto.randomUUID(), is_deleted: f.is_deleted ?? false })) || [createEmptyField()];
      setFields(initializedFields);
    } else setFields([createEmptyField()]);
  }, [value]);

  useEffect(() => {
    if (!name && fields.length === 0) return;
    const nameChanged = name !== initialValues.current.name;
    const fieldsChanged = (() => {
      const current = fields.filter(f => !f.is_deleted && f.name.trim() !== "");
      const initial = initialValues.current.fields.filter(f => !f.is_deleted && f.name.trim() !== "");
      if (current.length !== initial.length) return true;
      for (let i = 0; i < current.length; i++) {
        const c = current[i];
        const t = initial[i];
        if (c.name !== t.name || c.type !== t.type || c.required !== t.required) return true;
      }
      return false;
    })();

    if (value) {
      setIsDirty(nameChanged || fieldsChanged);
    } else {
      const pristineEmpty = name === "" && fields.filter(f => !f.is_deleted && f.name.trim() !== "").length === 0;
      setIsDirty((nameChanged || fieldsChanged) && !pristineEmpty);
    }
  }, [name, fields, value]);

  const handleBackAttempt = () => {
    if (isDirty) setShowExitConfirm(true);
    else onBack();
  };

  useEffect(() => {
    if (!name.trim() || name === value?.name) {
      setServerError(null);
      return;
    }
    const timer = setTimeout(() => {
      const duplicate = existingData?.documentTypes.find(
        (doc) => doc.name.toLowerCase() === name.trim().toLowerCase() && doc.id !== value?.id
      );
      if (duplicate) setServerError(`Document type '${name}' already exists. Please choose a different name.`);
      else setServerError(null);
    }, 500);
    return () => clearTimeout(timer);
  }, [name, existingData, value?.name, value?.id]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value);

  const isFormValid = useMemo(() => {
    const activeFields = fields.filter(f => !f.is_deleted);
    return name.trim().length > 0 && !serverError && activeFields.length > 0 && activeFields.every(f => f.name.trim().length > 0);
  }, [name, fields, serverError]);

  const addField = () => setFields(prev => [...prev, createEmptyField()]);

  const removeField = (id: string, fieldName: string) => {
    const field = fields.find(f => f.id === id);
    const isNewField = !field?.id || field.id.includes("-");
    if (!value?.id || isNewField) {
      setFields(prev => prev.filter(f => f.id !== id));
      return;
    }
    setConfirmConfig({ isOpen: true, id, fieldName });
  };

  const executeFieldDelete = () => {
    setFields(prev => prev.map(f => f.id === confirmConfig.id ? { ...f, is_deleted: true } : f));
    setConfirmConfig({ isOpen: false, id: "", fieldName: "" });
    toast({ title: "Field marked for removal", description: `"${confirmConfig.fieldName}" will be removed when you save the configuration.` });
  };

  const updateField = (id: string, updates: Partial<ExtractionField>) => setFields(prev => prev.map(f => f.id === id ? { ...f, ...updates } : f));

  const handleSave = () => {
    if (!isFormValid) return;
    setServerError(null);
    const fieldsPayload = fields.map(f => ({ ...f, is_deleted: !!f.is_deleted }));
    const payload: DocumentConfig = {
      id: value?.id,
      name: name.trim(),
      fields: fieldsPayload,
      createdBy: source === "system" ? "system" : "Admin",
      is_approved: source === "system" ? false : true,
      status: "active",
    };

    const mutationOptions = {
      onSuccess: () => {
        toast({ variant: "success", title: value?.id ? "Configuration Updated" : "Configuration Created", description: `"${name}" has been saved and approved.` });
        if (value?.id && source === "system") {
          approveMutation.mutate(value.id, {
            onSuccess: () => toast({ variant: "success", title: "Document Approved", description: `"${name}" has been saved and approved.` }),
            onError: (err: any) => toast({ variant: "destructive", title: "Approval Failed", description: err?.message || "Failed to approve the system document." }),
          });
        }
        onBack();
      },
      onError: (err: any) => {
        const backendDetail = err?.detail || err?.message || "An error occurred";
        setServerError(backendDetail);
        toast({ variant: "destructive", title: "Save Error", description: backendDetail });
      },
    };

    if (value?.id) updateMutation.mutate(payload, mutationOptions);
    else createMutation.mutate(payload, mutationOptions);
  };

  return (
    <div className="space-y-8 p-10">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button onClick={handleBackAttempt} variant="ghost"><ArrowLeft className="h-7 w-7" /></Button>
          <div>
            <p className="text-xs font-medium text-muted-foreground">DOCUMENT TYPE NAME</p>
            <Input
              value={name}
              onChange={handleNameChange}
              placeholder="Enter document type name"
              className={`mt-2 w-80 ${serverError ? "border-destructive ring-destructive" : ""}`}
            />
            {serverError && <p className="text-xs font-medium text-destructive mt-1.5">{serverError}</p>}
          </div>
        </div>
        <Button disabled={updateMutation.isPending || createMutation.isPending || !isFormValid} onClick={handleSave}>
          <Save className="h-4 w-4" />
          {updateMutation.isPending || createMutation.isPending ? "Saving..." : "Save/Approve"}
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold tracking-wide text-muted-foreground">EXTRACTION FIELDS ({fields.filter(f => !f.is_deleted).length})</h2>
        {fields
  .filter((f) => !f.is_deleted)
  .map((field) => (
    <div key={field.id} className="space-y-2">
      {/* --- Your Original Row (Unchanged) --- */}
      <div className="flex items-center gap-4 rounded-xl border bg-background px-4 py-4 relative">
        <GripVertical className="h-5 w-5 text-muted-foreground" />
        <Input
          value={field.name}
          placeholder="Field name (e.g. Invoice Items)"
          className="flex-1"
          onChange={(e) => updateField(field.id, { name: e.target.value })}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-40 justify-between font-normal">
              {FIELD_TYPES.find((t) => t.value === field.type)?.label}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-40">
            <DropdownMenuRadioGroup
              value={field.type}
              onValueChange={(v) => updateField(field.id, { type: v as FieldType })}
            >
              {FIELD_TYPES.map((type) => (
                <DropdownMenuRadioItem key={type.value} value={type.value}>
                  {type.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2">
          <Switch
            checked={field.required}
            onCheckedChange={(checked) => updateField(field.id, { required: checked })}
          />
          <span className="text-sm text-muted-foreground font-medium">Required</span>
        </div>

        <button
          onClick={() => removeField(field.id, field.name)}
          disabled={fields.filter((f) => !f.is_deleted).length === 1}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent disabled:opacity-40"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* --- Tabular Data Display (New Section) --- */}
      {field.type === "table" && (
        <div className="ml-9 rounded-lg border border-dashed border-accent/30 bg-accent/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-accent uppercase tracking-wider">
              Table Columns
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-7 text-xs"
              onClick={() => {
                const currentCols = field.columns || [];
                updateField(field.id, { columns: [...currentCols, ""] });
              }}
            >
              <Plus className="mr-1 h-3 w-3" /> Add Column
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {(field.columns || ["Column 1"]).map((col, idx) => (
              <div key={idx} className="flex items-center gap-1 bg-background border rounded-md pl-2 pr-1 py-1">
                <input
                  className="text-xs font-medium bg-transparent outline-none w-24"
                  value={col}
                  placeholder="Column name"
                  onChange={(e) => {
                    const newCols = [...(field.columns || [])];
                    newCols[idx] = e.target.value;
                    updateField(field.id, { columns: newCols });
                  }}
                />
                <button 
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    const newCols = (field.columns || []).filter((_, i) => i !== idx);
                    updateField(field.id, { columns: newCols });
                  }}
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground italic">
            Define the headers the AI should look for in this table.
          </p>
        </div>
      )}
    </div>
  ))}

        <button onClick={addField} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed py-2 text-sm text-foreground hover:bg-secondary">
          <Plus className="h-4 w-4" />
          Add New Field
        </button>
      </div>

      <ConfirmDialog 
        isOpen={showExitConfirm}
        title="Unsaved Changes"
        description="You have unsaved changes. Are you sure you want to go back without saving?"
        confirmText="Yes, discard changes"
        variant="destructive" 
        onClose={() => setShowExitConfirm(false)}
        onConfirm={() => { setShowExitConfirm(false); onBack(); }}
      />

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title="Delete Field"
        description={`Are you sure you want to remove "${confirmConfig.fieldName}"?`}
        confirmText="Delete"
        variant="destructive"
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeFieldDelete}
      />
    </div>
  );
};

export default ManualDocumentConfig;