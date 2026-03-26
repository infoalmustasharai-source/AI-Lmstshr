import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Zap, Crown, Building2, Sparkles } from "lucide-react";
import { useUsage } from "@/hooks/use-usage";

interface PricingModalProps {
  open: boolean;
  onClose: () => void;
}

const plans = [
  {
    id: "basic" as const,
    name: "الأساسي",
    price: "49",
    period: "شهر",
    description: "مثالي للاستخدام الشخصي",
    icon: Zap,
    color: "blue",
    gradient: "from-blue-500 to-blue-600",
    border: "border-blue-500/30",
    badge: null,
    features: [
      "50 تحليلاً شهرياً",
      "رفع ملفات غير محدود",
      "دعم الصور والمستندات",
      "تاريخ المحادثات",
      "دعم عبر البريد الإلكتروني",
    ],
  },
  {
    id: "pro" as const,
    name: "الاحترافي",
    price: "99",
    period: "شهر",
    description: "للمحترفين والفرق الصغيرة",
    icon: Crown,
    color: "violet",
    gradient: "from-violet-500 to-purple-600",
    border: "border-violet-500/40",
    badge: "الأكثر شعبية",
    features: [
      "200 تحليل شهرياً",
      "رفع ملفات غير محدود",
      "أولوية في المعالجة",
      "تحليل ملفات PDF",
      "تصدير المحادثات",
      "دعم أولوية 24/7",
    ],
  },
  {
    id: "enterprise" as const,
    name: "المؤسسي",
    price: "299",
    period: "شهر",
    description: "للشركات والمؤسسات",
    icon: Building2,
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
    border: "border-amber-500/30",
    badge: null,
    features: [
      "تحليلات غير محدودة",
      "رفع ملفات غير محدود",
      "وصول API مخصص",
      "لوحة تحكم المؤسسة",
      "تدريب مخصص للنموذج",
      "مدير حساب مخصص",
      "اتفاقية SLA مضمونة",
    ],
  },
];

export function PricingModal({ open, onClose }: PricingModalProps) {
  const { upgradePlan } = useUsage();

  const handleUpgrade = (planId: "basic" | "pro" | "enterprise") => {
    upgradePlan(planId);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="relative rounded-2xl border border-white/10 bg-[#0f0f0f] shadow-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-transparent to-blue-950/20 pointer-events-none" />
              
              <div className="relative p-6 md:p-8">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="text-center mb-8">
                  <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm px-4 py-1.5 rounded-full mb-4">
                    <Sparkles className="h-3.5 w-3.5" />
                    استمر في الاستفادة من المستشار AI
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    لقد استخدمت تحليلاتك المجانية الـ3
                  </h2>
                  <p className="text-white/50 text-sm max-w-md mx-auto">
                    اختر الباقة المناسبة لك واستمر في الحصول على تحليلات دقيقة واحترافية بدون حدود
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    const Icon = plan.icon;
                    const isPro = plan.id === "pro";
                    return (
                      <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: plans.indexOf(plan) * 0.1 }}
                        className={`relative rounded-xl border p-5 flex flex-col ${plan.border} ${
                          isPro
                            ? "bg-gradient-to-b from-violet-950/60 to-purple-950/40"
                            : "bg-white/5"
                        }`}
                      >
                        {plan.badge && (
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                            <span className={`bg-gradient-to-r ${plan.gradient} text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg`}>
                              {plan.badge}
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mb-4">
                          <div className={`p-2 rounded-lg bg-gradient-to-br ${plan.gradient} shadow-lg`}>
                            <Icon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm">{plan.name}</h3>
                            <p className="text-white/40 text-xs">{plan.description}</p>
                          </div>
                        </div>

                        <div className="mb-5">
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                            <span className="text-white/50 text-sm">ريال/{plan.period}</span>
                          </div>
                        </div>

                        <ul className="space-y-2 mb-5 flex-1">
                          {plan.features.map((feature) => (
                            <li key={feature} className="flex items-start gap-2 text-sm text-white/70">
                              <Check className={`h-4 w-4 shrink-0 mt-0.5 bg-gradient-to-br ${plan.gradient} rounded-full p-0.5 text-white`} />
                              {feature}
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleUpgrade(plan.id)}
                          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                            isPro
                              ? `bg-gradient-to-r ${plan.gradient} text-white hover:opacity-90 shadow-lg shadow-violet-500/25`
                              : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
                          }`}
                        >
                          ابدأ الآن
                        </button>
                      </motion.div>
                    );
                  })}
                </div>

                <p className="text-center text-white/30 text-xs mt-6">
                  يمكنك إلغاء الاشتراك في أي وقت · بدون رسوم خفية · دفع آمن
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
