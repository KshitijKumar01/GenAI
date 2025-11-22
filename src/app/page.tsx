"use client";

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { AppHeader } from '@/components/app/header';
import StepIndicator from '@/components/app/step-indicator';
import Step1Upload from '@/components/app/step-1-upload';
import Step2Parse from '@/components/app/step-2-parse';
import Step3Generate from '@/components/app/step-3-generate';
import Step4Compliance from '@/components/app/step-4-compliance';
import Step5Dashboard from '@/components/app/step-5-dashboard';
import { parseDocumentAction, generateTestCasesAction, refineTestCasesAction, analyzeComplianceAction, exportToJiraAction } from '@/lib/actions';
import type { TestCase, ComplianceIssue } from '@/lib/types';

type AppStep = 'upload' | 'parse' | 'generate' | 'compliance' | 'dashboard';

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [file, setFile] = useState<File | null>(null);
  const [fileDataUri, setFileDataUri] = useState<string>('');
  const [parsedContent, setParsedContent] = useState('');
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [complianceIssues, setComplianceIssues] = useState<ComplianceIssue[]>([]);

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

  const parseTestCasesString = (text: string): TestCase[] => {
    if (!text) return [];
    // Improved regex to handle various test case formats and numbering.
    // It looks for "TC-", "Test Case", or a number followed by a period.
    const caseBlocks = text.split(/(?=\s*(?:TC-[\w-]+|Test Case\s*\d+|^\d+\.)\s*[:\s])/gim).filter(block => block.trim() !== '');

    return caseBlocks.map((block, index) => {
        const content = block.trim();
        let id = `TC-${index + 1}`;
        let title = `Test Case ${index + 1}`;

        // Extract ID (e.g., TC-1, TC-VSM-AL-001)
        const idMatch = content.match(/^(TC-[\w-]+)/i);
        if (idMatch) {
            id = idMatch[1].trim();
        }

        // Extract Title. Look for text after the ID and a colon, up to the first newline.
        const titleMatch = content.match(/^(?:TC-[\w-]+:|Test Case\s*\d+[:\s]*)?\s*(.*)/i);
        if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].split('\n')[0].trim();
        }

        return {
            id: id,
            title: title || `Test Case ${index + 1}`, // Fallback title
            content: content,
        };
    });
  };
  
  const handleGenerateTestCases = async () => {
    setIsLoading(true);
    const result = await generateTestCasesAction({ parsedRequirements: parsedContent });
    if (result.error) {
      toast({ variant: 'destructive', title: 'Generation Error', description: result.error });
    } else if (result.testCases) {
      setTestCases(parseTestCasesString(result.testCases));
      setCurrentStep('generate');
    }
    setIsLoading(false);
  };

  const handleRefineTestCases = async (feedback: string) => {
    setIsLoading(true);
    const currentTestCasesText = testCases.map(tc => tc.content).join('\n\n');
    const result = await refineTestCasesAction({ 
      initialTestCases: currentTestCasesText, 
      feedback, 
      parsedRequirements: parsedContent 
    });
    if (result.error) {
      toast({ variant: 'destructive', title: 'Refinement Error', description: result.error });
    } else if (result.refinedTestCases) {
      setTestCases(parseTestCasesString(result.refinedTestCases));
      // Stay on the 'generate' step to allow for further refinement
      setCurrentStep('generate');
      toast({ title: 'Success', description: 'Test cases refined with your feedback.' });
    }
    setIsLoading(false);
  };
  
  const handleProceedToCompliance = async () => {
    setIsLoading(true);
    const testCasesText = testCases.map(tc => tc.content).join('\n\n');
    const result = await analyzeComplianceAction({
      testCases: testCasesText,
      parsedRequirements: parsedContent,
    });
    if (result.error) {
      toast({ variant: 'destructive', title: 'Compliance Analysis Error', description: result.error });
    } else if (result.issues) {
      setComplianceIssues(result.issues);
      setCurrentStep('compliance');
    }
    setIsLoading(false);
  }

  const handleApproveAndFinalize = () => {
    setCurrentStep('dashboard');
  };

  const handleRestart = () => {
    setFile(null);
    setFileDataUri('');
    setParsedContent('');
    setTestCases([]);
    setComplianceIssues([]);
    setCurrentStep('upload');
  }

  const steps: { id: AppStep; name: string }[] = [
    { id: 'upload', name: 'Upload' },
    { id: 'parse', name: 'Review' },
    { id: 'generate', name: 'Generate' },
    { id: 'compliance', name: 'Compliance' },
    { id: 'dashboard', name: 'Export' },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <AppHeader />
      <main className="flex flex-1 flex-col items-center gap-8 p-4 md:p-8">
        <div className="w-full max-w-6xl">
          <StepIndicator 
            steps={steps} 
            currentStepIndex={currentStepIndex} 
          />
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
              testCases={testCases}
              onRefine={handleRefineTestCases}
              onProceed={handleProceedToCompliance}
              isLoading={isLoading}
            />
          )}
          {currentStep === 'compliance' && (
            <Step4Compliance
              testCases={testCases}
              issues={complianceIssues}
              onRefine={handleRefineTestCases}
              onApprove={handleApproveAndFinalize}
              isLoading={isLoading}
            />
          )}
          {currentStep === 'dashboard' && (
            <Step5Dashboard
              testCases={testCases}
              onRestart={handleRestart}
              exportToJiraAction={exportToJiraAction}
            />
          )}
        </div>
      </main>
    </div>
  );
}
