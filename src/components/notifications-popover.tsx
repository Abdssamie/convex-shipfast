"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import type { Id } from "@/convex/_generated/dataModel"

export function NotificationsPopover() {
  const unreadCount = useQuery(api.notifications.getUnreadCount)
  const notifications = useQuery(api.notifications.list, {
    paginationOpts: { numItems: 10, cursor: null },
  })
  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)

  const handleMarkAsRead = async (id: Id<"notifications">) => {
    try {
      await markAsRead({ id })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark notification as read")
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead()
      toast.success("All notifications marked as read")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to mark all as read")
    }
  }

  const recentNotifications = notifications?.page ?? []

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount !== undefined && unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount !== undefined && unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-primary hover:underline"
              onClick={handleMarkAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentNotifications.map((notification) => (
                <button
                  key={notification._id}
                  className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors ${
                    !notification.read ? "bg-accent/50" : ""
                  }`}
                  onClick={() => handleMarkAsRead(notification._id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {notification.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
             <div className="h-2 w-2 rounded-full bg-primary mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="border-t px-4 py-3">
          <Link href="/notifications">
            <Button variant="ghost" size="sm" className="w-full">
              View all notifications
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
