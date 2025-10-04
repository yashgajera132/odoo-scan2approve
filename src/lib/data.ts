import { Expense, ExpenseStatus, User, UserRole, ApprovalStep, Notification, ApprovalRule } from '@/types';
import { convertCurrency } from './currency';
import { PlaceHolderImages } from './placeholder-images';

let users: User[] = [
    { id: 'usr_employee', name: 'Sarah Johnson', email: 'sarah.j@example.com', role: 'Employee', avatarUrl: PlaceHolderImages.find(i => i.id === 'user-avatar-1')?.imageUrl || '', managerId: 'usr_manager' },
    { id: 'usr_manager', name: 'Michael Smith', email: 'michael.s@example.com', role: 'Manager', avatarUrl: PlaceHolderImages.find(i => i.id === 'user-avatar-2')?.imageUrl || '' },
    { id: 'usr_admin', name: 'David Chen', email: 'david.c@example.com', role: 'Admin', avatarUrl: PlaceHolderImages.find(i => i.id === 'user-avatar-3')?.imageUrl || '' },
    { id: 'usr_finance', name: 'Finance Team', email: 'finance@example.com', role: 'Admin', avatarUrl: 'https://picsum.photos/seed/finance/200/200' },
    { id: 'usr_director', name: 'Company Director', email: 'director@example.com', role: 'Admin', avatarUrl: 'https://picsum.photos/seed/director/200/200' },
    { id: 'usr_cfo', name: 'CFO', email: 'cfo@example.com', role: 'Admin', avatarUrl: 'https://picsum.photos/seed/cfo/200/200' },

];

let expenses: Expense[] = [
  {
    id: 'EXP001',
    employeeId: 'usr_employee',
    employeeName: 'Sarah Johnson',
    description: 'Client Dinner in New York',
    category: 'Meals & Entertainment',
    amount: 150.75,
    currency: 'USD',
    companyId: 'comp_default',
    date: '2024-05-10',
    receiptUrl: '/receipts/receipt1.pdf',
    status: 'Approved',
    approvers: [
        { step: 1, approverId: 'usr_manager', status: 'Approved', approvedAt: '2024-05-11T09:00:00Z' },
        { step: 2, approverId: 'usr_admin', status: 'Approved', approvedAt: '2024-05-11T10:00:00Z' },
    ],
    history: [
      { status: 'Pending', timestamp: '2024-05-10T10:05:00Z', actor: 'System' },
      { status: 'Approved', timestamp: '2024-05-11T09:00:00Z', actor: 'Michael Smith' },
      { status: 'Approved', timestamp: '2024-05-11T10:00:00Z', actor: 'David Chen' },
    ],
  },
  {
    id: 'EXP002',
    employeeId: 'usr_employee',
    employeeName: 'Sarah Johnson',
    description: 'Software Subscription (High Value)',
    category: 'Software',
    amount: 600.0,
    currency: 'USD',
    companyId: 'comp_default',
    date: '2024-05-12',
    receiptUrl: '/receipts/receipt2.jpg',
    status: 'Pending',
    currentApproverStep: 1,
    approvers: [
        { step: 1, approverId: 'usr_manager', status: 'Pending' },
        { step: 2, approverId: 'usr_finance', status: 'Pending' },
    ],
    history: [
        { status: 'Pending', timestamp: '2024-05-12T18:05:00Z', actor: 'System' },
    ],
  },
   {
    id: 'EXP003',
    employeeId: 'usr_manager',
    employeeName: 'Michael Smith',
    description: 'Team Lunch',
    category: 'Meals & Entertainment',
    amount: 250,
    currency: 'EUR',
    companyId: 'comp_default',
    date: '2024-05-15',
    status: 'Pending',
    currentApproverStep: 1,
    approvers: [
        { step: 1, approverId: 'usr_cfo', status: 'Pending' },
    ],
    approvalRule: {
        type: 'SpecificApprover',
        specificApproverId: 'usr_cfo',
    },
    history: [
        { status: 'Pending', timestamp: '2024-05-15T14:00:00Z', actor: 'System' },
    ],
  },
];

