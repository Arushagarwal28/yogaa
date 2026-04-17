import { useState } from "react";
import SectionFade from "../components/ui/SectionFade.jsx";

function Particles() {
  const pts = Array.from({ length: 18 }, (_, i) => ({
    id: i, size: 4 + Math.random() * 10, x: Math.random() * 100,
    delay: Math.random() * 8, dur: 12 + Math.random() * 16, op: 0.06 + Math.random() * 0.12,
  }));
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {pts.map((p) => (
        <div key={p.id} className="absolute rounded-full bg-emerald-400"
          style={{ width: p.size, height: p.size, left: `${p.x}%`, bottom: "-20px",
            opacity: p.op, animation: `floatUp ${p.dur}s ${p.delay}s infinite linear` }} />
      ))}
    </div>
  );
}

function LotusMandala({ size = 320 }) {
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 320 320" width={size} height={size} className="absolute inset-0">
        <g style={{ transformOrigin: "160px 160px", animation: "spinSlow 40s linear infinite" }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <ellipse key={i} cx="160" cy="90" rx="14" ry="38" fill="none"
              stroke="#10b981" strokeWidth="1.2" opacity="0.35"
              style={{ transformOrigin: "160px 160px", transform: `rotate(${i * 30}deg)` }} />
          ))}
        </g>
        <g style={{ transformOrigin: "160px 160px", animation: "spinSlowRev 28s linear infinite" }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <ellipse key={i} cx="160" cy="108" rx="10" ry="28" fill="#ecfdf5"
              stroke="#34d399" strokeWidth="1" opacity="0.55"
              style={{ transformOrigin: "160px 160px", transform: `rotate(${i * 45}deg)` }} />
          ))}
        </g>
        <g style={{ transformOrigin: "160px 160px", animation: "spinSlow 18s linear infinite" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <ellipse key={i} cx="160" cy="128" rx="7" ry="20" fill="#d1fae5"
              stroke="#10b981" strokeWidth="1.2" opacity="0.8"
              style={{ transformOrigin: "160px 160px", transform: `rotate(${i * 60}deg)` }} />
          ))}
        </g>
        <circle cx="160" cy="160" r="22" fill="#ecfdf5" stroke="#10b981" strokeWidth="1.5" opacity="0.9" />
        <circle cx="160" cy="160" r="13" fill="#d1fae5" stroke="#34d399" strokeWidth="1" />
        <circle cx="160" cy="160" r="5"  fill="#10b981" />
        <circle cx="160" cy="160" r="60" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.2"
          style={{ animation: "pulseFade 3s ease-in-out infinite" }} />
        <circle cx="160" cy="160" r="75" fill="none" stroke="#34d399" strokeWidth="0.4" opacity="0.15"
          style={{ animation: "pulseFade 3s 1s ease-in-out infinite" }} />
      </svg>
    </div>
  );
}

