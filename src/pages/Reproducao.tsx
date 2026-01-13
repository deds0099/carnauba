import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, ChevronRight, Dna } from "lucide-react";
import { Button } from "@/components/ui/button";

type Animal = Database["public"]["Tables"]["animais"]["Row"];

export default function Reproducao() {
  const [stats, setStats] = useState({
    taxaServico: 65.5,
    taxaConcepcao: 42.8,
    taxaPrenhez: 28.1,
    intervaloPartos: 13.4,
    periodoServico: 88,
  });

  const [proximosPartos, setProximosPartos] = useState<Animal[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: animais, error: animaisError } = await supabase
        .from("animais")
        .select("*")
        .eq("user_id", user.id);

      if (animaisError) throw animaisError;

      setProximosPartos(animais?.filter(a => a.data_proximo_parto).slice(0, 5) || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar dados",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader title="Controle Reprodutivo">
        <div className="flex bg-secondary/20 p-1 rounded-xl ring-1 ring-black/5">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-lg text-xs font-bold text-primary/60 hover:text-primary hover:bg-white/10"
          >
            Configurações
          </Button>
          <Button
            variant="default"
            size="sm"
            className="rounded-lg text-xs font-bold shadow-md bg-white text-primary hover:bg-white px-6"
          >
            Exportar Dados
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Taxa de Serviço"
          value={`${stats.taxaServico.toFixed(1)}%`}
          progress={stats.taxaServico}
          meta="60%"
          description="Eficiência de detecção de cio"
          indicatorClassName="bg-gradient-to-r from-emerald-400 to-emerald-600 shadow-sm"
        />
        <StatCard
          title="Taxa de Concepção"
          value={`${stats.taxaConcepcao.toFixed(1)}%`}
          progress={stats.taxaConcepcao}
          meta="40%"
          description="Gestação por inseminação"
          indicatorClassName="bg-gradient-to-r from-amber-400 to-amber-600 shadow-sm"
        />
        <StatCard
          title="Taxa de Prenhez"
          value={`${stats.taxaPrenhez.toFixed(1)}%`}
          progress={stats.taxaPrenhez}
          meta="25%"
          description="Performance reprodutiva global"
          indicatorClassName="bg-gradient-to-r from-primary to-[#1a3a2a] shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none bg-white/50 backdrop-blur-sm ring-1 ring-black/5 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-black/5 bg-white/30 flex flex-row items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-primary">Próximos Partos</CardTitle>
              <CardDescription className="text-xs font-medium">Previsão para os próximos 60 dias</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-black/5">
              {proximosPartos.length > 0 ? proximosPartos.map((animal) => (
                <div key={animal.id} className="p-4 flex items-center justify-between hover:bg-primary/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center font-bold text-primary text-xs ring-1 ring-primary/10">
                      {animal.numero}
                    </div>
                    <div>
                      <p className="font-bold text-primary">{animal.nome}</p>
                      <p className="text-[10px] uppercase tracking-widest font-medium text-muted-foreground">{animal.raca}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">
                      {new Date(animal.data_proximo_parto!).toLocaleDateString()}
                    </p>
                    <Badge variant="outline" className="mt-1 border-primary/10 text-primary/40 font-bold text-[9px]">
                      {Math.ceil((new Date(animal.data_proximo_parto!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dias
                    </Badge>
                  </div>
                </div>
              )) : (
                <div className="p-8 text-center text-muted-foreground italic text-sm">
                  Nenhum parto previsto para os próximos 60 dias.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none bg-gradient-to-br from-[#1a3a2a] to-emerald-900 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform duration-500">
            <Dna size={120} />
          </div>
          <CardHeader>
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <Dna className="h-6 w-6 text-secondary" /> Inteligência Herd
            </CardTitle>
            <CardDescription className="text-white/60 font-medium">insights automatizados do rebanho</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                <p className="text-xs font-bold uppercase tracking-widest text-secondary">Atenção Necessária</p>
              </div>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                Identificamos que 12% do rebanho está com DEL (Dias em Lactação) acima de 300 dias. Recomendamos revisar o protocolo de secagem.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-black/20 ring-1 ring-white/5">
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Intervalo Entre Partos</p>
                <p className="text-2xl font-black">13.4m</p>
              </div>
              <div className="p-4 rounded-2xl bg-black/20 ring-1 ring-white/5">
                <p className="text-[10px] uppercase font-bold text-white/40 tracking-widest mb-1">Média Dias Lactação</p>
                <p className="text-2xl font-black">185d</p>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="ghost" className="w-full text-xs font-bold uppercase tracking-widest text-secondary hover:text-white hover:bg-white/10 flex items-center gap-2">
              Ver Relatório Completo <ChevronRight size={14} />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, progress, meta, description, indicatorClassName }: any) {
  return (
    <Card className="card-hover border-none bg-white glass ring-1 ring-black/5 overflow-hidden group">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardDescription className="font-bold text-[10px] uppercase tracking-[0.2em] text-primary/40">{title}</CardDescription>
          <Badge variant="outline" className="rounded-lg border-emerald-500/20 text-emerald-600 bg-emerald-50 px-2 font-bold text-[10px]">Meta &gt; {meta}</Badge>
        </div>
        <CardTitle className="text-4xl font-black text-primary tracking-tight leading-none pt-2">
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <Progress value={progress} className="h-1.5 bg-black/5" indicatorClassName={indicatorClassName} />
        <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase tracking-wider">{description}</p>
      </CardContent>
    </Card>
  );
}
