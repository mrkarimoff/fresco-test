'use client';

import { type Dispatch, type SetStateAction, useState, useEffect } from 'react';
import { z } from 'zod';
import { Button } from '~/components/ui/Button';
import { Input } from '~/components/ui/Input';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog';
import useZodForm from '~/hooks/useZodForm';
import ActionError from '~/components/ActionError';
import { api } from '~/trpc/client';
import {
  participantIdentifierSchema,
  participantLabelSchema,
} from '~/shared/schemas/schemas';
import type { Participant } from '@prisma/client';
import { useRouter } from 'next/navigation';
import InfoTooltip from '~/components/InfoTooltip';
import { HelpCircle } from 'lucide-react';
import Heading from '~/components/ui/typography/Heading';
import Paragraph from '~/components/ui/typography/Paragraph';
import { createId } from '@paralleldrive/cuid2';

type ParticipantModalProps = {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  editingParticipant?: Participant | null;
  setEditingParticipant?: Dispatch<SetStateAction<Participant | null>>;
  existingParticipants: Participant[];
};

function ParticipantModal({
  open,
  setOpen,
  editingParticipant,
  setEditingParticipant,
  existingParticipants,
}: ParticipantModalProps) {
  const [error, setError] = useState<string | null>(null);
  const utils = api.useUtils();

  const formSchema = z
    .object({
      identifier: participantIdentifierSchema,
      label: participantLabelSchema,
    })
    .refine(
      (data) =>
        !existingParticipants?.find((p) => p.identifier === data.identifier),
      {
        path: ['identifier'],
        message: 'This identifier is already in use.',
      },
    );

  type ValidationSchema = z.infer<typeof formSchema>;

  const { mutateAsync: updateParticipant } = api.participant.update.useMutation(
    {
      async onMutate({ identifier, data }) {
        await utils.participant.get.all.cancel();

        // snapshot current participants
        const previousValue = utils.participant.get.all.getData();

        // Optimistically update to the new value
        const newValue = previousValue?.map((p) =>
          p.identifier === identifier ? { ...p, ...data } : p,
        );

        utils.participant.get.all.setData(undefined, newValue);

        setOpen(false);

        return { previousValue };
      },
      onSuccess() {
        router.refresh();
      },
      onError(error, _, context) {
        utils.participant.get.all.setData(undefined, context?.previousValue);
        setError(error.message);
      },
      async onSettled() {
        await utils.participant.get.all.invalidate();
      },
    },
  );

  const router = useRouter();

  const { mutateAsync: createParticipant } = api.participant.create.useMutation(
    {
      async onMutate(participantsData) {
        const participants = participantsData.map((p) => ({
          ...p,
          label: p.label ?? null,
        }));
        await utils.participant.get.all.cancel();

        // snapshot current participants
        const previousValue = utils.participant.get.all.getData();

        const newParticipants = participants.map((p, index) => ({
          id: `optimistic-${index}`,
          identifier: p.identifier ?? createId(),
          label: p.label,
          interviews: [],
          _count: {
            interviews: 0,
          },
        }));

        const newValue = previousValue
          ? [...newParticipants, ...previousValue]
          : newParticipants;

        // Optimistically update to the new value
        utils.participant.get.all.setData(undefined, newValue);

        setOpen(false);
        reset();
        return { previousValue };
      },
      onError(error, _, context) {
        utils.participant.get.all.setData(undefined, context?.previousValue);
        setError(error.message);
      },
      async onSettled() {
        await utils.participant.get.all.invalidate();
      },
      onSuccess() {
        router.refresh();
      },
    },
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useZodForm({
    schema: formSchema,
    shouldUnregister: true,
  });

  const onSubmit = async (data: ValidationSchema) => {
    setError(null);

    if (editingParticipant) {
      await updateParticipant({
        identifier: editingParticipant.identifier,
        data,
      });
    }

    if (!editingParticipant) {
      await createParticipant([data]);
    }
  };

  useEffect(() => {
    if (editingParticipant) {
      setValue('identifier', editingParticipant.identifier);
      setValue('label', editingParticipant.label ?? '');
    }
  }, [editingParticipant, setValue]);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setEditingParticipant?.(null);
      setError(null);
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingParticipant ? 'Edit Participant' : 'Add Participant'}
          </DialogTitle>
        </DialogHeader>
        {error && (
          <div className="mb-6 flex flex-wrap">
            <ActionError errorTitle="Error" errorDescription={error} />
          </div>
        )}
        <form
          id="participant-form"
          // eslint-disable-next-line @typescript-eslint/no-misused-promises
          onSubmit={handleSubmit(async (data) => await onSubmit(data))}
          className="flex flex-col gap-2"
        >
          <Input
            {...register('identifier')}
            label="Participant Identifier"
            required
            autoFocus
            hint={
              <>
                This could be a study ID, a number, or any other unique
                identifier. It should be unique for each participant, and should
                not be easy to guess{' '}
                <InfoTooltip
                  trigger={<HelpCircle className="h-4 w-4" />}
                  content={
                    <>
                      <Heading variant="h4-all-caps">
                        Participant Identifiers
                      </Heading>
                      <Paragraph>
                        Participant identifiers are used by Fresco to onboard
                        participants. They might be exposed to the participant
                        during this process via the participation URL, and so
                        must <strong>not</strong> contain any sensitive
                        information, and must not be easy for other participants
                        to guess (e.g. sequential numbers, or easily guessable
                        strings).
                      </Paragraph>
                    </>
                  }
                />
                .
              </>
            }
            placeholder="Enter an identifier..."
            error={errors.identifier?.message}
            // Add an adornment to the right to allow automatically generating an ID
            inputClassName="pr-28"
            rightAdornment={
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={() => {
                  setValue('identifier', `p-${createId()}`);
                }}
              >
                Generate
              </Button>
            }
          />
          <Input
            {...register('label')}
            label="Label"
            hint="This optional field allows you to provide a human readable label. This could be a name, or an internal project label for this participant. It does not need to be unique, and will not be exposed to participants."
            placeholder="Enter optional label..."
            error={errors.label?.message}
          />
        </form>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button form="participant-form" type="submit">
            {editingParticipant ? 'Update' : 'Submit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default ParticipantModal;
