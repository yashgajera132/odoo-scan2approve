'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Landmark,
  Receipt,
  Users,
  CheckSquare,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from './auth-provider';
import { Badge } from './ui/badge';
import { useEffect, useState } from 'react';
import { getExpensesForApproval } from '@/lib/data';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/expenses', icon: Receipt, label: 'My Expenses' },
  { href: '/approvals', icon: CheckSquare, label: 'Approvals', roles: ['Manager', 'Admin'] },
  { href: '/team', icon: Users, label: 'Team Management', roles: ['Admin'] },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [approvalCount, setApprovalCount] = useState(0);

  useEffect(() => {
    if (user && (user.role === 'Manager' || user.role === 'Admin')) {
        getExpensesForApproval(user.id).then(expenses => {
            setApprovalCount(expenses.length);
        });
    }
  }, [user]);

  return (
    <aside className="sticky top-0 h-screen w-64 flex-col border-r bg-card p-4 hidden md:flex">
      <div className="flex items-center gap-2 px-2 pb-4 border-b mb-4">
        <Landmark className="h-8 w-8 text-primary" />
        <h1 className="text-xl font-bold font-headline">ExpenseFlow</h1>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          if (item.roles && (!user || !item.roles.includes(user.role))) {
            return null;
          }
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                isActive && 'bg-primary/10 text-primary'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.label === 'Approvals' && approvalCount > 0 && <Badge variant="destructive" className="ml-auto">{approvalCount}</Badge>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
