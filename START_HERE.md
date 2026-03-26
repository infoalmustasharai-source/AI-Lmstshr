# 🎯 ابدأ من هنا - دليل البداية الفوري

# ⚡ التشغيل الآن (اختر أحدهما)

## ✅ الطريقة الأسهل (موصى بها)
```bash
cd /workspaces/AI-Lmstshr
pnpm dev
```
ستشاهد:
- ✅ Frontend على http://localhost:5173
- ✅ Backend على http://localhost:3001

## أو الطريقة المنفصلة
```bash
# Terminal 1
pnpm dev:backend

# Terminal 2 (جديد)
pnpm dev:frontend
```

---

# 📱 ثم جرب الواجهة

1. افتح: http://localhost:5173
2. سجل حساب جديد (أي بريد واختبر)
3. سجل دخول
4. اختر "محامي الدفاع"
5. اسأل: "ما حقوقي عند الاعتقال؟"

**ستحصل على إجابة من AI في ثوانِ** 💡

---

# 🔑 حساب الأدمن (لاختبار الإدارة)
```
URL: http://localhost:5173/admin-login
البريد: bishoysamy390@gmail.com
كلمة المرور: Bishoysamy
```

---

# 📖 أدلة مفيدة

أيهما تريد؟

| تريد | اقرأ |
|-----|-----|
| فهم المشروع | [README.md](./README.md) |
| بدء سريع | [QUICK_START.md](./QUICK_START.md) |
| اختبار شامل | [TEST_GUIDE.md](./TEST_GUIDE.md) |
| تطوير متقدم | [DEVELOPMENT.md](./DEVELOPMENT.md) |
| إجابات سريعة | [FAQ.md](./FAQ.md) |
| خطوات قادمة | [NEXT_STEPS.md](./NEXT_STEPS.md) |
| نشر على الويب | [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md) |
| فهرس كامل | [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md) |

---

# ⚠️ إذا حصل خطأ

## ❌ "Port مستخدم بالفعل"
```bash
# قتل العملية
lsof -i :3001
kill -9 PID
pnpm dev
```

## ❌ "Cannot find module"
```bash
pnpm install --force
pnpm dev
```

## ❌ "OPENAI_API_KEY undefined"
```bash
# أضفها في .env.local
echo "OPENAI_API_KEY=sk-your-key" >> .env.local
```

## ❌ حل شامل لأي مشكلة
```bash
pnpm clean
pnpm install --force
pnpm dev
```

**اقرأ [FAQ.md](./FAQ.md) لـ 30+ سؤال وحل** 

---

# ✨ ميزات المتاحة

✅ 5 شخصيات قانونية (دفاع، تحليل، رؤية قاضي، سريع، ذكي)
✅ محفظة رقمية مع نقاط
✅ لوحة تحكم أدمن
✅ تكامل ذكاء اصطناعي (OpenAI)
✅ أمان عالي (JWT, crypto)
✅ واجهة عربية احترافية

---

# 🚀 الخطوات التالية

## اليوم
1. شغّل المشروع
2. اختبر الميزات الأساسية
3. اقرأ [QUICK_START.md](./QUICK_START.md)

## الأسبوع
1. اقرأ [DEVELOPMENT.md](./DEVELOPMENT.md)
2. اختبر باستخدام [TEST_GUIDE.md](./TEST_GUIDE.md)
3. أضف ميزات إضافية

## المستقبل
1. اقرأ [SETUP_AND_DEPLOYMENT.md](./SETUP_AND_DEPLOYMENT.md)
2. نشّر على Vercel + Render
3. شغّل في الإنتاج

---

# 📞 هل تحتاج مساعدة؟

- ❓ أسئلة عامة → [FAQ.md](./FAQ.md)
- 🔧 مشاكل فنية → [FIXES_SUMMARY.md](./FIXES_SUMMARY.md)
- 📧 تواصل مباشر → bishoysamy390@gmail.com

---

# 🎉 هذا كل شيء!

المشروع **جاهز تماماً** للاستخدام الفوري.

### اضغط هنا لبدء التطبيق:
```bash
pnpm dev
```

**وستكون جاهزاً خلال 10 ثوانِ!** ⚡

---

**نجاح! 🎊**
