"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { Bell } from "lucide-react"

interface Notification {
  id: string
  type: string
  title: string
  message: string | null
  is_read: boolean
  created_at: string
}

const typeColors: Record<string, string> = {
  job_match: "bg-blue-100 text-blue-800",
  application_update: "bg-purple-100 text-purple-800",
  new_job: "bg-green-100 text-green-800",
  message: "bg-yellow-100 text-yellow-800",
}

const typeLabels: Record<string, string> = {
  job_match: "وظيفة مطابقة",
  application_update: "تحديث الطلب",
  new_job: "وظيفة جديدة",
  message: "رسالة",
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setIsLoading(false)
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

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">الإشعارات</h1>
        <p className="text-muted-foreground mt-2">ابقَ على اطلاع بآخر تحديثات طلباتك والوظائف</p>
      </div>

      {notifications.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <Bell className="w-6 h-6" />
            </EmptyMedia>
            <EmptyTitle>لا توجد إشعارات</EmptyTitle>
            <EmptyDescription>أنت محدث بكل شيء! تحقق لاحقاً للحصول على التحديثات.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`cursor-pointer transition-colors ${notification.is_read ? "" : "border-primary"}`}
              onClick={() => handleMarkAsRead(notification.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-base">{notification.title}</CardTitle>
                    {notification.message && <CardDescription>{notification.message}</CardDescription>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge className={typeColors[notification.type] || "bg-gray-100 text-gray-800"}>
                      {typeLabels[notification.type] || notification.type}
                    </Badge>
                    {!notification.is_read && <Badge>جديد</Badge>}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleDateString("ar-EG")} في{" "}
                  {new Date(notification.created_at).toLocaleTimeString("ar-EG")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
