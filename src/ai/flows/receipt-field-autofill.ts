'use server';

/**
 * @fileOverview This flow uses an LLM to evaluate whether to automatically fill in form fields based on the text extracted from a receipt.
 *
 * - receiptFieldAutofill - A function that determines whether to autofill receipt fields.
 * - ReceiptFieldAutofillInput - The input type for the receiptFieldAutofill function.
 * - ReceiptFieldAutofillOutput - The return type for the receiptFieldAutofill function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReceiptFieldAutofillInputSchema = z.object({
  receiptText: z
    .string()
    .describe('The text extracted from the receipt via OCR.'),
  description: z.string().optional().describe('The current description field value, if any.'),
  amount: z.string().optional().describe('The current amount field value, if any.'),
  date: z.string().optional().describe('The current date field value, if any.'),
  vendor: z.string().optional().describe('The current vendor field value, if any.'),
});
export type ReceiptFieldAutofillInput = z.infer<typeof ReceiptFieldAutofillInputSchema>;

const ReceiptFieldAutofillOutputSchema = z.object({
  shouldAutofill: z
    .boolean()
    .describe(
      'Whether the system should automatically fill in the fields based on the extracted receipt text.'
    ),
  autofillData: z
    .object({
      description: z.string().optional().describe('The extracted description from the receipt.'),
      amount: z.string().optional().describe('The extracted amount from the receipt.'),
      date: z.string().optional().describe('The extracted date from the receipt.'),
      vendor: z.string().optional().describe('The extracted vendor from the receipt.'),
    })
    .optional(),
});
export type ReceiptFieldAutofillOutput = z.infer<typeof ReceiptFieldAutofillOutputSchema>;

export async function receiptFieldAutofill(input: ReceiptFieldAutofillInput): Promise<ReceiptFieldAutofillOutput> {
  return receiptFieldAutofillFlow(input);
}

const prompt = ai.definePrompt({
  name: 'receiptFieldAutofillPrompt',
  input: {schema: ReceiptFieldAutofillInputSchema},
  output: {schema: ReceiptFieldAutofillOutputSchema},
  prompt: `You are an AI assistant that analyzes receipt text and determines whether to automatically fill in form fields.

  Here's the receipt text:
  {{receiptText}}

  Here are the current values of the form fields:
  - Description: {{description}}
  - Amount: {{amount}}
  - Date: {{date}}
  - Vendor: {{vendor}}

  Based on the receipt text, determine whether the system should automatically fill in the fields.
  Only allow shouldAutofill to be true if the text values are reasonably accurate and complete; otherwise, set it to false.

  If shouldAutofill is true, populate the autofillData object with the extracted values from the receipt text.
  If a field cannot be reliably extracted, leave the corresponding autofillData field empty.

  Return a JSON object with the following structure:
  {
    "shouldAutofill": boolean,
    "autofillData": {
      "description": string | null,
      "amount": string | null,
      "date": string | null,
      "vendor": string | null
    }
  }

  Make sure the "shouldAutofill" field is a boolean.
`,
});

const receiptFieldAutofillFlow = ai.defineFlow(
  {
    name: 'receiptFieldAutofillFlow',
    inputSchema: ReceiptFieldAutofillInputSchema,
    outputSchema: ReceiptFieldAutofillOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
