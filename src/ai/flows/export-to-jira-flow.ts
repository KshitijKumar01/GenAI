'use server';
/**
 * @fileOverview A Genkit flow for exporting test cases to Jira.
 *
 * exportToJira - A function that creates Jira issues from test cases.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TestCaseSchema = z.object({
  id: z.string().describe("The ID of the test case (e.g., 'TC-1')."),
  title: z.string().describe('The title of the test case.'),
  content: z.string().describe('The full content of the test case.'),
});

const JiraIssueSchema = z.object({
  testCaseId: z.string(),
  jiraIssueKey: z.string(),
  jiraIssueUrl: z.string(),
});

const ExportToJiraInputSchema = z.object({
  testCases: z.array(TestCaseSchema).describe('An array of test cases to be exported.'),
});
type ExportToJiraInput = z.infer<typeof ExportToJiraInputSchema>;

const ExportToJiraOutputSchema = z.object({
  createdIssues: z.array(JiraIssueSchema).describe('A list of created Jira issues.'),
});
type ExportToJiraOutput = z.infer<typeof ExportToJiraOutputSchema>;


// This is a placeholder tool. In a real application, this would
// interact with the Jira API to create an issue.
const createJiraIssueTool = ai.defineTool(
    {
      name: 'createJiraIssue',
      description: 'Creates a single issue in Jira from a test case.',
      inputSchema: z.object({
        title: z.string().describe('The title for the Jira issue.'),
        description: z.string().describe('The description for the Jira issue (body).'),
        testCaseId: z.string().describe("The original test case ID."),
      }),
      outputSchema: z.object({
        key: z.string().describe("The key of the created Jira issue (e.g., 'PROJ-123')."),
        url: z.string().describe("The URL to view the created Jira issue."),
        testCaseId: z.string(),
      }),
    },
    async (input) => {
      console.log(`Creating Jira issue for ${input.testCaseId}: ${input.title}`);
      // Simulate API call
      const issueKey = `JIRA-${Math.floor(Math.random() * 1000) + 1}`;
      return {
        key: issueKey,
        url: `https://jira.example.com/browse/${issueKey}`,
        testCaseId: input.testCaseId,
      };
    }
);

export async function exportToJira(input: ExportToJiraInput): Promise<ExportToJiraOutput> {
  return exportToJiraFlow(input);
}

const exportToJiraFlow = ai.defineFlow(
  {
    name: 'exportToJiraFlow',
    inputSchema: ExportToJiraInputSchema,
    outputSchema: ExportToJiraOutputSchema,
  },
  async (input) => {
    const { history } = await ai.generate({
      prompt: `For each of the following test cases, create a corresponding issue in Jira using the available tool.`,
      history: input.testCases.map(tc => ({
        role: 'user',
        content: [{ text: `Test Case ID: ${tc.id}\nTitle: ${tc.title}\nContent: ${tc.content}` }]
      })),
      tools: [createJiraIssueTool],
    });

    const createdIssues = [];
    if (history) {
        for(const turn of history) {
            if (turn.role === 'model') {
                for (const part of turn.content) {
                    if (part.toolResponse) {
                        const toolResponse = part.toolResponse;
                         // Manually construct the expected schema.
                        const issue = {
                            testCaseId: toolResponse.testCaseId,
                            jiraIssueKey: toolResponse.key,
                            jiraIssueUrl: toolResponse.url
                        };
                        createdIssues.push(issue);
                    }
                }
            }
        }
    }

    return { createdIssues };
  }
);
