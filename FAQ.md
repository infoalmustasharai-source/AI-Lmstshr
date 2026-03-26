# ❓ الأسئلة الشائعة - Mustashar AI FAQ

إجابات سريعة على الأسئلة الأكثر شيوعاً.

---

## 🚀 البدء والتشغيل

### س: كيف أشغل المشروع أول مرة؟
**ج:**
```bash
cd /workspaces/AI-Lmstshr
pnpm install
cp .env.example .env.local
pnpm dev
```
ثم افتح http://localhost:5173

### س: ما الفرق بين `pnpm dev` و `pnpm dev:backend` و `pnpm dev:frontend`؟
| الأمر | الشرح |
|------|-------|
| `pnpm dev` | يشغل Backend وFrontend معاً (الطريقة الأسهل) |
| `pnpm dev:backend` | Backend فقط (منفصل) |
| `pnpm dev:frontend` | Frontend فقط (منفصل) |

### س: ما الـ ports المستخدمة؟
- **Frontend**: 5173 (افتراضي)
- **Backend**: 3001 (افتراضي)

---

## 🔐 المصادقة والأمان

### س: كيف أسجل دخول الأدمن؟
**ج:**
1. اذهب إلى http://localhost:5173/admin-login
2. البريد: `bishoysamy390@gmail.com`
3. كلمة المرور: `Bishoysamy`

**ملاحظة:** غيّر كلمة المرور في الإنتاج!

### س: هل يمكنني استخدام Google OAuth محلياً؟
**ج:** نعم، لكن تحتاج إلى:
1. إنشاء مشروع Google Cloud
2. إنشاء OAuth credentials
3. إضافة `http://localhost:5173` في Authorized origins
4. إضافة المفاتيح في `.env.local`

### س: كيف أحمي كلمات المرور؟
**ج:** المشروع يستخدم PBKDF2 بالفعل. تحقق من:
```typescript
artifacts/api-server/src/lib/auth.ts
```

### س: ما هو JWT_SECRET؟
**ج:** مفتاح سري لتوقيع JWT tokens. يجب أن يكون:
- قوي (32+ حرف)
- عشوائي
- آمن (لا تشاركه)

---

## 💻 التطوير والبرمجة

### س: أين أضيف ميزة جديدة؟
**ج:** اتبع هذا النمط:
1. **Backend Route**: `artifacts/api-server/src/routes/`
2. **Frontend Page**: `artifacts/al-mustashar/src/pages/`
3. **Database Schema**: `lib/db/src/schema/`

اقرأ [DEVELOPMENT.md](./DEVELOPMENT.md) لمثال كامل.

### س: كيف أضيف endpoint جديد في API؟
**ج:**
```typescript
// artifacts/api-server/src/routes/new-feature.ts
import { Router } from 'express';
import { auth } from '../middlewares/auth';

const router = Router();

router.get('/new-feature', auth, async (req, res) => {
  // implementation
  res.json({ message: 'success' });
});

export default router;
```

ثم أضفه في `routes/index.ts`:
```typescript
app.use('/api', featureRoutes);
```

### س: كيف أتعامل مع الأخطاء في Frontend؟
**ج:**
```typescript
import { useToast } from '../hooks/use-toast';

const { showError } = useToast();

try {
  // code
} catch (error) {
  showError('حدث خطأ: ' + error.message);
}
```

### س: كيف أستخدم React Query؟
**ج:**
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['conversations'],
  queryFn: () => fetch('/api/conversations').then(r => r.json()),
});
```

---

## 🗄️ قاعدة البيانات

### س: أين تُخزّن البيانات؟
**ج:**
- **محلي**: `./db.sqlite` (ملف SQLite)
- **إنتاج**: PostgreSQL على Render أو Supabase

### س: كيف أأخذ backup من Database؟
**ج:**
```bash
# SQLite
cp db.sqlite db.sqlite.backup

# PostgreSQL
pg_dump DATABASE_URL > backup.sql
```

### س: كيف أعديل schema؟
**ج:**
1. عدّل `lib/db/src/schema/`
2. اشغل:
   ```bash
   pnpm -C lib/db run db:gen
   pnpm -C lib/db run db:migrate
   ```

### س: ما هو Drizzle ORM؟
**ج:** مكتبة TypeScript safe للتعامل مع قاعدة البيانات. تستخدم:
- Type safety
- Query builder
- Migrations
- Schema validation

---

## 🤖 التكامل مع OpenAI

### س: كيف أضيف API key من OpenAI؟
**ج:**
1. اذهب إلى https://platform.openai.com
2. أنشئ API key
3. أضفها في `.env.local`:
   ```
   OPENAI_API_KEY=sk-your-key
   ```

### س: هل يمكنني استخدام نموذج أخر غير gpt-4-turbo-preview؟
**ج:** نعم، عدّل في `personas.ts`:
```typescript
export const defensePersona = {
  // ...
  model: 'gpt-3.5-turbo', // أو gpt-4-turbo أو آخر
};
```

### س: كم تكلفة API calls؟
**ج:** تختلف حسب النموذج. عادة:
- gpt-3.5-turbo: أرخص
- gpt-4-turbo: أغلى لكن أفضل

تتبع في https://platform.openai.com/account/usage

### س: كيف أظيف Persona جديد؟
**ج:**
1. عدّل `artifacts/api-server/src/lib/personas.ts`
2. أضف كائن جديد بـ id, name, instructions
3. أضفه في array PERSONAS
4. أعد تشغيل Backend

---

## 🌍 النشر والإنتاج

### س: ما الفرق بين development وproduction؟
| Aspect | Dev | Production |
|--------|-----|-----------|
| Speed | سريع | أسرع (مراعاة) |
| Logging | مفصل | احتفظ بالضروري |
| Errors | أظهر التفاصيل | أخفِ التفاصيل |
| Database | SQLite | PostgreSQL |
| HTTPS | اختياري | إلزامي |

### س: كيف أنشر على Vercel وRender؟
**ج:** اقرأ [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) أو [NEXT_STEPS.md](./NEXT_STEPS.md)

### س: هل يمكنني نشر على Docker؟
**ج:** نعم، أنشئ `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY . .
RUN pnpm install
RUN pnpm build
CMD ["pnpm", "start:backend"]
```

---

## 🔧 المشاكل والحلول

### س: تشغيل `pnpm dev` لا يعمل!
**ج:**
```bash
# جرب
pnpm clean
pnpm install --force
pnpm dev

