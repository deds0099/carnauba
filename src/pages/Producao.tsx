import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProducaoForm } from "@/components/producao/ProducaoForm";
import { ProducaoChart } from "@/components/producao/ProducaoChart";
import { FileText, Plus, Droplets, TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

type Animal = Database["public"]["Tables"]["animais"]["Row"];
type Producao = Database["public"]["Tables"]["producao"]["Row"];

export default function Producao() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("diario");
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [proximosPartos, setProximosPartos] = useState<Animal[]>([]);
  const [producao, setProducao] = useState<Producao[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.log("Usuário não autenticado, pulando carregamento de dados.");
      return;
    }

    // Carregar animais
    const { data: animaisData, error: animaisError } = await supabase
      .from("animais")
      .select("*")
      .eq("user_id", user.id)
      .order("numero");

    if (animaisError) {
      toast({
        title: "Erro ao carregar animais",
        description: animaisError.message,
        variant: "destructive",
      });
      return;
    }

    setAnimais(animaisData || []);

    // Carregar produção
    const { data: producaoData, error: producaoError } = await supabase
      .from("producao")
      .select("*")
      .eq("user_id", user.id)
      .order("data", { ascending: false });

    if (producaoError) {
      toast({
        title: "Erro ao carregar produção",
        description: producaoError.message,
        variant: "destructive",
      });
      return;
    }

    setProducao(producaoData || []);
  };

  const handleSubmitProducao = async (data: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const producaoData = {
        ...data,
        user_id: user?.id,
      };

      const { error } = await supabase
        .from("producao")
        .insert([producaoData]);

      if (error) throw error;

      toast({
        title: "Produção registrada",
        description: "O registro de produção foi salvo com sucesso.",
      });

      // Recarregar dados
      await carregarDados();
    } catch (error: any) {
      toast({
        title: "Erro ao registrar produção",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader title="Produção de Leite" />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 border-none bg-white/50 backdrop-blur-sm ring-1 ring-black/5 shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-black/5 bg-white/30 gap-4">
            <div>
              <CardTitle className="text-xl font-bold text-primary">Análise de Produção</CardTitle>
              <CardDescription className="font-medium">Acompanhamento volumétrico do rebanho</CardDescription>
            </div>
            <div className="flex bg-secondary/20 p-1 rounded-xl ring-1 ring-black/5">
              <Button
                variant={periodoSelecionado === "diario" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriodoSelecionado("diario")}
                className={`rounded-lg text-xs font-bold transition-all ${periodoSelecionado === "diario" ? "shadow-md bg-white text-primary hover:bg-white" : "text-primary/60 hover:text-primary hover:bg-white/10"}`}
              >
                Diário
              </Button>
              <Button
                variant={periodoSelecionado === "mensal" ? "default" : "ghost"}
                size="sm"
                onClick={() => setPeriodoSelecionado("mensal")}
                className={`rounded-lg text-xs font-bold transition-all ${periodoSelecionado === "mensal" ? "shadow-md bg-white text-primary hover:bg-white" : "text-primary/60 hover:text-primary hover:bg-white/10"}`}
              >
                Mensal
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-8">
            <ProducaoChart
              data={producao}
              tipo={periodoSelecionado as "diario" | "mensal"}
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-none bg-gradient-to-br from-primary to-[#1a3a2a] text-white shadow-xl shadow-primary/20 overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <Droplets size={80} />
            </div>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-white/60">Produção Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
                  <Droplets className="h-6 w-6 text-secondary" />
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight leading-none">
                    {producao.reduce((acc, p) => acc + p.quantidade, 0).toFixed(0)} <span className="text-sm font-medium opacity-60">L</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-50 mt-1">Acumulado no período</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white glass shadow-sm ring-1 ring-black/5 overflow-hidden group">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-bold uppercase tracking-[0.2em] text-primary/40">Média por Animal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-secondary/20 text-primary transition-colors group-hover:bg-secondary/30">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-4xl font-black tracking-tight text-primary leading-none">
                    {(producao.length > 0 ? producao.reduce((acc, p) => acc + p.quantidade, 0) / (animais.length || 1) : 0).toFixed(1)} <span className="text-sm font-medium opacity-50">L</span>
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider opacity-40 mt-1">Eficiência produtiva</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none bg-white glass shadow-sm ring-1 ring-black/5">
            <CardHeader className="pb-3 border-b border-black/5">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-primary/60">Novo Registro</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <ProducaoForm
                animais={animais}
                onSubmit={handleSubmitProducao}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
