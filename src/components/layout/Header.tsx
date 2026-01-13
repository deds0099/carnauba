import React, { useState, useEffect } from "react";
import { Bell, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Database } from "@/integrations/supabase/types";

type Animal = Database["public"]["Tables"]["animais"]["Row"];

export function Header() {
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  const [alertasPendentes, setAlertasPendentes] = useState(0);

  useEffect(() => {
    carregarAlertas();
  }, []);

  const carregarAlertas = async () => {
    try {
      // Carregar animais
      const { data: animais, error: animaisError } = await supabase
        .from("animais")
        .select("*");

      if (animaisError) throw animaisError;

      // Carregar produção
      const { data: producao, error: producaoError } = await supabase
        .from("producao")
        .select("*")
        .order("data", { ascending: false });

      if (producaoError) throw producaoError;

      // Carregar alertas resolvidos
      const { data: alertasResolvidos, error: alertasError } = await supabase
        .from("alertas")
        .select("*");

      if (alertasError) throw alertasError;

      let contador = 0;

      // Verificar próximos partos (7 dias)
      const hoje = new Date();
      const seteDias = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);

      animais?.forEach(animal => {
        if (animal.data_proximo_parto) {
          const dataParto = new Date(animal.data_proximo_parto);
          if (dataParto >= hoje && dataParto <= seteDias) {
            // Verificar se o alerta já foi resolvido
            const alertaResolvido = alertasResolvidos?.find(
              a => a.tipo === "parto" && a.animal_id === animal.id
            );
            if (!alertaResolvido?.resolvido) {
              contador++;
            }
          }
        }
      });

      // Verificar quedas de produção
      if (producao && producao.length >= 3) {
        const ultimasProducoes = producao.slice(0, 3);
        const mediaAntiga = (ultimasProducoes[1].quantidade + ultimasProducoes[2].quantidade) / 2;
        const queda = ((mediaAntiga - ultimasProducoes[0].quantidade) / mediaAntiga) * 100;

        if (queda > 15) {
          // Verificar se o alerta já foi resolvido
          const alertaResolvido = alertasResolvidos?.find(
            a => a.tipo === "producao" && a.data === ultimasProducoes[0].data
          );
          if (!alertaResolvido?.resolvido) {
            contador++;
          }
        }
      }

      setAlertasPendentes(contador);
    } catch (error: any) {
      console.error("Erro ao carregar alertas:", error);
    }
  };

  const showNotification = () => {
    navigate("/alertas");
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Limpar qualquer estado local se necessário
      setAlertasPendentes(0);
      
      // Redirecionar para a página de login
      navigate("/auth", { replace: true });
    } catch (error: any) {
      toast.error("Erro ao fazer logout: " + error.message);
    }
  };

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center justify-end px-4 md:px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {alertasPendentes > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
                {alertasPendentes}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Perfil</DropdownMenuItem>
              <DropdownMenuItem>Configurações</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