let notifications: Notification[] = [];


const getExpenses = async (): Promise<Expense[]> => {
  const processedExpenses = await Promise.all(expenses.map(async (exp) => {
    if (exp.currency !== 'USD') {
        try {
            exp.convertedAmount = await convertCurrency(exp.amount, exp.currency, 'USD');
        } catch(e) {
            console.error(`Failed to convert currency for expense ${exp.id}`);
            exp.convertedAmount = exp.amount;
        }
    } else {
        exp.convertedAmount = exp.amount;
    }
    return exp;
  }));
  return Promise.resolve(processedExpenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
};

export const getExpenseById = async (expenseId: string): Promise<Expense | undefined> => {
    const expense = expenses.find(e => e.id === expenseId);
    if (!expense) return undefined;

    const populatedExpense = { ...expense };
    
    // Populate approver names
    populatedExpense.approvers = populatedExpense.approvers.map(approverStep => {
        const approverUser = users.find(u => u.id === approverStep.approverId);
        return { ...approverStep, approverName: approverUser?.name || 'Unknown User' };
    });

    return Promise.resolve(populatedExpense);
};

export const getUsers = async (): Promise<User[]> => {
    const usersWithManagerNames = users.map(user => {
        if (user.managerId) {
            const manager = users.find(m => m.id === user.managerId);
            return { ...user, managerName: manager?.name || 'N/A' };
        }
        return user;
    });
    return Promise.resolve(usersWithManagerNames);
}

export const getManagers = async (): Promise<User[]> => {
    return Promise.resolve(users.filter(u => u.role === 'Manager' || u.role === 'Admin'));
}

export const addUser = async (userData: Omit<User, 'id' | 'avatarUrl'>): Promise<User> => {
    const newUser: User = {
        ...userData,
        id: `usr_${Math.random().toString(36).substr(2, 9)}`,
        avatarUrl: `https://picsum.photos/seed/${Math.random()}/200/200`,
    };
    users.push(newUser);
    return Promise.resolve(newUser);
}

export const updateUser = async (userId: string, userData: Partial<Omit<User, 'id'>>): Promise<User | undefined> => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) {
        return undefined;
    }
    
    const updatedUser = { ...users[userIndex], ...userData };

    if (userData.role && userData.role !== 'Employee') {
        updatedUser.managerId = undefined;
    }

    users[userIndex] = updatedUser;
    
    // Also update manager for other users if this user is no longer a manager
    if(userData.role && userData.role === 'Employee'){
        users = users.map(u => u.managerId === userId ? {...u, managerId: undefined} : u);
    }

    return Promise.resolve(updatedUser);
}


export const getExpensesForUser = async (userId: string): Promise<Expense[]> => {
  const allExpenses = await getExpenses();
  return allExpenses.filter((exp) => exp.employeeId === userId);
};

export const getExpensesForApproval = async (userId: string): Promise<Expense[]> => {
  const allExpenses = await getExpenses();
  // Return all expenses where the user is an approver, regardless of status.
  return allExpenses.filter(exp => 
    exp.approvers.some(a => a.approverId === userId)
  );
};

