import { config } from 'dotenv';
config();

import '@/ai/flows/generate-test-cases-from-parsed-requirements.ts';
import '@/ai/flows/parse-document-and-get-feedback.ts';
import '@/ai/flows/refine-generated-test-cases-with-feedback.ts';
import '@/ai/flows/analyze-compliance-flow.ts';
import '@/ai/flows/export-to-jira-flow.ts';
