import { resetAppSettings } from '~/app/_actions';
import SubmitButton from '~/components/ui/SubmitButton';

const ResetButton = () => {
  return (
    <form action={resetAppSettings}>
      <SubmitButton type="submit" variant="destructive">
        Reset all app data
      </SubmitButton>
    </form>
  );
};

export default ResetButton;
