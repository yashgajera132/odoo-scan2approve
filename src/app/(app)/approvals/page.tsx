'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import { getExpensesForApproval } from '@/lib/data';
import { Expense, User, ExpenseStatus } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/dashboard/data-table';
import { columns } from '@/components/dashboard/columns';

type FilterStatus = 'all' | ExpenseStatus;

export default function ApprovalsPage() {
  const { user } = useAuth();
  const [allApprovalExpenses, setAllApprovalExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>('all');

  const fetchExpenses = async (currentUser: User) => {
    setLoading(true);
    const approvalExpensesData = await getExpensesForApproval(currentUser.id);
    setAllApprovalExpenses(approvalExpensesData);
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchExpenses(user);
    }
  }, [user]);

  const handleStatusUpdate = () => {
    if (user) {
      fetchExpenses(user);
    }
  };

  if (loading || !user) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-80 w-full" />
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (user.role === 'Employee') {
    return (
      <div>
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const filteredExpenses =
    filter === 'all'
      ? allApprovalExpenses
      : allApprovalExpenses.filter((expense) => {
          if (filter === 'Pending') {
            // Show if the overall status is Pending and it's the user's turn to approve
            return expense.status === 'Pending' && expense.approvers.some(a => a.approverId === user.id && a.step === expense.currentApproverStep);
          }
          if (filter === 'Approved') {
            // Show if the user has approved it at some step
            return expense.approvers.some(a => a.approverId === user.id && a.status === 'Approved');
          }
           if (filter === 'Rejected') {
            // Show if the user has rejected it at some step
            return expense.approvers.some(a => a.approverId === user.id && a.status === 'Rejected');
          }
          return false;
        });

  const pendingCount = allApprovalExpenses.filter(exp => exp.status === 'Pending' && exp.approvers.some(a => a.approverId === user.id && a.step === exp.currentApproverStep)).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Approvals</h1>
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Expense History</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('all')}
              >
                All
              </Button>
              <Button
                variant={filter === 'Pending' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('Pending')}
                className="relative"
              >
                Pending
                {pendingCount > 0 && <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">{pendingCount}</span>}
              </Button>
              <Button
                variant={filter === 'Approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('Approved')}
              >
                Approved
              </Button>
              <Button
                variant={filter === 'Rejected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter('Rejected')}
              >
                Rejected
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns({ onUpdate: handleStatusUpdate, onViewDetails: () => {} })} data={filteredExpenses} />
        </CardContent>
      </Card>
    </div>
  );
}
