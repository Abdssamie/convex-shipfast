"use client"

import { useState } from "react"
import { Bell, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import type { Id } from "@/convex/_generated/dataModel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NotificationsPage() {
  const [filter, setFilter] = useState<"all" | "unread">("all")
  const notifications = useQuery(api.notifications.list, {
    paginationOpts: { numItems: 50, cursor: null },
  })
  const markAsRead = useMutation(api.notifications.markAsRead)
  const markAllAsRead = useMutation(api.notifications.markAllAsRead)
  const deleteNotification = useMutation(api.notifications.deleteNotification)

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

  const handleDelete = async (id: Id<"notifications">) => {
    try {
      await deleteNotification({ id })
      toast.success("Notification deleted")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete notification")
    }
  }

  const allNotifications = notifications?.page ?? []
  const filteredNotifications = filter === "unread" 
    ? allNotifications.filter((n) => !n.read)
    : allNotifications

  const unreadCount = allNotifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            Manage your notifications and stay updated
          </p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as "all" | "unread")}>
        <TabsList>
          <TabsTrigger value="all">
            All ({allNotifications.length})
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread ({unreadCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          {filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Bell className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {filter === "unread" ? "No unread notifications" : "No notifications yet"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {filter === "unread" 
                    ? "You're all caught up!" 
                    : "When you receive notifications, they'll appear here"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <Card 
                  key={notification._id}
                  className={!notification.read ? "border-primary/50 bg-accent/50" : ""}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            {notification.title}
                          </CardTitle>
                          {!notification.read && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification._id)}
                          >
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(notification._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{notification.message}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
