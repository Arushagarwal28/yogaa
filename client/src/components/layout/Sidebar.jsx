const USER_NAV = [
  { id:"dashboard",    icon:"⊞", label:"Dashboard"    },
  { id:"yoga",         icon:"🧘", label:"AI Yoga"      },
  { id:"meditation",   icon:"🌸", label:"Meditation"   },
  { id:"store",        icon:"🛍️", label:"Store"        },
  { id:"analytics",    icon:"📊", label:"Analytics"    },
  { id:"subscription", icon:"⭐", label:"Subscription" },
  { id:"profile",      icon:"👤", label:"Profile"      },
  { id:"help",         icon:"❓", label:"Help"         },
  { id:"contact",      icon:"📬", label:"Contact"      },
];
const SHOP_NAV = [
  { id:"shop-dashboard", icon:"⊞", label:"Dashboard" },
  { id:"shop-products",  icon:"📦", label:"Products"  },
  { id:"shop-orders",    icon:"📋", label:"Orders"    },
  { id:"analytics",      icon:"📊", label:"Analytics" },
  { id:"profile",        icon:"👤", label:"Profile"   },
];

export default function Sidebar({ active, setActive, role, sidebarOpen }) {
  const nav = role === "shop" ? SHOP_NAV : USER_NAV;
  return (
    <aside className={`fixed left-0 top-0 h-full bg-white border-r border-gray-100 z-40 transition-all duration-300 ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} lg:w-64`}>
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center text-white text-lg font-bold">Y</div>
          <div>
            <div className="font-bold text-gray-800 text-lg">YogaAI</div>
            <div className="text-xs text-emerald-600 font-medium">{role === "shop" ? "Shop Owner" : "Wellness Platform"}</div>
          </div>
        </div>
      </div>
      <nav className="p-4 space-y-1">
        {nav.map((item) => (
          <button key={item.id} onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${active === item.id ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200" : "text-gray-600 hover:bg-gray-50"}`}>
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
            {active === item.id && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full" />}
          </button>
        ))}
      </nav>
      <div className="absolute bottom-6 left-4 right-4">
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-4 text-white">
          <div className="text-xs font-semibold opacity-80 mb-1">Current Plan</div>
          <div className="font-bold">Standard Plan</div>
          <div className="text-xs opacity-70 mt-1">Renews Mar 6, 2027</div>
        </div>
      </div>
    </aside>
  );
}