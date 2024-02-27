'use client';

import { getBaseUrl } from '~/trpc/shared';
import { useToast } from '~/components/ui/use-toast';
import { Check, Copy } from 'lucide-react';
import { Button } from '~/components/ui/Button';

export const AnonymousRecruitmentURLButton = ({
  protocolId,
}: {
  protocolId: string;
}) => {
  const { toast } = useToast();
  const url = `${getBaseUrl()}/onboard/${protocolId}`;
  const handleCopyClick = () => {
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast({
          title: 'Success!',
          description: 'URL copied to clipboard',
          variant: 'success',
          icon: <Check />,
        });
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error('Could not copy text: ', error);
        toast({
          title: 'Error',
          description: 'Could not copy text',
          variant: 'destructive',
        });
      });
  };

  return (
    <Button size="xs" onClick={handleCopyClick} variant="accent">
      <Copy className="mr-2 h-4 w-4" />
      <span className="w-36 truncate">{url}</span>
    </Button>
  );
};
