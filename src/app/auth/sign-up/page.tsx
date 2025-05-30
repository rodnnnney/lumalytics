import { SignUpForm } from '@/components/sign-up-form';
import { LoginForm } from '@/components/login-form';
import { HeroHeader } from '@/components/blocks/hero-section-1';

export default function Page() {
  return (
    <>
      <HeroHeader />
      <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
          <div className="mb-6"></div>
          <SignUpForm />
        </div>
      </div>
    </>
  );
}
