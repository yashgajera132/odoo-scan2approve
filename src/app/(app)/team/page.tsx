'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useAuth } from "@/components/auth-provider";
import { getUsers } from '@/lib/data';
import { User } from '@/types';
import UserList from '@/components/team/user-list';
import AddUserSheet from '@/components/team/add-user-sheet';
import { Skeleton } from '@/components/ui/skeleton';

type View = 'employees' | 'managers';

export default function TeamPage() {
  const { user } = useAuth();
  const [view, setView] = useState<View>('employees');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const allUsers = await getUsers();
    setUsers(allUsers);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'Admin') {
      fetchUsers();
    }
  }, [user]);

  if (user?.role !== 'Admin') {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>
                You do not have permission to view this page.
                </CardDescription>
            </CardHeader>
             <CardContent>
                <p>Only Admins can access Team Management.</p>
            </CardContent>
        </Card>
    );
  }

  const filteredUsers = users.filter(u => {
    if (view === 'employees') return u.role === 'Employee';
    if (view === 'managers') return u.role === 'Manager' || u.role === 'Admin';
    return false;
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Manage your team members and their roles.
              </CardDescription>
            </div>
            <AddUserSheet onUserAdded={fetchUsers} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <Button variant={view === 'employees' ? 'default' : 'outline'} onClick={() => setView('employees')}>
              Employees
            </Button>
            <Button variant={view === 'managers' ? 'default' : 'outline'} onClick={() => setView('managers')}>
              Managers & Admins
            </Button>
          </div>
          {loading ? (
             <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
             </div>
          ) : (
            <UserList users={filteredUsers} onUserUpdated={fetchUsers} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
