'use server';
/**
 * @fileOverview An AI agent for generating draft school announcements or informational blurbs.
 *
 * - generateAnnouncementDraft - A function that handles the announcement draft generation process.
 * - GenerateAnnouncementDraftInput - The input type for the generateAnnouncementDraft function.
 * - GenerateAnnouncementDraftOutput - The return type for the generateAnnouncementDraft function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnnouncementDraftInputSchema = z.object({
  eventName: z.string().describe('The name of the event or topic for the announcement.'),
  date: z.string().describe('The date or time associated with the announcement, e.g., "October 26, 2024", "Next Friday at 10 AM".'),
  purpose: z.string().describe('The main purpose or goal of the announcement, e.g., "To inform about upcoming sports events", "To encourage parent participation".'),
  targetAudience: z.string().describe('The intended recipients of the announcement, e.g., "Parents, Students, and Staff", "Teachers only".'),
});
export type GenerateAnnouncementDraftInput = z.infer<typeof GenerateAnnouncementDraftInputSchema>;

const GenerateAnnouncementDraftOutputSchema = z.object({
  announcementText: z.string().describe('The generated draft announcement text.'),
});
export type GenerateAnnouncementDraftOutput = z.infer<typeof GenerateAnnouncementDraftOutputSchema>;

export async function generateAnnouncementDraft(input: GenerateAnnouncementDraftInput): Promise<GenerateAnnouncementDraftOutput> {
  return generateAnnouncementDraftFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAnnouncementDraftPrompt',
  input: {schema: GenerateAnnouncementDraftInputSchema},
  output: {schema: GenerateAnnouncementDraftOutputSchema},
  prompt: `You are an AI assistant specialized in writing clear, engaging, and professional school announcements.
Generate a draft announcement based on the following details for "Jijau English School Tungi (BK)".

Event: {{{eventName}}}
Date/Time: {{{date}}}
Purpose: {{{purpose}}}
Target Audience: {{{targetAudience}}}

Please ensure the tone is appropriate for a school setting and effectively targets the specified audience. The announcement should be concise yet informative, and ready to be used by the school administration.
`,
});

const generateAnnouncementDraftFlow = ai.defineFlow(
  {
    name: 'generateAnnouncementDraftFlow',
    inputSchema: GenerateAnnouncementDraftInputSchema,
    outputSchema: GenerateAnnouncementDraftOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
