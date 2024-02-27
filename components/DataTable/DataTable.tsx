import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type Row,
  type Table as TTable,
} from '@tanstack/react-table';
import { useCallback, useState } from 'react';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table';
import { makeDefaultColumns } from '~/components/DataTable/DefaultColumns';
import { FileUp, Loader } from 'lucide-react';

type CustomTable<TData> = TTable<TData> & {
  options?: {
    meta?: {
      getRowClasses?: (row: Row<TData>) => string | undefined;
      navigatorLanguages?: string[];
    };
  };
};

type DataTableProps<TData, TValue> = {
  columns?: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumnAccessorKey?: string;
  handleDeleteSelected?: (data: TData[]) => Promise<void> | void;
  handleExportSelected?: (data: TData[]) => void;
  actions?: React.ComponentType<{
    row: Row<TData>;
    data: TData[];
    deleteHandler: (item: TData) => void;
  }>;
  actionsHeader?: React.ReactNode;
  calculateRowClasses?: (row: Row<TData>) => string | undefined;
  headerItems?: React.ReactNode;
};

export function DataTable<TData, TValue>({
  columns = [],
  data,
  handleDeleteSelected,
  handleExportSelected,
  filterColumnAccessorKey = '',
  actions,
  actionsHeader,
  calculateRowClasses,
  headerItems,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  if (columns.length === 0) {
    columns = makeDefaultColumns(data);
  }

  const deleteHandler = async () => {
    setIsDeleting(true);
    const selectedData = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);

    try {
      await handleDeleteSelected?.(selectedData);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('An unknown error occurred.');
    }

    setIsDeleting(false);
    setRowSelection({});
  };

  if (actions) {
    const actionsColumn = {
      id: 'actions',
      header: () => (actionsHeader ? actionsHeader : null),
      cell: ({ row }: { row: Row<TData> }) => {
        const cellDeleteHandler = async (item: TData) => {
          await handleDeleteSelected?.([item]);
        };

        return flexRender(actions, {
          row,
          data,
          deleteHandler: cellDeleteHandler,
        });
      },
    };

    columns = [...columns, actionsColumn];
  }

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    meta: {
      getRowClasses: (row: Row<TData>) => calculateRowClasses?.(row),
    },
    state: {
      sorting,
      rowSelection,
      columnFilters,
    },
  }) as CustomTable<TData>;

  const hasSelectedRows = table.getSelectedRowModel().rows.length > 0;

  const exportHandler = useCallback(() => {
    const selectedData = table
      .getSelectedRowModel()
      .rows.map((r) => r.original);

    handleExportSelected?.(selectedData);

    setRowSelection({});
  }, [handleExportSelected, table, setRowSelection]);

  return (
    <>
      {(filterColumnAccessorKey || headerItems) && (
        <div className="flex items-center gap-2 pb-4 pt-1">
          {filterColumnAccessorKey && (
            <Input
              name="filter"
              placeholder={`Filter by ${filterColumnAccessorKey}...`}
              value={
                (table
                  .getColumn(filterColumnAccessorKey)
                  ?.getFilterValue() as string) ?? ''
              }
              onChange={(event) =>
                table
                  .getColumn(filterColumnAccessorKey)
                  ?.setFilterValue(event.target.value)
              }
              className="mt-0"
            />
          )}
          {headerItems}
        </div>
      )}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={table.options.meta?.getRowClasses?.(row)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div>
        <div className="flex justify-between py-4">
          <div className="text-sm text-muted-foreground">
            {table.getFilteredSelectedRowModel().rows.length} of{' '}
            {table.getFilteredRowModel().rows.length} row(s) selected.
          </div>
          <div className="space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
        {/**
         * TODO: This is garbage.
         *
         * This shouldn't be part of the data table - it should be a component
         * that is passed in to the table that gets given access to the table
         * state. See the other data-table for an example.
         */}
        {hasSelectedRows && (
          <Button
            onClick={() => void deleteHandler()}
            variant="destructive"
            size="sm"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <span className="flex items-center gap-2">
                Deleting...
                <Loader className="h-4 w-4 animate-spin text-white" />
              </span>
            ) : (
              'Delete Selected'
            )}
          </Button>
        )}

        {hasSelectedRows && handleExportSelected && (
          <Button
            onClick={exportHandler}
            variant="default"
            size="sm"
            className="mx-2 gap-x-2.5"
          >
            Export Selected
            <FileUp className="h-5 w-5" />
          </Button>
        )}
      </div>
    </>
  );
}
