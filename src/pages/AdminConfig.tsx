
// import { useState } from "react";
// import { NavLink } from "react-router-dom";
// import { PlusCircle, Sparkles, Pencil, ArrowLeft, Search, ChevronDown, Loader2, FileText } from "lucide-react";

// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { SortingState } from "@tanstack/react-table";
// import { useToast } from "@/hooks/use-toast";
// import {
//   DropdownMenu,
//   DropdownMenuTrigger,
//   DropdownMenuContent,
//   DropdownMenuItem,
// } from "@/components/ui/dropdown-menu";

// import { DocumentTypeTable } from "@/features/admin-config/components/DocumentTypeTable";
// import ManualDocumentConfig, { DocumentConfig } from "@/features/admin-config/components/ManualDocumentConfig";
// import { FileUpload } from "@/features/admin-config/components/FileUploadAi";
// import { useDocumentTypes } from "@/features/admin-config/hooks/useDocumentTypes";
// import { useDocumentTypeById } from "@/features/admin-config/hooks/useGetDocumentDetails";
// import { useDeleteDocumentType } from "@/features/admin-config/hooks/useDeleteDocumentType";
// import { useUpdateDocumentStatus } from "@/features/admin-config/hooks/useUpdateDocumentStatus";
// import { ConfirmDialog } from "@/features/admin-config/components/ConfirmDialog";
// import { ThemeToggle } from "@/components/themeToggle";

// type Mode =
//   | { type: "list" }
//   | { type: "manual"; value?: DocumentConfig; source?: "manual" | "ai" | "system" }
//   | { type: "ai" };

// const AdminConfig = () => {
//   const [open, setOpen] = useState(false);
//   const [mode, setMode] = useState<Mode>({ type: "list" });
//   const [sorting, setSorting] = useState<SortingState>([]);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [aiHasFiles, setAiHasFiles] = useState(false);
//   const [aiLeaveConfirm, setAiLeaveConfirm] = useState(false);

//   const { data, isLoading } = useDocumentTypes({ page: 1, pageSize: 20 });
//   const { data: editingDoc, isLoading: isEditingLoading } = useDocumentTypeById(editingId ?? undefined);

//   const deleteMutation = useDeleteDocumentType();
//   const statusMutation = useUpdateDocumentStatus();

//   const { toast } = useToast();

//   const [confirmConfig, setConfirmConfig] = useState<{
//     isOpen: boolean;
//     id: string;
//     name: string;
//   }>({ isOpen: false, id: "", name: "" });

//   /* ---------- Handlers ---------- */
//   const handleEdit = (id: string) => {
//     setEditingId(id);
//     setMode({ type: "manual", source: "system" }); // system-imported doc
//   };

//   const handleDelete = (id: string, name: string) => {
//     setConfirmConfig({ isOpen: true, id, name });
//   };

//   const executeDelete = () => {
//     deleteMutation.mutate(confirmConfig.id, {
//       onSuccess: () => {
//         toast({
//           variant: "success",
//           title: "Document Deleted",
//           description: `"${confirmConfig.name}" has been removed successfully.`,
//         });
//         setConfirmConfig({ isOpen: false, id: "", name: "" });
//       },
//       onError: (err: any) => {
//         toast({
//           variant: "destructive",
//           title: "Delete Failed",
//           description: err?.message || "Could not delete the document type.",
//         });
//       },
//     });
//   };

//   const handleStatusChange = (id: string, checked: boolean) => {
//     const newStatus = checked ? "active" : "inactive";
//     statusMutation.mutate(
//       { id, status: newStatus },
//       {
//         onSuccess: () => {
//           toast({
//             variant: "success",
//             title: "Status Updated",
//             description: `Document type is now ${newStatus}.`,
//           });
//         },
//         onError: () => {
//           toast({
//             variant: "destructive",
//             title: "Status Update Failed",
//             description: "Failed to change the document status.",
//           });
//         },
//       }
//     );
//   };

//   /* ---------- Mode Rendering ---------- */
//   if (mode.type === "manual") {
//     const prefill = editingDoc ?? mode.value;

