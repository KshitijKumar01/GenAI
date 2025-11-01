'use server';

import { 
  parseDocumentAndGetFeedback,
  type ParseDocumentAndGetFeedbackInput
} from '@/ai/flows/parse-document-and-get-feedback';

import {
  generateTestCases,
  type GenerateTestCasesInput
} from '@/ai/flows/generate-test-cases-from-parsed-requirements';

import {
  refineGeneratedTestCasesWithFeedback,
  type RefineGeneratedTestCasesWithFeedbackInput
} from '@/ai/flows/refine-generated-test-cases-with-feedback';

import {
  analyzeCompliance,
  type AnalyzeComplianceInput
} from '@/ai/flows/analyze-compliance-flow';

import {
  exportToJira,
  type ExportToJiraInput
} from '@/ai/flows/export-to-jira-flow';

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
