'use client';

import * as React from 'react';
import Link from 'next/link';
import type { Table } from '@tanstack/react-table';
import { Button, buttonVariants } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import { DataTableFacetedFilter } from '~/components/data-table/data-table-faceted-filter';
import {
  type DataTableFilterableColumn,
  type DataTableSearchableColumn,
} from '~/lib/data-table/types';
import { PlusCircle, Trash, X } from 'lucide-react';
import { cn } from '~/utils/shadcn';
import { type UrlObject } from 'url';

type DataTableToolbarProps<TData> = {
  table: Table<TData>;
  filterableColumns?: DataTableFilterableColumn<TData>[];
  searchableColumns?: DataTableSearchableColumn<TData>[];
  newRowLink?: UrlObject;
  deleteRowsAction?: React.MouseEventHandler<HTMLButtonElement>;
};

export function DataTableToolbar<TData>({
  table,
  filterableColumns = [],
  searchableColumns = [],
  newRowLink,
  deleteRowsAction,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [isPending, startTransition] = React.useTransition();

  return (
    <div className="flex w-full items-center justify-between space-x-2 overflow-auto p-1">
      <div className="flex flex-1 items-center space-x-2">
        {searchableColumns.length > 0 &&
          searchableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : '') && (
                <Input
                  name="Filter"
                  key={String(column.id)}
                  placeholder={`Filter ${column.title}...`}
                  value={
                    (table
                      .getColumn(String(column.id))
                      ?.getFilterValue() as string) ?? ''
                  }
                  onChange={(event) =>
                    table
                      .getColumn(String(column.id))
                      ?.setFilterValue(event.target.value)
                  }
                  className="mt-0"
                />
              ),
          )}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : '') && (
                <DataTableFacetedFilter
                  key={String(column.id)}
                  column={table.getColumn(column.id ? String(column.id) : '')}
                  title={column.title}
                  options={column.options}
                />
              ),
          )}
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-10 px-2 lg:px-3"
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}
      </div>
      <div className="flex items-center space-x-2">
        {deleteRowsAction && table.getSelectedRowModel().rows.length > 0 ? (
          <Button
            aria-label="Delete selected rows"
            variant="outline"
            size="sm"
            className="h-10"
            onClick={(event) => {
              startTransition(() => {
                table.toggleAllPageRowsSelected(false);
                deleteRowsAction(event);
              });
            }}
            disabled={isPending}
          >
            <Trash className="mr-2 size-4" aria-hidden="true" />
            Delete
          </Button>
        ) : newRowLink ? (
          <Link aria-label="Create new row" href={newRowLink}>
            <div
              className={cn(
                buttonVariants({
                  variant: 'outline',
                  size: 'sm',
                  className: 'h-10',
                }),
              )}
            >
              <PlusCircle className="mr-2 size-4" aria-hidden="true" />
              New
            </div>
          </Link>
        ) : null}
        {/* <DataTableViewOptions table={table} /> */}
      </div>
    </div>
  );
}
