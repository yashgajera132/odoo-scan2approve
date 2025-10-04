'use client';

import { User } from '@/types';
import { DataTable } from '@/components/dashboard/data-table';
import { userColumns } from './user-columns';

interface UserListProps {
  users: User[];
  onUserUpdated: () => void;
}

export default function UserList({ users, onUserUpdated }: UserListProps) {
  return <DataTable columns={userColumns({ onUserUpdated })} data={users} />;
}
