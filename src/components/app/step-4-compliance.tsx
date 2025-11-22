'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from './loading-spinner';
import { Sparkles, Check, AlertTriangle } from 'lucide-react';
import { FdaIcon, IecIcon, IsoIcon, GdprIcon } from './compliance-icons';
import type { TestCase, ComplianceStandard, ComplianceIssue } from '@/lib/types';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const complianceStandards: ComplianceStandard[] = [
  { id: 'fda', name: 'FDA', Icon: FdaIcon },
  { id: 'iec', name: 'IEC 62304', Icon: IecIcon },
  { id: 'iso', name: 'ISO 13485', Icon: IsoIcon },
  { id: 'gdpr', name: 'GDPR', Icon: GdprIcon },
];

interface Step4ComplianceProps {
  testCases: TestCase[];
  issues: ComplianceIssue[];
  onRefine: (feedback: string) => void;
  onApprove: () => void;
  isLoading: boolean;
}

export default function Step4Compliance({ testCases, issues, onRefine, onApprove, isLoading }: Step4ComplianceProps) {
  const [feedback, setFeedback] = useState('');

  const handleRefine = () => {
    if (isLoading) return;
    let combinedFeedback = feedback;
    if (issues.length > 0) {
      const issueSummary = issues.map(i => `For ${i.testCaseId} (${i.standardId}): ${i.reason}`).join('; ');
      combinedFeedback = `The following compliance issues were found: ${issueSummary}. Please address these. Additional user feedback: ${feedback}`;
    }
    onRefine(combinedFeedback);
    setFeedback('');
  };

  const getStandardIcon = (standardId: string) => {
    const standard = complianceStandards.find(s => s.id.toLowerCase() === standardId.toLowerCase());
    return standard ? <standard.Icon className="h-4 w-4" /> : null;
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-in fade-in-50 duration-500">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Compliance Analysis</CardTitle>
          <CardDescription>
            The AI has analyzed your test cases for compliance issues. Failed checks are highlighted below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[60vh] rounded-md border bg-muted/30">
             <Accordion type="multiple" className="w-full" defaultValue={issues.map((issue, index) => `item-${testCases.findIndex(tc => tc.id === issue.testCaseId)}`)}>
              {testCases.map((tc, index) => {
                const tcIssues = issues.filter(i => i.testCaseId.toLowerCase() === tc.id.toLowerCase());
                const hasIssues = tcIssues.length > 0;
                return (
                    <AccordionItem value={`item-${index}`} key={tc.id}>
                        <AccordionTrigger className={`px-4 font-headline text-base hover:no-underline ${hasIssues ? 'bg-destructive/10 text-destructive' : ''}`}>
                            <div className="flex items-center gap-2">
                                {hasIssues && <AlertTriangle className="h-5 w-5" />}
                                <span className="truncate">{tc.id}: {tc.title}</span>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                            <pre className="whitespace-pre-wrap p-4 font-code text-sm bg-background rounded-md mb-4">{tc.content}</pre>
                            {hasIssues && (
                                <div className="space-y-2 rounded-md border border-destructive/50 bg-destructive/5 p-3">
                                    <h4 className="font-semibold text-destructive">Compliance Issues:</h4>
                                    <ul className="list-disc pl-5 space-y-1 text-sm">
                                        {tcIssues.map((issue, issueIdx) => (
                                            <li key={issueIdx} className="flex items-start gap-2">
                                                <Badge variant="destructive" className="mt-0.5 gap-1.5 whitespace-nowrap">
                                                    {getStandardIcon(issue.standardId)}
                                                    {issue.standardId.toUpperCase()}
                                                </Badge>
                                                <span>{issue.reason}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                );
              })}
            </Accordion>
          </ScrollArea>
        </CardContent>
      </Card>
      
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Resolve Issues</CardTitle>
            <CardDescription>
                {issues.length > 0
                ? "Provide feedback to fix the compliance issues, or approve them if you're satisfied."
                : "No compliance issues found! You can provide more feedback or approve and finalize."}
            </CardDescription>
          </CardHeader>
          <CardContent>
              <Textarea
                  id="refine-feedback"
                  placeholder="e.g., 'For TC-3, ensure the audit trail is explicitly mentioned as a verification step.' (The AI will automatically use the issues found as context)."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="h-32"
                  disabled={isLoading}
              />
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
              <Button onClick={handleRefine} variant="outline" disabled={isLoading || (!feedback.trim() && issues.length === 0)}>
                  {isLoading ? <LoadingSpinner /> : <Sparkles />}
                  Refine Test Cases
              </Button>
              <Button onClick={onApprove} disabled={isLoading} className="bg-green-700 hover:bg-green-800">
                  <Check />
                  Approve
              </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
