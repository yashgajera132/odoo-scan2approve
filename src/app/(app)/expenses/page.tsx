'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import EmployeeDashboard from '@/components/dashboard/employee-dashboard';
import { getExpensesForUser } from '@/lib/data';
import { Expense, User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ExpensesPage() {
  const { user } = useAuth();
  const [userExpenses, setUserExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData(currentUser: User) {
      setLoading(true);
      const userExpensesData = await getExpensesForUser(currentUser.id);
      setUserExpenses(userExpensesData);
      setLoading(false);
    }
    if (user) {
      fetchData(user);
    }
  }, [user]);

  const handleStatusUpdate = async () => {
     if (user) {
        setLoading(true);
        const userExpensesData = await getExpensesForUser(user.id);
        setUserExpenses(userExpensesData);
        setLoading(false);
    }
  }

  if (loading || !user) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-80 w-full" />
        </div>
    )
  }

  return (
    <EmployeeDashboard expenses={userExpenses} onUpdate={handleStatusUpdate} />
  );
}
