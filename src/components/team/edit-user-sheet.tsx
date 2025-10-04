'use client';
import { useState, useEffect, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User, UserRole } from '@/types';
import { updateUser, getManagers } from '@/lib/data';
import { Loader2 } from 'lucide-react';

interface EditUserSheetProps {
    user: User;
    onUserUpdated: () => void;
    children: ReactNode;
}

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  role: z.enum(['Employee', 'Manager', 'Admin']),
  managerId: z.string().optional(),
});

export default function EditUserSheet({ user, onUserUpdated, children }: EditUserSheetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [managers, setManagers] = useState<User[]>([]);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      managerId: user.managerId,
    },
  });

  useEffect(() => {
    async function loadManagers() {
        const fetchedManagers = await getManagers();
        // Exclude the current user from the list of potential managers
        setManagers(fetchedManagers.filter(m => m.id !== user.id));
    }
    if (isOpen) {
        loadManagers();
    }
  }, [isOpen, user.id]);
  
  useEffect(() => {
    form.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      managerId: user.managerId || '',
    });
  }, [user, form]);

  const selectedRole = form.watch('role');

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    try {
      await updateUser(user.id, {
        name: values.name,
        email: values.email,
        role: values.role as UserRole,
        managerId: values.role === 'Employee' ? values.managerId : undefined,
      });
      toast({
        title: 'User Updated',
        description: `${values.name}'s details have been updated.`,
      });
      onUserUpdated();
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Update Failed',
        description: 'There was an error updating the user.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild onClick={() => setIsOpen(true)}>{children}</SheetTrigger>
      <SheetContent className="sm:max-w-md w-full">
        <SheetHeader>
          <SheetTitle>Edit Team Member</SheetTitle>
          <SheetDescription>Update the details for {user.name}.</SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="e.g., john.doe@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                        </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Employee">Employee</SelectItem>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {selectedRole === 'Employee' && (
                <FormField
                    control={form.control}
                    name="managerId"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Assign Manager</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a manager" />
                            </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                                {managers.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
            )}
            
            <SheetFooter className="pt-4">
                <SheetClose asChild>
                    <Button type="button" variant="outline">Cancel</Button>
                </SheetClose>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
