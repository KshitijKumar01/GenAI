'use server';

import { 
  parseDocumentAndGetFeedback,
} from '@/ai/flows/parse-document-and-get-feedback';
import {
  generateTestCases,
} from '@/ai/flows/generate-test-cases-from-parsed-requirements';
import {
  refineGeneratedTestCasesWithFeedback,
} from '@/ai/flows/refine-generated-test-cases-with-feedback';
import {
  analyzeCompliance,
} from '@/ai/flows/analyze-compliance-flow';
import {
  exportToJira,
} from '@/ai/flows/export-to-jira-flow';

// Define types locally as they cannot be imported from 'use server' files.
import { z } from 'zod';

const ParseDocumentAndGetFeedbackInputSchema = z.object({
  documentDataUri: z.string(),
  userFeedback: z.string().optional(),
});
type ParseDocumentAndGetFeedbackInput = z.infer<typeof ParseDocumentAndGetFeedbackInputSchema>;

const GenerateTestCasesInputSchema = z.object({
  parsedRequirements: z.string(),
});
type GenerateTestCasesInput = z.infer<typeof GenerateTestCasesInputSchema>;

const RefineGeneratedTestCasesWithFeedbackInputSchema = z.object({
  initialTestCases: z.string(),
  feedback: z.string(),
  parsedRequirements: z.string(),
});
type RefineGeneratedTestCasesWithFeedbackInput = z.infer<typeof RefineGeneratedTestCasesWithFeedbackInputSchema>;

const AnalyzeComplianceInputSchema = z.object({
  testCases: z.string(),
  parsedRequirements: z.string(),
});
type AnalyzeComplianceInput = z.infer<typeof AnalyzeComplianceInputSchema>;

const TestCaseSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
});
const ExportToJiraInputSchema = z.object({
  testCases: z.array(TestCaseSchema),
});
type ExportToJiraInput = z.infer<typeof ExportToJiraInputSchema>;


export async function parseDocumentAction(input: ParseDocumentAndGetFeedbackInput) {
  try {
    const output = await parseDocumentAndGetFeedback(input);
    return { parsedContent: output.parsedContent };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred during parsing.' };
  }
}

export async function generateTestCasesAction(input: GenerateTestCasesInput) {
  try {
    const output = await generateTestCases(input);
    return { testCases: output.testCases };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred during test case generation.' };
  }
}

export async function refineTestCasesAction(input: RefineGeneratedTestCasesWithFeedbackInput) {
  try {
    const output = await refineGeneratedTestCasesWithFeedback(input);
    return { refinedTestCases: output.refinedTestCases };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred during test case refinement.' };
  }
}

export async function analyzeComplianceAction(input: AnalyzeComplianceInput) {
    try {
      const output = await analyzeCompliance(input);
      return { issues: output.issues };
    } catch (error) {
      console.error(error);
      return { error: error instanceof Error ? error.message : 'An unknown error occurred during compliance analysis.' };
    }
}

export async function exportToJiraAction(input: ExportToJiraInput) {
  try {
    const output = await exportToJira(input);
    return { createdIssues: output.createdIssues };
  } catch (error) {
    console.error(error);
    return { error: error instanceof Error ? error.message : 'An unknown error occurred during Jira export.' };
  }
}
