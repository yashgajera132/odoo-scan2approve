'use client';
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Tesseract from 'tesseract.js';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from './auth-provider';
import { addExpense } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { supportedCurrencies, getSupportedCurrencies } from '@/lib/currency';
import { receiptDataExtraction } from '@/ai/flows/receipt-data-extraction';
import { Loader2, PlusCircle, Upload } from 'lucide-react';

interface SubmitExpenseSheetProps {
    onExpenseSubmitted: () => void;
}

const expenseSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.coerce.number().min(0.01, 'Amount must be greater than 0'),
  currency: z.string().min(1, 'Currency is required'),
  category: z.string().min(1, 'Category is required'),
  date: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date" }),
  receipt: z.any().optional(),
  vendor: z.string().optional(),
});


export default function SubmitExpenseSheet({ onExpenseSubmitted }: SubmitExpenseSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currencies, setCurrencies] = useState<string[]>(supportedCurrencies);
  const { user } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof expenseSchema>>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: '',
      amount: 0,
      currency: 'USD',
      category: '',
      date: new Date().toISOString().split('T')[0],
      vendor: '',
    },
  });

  useEffect(() => {
    async function loadCurrencies() {
        const fetchedCurrencies = await getSupportedCurrencies();
        setCurrencies(fetchedCurrencies);
    }
    loadCurrencies();
  }, [])

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsProcessing(true);
      const { dismiss } = toast({
          title: "Scanning Receipt...",
          description: "This may take a moment. Please wait.",
      });

      try {
        console.log("Starting OCR process...");
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
            logger: m => console.log(m) 
        });
        console.log("OCR text extracted:", text);
        dismiss();
        
        toast({
            title: "Extracting Expense Data...",
            description: "AI is analyzing the receipt text.",
        });

        const result = await receiptDataExtraction({ receiptDataUri: '', text });

        if (result && result.shouldAutoFill) {
            if(result.amount) form.setValue('amount', parseFloat(result.amount) || 0);
            if(result.date) form.setValue('date', new Date(result.date).toISOString().split('T')[0] || new Date().toISOString().split('T')[0]);
            if(result.vendor) form.setValue('vendor', result.vendor || '');
            if(result.description) form.setValue('description', result.description || '');
            toast({
                title: "Receipt Scanned",
                description: "We've pre-filled the form based on your receipt.",
            });
        } else {
            toast({
                title: "Scan Complete",
                description: "Could not reliably extract all data. Please fill the form manually.",
                variant: 'destructive',
            });
        }

      } catch (error) {
        console.error('Error processing receipt:', error);
        toast({
            title: "Scan Failed",
            description: "There was an error scanning your receipt.",
            variant: "destructive"
        });
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof expenseSchema>) => {
    if (!user) return;
    try {
      await addExpense({
        employeeId: user.id,
        employeeName: user.name,
        description: values.description,
        category: values.category,
        amount: values.amount,
        currency: values.currency,
        date: values.date,
        receiptUrl: values.receipt?.name || undefined,
        vendor: values.vendor
      });
      toast({
        title: 'Expense Submitted',
        description: 'Your expense has been submitted for approval.',
      });
      form.reset();
      onExpenseSubmitted();
      setIsOpen(false);
    } catch (error) {
        console.error(error);
      toast({
        title: 'Submission Failed',
        description: 'There was an error submitting your expense.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Expense
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-lg w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Submit New Expense</SheetTitle>
          <SheetDescription>Fill out the details of your expense and upload a receipt.</SheetDescription>
        </SheetHeader>
        <div className="my-4">
             <label htmlFor="receipt-upload" className="block text-sm font-medium text-gray-700 mb-2">
                Scan Receipt (Optional)
            </label>
            <div className="relative">
                <Input id="receipt-upload" type="file" accept="image/*" onChange={handleFileChange} className="pl-10" disabled={isProcessing}/>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    {isProcessing ? <Loader2 className="h-5 w-5 animate-spin text-gray-400" /> : <Upload className="h-5 w-5 text-gray-400" />}
                </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Upload a receipt to auto-fill the form.</p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="e.g., Client dinner" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {currencies.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            </div>
             <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Meals & Entertainment">Meals & Entertainment</SelectItem>
                        <SelectItem value="Travel">Travel</SelectItem>
                        <SelectItem value="Software">Software</SelectItem>
                        <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="vendor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., The Steakhouse" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <SheetFooter className="pt-4">
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={form.formState.isSubmitting || isProcessing}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Expense
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
