import { PropsWithChildren, useState } from "react";
import { SidebarNav } from "./SidebarNav";
import { Header } from "./Header";
import { Menu, X, Compass } from "lucide-react";

export function Layout({ children }: PropsWithChildren) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex w-72 flex-col bg-[#1a3a2a] border-r border-[#234534] shadow-2xl z-20">
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#ffcc33] flex items-center justify-center shadow-lg ring-1 ring-white/20">
            <Compass className="text-white h-6 w-6 stroke-[2.5px]" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight leading-none">Agro Cow</span>
            <span className="text-[10px] text-white/40 font-medium uppercase tracking-[0.2em] mt-1">Compass System</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>
      </div>

      {/* Mobile Menu Button - Glass effect */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-3 rounded-2xl glass shadow-lg border-white/40 text-primary transition-all duration-300 active:scale-95"
      >
        {isMobileMenuOpen ? <X size={22} strokeWidth={2.5} /> : <Menu size={22} strokeWidth={2.5} />}
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-40 w-[280px] bg-[#1a3a2a] transform transition-transform duration-500 ease-out ${isMobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center gap-3 p-6 border-b border-white/10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37] to-[#ffcc33] flex items-center justify-center">
            <Compass className="text-white h-6 w-6" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white tracking-tight leading-none">Agro Cow</span>
            <span className="text-[10px] text-white/40 font-medium uppercase tracking-[0.2em] mt-1">Compass System</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <SidebarNav />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden relative">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-background via-background to-secondary/5">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
