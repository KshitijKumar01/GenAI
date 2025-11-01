'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from './loading-spinner';
import { Sparkles, Check, ChevronRight } from 'lucide-react';
import type { TestCase } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Step3GenerateProps {
  testCases: TestCase[];
  onRefine: (feedback: string) => void;
  onProceed: () => void;
  isLoading: boolean;
}

export default function Step3Generate({ testCases, onRefine, onProceed, isLoading }: Step3GenerateProps) {
  const [feedback, setFeedback] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);

  const handleRefine = () => {
    if (feedback.trim()) {
      onRefine(feedback);
      setFeedback('');
      setShowFeedback(false);
    }
  };
  
  const handleTriggerFeedback = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowFeedback(true);
  };

  return (
    <Card className="w-full animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">Generated Test Cases</CardTitle>
        <CardDescription>
          Review the AI-generated test cases below. You can provide feedback to refine them or proceed to the next step.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[50vh] rounded-md border bg-muted/30">
           <Accordion type="single" collapsible className="w-full" defaultValue="item-0">
            {testCases.map((tc, index) => (
              <AccordionItem value={`item-${index}`} key={tc.id}>
                <AccordionTrigger className="px-4 font-headline text-base hover:no-underline">
                   <span className="truncate">{tc.id}: {tc.title}</span>
                </AccordionTrigger>
                <AccordionContent className="px-4">
                  <pre className="whitespace-pre-wrap p-4 font-code text-sm bg-background rounded-md">{tc.content}</pre>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </ScrollArea>

        {showFeedback && (
            <div className="mt-6 space-y-4 animate-in fade-in-20">
                 <Label htmlFor="refine-feedback" className="font-headline text-lg">Refinement Feedback</Label>
                 <Textarea
                    id="refine-feedback"
                    placeholder="e.g., 'Test Case TC-3 needs to explicitly check for GDPR consent logs.' or 'Add a test case for invalid password formats.'"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="h-28"
                    disabled={isLoading}
                />
            </div>
        )}

      </CardContent>
      <CardFooter className="flex justify-end gap-4">
        {showFeedback ? (
            <>
                <Button onClick={() => setShowFeedback(false)} variant="ghost" disabled={isLoading}>Cancel</Button>
                <Button onClick={handleRefine} variant="outline" disabled={isLoading || !feedback.trim()}>
                    {isLoading && feedback ? <LoadingSpinner /> : <Sparkles />}
                    Regenerate with Feedback
                </Button>
            </>
        ) : (
            <>
                 <Button onClick={handleTriggerFeedback} variant="outline" disabled={isLoading}>
                    <Sparkles />
                    Provide Feedback
                 </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button disabled={isLoading} className="bg-green-700 hover:bg-green-800">
                      Looks Good, Proceed
                      <ChevronRight />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Proceed to Compliance Check?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Our AI will analyze the generated test cases for compliance with standards like FDA, GDPR, and ISO.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={onProceed} className="bg-green-700 hover:bg-green-800">
                        <Check />
                        Yes, Proceed
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
            </>
        )}
      </CardFooter>
    </Card>
  );
}
