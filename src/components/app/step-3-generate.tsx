'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from './loading-spinner';
import { Sparkles, Check, CheckCircle, XCircle } from 'lucide-react';
import { FdaIcon, IecIcon, IsoIcon, GdprIcon } from './compliance-icons';
import type { TestCase, ComplianceStandard, ComplianceResult } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const complianceStandards: ComplianceStandard[] = [
  { id: 'fda', name: 'FDA', Icon: FdaIcon },
  { id: 'iec', name: 'IEC 62304', Icon: IecIcon },
  { id: 'iso', name: 'ISO 13485', Icon: IsoIcon },
  { id: 'gdpr', name: 'GDPR', Icon: GdprIcon },
];

function generateMockCompliance(testCases: TestCase[]): ComplianceResult[] {
  const results: ComplianceResult[] = [];
  testCases.forEach(tc => {
    complianceStandards.forEach(standard => {
      // Create some "failures" to make the UI more interesting
      const shouldFail = tc.id.includes('3') && (standard.id === 'fda' || standard.id === 'gdpr');
      results.push({
        testCaseId: tc.id,
        standardId: standard.id,
        status: shouldFail ? 'failed' : 'passed',
      });
    });
  });
  return results;
}

interface Step3GenerateProps {
  testCases: TestCase[];
  onRefine: (feedback: string) => void;
  onApprove: () => void;
  isLoading: boolean;
}

export default function Step3Generate({ testCases, onRefine, onApprove, isLoading }: Step3GenerateProps) {
  const [feedback, setFeedback] = useState('');
  const [complianceResults, setComplianceResults] = useState<ComplianceResult[]>([]);

  useEffect(() => {
    // We use useEffect to avoid hydration errors from Math.random in generateMockCompliance
    if (testCases.length > 0) {
      setComplianceResults(generateMockCompliance(testCases));
    }
  }, [testCases]);

  const handleRefine = () => {
    if (feedback.trim()) {
      onRefine(feedback);
      setFeedback(''); // Clear feedback after submission
    }
  };

  const failedChecks = useMemo(() => complianceResults.filter(r => r.status === 'failed'), [complianceResults]);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-in fade-in-50 duration-500">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Generated Test Cases</CardTitle>
          <CardDescription>
            AI-generated test cases are ready for review. Check the compliance validation results on the right.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] rounded-md border bg-muted/30">
             <Accordion type="single" collapsible className="w-full">
              {testCases.map((tc, index) => (
                <AccordionItem value={`item-${index}`} key={tc.id}>
                  <AccordionTrigger className="px-4 font-headline text-base hover:no-underline">
                     <span className="truncate">{tc.id}: {tc.content.split('\\n')[0].split('. ')[1] || 'Test Case'}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4">
                    <pre className="whitespace-pre-wrap p-4 font-code text-sm bg-background rounded-md">{tc.content}</pre>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Compliance Engine</CardTitle>
            <CardDescription>Automated validation results.</CardDescription>
          </CardHeader>
          <CardContent>
            {failedChecks.length > 0 && (
              <div className="mb-4 rounded-md border border-destructive/50 bg-destructive/10 p-3">
                  <h4 className="font-semibold text-destructive">
                    {failedChecks.length} Compliance Isssue{failedChecks.length > 1 ? 's' : ''} Found
                  </h4>
                  <p className="text-sm text-destructive/80">
                    Review and provide feedback to refine.
                  </p>
              </div>
            )}
             <div className="space-y-3">
              {complianceStandards.map(standard => {
                const resultsForStandard = complianceResults.filter(r => r.standardId === standard.id);
                const hasFailure = resultsForStandard.some(r => r.status === 'failed');
                return (
                  <div key={standard.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <standard.Icon className="h-5 w-5 text-muted-foreground" />
                      <span className="font-medium">{standard.name}</span>
                    </div>
                    {hasFailure ? (
                      <Badge variant="destructive">Failed</Badge>
                    ) : (
                       <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">Passed</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Refine Results</CardTitle>
                <CardDescription>Provide feedback to improve the test cases and resolve compliance issues.</CardDescription>
            </CardHeader>
            <CardContent>
                <Textarea
                    id="refine-feedback"
                    placeholder="e.g., 'Test Case TC-3 needs to explicitly check for GDPR consent logs.' or 'Add a test case for invalid password formats.'"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="h-24"
                    disabled={isLoading}
                />
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-4">
                <Button onClick={handleRefine} variant="outline" disabled={isLoading || !feedback.trim()}>
                    {isLoading && feedback ? <LoadingSpinner /> : <Sparkles />}
                    Refine with Feedback
                </Button>
                <Button onClick={onApprove} disabled={isLoading} className="bg-green-700 hover:bg-green-800">
                    {isLoading && !feedback ? <LoadingSpinner /> : <Check />}
                    Approve and Finalize
                </Button>
            </CardFooter>
        </Card>
      </div>
    </div>
  );
}
