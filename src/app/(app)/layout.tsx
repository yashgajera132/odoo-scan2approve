'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-provider';
import AppHeader from '@/components/header';
import SidebarNav from '@/components/sidebar-nav';
import { Skeleton } from '@/components/ui/skeleton';
import ExpenseDetailModal from '@/components/dashboard/expense-detail-modal';
import { Expense } from '@/types';
import { getExpenseById } from '@/lib/data';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const handleViewDetails = async (expenseId: string) => {
    const expense = await getExpenseById(expenseId);
    if(expense) {
      setSelectedExpense(expense);
    }
  };

  const handleCloseModal = () => {
    setSelectedExpense(null);
  };

  if (loading || !user) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background">
      <SidebarNav />
      <div className="flex flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
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
