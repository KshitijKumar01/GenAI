'use server';
/**
 * @fileOverview Parses a document and allows the user to provide feedback and re-parse until the document is accurately represented.
 *
 * - parseDocumentAndGetFeedback - A function that handles the document parsing and feedback process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseDocumentAndGetFeedbackInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A healthcare requirements document (PDF, Word, etc.) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  userFeedback: z.string().optional().describe('Feedback from the user on the parsed content.'),
});
type ParseDocumentAndGetFeedbackInput = z.infer<typeof ParseDocumentAndGetFeedbackInputSchema>;

const ParseDocumentAndGetFeedbackOutputSchema = z.object({
  parsedContent: z.string().describe('The parsed content of the document.'),
});
type ParseDocumentAndGetFeedbackOutput = z.infer<typeof ParseDocumentAndGetFeedbackOutputSchema>;


export async function parseDocumentAndGetFeedback(
  input: ParseDocumentAndGetFeedbackInput
): Promise<ParseDocumentAndGetFeedbackOutput> {
  return parseDocumentAndGetFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'parseDocumentAndGetFeedbackPrompt',
  input: {schema: ParseDocumentAndGetFeedbackInputSchema},
  output: {schema: ParseDocumentAndGetFeedbackOutputSchema},
  prompt: `You are an AI document parser specializing in healthcare requirements documents.

  Your task is to parse the provided document and extract its content in a structured, human-readable format.
  Take into account any user feedback provided to correct previous parsing errors.

  Document: {{media url=documentDataUri}}

  {{#if userFeedback}}
  User Feedback: {{{userFeedback}}}
  Consider the feedback above when parsing the document. Focus on addressing the specific issues mentioned.
  {{/if}}
  `,
});

const parseDocumentAndGetFeedbackFlow = ai.defineFlow(
  {
    name: 'parseDocumentAndGetFeedbackFlow',
    inputSchema: ParseDocumentAndGetFeedbackInputSchema,
    outputSchema: ParseDocumentAndGetFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
