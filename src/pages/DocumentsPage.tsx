
// import React, { useState, useMemo, useEffect} from "react";
// import { NavLink } from "react-router-dom";
// import { Settings } from "lucide-react";
// import { METRICS_BASE_URL } from "@/config/env";
// import { useQueryClient, useMutation } from "@tanstack/react-query";
// import { Document, OcrType } from "@/features/documentExtraction/documentTypes";
// import { DocumentsTable } from "@/features/documentExtraction/components/DocumentsTable";
// import DocumentAnalyzeFlow from "@/features/documentExtraction/components/DocumentAnalyzeFlow";
// import { useDashboardDocuments } from "@/features/documentExtraction/hooks/useDashboardDocuments";
// import { useDocumentExtraction } from "@/features/documentExtraction/hooks/useDocumentExtraction";
// import { useAzureDocumentExtraction } from "@/features/documentExtraction/hooks/useAzureDocumentExtraction";
// import DocumentDetailsView from "@/features/documentExtraction/components/DocumentDetailsView";
// import { 
//   SortingState 
// } from "@tanstack/react-table";
// import { useDebounce } from "@/features/documentExtraction/hooks/useDebounce";
// import { ThemeToggle } from "@/components/themeToggle";

// const DocumentsPage = () => {
//   const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
//   const [ocrType, setOcrType] = useState<OcrType>("azure_di");
//   const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
//   const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
//   const [optimisticDocs, setOptimisticDocs] = useState<Document[]>([]);
//   const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
//   const [pageSize, setPageSize] = useState<number>(10); // ✅ dynamic page size
//   const [page, setPage] = useState(1);
//   const [search, setSearch] = useState("");
//   const debouncedSearch = useDebounce(search, 400); 
//   const [sorting, setSorting] = useState<SortingState>([]);
  
//   useEffect(() => {
//   const intervalMs = 1 * 60 * 1000;
//   let lastPing = Date.now();

//   const pingBackend = async () => {
//     try {
//       await fetch(`${METRICS_BASE_URL}/health`, { method: "GET", mode: "no-cors" });
//       lastPing = Date.now();
//     } catch {}
//   };

//   const interval = setInterval(pingBackend, intervalMs);

//     // initial ping on mount
//     pingBackend();

//     return () => clearInterval(interval);
//     }, []);


//   useEffect(() => {
//   setPage(1);
//   }, [debouncedSearch, dateRange, sorting, pageSize]);


//   const queryClient = useQueryClient();
//   const easy = useDocumentExtraction();
//   const azure = useAzureDocumentExtraction();

//   // Build query params dynamically
//   const queryParams = useMemo(() => {
//   const currentSort = sorting[0]; 

//   return {
//     start_date: dateRange.from?.toISOString(),
//     end_date: dateRange.to?.toISOString(),
//     page,
//     page_size: pageSize,
//     filename_contains: debouncedSearch || undefined,
//     sort_by: currentSort?.id || "created_at", 
//     sort_order: (currentSort ? (currentSort.desc ? "DESC" : "ASC") : "DESC") as "ASC" | "DESC",
//   };
//   }, [
//   dateRange.from,
//   dateRange.to,
//   pageSize,
//   page,
//   debouncedSearch,
//   sorting
//   ]);


//   const {
//   data = { documents: [], totalCount: 0 },
//   isLoading,
//   error,
//   } = useDashboardDocuments(optimisticDocs, queryParams);

//   const { documents, totalCount } = data;


//   const { mutate: extractMutation } = useMutation({
//     mutationFn: async ({ file, ocr }: { file: File; ocr: OcrType }) => {
//       return ocr === "easy_ocr" ? easy.extractDocument(file) : azure.extractDocumentAzure(file);
//     },
//     onMutate: async ({ file, ocr }) => {
//       const now = new Date();
//       const tempId = `temp-${crypto.randomUUID()}`;

//       const newDoc: Document = {
//         id: tempId,
//         fileName: file.name,
//         ocrType: ocr,
//         status: "processing",
//         isTemp: true,
//         createdAt: now.toISOString(),
//         createdAtFormatted: now.toLocaleString(undefined, {
//           month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit",
//         }),
//         fileSizeBytes: file.size,
//         pageDimensions: [],
//         requiresHumanReview: false,
//         documentType: "—",
//       };

//       setOptimisticDocs((prev) => [newDoc, ...prev]);
//       queryClient.cancelQueries({ queryKey: ["dashboard-documents"] });
//       return { newDoc };
//     },
//     onSettled: (data, error, variables, context) => {
//       queryClient.invalidateQueries({ queryKey: ["dashboard-documents"] });
//     },
//   });

//   const toggleSelect = (id: string) => {
//   setSelectedDocIds(prev => {
//     const next = new Set(prev);
//     next.has(id) ? next.delete(id) : next.add(id);
//     return next;
//   });
//   };

