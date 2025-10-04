'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Expense, ExpenseStatus } from "@/types";
import { CheckCircle2, XCircle, Hourglass, CircleDot, Calendar, User, Tag, FileText, Landmark, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface ExpenseDetailModalProps {
  expense: Expense;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig: {
  [key in ExpenseStatus]: { icon: React.ElementType; color: string; };
} = {
  Draft: { icon: CircleDot, color: 'text-gray-500' },
  Pending: { icon: Hourglass, color: 'text-yellow-500' },
  Approved: { icon: CheckCircle2, color: 'text-green-500' },
  Rejected: { icon: XCircle, color: 'text-red-500' },
};

export default function ExpenseDetailModal({ expense, isOpen, onClose }: ExpenseDetailModalProps) {
    if (!expense) return null;

    const config = statusConfig[expense.status];
    const amount = parseFloat(expense.convertedAmount?.toFixed(2) || expense.amount.toFixed(2));
    const currency: string = 'USD'; // Display in company currency
    const originalAmount = parseFloat(expense.amount.toFixed(2));
    const originalCurrency = expense.currency;

    const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
    }).format(amount);
    
    const originalFormatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: originalCurrency,
    }).format(originalAmount);

    return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Expense Details
             <Badge variant={
                expense.status === 'Approved' ? 'default'
                : expense.status === 'Rejected' ? 'destructive'
                : 'secondary'
             }>
                <config.icon className={`mr-2 h-4 w-4 ${config.color}`} />
                {expense.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {expense.description}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="flex items-center gap-4">
                <Landmark className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                    <span className="font-bold text-lg">{formatted}</span>
                    {originalCurrency !== 'USD' && <span className="text-xs text-muted-foreground">({originalFormatted})</span>}
                </div>
            </div>
             <div className="flex items-center gap-4">
                <User className="h-5 w-5 text-muted-foreground" />
                <span>{expense.employeeName}</span>
            </div>
            <div className="flex items-center gap-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <span>{format(new Date(expense.date), 'MMMM dd, yyyy')}</span>
            </div>
            <div className="flex items-center gap-4">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <span>{expense.category}</span>
            </div>
            {expense.vendor && (
                 <div className="flex items-center gap-4">
                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    <span>{expense.vendor}</span>
                </div>
            )}
             {expense.receiptUrl && (
                 <div className="flex items-center gap-4">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View Receipt</a>
                </div>
            )}

            <div className="space-y-2 pt-4">
                <h4 className="font-semibold">Approval History</h4>
                <div className="space-y-3">
                    {expense.history.map((entry, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div>
                                {entry.status.includes('Approved') ? <CheckCircle2 className="h-5 w-5 text-green-500" />
                                 : entry.status === 'Rejected' ? <XCircle className="h-5 w-5 text-red-500" />
                                 : <Hourglass className="h-5 w-5 text-yellow-500" />
                                }
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium">
                                    {entry.status} by {entry.actor}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {format(new Date(entry.timestamp), 'MMM dd, yyyy, h:mm a')}
                                </p>
                                {entry.comments && (
                                     <p className="text-sm italic mt-1 bg-muted p-2 rounded-md">"{entry.comments}"</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
