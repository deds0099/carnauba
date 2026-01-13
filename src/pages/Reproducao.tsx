import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, BarChart3, List } from "lucide-react";
import { useReproducao } from "@/hooks/useReproducao";
import { EventoReprodutivoDialog } from "@/components/reproducao/EventoReprodutivoDialog";
import { CalendarioManejo } from "@/components/reproducao/CalendarioManejo";

export default function Reproducao() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { animais, eventos, loading, indicadores, acoesPendentes, recarregar } = useReproducao();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader title="Manejo Reprodutivo">
        <Button onClick={() => setDialogOpen(true)} className="shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          Novo Evento
        </Button>
      </PageHeader>

      <Tabs defaultValue="indicadores" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="indicadores" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Indicadores
          </TabsTrigger>
          <TabsTrigger value="calendario" className="gap-2">
            <Calendar className="h-4 w-4" />
            Calendário
          </TabsTrigger>
          <TabsTrigger value="eventos" className="gap-2">
            <List className="h-4 w-4" />
            Eventos
          </TabsTrigger>
        </TabsList>

        {/* Aba de Indicadores */}
        <TabsContent value="indicadores" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Taxa de Serviço"
              value={`${indicadores.taxaServico.toFixed(1)}%`}
              progress={indicadores.taxaServico}
              meta="60%"
              description="IAs nos últimos 21 dias / Vacas elegíveis"
              color="emerald"
            />
            <StatCard
              title="Taxa de Concepção"
              value={`${indicadores.taxaConcepcao.toFixed(1)}%`}
              progress={indicadores.taxaConcepcao}
              meta="50%"
              description="Diagnósticos positivos / Total de IAs"
              color="amber"
            />
            <StatCard
              title="Taxa de Prenhez"
              value={`${indicadores.taxaPrenhez.toFixed(1)}%`}
              progress={indicadores.taxaPrenhez}
              meta="30%"
              description="Taxa de Serviço × Taxa de Concepção"
              color="primary"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none bg-white glass ring-1 ring-black/5">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Rebanho</CardTitle>
                <CardDescription>Situação atual dos animais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50">
                  <span className="font-medium text-sm">Vacas Lactantes</span>
                  <Badge className="bg-emerald-600">{animais.filter(a => a.status === "lactante").length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-50">
                  <span className="font-medium text-sm">Vacas Prenhes</span>
                  <Badge className="bg-amber-600">{animais.filter(a => a.status === "prenhe").length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                  <span className="font-medium text-sm">Vacas Secas</span>
                  <Badge className="bg-blue-600">{animais.filter(a => a.status === "seca").length}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                  <span className="font-medium text-sm">Total de Eventos</span>
                  <Badge variant="outline" className="border-primary text-primary">{eventos.length}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-gradient-to-br from-[#1a3a2a] to-emerald-900 text-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-lg">Taxa de Serviço</CardTitle>
                <CardDescription className="text-white/60">Entenda o cálculo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Fórmula</p>
                  <p className="text-sm font-mono bg-black/20 p-2 rounded">
                    TS = (IAs / Vacas Elegíveis) × 100
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Meta</p>
                  <p className="text-sm">&gt; 60% - Indica boa detecção de cio</p>
                </div>
                <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Dica</p>
                  <p className="text-sm">Registre as inseminações regularmente para cálculos precisos</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba de Calendário */}
        <TabsContent value="calendario" className="space-y-6">
          <Card className="border-none bg-gradient-to-r from-primary/5 to-secondary/5 glass ring-1 ring-black/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Ações Pendentes
              </CardTitle>
              <CardDescription>Manejo programado para os próximos dias</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarioManejo acoes={acoesPendentes} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Eventos */}
        <TabsContent value="eventos" className="space-y-6">
          <Card className="border-none bg-white glass ring-1 ring-black/5">
            <CardHeader>
              <CardTitle>Histórico de Eventos</CardTitle>
              <CardDescription>Últimos eventos reprodutivos registrados</CardDescription>
            </CardHeader>
            <CardContent>
              {eventos.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <List className="h-16 w-16 mx-auto opacity-20 mb-4" />
                  <p className="font-medium">Nenhum evento registrado ainda</p>
                  <p className="text-sm mt-1">Clique em "Novo Evento" para começar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {eventos.slice(0, 10).map((evento) => {
                    const animal = animais.find(a => a.id === evento.animal_id);
                    return (
                      <div key={evento.id} className="p-4 rounded-lg border border-black/5 hover:bg-primary/5 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="font-bold text-[10px]">
                                {evento.tipo_evento?.toUpperCase() || "INSEMINAÇÃO"}
                              </Badge>
                              <span className="font-bold text-primary">
                                {animal?.numero} - {animal?.nome}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {new Date(evento.data_inseminacao).toLocaleDateString()}
                              {evento.touro && ` • Touro: ${evento.touro}`}
                              {evento.resultado_diagnostico && ` • ${evento.resultado_diagnostico}`}
                            </p>
                          </div>
                          <Badge className={
                            evento.status === "prenhe" ? "bg-emerald-600" :
                              evento.status === "vazia" ? "bg-gray-500" :
                                evento.status === "parto" ? "bg-blue-600" :
                                  "bg-amber-600"
                          }>
                            {evento.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <EventoReprodutivoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        animais={animais}
        onSuccess={recarregar}
      />
    </div>
  );
}

function StatCard({ title, value, progress, meta, description, color }: any) {
  const colorClasses = {
    emerald: "from-emerald-400 to-emerald-600",
    amber: "from-amber-400 to-amber-600",
    primary: "from-primary to-[#1a3a2a]",
  };

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
        <Progress value={progress} className="h-1.5 bg-black/5" indicatorClassName={`bg-gradient-to-r ${colorClasses[color]} shadow-sm`} />
        <p className="text-[10px] font-bold text-muted-foreground mt-3 uppercase tracking-wider">{description}</p>
      </CardContent>
    </Card>
  );
}
