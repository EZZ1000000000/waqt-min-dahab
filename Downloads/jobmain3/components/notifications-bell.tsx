"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  is_read: boolean
  created_at: string
}

export function NotificationsBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000) // Poll every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "PATCH",
      })
      setNotifications(notifications.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 bg-destructive rounded-full" />}
      </Button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 z-50">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Notifications</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto space-y-2">
              {notifications.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.is_read ? "bg-background" : "bg-muted"
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notification.title}</p>
                        {notification.message && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{notification.message}</p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.is_read && <Badge className="shrink-0">New</Badge>}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
