import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
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
          <div>
            <h1 className="text-4xl font-bold mb-4">عن باب رزق</h1>
            <p className="text-lg text-muted-foreground">
              منصة التوظيف الحديثة التي تربط بين أفضل المواهب والشركات الرائدة في مصر
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>رسالتنا</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>نحن نؤمن بأن كل شخص يستحق فرصة عمل تناسب مهاراته وطموحاته، وكل شركة تستحق الوصول إلى أفضل المواهب.</p>
              <p>باب رزق تسعى لتسهيل عملية البحث عن الوظائف والتوظيف من خلال منصة حديثة وآمنة وسهلة الاستخدام.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>قيمنا</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <p className="font-semibold">الشفافية</p>
                    <p className="text-sm text-muted-foreground">نؤمن بالشفافية الكاملة في جميع معاملاتنا</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <p className="font-semibold">الأمان</p>
                    <p className="text-sm text-muted-foreground">حماية بيانات المستخدمين هي أولويتنا الأولى</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary font-bold">•</span>
                  <div>
                    <p className="font-semibold">الابتكار</p>
                    <p className="text-sm text-muted-foreground">نسعى دائماً لتحسين خدماتنا وتطويرها</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}
