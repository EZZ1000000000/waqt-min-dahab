import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function PrivacyPage() {
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
          <h1 className="text-4xl font-bold">سياسة الخصوصية</h1>

          <div className="space-y-6 text-muted-foreground">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">1. جمع البيانات</h2>
              <p>نقوم بجمع البيانات الشخصية التي تقدمها لنا طواعية عند التسجيل أو استخدام خدماتنا.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">2. استخدام البيانات</h2>
              <p>نستخدم بيانات المستخدمين لتحسين خدماتنا وتقديم تجربة أفضل لك.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">3. حماية البيانات</h2>
              <p>نتخذ جميع الإجراءات اللازمة لحماية بيانات المستخدمين من الوصول غير المصرح به.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">4. حقوقك</h2>
              <p>لديك الحق في الوصول إلى بيانات الشخصية وتعديلها أو حذفها في أي وقت.</p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mb-3">5. التواصل</h2>
              <p>إذا كان لديك أي أسئلة حول سياسة الخصوصية، يرجى التواصل معنا.</p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
