"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Shield, X } from "lucide-react"
import { useRouter } from "next/navigation"

interface VerificationManagementClientProps {
  employerId: string
  isVerified: boolean
  companyName: string
}

export function VerificationManagementClient({
  employerId,
  isVerified,
  companyName,
}: VerificationManagementClientProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [action, setAction] = useState<"verify" | "unverify">("verify")
  const router = useRouter()
  const supabase = createClient()

  const handleVerification = async () => {
    setIsLoading(true)
    try {
      if (action === "unverify") {
        // حذف سجل التوثيق
        const { error: deleteError } = await supabase
          .from("verification_services")
          .delete()
          .eq("employer_id", employerId)

        if (deleteError) throw deleteError
      }

      const { error } = await supabase
        .from("employers")
        .update({ verified: action === "verify" })
        .eq("id", employerId)

      if (error) throw error

      // Create verification service record if verifying
      if (action === "verify") {
        const { error: serviceError } = await supabase.from("verification_services").insert({
          employer_id: employerId,
          service_type: "company_verification",
          status: "active",
          price: 500,
          currency: "EGP",
          contact_phone: "+20100000000",
          activated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        })

        if (serviceError) throw serviceError
      }

      router.refresh()
      setShowDialog(false)
    } catch (error) {
      console.error("Error updating verification:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="flex gap-2">
        {!isVerified ? (
          <Button
            size="sm"
            onClick={() => {
              setAction("verify")
              setShowDialog(true)
            }}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-1"
          >
            <Shield className="w-4 h-4" />
            توثيق
          </Button>
        ) : (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              setAction("unverify")
              setShowDialog(true)
            }}
            className="flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            إلغاء التوثيق
          </Button>
        )}
      </div>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{action === "verify" ? "توثيق الشركة" : "إلغاء توثيق الشركة"}</AlertDialogTitle>
            <AlertDialogDescription>
              {action === "verify"
                ? `هل أنت متأكد من رغبتك في توثيق شركة "${companyName}"؟ ستظهر علامة التوثيق على ملفها الشخصي والوظائف الخاصة بها.`
                : `هل أنت متأكد من رغبتك في إلغاء توثيق شركة "${companyName}"؟ ستختفي علامة التوثيق من ملفها الشخصي والوظائف الخاصة بها.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleVerification}
              disabled={isLoading}
              className={action === "verify" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              {isLoading ? "جاري..." : action === "verify" ? "توثيق" : "إلغاء التوثيق"}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
