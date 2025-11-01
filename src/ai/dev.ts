import { config } from 'dotenv';
config();

import '@/ai/flows/generate-test-cases-from-parsed-requirements.ts';
import '@/ai/flows/parse-document-and-get-feedback.ts';
import '@/ai/flows/refine-generated-test-cases-with-feedback.ts';