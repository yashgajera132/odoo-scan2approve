'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Expense } from '@/types';
import { DataTable } from './data-table';
import { columns } from './columns';
import SubmitExpenseSheet from '../submit-expense-sheet';
import { useState } from 'react';
import { getExpenseById } from '@/lib/data';
import ExpenseDetailModal from './expense-detail-modal';

interface ManagerDashboardProps {
  userExpenses: Expense[];
  approvalExpenses: Expense[];
  onUpdate: () => void;
}

export default function ManagerDashboard({ userExpenses, approvalExpenses, onUpdate }: ManagerDashboardProps) {
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);

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
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold font-headline">Pending Approvals</h1>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns({ onUpdate, onViewDetails: handleViewDetails })} data={approvalExpenses} onRowClick={(row) => handleViewDetails(row.original.id)} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
         <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold font-headline">My Expenses</h1>
            <SubmitExpenseSheet onExpenseSubmitted={onUpdate}/>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>My Recent Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable columns={columns({ onUpdate, onViewDetails: handleViewDetails })} data={userExpenses} onRowClick={(row) => handleViewDetails(row.original.id)} />
          </CardContent>
        </Card>
      </div>
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
