'use client';

import { useMemo, useState } from 'react';
import { ActionsDropdown } from '~/app/(dashboard)/dashboard/_components/InterviewsTable/ActionsDropdown';
import { InterviewColumns } from '~/app/(dashboard)/dashboard/_components/InterviewsTable/Columns';
import { DataTable } from '~/components/DataTable/DataTable';
import { Button } from '~/components/ui/Button';
import { api } from '~/trpc/client';
import { DeleteInterviewsDialog } from '~/app/(dashboard)/dashboard/interviews/_components/DeleteInterviewsDialog';
import { ExportInterviewsDialog } from '~/app/(dashboard)/dashboard/interviews/_components/ExportInterviewsDialog';
import type { RouterOutputs } from '~/trpc/shared';
import { HardDriveUpload } from 'lucide-react';
import { GenerateInterviewURLs } from '~/app/(dashboard)/dashboard/interviews/_components/ExportInterviewUrlSection';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';

type Interviews = RouterOutputs['interview']['get']['all'];

export const InterviewsTable = ({
  initialInterviews,
}: {
  initialInterviews: Interviews;
}) => {
  const { data: interviews } = api.interview.get.all.useQuery(undefined, {
    initialData: initialInterviews,
    refetchOnMount: false,
    onError(error) {
      throw new Error(error.message);
    },
  });

  const [selectedInterviews, setSelectedInterviews] = useState<Interviews>();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  const unexportedInterviews = useMemo(
    () => interviews.filter((interview) => !interview.exportTime),
    [interviews],
  );

  const handleDelete = (data: Interviews) => {
    setSelectedInterviews(data);
    setShowDeleteModal(true);
  };

  const handleExportUnexported = () => {
    setSelectedInterviews(unexportedInterviews);
    setShowExportModal(true);
  };

  const handleExportAll = () => {
    setSelectedInterviews(interviews);
    setShowExportModal(true);
  };

  const handleResetExport = () => {
    setSelectedInterviews([]);
    setShowExportModal(false);
  };

  return (
    <>
      <ExportInterviewsDialog
        key={selectedInterviews?.toString()}
        open={showExportModal}
        handleCancel={handleResetExport}
        interviewsToExport={selectedInterviews!}
      />
      <DeleteInterviewsDialog
        open={showDeleteModal}
        setOpen={setShowDeleteModal}
        interviewsToDelete={selectedInterviews ?? []}
      />
      <DataTable
        columns={InterviewColumns()}
        data={interviews}
        filterColumnAccessorKey="identifier"
        handleDeleteSelected={handleDelete}
        handleExportSelected={(selected) => {
          setSelectedInterviews(selected);
          setShowExportModal(true);
        }}
        actions={ActionsDropdown}
        headerItems={
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>
                  <HardDriveUpload className="mr-2 inline-block h-4 w-4" />
                  Export Interview Data
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportAll}>
                  Export all interviews
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={unexportedInterviews.length === 0}
                  onClick={handleExportUnexported}
                >
                  Export all unexported interviews
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <GenerateInterviewURLs />
          </>
        }
      />
    </>
  );
};
