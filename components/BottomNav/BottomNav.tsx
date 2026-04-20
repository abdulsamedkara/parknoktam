"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/ana-sayfa", icon: "home", label: "Ana Sayfa" },
  { href: "/ara", icon: "map", label: "Harita" },
  { href: "/rezervasyonlarim", icon: "confirmation_number", label: "Biletlerim" },
  { href: "/profil", icon: "person", label: "Profilim" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 w-full flex justify-around items-end px-2 pb-6 pt-2"
        style={{
          zIndex: 1000,
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(24px) saturate(180%)",
          WebkitBackdropFilter: "blur(24px) saturate(180%)",
          borderTop: "1px solid rgba(255,255,255,0.6)",
          borderRadius: "36px 36px 0 0",
          boxShadow: "0 -12px 40px -8px rgba(10,102,194,0.10), 0 -1px 0 rgba(255,255,255,0.8)",
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-90"
            >
              {/* Pill indicator + icon */}
              <div
                className="flex items-center justify-center transition-all duration-200"
                style={{
                  width: isActive ? 52 : 44,
                  height: 32,
                  borderRadius: 16,
                  background: isActive ? "rgba(10,102,194,0.12)" : "transparent",
                }}
              >
                <span
                  className="material-symbols-outlined transition-all duration-200"
                  style={{
                    fontSize: isActive ? "26px" : "24px",
                    color: isActive ? "#0A66C2" : "#94a3b8",
                    fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
                  }}
                >
                  {item.icon}
                </span>
              </div>

              <span
                className="text-[10px] font-bold tracking-wide transition-colors duration-200"
                style={{ color: isActive ? "#0A66C2" : "#94a3b8" }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

