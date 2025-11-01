"use client";

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/app/header';
import StepIndicator from '@/components/app/step-indicator';
import Step1Upload from '@/components/app/step-1-upload';
import Step2Parse from '@/components/app/step-2-parse';
import Step3Generate from '@/components/app/step-3-generate';
import Step4Dashboard from '@/components/app/step-4-dashboard';
import { parseDocumentAction, generateTestCasesAction, refineTestCasesAction } from '@/lib/actions';
import type { TestCase } from '@/lib/types';

type AppStep = 'upload' | 'parse' | 'generate' | 'dashboard';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string>('');
  const [parsedContent, setParsedContent] = useState('');
  const [initialTestCases, setInitialTestCases] = useState<TestCase[]>([]);
  const [refinedTestCases, setRefinedTestCases] = useState<TestCase[] | null>(null);

  const handleFileSelect = (selectedFile: File, dataUri: string) => {
    setFile(selectedFile);
    setFileDataUri(dataUri);
  };

  const handleUpload = async () => {
    if (!fileDataUri) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please select a file first.' });
      return;
    }
    setIsLoading(true);
    const result = await parseDocumentAction({ documentDataUri: fileDataUri });
    if (result.error) {
      toast({ variant: 'destructive', title: 'Parsing Error', description: result.error });
    } else if (result.parsedContent) {
      setParsedContent(result.parsedContent);
      setCurrentStep('parse');
    }
    setIsLoading(false);
  };

  const handleReparse = async (feedback: string) => {
    setIsLoading(true);
    const result = await parseDocumentAction({ documentDataUri: fileDataUri, userFeedback: feedback });
    if (result.error) {
      toast({ variant: 'destructive', title: 'Re-parsing Error', description: result.error });
    } else if (result.parsedContent) {
      setParsedContent(result.parsedContent);
      toast({ title: 'Success', description: 'Document re-parsed with your feedback.' });
    }
    setIsLoading(false);
  };

  const parseTestCases = (text: string): TestCase[] => {
    if (!text) return [];
    // Split by lines that start with a number followed by a period.
    const caseBlocks = text.split(/(?=\d+\.\s)/).filter(block => block.trim() !== '');
    return caseBlocks.map((block, index) => ({
      id: `TC-${index + 1}`,
      content: block.trim(),
    }));
  };
  
  const handleGenerateTestCases = async () => {
    setIsLoading(true);
    const result = await generateTestCasesAction({ parsedRequirements: parsedContent });
    if (result.error) {
      toast({ variant: 'destructive', title: 'Generation Error', description: result.error });
    } else if (result.testCases) {
      setInitialTestCases(parseTestCases(result.testCases));
      setRefinedTestCases(null); // Reset refined cases
      setCurrentStep('generate');
    }
    setIsLoading(false);
  };

  const handleRefineTestCases = async (feedback: string) => {
    setIsLoading(true);
    const currentTestCasesText = (refinedTestCases ?? initialTestCases).map(tc => tc.content).join('\n\n');
    const result = await refineTestCasesAction({ 
      initialTestCases: currentTestCasesText, 
      feedback, 
      parsedRequirements: parsedContent 
    });
    if (result.error) {
      toast({ variant: 'destructive', title: 'Refinement Error', description: result.error });
    } else if (result.refinedTestCases) {
      setRefinedTestCases(parseTestCases(result.refinedTestCases));
      toast({ title: 'Success', description: 'Test cases refined with your feedback.' });
    }
    setIsLoading(false);
  };

  const handleApproveTestCases = () => {
    setCurrentStep('dashboard');
  };

  const handleRestart = () => {
    setFile(null);
    setFileDataUri('');
    setParsedContent('');
    setInitialTestCases([]);
    setRefinedTestCases(null);
    setCurrentStep('upload');
  }

  const steps: { id: AppStep; name: string }[] = [
    { id: 'upload', name: 'Upload Document' },
    { id: 'parse', name: 'Review Parsed Content' },
    { id: 'generate', name: 'Generate & Refine Cases' },
    { id: 'dashboard', name: 'Export & Finish' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex min-h-screen w-full flex-col">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center gap-8 p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <StepIndicator steps={steps} currentStepIndex={currentStepIndex} />
        </div>
        <div className="w-full max-w-6xl flex-1">
          {currentStep === 'upload' && (
            <Step1Upload
              onFileSelect={handleFileSelect}
              onUpload={handleUpload}
              isLoading={isLoading}
              selectedFile={file}
            />
          )}
          {currentStep === 'parse' && (
            <Step2Parse
              parsedContent={parsedContent}
              onReparse={handleReparse}
              onProceed={handleGenerateTestCases}
              isLoading={isLoading}
            />
          )}
          {currentStep === 'generate' && (
            <Step3Generate
              testCases={refinedTestCases ?? initialTestCases}
              onRefine={handleRefineTestCases}
              onApprove={handleApproveTestCases}
              isLoading={isLoading}
            />
          )}
          {currentStep === 'dashboard' && (
            <Step4Dashboard
              testCases={refinedTestCases ?? initialTestCases}
              onRestart={handleRestart}
            />
          )}
        </div>
      </main>
    </div>
  );
}