export const getNotificationsForUser = async (userId: string): Promise<Notification[]> => {
    const user = users.find(u => u.id === userId);
    if (!user) return [];

    let currentNotifications = [...notifications];

    // Clear old dynamic notifications to regenerate them
    currentNotifications = currentNotifications.filter(n => !n.id.startsWith('notif-approval-') && !n.id.startsWith('notif-status-'));


    if (user.role === 'Manager' || user.role === 'Admin') {
        const approvalExpenses = await getExpensesForApproval(userId);
        approvalExpenses.forEach(exp => {
            const notifId = `notif-approval-${exp.id}-${userId}-${exp.currentApproverStep}-${new Date().getTime()}`;
            const existingNotif = currentNotifications.find(n => n.expenseId === exp.id && n.userId === userId && n.message.includes('needs your approval'));
            if (!existingNotif && exp.status === 'Pending' && exp.approvers.some(a => a.approverId === userId && a.step === exp.currentApproverStep)) {
                 const newNotif: Notification = {
                    id: notifId,
                    userId: userId,
                    expenseId: exp.id,
                    message: `New expense from ${exp.employeeName} for ${exp.amount} ${exp.currency} needs your approval.`,
                    timestamp: new Date().toISOString(),
                    read: false,
                };
                currentNotifications.push(newNotif);
            }
        });
    }

    const userExpenses = await getExpensesForUser(userId);
    userExpenses.forEach(exp => {
        if (!exp.history || exp.history.length === 0) return;
        const lastHistory = exp.history[exp.history.length - 1];
        const prevHistory = exp.history.length > 1 ? exp.history[exp.history.length - 2] : null;

        if (prevHistory && prevHistory.status !== lastHistory.status) {
             const notifId = `notif-status-${exp.id}-${userId}-${lastHistory.timestamp}`;
             const existingNotif = currentNotifications.find(n => n.id === notifId);
             if (!existingNotif) {
                  const newNotif: Notification = {
                     id: notifId,
                     userId: userId,
                     expenseId: exp.id,
                     message: `Your expense "${exp.description}" was ${exp.status.toLowerCase()}.`,
                     timestamp: lastHistory.timestamp,
                     read: false,
                 };
                 currentNotifications.push(newNotif);
             }
        }
    });

    notifications = currentNotifications;

    return Promise.resolve(
        notifications
            .filter(n => n.userId === userId)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    );
}

export const markNotificationsAsRead = async (userId: string): Promise<void> => {
    notifications = notifications.map(n => 
        n.userId === userId ? { ...n, read: true } : n
    );
    return Promise.resolve();
}


export const addExpense = async (expenseData: Omit<Expense, 'id' | 'history' | 'status' | 'approvers' | 'companyId' > & { employeeId: string }): Promise<Expense> => {
  const employee = users.find(u => u.id === expenseData.employeeId);
  if (!employee) throw new Error("Employee not found");
  
  const newId = `EXP${(expenses.length + 1).toString().padStart(3, '0')}`;
  
  const approvers: ApprovalStep[] = [];
  let currentStep = 1;

  // Step 1: Manager
  if (employee.managerId) {
      approvers.push({ step: currentStep++, approverId: employee.managerId, status: 'Pending' });
  }

  // Step 2: Admin (always)
  approvers.push({ step: currentStep++, approverId: 'usr_admin', status: 'Pending' });
  
  const amountInUSD = await convertCurrency(expenseData.amount, expenseData.currency, 'USD');

  // Step 3 (Conditional): Finance for amounts > $500
  if (amountInUSD > 500) {
      // Insert before Admin to keep Admin last among standard approvers
      const adminIndex = approvers.findIndex(a => a.approverId === 'usr_admin');
      if (adminIndex !== -1) {
          approvers.splice(adminIndex, 0, { step: 0, approverId: 'usr_finance', status: 'Pending' });
          // Re-number steps
          approvers.forEach((a, i) => a.step = i + 1);
          currentStep = approvers.length + 1;
      }
  }

  // Step 4 (Conditional): Director for amounts > $1000
  if (amountInUSD > 1000) {
       approvers.push({ step: currentStep++, approverId: 'usr_director', status: 'Pending' });
  }
  
  // If no manager was assigned, Admin is the first approver.
  if (!employee.managerId) {
    const adminApproval = approvers.find(a => a.approverId === 'usr_admin');
    if (adminApproval) {
        const otherApprovers = approvers.filter(a => a.approverId !== 'usr_admin');
        const newApprovers = [adminApproval, ...otherApprovers];
        newApprovers.forEach((a, i) => a.step = i + 1);
        approvers.splice(0, approvers.length, ...newApprovers);
    }
  }


  const newExpense: Expense = {
    ...expenseData,
    id: newId,
    status: 'Pending',
    companyId: 'comp_default',
    approvers,
    currentApproverStep: approvers.length > 0 ? 1 : undefined,
    history: [
        { status: 'Pending', timestamp: new Date().toISOString(), actor: 'System' },
    ]
  };
  expenses.unshift(newExpense);
  return Promise.resolve(newExpense);
};

