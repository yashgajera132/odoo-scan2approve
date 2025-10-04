'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Expense, ExpenseStatus } from '@/types';
import { DataTable } from './data-table';
import { columns } from './columns';
import SubmitExpenseSheet from '../submit-expense-sheet';
import { Button } from '@/components/ui/button';
import { getExpenseById } from '@/lib/data';
import ExpenseDetailModal from './expense-detail-modal';

interface EmployeeDashboardProps {
  expenses: Expense[];
  onUpdate: () => void;
}

type FilterStatus = 'all' | ExpenseStatus;

export default function EmployeeDashboard({ expenses, onUpdate }: EmployeeDashboardProps) {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

  const filteredExpenses =
    filter === 'all'
      ? expenses
      : expenses.filter((expense) => expense.status === filter);

  const handleViewDetails = async (expenseId: string) => {
    const expense = await getExpenseById(expenseId);
    if (expense) {
      setSelectedExpense(expense);
    }
  };

  const handleCloseModal = () => {
    setSelectedExpense(null);
  };


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">My Expenses</h1>
        <SubmitExpenseSheet onExpenseSubmitted={onUpdate} />
      </div>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle>Recent Submissions</CardTitle>
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
              >
                Pending
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
          <DataTable columns={columns({ onUpdate, onViewDetails: handleViewDetails })} data={filteredExpenses} onRowClick={(row) => handleViewDetails(row.original.id)} />
        </CardContent>
      </Card>
      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          isOpen={!!selectedExpense}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
