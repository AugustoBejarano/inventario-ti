"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  if (pathname === "/login" || pathname === "/setup") return null;

  const esAdmin = session?.user?.role === "ADMIN";

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo-boiero.png" alt="Boiero" className="h-9 w-auto" />
            </Link>

            <div className="flex items-center gap-1">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === "/" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/inventario"
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith("/inventario") ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                Inventario
              </Link>
              {esAdmin && (
                <>
                  <Link
                    href="/admin/auditoria"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/admin/auditoria" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    Auditoría
                  </Link>
                  <Link
                    href="/admin/usuarios"
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === "/admin/usuarios" ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    Usuarios
                  </Link>
                </>
              )}
            </div>
          </div>

          {status === "authenticated" && session && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900 leading-tight">{session.user.name}</p>
                <p className="text-xs text-gray-400 leading-tight">
                  {session.user.role === "ADMIN" ? "Administrador" : "Lector"}
                </p>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
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