function PoseCard({ pose, delay = 0 }) {
  const figures = {
    tree: (
      <svg viewBox="0 0 80 120" width="80" height="120">
        <circle cx="40" cy="15" r="10" fill="#34d399" />
        <line x1="40" y1="25" x2="40" y2="70" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="45" x2="20" y2="35" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="40" y1="45" x2="60" y2="35" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="40" y1="70" x2="40" y2="110" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <line x1="40" y1="90" x2="55" y2="80"  stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
    warrior: (
      <svg viewBox="0 0 100 120" width="100" height="120">
        <circle cx="50" cy="14" r="10" fill="#34d399" />
        <line x1="50" y1="24" x2="50" y2="65" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="40" x2="18" y2="28" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="40" x2="82" y2="28" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="50" y1="65" x2="22" y2="100" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <line x1="50" y1="65" x2="78" y2="90"  stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
      </svg>
    ),
    cobra: (
      <svg viewBox="0 0 120 80" width="120" height="80">
        <ellipse cx="60" cy="60" rx="50" ry="10" fill="#10b981" opacity="0.3" />
        <path d="M20 60 Q30 20 60 18 Q90 16 100 30" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <circle cx="100" cy="28" r="10" fill="#34d399" />
        <line x1="60" y1="25" x2="35" y2="55" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="60" y1="25" x2="75" y2="55" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    ),
  };
  return (
    <div className="flex flex-col items-center gap-3 group"
      style={{ animation: `floatPose 5s ${delay}s ease-in-out infinite` }}>
      <div className="w-28 h-28 rounded-2xl bg-white/80 backdrop-blur border border-emerald-100 shadow-lg flex items-center justify-center group-hover:scale-105 transition-all duration-300">
        {figures[pose]}
      </div>
      <span className="text-xs font-semibold text-emerald-700 capitalize">{pose} Pose</span>
    </div>
  );
}

function Navbar({ onLogin }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useState(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  });

  const scrollTo = (id) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMenuOpen(false); };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"}`}>
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollTo("hero")}>
          <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-md">
            <span className="text-white font-black text-lg">Y</span>
          </div>
          <span className="font-black text-gray-800 text-lg">Yoga<span className="text-emerald-500">AI</span></span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {[{ label: "How It Works", id: "how-to-start" }, { label: "About", id: "about-us" }, { label: "Contact", id: "contact" }].map((item) => (
            <button key={item.id} onClick={() => scrollTo(item.id)}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 transition-all">
              {item.label}
            </button>
          ))}
          <div className="w-px h-5 bg-gray-200 mx-2" />
          <button onClick={onLogin} className="shimmer-btn px-5 py-2 rounded-xl text-sm font-bold text-white shadow-md hover:scale-105 transition-all">
            Login / Sign Up
          </button>
        </div>
        <button className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-600 text-xl" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? "✕" : "☰"}
        </button>
      </div>
      {menuOpen && (
        <div className="md:hidden bg-white/98 backdrop-blur border-t border-gray-100 px-6 py-4 space-y-2 shadow-lg">
          {[{ label: "How It Works", id: "how-to-start" }, { label: "About", id: "about-us" }, { label: "Contact", id: "contact" }].map((item) => (
            <button key={item.id} onClick={() => scrollTo(item.id)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold text-gray-700 hover:bg-emerald-50 transition-all">
              {item.label}
            </button>
          ))}
          <button onClick={onLogin} className="w-full px-4 py-3 rounded-xl text-sm font-bold shimmer-btn text-white mt-2">
            Login / Sign Up
          </button>
        </div>
      )}
    </nav>
  );
}

