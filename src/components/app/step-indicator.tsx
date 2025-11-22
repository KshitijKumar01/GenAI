import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  steps: { id: string; name: string }[];
  currentStepIndex: number;
  onStepClick?: (stepIndex: number) => void;
}

export default function StepIndicator({ steps, currentStepIndex, onStepClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress">
      <ol role="list" className="flex items-center">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStepIndex;
          const isCurrent = stepIdx === currentStepIndex;
          const isClickable = onStepClick && (isCompleted || isCurrent);

          const StepWrapper = ({ children }: { children: React.ReactNode }) => 
            isClickable ? (
              <button 
                onClick={() => onStepClick(stepIdx)} 
                className="group relative"
                disabled={!isClickable}
              >
                {children}
              </button>
            ) : (
              <div className="relative">{children}</div>
            );

          return (
            <li
              key={step.name}
              className={cn('relative', stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : '', isClickable ? 'cursor-pointer' : 'cursor-default')}
            >
              <StepWrapper>
                {isCompleted ? (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-primary" />
                    </div>
                    <div
                      className="relative flex h-8 w-8 items-center justify-center rounded-full bg-primary transition-transform group-hover:scale-110"
                    >
                      <Check className="h-5 w-5 text-primary-foreground" aria-hidden="true" />
                    </div>
                  </>
                ) : isCurrent ? (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-border" />
                    </div>
                    <div
                      className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background transition-transform group-hover:scale-110"
                      aria-current="step"
                    >
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" aria-hidden="true" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="h-0.5 w-full bg-border" />
                    </div>
                    <div
                      className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-border bg-background"
                    >
                       <span className="h-2.5 w-2.5 rounded-full bg-transparent" aria-hidden="true" />
                    </div>
                  </>
                )}
                 <p className={cn("absolute -bottom-7 w-max font-semibold text-sm text-center -translate-x-1/2 left-1/2",
                    isCompleted || isCurrent ? "text-foreground" : "text-muted-foreground"
                 )}>
                    {step.name}
                 </p>
               </StepWrapper>
            </li>
          )
        })}
      </ol>
    </nav>
  );
}
