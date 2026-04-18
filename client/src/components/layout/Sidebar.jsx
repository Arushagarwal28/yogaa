const USER_NAV = [
  { id: "dashboard",    icon: "⊞", label: "Dashboard"    },
  { id: "yoga",         icon: "🧘", label: "AI Yoga"      },
  { id: "meditation",   icon: "🌸", label: "Meditation"   },
  { id: "store",        icon: "🛍️", label: "Store"        },
  { id: "analytics",    icon: "📊", label: "Analytics"    },
  { id: "subscription", icon: "⭐", label: "Subscription" },
  { id: "profile",      icon: "👤", label: "Profile"      },
  { id: "help",         icon: "❓", label: "Help"         },
  { id: "contact",      icon: "📬", label: "Contact"      },
];

const SHOP_NAV = [
  { id: "shop-dashboard", icon: "⊞", label: "Dashboard" },
  { id: "shop-products",  icon: "📦", label: "Products"  },
  { id: "shop-orders",    icon: "📋", label: "Orders"    },
  { id: "analytics",      icon: "📊", label: "Analytics" },
  { id: "profile",        icon: "👤", label: "Profile"   },
];

export default function Sidebar({ active, setActive, role, isOpen, toggle }) {
  const nav = role === "shop" ? SHOP_NAV : USER_NAV;

  return (
    <aside className="layout-sidebar">

      {/* Toggle tab — sticks out from the right edge of the sidebar panel.
          Always visible on all screen sizes. Clicking slides sidebar in or out. */}
      <button
        onClick={toggle}
        title={isOpen ? "Collapse sidebar" : "Expand sidebar"}
        style={{
          position:     "absolute",
          right:        "-36px",
          top:          "20px",
          width:        "36px",
          height:       "36px",
          background:   "white",
          border:       "1px solid #e5e7eb",
          borderLeft:   "none",
          borderRadius: "0 8px 8px 0",
          display:      "flex",
          alignItems:   "center",
          justifyContent: "center",
          cursor:       "pointer",
          boxShadow:    "2px 0 6px rgba(0,0,0,0.07)",
          zIndex:       50,          /* above everything so always clickable */
          fontSize:     "14px",
          color:        "#6b7280",
          transition:   "background 0.15s",
          flexShrink:   0,
        }}
        onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
        onMouseLeave={e => e.currentTarget.style.background = "white"}
      >
        {isOpen ? "◀" : "▶"}
      </button>

      {/* Logo */}
      <div style={{ padding: "24px", borderBottom: "1px solid #f1f5f9", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40, height: 40,
            background: "linear-gradient(135deg,#10b981,#14b8a6)",
            borderRadius: 12,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "white", fontWeight: "bold", fontSize: 18,
          }}>Y</div>
          <div>
            <div style={{ fontWeight: "bold", color: "#1f2937", fontSize: 18 }}>YogaAI</div>
            <div style={{ fontSize: 12, color: "#10b981", fontWeight: 500 }}>
              {role === "shop" ? "Shop Owner" : "Wellness Platform"}
            </div>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {nav.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "10px 16px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 500,
              marginBottom: 4,
              transition: "all 0.15s",
              background: active === item.id
                ? "linear-gradient(135deg,#10b981,#14b8a6)"
                : "transparent",
              color: active === item.id ? "white" : "#4b5563",
              boxShadow: active === item.id ? "0 4px 12px rgba(16,185,129,0.25)" : "none",
            }}
            onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = "#f9fafb"; }}
            onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 16, width: 20, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
            <span>{item.label}</span>
            {active === item.id && (
              <span style={{ marginLeft: "auto", width: 6, height: 6, background: "white", borderRadius: "50%" }} />
            )}
          </button>
        ))}
      </nav>

      {/* Plan badge */}
      <div style={{ padding: 16, flexShrink: 0 }}>
        <div style={{
          background: "linear-gradient(135deg,#10b981,#14b8a6)",
          borderRadius: 16,
          padding: 16,
          color: "white",
        }}>
          <div style={{ fontSize: 11, fontWeight: 600, opacity: 0.8, marginBottom: 4 }}>Current Plan</div>
          <div style={{ fontWeight: "bold" }}>Standard Plan</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>Renews Mar 6, 2027</div>
        </div>
      </div>
    </aside>
  );
}