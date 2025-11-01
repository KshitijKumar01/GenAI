'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Download, RefreshCw, FileText } from 'lucide-react';
import type { TestCase, Toolchain } from '@/lib/types';
import { JiraIcon, PolarionIcon, AzureDevopsIcon } from './compliance-icons';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const toolchains: Toolchain[] = [
  { id: 'jira', name: 'Jira', Icon: JiraIcon },
  { id: 'polarion', name: 'Polarion', Icon: PolarionIcon },
  { id: 'azure', name: 'Azure DevOps', Icon: AzureDevopsIcon },
];

interface Step4DashboardProps {
  testCases: TestCase[];
  onRestart: () => void;
}

export default function Step4Dashboard({ testCases, onRestart }: Step4DashboardProps) {
    const { toast } = useToast();

    const handleExport = (toolchainName: string) => {
        toast({
            title: `Exporting to ${toolchainName}`,
            description: "This is a placeholder. In a real app, this would trigger an API call.",
        });
    };
    
    const handleDownload = (format: string) => {
        toast({
            title: `Downloading as ${format}`,
            description: "This is a placeholder for file download functionality.",
        });
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
        <CardFooter>
            <Button onClick={onRestart} variant="outline">
                <RefreshCw />
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
                <Button key={tool.id} className="w-full justify-start" variant="outline" onClick={() => handleExport(tool.name)}>
                    <tool.Icon className="mr-2 h-5 w-5"/>
                    Export to {tool.name}
                </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-xl">Download Locally</CardTitle>
                <CardDescription>Download test cases in various formats.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline" onClick={() => handleDownload('CSV')}>
                    <FileText />
                    Download as .csv
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => handleDownload('JSON')}>
                    <FileText />
                    Download as .json
                </Button>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
