# Luxury Watch Brand — Full Stack Project

مشروع ويب كامل لبراند ساعات فاخرة يشمل Landing Page ونظام إدارة طلبات (Leads Management).

## تشغيل المشروع

1. قم بتثبيت المكتبات المطلوبة:
   ```bash
   npm install
   ```

2. قم بتشغيل السيرفر:
   ```bash
   node backend/server.js
   ```

3. افتح المتصفح على الروابط التالية:
   - **الصفحة الرئيسية:** [http://localhost:3000](http://localhost:3000)
   - **لوحة التحكم:** [http://localhost:3000/dashboard.html](http://localhost:3000/dashboard.html)

## بيانات دخول لوحة التحكم (Admin)

- **المستخدم:** `admin`
- **كلمة المرور:** `watches2024`

*(يمكن تغيير هذه البيانات من ملف `backend/.env`)*

## مميزات المشروع

- **صفحة هبوط (Landing Page):** سريعة الاستجابة، عصرية، تحتوي على فورم طلب وشريط منتجات متحرك.
- **لوحة التحكم (Admin Dashboard):** تمكنك من عرض الطلبات الجديدة، إحصائيات يومية وأسبوعية، وتعديل محتوى الموقع بالكامل (نصوص وألوان ومنتجات).
- **تصدير البيانات:** إمكانية تصدير قائمة الطلبات بصيغة CSV.
- **قاعدة البيانات:** يستخدم SQLite للحفظ المحلي دون الحاجة لإعدادات معقدة.

## التقنيات المستخدمة

- **Backend:** Node.js, Express
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Database:** SQLite
