import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Database,
  Calendar,
  BarChart3,
  FileSpreadsheet,
  Bell,
  LogOut,
  Syringe
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function SidebarNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Sessão encerrada",
      description: "Você saiu do sistema com sucesso.",
    });
    navigate("/auth");
  };

  const menuItems = [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Rebanho", url: "/animais", icon: Database },
    { title: "Ordenha", url: "/producao", icon: BarChart3 },
    { title: "Manejo", url: "/reproducao", icon: Calendar },
    { title: "Sanitário", url: "/sanitario", icon: Syringe },
    { title: "Relatórios", url: "/relatorios", icon: FileSpreadsheet },
    { title: "Alertas", url: "/alertas", icon: Bell },
  ];

  return (
    <div className="flex flex-col h-full">
      <nav className="flex-1 space-y-1 p-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.url ||
            (item.url !== '/' && location.pathname.startsWith(item.url));

          return (
            <NavLink
              key={item.title}
              to={item.url}
              end
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${isActive
                ? "bg-secondary/20 text-white shadow-sm ring-1 ring-white/10"
                : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
            >
              <item.icon className={`h-5 w-5 shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
              <span className="font-medium text-sm">{item.title}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-destructive-foreground hover:bg-destructive/80 transition-all duration-200"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          <span className="font-medium text-sm">Sair do Sistema</span>
        </button>
      </div>
    </div>
  );
}
