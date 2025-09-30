"use client";

import { useAuth } from "@/app/providers";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

function Sidebar({ isMobileMenuOpen }: { isMobileMenuOpen?: boolean }) {
  // Clase condicional para mostrar/ocultar en móvil
  const mobileClass = isMobileMenuOpen 
    ? "block fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out" 
    : "hidden md:block";
  
  return (
    <aside data-testid="sidebar-nav" className={`p-3 border-r min-w-48 ${mobileClass}`}>
      <nav className="flex flex-col space-y-3 mt-5">
        <a data-testid="nav-dashboard" href="/dashboard" className="p-2 hover:bg-gray-100 rounded">Dashboard</a>
        <a data-testid="nav-analytics" href="/analytics" className="p-2 hover:bg-gray-100 rounded">Analytics</a>
        <a data-testid="nav-alerts" href="/alerts" className="p-2 hover:bg-gray-100 rounded">Alerts</a>
        <a data-testid="nav-clients" href="/clients" className="p-2 hover:bg-gray-100 rounded">Clients</a>
        <a data-testid="nav-benefits" href="/benefits" className="p-2 hover:bg-gray-100 rounded">Benefits</a>
        <a data-testid="nav-serials" href="/serials" className="p-2 hover:bg-gray-100 rounded">Serials</a>
        <a data-testid="nav-history" href="/history" className="p-2 hover:bg-gray-100 rounded">History</a>
        <a data-testid="nav-settings" href="/settings" className="p-2 hover:bg-gray-100 rounded">Settings</a>
      </nav>
    </aside>
  );
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (role !== "admin") {
      // opcional: mensaje de no autorizado
      router.replace("/login");
    }
  }, [loading, user, role, router]);

  if (loading) return <div data-testid="auth-loading">Cargando…</div>;
  if (!user || role !== "admin") return null;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen">
      {/* Botón de menú móvil */}
      <button 
        data-testid="mobile-menu-button"
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-gray-100 shadow-md"
        onClick={toggleMobileMenu}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>
      
      {/* Overlay para cerrar menú al hacer clic fuera */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}
      
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} />
      
      <main className="flex-1 p-6 md:ml-48">{children}</main>
    </div>
  );
}