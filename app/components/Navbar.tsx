"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (pathname === "/login" || pathname === "/setup") return null;

  const esAdmin = session?.user?.role === "ADMIN";

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href);

  const navItems = [
    { href: "/",               label: "Dashboard",  exact: true  },
    { href: "/inventario",     label: "Inventario", exact: false },
    ...(esAdmin ? [
      { href: "/admin/auditoria", label: "Auditoría", exact: true },
      { href: "/admin/usuarios",  label: "Usuarios",  exact: true },
    ] : []),
  ];

  return (
    <nav className="bg-[#060E1A] border-b border-[#1D344E] relative">
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: "linear-gradient(90deg, #E8971C 0%, #E8971C40 35%, transparent 70%)" }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">

          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-boiero.png"
                alt="Boiero"
                className="h-7 w-auto brightness-0 invert opacity-80 group-hover:opacity-100 transition-opacity"
              />
              <span
                className="text-[9px] tracking-[0.2em] uppercase hidden sm:block"
                style={{ fontFamily: "var(--font-mono)", color: "#2A4A68" }}
              >
                /inv-ti
              </span>
            </Link>

            <div className="flex items-center gap-0.5">
              {navItems.map(({ href, label, exact }) => {
                const active = isActive(href, exact);
                return (
                  <Link
                    key={href}
                    href={href}
                    className="px-3 py-1 rounded-sm transition-all"
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.6875rem",
                      fontWeight: 600,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color:           active ? "#E8971C" : "#3D6080",
                      background:      active ? "rgba(232,151,28,0.08)" : "transparent",
                      border:          active ? "1px solid rgba(232,151,28,0.20)" : "1px solid transparent",
                    }}
                  >
                    {active && <span style={{ color: "#E8971C60", marginRight: "0.2em" }}>›</span>}
                    {label}
                  </Link>
                );
              })}
            </div>
          </div>

          {status === "authenticated" && session && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-[#A0C2D8] leading-tight tracking-wide">
                  {session.user.name}
                </p>
                <p
                  className="leading-tight"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "0.625rem", color: "#2A4A68", letterSpacing: "0.12em", textTransform: "uppercase" }}
                >
                  {session.user.role === "ADMIN" ? "// admin" : "// lector"}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="transition-all rounded-sm px-3 py-1.5"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.625rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "#3D6080",
                  border: "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#E8971C";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(232,151,28,0.25)";
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(232,151,28,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#3D6080";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent";
                  (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                }}
              >
                [ salir ]
              </button>
            </div>
          )}

        </div>
      </div>
    </nav>
  );
}
