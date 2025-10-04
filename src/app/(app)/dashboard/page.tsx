'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';
import EmployeeDashboard from '@/components/dashboard/employee-dashboard';
import ManagerDashboard from '@/components/dashboard/manager-dashboard';
import { getExpensesForUser, getExpensesForApproval } from '@/lib/data';
import { Expense, User } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user } = useAuth();
  const [userExpenses, setUserExpenses] = useState<Expense[]>([]);
  const [approvalExpenses, setApprovalExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData(currentUser: User) {
      setLoading(true);
      if (currentUser.role === 'Employee') {
        const userExpensesData = await getExpensesForUser(currentUser.id);
        setUserExpenses(userExpensesData);
      } else {
        const [userExpensesData, approvalExpensesData] = await Promise.all([
          getExpensesForUser(currentUser.id),
          getExpensesForApproval(currentUser.id),
        ]);
        setUserExpenses(userExpensesData);
        // For dashboard, only show expenses that are pending the manager's approval
        const pendingApprovals = approvalExpensesData.filter(exp => 
            exp.status === 'Pending' &&
            exp.approvers.some(a => a.approverId === currentUser.id && a.step === exp.currentApproverStep)
        );
        setApprovalExpenses(pendingApprovals);
      }
      setLoading(false);
    }
    if (user) {
      fetchData(user);
    }
  }, [user]);

  const handleStatusUpdate = async () => {
     if (user) {
        setLoading(true);
        if (user.role === 'Employee') {
            const userExpensesData = await getExpensesForUser(user.id);
            setUserExpenses(userExpensesData);
        } else {
            const [userExpensesData, approvalExpensesData] = await Promise.all([
                getExpensesForUser(user.id),
                getExpensesForApproval(user.id),
            ]);
            setUserExpenses(userExpensesData);
            const pendingApprovals = approvalExpensesData.filter(exp => 
                exp.status === 'Pending' &&
                exp.approvers.some(a => a.approverId === user.id && a.step === exp.currentApproverStep)
            );
            setApprovalExpenses(pendingApprovals);
        }
        setLoading(false);
    }
  }


  if (loading || !user) {
    return (
        <div className="space-y-4">
            <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-80 w-full" />
             <Skeleton className="h-10 w-1/4" />
            <Skeleton className="h-64 w-full" />
        </div>
    )
  }

  return (
    <div className="space-y-8">
      {user.role === 'Employee' ? (
        <EmployeeDashboard expenses={userExpenses} onUpdate={handleStatusUpdate} />
      ) : (
        <ManagerDashboard 
            userExpenses={userExpenses} 
            approvalExpenses={approvalExpenses}
            onUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
