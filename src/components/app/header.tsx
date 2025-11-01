import { ShieldCheck } from 'lucide-react';

export const AppHeader = () => {
  return (
    <header className="flex h-16 items-center border-b bg-card px-4 md:px-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-7 w-7 text-primary" />
        <h1 className="font-headline text-2xl font-semibold tracking-tight text-foreground">
          ComplianceAce
        </h1>
      </div>
    </header>
  );
};
