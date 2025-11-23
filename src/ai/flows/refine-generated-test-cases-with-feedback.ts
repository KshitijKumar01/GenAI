// 'use server';
// /**
//  * @fileOverview This flow refines generated test cases based on user feedback.
//  *
//  * - refineGeneratedTestCasesWithFeedback - This function takes generated test cases and user feedback, then refines the test cases.
//  */

// import {ai} from '@/ai/genkit';
// import {z} from 'genkit';


// const RefineGeneratedTestCasesWithFeedbackInputSchema = z.object({
//   initialTestCases: z.string().describe('The initial set of generated test cases.'),
//   feedback: z.string().describe('User feedback on the initial test cases, including corrections and suggestions.'),
//   parsedRequirements: z.string().describe('The parsed requirements document to provide context.'),
// });
// type RefineGeneratedTestCasesWithFeedbackInput = z.infer<typeof RefineGeneratedTestCasesWithFeedbackInputSchema>;

// const RefineGeneratedTestCasesWithFeedbackOutputSchema = z.object({
//   refinedTestCases: z.string().describe('The refined set of test cases based on user feedback.'),
// });
// type RefineGeneratedTestCasesWithFeedbackOutput = z.infer<typeof RefineGeneratedTestCasesWithFeedbackOutputSchema>;


// export async function refineGeneratedTestCasesWithFeedback(
//   input: RefineGeneratedTestCasesWithFeedbackInput
// ): Promise<RefineGeneratedTestCasesWithFeedbackOutput> {
//   return refineGeneratedTestCasesWithFeedbackFlow(input);
// }

// const refineGeneratedTestCasesWithFeedbackPrompt = ai.definePrompt({
//   name: 'refineGeneratedTestCasesWithFeedbackPrompt',
//   input: {schema: RefineGeneratedTestCasesWithFeedbackInputSchema},
//   output: {schema: RefineGeneratedTestCasesWithFeedbackOutputSchema},
//   prompt: `You are an expert QA engineer refining test cases based on user feedback.

//   Here are the initial test cases:
//   {{initialTestCases}}

//   Here is the user feedback on the initial test cases:
//   {{feedback}}

//   Here are the parsed requirements for context:
//   {{parsedRequirements}}

//   Based on the user feedback and the parsed requirements, refine the test cases to better cover the requirements and compliance standards. Ensure the output is well-structured and numbered.
//   `,
// });

// const refineGeneratedTestCasesWithFeedbackFlow = ai.defineFlow(
//   {
//     name: 'refineGeneratedTestCasesWithFeedbackFlow',
//     inputSchema: RefineGeneratedTestCasesWithFeedbackInputSchema,
//     outputSchema: RefineGeneratedTestCasesWithFeedbackOutputSchema,
//   },
//   async input => {
//     const {output} = await refineGeneratedTestCasesWithFeedbackPrompt(input);
//     return output!;
//   }
// );


'use server';
/**
 * @fileOverview
 * Refines generated test cases based on user feedback using Vertex AI RAG
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const COMPLIANCE_RAG_ID = 'compliance-guidelines';

/* ---------------- SCHEMAS ---------------- */

const RefineGeneratedTestCasesWithFeedbackInputSchema = z.object({
  initialTestCases: z
    .string()
    .describe('The initial set of generated test cases.'),

  feedback: z
    .string()
    .describe('User feedback on the initial test cases.'),

  parsedRequirements: z
    .string()
    .describe('The parsed requirements document.'),

  // From parse-document-and-get-feedback.ts
  srsRagId: z
    .string()
    .describe('Vertex AI RAG Corpus ID for the current SRS (e.g. mrcms-v1)'),
});

type RefineGeneratedTestCasesWithFeedbackInput = z.infer<
  typeof RefineGeneratedTestCasesWithFeedbackInputSchema
>;

const RefineGeneratedTestCasesWithFeedbackOutputSchema = z.object({
  refinedTestCases: z
    .string()
    .describe('The refined set of test cases based on user feedback.'),
});

type RefineGeneratedTestCasesWithFeedbackOutput = z.infer<
  typeof RefineGeneratedTestCasesWithFeedbackOutputSchema
>;

/* ---------------- EXPORT ---------------- */

export async function refineGeneratedTestCasesWithFeedback(
  input: RefineGeneratedTestCasesWithFeedbackInput
): Promise<RefineGeneratedTestCasesWithFeedbackOutput> {
  return refineGeneratedTestCasesWithFeedbackFlow(input);
}

/* ---------------- FLOW ---------------- */

const refineGeneratedTestCasesWithFeedbackFlow = ai.defineFlow(
  {
    name: 'refineGeneratedTestCasesWithFeedbackFlow',
    inputSchema: RefineGeneratedTestCasesWithFeedbackInputSchema,
    outputSchema: RefineGeneratedTestCasesWithFeedbackOutputSchema,
  },
  async (input) => {

    const { output } = await ai.generate({
      model: 'vertexai/gemini-1.5-flash',

      // ✅ RAG integration (Genkit v1 compatible)
      config: {
        grounding: {
          vertexAiSearch: {
            corpora: [
              input.srsRagId,        // SRS corpus
              COMPLIANCE_RAG_ID       // Compliance corpus
            ],
          },
        },
      },

      prompt: `
You are an expert QA engineer refining medical test cases.

Use ONLY the following RAG sources:
1) Uploaded SRS
2) Compliance guidelines

=====================
PARSED REQUIREMENTS
=====================
${input.parsedRequirements}

=====================
ORIGINAL TEST CASES
=====================
${input.initialTestCases}

=====================
USER FEEDBACK
=====================
${input.feedback}

Now refine the test cases so they:
- Better match the SRS
- Fully satisfy compliance rules
- Are more clear, structured, complete, and verifiable

Return refined test cases in a numbered, professional format including:
- Test Case ID
- Requirement Reference
- Description
- Preconditions
- Test Steps
- Expected Result
- Related Compliance / Standard reference
- Traceability note
`
    });

    return {
      refinedTestCases: output?.text ?? '',
    };
  }
);