export default function PublicLanding({ onLogin }) {
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <Navbar onLogin={onLogin} />

      {/* HERO */}
      <section id="hero" className="relative min-h-screen flex items-center pt-16 overflow-hidden"
        style={{ background: "linear-gradient(160deg,#f0fdf4 0%,#ecfdf5 35%,#f0fdfa 65%,#f8fafc 100%)" }}>
        <Particles />
        <div className="absolute top-20 right-10 w-96 h-96 rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle,#34d399,transparent 70%)", filter: "blur(40px)" }} />
        <div className="max-w-7xl mx-auto px-6 py-20 w-full">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="hero-badge inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-2 text-xs font-bold text-emerald-700 mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                AI-Powered Yoga · Real-time Posture Correction
              </div>
              <h1 className="hero-title text-5xl lg:text-7xl font-black text-gray-900 leading-[1.05] mb-6"
                style={{ fontFamily: "'Playfair Display',serif" }}>
                Transform Your<span className="block gradient-text">Mind & Body</span>with AI Yoga
              </h1>
              <p className="hero-sub text-lg text-gray-500 leading-relaxed mb-8 max-w-lg">
                Real-time posture correction, guided meditation, personalised sessions — all powered by AI.
              </p>
              <div className="hero-btns flex flex-wrap gap-4 mb-10">
                <button onClick={onLogin} className="shimmer-btn px-8 py-4 rounded-2xl text-white font-bold text-base shadow-xl hover:scale-105 transition-all">
                  Start Free Today →
                </button>
                <button onClick={() => scrollTo("how-to-start")}
                  className="px-8 py-4 rounded-2xl bg-white border border-gray-200 text-gray-700 font-bold text-base hover:border-emerald-300 hover:bg-emerald-50 shadow-md transition-all">
                  ▷ See How It Works
                </button>
              </div>
              <div className="hero-stats flex flex-wrap gap-6">
                {[{ val: "50K+", label: "Active Users" }, { val: "10+", label: "Yoga Poses" }, { val: "98%", label: "AI Accuracy" }, { val: "4.9★", label: "Rating" }].map((s) => (
                  <div key={s.val} className="text-center">
                    <div className="text-2xl font-black text-gray-800">{s.val}</div>
                    <div className="text-xs text-gray-400 font-medium mt-0.5">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="hero-visual relative">
                <div className="absolute inset-0 rounded-full opacity-30"
                  style={{ background: "radial-gradient(circle,#6ee7b7 0%,transparent 70%)", filter: "blur(30px)" }} />
                <LotusMandala size={380} />
                <div className="absolute -left-12 top-12 z-20"><PoseCard pose="tree"    delay={0}   /></div>
                <div className="absolute -right-12 top-20 z-20"><PoseCard pose="warrior" delay={1.5} /></div>
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-20"><PoseCard pose="cobra" delay={0.8} /></div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-xs text-gray-400 font-medium">Scroll to explore</span>
          <div className="w-5 h-8 border-2 border-gray-300 rounded-full flex items-start justify-center pt-1.5">
            <div className="w-1.5 h-2.5 bg-emerald-500 rounded-full" style={{ animation: "fadeInUp 1.5s ease infinite" }} />
          </div>
        </div>
      </section>

      {/* HOW TO START */}
      <section id="how-to-start" className="py-28 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <SectionFade>
            <div className="text-center mb-20">
              <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-full px-4 py-1.5 text-xs font-bold text-emerald-700 mb-5">🚀 Simple 3-Step Journey</div>
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-5" style={{ fontFamily: "'Playfair Display',serif" }}>
                Start Your <span className="gradient-text">AI Yoga</span> Journey
              </h2>
              <p className="text-lg text-gray-500 max-w-xl mx-auto">From zero to flowing in minutes. Our AI does the heavy lifting — you just breathe and move.</p>
            </div>
          </SectionFade>
          <div className="flex flex-col lg:flex-row gap-6">
            {[
              { n: 1, icon: "🔐", title: "Create Your Free Account",   sub: "Sign up in 30 seconds",      color: "#10b981" },
              { n: 2, icon: "🧘", title: "Select Your Asana & Prepare", sub: "Choose from 10+ poses",      color: "#3b82f6" },
              { n: 3, icon: "⚡", title: "Get Real-Time AI Feedback",   sub: "Instant posture correction", color: "#8b5cf6" },
            ].map((step, idx) => (
              <div key={step.n} className="flex-1 flex items-stretch">
                <div className="flex-1 bg-white rounded-3xl px-8 py-10 shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 mx-0 lg:mx-3 text-center">
                  <div className="relative inline-flex mb-6">
                    <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
                      style={{ background: `linear-gradient(135deg,${step.color}18,${step.color}30)`, border: `2px solid ${step.color}30` }}>
                      {step.icon}
                    </div>
                    <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm shadow-md"
                      style={{ background: `linear-gradient(135deg,${step.color},${step.color}aa)` }}>{step.n}</div>
                  </div>
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full block mb-3"
                    style={{ background: `${step.color}12`, color: step.color }}>{step.sub}</span>
                  <h3 className="text-lg font-black text-gray-800">{step.title}</h3>
                </div>
                {idx < 2 && (
                  <div className="hidden lg:flex items-center justify-center flex-shrink-0 -mx-1 z-10">
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-400 text-sm">→</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <SectionFade>
            <div className="relative rounded-3xl p-10 text-center overflow-hidden mt-16"
              style={{ background: "linear-gradient(135deg,#065f46 0%,#047857 40%,#0d9488 100%)" }}>
              <Particles />
              <div className="relative z-10">
                <div className="text-5xl mb-4">🧘‍♀️</div>
                <h3 className="text-3xl font-black text-white mb-3" style={{ fontFamily: "'Playfair Display',serif" }}>Ready to Transform Your Body?</h3>
                <p className="text-emerald-200 text-base mb-7 max-w-md mx-auto">Join 50,000+ practitioners. Start free — no credit card needed.</p>
                <button onClick={onLogin} className="px-10 py-4 rounded-2xl bg-white text-emerald-700 font-black text-base shadow-2xl hover:scale-105 transition-all">
                  Get Started Free →
                </button>
              </div>
            </div>
          </SectionFade>
        </div>
      </section>

      {/* STATS BAND */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 py-14">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {[{ v: "50,000+", l: "Active Practitioners", i: "👥" }, { v: "98%", l: "AI Accuracy", i: "🎯" }, { v: "10+", l: "Yoga Poses", i: "🧘" }, { v: "4.9★", l: "App Rating", i: "⭐" }].map((s) => (
            <div key={s.l} className="text-center text-white">
              <div className="text-3xl mb-2">{s.i}</div>
              <div className="text-3xl font-black">{s.v}</div>
              <div className="text-sm text-emerald-200 mt-1 font-medium">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT US */}
      <section id="about-us" className="py-28 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <SectionFade>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-4 py-1.5 text-xs font-bold text-teal-700 mb-5">🌱 Our Story</div>
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-5" style={{ fontFamily: "'Playfair Display',serif" }}>
                The Team Behind <span className="gradient-text">YogaAI</span>
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
                We're yoga practitioners, AI engineers, and wellness advocates making expert yoga guidance accessible to everyone.
              </p>
            </div>
          </SectionFade>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {[
              { icon: "🎯", title: "Our Mission", color: "#10b981", desc: "Democratise yoga by combining 5,000 years of ancient wisdom with cutting-edge AI — making professional posture correction accessible to every home." },
              { icon: "👁️", title: "Our Vision",  color: "#3b82f6", desc: "A world where everyone has a personal AI yoga guru in their pocket. Where health is a universal right enabled by intelligent technology." },
              { icon: "💎", title: "Our Values",  color: "#8b5cf6", desc: "Authenticity over perfection. Progress over comparison. We believe yoga is a journey, not a destination — and AI is your compassionate guide." },
            ].map((v) => (
              <SectionFade key={v.title}>
                <div className="bg-white rounded-3xl p-7 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all h-full">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-5 shadow-md"
                    style={{ background: `${v.color}15`, border: `1px solid ${v.color}25` }}>{v.icon}</div>
                  <h3 className="font-black text-gray-800 text-lg mb-3">{v.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{v.desc}</p>
                </div>
              </SectionFade>
            ))}
          </div>
          <SectionFade>
            <h3 className="text-2xl font-black text-gray-800 text-center mb-10">What Our Community Says 💬</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { name: "Kavya R.",  city: "Bengaluru", avatar: "👩",    text: "The AI pose correction is mind-blowing. It caught my Warrior II alignment issue immediately — something I'd been doing wrong for 2 years!" },
                { name: "Aditya P.", city: "Mumbai",    avatar: "👨",    text: "I've tried 6 yoga apps. None come close. The real-time feedback is like having a personal guru at home." },
                { name: "Sunita M.", city: "Delhi",     avatar: "👩‍🦳", text: "The meditation section helped me manage my anxiety better than anything else. Absolutely transformative." },
              ].map((t, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col">
                  <div className="flex text-amber-400 text-lg mb-3">★★★★★</div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 italic mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl border border-emerald-100">{t.avatar}</div>
                    <div>
                      <div className="font-bold text-gray-800 text-sm">{t.name}</div>
                      <div className="text-xs text-gray-400">{t.city}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SectionFade>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <SectionFade>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-1.5 text-xs font-bold text-blue-700 mb-5">📬 Get in Touch</div>
            <h2 className="text-4xl font-black text-gray-900 mb-5" style={{ fontFamily: "'Playfair Display',serif" }}>
              We'd Love to <span className="gradient-text">Hear From You</span>
            </h2>
            <p className="text-gray-500 mb-10">Questions, partnerships, or just a hello — we read every message.</p>
            <div className="grid sm:grid-cols-3 gap-6 mb-10">
              {[{ icon: "📧", label: "Email", val: "hello@yogaai.in" }, { icon: "📞", label: "Phone", val: "+91 98765 43210" }, { icon: "📍", label: "Location", val: "Bengaluru, India" }].map((c) => (
                <div key={c.label} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-emerald-200 transition-all">
                  <div className="text-3xl mb-3">{c.icon}</div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">{c.label}</div>
                  <div className="font-semibold text-gray-700 text-sm">{c.val}</div>
                </div>
              ))}
            </div>
            <button onClick={onLogin} className="shimmer-btn px-10 py-4 rounded-2xl text-white font-bold text-base shadow-xl hover:scale-105 transition-all">
              Get Started Free →
            </button>
          </SectionFade>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center">
                  <span className="text-white font-black text-lg">Y</span>
                </div>
                <span className="font-black text-white text-xl">Yoga<span className="text-emerald-400">AI</span></span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed max-w-xs">India's most intelligent yoga training platform. Ancient wisdom meets modern AI.</p>
            </div>
            {[
              { title: "Platform", links: ["AI Yoga Trainer","Meditation","Store","Analytics","Subscription"] },
              { title: "Company",  links: ["About Us","Careers","Blog","Contact"] },
              { title: "Support",  links: ["Help Center","Privacy Policy","Terms of Service","Refund Policy"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-bold text-white text-sm uppercase tracking-wider mb-4">{col.title}</h4>
                <ul className="space-y-2.5">
                  {col.links.map((l) => <li key={l}><button className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">{l}</button></li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-800">
            <p className="text-xs text-gray-500">© 2026 YogaAI Technologies Pvt. Ltd. · Made with 🧘 in India</p>
            <div className="flex items-center gap-3">
              <span className="text-xs px-2.5 py-1 bg-gray-800 text-gray-400 rounded-full border border-gray-700">🔒 Secured</span>
              <span className="text-xs px-2.5 py-1 bg-gray-800 text-gray-400 rounded-full border border-gray-700">🇮🇳 India</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}