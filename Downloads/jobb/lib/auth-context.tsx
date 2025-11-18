"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        
        if (session?.user) {
          setUser(session.user)
        } else {
          const {
            data: { user },
          } = await supabase.auth.getUser()
          setUser(user || null)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user || null)
      
      if (session) {
        try {
          if (typeof window !== "undefined") {
            localStorage.setItem(
              "supabase_session",
              JSON.stringify(session)
            )
          }
        } catch (error) {
          console.error("Error saving session to localStorage:", error)
        }
      } else {
        // Clear session on logout
        if (typeof window !== "undefined") {
          localStorage.removeItem("supabase_session")
        }
      }
    })

    return () => subscription?.unsubscribe()
  }, [supabase])

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