const checkApprovalRules = (expense: Expense, actorId: string): { newStatus: ExpenseStatus, nextStep?: number } => {
    const rule = expense.approvalRule;
    if (!rule) { // Standard sequential approval
        const currentStepIndex = expense.approvers.findIndex(a => a.step === expense.currentApproverStep);
        if (currentStepIndex === expense.approvers.length - 1) {
            return { newStatus: 'Approved' };
        } else {
            return { newStatus: 'Pending', nextStep: expense.approvers[currentStepIndex + 1].step };
        }
    }

    const { type, percentage, specificApproverId } = rule;
    const totalApprovers = expense.approvers.length;
    const approvedCount = expense.approvers.filter(a => a.status === 'Approved').length;

    // Specific approver rule takes precedence
    if ((type === 'SpecificApprover' || type === 'Hybrid') && specificApproverId === actorId) {
        return { newStatus: 'Approved' };
    }

    // Percentage rule
    if ((type === 'Percentage' || type === 'Hybrid') && percentage) {
        const requiredApprovals = Math.ceil(totalApprovers * (percentage / 100));
        if (approvedCount >= requiredApprovals) {
            return { newStatus: 'Approved' };
        }
    }
    
    // If no rule-based approval, check if it's the end of the line sequentially
     const currentStepIndex = expense.approvers.findIndex(a => a.step === expense.currentApproverStep);
     if (currentStepIndex === expense.approvers.length - 1) {
         // This was the last person in the list, but rules weren't met
         return { newStatus: 'Pending', nextStep: undefined }; // Stays pending
     }

    // Default to sequential if no rules are met yet
    return { newStatus: 'Pending', nextStep: expense.approvers[currentStepIndex + 1]?.step };
}


export const updateExpenseStatus = async (
  expenseId: string,
  newStatus: 'Approved' | 'Rejected',
  actorId: string,
  comments?: string
): Promise<Expense | undefined> => {
  const expenseIndex = expenses.findIndex((exp) => exp.id === expenseId);
  if (expenseIndex === -1) {
    return undefined;
  }

  const updatedExpense = { ...expenses[expenseIndex] };
  const actor = users.find(u => u.id === actorId);
  if (!actor) throw new Error("Actor not found");

  if (updatedExpense.status !== 'Pending' || !updatedExpense.currentApproverStep) {
      throw new Error("This expense is not currently pending approval.");
  }
  
  const relevantApproverIndex = updatedExpense.approvers.findIndex(a => (a.approverId === actorId && (a.status === 'Pending' || !updatedExpense.approvalRule)) || (a.step === updatedExpense.currentApproverStep && updatedExpense.approvalRule) );

  if (relevantApproverIndex === -1) {
      throw new Error("User not authorized to approve/reject this expense.");
  }
  
  updatedExpense.approvers[relevantApproverIndex].status = newStatus;
  updatedExpense.approvers[relevantApproverIndex].approvedAt = new Date().toISOString();
  if (comments) {
    updatedExpense.approvers[relevantApproverIndex].comments = comments;
  }

  const historyEntryStatus = newStatus === 'Approved' ? `Approved by ${actor.name}` as any : 'Rejected';
  updatedExpense.history.push({ status: historyEntryStatus, timestamp: new Date().toISOString(), actor: actor.name, comments });

  if (newStatus === 'Rejected') {
      updatedExpense.status = 'Rejected';
      updatedExpense.rejectionReason = comments;
      updatedExpense.currentApproverStep = undefined;
  } else { // Approved
      const approvalResult = checkApprovalRules(updatedExpense, actorId);
      updatedExpense.status = approvalResult.newStatus;
      
      if (approvalResult.newStatus === 'Approved') {
        updatedExpense.currentApproverStep = undefined;
      } else {
        updatedExpense.currentApproverStep = approvalResult.nextStep;
      }
  }

  expenses[expenseIndex] = updatedExpense;
  return Promise.resolve(updatedExpense);
};
