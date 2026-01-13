import React, { useState, useEffect } from "react";
import { ChartBar, Database, Calendar, Users, ArrowUpRight } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProducaoChart } from "@/components/producao/ProducaoChart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { Database as DB } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { formatDate } from "@/lib/date-utils";
import { Button } from "@/components/ui/button";

type Animal = DB["public"]["Tables"]["animais"]["Row"];
type Producao = DB["public"]["Tables"]["producao"]["Row"];

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null);
  const [dados, setDados] = useState({
    totalAnimais: 0,
    animaisLactantes: 0,
    animaisPrenhas: 0,
    producaoHoje: 0,
    producao: [] as Producao[],
    proximosPartos: [] as Animal[],
  });
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return;

      setUserName(user.user_metadata?.name || user.email?.split('@')[0] || "Produtor");

      // Carregar animais
      const { data: animais, error: animaisError } = await supabase
        .from("animais")
        .select("*")
        .eq("user_id", user.id);

      if (animaisError) throw animaisError;

      // Carregar produção
      const { data: producao, error: producaoError } = await supabase
        .from("producao")
        .select("*")
        .eq("user_id", user.id)
        .order("data", { ascending: false });

      if (producaoError) throw producaoError;

      // Calcular estatísticas
      const hoje = new Date().toISOString().split("T")[0];
      const producaoHoje = producao
        ?.filter(p => p.data === hoje)
        .reduce((acc, p) => acc + p.quantidade, 0) || 0;

      const animaisLactantes = animais?.filter(a => a.status === "lactante").length || 0;
      const animaisPrenhas = animais?.filter(a => a.status === "prenhe").length || 0;

      // Ordenar próximos partos
      const proximosPartos = animais
        ?.filter(a => a.data_proximo_parto)
        .sort((a, b) =>
          new Date(a.data_proximo_parto || "").getTime() -
          new Date(b.data_proximo_parto || "").getTime()
        )
        .slice(0, 4) || [];

      setDados({
        totalAnimais: animais?.length || 0,
        animaisLactantes,
        animaisPrenhas,
        producaoHoje,
        producao: producao || [],
        proximosPartos,
      });
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const saudacao = () => {
    const hora = new Date().getHours();
    if (hora < 12) return "Bom dia";
    if (hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">
            {saudacao()}, <span className="text-gradient">{userName}</span>!
          </h1>
          <p className="text-muted-foreground mt-1 font-medium">
            Aqui está o que está acontecendo na sua fazenda hoje.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Hoje é</div>
            <div className="text-sm font-semibold text-primary">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          </div>
          <Button className="shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 rounded-xl px-6">
            Novo Registro
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total de Animais"
          value={dados.totalAnimais}
          description="Efetivo total"
          icon={<Users />}
          trend={{ value: 4, positive: true }}
        />

        <StatCard
          title="Lactantes"
          value={dados.animaisLactantes}
          description="Em produção"
          variant="success"
          icon={<ChartBar />}
        />

        <StatCard
          title="Prenhes"
          value={dados.animaisPrenhas}
          description="Em gestação"
          icon={<Calendar />}
          variant="warning"
        />

        <StatCard
          title="Produção Hoje"
          value={`${dados.producaoHoje.toFixed(0)} L`}
          description="Total diário"
          variant="success"
          icon={<ArrowUpRight />}
          trend={{ value: 12, positive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border-none bg-white/50 backdrop-blur-sm ring-1 ring-black/5 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-primary">Produção Diária</CardTitle>
              <CardDescription>Acompanhamento dos últimos registros de ordenha</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ProducaoChart
              data={dados.producao}
              tipo="diario"
            />
          </CardContent>
        </Card>

        <Card className="border-none bg-white/50 backdrop-blur-sm ring-1 ring-black/5 shadow-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-primary">Próximos Partos</CardTitle>
            <CardDescription>Fique atento às datas previstas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {dados.proximosPartos.length > 0 ? (
                dados.proximosPartos.map((animal) => (
                  <div key={animal.id} className="flex items-center gap-4 group cursor-pointer p-2 rounded-xl hover:bg-white transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-secondary/30 flex items-center justify-center font-bold text-primary group-hover:scale-110 transition-transform">
                      {animal.numero}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-primary leading-tight">{animal.nome}</div>
                      <div className="text-xs text-muted-foreground font-medium">
                        {formatDate(animal.data_proximo_parto || "")}
                      </div>
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]">
                      {animal.raca}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm font-medium">
                  Nenhum parto previsto para os próximos dias.
                </div>
              )}
            </div>
            <Button variant="ghost" className="w-full mt-6 text-primary font-bold text-xs hover:bg-primary/5">
              Ver todos os animais
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
