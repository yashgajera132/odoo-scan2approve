'use client';

import { Bell, Landmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from './auth-provider';
import SidebarNav from './sidebar-nav';
import { useEffect, useState } from 'react';
import { Notification } from '@/types';
import { getNotificationsForUser, markNotificationsAsRead } from '@/lib/data';
import { Badge } from './ui/badge';
import { formatDistanceToNow } from 'date-fns';


export default function AppHeader() {
  const { user, logout } = useAuth();
  const userInitials = user?.name.split(' ').map(n => n[0]).join('') || 'U';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      getNotificationsForUser(user.id).then(userNotifications => {
        setNotifications(userNotifications);
        setUnreadCount(userNotifications.filter(n => !n.read).length);
      });
    }
  }, [user]);

  const handleNotificationOpen = async () => {
    if (user && unreadCount > 0) {
      await markNotificationsAsRead(user.id);
      setUnreadCount(0);
      // Visually mark all as read without re-fetching
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-card/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <Sheet>
          <SheetTrigger asChild>
            <Button size="icon" variant="outline" className="md:hidden">
              <Landmark className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="sm:max-w-xs p-0">
            <SidebarNav />
          </SheetContent>
        </Sheet>
      <div className="relative ml-auto flex-1 md:grow-0" />
      
      <Popover onOpenChange={(open) => open && handleNotificationOpen()}>
        <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative rounded-full">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 justify-center rounded-full p-0">{unreadCount}</Badge>
                )}
                <span className="sr-only">Toggle notifications</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="w-96">
            <div className="grid gap-4">
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">Notifications</h4>
                     <p className="text-sm text-muted-foreground">
                        You have {unreadCount} unread messages.
                    </p>
                </div>
                <div className="grid gap-2">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No new notifications</p>
                  ) : (
                    notifications.map(notification => (
                      <div key={notification.id} className="grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
                          {!notification.read && <span className="flex h-2 w-2 translate-y-1 rounded-full bg-sky-500" />}
                          <div className={`grid gap-1 ${notification.read ? 'col-start-2' : ''}`}>
                              <p className="text-sm font-medium">
                                  {notification.message}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
                              </p>
                          </div>
                      </div>
                    ))
                  )}
                </div>
            </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.avatarUrl} alt={user?.name} data-ai-hint="user avatar" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              {user && <Badge variant={user.role === 'Admin' ? 'destructive' : user.role === 'Manager' ? 'secondary' : 'outline'} className="mt-2 w-fit">{user.role}</Badge>}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Profile</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
