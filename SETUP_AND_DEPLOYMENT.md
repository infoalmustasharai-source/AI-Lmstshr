# 🎯 دليل تطوير و نشر Mustashar AI (MVP)

## 📋 جدول المحتويات
- [البدء السريع](#البدء-السريع)
- [إعدادات البيئة](#إعدادات-البيئة)
- [قاعدة البيانات](#قاعدة-البيانات)
- [التطوير المحلي](#التطوير-المحلي)
- [الإنشاء والنشر](#الإنشاء-والنشر)
- [الميزات المطبقة](#الميزات-المطبقة)
- [الخطوات القادمة](#الخطوات-القادمة)

---

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- pnpm (مدير الحزم)
- PostgreSQL (للإنتاج) أو SQLite (للتطوير)
- حساب OpenAI (اختياري حالياً)

### التثبيت
```bash
# استنساخ المشروع
git clone <repo>
cd AI-Lmstshr

# تثبيت الحزم
pnpm install

# نسخ ملف البيئة
cp .env.example .env.local
```

---

## ⚙️ إعدادات البيئة

### `.env.local` - للتطوير المحلي

```env
# قاعدة البيانات (SQLite للتطوير)
DATABASE_URL=file:./dev.db

# الخادم
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001

# OpenAI (يمكن تركه فارغاً الآن)
OPENAI_API_KEY=sk-temp-free-tier

# الأمان
JWT_SECRET=your-super-secret-key-change-in-production

# الأدمن
ADMIN_EMAIL=bishoysamy390@gmail.com
ADMIN_PHONE=01130031531

# المحفظة
WALLET_PHONE_NUMBER=01130031531
CREDITS_PER_MESSAGE=10
CREDITS_PER_IMAGE=50
```

### `.env` - للإنتاج (Render/Vercel)

```env
# قاعدة البيانات (PostgreSQL)
DATABASE_URL=postgresql://user:password@host:5432/mustashar

# الخادم
NODE_ENV=production
PORT=3001
API_URL=https://api.example.com
VITE_API_URL=https://api.example.com

# OpenAI API Key (احصل عليه من openai.com)
OPENAI_API_KEY=sk-your-real-key-here

# الأمان - استخدم قيم عشوائية قوية
JWT_SECRET=generate-strong-random-key-here

ADMIN_EMAIL=bishoysamy390@gmail.com
ADMIN_PHONE=01130031531

WALLET_PHONE_NUMBER=01130031531
CREDITS_PER_MESSAGE=10
CREDITS_PER_IMAGE=50
```

---

## 💾 قاعدة البيانات

### الجداول المُنشأة

1. **users** - المستخدمون
   - id, name, email, passwordHash, balance, isAdmin, isActive, createdAt

2. **conversations** - المحادثات
   - id, userId, title, personaType, messageCount, totalCreditsUsed, createdAt

3. **messages** - الرسائل
   - id, conversationId, role, content, creditsUsed, createdAt

4. **transactions** - المعاملات المالية
   - id, userId, amount, type, description, adminId, createdAt

### إنشاء قاعدة البيانات (PostgreSQL)

```bash
# تثبيت Drizzle ORM
pnpm install drizzle-kit drizzle-orm pg

# إنشاء المتغيرات البيئية
export DATABASE_URL="postgresql://user:password@localhost:5432/mustashar"

# دفع Schema إلى قاعدة البيانات
cd lib/db
pnpm run push
```

---

## 👨‍💻 التطوير المحلي

### 1️⃣ بدء الخادم (Backend)

```bash
# من جذر المشروع
cd artifacts/api-server
pnpm install
pnpm dev

# سيبدأ على http://localhost:3001
```

### 2️⃣ بدء الواجهة الأمامية (Frontend)

```bash
# من نافذة Terminal جديدة
cd artifacts/al-mustashar
pnpm install
pnpm dev

# سيبدأ على http://localhost:5173
```

### 3️⃣ اختبار API

```bash
# تسجيل مستخدم جديد
curl -X POST http://localhost:3001/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "اختبار",
    "email": "test@example.com",
    "password": "password123"
  }'

# تسجيل الدخول
curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 📦 الإنشاء والنشر

### البناء

```bash
# بناء جميع الحزم
pnpm run build

# بناء الخادم فقط
cd artifacts/api-server && pnpm run build

# بناء الواجهة فقط
cd artifacts/al-mustashar && pnpm run build
```

### النشر على Render (Backend)

1. **إنشاء حساب على Render.com**
2. **ربط مستودع GitHub**
3. **إنشاء Web Service:**
   - Start Command: `node --enable-source-maps ./dist/index.mjs`
   - Build Command: `nvm install && pnpm install && pnpm -r run build`
4. **إضافة متغيرات البيئة** في إعدادات الخدمة
5. **نشر المشروع**

### النشر على Vercel (Frontend)

1. **الذهاب إلى vercel.com**
2. **اختيار "Import Project"**
3. **تحديد المستودع على GitHub**
4. **إعدادات البناء:**
   - Root Directory: `artifacts/al-mustashar`
   - Build Command: `pnpm run build`
   - Output: `.dist`
5. **إضافة متغيرات البيئة:**
   ```
   VITE_API_URL=https://your-render-api.onrender.com
   ```
6. **النشر**

---

## ✅ الميزات المطبقة (MVP)

### ✓ نظام المستخدمين
- [x] تسجيل مستخدم جديد
- [x] تسجيل دخول
- [x] نظام JWT للمصادقة
- [x] ملف تعريف المستخدم

### ✓ نظام المحفظة
- [x] رصيد للمستخدم
- [x] خصم الأرصدة عند الرسالة
- [x] سجل المعاملات
- [x] تتبع الاستخدام

### ✓ 5 شخصيات قانونية
- [x] محامي الدفاع
- [x] المحلل القانوني
- [x] رؤية القاضي
- [x] استشارة سريعة
- [x] المختار الذكي

### ✓ واجهة المحادثة
- [x] إنشاء محادثات
- [x] اختيار الشخصية
- [x] إرسال الرسائل
- [x] تخزين المحادثات

### ✓ لوحة تحكم الأدمن
- [x] عرض جميع المستخدمين
- [x] إضافة رصيد يدوي
- [x] خصم الأرصدة
- [x] تفعيل/تعطيل المستخدمين
- [x] عرض المعاملات

### ✓ API Documentation
- [x] OpenAPI/Swagger Schema
- [x] جميع Endpoints موثقة

---

## 🔜 الخطوات القادمة (Phase 2)

### 1. تكامل OpenAI
```bash
# حصول على API Key من openai.com
# تحديث .env مع المفتاح
# تفعيل المسار في src/lib/personas.ts
```

### 2. دعم متعدد اللغات
- إضافة i18n (Arabic, English, French)
- ترجمة الواجهة الأمامية

### 3. نظام الدفع المتقدم
- تكامل بوابة دفع حقيقية
- دعم المحافظ الرقمية

### 4. ميزات إضافية
- تحميل الملفات
- توليد الصور
- تصدير المحادثات
- إحصائيات متقدمة

---

## 🔐 ملاحظات الأمان

⚠️ **مهم جداً:**

1. **لا تشارك بيانات اعتماد حقيقية** - استخدم متغيرات البيئة فقط
2. **غيّر` JWT_SECRET`** في الإنتاج بقيمة قوية عشوائية
3. **استخدم HTTPS** في الإنتاج
4. **قم بتشفير كلمات المرور** - بالفعل مُطبق باستخدام PBKDF2
5. **راقب Render و Vercel** للحصول على التنبيهات الأمنية

---

## 📞 الدعم

للأسئلة أو المشاكل:
- البريد: bishoysamy390@gmail.com
- رقم المحفظة: 01130031531

---

**آخر تحديث:** مارس 2026 ✨
