# ✅ دليل التحقق من سلامة المشروع

تحقق من أن كل شيء يعمل كما يجب.

---

## 🎯 الاختبار السريع (5 دقائق)

### 1. تشغيل المشروع
```bash
cd /workspaces/AI-Lmstshr
pnpm dev
```

**النجاح:**
- ✅ لا توجد أخطاء حمراء
- ✅ "Backend ready at http://localhost:3001"
- ✅ "Frontend ready at http://localhost:5173"

### 2. الوصول إلى الواجهة
افتح: **http://localhost:5173**

**النجاح:**
- ✅ تحميل الصفحة بسرعة
- ✅ الواجهة تبدو صحيحة
- ✅ الخط العربي يظهر
- ✅ الأزرار تستجيب

### 3. تسجيل حساب جديد
```
- أدخل بريد إلكتروني: test@example.com
- كلمة مرور: Test@1234
- انقر: "Sign Up"
```

**النجاح:**
- ✅ ظهور رسالة "تم التسجيل بنجاح"
- ✅ إعادة التوجيه إلى صفحة تسجيل الدخول
- ✅ لا توجد أخطاء في console

### 4. تسجيل الدخول
```
- البريد: test@example.com
- كلمة المرور: Test@1234
- انقر: "Sign In"
```

**النجاح:**
- ✅ الدخول إلى لوحة المحادثة
- ✅ عرض الشخصيات القانونية
- ✅ رصيد يظهر في الأعلى

### 5. محادثة اختبار
```
- اختر: "محامي الدفاع"
- السؤال: "ما هي حقوقي عند الاعتقال؟"
- انقر: "Send"
```

**النجاح:**
- ✅ ظهور الرسالة المرسلة
- ✅ ظهور مؤشر "جاري الكتابة..."
- ✅ وصول رد من AI خلال 10 ثوانِ
- ✅ خصم 1 رصيد

---

## 🏆 الاختبار الشامل (30 دقيقة)

### 1. اختبار التسجيل

**حالات نجاح:**
- [ ] تسجيل بريد صحيح + كلمة قوية
- [ ] رفع خطأ لـ "بريد موجود بالفعل"
- [ ] رفع خطأ لـ "كلمة ضعيفة"
- [ ] رفع خطأ لـ "البريد غير صحيح"

**الفحص:**
```bash
# تحقق من قاعدة البيانات
sqlite3 db.sqlite "SELECT * FROM users LIMIT 5;"
```

### 2. اختبار تسجيل الدخول

**حالات نجاح:**
- [ ] دخول ببريد وكلمة صحيحة
- [ ] رفع خطأ لـ "بيانات خاطئة"
- [ ] رفع خطأ لـ "بريد غير مسجل"
- [ ] تذكر البريد في حقل الإدخال

**الفحص:**
```bash
# تحقق من JWT token
# افتح DevTools
# انظر إلى Application > Cookies > auth_token
```

### 3. اختبار المحادثات

**حالات نجاح:**
- [ ] إظهار 5 شخصيات مختلفة
- [ ] تبديل بين الشخصيات
- [ ] إرسال رسالة جديدة
- [ ] عدم إرسال رسالة فارغة
- [ ] الخصم من الرصيد بعد الرسالة

**الفحص:**
```bash
# تحقق من الرسائل
sqlite3 db.sqlite "SELECT * FROM messages ORDER BY id DESC LIMIT 5;"
```

### 4. اختبار الرصيد والمحفظة

**حالات نجاح:**
- [ ] عرض الرصيد الحالي
- [ ] الخصم الصحيح لكل رسالة (1 رصيد)
- [ ] عدم السماح بـ message بدون رصيد
- [ ] عرض رسالة "الرصيد غير كافي"

### 5. اختبار لوحة الأدمن

**تسجيل الدخول:**
```
- اذهب إلى: http://localhost:5173/admin-login
- البريد: bishoysamy390@gmail.com
- كلمة المرور: Bishoysamy
```

**حالات نجاح:**
- [ ] الدخول بنجاح
- [ ] عرض قائمة المستخدمين
- [ ] عرض إجمالي الأرصدة
- [ ] عرض المعاملات

**اختبار شحن الرصيد:**
```
- ابحث عن المستخدم (test@example.com)
- أضف 10 أرصدة
- تحقق من الرصيد المحدّث في الحساب العادي
```

### 6. اختبار الواجهة والشكل

**تجربي:**
- [ ] الألوان صحيحة ومتناسقة
- [ ] الخط العربي يظهر صحيح
- [ ] الأزرار تستجيب بسرعة
- [ ] الرسوم التوضيحية محملة
- [ ] المحاذاة صحيحة (RTL)
- [ ] العنوين واضح

