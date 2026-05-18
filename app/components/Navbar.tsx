"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (pathname === "/login" || pathname === "/setup") return null;

  const esAdmin = session?.user?.role === "ADMIN";

  const linkBase = "px-4 py-2 rounded-lg text-sm font-medium transition-colors";
  const linkActivo = `${linkBase} bg-[#1E3A5F] text-blue-300`;
  const linkNormal = `${linkBase} text-slate-400 hover:text-slate-100 hover:bg-[#1E3A5F]/40`;

  return (
    <nav className="bg-[#0F1E32] border-b border-[#243D5E]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-boiero.png" alt="Boiero" className="h-8 w-auto brightness-0 invert" />
            </Link>

            <div className="flex items-center gap-1">
              <Link href="/" className={pathname === "/" ? linkActivo : linkNormal}>
                Dashboard
              </Link>
              <Link href="/inventario" className={pathname.startsWith("/inventario") ? linkActivo : linkNormal}>
                Inventario
              </Link>
              {esAdmin && (
                <>
                  <Link href="/admin/auditoria" className={pathname === "/admin/auditoria" ? linkActivo : linkNormal}>
                    Auditoría
                  </Link>
                  <Link href="/admin/usuarios" className={pathname === "/admin/usuarios" ? linkActivo : linkNormal}>
                    Usuarios
                  </Link>
                </>
              )}
            </div>
          </div>

          {status === "authenticated" && session && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-slate-200 leading-tight">{session.user.name}</p>
                <p className="text-xs text-slate-500 leading-tight">
                  {session.user.role === "ADMIN" ? "Administrador" : "Lector"}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-slate-400 hover:text-slate-200 px-3 py-1.5 rounded-lg hover:bg-[#1E3A5F]/40 transition-colors"
              >
                Salir
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
