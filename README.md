# 🏛️ المستشار AI - منصة استشارات قانونية ذكية

> تطبيق ويب حديث يجمع بين قوة الذكاء الاصطناعي والخبرة القانونية.

[![GitHub](https://img.shields.io/badge/GitHub-AI--Lmstshr-blue?style=flat-square)](https://github.com/infoalmustasharaiask-sudo/AI-Lmstshr)
[![Status](https://img.shields.io/badge/Status-Active-green?style=flat-square)](.)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

---

## ✨ الميزات الرئيسية

### 🤖 ذكاء اصطناعي متقدم
- 5 شخصيات قانونية متخصصة
- تحليل قانوني فوري
- ردود احترافية وموثوقة

### 🔐 أمان عالي
- تشفير كامل للبيانات
- مصادقة JWT آمنة
- دعم Google OAuth

### 💳 محفظة رقمية
- نظام أرصدة ذكي
- شحن من الأدمن
- تتبع شامل للمعاملات

### 👨‍⚖️ شخصيات متخصصة
1. ⚖️ محامي الدفاع
2. 📋 المحلل القانوني
3. 👨‍⚖️ رؤية القاضي
4. ⚡ استشارة سريعة
5. 📖 المختار الذكي

### 🎮 لوحة تحكم أدمن
- إدارة كاملة للمستخدمين
- شحن وسحب رصيد
- عرض المعاملات
- إيقاف الحسابات

---

## 🚀 البدء السريع

### المتطلبات
- Node.js 18+
- pnpm 10+

### التثبيت
```bash
# انسخ المستودع
git clone https://github.com/infoalmustasharaiask-sudo/AI-Lmstshr.git
cd AI-Lmstshr

# ثبت المكتبات
pnpm install

# انسخ إعدادات البيئة
cp .env.example .env.local

# شغل المشروع
pnpm dev
```

### الوصول
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Admin Panel**: http://localhost:5173/admin-login

---

## 📖 الأدلة الموثقة

| الدليل | المحتوى |
|--------|---------|
| [QUICK_START.md](./QUICK_START.md) | ابدأ هنا - تشغيل سريع |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | دليل التطوير المتقدم |
| [TEST_GUIDE.md](./TEST_GUIDE.md) | اختبر جميع الميزات |
| [FIXES_SUMMARY.md](./FIXES_SUMMARY.md) | ملخص الإصلاحات |
| [TIPS_AND_TRICKS.md](./TIPS_AND_TRICKS.md) | نصائح وحيل |
| [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) | النشر على السحابة |

---

## 🏗️ البنية المعمارية

```
Mustashar AI
├── Frontend (React + Vite)
│   ├── Pages (Login, Chat, Admin)
│   ├── Components (UI, Chat)
│   └── Hooks (Auth, Data Fetching)
│
├── Backend (Express.js)
│   ├── Routes (Auth, Chat, Admin)
│   ├── Middleware (JWT, Admin Guard)
│   └── Services (AI, Database)
│
├── Database (Drizzle ORM)
│   ├── Users
│   ├── Conversations
│   ├── Messages
│   └── Transactions
│
└── Infrastructure
    ├── Vercel (Frontend)
    ├── Render (Backend)
    └── PostgreSQL (Database)
```

---

## 🔑 بيانات الاختبار

### حساب الأدمن
```
البريد: bishoysamy390@gmail.com
كلمة المرور: Bishoysamy (مبدئية - تغيير مطلوب)
```

### الرابط
```
Web: http://localhost:5173/admin-login
API: http://localhost:3001/admin/*
```

---

## 🛠️ التطوير

### أوامر مفيدة
```bash
# تشغيل كل شيء معاً
pnpm dev

# تشغيل Backend وحده
pnpm dev:backend

# تشغيل Frontend وحده
pnpm dev:frontend

# بناء للإنتاج
pnpm build

# فحص الأنواع
pnpm typecheck

# تنظيف وإعادة بناء
pnpm clean
```

### هيكل الملفات
```
artifacts/
├── api-server/        # Express Backend
│   ├── src/
│   │   ├── routes/    # API endpoints
│   │   ├── lib/       # Utilities
│   │   └── middlewares/
│   ├── package.json
│   └── nodemon.json
│
└── al-mustashar/      # React Frontend
    ├── src/
    │   ├── pages/
    │   ├── components/
    │   └── hooks/
    ├── vite.config.ts
    └── package.json

lib/
├── db/                # Database schemas
├── api-spec/          # OpenAPI/Swagger
└── api-zod/           # Validators
```

---

## 🚀 النشر

### Vercel (Frontend)
1. ربط الـ Repository
2. تعيين build command: `pnpm build:frontend`
3. Output directory: `artifacts/al-mustashar/dist/public`
4. إضافة متغيرات البيئة

### Render (Backend)
1. إنشاء Web Service
2. تعيين: `pnpm build:backend`
3. Start command: `pnpm start:backend`
4. إضافة PostgreSQL database
5. متغيرات البيئة (انظر `.env.example`)

---

## 🧪 الاختبار

### الاختبار الذاتي
```bash
# اقرأ دليل الاختبار
cat TEST_GUIDE.md

# ثم اختبر كل الميزات يدوياً
```

### الاختبارات التلقائية
```bash
# TypeScript checks
pnpm typecheck

# Linting (عند الحاجة)
pnpm lint
```

---

## 🔐 الأمان

- ✅ JWT tokens محمية
- ✅ كلمات مرور مشفرة (PBKDF2)
- ✅ CORS محدود
- ✅ SQL injection prevention (Drizzle ORM)
- ✅ Rate limiting (اختياري في الإنتاج)

---

## 📊 الإحصائيات

- **Lines of Code**: ~5,000+
- **API Endpoints**: 16+
- **Database Tables**: 4
- **Components**: 20+
- **Development Time**: 2 weeks
- **Uptime Target**: 99.9%

---

## 🤝 المساهمة

البروجكت يرحب بالمساهمين!

```bash
# Fork المستودع
# Clone النسخة الخاصة بك
# أنشئ فرع جديد
git checkout -b feature/amazing-feature

# عدّل وأضف
# Commit التغييرات
git commit -m 'Add amazing feature'

# Push للفرع
git push origin feature/amazing-feature

# ابدأ Pull Request
```

---

## 📞 الدعم

للدعم والأسئلة:
- 📧 البريد الإلكتروني: bishoysamy390@gmail.com
- 🐛 البلاغ عن أخطاء: GitHub Issues
- 💬 النقاشات: GitHub Discussions

---

## 📄 الترخيص

هذا المشروع مرخص تحت [MIT License](LICENSE)

---

## 🙏 شكر خاص

شكر خاص إلى:
- فريق OpenAI للـ API الرائع
- Vercel و Render للاستضافة
- المساهمين والمختبرين

---

## 📈 الخارطة الطريق

### المرحلة 1 ✅
- [x] تحليل المتطلبات
- [x] تصميم النظام
- [x] تطوير Backend
- [x] تطوير Frontend
- [x] التكامل مع OpenAI

### المرحلة 2 🚧
- [ ] دعم متعدد اللغات
- [ ] ميزات متقدمة للأدمن
- [ ] تقارير وتحليلات
- [ ] دعم الفيديو والصوت

### المرحلة 3 📋
- [ ] تطبيق موبايل
- [ ] API عام (للمطورين)
- [ ] نظام اشتراكات
- [ ] تكاملات خارجية

---

## 📝 الملاحظات

- النسخة الحالية: **1.0.0**
- آخر تحديث: **25 مارس 2026**
- الحالة: **✅ جاهز للإنتاج**

---

**صُنع بـ ❤️ باستخدام React + Express + TypeScript**
