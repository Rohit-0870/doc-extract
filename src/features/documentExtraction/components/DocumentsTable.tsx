import React, { useMemo, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";
import type { Document, OcrType } from "@/features/documentExtraction/documentTypes";
import { CalendarIcon, ChevronUp, ChevronDown, PlusCircle, Search, Eye , FileText} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
import { Loader2 } from "lucide-react";
import { SmartTooltip } from "@/components/ui/tooltip";
import { get } from "http";


const STATUS_STYLES: Record<Document["status"], string> = {
  pending: "bg-secondary/90 text-secondary/200 border border-border",
  processing: "bg-accent/10 text-accent border border-accent/50",
  completed: "bg-success/10 text-success border border-border",
  failed: "bg-red-50 text-red-600 border border-red-200",
  review_completed: "bg-green-50 text-green-600 border border-green-200",
};

const formatSize = (size?: number) => {
  if (!size) return "—";
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
};

interface DocumentsTableProps {
  documents: Document[];
  pageSize?: number;
  selectedDocIds?: Set<string>;
  toggleSelect?: (id: string) => void;
  onSelectAll?: (ids: string[]) => void;
  ocrType: OcrType;
  setOcrType: (ocr: OcrType) => void;
  onAnalyzeClick: () => void;
  onView: (documentId: string) => void;
  // ✅ Added for the date range popover
  dateRange?: { from?: Date; to?: Date };
  setDateRange?: React.Dispatch<React.SetStateAction<{ from?: Date; to?: Date }>>;
  totalCount?: number;
  page?: number;
  setPage?: React.Dispatch<React.SetStateAction<number>>;
  isLoading?: boolean;
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  sorting: SortingState;
  onSortingChange: React.Dispatch<React.SetStateAction<SortingState>>;
}

export const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documents,
  sorting,          // <--- Receive from props
  onSortingChange,
  onView,
  pageSize = 10,
  selectedDocIds = new Set(),
  toggleSelect,
  onSelectAll,
  ocrType,
  setOcrType,
  onAnalyzeClick,
  dateRange,
  setDateRange,
  totalCount = 0,
  page = 1,
  setPage,
  search,       
  setSearch,
  isLoading = false,
  }) => {

  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const formatShortDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";

    const day = String(date.getDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "short" }); // e.g., Apr
    const year = String(date.getFullYear()).slice(-2); // last 2 digits

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const columns = useMemo<ColumnDef<Document>[]>(() => [
    {
      id: "actions",
      header: "",
      enableSorting: false,
      cell: ({ row }) => {
        const isViewable = row.original.status === "completed" && !row.original.isTemp;
        return (
          <div className="flex justify-end">
            <button
              onClick={() => onView(row.original.id)}
              title="View Document"
              disabled={!isViewable}
              className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                !isViewable ? "text-muted-foreground cursor-not-allowed bg-background-foreground" : "text-accent hover:bg-secondary border border-transparent hover:secondary/100"
              }`}
            >
              <Eye className="w-4 h-4"/>
            </button>
          </div>
        );
      },
    },
    {
      accessorKey: "fileName",
      id: "filename",
      header: "File Name",
      cell: ({ getValue }) => {
        const value = getValue<string>();

        return (
          <div className="flex items-center gap-3">
            {/* <div className="h-9 w-9 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary" />
            </div> */}

            <SmartTooltip content={value}>
              <span className="truncate">
                {value}
              </span>
            </SmartTooltip>
          </div>
        );
      },
    },
    {
      accessorKey: "documentType",
      id: "document_type",
      header: "Document Type",
      cell: ({ getValue, row }) => {
      const value = getValue<string>();

      const cleanedValue =
        !value || value.toLowerCase() === "unknown" ? null : value;

      return cleanedValue ? (
        <SmartTooltip content={cleanedValue}>
          <span className="truncate">{cleanedValue}</span>
        </SmartTooltip>
      ) : (
        <span className="text-muted-foreground">—</span>
      );
    }
    },
    {
      accessorKey: "totalPages", 
      id: "total_pages",
      header: "Pages",
      cell: ({ getValue }) => {
        const count = getValue<number>();
        return <span className="text-muted-foreground">{count}</span>;
      }
    },
    {
      accessorKey: "fileSizeBytes",
      id: "file_size_bytes",
      header: "File Size",
      cell: ({ getValue }) => <span className="text-muted-foreground">{formatSize(getValue() as number)}</span>,
    },
    {
      accessorKey: "status",
      id: "status",
      header: "Status",
      cell: ({ getValue, row }) => {
      const status = getValue<Document["status"]>();
      const isProcessing = status === "processing";

      return (
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}
        >
          {isProcessing && (
            <Loader2 className="w-3 h-3 animate-spin" />
          )}

          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      );
    },
    },
    {
      accessorKey: "createdAt",
      id: "created_at",
      header: "Created On",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {formatShortDate(getValue<string>())}
        </span>
      ),
    },
    {
      accessorKey: "reviewCompletedAt",
      id: "review_completed_at",
      header: "Approved On",
      cell: ({ getValue }) => {
        const value = getValue<string | null>();
        if (!value) return <span className="text-muted-foreground/100 italic">Pending</span>;
        return <span className="text-muted-foreground/100">{formatShortDate(value)}</span>;
      },
    },
    {
      accessorKey: "ocrType",
      id: "source",
      header: "OCR Type",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {getValue<string>() || "—"}
        </span>
      ),
    },
    {
      accessorKey: "processing_time_seconds",
      id: "processing_time_seconds",
      header: "Processing Time",
      cell: ({ getValue }) => {
        const value = getValue<number | null>();

        return (
          <span className="text-sm text-muted-foreground">
            {value !== null ? `${value.toFixed(2)} s` : "—"}
          </span>
        );
      },
    },
    {
      accessorKey: "total_cost_usd",
      id: "total_cost_usd",
      header: "Token Cost",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {getValue<number>() !== null ? `$${getValue<number>().toFixed(7)}` : "—"}
        </span>
      ),
    },
  ], [onView]);

  const table = useReactTable({
    data: documents,
    columns,
    getRowId: (row) => row.id,
    state: { sorting },
    onSortingChange: onSortingChange,
    manualSorting: true, // <--- ADD THIS: Important for server-side
    getCoreRowModel: getCoreRowModel(),
  });

  const sortedRows = table.getRowModel().rows;
  const pageCount = Math.ceil(totalCount / pageSize);
  const paginatedRows = sortedRows; // already paginated by backend


  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!onSelectAll) return;
    const ids = e.target.checked ? documents.filter(d => !d.isTemp).map(d => d.id) : [];
    onSelectAll(ids);
  };

  return (
    <div className="">
      <div className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div className="flex items-center space-x-2 min-w-[450px]">
          <div className="relative w-80">
          <Input
            placeholder="Search by file name"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage?.(1);
            }}
            className="px-3 py-2 rounded-md text-sm w-full focus:ring-1 focus:ring-blue-400 pl-10 pr-10"
          />

          {/* Left search icon */}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />

          {/* Clear (X) icon */}
          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage?.(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 transition"
            >
              ✕
            </button>
          )}
        </div>


          <div className="relative flex items-center"> {/* Container to hold both */}
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`h-10 justify-start text-left font-normal w-auto min-w-[130px] pr-8 ${ // Added padding-right (pr-8)
                    !dateRange?.from && "text-muted-foreground"
                  }`}
                >
                  <CalendarIcon className="h-4 w-4 shrink-0 mr-2" />
                  <span className="whitespace-nowrap"> 
                    {dateRange?.from ? (
                      dateRange?.to ? (
                        <>{dateRange.from.toLocaleDateString()} – {dateRange.to.toLocaleDateString()}</>
                      ) : (
                        dateRange.from.toLocaleDateString()
                      )
                    ) : (
                      "MM/DD/YYYY – MM/DD/YYYY"
                    )}
                  </span>
                </Button>
              </PopoverTrigger>
              
              {/* The "X" button now positioned inside the right edge of the trigger button */}
              {dateRange?.from && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation(); // Stops the calendar from popping up when you click X
                    setDateRange?.({});
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gray-700 transition"
                >
                  ✕
                </button>
              )}

              <PopoverContent className="w-auto p-0" align="start">
                {/* Your existing Calendar and "Clear Filter" footer remains exactly the same */}
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange?.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                  onSelect={(range) => {
                    if (!range) return;
                    setDateRange?.({ from: range.from, to: range.to });
                    if (range.from && range.to) {
                      setIsCalendarOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                />
                <div className="p-3 border-t border-border bg-foreground-50 flex justify-end">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setDateRange?.({});
                        setIsCalendarOpen(false);
                      }}
                      className="text-sm primary-600 hover:primary-700 hover:bg-secondary"
                    >
                      Clear Filter
                    </Button>
                  </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Select value={ocrType} onValueChange={(value) => setOcrType(value as OcrType)}>
            <SelectTrigger className="w-fit min-w-[110px] h-10">
              <SelectValue placeholder="Select OCR" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="azure_di" className="cursor-pointer">Azure DI</SelectItem>
              <SelectItem value="easy_ocr" className="cursor-pointer">Easy OCR</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={onAnalyzeClick} className="rounded-md bg-primary text-sm text-primary-foreground">
            <PlusCircle className="h-4 w-4"/> Analyze New Document
          </Button>
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-lg border border-border shadow-sm glass-card">
        <div className="w-full overflow-x-auto text-foreground">
          <Table className="min-w-full text-sm">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {/* <TableHead className="w-[48px] min-w-[48px] max-w-[48px] p-0">
                    <div className="flex items-center justify-center h-full">
                      <Input
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          documents.length > 0 &&
                          selectedDocIds.size === documents.filter(d => !d.isTemp).length
                        }
                        className="h-4 w-4 cursor-pointer"
                      />
                    </div>
                  </TableHead> */}
                  {headerGroup.headers.map((header) => {
                    const isSorted = header.column.getIsSorted();
                    return (
                      <TableHead
                        key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        className="cursor-pointer select-none px-3 py-2 whitespace-nowrap max-w-[180px] text-foreground"
                      >
                        <div className="flex items-center space-x-1 overflow-hidden">
                          <span className="truncate">
                            {flexRender(header.column.columnDef.header, header.getContext())}
                          </span>
                          {header.column.getCanSort() && (
                            <span className="flex flex-col shrink-0">
                              <ChevronUp className={`h-3 w-3 ${isSorted === "asc" ? "text-blue-600" : "text-gray-400"}`} />
                              <ChevronDown className={`h-3 w-3 ${isSorted === "desc" ? "text-blue-600" : "text-gray-400"}`} />
                            </span>
                          )}
                        </div>
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="w-[48px] min-w-[48px] max-w-[48px]">
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length}>
                      <div className="text-center py-10 text-gray-500">
                        No documents found
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRows.map((row) => (
                    <TableRow key={row.id}>
                      {/* <TableCell className="w-[48px] min-w-[48px] max-w-[48px]">
                        <div className="flex items-center justify-center h-full">
                          <Input
                            type="checkbox"
                            disabled={row.original.isTemp}
                            className={
                              row.original.isTemp
                                ? "h-4 w-4 cursor-not-allowed opacity-50"
                                : "h-4 w-4 cursor-pointer"
                            }
                            checked={selectedDocIds.has(row.id)}
                            onChange={() => toggleSelect?.(row.id)}
                          />
                        </div>
                      </TableCell> */}
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="px-3 py-3 max-w-[180px]">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
            </TableBody>
          </Table>
        </div>
      
      {pageCount > 1 && (
        <Pagination className="py-6 border-t bg-background">
          <PaginationPrevious
            onClick={() => page && page > 1 && setPage?.(page - 1)}
            className={`cursor-pointer ${page === 1 ? "opacity-50" : ""}`}
          />

          <PaginationContent>
            {Array.from({ length: pageCount }, (_, index) => {
              const current = index + 1;
              const show =
                current === 1 ||
                current === pageCount ||
                Math.abs(current - (page || 1)) <= 1;

              if (show)
                return (
                  <PaginationItem key={current}>
                    <PaginationLink
                      isActive={current === page}
                      onClick={() => setPage?.(current)}
                      className="cursor-pointer"
                    >
                      {current}
                    </PaginationLink>
                  </PaginationItem>
                );

              if (Math.abs(current - (page || 1)) === 2)
                return (
                  <PaginationItem key={current}>
                    <PaginationEllipsis />
                  </PaginationItem>
                );

              return null;
            })}
          </PaginationContent>

          <PaginationNext
            onClick={() =>
              page && page < pageCount && setPage?.(page + 1)
            }
            className={`cursor-pointer ${
              page === pageCount ? "opacity-50" : ""
            }`}
          />
        </Pagination>
      )}
      </div>
    </div>
  );
};
