import { Table } from "@tanstack/react-table";
import { Button } from "./ui/button";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export default function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  return (
    <div className="flex items-center justify-end space-x-2 py-4 mr-4">
      <Button
        variant="outline"
        size="sm"
        className="border rounded-xl"
        onClick={() =>
          table.setPagination((prev) => ({
            ...prev,
            pageIndex: prev.pageIndex - 1,
          }))
        }
        disabled={table.getState().pagination.pageIndex === 0}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border rounded-xl"
        onClick={() =>
          table.setPagination((prev) => ({
            ...prev,
            pageIndex: prev.pageIndex + 1,
          }))
        }
        disabled={
          table.getState().pagination.pageIndex > table.getPageCount() - 1 ||
          table.getRowCount() < table.getState().pagination.pageSize
        }
      >
        Next
      </Button>
    </div>
  );
}
