'use server';

/**
 * @fileOverview This flow uses AI to verify payment confirmation screenshots and suggest the corresponding amount of votes.
 *
 * - verifyPaymentAndSuggestVotes - A function that handles the payment verification and vote suggestion process.
 * - VerifyPaymentAndSuggestVotesInput - The input type for the verifyPaymentAndSuggestVotes function.
 * - VerifyPaymentAndSuggestVotesOutput - The return type for the verifyPaymentAndSuggestVotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyPaymentAndSuggestVotesInputSchema = z.object({
  paymentConfirmationScreenshot: z
    .string()
    .describe(
      "A screenshot of the payment confirmation, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  expectedAmount: z.number().describe('The expected payment amount.'),
  voterName: z.string().describe('The name of the voter.'),
});
export type VerifyPaymentAndSuggestVotesInput = z.infer<typeof VerifyPaymentAndSuggestVotesInputSchema>;

const VerifyPaymentAndSuggestVotesOutputSchema = z.object({
  isPaymentValid: z.boolean().describe('Whether or not the payment is valid.'),
  suggestedVotes: z.number().describe('The suggested number of votes to assign.'),
  paymentDetails: z.string().describe('Details extracted from the payment confirmation.'),
});
export type VerifyPaymentAndSuggestVotesOutput = z.infer<typeof VerifyPaymentAndSuggestVotesOutputSchema>;

export async function verifyPaymentAndSuggestVotes(
  input: VerifyPaymentAndSuggestVotesInput
): Promise<VerifyPaymentAndSuggestVotesOutput> {
  return verifyPaymentAndSuggestVotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'verifyPaymentAndSuggestVotesPrompt',
  input: {schema: VerifyPaymentAndSuggestVotesInputSchema},
  output: {schema: VerifyPaymentAndSuggestVotesOutputSchema},
  prompt: `You are an expert at verifying payment confirmations and suggesting the number of votes to assign.

You will analyze the payment confirmation screenshot and verify if the payment is valid.

Based on the screenshot and the expected amount, you will suggest the number of votes to assign to the voter.

You will extract the payment details from the screenshot.

Voter Name: {{{voterName}}}
Expected Amount: {{{expectedAmount}}}
Payment Confirmation Screenshot: {{media url=paymentConfirmationScreenshot}}

Consider all the above information, and set the isPaymentValid and suggestedVotes fields appropriately.  Be conservative about setting isPaymentValid to true if you aren't absolutely sure.
`,
});

const verifyPaymentAndSuggestVotesFlow = ai.defineFlow(
  {
    name: 'verifyPaymentAndSuggestVotesFlow',
    inputSchema: VerifyPaymentAndSuggestVotesInputSchema,
    outputSchema: VerifyPaymentAndSuggestVotesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