//   return (
//     <div className="p-10 bg-background min-h-screen">
//       {!activeDocumentId ? (
//         <>
//           <div className="flex items-center justify-between mb-6">
//             <div>
//               <h1 className="text-2xl font-semibold">Document Extraction</h1>
//               <p className="text-sm text-muted-foreground">Manage and approve extracted documents</p>
//             </div>
//             <div className="flex items-center gap-3">
//               <NavLink
//               to="/admin"
//               className="flex items-center rounded text-foreground"
//               title="Admin Configuration"
//               >
//               <div className="flex items-center p-2 rounded-md border">
//                 <Settings className="w-4 h-4 mr-2" />
//                 <div className="text-sm">
//                   Admin
//                 </div>
//               </div>
//               </NavLink>
//               <div title="Toggle theme">
//                   <ThemeToggle />
//               </div>
//             </div>
//           </div>
//           {error ? (
//             <p className="p-4 text-red-500">Error loading documents</p>
//           ) : (
//             <>
//               {/* Page size selector (next to OCR dropdown) */}
//               {/* <div className="flex items-center gap-3 mb-2">
//                 <label className="text-sm">Page size:</label>
//                 <select
//                   value={pageSize}
//                   onChange={(e) => setPageSize(Number(e.target.value))}
//                   className="border rounded-md px-2 py-1 text-sm"
//                 >
//                   {[10, 25, 50, 100].map(size => (
//                     <option key={size} value={size}>{size}</option>
//                   ))}
//                 </select>
//               </div> */}

//               <DocumentsTable
//                 documents={documents}
//                 sorting={sorting}         
//                 onSortingChange={setSorting}
//                 pageSize={pageSize}
//                 totalCount={totalCount}
//                 page={page}
//                 setPage={setPage}
//                 onView={setActiveDocumentId}
//                 selectedDocIds={selectedDocIds}
//                 toggleSelect={toggleSelect}
//                 onSelectAll={(ids) => setSelectedDocIds(new Set(ids))}
//                 ocrType={ocrType}
//                 setOcrType={setOcrType}
//                 onAnalyzeClick={() => setIsAnalyzeOpen(true)}
//                 dateRange={dateRange}
//                 setDateRange={setDateRange}
//                 isLoading={isLoading}
//                 search={search}
//                 setSearch={setSearch}
//               />
//             </>
//           )}
//         </>
//       ) : (
//         <DocumentDetailsView
//           documentId={activeDocumentId}
//           onBack={() => setActiveDocumentId(null)}
//         />
//       )}

//       <DocumentAnalyzeFlow
//         open={isAnalyzeOpen}
//         ocrType={ocrType}
//         onClose={() => setIsAnalyzeOpen(false)}
//         onDocumentAdd={(file, ocr) => {
//           extractMutation({ file, ocr });
//           return "optimistic-id";
//         }}
//       />
//     </div>
//   );
// };

// export default DocumentsPage;


import React, { useState, useMemo, useEffect} from "react";
import { NavLink } from "react-router-dom";
import { Settings } from "lucide-react";
import { METRICS_BASE_URL } from "@/config/env";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { Document, DocumentExtractionResponse, OcrType } from "@/features/documentExtraction/documentTypes";
import { DocumentsTable } from "@/features/documentExtraction/components/DocumentsTable";
import DocumentAnalyzeFlow from "@/features/documentExtraction/components/DocumentAnalyzeFlow";
import { useDashboardDocuments } from "@/features/documentExtraction/hooks/useDashboardDocuments";
import { useDocumentExtraction } from "@/features/documentExtraction/hooks/useDocumentExtraction";
import { useAzureDocumentExtraction } from "@/features/documentExtraction/hooks/useAzureDocumentExtraction";
import DocumentDetailsView from "@/features/documentExtraction/components/DocumentDetailsView";
import { 
  SortingState 
} from "@tanstack/react-table";
import { useDebounce } from "@/features/documentExtraction/hooks/useDebounce";
import { ThemeToggle } from "@/components/themeToggle";