# إذا لم ينجح
pnpm build:backend
pnpm build:frontend
```

### س: Backend يعطي error؟
**ج:**
```bash
# تحقق من البيانات
cat .env.local

# تحقق من Dependencies
pnpm install

# اعد تشغيل
pnpm dev:backend
```

### س: Frontend فارغ أو سوداء الصفحة؟
**ج:** افتح console:
- Ctrl+Shift+K في Firefox
- F12 في Chrome

ابحث عن الأخطاء الحمراء وساعدني معها.

### س: يقول "OPENAI_API_KEY is required"
**ج:**
```bash
# أضفها في .env.local
echo "OPENAI_API_KEY=sk-..." >> .env.local

# اعد تشغيل البرنامج
```

### س: Database connection failed
**ج:** اعتمد على DATABASE_URL:
```bash
# SQLite
DATABASE_URL="sqlite:./db.sqlite"

# PostgreSQL
DATABASE_URL="postgresql://user:pass@localhost/dbname"
```

### س: Port بالفعل مستخدم؟
**ج:**
```bash
# ابحث عن العملية
lsof -i :3001
lsof -i :5173

# قتلها
kill -9 PID

# أو استخدم port آخر
PORT=5174 pnpm dev:frontend
```

---

## 📊 الميزات

### س: كم عدد الشخصيات؟
**ج:** 5 شخصيات:
1. ⚖️ محامي الدفاع
2. 📋 المحلل القانوني
3. 👨‍⚖️ رؤية القاضي
4. ⚡ استشارة سريعة
5. 📖 المختار الذكي

### س: كم رصيد تستهلك الاستشارة؟
**ج:** محدد في `.env.local`:
```
CREDITS_PER_MESSAGE=1
```

### س: هل يمكنني إضافة طرق دفع؟
**ج:** نعم، استخدم:
- Stripe
- Payfort
- Telr
- أي payment gateway

اقرأ [DEVELOPMENT.md](./DEVELOPMENT.md) لمثال.

### س: هل يوجد في مواضيع متعددة (dark mode)؟
**ج:** يمكنك إضافتها عبر TailwindCSS:
```typescript
// artifacts/al-mustashar/tailwind.config.ts
module.exports = {
  darkMode: 'class',
  // ...
}
```

---

## 🎓 التعليم والتعلم

### س: أين أتعلم TypeScript؟
**ج:**
- https://www.typescriptlang.org/docs
- https://scrimba.com/learn/typescript

### س: أين أتعلم React؟
**ج:**
- https://react.dev/learn
- https://www.youtube.com/watch?v=x8uS6kG0BHw

### س: أين أتعلم Express؟
**ج:**
- https://expressjs.com/
- https://www.udemy.com/course/nodejs-express

### س: كيف أصير full-stack developer؟
**ج:** ركز على:
1. **Frontend**: HTML, CSS, JavaScript, React
2. **Backend**: Node.js, Express, Database
3. **Projects**: اصنع مشاريع حقيقية

هذا المشروع مثال رائع! 💪

---

## 📞 الدعم التقني

### س: إلى من أتواصل للمساعدة؟
**ج:**
- 📧 البريد: bishoysamy390@gmail.com
- 🐛 GitHub Issues
- 💬 GitHub Discussions
- 📱 WhatsApp: ...

### س: كم وقت الرد على الأسئلة؟
**ج:** عادة 24 ساعة خلال أيام العمل.

### س: هل هناك documentation API؟
**ج:** نعم، يمكنك قراءة `openapi.yaml`:
```bash
cat lib/api-spec/openapi.yaml
```

---

## 💡 نصائح إضافية

### س: كيف أحسّن الأداء؟
**ج:**
- استخدم useMemo و useCallback
- lazy load المكونات الكبيرة
- cache API responses
- اضغط الصور

### س: كيف أضيف اختبارات؟
**ج:** استخدم Jest أو Vitest:
```bash
pnpm add -D vitest
```

### س: كيف أراقب الأداء؟
**ج:**
- Chrome DevTools
- Lighthouse
- Vercel Analytics
- New Relic

---

## 🎉 شكراً للأسئلة!

هل لديك سؤال آخر؟ 📝

اترك comment أو ابعت بريد! 📧

---

**آخر تحديث:** 25 مارس 2026  
**الإصدار:** 1.0.0
