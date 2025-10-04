'use server';

/**
 * @fileOverview Extracts data from uploaded receipts using OCR and pre-fills the expense submission form.
 *
 * - receiptDataExtraction - A function that handles the receipt data extraction process.
 * - ReceiptDataExtractionInput - The input type for the receiptDataExtraction function.
 * - ReceiptDataExtractionOutput - The return type for the receiptDataExtraction function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ReceiptDataExtractionInputSchema = z.object({
  receiptDataUri: z
    .string()
    .describe(
      "A photo of a receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  text: z.string().optional().describe('The text extracted from the receipt via OCR.'),
});
export type ReceiptDataExtractionInput = z.infer<typeof ReceiptDataExtractionInputSchema>;

const ReceiptDataExtractionOutputSchema = z.object({
  amount: z.string().describe('The amount extracted from the receipt.'),
  date: z.string().describe('The date extracted from the receipt.'),
  vendor: z.string().describe('The vendor extracted from the receipt.'),
  description: z.string().describe('The description extracted from the receipt.'),
  shouldAutoFill: z
    .boolean()
    .describe(
      'Whether or not the extracted data should be automatically filled into the expense submission form.'
    ),
});
export type ReceiptDataExtractionOutput = z.infer<typeof ReceiptDataExtractionOutputSchema>;

export async function receiptDataExtraction(
  input: ReceiptDataExtractionInput
): Promise<ReceiptDataExtractionOutput> {
  return receiptDataExtractionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'receiptDataExtractionPrompt',
  input: {schema: ReceiptDataExtractionInputSchema},
  output: {schema: ReceiptDataExtractionOutputSchema},
  prompt: `You are an expert financial assistant specializing in extracting data from receipts.

  You will use the text extracted from the receipt via OCR to identify the amount, date, vendor, and description.
  You will also determine whether or not the extracted data should be automatically filled into the expense submission form. Consider the accuracy of the OCR and the confidence of the extracted data when making this determination.

  Text from Receipt: {{{input.text}}}

  Consider the following:
  - Ensure that the date is in a standard and parsable format.
  - Provide a concise description of the purchase.
  - The vendor should be the name of the business.
  - The amount should only include the numerical value with decimals if present. Do not include the currency symbol.

  Respond in the following format:
  \{
  "amount": "amount",
  "date": "date",
  "vendor": "vendor",
  "description": "description",
  "shouldAutoFill": true/false
  \}
  `,
});

const receiptDataExtractionFlow = ai.defineFlow(
  {
    name: 'receiptDataExtractionFlow',
    inputSchema: ReceiptDataExtractionInputSchema,
    outputSchema: ReceiptDataExtractionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
