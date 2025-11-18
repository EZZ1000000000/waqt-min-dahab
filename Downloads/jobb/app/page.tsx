import { CardDescription } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, TrendingUp, CheckCircle, ArrowLeft, MapPin, Shield } from 'lucide-react'
import { createClient } from "@/lib/supabase/server"
import { HeroSlider } from "@/components/hero-slider"

async function getFeaturedJobs() {
  const supabase = await createClient()
  const { data: jobs } = await supabase
    .from("jobs")
    .select(
      "id, title, location, job_type, salary_min, salary_max, currency, employer_id, image_url, employers(company_name, company_logo_url, verified)",
    )
    .eq("status", "active")
    .limit(6)
    .order("created_at", { ascending: false })

  if (jobs && jobs.length > 0) {
    const jobsWithVerification = await Promise.all(
      jobs.map(async (job) => {
        const { data: verificationData } = await supabase
          .from("verification_services")
          .select("status") // Only select status column
          .eq("employer_id", job.employer_id)
          .eq("status", "active")
          .maybeSingle()

        return {
          ...job,
          isVerified: !!verificationData,
        }
      }),
    )
    return jobsWithVerification
  }

  return []
}

async function getHeroSlides() {
  const supabase = await createClient()
  const { data: slides } = await supabase
    .from("hero_slider")
    .select("*")
    .eq("is_active", true)
    .order("order_index", { ascending: true })
  return slides || []
}

async function getCategories() {
  const supabase = await createClient()
  const { data: categories } = await supabase
    .from("job_categories")
    .select("*")
    .order("name", { ascending: true })
    .limit(6) // Changed from 12 to 6 categories
  return categories || []
}

export default async function Home() {
  const featuredJobs = await getFeaturedJobs()
  const heroSlides = await getHeroSlides()
  const categories = await getCategories()

  const isCompanyVerified = (job: any) => {
    return job.isVerified === true
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background">
      {heroSlides.length > 0 && <HeroSlider slides={heroSlides} />}

      {/* Categories Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">استكشف الفئات</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category: any) => (
            <Link key={category.id} href={`/jobs?category=${category.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer overflow-hidden group">
                {category.image_url ? (
                  <div className="relative w-full h-40 bg-muted overflow-hidden">
                    <img
                      src={category.image_url || "/placeholder.svg"}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors flex items-end p-3">
                      <p className="font-semibold text-sm text-white text-center w-full">{category.name}</p>
                    </div>
                  </div>
                ) : (
                  <CardContent className="pt-6 space-y-2 h-40 flex flex-col items-center justify-center">
                    <div className="text-4xl">
                      {category.icon_url ? (
                        <img
                          src={category.icon_url || "/placeholder.svg"}
                          alt={category.name}
                          className="w-10 h-10 mx-auto"
                        />
                      ) : (
                        "💼"
                      )}
                    </div>
                    <p className="font-semibold text-sm text-center">{category.name}</p>
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link href="/jobs">
            <Button size="lg" variant="outline">
              عرض جميع الفئات
            </Button>
          </Link>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">الوظائف المتاحة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredJobs.map((job: any) => (
            <Link key={job.id} href={`/jobs/${job.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                {job.image_url && (
                  <div className="w-full h-40 bg-muted overflow-hidden">
                    <img
                      src={job.image_url || "/placeholder.svg"}
                      alt={job.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 flex items-center gap-2">
                      {job.employers?.company_logo_url && (
                        <div className="w-6 h-6 bg-white rounded border border-border overflow-hidden flex-shrink-0">
                          <img
                            src={job.employers.company_logo_url || "/placeholder.svg"}
                            alt={job.employers.company_name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <CardTitle className="line-clamp-2">{job.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          {job.employers?.company_name}
                          {isCompanyVerified(job) && (
                            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" title="شركة موثوقة" />
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    {job.job_type === "full_time" && "دوام كامل"}
                    {job.job_type === "part_time" && "دوام جزئي"}
                    {job.job_type === "contract" && "عقد"}
                    {job.job_type === "temporary" && "مؤقت"}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </div>
                  {job.salary_min && (
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      {job.salary_min.toLocaleString()} - {job.salary_max?.toLocaleString()} {job.currency}
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-12">
          <Link href="/jobs">
            <Button size="lg" variant="outline">
              عرض جميع الوظائف
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16">لماذا باب رزق؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>للباحثين عن عمل</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">آلاف الفرص الوظيفية</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">توصيات وظيفية مخصصة</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">تتبع سهل للطلبات</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>للشركات والمعلنين</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">إدارة سهلة للوظائف</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">مواهب مؤهلة</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">تقييمات وتحليلات</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>نمو مهني</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">فرص حصرية</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">شركات رائدة</p>
                </div>
                <div className="flex gap-3">
                  <CheckCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-muted-foreground">تطور مستمر</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">كيف تعمل باب رزق؟</h2>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { num: "1", title: "إنشاء حساب", desc: "سجل كباحث عن عمل أو معلن في ثوان" },
            { num: "2", title: "ابحث أو انشر", desc: "ابحث عن الوظائف أو انشر فرصة عمل" },
            { num: "3", title: "تقدم أو راجع", desc: "تقدم للوظائف أو راجع الطلبات" },
            { num: "4", title: "احصل على الوظيفة", desc: "ابدأ رحلتك الوظيفية الجديدة" },
          ].map((step) => (
            <div key={step.num} className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-2xl font-bold mx-auto">
                {step.num}
              </div>
              <h3 className="font-semibold text-lg">{step.title}</h3>
              <p className="text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">+5000</div>
              <p className="text-primary-foreground/80">وظيفة نشطة</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">+10000</div>
              <p className="text-primary-foreground/80">باحث عن عمل</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">+500</div>
              <p className="text-primary-foreground/80">شركة موثوقة</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl border border-primary/20 p-12 text-center space-y-6">
          <h2 className="text-4xl font-bold">هل أنت مستعد للبدء؟</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            انضم إلى آلاف الباحثين عن عمل والشركات التي تثق بباب رزق
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/auth/sign-up">
              <Button size="lg" className="gap-2">
                إنشاء حساب مجاني
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline">
                دخول
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-background py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-lg mb-4">باب رزق</h3>
              <p className="text-background/70">منصة التوظيف الأولى في مصر</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">للباحثين</h4>
              <ul className="space-y-2 text-background/70">
                <li>
                  <a href="/jobs" className="hover:text-background">
                    البحث عن وظائف
                  </a>
                </li>
                <li>
                  <a href="/dashboard/saved-jobs" className="hover:text-background">
                    حفظ الوظائف
                  </a>
                </li>
                <li>
                  <a href="/dashboard/applications" className="hover:text-background">
                    تتبع الطلبات
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">للشركات</h4>
              <ul className="space-y-2 text-background/70">
                <li>
                  <a href="/auth/sign-up" className="hover:text-background">
                    نشر وظيفة
                  </a>
                </li>
                <li>
                  <a href="/dashboard/employer/jobs" className="hover:text-background">
                    إدارة الطلبات
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-background">
                    الأسعار
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">معلومات</h4>
              <ul className="space-y-2 text-background/70">
                <li>
                  <a href="/about" className="hover:text-background">
                    عن باب رزق
                  </a>
                </li>
                <li>
                  <a href="/terms" className="hover:text-background">
                    الشروط والأحكام
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="hover:text-background">
                    سياسة الخصوصية
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-background/20 pt-8 text-center text-background/70">
            <p>&copy; 2025 باب رزق. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