**في الموبايل:**
- [ ] افتح F12 في Chrome
- [ ] Ctrl+Shift+M لمحاكاة الموبايل
- [ ] اختبر بـ iPhone SE و Pixel 5
- [ ] تحقق من responsive design

---

## 🔧 الاختبارات الفنية

### 1. فحص TypeScript
```bash
pnpm typecheck
```

**النجاح:**
```
✅ No TypeScript errors found
```

### 2. فحص البناء
```bash
pnpm build
```

**النجاح:**
```
✅ Build completed successfully
✅ Frontend bundle size: ~XXX KB
✅ Backend bundle size: ~XXX KB
```

### 3. فحص الـ Dependencies
```bash
# تحقق من التحديثات
pnpm outdated

# تحقق من الثغرات الأمنية
pnpm audit
```

### 4. فحص الـ Linting (اختياري)
```bash
# إذا كان مثبت ESLint
pnpm lint
```

---

## 🧪 اختبار API (استخدم Postman أو curl)

### 1. Health Check
```bash
curl http://localhost:3001/api/health
```

**النجاح:**
```json
{
  "status": "ok",
  "timestamp": "2024-XX-XX..."
}
```

### 2. التسجيل
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

**النجاح:**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGc..."
}
```

### 3. تسجيل الدخول
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@1234"
  }'
```

### 4. إنشاء محادثة
```bash
curl -X POST http://localhost:3001/api/conversations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "استشارة قانونية"}'
```

### 5. إرسال رسالة
```bash
curl -X POST http://localhost:3001/api/messages \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "conversationId": 1,
    "content": "ما هي حقوقي؟",
    "personaId": "defense"
  }'
```

---

## 🐛 فحص الأخطاء

### تفعيل Debug Mode
```bash
DEBUG=* pnpm dev
```

### فتح Console في المتصفح
1. اضغط F12
2. اذهب إلى "Console" tab
3. ابحث عن الرسائل الحمراء

### عرض Log Backend
في Terminal حيث Backend يعمل:
```
[AUTH] User logged in: test@example.com
[CHAT] Message sent from user: ...
[ERROR] Database connection failed: ...
```

---

## 📊 قائمة التحقق النهائية

### قبل النشر على الإنتاج:

```
# الاختبارات الوظيفية
☑ تسجيل حساب جديد يعمل
☑ تسجيل الدخول يعمل
☑ المحادثات تعمل
☑ AI يرد بشكل صحيح
☑ الأرصدة تُخصم بشكل صحيح
☑ لوحة الأدمن تعمل

# الاختبارات الفنية
☑ TypeScript بدون أخطاء
☑ Build ينجح
☑ لا توجد dependency warnings
☑ No console errors

# الاختبارات الأمنية
☑ لا توجد secrets في الكود
☑ JWT tokens محمية
☑ SQL injection محمي
☑ الكائنات تحوح صحيح

# الاختبارات على الأداء
☑ صفحة تحمل سريعة (<3s)
☑ API يرد سريع (<1s)
☑ لا توجد memory leaks
☑ لا توجد infinite loops

# الاختبارات على التوافقية
☑ يعمل على Chrome
☑ يعمل على Firefox
☑ يعمل على Safari
☑ يعمل على الموبايل
```

---

## 🎯 ماذا تفعل إذا فشلت tests؟

### ❌ خطأ: "Port already in use"
```bash
lsof -i :3001
kill -9 PID
pnpm dev
```

### ❌ خطأ: "Cannot find module"
```bash
pnpm install --force
pnpm dev
```

### ❌ خطأ: "Database connection failed"
```bash
# تحقق من DATABASE_URL
cat .env.local | grep DATABASE

# أعد تعيينها
rm db.sqlite
pnpm dev
```

### ❌ خطأ: "OPENAI_API_KEY undefined"
```bash
# أضفها
echo "OPENAI_API_KEY=sk-..." >> .env.local
pnpm dev
```

### ❌ خطأ في Console: "Unauthorized"
```bash
# تحقق من Token في DevTools
# تأكد أنك مسجل دخول
# جرب تسجيل الخروج وإعادة التسجيل
```

---

## 📈 بعد كل اختبار ناجح

```bash
# احفظ التقدم
git add .
git commit -m "✅ Tests passed"
git push origin master
```

---

## 🎉 نجاح!

إذا مرّت جميع الاختبارات ✅

**أنت جاهز للإنتاج!** 🚀

اقرأ:
- [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) - النشر
- [NEXT_STEPS.md](./NEXT_STEPS.md) - الخطوات التالية

---

**آخر تحديث:** 25 مارس 2026
