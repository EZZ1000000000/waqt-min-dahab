import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            باب رزق
          </Link>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">دخول</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>إنشاء حساب</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold">الشروط والأحكام</h1>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. قبول الشروط</h2>
              <p>باستخدام منصة باب رزق، فإنك توافق على الالتزام بجميع الشروط والأحكام المذكورة هنا.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">2. استخدام المنصة</h2>
              <p>يجب عليك استخدام المنصة بطريقة قانونية وأخلاقية ولا تنتهك حقوق الآخرين.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">3. المسؤولية</h2>
              <p>باب رزق غير مسؤولة عن أي أضرار قد تنجم عن استخدام المنصة.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">4. الملكية الفكرية</h2>
              <p>جميع المحتوى على المنصة محمي بحقوق الملكية الفكرية.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">5. التعديلات</h2>
              <p>نحتفظ بالحق في تعديل هذه الشروط والأحكام في أي وقت.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