//     return isEditingLoading ? (
//       <div className="flex items-center justify-center h-full p-40">
//         <Loader2 className="h-6 w-6 animate-spin text-primary" />
//       </div>
//     ) : (
//       <ManualDocumentConfig
//         key={prefill?.id || "new-doc"}
//         value={prefill}
//         onBack={() => {
//           setEditingId(null);
//           setMode({ type: "list" });
//         }}
//         source={mode.source || "manual"} // pass the correct source
//       />
//     );
//   }

//   if (mode.type === "ai") {
//     return (
//       <div className="p-10 space-y-6">
//         <div className="flex items-center gap-4">
//           <Button
//             onClick={() => {
//               if (aiHasFiles) {
//                 setAiLeaveConfirm(true);
//                 return;
//               }
//               setMode({ type: "list" });
//             }}
//             variant="ghost"
//           >
//             <ArrowLeft className="h-5 w-5" />
//           </Button>
//           <div>
//             <h1 className="text-2xl font-semibold">Upload Document</h1>
//             <p className="text-sm text-muted-foreground">
//               Upload a sample document for AI analysis
//             </p>
//           </div>
//         </div>

//         <div className="flex justify-center pt-10">
//           <div className="w-[700px]">
//             <FileUpload
//               onFilesSelected={(hasFiles) => setAiHasFiles(hasFiles)}
//               onFileProcessed={(name, suggestedFields = []) => {
//                 setAiHasFiles(false);

//                 const normalizedFields = suggestedFields.map((f: any) => ({
//                   id: crypto.randomUUID(),
//                   name: f.field_name || f.name || "",
//                   type: f.field_type || f.type || "text",
//                   required: f.is_mandatory ?? f.required ?? false,
//                   is_deleted: false,
//                 }));

//                 setMode({
//                   type: "manual",
//                   value: {
//                     name: name.replace(/\.[^/.]+$/, ""),
//                     fields: normalizedFields,
//                   },
//                   source: "ai",
//                 });
//               }}
//               onCancel={() => setMode({ type: "list" })}
//             />
//           </div>
//         </div>
//         <ConfirmDialog
//         isOpen={aiLeaveConfirm}
//         title="Discard Upload?"
//         description="You have selected files but have not analyzed them. If you leave now, the selected files will be lost."
//         confirmText="Discard"
//         variant="destructive"
//         onClose={() => setAiLeaveConfirm(false)}
//         onConfirm={() => {
//           setAiLeaveConfirm(false);
//           setAiHasFiles(false);
//           setMode({ type: "list" });
//         }}
//       />
//       </div>
//     );
//   }

//   /* ---------- List Mode ---------- */
//   return (
//     <div className="p-10">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-10">
//         <div>
//           <h1 className="text-2xl font-semibold text-foreground">Admin Configuration</h1>
//           <p className="text-sm text-gray-500">
//             Manage document types and extraction field configurations
//           </p>
//         </div>

//         <div className="flex items-center gap-3">
//           <NavLink
//           to="/"
//           className="flex items-center rounded text-foreground"
//           title="Doc Extraction"
//           >
//           <div className="flex items-center p-2 rounded-md border">
//             <FileText className="w-4 h-4 mr-2" />
//              <div className="text-sm">
//               Doc Extraction
//              </div>
//           </div>
//           </NavLink>
//           <div title="Toggle theme">
//             <ThemeToggle />
//           </div>
//         </div>
//       </div>

//       {/* Search & Create */}
//       <div className="flex items-center justify-between gap-4 mb-4">
//         <div className="relative w-80">
//           <Input placeholder="Search document types..." className="pl-10" />
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
//         </div>

