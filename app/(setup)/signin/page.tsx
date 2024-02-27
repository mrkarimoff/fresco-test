import { containerClasses } from '../_components/schemas';
import SignInForm from '../_components/SignInForm';
import { cn } from '~/utils/shadcn';

export const metadata = {
  title: 'Fresco - Sign In',
  description: 'Sign in to Fresco.',
};

export default function Page() {
  return (
    <div className={cn(containerClasses, 'w-[25rem]')}>
      <h1 className="mb-6 text-2xl font-bold">Sign In To Fresco</h1>
      <SignInForm />
    </div>
  );
}
