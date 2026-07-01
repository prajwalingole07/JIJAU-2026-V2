'use server';
/**
 * @fileOverview An AI tool to generate personalized welcome messages for new students or teachers.
 *
 * - generateWelcomeMessage - A function that generates a personalized welcome message.
 * - GenerateWelcomeMessageInput - The input type for the generateWelcomeMessage function.
 * - GenerateWelcomeMessageOutput - The return type for the generateWelcomeMessage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateWelcomeMessageInputSchema = z.object({
  name: z.string().describe('The full name of the new student or teacher.'),
  role: z.enum(['student', 'teacher']).describe('The role of the new member (student or teacher).'),
  admissionDate: z.string().optional().describe('The admission date for a new student (optional).'),
  subject: z.string().optional().describe('The subject the new teacher will teach (optional).'),
});
export type GenerateWelcomeMessageInput = z.infer<typeof GenerateWelcomeMessageInputSchema>;

const GenerateWelcomeMessageOutputSchema = z.object({
  message: z.string().describe('The personalized welcome message.'),
  subjectLine: z.string().describe('A suggested subject line for the welcome message.'),
});
export type GenerateWelcomeMessageOutput = z.infer<typeof GenerateWelcomeMessageOutputSchema>;

export async function generateWelcomeMessage(input: GenerateWelcomeMessageInput): Promise<GenerateWelcomeMessageOutput> {
  return generateWelcomeMessageFlow(input);
}

const welcomeMessagePrompt = ai.definePrompt({
  name: 'welcomeMessagePrompt',
  input: { schema: GenerateWelcomeMessageInputSchema },
  output: { schema: GenerateWelcomeMessageOutputSchema },
  prompt: `You are an AI assistant for "Jijau English School Tungi (BK)" that specializes in crafting warm, personalized welcome messages for new members. Your goal is to generate a personalized welcome message and a suitable subject line for it.

Here are the details for the new member:
Name: {{{name}}}
Role: {{{role}}}

{{#eq role "student"}}
Admission Date: {{{admissionDate}}}

Craft a warm welcome message for a new student joining Jijau English School Tungi (BK). Emphasize excitement for their academic journey and integrating into the school community. Encourage them to explore new opportunities and make new friends. The subject line should be inviting and convey a sense of welcome to the school.
{{/eq}}

{{#eq role "teacher"}}
Subject: {{{subject}}}

Craft a warm welcome message for a new teacher joining Jijau English School Tungi (BK). Emphasize excitement for their contribution to the school, their students, and the faculty team. Highlight the supportive environment and the impact they will have. The subject line should be professional yet warm, welcoming them to the faculty.
{{/eq}}

Ensure the message is friendly, encouraging, and reflects the school's commitment to education and community. The tone should be professional yet inviting. The school name is "Jijau English School Tungi (BK)".

Output format:
{{jsonSchema output}}`,
});

const generateWelcomeMessageFlow = ai.defineFlow(
  {
    name: 'generateWelcomeMessageFlow',
    inputSchema: GenerateWelcomeMessageInputSchema,
    outputSchema: GenerateWelcomeMessageOutputSchema,
  },
  async (input) => {
    const { output } = await welcomeMessagePrompt(input);
    return output!;
  }
);