//         <div className="relative">
//           <DropdownMenu>
//             <DropdownMenuTrigger asChild>
//               <Button className="gap-2">
//                 <PlusCircle className="h-4 w-4" />
//                 Create New Document Type
//                 <ChevronDown className="h-4 w-4" />
//               </Button>
//             </DropdownMenuTrigger>
//             <DropdownMenuContent align="end" className="w-60 z-50">
//               <DropdownMenuItem
//                 onClick={() => setMode({ type: "manual", source: "manual" })}
//                 className="flex items-center gap-2 cursor-pointer"
//               >
//                 <Pencil className="h-4 w-4" /> Manual Configuration
//               </DropdownMenuItem>
//               <DropdownMenuItem
//                 onClick={() => setMode({ type: "ai" })}
//                 className="flex items-center gap-2 cursor-pointer"
//               >
//                 <Sparkles className="h-4 w-4" /> AI Assisted Setup
//               </DropdownMenuItem>
//             </DropdownMenuContent>
//           </DropdownMenu>
//         </div>
//       </div>

//       {/* Table */}
//       <DocumentTypeTable
//         data={data?.documentTypes ?? []}
//         isLoading={isLoading}
//         onEdit={handleEdit}
//         onDelete={handleDelete}
//         onStatusChange={handleStatusChange}
//         sorting={sorting}
//         onSortingChange={setSorting}
//         isDeleting={deleteMutation.isPending}
//       />

//       {/* Delete Confirmation */}
//       <ConfirmDialog
//         isOpen={confirmConfig.isOpen}
//         title="Delete Document Type"
//         description={`Are you sure you want to delete "${confirmConfig.name}"?`}
//         confirmText="Delete"
//         variant="destructive"
//         onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
//         onConfirm={executeDelete}
//         isLoading={deleteMutation.isPending}
//       />
//     </div>
//   );
// };

// export default AdminConfig;



import { useState } from "react";
import { NavLink } from "react-router-dom";
import { PlusCircle, Sparkles, Pencil, ArrowLeft, Search, ChevronDown, Loader2, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SortingState } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { DocumentTypeTable } from "@/features/admin-config/components/DocumentTypeTable";
import ManualDocumentConfig, { DocumentConfig, FieldType } from "@/features/admin-config/components/ManualDocumentConfig";
import { FileUpload } from "@/features/admin-config/components/FileUploadAi";
import { useDocumentTypes } from "@/features/admin-config/hooks/useDocumentTypes";
import { useDocumentTypeById } from "@/features/admin-config/hooks/useGetDocumentDetails";
import { useDeleteDocumentType } from "@/features/admin-config/hooks/useDeleteDocumentType";
import { useUpdateDocumentStatus } from "@/features/admin-config/hooks/useUpdateDocumentStatus";
import { ConfirmDialog } from "@/features/admin-config/components/ConfirmDialog";
import { ThemeToggle } from "@/components/themeToggle";

type Mode =
  | { type: "list" }
  | { type: "manual"; value?: DocumentConfig; source?: "manual" | "ai" | "system" }
  | { type: "ai" };

