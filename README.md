# ExpenseFlow

ExpenseFlow is a modern, intelligent expense management application designed to streamline the process of submitting, tracking, and approving expenses. Built with Next.js, Firebase, and Genkit, it offers a seamless and powerful experience for employees, managers, and administrators.

## Key Features

- *Simplified Expense Submission*: Employees can quickly submit expenses through an intuitive form.
- *AI-Powered Receipt Scanning*: Uses OCR and a Genkit AI flow to scan receipt images, extract key information (amount, vendor, date), and auto-fill the expense form.
- *Dynamic Multi-Level Approval Workflows*: 
  - Expenses are automatically routed through a pre-defined chain of approvers (e.g., manager, then admin).
  - The system ensures an expense is only marked as "Approved" after all required approvers have signed off.
- *Role-Based Access Control*: The application supports three distinct user roles with tailored permissions:
  - *Employee*: Can submit and track their own expenses.
  - *Manager*: Can approve or reject expenses for their direct reports and manage their own expenses.
  - *Admin*: Has full oversight, can manage users, and can act as a final approver.
- *Real-Time Notifications*: Users receive instant notifications for important events, such as when an expense requires their approval or when one of their submissions has been approved or rejected.
- *Professional UI/UX*: Designed with ShadCN UI components and Tailwind CSS for a clean, responsive, and modern user experience.

## Tech Stack

- *Frontend*: [Next.js](https://nextjs.org/) (with App Router) & [React](https://react.dev/)
- *Styling*: [Tailwind CSS](https://tailwindcss.com/) & [ShadCN UI](https://ui.shadcn.com/)
- *AI/Generative*: [Genkit](https://firebase.google.com/docs/genkit) for AI flows and receipt data extraction.
- *OCR*: [Tesseract.js](https://tesseract.projectnaptha.com/) for in-browser receipt scanning.
- *State Management*: React Context API & react-hook-form for form management.

## Getting Started

1.  *Dependencies*: All necessary packages are listed in package.json. They will be automatically installed.
2.  *Running the App*: Use the standard command to start the Next.js development server:
    bash
    npm run dev
    
3.  *Accessing the App*: The application will be available at the local URL provided by the development environment (e.g., http://localhost:9002).

## User Roles for Testing

The application uses a mock authentication system that allows you to log in as different user roles without needing to create accounts. On the login page, you can enter any email and password, then select one of the following roles to test its specific features:

-   *Employee*: sarah.j@example.com
-   *Manager*: michael.s@example.com
-   *Admin*: david.c@example.com
