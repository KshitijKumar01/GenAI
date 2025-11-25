// 'use server';
// /**
//  * @fileOverview Parses a document and allows the user to provide feedback and re-parse until the document is accurately represented.
//  *
//  * - parseDocumentAndGetFeedback - A function that handles the document parsing and feedback process.
//  */

// import {ai} from '@/ai/genkit';
// import {z} from 'genkit';

// const ParseDocumentAndGetFeedbackInputSchema = z.object({
//   documentDataUri: z
//     .string()
//     .describe(
//       "A healthcare requirements document (PDF, Word, etc.) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
//     ),
//   userFeedback: z.string().optional().describe('Feedback from the user on the parsed content.'),
// });
// type ParseDocumentAndGetFeedbackInput = z.infer<typeof ParseDocumentAndGetFeedbackInputSchema>;

// const ParseDocumentAndGetFeedbackOutputSchema = z.object({
//   parsedContent: z.string().describe('The parsed content of the document.'),
// });
// type ParseDocumentAndGetFeedbackOutput = z.infer<typeof ParseDocumentAndGetFeedbackOutputSchema>;


// export async function parseDocumentAndGetFeedback(
//   input: ParseDocumentAndGetFeedbackInput
// ): Promise<ParseDocumentAndGetFeedbackOutput> {
//   return parseDocumentAndGetFeedbackFlow(input);
// }

// const prompt = ai.definePrompt({
//   name: 'parseDocumentAndGetFeedbackPrompt',
//   input: {schema: ParseDocumentAndGetFeedbackInputSchema},
//   output: {schema: ParseDocumentAndGetFeedbackOutputSchema},
//   prompt: `You are an AI document parser specializing in healthcare requirements documents.

//   Your task is to parse the provided document and extract its content in a structured, human-readable format.
//   Take into account any user feedback provided to correct previous parsing errors.

//   Document: {{media url=documentDataUri}}

//   {{#if userFeedback}}
//   User Feedback: {{{userFeedback}}}
//   Consider the feedback above when parsing the document. Focus on addressing the specific issues mentioned.
//   {{/if}}
//   `,
// });

// const parseDocumentAndGetFeedbackFlow = ai.defineFlow(
//   {
//     name: 'parseDocumentAndGetFeedbackFlow',
//     inputSchema: ParseDocumentAndGetFeedbackInputSchema,
//     outputSchema: ParseDocumentAndGetFeedbackOutputSchema,
//   },
//   async input => {
//     const {output} = await prompt(input);
//     return output!;
//   }
// );


'use server';
/**
 * @fileOverview
 * Parses a document, uploads it to GCP, and returns the RAG corpus ID
 * so it can be used downstream for retrieval.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';

// ---------------- CONFIG ----------------

const PROJECT_ID = process.env.GCLOUD_PROJECT!;
const BUCKET_NAME = "compliancecorpusbucket"; // ex: "mrcms-srs-bucket"

// Version based naming (Option C)
const SRS_VERSION = 'v1';

// IMPORTANT: This must match the corpus you created in Vertex AI
const RAG_CORPUS_ID = `mrcms-${SRS_VERSION}`;

// ---------------- CLIENTS ----------------

const storage = new Storage({ projectId: PROJECT_ID });

// ---------------- SCHEMA ----------------

const ParseDocumentAndGetFeedbackInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A healthcare requirements document (PDF, Word, etc.) as a data URI that must include a MIME type and use Base64 encoding."
    ),
  userFeedback: z
    .string()
    .optional()
    .describe('Feedback from the user on the parsed content.'),
});

type ParseDocumentAndGetFeedbackInput = z.infer<
  typeof ParseDocumentAndGetFeedbackInputSchema
>;

const ParseDocumentAndGetFeedbackOutputSchema = z.object({
  parsedContent: z.string().describe('The parsed content of the document.'),
  srsRagId: z
    .string()
    .describe('The RAG corpus ID used for this SRS version'),
});

type ParseDocumentAndGetFeedbackOutput = z.infer<
  typeof ParseDocumentAndGetFeedbackOutputSchema
>;

// ---------------- MAIN EXPORT ----------------

export async function parseDocumentAndGetFeedback(
  input: ParseDocumentAndGetFeedbackInput
): Promise<ParseDocumentAndGetFeedbackOutput> {
  return parseDocumentAndGetFeedbackFlow(input);
}

// ---------------- PROMPT ----------------

const prompt = ai.definePrompt({
  name: 'parseDocumentAndGetFeedbackPrompt',
  input: { schema: ParseDocumentAndGetFeedbackInputSchema },
  output: { schema: ParseDocumentAndGetFeedbackOutputSchema },
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

// ---------------- FLOW ----------------

const parseDocumentAndGetFeedbackFlow = ai.defineFlow(
  {
    name: 'parseDocumentAndGetFeedbackFlow',
    inputSchema: ParseDocumentAndGetFeedbackInputSchema,
    outputSchema: ParseDocumentAndGetFeedbackOutputSchema,
  },
  async (input) => {
    // ---------- 1. Extract base64 & convert ----------
    const [meta, base64Data] = input.documentDataUri.split(',');
    const mimeMatch = meta.match(/data:(.*);base64/);
    const mimeType = mimeMatch?.[1] || 'application/pdf';

    const buffer = Buffer.from(base64Data, 'base64');

    // ---------- 2. Upload to Cloud Storage ----------
    const bucket = storage.bucket(BUCKET_NAME);

    const fileName = `srs/${SRS_VERSION}/medical_srs_${uuidv4()}.pdf`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
      contentType: mimeType,
    });

    const gcsUri = `gs://${BUCKET_NAME}/${fileName}`;

    // ✅ This path is now auto-ingested by RAG (because your corpus is linked to this GCS folder)
    console.log(`SRS uploaded to: ${gcsUri}`);
    console.log(`Linked RAG Corpus: ${RAG_CORPUS_ID}`);

    // ---------- 3. Parse the document with Genkit ----------
    const { output } = await prompt(input);

    return {
      parsedContent: output!.parsedContent,
      srsRagId: RAG_CORPUS_ID, // <-- Used in next flows
    };
  }
);


