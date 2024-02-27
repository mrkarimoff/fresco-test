import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import Button from '~/lib/ui/components/Button';
import { actionCreators as dialogActions } from '~/lib/interviewer/ducks/modules/dialogs';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '~/trpc/client';
import { clientRevalidateTag } from '~/utils/clientRevalidate';
import Loading from '~/lib/interviewer/components/Loading';

const FinishSession = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const interviewId = pathname.split('/').pop();

  const { mutateAsync: finishInterview } = api.interview.finish.useMutation({
    onError(error) {
      setLoading(false);
      throw new Error(error.message);
    },
    async onSuccess() {
      await clientRevalidateTag('interview.get.byId');
      router.push('/interview/finished');
    },
  });

  const handleConfirmFinishInterview = async () => {
    if (!interviewId) {
      setLoading(false);
      throw new Error('No interview id found');
    }
    await finishInterview({ id: interviewId });
  };

  const openDialog = useCallback(
    (dialog) => dispatch(dialogActions.openDialog(dialog)),
    [dispatch],
  );

  useEffect(() => {
    dispatch({ type: 'PLAY_SOUND', sound: 'finishSession' });
  }, [dispatch]);

  const finishInterviewConfirmation = () => {
    openDialog({
      type: 'Confirm',
      title: 'Are you sure you want to finish the interview?',
      message: (
        <p>Your responses cannot be changed after you finish the interview.</p>
      ),
      confirmLabel: 'Finish Interview',
      canCancel: true,
      onConfirm: async () => {
        setLoading(true);
        await handleConfirmFinishInterview();
      },
    });
  };

  if (loading) {
    return <Loading message="Finishing interview..." />;
  }

  return (
    <div className="interface finish-session-interface">
      <div className="finish-session-interface__frame">
        <h1 className="finish-session-interface__title type--title-1">
          Finish Interview
        </h1>
        <div className="finish-session-interface__section finish-session-interface__section--instructions">
          <p>
            You have reached the end of the interview. If you are satisfied with
            the information you have entered, you may finish the interview now.
          </p>
        </div>

        <div className="finish-session-interface__section finish-session-interface__section--buttons">
          <Button onClick={finishInterviewConfirmation}>Finish</Button>
        </div>
      </div>
    </div>
  );
};

export default FinishSession;
