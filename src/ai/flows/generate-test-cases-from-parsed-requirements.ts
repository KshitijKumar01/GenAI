'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating test cases from parsed requirements.
 *
 * generateTestCases - A function that generates test cases from parsed requirements.
 * GenerateTestCasesInput - The input type for the generateTestCases function.
 * GenerateTestCasesOutput - The return type for the generateTestCases function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTestCasesInputSchema = z.object({
  parsedRequirements: z
    .string()
    .describe('The parsed requirements document as a string.'),
});
export type GenerateTestCasesInput = z.infer<typeof GenerateTestCasesInputSchema>;

const GenerateTestCasesOutputSchema = z.object({
  testCases: z
    .string()
    .describe('The generated test cases as a numbered, structured string.'),
});
export type GenerateTestCasesOutput = z.infer<typeof GenerateTestCasesOutputSchema>;

export async function generateTestCases(
  input: GenerateTestCasesInput
): Promise<GenerateTestCasesOutput> {
  return generateTestCasesFlow(input);
}

const generateTestCasesPrompt = ai.definePrompt({
  name: 'generateTestCasesPrompt',
  input: {schema: GenerateTestCasesInputSchema},
  output: {schema: GenerateTestCasesOutputSchema},
  prompt: `You are a QA engineer specializing in healthcare software.
  Your task is to generate a set of numbered and structured test cases based on the provided requirements.
  The test cases must be traceable back to the original requirements and should reference relevant documentation to support the test generation reasoning.

  Parsed Requirements:
  {{parsedRequirements}}

  Generate the test cases in a numbered list format. Make them detailed and technically specific.
  Include the compliance items each test satisfies where possible.
  Follow general test case generation best practices.
  Make sure each step is verifiable.
  Ensure traceability back to the original requirements.
  Cite documentation (e.g., FDA, IEC 62304, ISO standards) that supports the test generation reasoning wherever possible.
  `,
});

const generateTestCasesFlow = ai.defineFlow(
  {
    name: 'generateTestCasesFlow',
    inputSchema: GenerateTestCasesInputSchema,
    outputSchema: GenerateTestCasesOutputSchema,
  },
  async input => {
    const {output} = await generateTestCasesPrompt(input);
    return output!;
  }
);
