import React from "react";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

const DisplayTable = ({
  data = [],
  columns = [],
  showSerialNumber = true,
  showPagination = false,
  pageSize = 10,
  enableSorting = false,
  enableFiltering = false,
}) => {
  const [sorting, setSorting] = React.useState([]);
  const [filtering, setFiltering] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: showPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableFiltering ? getFilteredRowModel() : undefined,
    state: {
      sorting: enableSorting ? sorting : undefined,
      globalFilter: enableFiltering ? filtering : undefined,
    },
    onSortingChange: enableSorting ? setSorting : undefined,
    onGlobalFilterChange: enableFiltering ? setFiltering : undefined,
    initialState: {
      pagination: {
        pageSize: pageSize,
      },
    },
  });

  if (!data || data.length === 0) {
    return (
      <div className="w-full p-8 text-center bg-grey-50 rounded-lg border border-grey-200">
        <p className="text-secondary-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Search Filter */}
      {enableFiltering && (
        <div className="mb-4">
          <input
            type="text"
            value={filtering}
            onChange={(e) => setFiltering(e.target.value)}
            placeholder="Search..."
            className="px-4 py-2 border border-grey-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-secondary-50 text-grey-900 w-full max-w-md"
          />
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-grey-200 shadow-sm">
        <table className="w-full border-collapse bg-grey-50">
          <thead className="bg-grey-900 text-grey-50">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {showSerialNumber && (
                  <th className="border border-grey-700 px-4 py-3 text-left font-semibold text-sm">
                    Sr.No
                  </th>
                )}
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="border border-grey-700 px-4 py-3 text-left font-semibold text-sm whitespace-nowrap"
                    onClick={
                      enableSorting
                        ? header.column.getToggleSortingHandler()
                        : undefined
                    }
                    style={{ cursor: enableSorting ? "pointer" : "default" }}
                  >
                    {header.isPlaceholder ? null : (
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {enableSorting && (
                          <span className="text-xs">
                            {header.column.getIsSorted() === "asc"
                              ? "↑"
                              : header.column.getIsSorted() === "desc"
                              ? "↓"
                              : "↕"}
                          </span>
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row, index) => (
              <tr
                key={row.id}
                className="hover:bg-secondary-50 transition-colors"
              >
                {showSerialNumber && (
                  <td className="border border-grey-200 px-4 py-3 text-grey-900 font-medium">
                    {showPagination
                      ? table.getState().pagination.pageIndex *
                          table.getState().pagination.pageSize +
                        index +
                        1
                      : index + 1}
                  </td>
                )}
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="border border-grey-200 px-4 py-3 text-grey-900 whitespace-nowrap text-sm"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between gap-4 mt-4 px-2">
          <div className="flex items-center gap-2">
            <span className="text-sm text-secondary-500">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount()}
            </span>
            <span className="text-sm text-secondary-500">
              | Total: {data.length} rows
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded border border-grey-300 text-grey-900 hover:bg-grey-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              First
            </button>
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded border border-grey-300 text-grey-900 hover:bg-grey-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded border border-grey-300 text-grey-900 hover:bg-grey-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Next
            </button>
            <button
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded border border-grey-300 text-grey-900 hover:bg-grey-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Last
            </button>
          </div>

          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="px-3 py-1 border border-grey-300 rounded bg-grey-50 text-grey-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                Show {size}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default DisplayTable;
