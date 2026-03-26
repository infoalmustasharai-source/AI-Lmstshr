# 📋 ملف النصائح الذهبية للمشروع

## 🎯 أهم الملفات

| الملف | الفائدة |
|------|---------|
| **QUICK_START.md** | ابدأ هنا - تشغيل سريع |
| **DEVELOPMENT.md** | دليل التطوير المتقدم |
| **TEST_GUIDE.md** | اختبر جميع الميزات |
| **FIXES_SUMMARY.md** | ملخص الإصلاحات |
| **.env.local** | إعدادات محليتك |

---

## ⚡ الأوامر الأساسية

```bash
# تشغيل الكل معاً
pnpm dev

# تشغيل Backend وحده
pnpm dev:backend

# تشغيل Frontend وحده
pnpm dev:frontend

# بناء كامل
pnpm build

# بناء Backend فقط
pnpm build:backend

# بناء Frontend فقط
pnpm build:frontend

# فحص الأنواع
pnpm typecheck

# تنظيف وإعادة بناء
pnpm clean
```

---

## 🔑 متغيرات البيئة الحتمية

هذه **يجب** أن تكون موجودة دائماً في `.env.local`:

```env
NODE_ENV=development
PORT=5173
BASE_PATH=/
DATABASE_URL=file:./dev.db
OPENAI_API_KEY=sk-...
JWT_SECRET=your-secret
ADMIN_EMAIL=bishoysamy390@gmail.com
ADMIN_PASSWORD=Bishoysamy
```

---

## 🧪 الاختبار السريع (5 دقائق)

```bash
# 1. شغل المشروع
pnpm dev

# 2. في متصفح آخر، افتح
http://localhost:5173

# 3. أنشئ حساب جديد

# 4. اذهب للأدمن وأضف رصيد

# 5. أرسل رسالة

# ✓ إذا اشتغل كل شيء = نجح!
```

---

## 🚀 النشر على Vercel (Frontend)

```bash
# 1. ربط الـ repo
git push origin master

# 2. في Vercel:
- Project: AI-Lmstshr
- Framework: Vite
- Build: pnpm build:frontend
- Output: artifacts/al-mustashar/dist/public

# 3. متغيرات البيئة:
VITE_API_URL=https://your-backend.render.com
BASE_PATH=/
```

---

## 🚀 النشر على Render (Backend)

```bash
# في Render:
- Build: pnpm build:backend
- Start: pnpm start:backend

# متغيرات:
DATABASE_URL=postgresql://...
JWT_SECRET=...
OPENAI_API_KEY=...
(جميع المتغيرات من .env.local)
```

---

## 🔐 بيانات الاختبار

| البيانات | القيمة |
|---------|--------|
| **بريد الأدمن** | `bishoysamy390@gmail.com` |
| **باسورد الأدمن** | `Bishoysamy` |
| **رابط الأدمن** | `http://localhost:5173/admin-login` |
| **رابط المستخدم** | `http://localhost:5173/login` |
| **API Backend** | `http://localhost:3001` |
| **Frontend** | `http://localhost:5173` |

---

## ⚠️ المشاكل الشائعة والحل السريع

| المشكلة | السبب | الحل |
|--------|------|------|
| `Port already in use` | منفذ مشغول | `pnpm dev` على منفذ آخر |
| `DATABASE_URL undefined` | متغير ناقص | تأكد من `.env.local` |
| `OpenAI failed` | مفتاح غير صحيح | حدث `OPENAI_API_KEY` |
| `Module not found` | مكتبات ناقصة | `pnpm clean` |
| `Vite config error` | متغيرات ناقصة | أضف `PORT` و `BASE_PATH` |

---

## 💻 الملفات المهمة للتطوير

```
artifacts/
├── api-server/
│   ├── src/
│   │   ├── routes/        ← أضف endpoints هنا
│   │   ├── lib/
│   │   │   ├── auth.ts    ← Authentication logic
│   │   │   ├── personas.ts ← Personalities
│   │   └── middlewares/   ← JWT, Admin guards
│   └── nodemon.json       ← Hot reload config
└── al-mustashar/
    └── src/
        ├── pages/         ← React pages
        ├── components/    ← React components
        └── hooks/         ← Custom hooks

lib/
├── db/                    ← Drizzle ORM schemas
└── api-spec/
    └── openapi.yaml       ← API documentation
```

---

## 🔗 الروابط السريعة

- **GitHub Repo**: https://github.com/infoalmustasharaiask-sudo/AI-Lmstshr
- **Frontend (Dev)**: http://localhost:5173
- **Backend API (Dev)**: http://localhost:3001
- **Admin Panel**: http://localhost:5173/admin-login
- **OpenAPI Docs**: (في Render/Production)

---

## 📚 الموارد الإضافية

- **Drizzle ORM**: https://orm.drizzle.team
- **Vite Docs**: https://vitejs.dev
- **Express**: https://expressjs.com
- **React**: https://react.dev
- **TailwindCSS**: https://tailwindcss.com

---

## ✅ نصائح للإنتاجية

1. **استخدم VS Code Extensions:**
   - REST Client (لاختبار API)
   - ES7+ Snippets
   - Tailwind IntelliSense

2. **اختبر Endpoints:**
   - استخدم Thunder Client أو REST Client
   - اختبر جميع cases قبل الكود

3. **الـ Logs:**
   - Backend يطبع في Terminal
   - Frontend يطبع في Browser Console

4. **Git:**
   - اعمل `commit` بعد كل feature
   - اكتب رسائل واضحة

---

## 🎓 معلومات إضافية

**المشروع يحتوي على:**
- ✅ 5 شخصيات قانونية
- ✅ نظام محادثات آمن
- ✅ محفظة رقمية
- ✅ لوحة تحكم أدمن
- ✅ OAuth (Google)
- ✅ استعادة كلمة المرور
- ✅ اتصال OpenAI

**التقنيات المستخدمة:**
- Backend: Express.js + TypeScript
- Frontend: React + Vite + TailwindCSS
- Database: Drizzle ORM + PostgreSQL/SQLite
- Auth: JWT + Google OAuth
- Deployment: Vercel (Frontend) + Render (Backend)

---

**آخر تحديث:** 25 مارس 2026  
**الحالة:** ✅ متوافق وجاهز  
**الإصدار:** 1.0.0-final