const AdminConfig = () => {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>({ type: "list" });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [aiHasFiles, setAiHasFiles] = useState(false);
  const [aiLeaveConfirm, setAiLeaveConfirm] = useState(false);

  const { data, isLoading } = useDocumentTypes({ page: 1, pageSize: 20 });
  const { data: editingDoc, isLoading: isEditingLoading } = useDocumentTypeById(editingId ?? undefined);

  const deleteMutation = useDeleteDocumentType();
  const statusMutation = useUpdateDocumentStatus();

  const { toast } = useToast();

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    id: string;
    name: string;
  }>({ isOpen: false, id: "", name: "" });

  /* ---------- Handlers ---------- */
  const handleEdit = (id: string) => {
    setEditingId(id);
    setMode({ type: "manual", source: "system" }); // system-imported doc
  };

  const handleDelete = (id: string, name: string) => {
    setConfirmConfig({ isOpen: true, id, name });
  };

  const executeDelete = () => {
    deleteMutation.mutate(confirmConfig.id, {
      onSuccess: () => {
        toast({
          variant: "success",
          title: "Document Deleted",
          description: `"${confirmConfig.name}" has been removed successfully.`,
        });
        setConfirmConfig({ isOpen: false, id: "", name: "" });
      },
      onError: (err: any) => {
        toast({
          variant: "destructive",
          title: "Delete Failed",
          description: err?.message || "Could not delete the document type.",
        });
      },
    });
  };

  const handleStatusChange = (id: string, checked: boolean) => {
    const newStatus = checked ? "active" : "inactive";
    statusMutation.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          toast({
            variant: "success",
            title: "Status Updated",
            description: `Document type is now ${newStatus}.`,
          });
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Status Update Failed",
            description: "Failed to change the document status.",
          });
        },
      }
    );
  };

  /* ---------- Mode Rendering ---------- */
  if (mode.type === "manual") {
    const prefill = editingDoc ?? mode.value;

    return isEditingLoading ? (
      <div className="flex items-center justify-center h-full p-40">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    ) : (
      <ManualDocumentConfig
        key={prefill?.id || "new-doc"}
        value={prefill}
        onBack={() => {
          setEditingId(null);
          setMode({ type: "list" });
        }}
        source={mode.source || "manual"} // pass the correct source
      />
    );
  }

  if (mode.type === "ai") {
    return (
      <div className="p-10 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={() => {
              if (aiHasFiles) {
                setAiLeaveConfirm(true);
                return;
              }
              setMode({ type: "list" });
            }}
            variant="ghost"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Upload Document</h1>
            <p className="text-sm text-muted-foreground">
              Upload a sample document for AI analysis
            </p>
          </div>
        </div>

        <div className="flex justify-center pt-10">
          <div className="w-[700px]">
            <FileUpload
              onFilesSelected={(hasFiles) => setAiHasFiles(hasFiles)}
              onFileProcessed={(name, suggestedFields = []) => {
  setAiHasFiles(false);

  const normalizedFields = suggestedFields.map((f: any) => {
  const name = f.field_name || f.name || "";
  let type = (f.field_type || f.type || "text").toLowerCase();

  // Force the 'table' type if name matches
  if (name.toLowerCase().includes("table") || name.toLowerCase() === "items") {
    type = "table";
  }

  return {
    id: crypto.randomUUID(),
    name: name,
    type: type as FieldType, // This will now work without error
    required: !!(f.is_mandatory ?? f.required),
    is_deleted: false,
  };
});

  setMode({
    type: "manual",
    value: {
      name: name.replace(/\.[^/.]+$/, ""),
      fields: normalizedFields,
    },
    source: "ai",
  });
}}
              onCancel={() => setMode({ type: "list" })}
            />
          </div>
        </div>
        <ConfirmDialog
        isOpen={aiLeaveConfirm}
        title="Discard Upload?"
        description="You have selected files but have not analyzed them. If you leave now, the selected files will be lost."
        confirmText="Discard"
        variant="destructive"
        onClose={() => setAiLeaveConfirm(false)}
        onConfirm={() => {
          setAiLeaveConfirm(false);
          setAiHasFiles(false);
          setMode({ type: "list" });
        }}
      />
      </div>
    );
  }

  /* ---------- List Mode ---------- */
  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Admin Configuration</h1>
          <p className="text-sm text-gray-500">
            Manage document types and extraction field configurations
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NavLink
          to="/"
          className="flex items-center rounded text-foreground"
          title="Doc Extraction"
          >
          <div className="flex items-center p-2 rounded-md border">
            <FileText className="w-4 h-4 mr-2" />
             <div className="text-sm">
              Doc Extraction
             </div>
          </div>
          </NavLink>
          <div title="Toggle theme">
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Search & Create */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="relative w-80">
          <Input placeholder="Search document types..." className="pl-10" />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
        </div>

        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New Document Type
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60 z-50">
              <DropdownMenuItem
                onClick={() => setMode({ type: "manual", source: "manual" })}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Pencil className="h-4 w-4" /> Manual Configuration
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setMode({ type: "ai" })}
                className="flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" /> AI Assisted Setup
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table */}
      <DocumentTypeTable
        data={data?.documentTypes ?? []}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStatusChange={handleStatusChange}
        sorting={sorting}
        onSortingChange={setSorting}
        isDeleting={deleteMutation.isPending}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={confirmConfig.isOpen}
        title="Delete Document Type"
        description={`Are you sure you want to delete "${confirmConfig.name}"?`}
        confirmText="Delete"
        variant="destructive"
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={executeDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
};

export default AdminConfig;
