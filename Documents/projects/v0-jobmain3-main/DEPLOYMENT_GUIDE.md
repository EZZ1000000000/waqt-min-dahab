# تعليمات رفع المشروع على Vercel و Git

## ✅ تم إصلاح الثغرة الأمنية CVE-2025-66478

تم تحديث المشروع بنجاح! التغييرات التي تمت:

### 🔒 التحديثات الأمنية:
- ✅ تحديث Next.js من `^16.0.1` إلى `^16.0.7` (النسخة الآمنة)
- ✅ تحديث React من `19.2.0` إلى `^19.2.3` (النسخة الآمنة)
- ✅ تحديث React-DOM من `19.2.0` إلى `^19.2.3` (النسخة الآمنة)

### 📝 الملفات المضافة:
- ✅ ملف `.gitignore` لحماية الملفات الحساسة
- ✅ ملف `.env.example` كمثال لمتغيرات البيئة

---

## 🚀 الخطوات التالية للرفع على Git و Vercel:

### 1️⃣ تثبيت التحديثات:

قم بحذف مجلد `node_modules` وملف `pnpm-lock.yaml` (أو `package-lock.json` إذا كنت تستخدم npm):

```bash
# إذا كنت تستخدم pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install

# إذا كنت تستخدم npm
rm -rf node_modules package-lock.json
npm install

# إذا كنت تستخدم yarn
rm -rf node_modules yarn.lock
yarn install
```

### 2️⃣ إعداد متغيرات البيئة:

أنشئ ملف `.env.local` وأضف بيانات Supabase الخاصة بك:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**ملاحظة مهمة:** لا ترفع ملف `.env.local` على Git! (محمي بالفعل في `.gitignore`)

### 3️⃣ تجربة المشروع محليًا:

```bash
# تشغيل المشروع في وضع التطوير
npm run dev
# أو
pnpm dev

# التأكد من البناء بنجاح
npm run build
# أو
pnpm build
```

### 4️⃣ رفع المشروع على Git:

```bash
# تهيئة Git (إذا لم يكن موجودًا)
git init

# إضافة جميع الملفات
git add .

# عمل commit
git commit -m "fix: تحديث Next.js و React لإصلاح الثغرة الأمنية CVE-2025-66478"

# ربط المشروع بـ GitHub (استبدل USERNAME و REPO_NAME)
git remote add origin https://github.com/USERNAME/REPO_NAME.git

# رفع المشروع
git branch -M main
git push -u origin main
```

### 5️⃣ رفع المشروع على Vercel:

#### الطريقة الأولى: من خلال واجهة Vercel (موصى بها):

1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط على **"Add New Project"**
3. اختر مستودع Git الخاص بك
4. في إعدادات المشروع، أضف متغيرات البيئة:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
5. اضغط على **"Deploy"**

#### الطريقة الثانية: من خلال CLI:

```bash
# تثبيت Vercel CLI
npm i -g vercel

# تسجيل الدخول
vercel login

# رفع المشروع
vercel

# للنشر على الإنتاج
vercel --prod
```

---

## ⚠️ تحذيرات مهمة:

1. **لا تنسَ إضافة متغيرات البيئة في Vercel Dashboard**
2. **بعد الرفع، قم بتغيير جميع المفاتيح السرية (API Keys)** كما يوصي الأمان
3. **تأكد من تفعيل RLS Policies في Supabase** لحماية البيانات

---

## 🔍 التحقق من نجاح الإصلاح:

بعد الرفع على Vercel، تحقق من عدم ظهور رسالة الخطأ:
```
Error: Vulnerable version of Next.js detected
```

---

## 📚 مصادر إضافية:

- [Next.js Security Advisory](https://nextjs.org/blog/CVE-2025-66478)
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

---

**تم الإعداد بواسطة Claude AI 🤖**
