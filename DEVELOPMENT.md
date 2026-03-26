# 🛠️ دليل تشغيل المشروع محلياً

## 📦 المتطلبات

- Node.js 18+
- pnpm (مدير الحزم)
- PostgreSQL أو SQLite

---

## ⚡ تشغيل سريع (الطريقة المفضلة)

```bash
# من مجلد الجذر
cd /workspaces/AI-Lmstshr

# تثبيت كل المكتبات
pnpm install

# نسخ متغيرات البيئة
cp .env.example .env.local

# تشغيل Backend + Frontend معاً (Hot Reload)
pnpm dev
```

✅ **النتيجة:**
- Backend يشتغل على: **http://localhost:3001**
- Frontend يشتغل على: **http://localhost:3000**
- Nodemon سيراقب التغييرات تلقائياً

---

## 🔧 Scripts المتاحة

### من الجذر (`package.json`)

```bash
# تشغيل Backend + Frontend معاً
pnpm dev

# تشغيل Backend وحده
pnpm dev:backend

# تشغيل Frontend وحده
pnpm dev:frontend

# بناء المشروع
pnpm build

# فحص الأنواع (TypeScript)
pnpm typecheck
```

### من مجلد Backend فقط

```bash
cd artifacts/api-server

# تشغيل مع hot reload + nodemon
pnpm dev

# بناء فقط
pnpm build

# تشغيل الثنائي المجمع
pnpm start

# فحص الأنواع
pnpm typecheck
```

### من مجلد Frontend فقط

```bash
cd artifacts/al-mustashar

# تشغيل مع Vite hot reload
pnpm dev

# بناء للإنتاج
pnpm build

# معاينة الإنتاج محلياً
pnpm serve

# فحص الأنواع
pnpm typecheck
```

---

## 🔄 آلية Hot Reload

### Backend (Nodemon + esbuild)
- يراقب التغييرات في مجلد `src/`
- يعيد البناء تلقائياً عند كل تعديل
- يعيد تشغيل الخادم

**الملف:** `artifacts/api-server/nodemon.json`

### Frontend (Vite)
- يراقب تغييرات JSX/CSS/TS
- تحديث فوري في المتصفح (HMR)
- بدون إعادة تحميل كاملة

---

## ⚙️ متغيرات البيئة

انسخ `.env.example` إلى `.env.local` وأكمل البيانات:

```env
# Base Configuration
NODE_ENV=development
PORT=3001
BASE_PATH=/
API_URL=http://localhost:3001
VITE_API_URL=http://localhost:3001

# Database
DATABASE_URL=file:./dev.db  # أو PostgreSQL

# OpenAI
OPENAI_API_KEY=sk-your-key
AI_INTEGRATIONS_OPENAI_API_KEY=sk-your-key
AI_INTEGRATIONS_OPENAI_BASE_URL=https://api.openai.com/v1

# JWT
JWT_SECRET=your-secret-key-change-this

# Admin
ADMIN_EMAIL=bishoysamy390@gmail.com
ADMIN_PHONE=01130031531

# Gmail (للبريد الإلكتروني)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth (اختياري)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com

# Wallet
WALLET_PHONE_NUMBER=01130031531
WHATSAPP_NUMBER=01130031531
CREDITS_PER_MESSAGE=10
CREDITS_PER_IMAGE=50
```

---

## 🐛 استكشاف الأخطاء

### "PORT already in use"
```bash
# ابحث عن العملية واقتلها
lsof -i :3001
kill -9 <PID>
```

### "Database connection failed"
- تأكد من DATABASE_URL صحيح
- للـ SQLite: `file:./dev.db`
- للـ PostgreSQL: `postgresql://user:password@localhost/dbname`

### "Cannot find module"
```bash
# أعد التثبيت
pnpm install

# امسح الـ cache
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Vite PORT في الاستخدام
```bash
# غير PORT في .env.local
PORT=3002
```

---

## 📂 البنية الأساسية

```
/
├── artifacts/
│   ├── api-server/          # Express Backend
│   │   ├── src/
│   │   ├── nodemon.json     # Hot reload config
│   │   └── package.json
│   └── al-mustashar/        # React Frontend
│       ├── src/
│       └── vite.config.ts
├── lib/                     # Shared libraries
│   ├── db/                  # Drizzle ORM schemas
│   ├── api-spec/            # OpenAPI spec
│   └── api-zod/             # Zod validators
├── package.json             # Root scripton
├── .env.local               # Local env vars
└── QUICK_START.md           # هذا الملف
```

---

## 🎯 التطوير العملي

### الخطوة 1: ابدأ dev scripts
```bash
pnpm dev
```

### الخطوة 2: افتح المتصفح
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### الخطوة 3: عدّل الملفات
```
artifacts/api-server/src/ → Backend تحديثات
artifacts/al-mustashar/src/ → Frontend تحديثات
lib/db/src/ → Database schema تحديثات
```

### الخطوة 4: شاهد التحديثات الفورية
- الـ Backend يعيد البناء افتراضياً
- الـ Frontend يحدّث في المتصفح

---

## 📝 أوامر مفيدة

```bash
# اختبر جميع workspaces
pnpm run -r typecheck

# بناء كامل المشروع
pnpm build

# شاهد جودة الأكواد
pnpm run -r --if-present lint

# تغيير صيغة الأكواد
pnpm run -r --if-present format
```

---

## 🚀 النشر

للنشر على Vercel + Render، انظر: [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)

---

## 💡 نصائح

1. **استخدم VS Code**: Extensions like REST Client + Thunder Client مفيدة للـ API testing
2. **تفقد الـ logs**: عند مشاكل، شاهد terminal logs بانتباه
3. **اختبر API endpoints**: استخدم Postman أو Thunder Client
4. **افحص Database**: استخدم DBeaver أو pgAdmin

---

جزاك الله خيراً! 🎉
