import React, { useState, useEffect, useRef, useMemo, createContext, useContext } from "react";
import {
  Home, FileText, Sparkles, Brain, Layers, Calendar, BarChart2, User, LogOut,
  Menu, X, Upload, Trash2, Copy, Download, ChevronLeft, ChevronRight, Shuffle,
  Check, Clock, Search, Bell, Eye, EyeOff, Play, ArrowRight, Star, CheckCircle2,
  Circle, Plus, Camera, Mail, Lock, TrendingUp, Award, Target, Zap, RotateCcw,
  BookOpen, GraduationCap, ListChecks, FileUp, FileType2, Flame, ChevronDown,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ============================================================
   UTILITIES
============================================================ */
const cn = (...c) => c.filter(Boolean).join(" ");

function useCountUp(target, duration = 1200, trigger = true) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = null;
    let raf;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setValue(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, trigger]);
  return value;
}

/* ============================================================
   GLOBAL STYLE INJECTION (fonts + keyframes not in core tailwind)
============================================================ */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      .font-display { font-family: 'Sora', ui-sans-serif, system-ui, sans-serif; }
      .font-body { font-family: 'Inter', ui-sans-serif, system-ui, sans-serif; }

      @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes floatY { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-14px); } }
      @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
      @keyframes ripple { to { transform: scale(3); opacity: 0; } }
      @keyframes blink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
      @keyframes toastIn { from { opacity: 0; transform: translateX(24px); } to { opacity: 1; transform: translateX(0); } }
      @keyframes spinSlow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

      .anim-fadeIn { animation: fadeIn 500ms ease both; }
      .anim-slideUp { animation: slideUp 600ms cubic-bezier(.22,1,.36,1) both; }
      .anim-float { animation: floatY 6s ease-in-out infinite; }
      .anim-toastIn { animation: toastIn 300ms cubic-bezier(.22,1,.36,1) both; }
      .anim-spinSlow { animation: spinSlow 12s linear infinite; }

      .skeleton {
        background: linear-gradient(90deg, #1e293b 0px, #29394f 40px, #1e293b 80px);
        background-size: 600px;
        animation: shimmer 1.6s infinite linear;
      }

      .glass {
        background: rgba(30, 41, 59, 0.55);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        border: 1px solid rgba(148, 163, 184, 0.12);
      }
      .glass-strong {
        background: rgba(30, 41, 59, 0.75);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border: 1px solid rgba(148, 163, 184, 0.15);
      }
      /* Sticky nav / sidebar / topbar need a near-opaque backdrop so scrolling
         content doesn't ghost through the blur, plus a clearly visible border
         to separate them from the page. */
      .nav-glass {
        background: rgba(15, 23, 42, 0.92);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        border-color: rgba(148, 163, 184, 0.35);
      }
      .nav-glass.border-b { border-bottom-width: 1px; }
      .nav-glass.border-r { border-right-width: 1px; }
      .text-gradient {
        background: linear-gradient(90deg, #818cf8, #a78bfa, #c084fc);
        -webkit-background-clip: text;
        background-clip: text;
        color: transparent;
      }
      .card-hover { transition: transform 350ms cubic-bezier(.22,1,.36,1), box-shadow 350ms ease, border-color 350ms ease; }
      .card-hover:hover { transform: translateY(-6px); box-shadow: 0 20px 40px -12px rgba(99,102,241,0.35); border-color: rgba(129,140,248,0.4); }

      .flip-card { perspective: 1600px; }
      .flip-inner { position: relative; width: 100%; height: 100%; transition: transform 600ms cubic-bezier(.22,1,.36,1); transform-style: preserve-3d; }
      .flip-inner.flipped { transform: rotateY(180deg); }
      .flip-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      .flip-back { transform: rotateY(180deg); }

      .caret { display:inline-block; width:3px; margin-left:4px; background: #a78bfa; animation: blink 1s step-start infinite; }

      ::-webkit-scrollbar { width: 8px; height: 8px; }
      ::-webkit-scrollbar-track { background: #0f172a; }
      ::-webkit-scrollbar-thumb { background: #334155; border-radius: 8px; }
      ::-webkit-scrollbar-thumb:hover { background: #475569; }

      .stagger > * { animation: slideUp 600ms cubic-bezier(.22,1,.36,1) both; }
      .stagger > *:nth-child(1) { animation-delay: 0ms; }
      .stagger > *:nth-child(2) { animation-delay: 90ms; }
      .stagger > *:nth-child(3) { animation-delay: 180ms; }
      .stagger > *:nth-child(4) { animation-delay: 270ms; }
      .stagger > *:nth-child(5) { animation-delay: 360ms; }
      .stagger > *:nth-child(6) { animation-delay: 450ms; }
    `}</style>
  );
}

/* ============================================================
   TOAST SYSTEM
============================================================ */
const ToastCtx = createContext(null);
function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = (message, type = "success") => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3200);
  };
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-5 right-5 z-[200] flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "anim-toastIn glass-strong rounded-2xl px-4 py-3 text-sm font-medium shadow-2xl flex items-center gap-2 min-w-[220px]",
              t.type === "success" && "text-emerald-300 border-emerald-400/30",
              t.type === "error" && "text-rose-300 border-rose-400/30",
              t.type === "info" && "text-indigo-300 border-indigo-400/30"
            )}
          >
            {t.type === "success" && <CheckCircle2 size={16} />}
            {t.type === "error" && <X size={16} />}
            {t.type === "info" && <Sparkles size={16} />}
            <span className="text-slate-100">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
const useToast = () => useContext(ToastCtx);

/* ============================================================
   RIPPLE BUTTON
============================================================ */
function RippleButton({ children, className, onClick, ...props }) {
  const ref = useRef(null);
  const handleClick = (e) => {
    const btn = ref.current;
    if (btn) {
      const rect = btn.getBoundingClientRect();
      const span = document.createElement("span");
      const size = Math.max(rect.width, rect.height);
      span.style.position = "absolute";
      span.style.borderRadius = "9999px";
      span.style.background = "rgba(255,255,255,0.45)";
      span.style.width = span.style.height = size + "px";
      span.style.left = e.clientX - rect.left - size / 2 + "px";
      span.style.top = e.clientY - rect.top - size / 2 + "px";
      span.style.pointerEvents = "none";
      span.style.transform = "scale(0)";
      span.style.animation = "ripple 600ms ease-out";
      btn.appendChild(span);
      setTimeout(() => span.remove(), 650);
    }
    onClick && onClick(e);
  };
  return (
    <button
      ref={ref}
      onClick={handleClick}
      className={cn("relative overflow-hidden", className)}
      {...props}
    >
      {children}
    </button>
  );
}

/* ============================================================
   TYPEWRITER
============================================================ */
function Typewriter({ words, className }) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx % words.length];
    const speed = deleting ? 35 : 65;
    const timeout = setTimeout(() => {
      if (!deleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);
        if (next === current) setTimeout(() => setDeleting(true), 1200);
      } else {
        const next = current.slice(0, text.length - 1);
        setText(next);
        if (next === "") {
          setDeleting(false);
          setWordIdx((i) => i + 1);
        }
      }
    }, speed);
    return () => clearTimeout(timeout);
  }, [text, deleting, wordIdx, words]);

  return (
    <span className={className}>
      {text}
      <span className="caret">&nbsp;</span>
    </span>
  );
}

/* ============================================================
   SHARED UI: SectionTag, StatCard, EmptyState, Skeletons
============================================================ */
function SectionTag({ children }) {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase glass text-indigo-300 border border-indigo-400/20">
      {children}
    </span>
  );
}

function StatCard({ icon: Icon, label, value, suffix = "", accent = "indigo", delay = 0 }) {
  const count = useCountUp(value, 1400);
  return (
    <div
      className="glass rounded-3xl p-5 card-hover anim-slideUp"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "w-11 h-11 rounded-2xl flex items-center justify-center",
            accent === "indigo" && "bg-indigo-500/15 text-indigo-300",
            accent === "violet" && "bg-violet-500/15 text-violet-300",
            accent === "emerald" && "bg-emerald-500/15 text-emerald-300",
            accent === "amber" && "bg-amber-500/15 text-amber-300"
          )}
        >
          <Icon size={20} />
        </div>
        <TrendingUp size={16} className="text-emerald-400" />
      </div>
      <div className="mt-4 text-3xl font-bold font-display text-white">
        {count}
        {suffix}
      </div>
      <div className="text-sm text-slate-400 mt-1">{label}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="glass rounded-3xl p-12 flex flex-col items-center text-center anim-fadeIn">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-4">
        <Icon size={28} className="text-indigo-300" />
      </div>
      <h3 className="text-lg font-semibold text-white font-display">{title}</h3>
      <p className="text-slate-400 text-sm mt-1 max-w-sm">{subtitle}</p>
      {actionLabel && (
        <RippleButton
          onClick={onAction}
          className="mt-5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:brightness-110 transition"
        >
          {actionLabel}
        </RippleButton>
      )}
    </div>
  );
}

function SkeletonCard() {
  return <div className="skeleton rounded-3xl h-32 w-full" />;
}

/* ============================================================
   LANDING PAGE
============================================================ */
function Navbar({ go }) {
  const [open, setOpen] = useState(false);
  const links = ["Features", "Pricing", "Testimonials"];
  return (
    <nav className="sticky top-0 z-50 nav-glass border-b">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => go("landing")}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
            <GraduationCap size={20} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg text-white">StudyAI</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-slate-300 hover:text-white transition">
              {l}
            </a>
          ))}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button onClick={() => go("login")} className="text-sm font-medium text-slate-300 hover:text-white transition px-4 py-2">
            Log in
          </button>
          <RippleButton
            onClick={() => go("signup")}
            className="text-sm font-semibold text-white px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:brightness-110 transition shadow-lg shadow-indigo-500/25"
          >
            Get Started
          </RippleButton>
        </div>
        <button className="md:hidden text-slate-200" onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden nav-glass border-b px-6 pb-5 flex flex-col gap-3 anim-slideUp">
          {links.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} className="text-sm text-slate-300 py-1" onClick={() => setOpen(false)}>
              {l}
            </a>
          ))}
          <div className="flex flex-col gap-2 pt-2">
            <button onClick={() => go("login")} className="text-sm font-medium text-slate-300 py-2 text-left">
              Log in
            </button>
            <button
              onClick={() => go("signup")}
              className="text-sm font-semibold text-white px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500"
            >
              Get Started
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}

function Hero({ go }) {
  return (
    <section className="relative overflow-hidden px-6 pt-20 pb-28">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-[120px] anim-float" />
      <div className="absolute -top-10 right-0 w-96 h-96 bg-violet-600/30 rounded-full blur-[120px] anim-float" style={{ animationDelay: "1.5s" }} />
      <div className="max-w-5xl mx-auto text-center relative">
        <div className="anim-slideUp flex justify-center mb-6">
          <SectionTag>
            <Sparkles size={13} /> Powered by AI
          </SectionTag>
        </div>
        <h1 className="anim-slideUp font-display text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight" style={{ animationDelay: "80ms" }}>
          Your AI-Powered
          <br />
          <span className="text-gradient">
            <Typewriter words={["Study Companion", "Note Summarizer", "Quiz Generator", "Exam Partner"]} />
          </span>
        </h1>
        <p className="anim-slideUp mt-6 text-slate-400 text-lg max-w-2xl mx-auto" style={{ animationDelay: "160ms" }}>
          Turn messy notes into crisp summaries, auto-generated quizzes, and flashcards — then track every study
          hour on one clean dashboard.
        </p>
        <div className="anim-slideUp mt-9 flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animationDelay: "240ms" }}>
          <RippleButton
            onClick={() => go("signup")}
            className="group px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-xl shadow-indigo-500/30 hover:brightness-110 transition flex items-center gap-2"
          >
            Get Started <ArrowRight size={17} className="group-hover:translate-x-1 transition" />
          </RippleButton>
          <RippleButton className="px-7 py-3.5 rounded-2xl glass text-slate-200 font-semibold hover:bg-slate-700/40 transition flex items-center gap-2">
            <Play size={16} /> Watch Demo
          </RippleButton>
        </div>
        <div className="anim-fadeIn mt-16 glass-strong rounded-3xl p-3 max-w-4xl mx-auto shadow-2xl" style={{ animationDelay: "400ms" }}>
          <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: FileText, label: "Notes", value: "128" },
              { icon: Brain, label: "Quizzes", value: "64" },
              { icon: Layers, label: "Flashcards", value: "312" },
              { icon: Clock, label: "Study Hrs", value: "97" },
            ].map((s, i) => (
              <div key={i} className="text-left">
                <s.icon size={18} className="text-indigo-400 mb-2" />
                <div className="text-xl font-bold text-white font-display">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Sparkles, title: "AI Notes Summarizer", desc: "Upload any PDF or DOCX and get a clean, structured summary with key points in seconds." },
  { icon: Brain, title: "Quiz Generator", desc: "Auto-generate MCQs, true/false, and short-answer quizzes from your own material." },
  { icon: Layers, title: "Flashcards", desc: "Turn concepts into flip-style flashcards with smart shuffle for spaced repetition." },
  { icon: Calendar, title: "Study Planner", desc: "Plan deadlines, track weekly goals, and stay ahead of every exam." },
  { icon: BarChart2, title: "Progress Tracking", desc: "Visualize study hours, quiz scores, and daily consistency on rich charts." },
];

function Features() {
  return (
    <section id="features" className="px-6 py-24 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <SectionTag>Features</SectionTag>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-4">Everything you need to study smarter</h2>
        <p className="text-slate-400 mt-3 max-w-xl mx-auto">One workspace for notes, quizzes, flashcards, planning, and progress.</p>
      </div>
      <div className="stagger grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <div key={i} className="glass rounded-3xl p-6 card-hover">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
              <f.icon size={22} className="text-white" />
            </div>
            <h3 className="font-display font-semibold text-white text-lg">{f.title}</h3>
            <p className="text-slate-400 text-sm mt-2 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const TESTIMONIALS = [
  { name: "Amelia Chen", role: "Med School, Year 2", text: "Cut my revision time in half. The AI summaries actually capture what matters.", rating: 5 },
  { name: "Rohan Verma", role: "CS Undergrad", text: "The quiz generator feels like a personal TA that never gets tired.", rating: 5 },
  { name: "Sara Ibrahim", role: "MBA Candidate", text: "Flashcards plus the planner keep me consistent across three classes at once.", rating: 4 },
];

function Testimonials() {
  return (
    <section id="testimonials" className="px-6 py-24 max-w-7xl mx-auto">
      <div className="text-center mb-14">
        <SectionTag>Loved by students</SectionTag>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-4">Real results, real students</h2>
      </div>
      <div className="stagger grid md:grid-cols-3 gap-6">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="glass rounded-3xl p-6 card-hover flex flex-col">
            <div className="flex gap-1 mb-4">
              {Array.from({ length: 5 }).map((_, s) => (
                <Star key={s} size={15} className={s < t.rating ? "text-amber-400 fill-amber-400" : "text-slate-600"} />
              ))}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed flex-1">&ldquo;{t.text}&rdquo;</p>
            <div className="flex items-center gap-3 mt-5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold font-display">
                {t.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing({ go }) {
  const plans = [
    { name: "Free", price: "$0", desc: "Great for getting started", features: ["5 notes / month", "10 quiz generations", "Basic flashcards", "Community support"], cta: "Get Started", highlight: false },
    { name: "Premium", price: "$12", desc: "For serious, consistent studying", features: ["Unlimited notes", "Unlimited quizzes", "Advanced flashcards + shuffle", "Full analytics dashboard", "Priority support"], cta: "Go Premium", highlight: true },
  ];
  return (
    <section id="pricing" className="px-6 py-24 max-w-5xl mx-auto">
      <div className="text-center mb-14">
        <SectionTag>Pricing</SectionTag>
        <h2 className="font-display text-3xl md:text-4xl font-bold text-white mt-4">Simple, honest pricing</h2>
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        {plans.map((p, i) => (
          <div
            key={i}
            className={cn(
              "rounded-3xl p-8 card-hover relative",
              p.highlight ? "bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-400/40 glass-strong" : "glass"
            )}
          >
            {p.highlight && (
              <span className="absolute -top-3 right-8 text-xs font-bold px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                MOST POPULAR
              </span>
            )}
            <h3 className="font-display font-bold text-xl text-white">{p.name}</h3>
            <p className="text-slate-400 text-sm mt-1">{p.desc}</p>
            <div className="mt-5 flex items-end gap-1">
              <span className="text-4xl font-extrabold text-white font-display">{p.price}</span>
              <span className="text-slate-400 text-sm mb-1">/month</span>
            </div>
            <ul className="mt-6 space-y-3">
              {p.features.map((f, j) => (
                <li key={j} className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <RippleButton
              onClick={() => go("signup")}
              className={cn(
                "mt-8 w-full py-3 rounded-xl font-semibold text-sm transition",
                p.highlight ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:brightness-110 shadow-lg shadow-indigo-500/25" : "glass text-slate-200 hover:bg-slate-700/40"
              )}
            >
              {p.cta}
            </RippleButton>
          </div>
        ))}
      </div>
    </section>
  );
}

function Footer({ go }) {
  return (
    <footer className="px-6 py-14 border-t border-slate-800/80">
      <div className="max-w-7xl mx-auto grid sm:grid-cols-2 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <GraduationCap size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-white">StudyAI</span>
          </div>
          <p className="text-sm text-slate-500">Your AI-powered study companion, from first note to final exam.</p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Product</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li className="hover:text-slate-300 cursor-pointer transition">Features</li>
            <li className="hover:text-slate-300 cursor-pointer transition">Pricing</li>
            <li className="hover:text-slate-300 cursor-pointer transition" onClick={() => go("login")}>Log in</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Company</h4>
          <ul className="space-y-2 text-sm text-slate-500">
            <li className="hover:text-slate-300 cursor-pointer transition">About</li>
            <li className="hover:text-slate-300 cursor-pointer transition">Blog</li>
            <li className="hover:text-slate-300 cursor-pointer transition">Contact: hello@studyai.app</li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Follow</h4>
          <div className="flex gap-3">
            {["Twitter", "GitHub", "LinkedIn"].map((s) => (
              <span key={s} className="w-9 h-9 rounded-xl glass flex items-center justify-center text-xs text-slate-400 hover:text-white hover:border-indigo-400/40 transition cursor-pointer">
                {s[0]}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-6 border-t border-slate-800/60 text-xs text-slate-600 flex flex-col sm:flex-row justify-between gap-2">
        <span>© 2026 StudyAI. All rights reserved.</span>
        <span>Made for focused, consistent studying.</span>
      </div>
    </footer>
  );
}

function LandingPage({ go }) {
  return (
    <div className="anim-fadeIn">
      <Navbar go={go} />
      <Hero go={go} />
      <Features />
      <Testimonials />
      <Pricing go={go} />
      <Footer go={go} />
    </div>
  );
}

/* ============================================================
   AUTH PAGES
============================================================ */
function AuthShell({ children, go }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-600/25 rounded-full blur-[130px] anim-float" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/25 rounded-full blur-[130px] anim-float" style={{ animationDelay: "2s" }} />
      <div
        className="absolute top-6 left-6 flex items-center gap-2 cursor-pointer relative z-10"
        onClick={() => go("landing")}
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
          <GraduationCap size={16} className="text-white" />
        </div>
        <span className="font-display font-bold text-white">StudyAI</span>
      </div>
      <div className="relative z-10 w-full max-w-md anim-slideUp">{children}</div>
    </div>
  );
}

function TextField({ label, icon: Icon, type = "text", value, onChange, placeholder, right }) {
  return (
    <div>
      <label className="text-sm font-medium text-slate-300 mb-1.5 block">{label}</label>
      <div className="relative">
        {Icon && <Icon size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={cn(
            "w-full bg-slate-900/60 border border-slate-700/70 rounded-xl py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20 transition",
            Icon ? "pl-10" : "pl-4",
            right ? "pr-10" : "pr-4"
          )}
        />
        {right}
      </div>
    </div>
  );
}

function LoginPage({ go, onLogin }) {
  const [email, setEmail] = useState("student@studyai.app");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast("Welcome back!", "success");
      onLogin({ name: "Alex Morgan", email });
      go("dashboard");
    }, 900);
  };

  return (
    <AuthShell go={go}>
      <form onSubmit={submit} className="glass-strong rounded-3xl p-8 shadow-2xl space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Log in to continue your study streak.</p>
        </div>
        <TextField label="Email" icon={Mail} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        <TextField
          label="Password"
          icon={Lock}
          type={show ? "text" : "password"}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          right={
            <button type="button" onClick={() => setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
              {show ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          }
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-indigo-500 w-4 h-4 rounded" />
            Remember me
          </label>
          <span className="text-indigo-300 hover:text-indigo-200 cursor-pointer">Forgot password?</span>
        </div>
        <RippleButton
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:brightness-110 transition flex items-center justify-center gap-2"
        >
          {loading ? <RotateCcw size={16} className="anim-spinSlow" /> : "Log in"}
        </RippleButton>
        <p className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <span className="text-indigo-300 hover:text-indigo-200 cursor-pointer font-medium" onClick={() => go("signup")}>
            Sign up
          </span>
        </p>
      </form>
    </AuthShell>
  );
}

function SignupPage({ go, onLogin }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast("Passwords don't match", "error");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast("Account created — let's study!", "success");
      onLogin({ name: form.name || "New Student", email: form.email });
      go("dashboard");
    }, 900);
  };

  return (
    <AuthShell go={go}>
      <form onSubmit={submit} className="glass-strong rounded-3xl p-8 shadow-2xl space-y-5">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Start studying smarter in under a minute.</p>
        </div>
        <TextField label="Full name" icon={User} value={form.name} onChange={set("name")} placeholder="Alex Morgan" />
        <TextField label="Email" icon={Mail} type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" />
        <TextField label="Password" icon={Lock} type="password" value={form.password} onChange={set("password")} placeholder="••••••••" />
        <TextField label="Confirm password" icon={Lock} type="password" value={form.confirm} onChange={set("confirm")} placeholder="••••••••" />
        <RippleButton
          type="submit"
          className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold shadow-lg shadow-indigo-500/25 hover:brightness-110 transition flex items-center justify-center gap-2"
        >
          {loading ? <RotateCcw size={16} className="anim-spinSlow" /> : "Create account"}
        </RippleButton>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <span className="text-indigo-300 hover:text-indigo-200 cursor-pointer font-medium" onClick={() => go("login")}>
            Log in
          </span>
        </p>
      </form>
    </AuthShell>
  );
}

/* ============================================================
   DASHBOARD SHELL: Sidebar + Topbar
============================================================ */
const NAV_ITEMS = [
  { key: "overview", label: "Dashboard", icon: Home },
  { key: "notes", label: "Notes", icon: FileText },
  { key: "summary", label: "AI Summary", icon: Sparkles },
  { key: "quiz", label: "Quiz Generator", icon: Brain },
  { key: "flashcards", label: "Flashcards", icon: Layers },
  { key: "planner", label: "Study Planner", icon: Calendar },
  { key: "analytics", label: "Analytics", icon: BarChart2 },
  { key: "profile", label: "Profile", icon: User },
];

function Sidebar({ active, setActive, collapsed, setCollapsed, mobileOpen, setMobileOpen, go, onLogout }) {
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setMobileOpen(false)} />}
      <aside
        className={cn(
          "fixed md:sticky top-0 h-screen z-40 nav-glass border-r flex flex-col transition-all duration-300 shrink-0",
          collapsed ? "md:w-20" : "md:w-64",
          mobileOpen ? "left-0" : "-left-72 md:left-0",
          "w-64"
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <GraduationCap size={18} className="text-white" />
            </div>
            {!collapsed && <span className="font-display font-bold text-white whitespace-nowrap">StudyAI</span>}
          </div>
          <button className="hidden md:block text-slate-500 hover:text-white transition" onClick={() => setCollapsed(!collapsed)}>
            <ChevronLeft size={18} className={cn("transition-transform", collapsed && "rotate-180")} />
          </button>
          <button className="md:hidden text-slate-500 hover:text-white" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                setActive(item.key);
                setMobileOpen(false);
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition group relative",
                active === item.key ? "bg-gradient-to-r from-indigo-500/20 to-violet-500/20 text-white border border-indigo-400/30" : "text-slate-400 hover:bg-slate-800/60 hover:text-white"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} className={cn("shrink-0", active === item.key && "text-indigo-300")} />
              {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              {active === item.key && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-indigo-400 to-violet-400" />}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-800/70">
          <button
            onClick={() => {
              onLogout();
              go("landing");
            }}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-300 transition"
          >
            <LogOut size={18} className="shrink-0" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>
    </>
  );
}

function Topbar({ setMobileOpen, user, pageTitle }) {
  const [notifOpen, setNotifOpen] = useState(false);
  const notifs = [
    { text: "Your quiz on Cell Biology scored 92%", time: "2h ago" },
    { text: "3 new flashcards generated from Chapter 4 notes", time: "5h ago" },
    { text: "Study Planner: Physics deadline tomorrow", time: "1d ago" },
  ];
  return (
    <header className="sticky top-0 z-20 nav-glass border-b px-5 py-4 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button className="md:hidden text-slate-300" onClick={() => setMobileOpen(true)}>
          <Menu size={22} />
        </button>
        <h1 className="font-display font-bold text-lg text-white hidden sm:block">{pageTitle}</h1>
      </div>
      <div className="flex-1 max-w-md hidden sm:block">
        <div className="relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            placeholder="Search notes, quizzes, flashcards..."
            className="w-full bg-slate-900/60 border border-slate-700/70 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20 transition"
          />
        </div>
      </div>
      <div className="flex items-center gap-3 relative">
        <button onClick={() => setNotifOpen(!notifOpen)} className="relative w-9 h-9 rounded-xl glass flex items-center justify-center text-slate-300 hover:text-white transition">
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-violet-400" />
        </button>
        {notifOpen && (
          <div className="absolute right-0 top-12 w-80 glass-strong rounded-2xl p-3 shadow-2xl anim-slideUp z-30">
            <div className="text-sm font-semibold text-white px-2 py-1">Notifications</div>
            {notifs.map((n, i) => (
              <div key={i} className="px-2 py-2.5 rounded-xl hover:bg-slate-800/60 transition cursor-pointer">
                <p className="text-sm text-slate-200">{n.text}</p>
                <p className="text-xs text-slate-500 mt-0.5">{n.time}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white">
            {(user?.name || "A M").split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <span className="text-sm text-slate-200 hidden lg:block">{user?.name || "Alex Morgan"}</span>
        </div>
      </div>
    </header>
  );
}

/* ============================================================
   DASHBOARD OVERVIEW
============================================================ */
function DashboardOverview({ user, data, setActive }) {
  const chartData = data.weeklyHours;
  return (
    <div className="p-5 md:p-8 space-y-8 anim-fadeIn">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Welcome back, {user?.name?.split(" ")[0] || "Alex"} 👋</h2>
        <p className="text-slate-400 text-sm mt-1">Here's how your studying is going this week.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={FileText} label="Notes Uploaded" value={data.notes.length} accent="indigo" delay={0} />
        <StatCard icon={Brain} label="Quizzes Generated" value={data.quizStats.length} accent="violet" delay={80} />
        <StatCard icon={Layers} label="Flashcards Created" value={data.flashcards.length} accent="emerald" delay={160} />
        <StatCard icon={Clock} label="Study Hours" value={97} accent="amber" delay={240} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl p-6 anim-slideUp">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-white">Weekly study hours</h3>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Flame size={14} className="text-amber-400" /> 6-day streak
            </span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="hours" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#6366f1", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-3xl p-6 anim-slideUp" style={{ animationDelay: "100ms" }}>
          <h3 className="font-display font-semibold text-white mb-4">Quick actions</h3>
          <div className="space-y-3">
            {[
              { icon: Upload, label: "Upload new notes", key: "notes" },
              { icon: Brain, label: "Generate a quiz", key: "quiz" },
              { icon: Layers, label: "Review flashcards", key: "flashcards" },
              { icon: Calendar, label: "Plan this week", key: "planner" },
            ].map((a) => (
              <button
                key={a.key}
                onClick={() => setActive(a.key)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-indigo-400/40 transition text-left"
              >
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center">
                  <a.icon size={16} className="text-indigo-300" />
                </div>
                <span className="text-sm text-slate-200 font-medium">{a.label}</span>
                <ArrowRight size={14} className="ml-auto text-slate-500" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-3xl p-6 anim-slideUp">
        <h3 className="font-display font-semibold text-white mb-4">Recent notes</h3>
        {data.notes.length === 0 ? (
          <EmptyState icon={FileText} title="No notes yet" subtitle="Upload your first PDF or DOCX to get started." actionLabel="Upload notes" onAction={() => setActive("notes")} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.notes.slice(0, 3).map((n) => (
              <div key={n.id} className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-4 flex items-center gap-3 card-hover">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-300">
                  <FileType2 size={18} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{n.name}</p>
                  <p className="text-xs text-slate-500">{n.size}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   NOTES UPLOAD MODULE
============================================================ */
function NotesPage({ notes, setNotes }) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(null);
  const toast = useToast();
  const inputRef = useRef(null);

  const addFile = (file) => {
    const id = Math.random().toString(36).slice(2);
    const ext = file.name.split(".").pop().toUpperCase();
    const sizeKb = (file.size / 1024).toFixed(0);
    setUploading({ id, name: file.name, progress: 0 });
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setNotes((prev) => [{ id, name: file.name, ext, size: `${sizeKb} KB`, date: "Just now" }, ...prev]);
        setUploading(null);
        toast(`${file.name} uploaded successfully`, "success");
      } else {
        setUploading({ id, name: file.name, progress });
      }
    }, 200);
  };

  const handleFiles = (fileList) => {
    const file = fileList[0];
    if (!file) return;
    const okTypes = ["pdf", "docx", "doc"];
    const ext = file.name.split(".").pop().toLowerCase();
    if (!okTypes.includes(ext)) {
      toast("Only PDF or DOCX files are supported", "error");
      return;
    }
    addFile(file);
  };

  const remove = (id) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast("File deleted", "info");
  };

  return (
    <div className="p-5 md:p-8 space-y-6 anim-fadeIn">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Notes</h2>
        <p className="text-slate-400 text-sm mt-1">Upload PDFs or DOCX files to summarize, quiz, and flashcard from.</p>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "rounded-3xl border-2 border-dashed p-12 flex flex-col items-center text-center cursor-pointer transition-all",
          dragOver ? "border-indigo-400 bg-indigo-500/10 shadow-[0_0_40px_rgba(99,102,241,0.35)]" : "border-slate-700/70 glass hover:border-slate-600"
        )}
      >
        <input ref={inputRef} type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
        <div className={cn("w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center mb-4 transition-transform", dragOver && "scale-110")}>
          <FileUp size={26} className="text-indigo-300" />
        </div>
        <h3 className="font-display font-semibold text-white">Drag & drop your file here</h3>
        <p className="text-slate-500 text-sm mt-1">or click to browse — PDF, DOCX up to 20MB</p>
      </div>

      {uploading && (
        <div className="glass rounded-2xl p-4 anim-slideUp">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-200 font-medium truncate">{uploading.name}</span>
            <span className="text-slate-500">{Math.floor(uploading.progress)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-300" style={{ width: `${uploading.progress}%` }} />
          </div>
        </div>
      )}

      <div>
        <h3 className="font-display font-semibold text-white mb-3">Your files ({notes.length})</h3>
        {notes.length === 0 ? (
          <EmptyState icon={FileText} title="No notes uploaded yet" subtitle="Drag a file above, or click the drop zone to browse." />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {notes.map((n) => (
              <div key={n.id} className="glass rounded-2xl p-4 card-hover flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-300 shrink-0">
                  <FileType2 size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{n.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.ext} • {n.size} • {n.date}</p>
                </div>
                <button onClick={() => remove(n.id)} className="text-slate-500 hover:text-rose-400 transition shrink-0">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   AI SUMMARY MODULE
============================================================ */
function SummaryPage({ notes }) {
  const [selected, setSelected] = useState(notes[0]?.id || null);
  const [generating, setGenerating] = useState(false);
  const [summary, setSummary] = useState(null);
  const toast = useToast();

  const generate = () => {
    if (!selected) {
      toast("Select a note first", "error");
      return;
    }
    setGenerating(true);
    setSummary(null);
    setTimeout(() => {
      setSummary({
        overview:
          "This chapter introduces the core principles of cellular respiration, covering glycolysis, the Krebs cycle, and the electron transport chain. It explains how cells convert glucose into usable energy (ATP) and highlights the role of mitochondria as the primary site of aerobic respiration.",
        keyPoints: [
          "Glycolysis occurs in the cytoplasm and splits glucose into two pyruvate molecules.",
          "The Krebs cycle takes place in the mitochondrial matrix and produces NADH and FADH2.",
          "The electron transport chain generates the majority of ATP via oxidative phosphorylation.",
          "Anaerobic respiration produces far less ATP than aerobic respiration.",
        ],
        definitions: [
          { term: "ATP", def: "Adenosine triphosphate — the primary energy currency of the cell." },
          { term: "Mitochondria", def: "Membrane-bound organelles known as the powerhouse of the cell." },
          { term: "Glycolysis", def: "The metabolic pathway that breaks down glucose into pyruvate." },
        ],
      });
      setGenerating(false);
      toast("Summary generated", "success");
    }, 1600);
  };

  const copy = () => {
    if (!summary) return;
    const text = `${summary.overview}\n\nKey Points:\n${summary.keyPoints.map((p) => "- " + p).join("\n")}\n\nDefinitions:\n${summary.definitions.map((d) => `${d.term}: ${d.def}`).join("\n")}`;
    navigator.clipboard?.writeText(text);
    toast("Summary copied to clipboard", "success");
  };

  const download = () => {
    if (!summary) return;
    const text = `AI Summary\n\n${summary.overview}\n\nKey Points:\n${summary.keyPoints.map((p) => "- " + p).join("\n")}\n\nDefinitions:\n${summary.definitions.map((d) => `${d.term}: ${d.def}`).join("\n")}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "summary.txt";
    a.click();
    URL.revokeObjectURL(url);
    toast("Summary downloaded", "success");
  };

  return (
    <div className="p-5 md:p-8 space-y-6 anim-fadeIn">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">AI Summary</h2>
        <p className="text-slate-400 text-sm mt-1">Pick a note and generate a concise, structured summary.</p>
      </div>

      <div className="glass rounded-3xl p-5 flex flex-col sm:flex-row gap-3 sm:items-center">
        <select
          value={selected || ""}
          onChange={(e) => setSelected(e.target.value)}
          className="flex-1 bg-slate-900/60 border border-slate-700/70 rounded-xl py-2.5 px-4 text-sm text-white outline-none focus:border-indigo-400/60"
        >
          {notes.length === 0 && <option value="">No notes uploaded</option>}
          {notes.map((n) => (
            <option key={n.id} value={n.id}>{n.name}</option>
          ))}
        </select>
        <RippleButton
          onClick={generate}
          disabled={generating}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:brightness-110 transition flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {generating ? <RotateCcw size={15} className="anim-spinSlow" /> : <Sparkles size={15} />}
          {generating ? "Generating..." : "Generate Summary"}
        </RippleButton>
      </div>

      {generating && (
        <div className="space-y-3">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      )}

      {!generating && summary && (
        <div className="space-y-5 anim-slideUp">
          <div className="glass rounded-3xl p-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-semibold text-white flex items-center gap-2"><BookOpen size={17} className="text-indigo-300" /> Overview</h3>
              <div className="flex gap-2">
                <button onClick={copy} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition"><Copy size={14} /></button>
                <button onClick={download} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition"><Download size={14} /></button>
              </div>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{summary.overview}</p>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-display font-semibold text-white flex items-center gap-2 mb-4"><ListChecks size={17} className="text-emerald-300" /> Key Points</h3>
            <ul className="space-y-2.5">
              {summary.keyPoints.map((p, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-300">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0 mt-0.5" /> {p}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-3xl p-6">
            <h3 className="font-display font-semibold text-white flex items-center gap-2 mb-4"><Brain size={17} className="text-violet-300" /> Important Definitions</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {summary.definitions.map((d, i) => (
                <div key={i} className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4">
                  <p className="text-sm font-semibold text-indigo-300">{d.term}</p>
                  <p className="text-xs text-slate-400 mt-1">{d.def}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!generating && !summary && <EmptyState icon={Sparkles} title="No summary yet" subtitle="Choose a note above and generate your first AI summary." />}
    </div>
  );
}

/* ============================================================
   QUIZ GENERATOR MODULE
============================================================ */
const QUIZ_BANK = [
  { id: 1, type: "mcq", q: "What is the primary site of the Krebs cycle?", options: ["Cytoplasm", "Mitochondrial matrix", "Nucleus", "Golgi apparatus"], answer: "Mitochondrial matrix" },
  { id: 2, type: "true_false", q: "Glycolysis requires oxygen to occur.", options: ["True", "False"], answer: "False" },
  { id: 3, type: "mcq", q: "Which molecule is the main energy currency of the cell?", options: ["DNA", "ATP", "RNA", "Glucose"], answer: "ATP" },
  { id: 4, type: "short", q: "Name the process that converts glucose into pyruvate.", answer: "glycolysis" },
  { id: 5, type: "mcq", q: "Which organelle is known as the powerhouse of the cell?", options: ["Ribosome", "Mitochondria", "Lysosome", "Vacuole"], answer: "Mitochondria" },
  { id: 6, type: "true_false", q: "The electron transport chain produces the majority of ATP in aerobic respiration.", options: ["True", "False"], answer: "True" },
];

function QuizPage({ onFinishQuiz }) {
  const [stage, setStage] = useState("setup"); // setup, active, result
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(30);
  const toast = useToast();
  const total = QUIZ_BANK.length;

  useEffect(() => {
    if (stage !== "active") return;
    if (timeLeft <= 0) {
      next();
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, stage]);

  const start = () => {
    setStage("active");
    setIdx(0);
    setAnswers({});
    setTimeLeft(30);
  };

  const select = (val) => setAnswers((a) => ({ ...a, [QUIZ_BANK[idx].id]: val }));

  const next = () => {
    if (idx + 1 >= total) {
      finish();
    } else {
      setIdx((i) => i + 1);
      setTimeLeft(30);
    }
  };

  const finish = () => {
    setStage("result");
    const score = QUIZ_BANK.filter((q) => {
      const a = answers[q.id];
      if (!a) return false;
      if (q.type === "short") return a.trim().toLowerCase().includes(q.answer);
      return a === q.answer;
    }).length;
    onFinishQuiz(score, total);
    toast(`Quiz complete — scored ${score}/${total}`, "success");
  };

  if (stage === "setup") {
    return (
      <div className="p-5 md:p-8 anim-fadeIn">
        <h2 className="font-display text-2xl font-bold text-white">Quiz Generator</h2>
        <p className="text-slate-400 text-sm mt-1 mb-6">AI-generated MCQs, true/false, and short questions from your notes.</p>
        <div className="glass rounded-3xl p-8 max-w-xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center">
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white">Cell Biology — Chapter 4</h3>
              <p className="text-xs text-slate-500">{total} questions • ~{total * 0.5} min • Mixed format</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-6 text-center">
            {["MCQ", "True/False", "Short Answer"].map((t) => (
              <div key={t} className="rounded-xl bg-slate-800/50 border border-slate-700/50 py-3">
                <span className="text-xs text-slate-400">{t}</span>
              </div>
            ))}
          </div>
          <RippleButton
            onClick={start}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:brightness-110 transition flex items-center justify-center gap-2"
          >
            <Play size={16} /> Start Quiz
          </RippleButton>
        </div>
      </div>
    );
  }

  if (stage === "active") {
    const q = QUIZ_BANK[idx];
    const progressPct = ((idx) / total) * 100;
    return (
      <div className="p-5 md:p-8 max-w-2xl mx-auto anim-fadeIn">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-slate-400">Question {idx + 1} of {total}</span>
          <span className={cn("text-sm font-semibold flex items-center gap-1", timeLeft <= 10 ? "text-rose-400" : "text-slate-300")}>
            <Clock size={14} /> {timeLeft}s
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-6">
          <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>

        <div key={q.id} className="glass rounded-3xl p-7 anim-slideUp">
          <span className="text-xs font-semibold uppercase tracking-wide text-indigo-300">{q.type.replace("_", "/")}</span>
          <h3 className="font-display text-lg font-semibold text-white mt-2 mb-6">{q.q}</h3>

          {q.type === "short" ? (
            <input
              value={answers[q.id] || ""}
              onChange={(e) => select(e.target.value)}
              placeholder="Type your answer..."
              className="w-full bg-slate-900/60 border border-slate-700/70 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-indigo-400/60"
            />
          ) : (
            <div className="space-y-3">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => select(opt)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl border text-sm transition flex items-center gap-3",
                    answers[q.id] === opt ? "bg-indigo-500/15 border-indigo-400/60 text-white" : "border-slate-700/60 text-slate-300 hover:border-slate-600 hover:bg-slate-800/40"
                  )}
                >
                  <span className={cn("w-4 h-4 rounded-full border flex items-center justify-center shrink-0", answers[q.id] === opt ? "border-indigo-400 bg-indigo-500" : "border-slate-600")}>
                    {answers[q.id] === opt && <Check size={10} className="text-white" />}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          )}

          <RippleButton
            onClick={next}
            className="mt-7 w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold hover:brightness-110 transition flex items-center justify-center gap-2"
          >
            {idx + 1 === total ? "Finish Quiz" : "Next Question"} <ArrowRight size={15} />
          </RippleButton>
        </div>
      </div>
    );
  }

  // result stage
  const score = QUIZ_BANK.filter((q) => {
    const a = answers[q.id];
    if (!a) return false;
    if (q.type === "short") return a.trim().toLowerCase().includes(q.answer);
    return a === q.answer;
  }).length;
  const pct = Math.round((score / total) * 100);

  return (
    <div className="p-5 md:p-8 max-w-2xl mx-auto anim-fadeIn space-y-6">
      <div className="glass rounded-3xl p-8 text-center">
        <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center mb-4 shadow-xl shadow-indigo-500/30">
          <Award size={32} className="text-white" />
        </div>
        <h2 className="font-display text-3xl font-bold text-white">{pct}%</h2>
        <p className="text-slate-400 mt-1">You scored {score} out of {total}</p>
        <RippleButton onClick={start} className="mt-6 px-6 py-2.5 rounded-xl glass text-slate-200 font-semibold hover:bg-slate-700/40 transition inline-flex items-center gap-2">
          <RotateCcw size={15} /> Retake Quiz
        </RippleButton>
      </div>

      <div className="space-y-3">
        <h3 className="font-display font-semibold text-white">Review</h3>
        {QUIZ_BANK.map((q) => {
          const a = answers[q.id];
          const correct = q.type === "short" ? (a || "").trim().toLowerCase().includes(q.answer) : a === q.answer;
          return (
            <div key={q.id} className="glass rounded-2xl p-4">
              <div className="flex items-start gap-3">
                {correct ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" /> : <X size={18} className="text-rose-400 shrink-0 mt-0.5" />}
                <div className="flex-1">
                  <p className="text-sm text-slate-200">{q.q}</p>
                  <p className="text-xs mt-1 text-slate-500">Your answer: <span className={correct ? "text-emerald-400" : "text-rose-400"}>{a || "—"}</span></p>
                  {!correct && <p className="text-xs text-slate-500">Correct answer: <span className="text-emerald-400">{q.answer}</span></p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   FLASHCARDS MODULE
============================================================ */
const FLASHCARD_BANK = [
  { id: 1, front: "ATP", back: "Adenosine triphosphate — the main energy currency of the cell." },
  { id: 2, front: "Glycolysis", back: "Breakdown of glucose into pyruvate, occurring in the cytoplasm." },
  { id: 3, front: "Mitochondria", back: "The organelle where aerobic respiration takes place." },
  { id: 4, front: "Krebs Cycle", back: "A series of reactions in the mitochondrial matrix producing NADH and FADH2." },
  { id: 5, front: "Electron Transport Chain", back: "Produces the majority of ATP via oxidative phosphorylation." },
];

function FlashcardsPage() {
  const [cards, setCards] = useState(FLASHCARD_BANK);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const go = (dir) => {
    setFlipped(false);
    setIdx((i) => (i + dir + cards.length) % cards.length);
  };

  const shuffle = () => {
    setFlipped(false);
    const arr = [...cards];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    setCards(arr);
    setIdx(0);
  };

  const card = cards[idx];

  return (
    <div className="p-5 md:p-8 anim-fadeIn flex flex-col items-center">
      <div className="w-full max-w-xl">
        <h2 className="font-display text-2xl font-bold text-white">Flashcards</h2>
        <p className="text-slate-400 text-sm mt-1 mb-8">Click a card to flip it. {idx + 1} of {cards.length}</p>

        <div className="flip-card w-full h-72 cursor-pointer" onClick={() => setFlipped(!flipped)}>
          <div className={cn("flip-inner", flipped && "flipped")}>
            <div className="flip-face glass-strong rounded-3xl flex flex-col items-center justify-center p-8 text-center shadow-2xl">
              <span className="text-xs uppercase tracking-wide text-indigo-300 font-semibold mb-4">Term</span>
              <p className="font-display text-2xl font-bold text-white">{card.front}</p>
              <span className="text-xs text-slate-500 mt-6">Tap to flip</span>
            </div>
            <div className="flip-face flip-back rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-500 flex flex-col items-center justify-center p-8 text-center shadow-2xl">
              <span className="text-xs uppercase tracking-wide text-indigo-100 font-semibold mb-4">Definition</span>
              <p className="text-white text-base leading-relaxed">{card.back}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-7">
          <button onClick={() => go(-1)} className="w-11 h-11 rounded-xl glass flex items-center justify-center text-slate-300 hover:text-white transition">
            <ChevronLeft size={18} />
          </button>
          <RippleButton onClick={shuffle} className="px-5 py-2.5 rounded-xl glass text-slate-200 text-sm font-semibold hover:bg-slate-700/40 transition flex items-center gap-2">
            <Shuffle size={15} /> Shuffle
          </RippleButton>
          <button onClick={() => go(1)} className="w-11 h-11 rounded-xl glass flex items-center justify-center text-slate-300 hover:text-white transition">
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex gap-1.5 justify-center mt-6">
          {cards.map((c, i) => (
            <span key={c.id} className={cn("h-1.5 rounded-full transition-all", i === idx ? "w-6 bg-indigo-400" : "w-1.5 bg-slate-700")} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   STUDY PLANNER MODULE
============================================================ */
function StudyPlannerPage() {
  const today = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [tasks, setTasks] = useState({
    [today.getDate()]: [{ id: 1, text: "Review Chapter 4 notes", done: false }],
  });
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [newTask, setNewTask] = useState("");
  const toast = useToast();

  const viewDate = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const monthName = viewDate.toLocaleString("default", { month: "long" });

  const addTask = () => {
    if (!newTask.trim()) return;
    setTasks((t) => ({
      ...t,
      [selectedDay]: [...(t[selectedDay] || []), { id: Date.now(), text: newTask, done: false }],
    }));
    setNewTask("");
    toast("Task added", "success");
  };

  const toggleTask = (day, id) => {
    setTasks((t) => ({
      ...t,
      [day]: t[day].map((task) => (task.id === id ? { ...task, done: !task.done } : task)),
    }));
  };

  const allTasks = Object.values(tasks).flat();
  const doneCount = allTasks.filter((t) => t.done).length;
  const weeklyPct = allTasks.length ? Math.round((doneCount / allTasks.length) * 100) : 0;

  return (
    <div className="p-5 md:p-8 anim-fadeIn space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Study Planner</h2>
        <p className="text-slate-400 text-sm mt-1">Plan tasks, set deadlines, and track your weekly goals.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-white">{monthName} {year}</h3>
            <div className="flex gap-2">
              <button onClick={() => setMonthOffset((m) => m - 1)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-300 hover:text-white"><ChevronLeft size={15} /></button>
              <button onClick={() => setMonthOffset((m) => m + 1)} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-300 hover:text-white"><ChevronRight size={15} /></button>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-1.5 text-center text-xs text-slate-500 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => <div key={d}>{d}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: firstDay }).map((_, i) => <div key={"e" + i} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const hasTasks = tasks[day]?.length > 0;
              const isToday = monthOffset === 0 && day === today.getDate();
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={cn(
                    "aspect-square rounded-xl text-sm flex flex-col items-center justify-center gap-0.5 transition relative",
                    selectedDay === day ? "bg-gradient-to-br from-indigo-500 to-violet-500 text-white font-semibold" : "text-slate-300 hover:bg-slate-800/60",
                    isToday && selectedDay !== day && "ring-1 ring-indigo-400/60"
                  )}
                >
                  {day}
                  {hasTasks && <span className={cn("w-1 h-1 rounded-full", selectedDay === day ? "bg-white" : "bg-indigo-400")} />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 flex flex-col">
          <h3 className="font-display font-semibold text-white mb-1">Weekly goal</h3>
          <p className="text-xs text-slate-500 mb-4">{doneCount} of {allTasks.length} tasks completed</p>
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500" style={{ width: `${weeklyPct}%` }} />
          </div>
          <span className="text-sm text-slate-300 font-semibold">{weeklyPct}%</span>

          <div className="mt-6 pt-6 border-t border-slate-800/70">
            <h4 className="text-sm font-semibold text-white mb-3">Tasks — Day {selectedDay}</h4>
            <div className="space-y-2 mb-4 max-h-40 overflow-y-auto pr-1">
              {(tasks[selectedDay] || []).length === 0 && <p className="text-xs text-slate-500">No tasks for this day.</p>}
              {(tasks[selectedDay] || []).map((t) => (
                <button key={t.id} onClick={() => toggleTask(selectedDay, t.id)} className="w-full flex items-center gap-2 text-left group">
                  {t.done ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" /> : <Circle size={16} className="text-slate-500 shrink-0 group-hover:text-slate-300" />}
                  <span className={cn("text-sm", t.done ? "text-slate-500 line-through" : "text-slate-200")}>{t.text}</span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a task..."
                className="flex-1 bg-slate-900/60 border border-slate-700/70 rounded-xl py-2 px-3 text-sm text-white outline-none focus:border-indigo-400/60"
              />
              <button onClick={addTask} className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white shrink-0">
                <Plus size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ANALYTICS DASHBOARD
============================================================ */
function AnalyticsPage({ data }) {
  const COLORS = ["#6366f1", "#8b5cf6", "#334155"];
  const successRate = 84;
  const pieData = [
    { name: "Correct", value: successRate },
    { name: "Incorrect", value: 100 - successRate },
  ];

  return (
    <div className="p-5 md:p-8 anim-fadeIn space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-white">Analytics</h2>
        <p className="text-slate-400 text-sm mt-1">Track your study hours, quiz performance, and consistency.</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <StatCard icon={FileText} label="Total Notes" value={data.notes.length} accent="indigo" />
        <StatCard icon={Brain} label="Total Quizzes" value={data.quizStats.length} accent="violet" delay={80} />
        <StatCard icon={Target} label="Success Rate" value={successRate} suffix="%" accent="emerald" delay={160} />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass rounded-3xl p-6">
          <h3 className="font-display font-semibold text-white mb-4">Study hours (last 7 days)</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.weeklyHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, fontSize: 12 }} />
              <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass rounded-3xl p-6 flex flex-col items-center">
          <h3 className="font-display font-semibold text-white mb-4 self-start">Success rate</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={55} outerRadius={80} paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <span className="text-2xl font-bold text-white font-display -mt-2">{successRate}%</span>
        </div>
      </div>

      <div className="glass rounded-3xl p-6">
        <h3 className="font-display font-semibold text-white mb-4">Quiz scores</h3>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data.quizStats}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 12, fontSize: 12 }} />
            <Bar dataKey="score" fill="url(#barGrad)" radius={[8, 8, 0, 0]} />
            <defs>
              <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#6366f1" />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ============================================================
   PROFILE PAGE
============================================================ */
function ProfilePage({ user, setUser }) {
  const [form, setForm] = useState({
    name: user?.name || "Alex Morgan",
    email: user?.email || "alex@studyai.app",
    school: "Riverdale University",
    major: "Biology, B.Sc.",
    year: "3rd Year",
    bio: "Pre-med student passionate about cellular biology and consistent study habits.",
  });
  const toast = useToast();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = (e) => {
    e.preventDefault();
    setUser((u) => ({ ...u, name: form.name, email: form.email }));
    toast("Profile updated", "success");
  };

  return (
    <div className="p-5 md:p-8 anim-fadeIn max-w-3xl">
      <h2 className="font-display text-2xl font-bold text-white">Profile</h2>
      <p className="text-slate-400 text-sm mt-1 mb-6">Manage your personal and academic information.</p>

      <div className="glass rounded-3xl p-6 mb-6 flex items-center gap-5">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-2xl font-bold text-white font-display">
            {form.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <button className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full glass-strong flex items-center justify-center text-slate-200 hover:text-white transition">
            <Camera size={14} />
          </button>
        </div>
        <div>
          <h3 className="font-display font-semibold text-white text-lg">{form.name}</h3>
          <p className="text-sm text-slate-400">{form.email}</p>
          <span className="inline-flex items-center gap-1 text-xs text-indigo-300 mt-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20">
            <Zap size={11} /> Premium member
          </span>
        </div>
      </div>

      <form onSubmit={save} className="glass rounded-3xl p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <TextField label="Full name" icon={User} value={form.name} onChange={set("name")} />
          <TextField label="Email" icon={Mail} type="email" value={form.email} onChange={set("email")} />
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          <TextField label="School" icon={GraduationCap} value={form.school} onChange={set("school")} />
          <TextField label="Major" icon={BookOpen} value={form.major} onChange={set("major")} />
        </div>
        <TextField label="Year" icon={Calendar} value={form.year} onChange={set("year")} />
        <div>
          <label className="text-sm font-medium text-slate-300 mb-1.5 block">Bio</label>
          <textarea
            value={form.bio}
            onChange={set("bio")}
            rows={3}
            className="w-full bg-slate-900/60 border border-slate-700/70 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-400/60 focus:ring-2 focus:ring-indigo-500/20 transition resize-none"
          />
        </div>
        <RippleButton type="submit" className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-sm font-semibold hover:brightness-110 transition">
          Save changes
        </RippleButton>
      </form>
    </div>
  );
}

/* ============================================================
   DASHBOARD ROOT
============================================================ */
function DashboardApp({ go, user, setUser, onLogout }) {
  const [active, setActive] = useState("overview");
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [notes, setNotes] = useState([
    { id: "n1", name: "Cell Biology - Chapter 4.pdf", ext: "PDF", size: "842 KB", date: "2 days ago" },
    { id: "n2", name: "Organic Chemistry Notes.docx", ext: "DOCX", size: "1.2 MB", date: "5 days ago" },
    { id: "n3", name: "Physics - Kinematics.pdf", ext: "PDF", size: "630 KB", date: "1 week ago" },
  ]);
  const [quizStats, setQuizStats] = useState([
    { name: "Quiz 1", score: 78 }, { name: "Quiz 2", score: 85 }, { name: "Quiz 3", score: 92 }, { name: "Quiz 4", score: 88 },
  ]);
  const [flashcards] = useState(FLASHCARD_BANK.concat(FLASHCARD_BANK).slice(0, 8));
  const weeklyHours = [
    { day: "Mon", hours: 2.5 }, { day: "Tue", hours: 3.1 }, { day: "Wed", hours: 1.8 },
    { day: "Thu", hours: 4.0 }, { day: "Fri", hours: 2.2 }, { day: "Sat", hours: 3.6 }, { day: "Sun", hours: 2.9 },
  ];

  const onFinishQuiz = (score, total) => {
    setQuizStats((prev) => [...prev, { name: `Quiz ${prev.length + 1}`, score: Math.round((score / total) * 100) }]);
  };

  const data = { notes, quizStats, flashcards, weeklyHours };
  const pageTitle = NAV_ITEMS.find((n) => n.key === active)?.label || "Dashboard";

  return (
    <div className="flex min-h-screen bg-slate-900">
      <Sidebar
        active={active} setActive={setActive}
        collapsed={collapsed} setCollapsed={setCollapsed}
        mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}
        go={go} onLogout={onLogout}
      />
      <div className="flex-1 min-w-0">
        <Topbar setMobileOpen={setMobileOpen} user={user} pageTitle={pageTitle} />
        {active === "overview" && <DashboardOverview user={user} data={data} setActive={setActive} />}
        {active === "notes" && <NotesPage notes={notes} setNotes={setNotes} />}
        {active === "summary" && <SummaryPage notes={notes} />}
        {active === "quiz" && <QuizPage onFinishQuiz={onFinishQuiz} />}
        {active === "flashcards" && <FlashcardsPage />}
        {active === "planner" && <StudyPlannerPage />}
        {active === "analytics" && <AnalyticsPage data={data} />}
        {active === "profile" && <ProfilePage user={user} setUser={setUser} />}
      </div>
    </div>
  );
}

/* ============================================================
   ROOT APP
============================================================ */
export default function App() {
  const [route, setRoute] = useState("landing");
  const [user, setUser] = useState(null);

  const go = (r) => {
    setRoute(r);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <ToastProvider>
      <div className="min-h-screen bg-slate-900 font-body text-slate-100">
        <GlobalStyles />
        {route === "landing" && <LandingPage go={go} />}
        {route === "login" && <LoginPage go={go} onLogin={setUser} />}
        {route === "signup" && <SignupPage go={go} onLogin={setUser} />}
        {route === "dashboard" && (
          <DashboardApp go={go} user={user} setUser={setUser} onLogout={() => setUser(null)} />
        )}
      </div>
    </ToastProvider>
  );
}
