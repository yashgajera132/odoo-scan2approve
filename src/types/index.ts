
export type UserRole = 'Employee' | 'Manager' | 'Admin';

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  managerId?: string;
  managerName?: string;
};

export type Company = {
  id: string;
  name: string;
  defaultCurrency: string;
};

export type ExpenseStatus =
  | 'Draft'
  | 'Pending'
  | 'Approved'
  | 'Rejected';

export type ApprovalStep = {
    step: number;
    approverId: string;
    approverName?: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    approvedAt?: string;
    comments?: string;
}

export type ApprovalRule = {
    type: 'Percentage' | 'SpecificApprover' | 'Hybrid';
    percentage?: number; // e.g. 60 for 60%
    specificApproverId?: string;
}

export type Expense = {
  id: string;
  employeeId: string;
  employeeName:string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  convertedAmount?: number;
  companyId: string;
  date: string;
  receiptUrl?: string;
  status: ExpenseStatus;
  currentApproverStep?: number;
  approvers: ApprovalStep[];
  approvalRule?: ApprovalRule;
  history: {
    status: ExpenseStatus | string;
    timestamp: string;
    actor: string;
    comments?: string;
  }[];
  rejectionReason?: string;
  vendor?: string;
};

export type Notification = {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  expenseId: string;
  userId: string;
};
