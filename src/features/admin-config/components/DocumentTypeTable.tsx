
import { useMemo } from "react";
import { FileText, Pencil, Trash2, ChevronUp, ChevronDown, Loader2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
} from "@tanstack/react-table";

interface DocumentTableProps {
  data: any[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onStatusChange: (id: string, checked: boolean) => void;
  sorting: SortingState;
  onSortingChange: (sorting: SortingState) => void;
  isDeleting: boolean;
}

export const DocumentTypeTable = ({
  data,
  isLoading,
  onEdit,
  onDelete,
  onStatusChange,
  sorting,
  onSortingChange,
  isDeleting
}: DocumentTableProps) => {

  // Add these helpers at the top of your file
  const formatShortDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-US", {
      month: "short",
      day: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatFullDate = (dateStr?: string | null) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "—";

    return date.toLocaleString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  
  const columns = useMemo<ColumnDef<any>[]>(() => [
    {
      id: "actions",
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex items-center gap-3 justify-center">
          <Trash2
            className={`h-4 w-4 cursor-pointer text-muted-foreground hover:text-destructive ${
              isDeleting ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={() => onDelete(row.original.id, row.original.name)}
          />
          <Switch
            title="Toggle Active/Inactive"
            checked={row.original.status === "active"}
            onCheckedChange={(checked) => onStatusChange(row.original.id, checked)}
          />
          <Pencil
            className="h-4 w-4 cursor-pointer text-muted-foreground hover:text-foreground"
            onClick={() => onEdit(row.original.id)}
          />
        </div>
      ),
      meta: { width: "10px" },
    },
    {
      accessorKey: "name",
      header: "Document Type",
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          {/* <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <FileText className="h-5 w-5 text-primary" />
          </div> */}
          <span className="font-medium">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "fieldCount",
      header: "Fields",
      cell: ({ row }) => (
        <span className="px-3 py-1 text-sm rounded-full font-medium bg-muted text-foreground">
          {row.original.fieldCount} fields
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            row.original.status === "active" ? "bg-success/10 text-success border border-border" : "bg-secondary/90 text-secondary/200 border border-border"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              row.original.status === "active" ? "bg-success" : "bg-foreground/50"
            }`}
          />
          {row.original.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      accessorKey: "createdBy",
      header: "Created By",
      cell: ({ row }) => (
        <span className="capitalize text-muted-foreground">{row.original.createdBy}</span>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created On",
      cell: ({ getValue }) => (
        <span className="text-muted-foreground">
          {formatShortDate(getValue<string>())}
        </span>
      ),
    },
    {
      accessorKey: "isApproved",
      header: "Approval",
      cell: ({ row }) => {
        const doc = row.original;

        if (!doc.isApproved) {
          return (
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-warning/15 text-warning border border-warning/10">
              Pending
            </span>
          );
        }

        const label = doc.createdBy === "Admin" ? "Auto Approved" : "Approved";

        return (
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-success/10 text-success border border-border">
            {label}
          </span>
        );
      },
    },
    {
      accessorKey: "approvedAt",
      header: "Last Approved On",
      cell: ({ getValue, row }) => {
        const value = getValue<string | null>();
        if (!row.original.isApproved || !value)
          return <span className="text-muted-foreground italic">Pending</span>;
        return <span className="text-muted-foreground">{formatShortDate(value)}</span>;
      },
    },
  ], [onEdit, onDelete, onStatusChange, isDeleting]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-lg border shadow-sm overflow-hidden glass-card">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                const isSorted = header.column.getIsSorted();
                return (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none text-foreground"
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getCanSort() && (
                        <span className="flex flex-col">
                          <ChevronUp
                            className={`h-3 w-3 ${isSorted === "asc" ? "text-primary" : "text-muted-foreground"}`}
                          />
                          <ChevronDown
                            className={`h-3 w-3 ${isSorted === "desc" ? "text-primary" : "text-muted-foreground"}`}
                          />
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
              <TableCell colSpan={columns.length + 1} className="w-[48px] min-w-[48px] max-w-[48px]">
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              </TableCell>
            </TableRow>
          ) : table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-muted/40 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="px-3 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + 1} className="py-14 text-center text-sm text-muted-foreground">
                No document types available
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};