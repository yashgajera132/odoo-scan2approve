'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Expense, ExpenseStatus } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, CheckCircle2, XCircle, Hourglass, CircleDot, FileText } from 'lucide-react';
import { useAuth } from '../auth-provider';
import { updateExpenseStatus, getExpenseById } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Input } from '../ui/input';
import ExpenseDetailModal from './expense-detail-modal';


const statusConfig: {
  [key in ExpenseStatus]: { icon: React.ElementType; color: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' };
} = {
  Draft: { icon: CircleDot, color: 'text-gray-500', variant: 'outline' },
  Pending: { icon: Hourglass, color: 'text-yellow-500', variant: 'secondary' },
  Approved: { icon: CheckCircle2, color: 'text-green-500', variant: 'default' },
  Rejected: { icon: XCircle, color: 'text-red-500', variant: 'destructive' },
};

const getStatusText = (expense: Expense) => {
    if (expense.status === 'Pending' && expense.currentApproverStep) {
        if (expense.currentApproverStep > 1) {
            const prevStep = expense.currentApproverStep - 1;
            return `Step ${prevStep} Approved, Pending Step ${expense.currentApproverStep}`;
        }
        return `Pending Approval (Step ${expense.currentApproverStep})`;
    }
    
    if (expense.status === 'Rejected') {
        const rejectedStep = expense.approvers.find(a => a.status === 'Rejected');
        if (rejectedStep) {
            return `Rejected at Step ${rejectedStep.step}`;
        }
    }
    
    return expense.status;
}


export const columns = ({ onUpdate, onViewDetails }: { onUpdate: () => void, onViewDetails: (expenseId: string) => void }): ColumnDef<Expense>[] => [
    {
        accessorKey: 'id',
        header: 'ID',
    },
    {
        accessorKey: 'employeeName',
        header: 'Employee',
    },
    {
        accessorKey: 'description',
        header: 'Description',
    },
    {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => {
            const amount = parseFloat(row.original.convertedAmount?.toFixed(2) || row.original.amount.toFixed(2));
            const currency: string = 'USD'; // Display in company currency
            const originalAmount = parseFloat(row.original.amount.toFixed(2));
            const originalCurrency = row.original.currency;

            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency,
            }).format(amount);
            
            const originalFormatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: originalCurrency,
            }).format(originalAmount);

            return (
                <div className="font-medium">
                    <div>{formatted}</div>
                    {originalCurrency !== 'USD' && <div className="text-xs text-muted-foreground">({originalFormatted})</div>}
                </div>
            );
        },
    },
    {
        accessorKey: 'date',
        header: 'Date',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const expense = row.original;
            const status = expense.status;
            const config = statusConfig[status];
            const statusText = getStatusText(expense);
            return (
                <Badge variant={config.variant} className="capitalize">
                    <config.icon className={`mr-2 h-4 w-4 ${config.color}`} />
                    {statusText}
                </Badge>
            );
        },
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const expense = row.original;
            const { user } = useAuth();
            const { toast } = useToast();
            const [rejectionReason, setRejectionReason] = useState('');
            
            if (!user) return null;

            const handleUpdateStatus = async (newStatus: 'Approved' | 'Rejected', reason?: string) => {
                await updateExpenseStatus(expense.id, newStatus, user.id, reason);
                toast({
                    title: "Expense Updated",
                    description: `Expense ${expense.id} has been ${newStatus.toLowerCase()}.`,
                });
                onUpdate();
            };
            
            const canApprove = user && expense.status === 'Pending' && expense.approvers.some(a => a.approverId === user.id && a.step === expense.currentApproverStep);

            return (
                <AlertDialog>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onViewDetails(expense.id)}>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {canApprove && (
                                <>
                                <DropdownMenuItem onClick={() => handleUpdateStatus('Approved')}>
                                    <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                                    Approve
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                                        Reject
                                    </DropdownMenuItem>
                                </AlertDialogTrigger>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to reject this expense?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Please provide a reason for rejection. This action cannot be undone.
                        </AlertDialogDescription>
                        </AlertDialogHeader>
                        <Input 
                            placeholder="Reason for rejection..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                        />
                        <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                            disabled={!rejectionReason}
                            onClick={() => handleUpdateStatus('Rejected', rejectionReason)}>
                            Confirm Rejection
                        </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

            );
        },
    },
];
