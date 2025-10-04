'use client';

import { ColumnDef } from '@tanstack/react-table';
import { User } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import EditUserSheet from './edit-user-sheet';

export const userColumns = ({ onUserUpdated }: { onUserUpdated: () => void }): ColumnDef<User>[] => [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => {
        const user = row.original;
        const userInitials = user.name.split(' ').map(n => n[0]).join('');
        return (
            <div className="flex items-center gap-3">
                <Avatar>
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                </Avatar>
                <div>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
            </div>
        )
    }
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => {
      const role = row.original.role;
      return <Badge variant={role === 'Admin' ? 'destructive' : role === 'Manager' ? 'secondary' : 'outline'}>{role}</Badge>;
    },
  },
  {
    accessorKey: 'managerName',
    header: 'Manager',
     cell: ({ row }) => {
      return row.original.managerName || 'N/A';
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original;
      return (
        <EditUserSheet user={user} onUserUpdated={onUserUpdated}>
            <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Edit User
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete User</DropdownMenuItem>
            </DropdownMenuContent>
            </DropdownMenu>
        </EditUserSheet>
      );
    },
  },
];