const DocumentsPage = () => {
  const [isAnalyzeOpen, setIsAnalyzeOpen] = useState(false);
  const [ocrType, setOcrType] = useState<OcrType>("azure_di");
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [optimisticDocs, setOptimisticDocs] = useState<Document[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [pageSize, setPageSize] = useState<number>(10); // ✅ dynamic page size
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400); 
  const [sorting, setSorting] = useState<SortingState>([]);
  
  useEffect(() => {
  setPage(1);
  }, [debouncedSearch, dateRange, sorting, pageSize]);


  const queryClient = useQueryClient();
  const easy = useDocumentExtraction();
  const azure = useAzureDocumentExtraction();

  // Build query params dynamically
  const queryParams = useMemo(() => {
  const currentSort = sorting[0]; 

  return {
    start_date: dateRange.from?.toISOString(),
    end_date: dateRange.to?.toISOString(),
    page,
    page_size: pageSize,
    filename_contains: debouncedSearch || undefined,
    sort_by: currentSort?.id || "created_at", 
    sort_order: (currentSort ? (currentSort.desc ? "DESC" : "ASC") : "DESC") as "ASC" | "DESC",
  };
  }, [
  dateRange.from,
  dateRange.to,
  pageSize,
  page,
  debouncedSearch,
  sorting
  ]);


  const {
  data = { documents: [], totalCount: 0 },
  isLoading,
  error,
  } = useDashboardDocuments(optimisticDocs, queryParams);

  const { documents, totalCount } = data;


  const { mutate: extractMutation } = useMutation<DocumentExtractionResponse, Error,
  { file: File; ocr: OcrType },
  { tempId: string }
  >({
    mutationFn: async ({ file, ocr }) => {
      if (ocr === "easy_ocr") {
        // 🚫 service disabled
        throw new Error("Easy OCR service is currently unavailable");
      }

      return azure.extractDocumentAzure(file); // ✅ always returns correct type
    },
    onMutate: async ({ file, ocr }) => {
      const now = new Date();
      const tempId = `temp-${crypto.randomUUID()}`;

      const newDoc: Document = {
        id: tempId,
        fileName: file.name,
        ocrType: ocr,
        status: "processing",
        isTemp: true,

        createdAt: now.toISOString(),
        createdAtFormatted: "—",

        fileSizeBytes: undefined,
        totalPages: "—",                    // ✅ add
        processing_time_seconds: null,      // ✅ add
        total_cost_usd: null,               // ✅ add

        pageDimensions: [],
        requiresHumanReview: false,
        reviewCompletedAt: null,
        documentType: "—",
      };

      setOptimisticDocs((prev) => [newDoc, ...prev]);

      await queryClient.cancelQueries({ queryKey: ["dashboard-documents"] });

      return { tempId }; // ✅ THIS IS KEY
    },
    onSuccess: (data, variables, context) => {
      if (!context?.tempId) return;

      // ⏳ delay removal slightly so UI doesn't flicker
      setTimeout(() => {
        setOptimisticDocs((prev) =>
          prev.filter((doc) => doc.id !== context.tempId)
        );
      }, 500); // 300–800ms sweet spot
    },
    onSettled: (data, error, variables, context) => {
      queryClient.invalidateQueries({ queryKey: ["dashboard-documents"] });
    },
    onError: (error, variables, context) => {
      if (!context?.tempId) return;

      setOptimisticDocs((prev) =>
        prev.filter((doc) => doc.id !== context.tempId)
      );
    },
  });

  const toggleSelect = (id: string) => {
  setSelectedDocIds(prev => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });
  };

  return (
    <div className="p-10 bg-background min-h-screen">
      {!activeDocumentId ? (
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold">Document Extraction</h1>
              <p className="text-sm text-muted-foreground">Manage and approve extracted documents</p>
            </div>
            <div className="flex items-center gap-3">
              <NavLink
              to="/admin"
              className="flex items-center rounded text-foreground"
              title="Admin Configuration"
              >
              <div className="flex items-center p-2 rounded-md border">
                <Settings className="w-4 h-4 mr-2" />
                <div className="text-sm">
                  Admin
                </div>
              </div>
              </NavLink>
              <div title="Toggle theme">
                  <ThemeToggle />
              </div>
            </div>
          </div>
          {error ? (
            <p className="p-4 text-red-500">Error loading documents</p>
          ) : (
            <>
              {/* Page size selector (next to OCR dropdown) */}
              {/* <div className="flex items-center gap-3 mb-2">
                <label className="text-sm">Page size:</label>
                <select
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="border rounded-md px-2 py-1 text-sm"
                >
                  {[10, 25, 50, 100].map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div> */}

              <DocumentsTable
                documents={documents}
                sorting={sorting}         
                onSortingChange={setSorting}
                pageSize={pageSize}
                totalCount={totalCount}
                page={page}
                setPage={setPage}
                onView={setActiveDocumentId}
                selectedDocIds={selectedDocIds}
                toggleSelect={toggleSelect}
                onSelectAll={(ids) => setSelectedDocIds(new Set(ids))}
                ocrType={ocrType}
                setOcrType={setOcrType}
                onAnalyzeClick={() => setIsAnalyzeOpen(true)}
                dateRange={dateRange}
                setDateRange={setDateRange}
                isLoading={isLoading}
                search={search}
                setSearch={setSearch}
              />
            </>
          )}
        </>
      ) : (
        <DocumentDetailsView
          documentId={activeDocumentId}
          onBack={() => setActiveDocumentId(null)}
        />
      )}

      <DocumentAnalyzeFlow
        open={isAnalyzeOpen}
        ocrType={ocrType}
        onClose={() => setIsAnalyzeOpen(false)}
        onDocumentAdd={(file, ocr) => {
          extractMutation({ file, ocr });
          return "optimistic-id";
        }}
      />
    </div>
  );
};

export default DocumentsPage;
