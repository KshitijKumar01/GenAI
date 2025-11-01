'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LoadingSpinner } from './loading-spinner';
import { Sparkles, Check } from 'lucide-react';

interface Step2ParseProps {
  parsedContent: string;
  onReparse: (feedback: string) => void;
  onProceed: () => void;
  isLoading: boolean;
}

export default function Step2Parse({ parsedContent, onReparse, onProceed, isLoading }: Step2ParseProps) {
  const [feedback, setFeedback] = useState('');

  const handleReparse = () => {
    if (feedback.trim()) {
      onReparse(feedback);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 animate-in fade-in-50 duration-500">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Parsed Requirements</CardTitle>
          <CardDescription>
            Our AI has parsed your document. Please review the content below for accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96 rounded-md border bg-muted/30">
            <pre className="whitespace-pre-wrap p-4 font-code text-sm">{parsedContent}</pre>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Review & Refine</CardTitle>
          <CardDescription>
            If the parsed content isn't quite right, provide feedback below and our AI will re-parse it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="feedback">Feedback for AI Parser</Label>
              <Textarea
                id="feedback"
                placeholder="e.g., 'The section on user authentication was missed.' or 'Focus more on the data privacy requirements.'"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="h-32"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-4 md:flex-row md:justify-end">
            <Button onClick={handleReparse} variant="outline" disabled={isLoading || !feedback.trim()}>
              {isLoading && feedback.trim() ? <LoadingSpinner /> : <Sparkles />}
              Re-Parse with Feedback
            </Button>
            <Button onClick={onProceed} disabled={isLoading} className="bg-green-700 hover:bg-green-800">
              {isLoading && !feedback.trim() ? <LoadingSpinner /> : <Check />}
              Looks Good, Proceed
            </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
