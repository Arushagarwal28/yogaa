import { useState } from "react";
import GlassCard from "../components/ui/GlassCard.jsx";
import Btn       from "../components/ui/Btn.jsx";

const INFO_TILES = [
  { icon: "📧", label: "Email",    value: "support@yogaai.in"       },
  { icon: "📞", label: "Phone",    value: "+91 98765 43210"          },
  { icon: "🕐", label: "Hours",    value: "Mon–Sat, 9 AM – 6 PM IST" },
  { icon: "📍", label: "Location", value: "Bengaluru, India"         },
];

export default function ContactPage() {
  const [form,   setForm]   = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState(null); // null | "sending" | "sent"

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = () => {
    if (!form.name || !form.email || !form.message) return;
    setStatus("sending");
    setTimeout(() => setStatus("sent"), 1200);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Contact Us</h2>
        <p className="text-gray-500 text-sm mt-1">We'd love to hear from you. Send us a message!</p>
      </div>

      {/* info tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {INFO_TILES.map((t) => (
          <GlassCard key={t.label} className="p-4 text-center">
            <div className="text-2xl mb-2">{t.icon}</div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{t.label}</div>
            <div className="text-sm text-gray-700 font-medium mt-1">{t.value}</div>
          </GlassCard>
        ))}
      </div>

      {/* form */}
      <GlassCard className="p-6">
        {status === "sent" ? (
          <div className="text-center py-10">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-lg font-bold text-gray-800">Message Sent!</h3>
            <p className="text-gray-500 text-sm mt-2">We'll get back to you within 24 hours.</p>
            <Btn
              onClick={() => { setStatus(null); setForm({ name: "", email: "", subject: "", message: "" }); }}
              className="mt-6"
            >
              Send Another
            </Btn>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-800">Send a Message</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Name *</label>
                <input
                  name="name" value={form.name} onChange={handleChange}
                  placeholder="Your name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Email *</label>
                <input
                  name="email" value={form.email} onChange={handleChange}
                  type="email" placeholder="you@example.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Subject</label>
              <input
                name="subject" value={form.subject} onChange={handleChange}
                placeholder="What's this about?"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Message *</label>
              <textarea
                name="message" value={form.message} onChange={handleChange}
                rows={5} placeholder="Describe your question or feedback…"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-300 resize-none"
              />
            </div>
            <Btn
              onClick={handleSubmit}
              disabled={status === "sending"}
              className="w-full justify-center"
            >
              {status === "sending" ? "Sending…" : "Send Message 📬"}
            </Btn>
          </div>
        )}
      </GlassCard>
    </div>
  );
}