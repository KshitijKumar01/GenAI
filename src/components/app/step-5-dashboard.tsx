'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RefreshCw, FileText } from 'lucide-react';
import type { TestCase, Toolchain } from '@/lib/types';
import { JiraIcon, PolarionIcon, AzureDevopsIcon } from './compliance-icons';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import type { exportToJiraAction } from '@/lib/actions';
import { LoadingSpinner } from './loading-spinner';

const toolchains: Toolchain[] = [
  { id: 'jira', name: 'Jira', Icon: JiraIcon },
  { id: 'polarion', name: 'Polarion', Icon: PolarionIcon },
  { id: 'azure', name: 'Azure DevOps', Icon: AzureDevopsIcon },
];

interface Step5DashboardProps {
  testCases: TestCase[];
  onRestart: () => void;
  exportToJiraAction: typeof exportToJiraAction;
}

const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
};

export default function Step5Dashboard({ testCases, onRestart, exportToJiraAction }: Step5DashboardProps) {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (toolchainName: string) => {
        if (toolchainName !== 'Jira') {
            toast({
                title: `Export to ${toolchainName} not implemented`,
                description: "Only Jira export is available in this demo.",
                variant: 'destructive'
            });
            return;
        }

        setIsExporting(true);
        const result = await exportToJiraAction({ testCases });
        setIsExporting(false);

        if (result.error) {
            toast({
                variant: 'destructive',
                title: 'Jira Export Failed',
                description: result.error,
            });
        } else if (result.createdIssues) {
            toast({
                title: 'Export to Jira Successful!',
                description: `${result.createdIssues.length} issue(s) created. Check the browser console for details.`,
            });
            console.log('Created Jira Issues:', result.createdIssues);
        }
    };

    const handleDownloadCSV = () => {
        const headers = ['id', 'title', 'content'];
        const csvRows = [
            headers.join(','),
            ...testCases.map(tc => {
                const values = [tc.id, `"${tc.title.replace(/"/g, '""')}"`, `"${tc.content.replace(/"/g, '""')}"`];
                return values.join(',');
            })
        ];
        downloadFile(csvRows.join('\n'), 'test-cases.csv', 'text/csv');
        toast({ title: 'Success', description: 'Test cases downloaded as CSV.'});
    };

    const handleDownloadJSON = () => {
        const jsonContent = JSON.stringify(testCases, null, 2);
        downloadFile(jsonContent, 'test-cases.json', 'application/json');
        toast({ title: 'Success', description: 'Test cases downloaded as JSON.'});
    };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 animate-in fade-in-50 duration-500">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Finalized Test Cases</CardTitle>
          <CardDescription>
            The following test cases have been generated, refined, and approved. They are ready for export.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <ScrollArea className="h-[60vh] rounded-md border bg-muted/30">
            <Accordion type="single" collapsible className="w-full">
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
        </CardContent>
        <CardFooter>
            <Button onClick={onRestart} variant="outline">
                <RefreshCw className="mr-2" />
                Start New Session
            </Button>
        </CardFooter>
      </Card>
      
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Toolchain Integration</CardTitle>
            <CardDescription>Export test cases directly to your ALM platform.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {toolchains.map(tool => (
                <Button key={tool.id} className="w-full justify-start" variant="outline" onClick={() => handleExport(tool.name)} disabled={isExporting}>
                    {isExporting && tool.name === 'Jira' ? <LoadingSpinner className="mr-2"/> : <tool.Icon className="mr-2 h-5 w-5"/>}
                    Export to {tool.name}
                </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Download Locally</CardTitle>
                <CardDescription>Download test cases in various formats.</CardDescription>
            </Header>
            <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={handleDownloadCSV}>
                    <FileText className="mr-2" />
                    Download as .csv
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={handleDownloadJSON}>
                    <FileText className="mr-2" />
                    Download as .json
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
