import { type Table } from '@tanstack/react-table';
import usePortal from 'react-useportal';

export function TasksTableFloatingBarContent<TData>(_table: Table<TData>) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const { Portal } = usePortal();

  return (
    <Portal>
      <div className="justify-between gap-2 align-middle">
        Nothing to see here!
        {/* <Select onValueChange={(value) => updateTasksStatus(table, value)}>
        <SelectTrigger asChild>
          <Button
            aria-label="Delete selected rows"
            title="Status"
            variant="ghost"
            size="icon"
            className="size-7 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          >
            <CheckCircledIcon className="size-4" aria-hidden="true" />
          </Button>
        </SelectTrigger>
        <SelectContent align="center">
          <SelectGroup>
            {tasks.status.enumValues.map((status) => (
              <SelectItem key={status} value={status} className="capitalize">
                {status}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select onValueChange={(value) => updateTasksPriority(table, value)}>
        <SelectTrigger asChild>
          <Button
            title="Priority"
            variant="ghost"
            size="icon"
            className="size-7 data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
          >
            <ArrowUpIcon className="size-4" aria-hidden="true" />
          </Button>
        </SelectTrigger>
        <SelectContent align="center">
          <SelectGroup>
            {tasks.priority.enumValues.map((priority) => (
              <SelectItem
                key={priority}
                value={priority}
                className="capitalize"
              >
                {priority}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button
        title="Delete"
        variant="ghost"
        size="icon"
        className="size-7"
        onClick={(event) => {
          table.toggleAllPageRowsSelected(false);
          deleteSelectedRows?.(table, event);
        }}
      >
        <TrashIcon className="size-4" aria-hidden="true" />
        <span className="sr-only">Delete</span>
      </Button> */}
      </div>
    </Portal>
  );
}
