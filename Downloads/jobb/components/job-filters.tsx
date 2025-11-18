"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface JobFiltersProps {
  onSearch: (query: string) => void
  onJobTypeChange: (type: string) => void
  onLocationChange: (location: string) => void
  onCategoryChange?: (category: string) => void
  onClear: () => void
  searchQuery?: string
  selectedJobType?: string
  selectedLocation?: string
  selectedCategory?: string
}

interface Category {
  id: string
  name: string
}

export function JobFilters({
  onSearch,
  onJobTypeChange,
  onLocationChange,
  onCategoryChange,
  onClear,
  searchQuery = "",
  selectedJobType = "all",
  selectedLocation = "",
  selectedCategory = "all",
}: JobFiltersProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data, error } = await supabase
          .from("job_categories")
          .select("id, name")
          .order("name", { ascending: true })

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">تصفية الوظائف</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="search">البحث</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="اسم الوظيفة، الشركة..."
              value={searchQuery}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">الفئة</Label>
          <Select value={selectedCategory} onValueChange={(value) => onCategoryChange?.(value)}>
            <SelectTrigger id="category">
              <SelectValue placeholder="جميع الفئات" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الفئات</SelectItem>
              {isLoading ? (
                <SelectItem value="loading" disabled>
                  جاري التحميل...
                </SelectItem>
              ) : (
                categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="jobType">نوع الوظيفة</Label>
          <Select value={selectedJobType} onValueChange={onJobTypeChange}>
            <SelectTrigger id="jobType">
              <SelectValue placeholder="جميع الأنواع" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الأنواع</SelectItem>
              <SelectItem value="full_time">دوام كامل</SelectItem>
              <SelectItem value="part_time">دوام جزئي</SelectItem>
              <SelectItem value="contract">عقد</SelectItem>
              <SelectItem value="temporary">مؤقت</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="location">الموقع</Label>
          <Input
            id="location"
            placeholder="المدينة أو المنطقة"
            value={selectedLocation}
            onChange={(e) => onLocationChange(e.target.value)}
          />
        </div>

        <Button variant="outline" className="w-full bg-transparent" onClick={onClear}>
          <X className="w-4 h-4 mr-2" />
          مسح المرشحات
        </Button>
      </CardContent>
    </Card>
  )
}
