import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/PageHeader";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Bell, CheckCircle2, AlertTriangle, Info, Clock, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Animal = Database["public"]["Tables"]["animais"]["Row"];
type Producao = Database["public"]["Tables"]["producao"]["Row"];

interface Alerta {
  id: string;
  tipo: "parto" | "producao" | "inseminacao" | "sanitario";
  animal: string;
  descricao: string;
  data: string;
  resolvido: boolean;
  prioridade: "alta" | "media" | "baixa";
}

export default function Alertas() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("pendentes");
  const { toast } = useToast();

  useEffect(() => {
    carregarAlertas();
  }, []);

  const carregarAlertas = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

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

      // Carregar manejo sanitário
      const { data: sanitario, error: sanitarioError } = await supabase
        .from("manejo_sanitario")
        .select(`
          *,
          animais (nome, numero)
        `)
        .eq("user_id", user.id)
        .not("proxima_dose", "is", null);

      if (sanitarioError) throw sanitarioError;

      // Carregar reprodução
      const { data: reproducao, error: reproducaoError } = await supabase
        .from("reproducao")
        .select(`
          *,
          animais (nome, numero)
        `)
        .eq("user_id", user.id);

      if (reproducaoError) throw reproducaoError;

      // Carregar alertas resolvidos
      const { data: alertasResolvidos, error: alertasError } = await supabase
        .from("alertas")
        .select("*")
        .eq("user_id", user.id);

      if (alertasError) throw alertasError;

      const novosAlertas: Alerta[] = [];

      // 1. Alertas de Reprodutivo: Partos (animais marcados como prenhes)
      animais?.forEach(animal => {
        if (animal.data_proximo_parto) {
          const dataParto = new Date(animal.data_proximo_parto);
          // Ajuste de fuso horário para comparação correta
          const dataPartoAjustada = new Date(dataParto.getTime() + dataParto.getTimezoneOffset() * 60000);

          const hoje = new Date();
          const diffTempo = dataPartoAjustada.getTime() - hoje.getTime();
          const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

          if (diffDias <= 15) { // Alerta a partir de 15 dias antes
            const alertaId = `parto-${animal.id}`;
            const alertaResolvido = alertasResolvidos?.find(a => a.id === alertaId);

            novosAlertas.push({
              id: alertaId,
              tipo: "parto",
              animal: `${animal.numero} - ${animal.nome}`,
              descricao: `Parto previsto para ${diffDias <= 0 ? "hoje ou atrasado" : `em ${diffDias} dias`} (${new Date(animal.data_proximo_parto).toLocaleDateString()})`,
              data: animal.data_proximo_parto,
              resolvido: alertaResolvido?.resolvido || false,
              prioridade: diffDias <= 5 ? "alta" : "media"
            });
          }
        }
      });

      // 2. Alertas de Produção: Queda brusca
      animais?.forEach(animal => {
        const producoesAnimal = producao?.filter(p => p.animal_id === animal.id);
        if (producoesAnimal && producoesAnimal.length >= 3) {
          const mediaAntiga = producoesAnimal.slice(1, 4).reduce((acc, p) => acc + p.quantidade, 0) / 3;
          const mediaRecente = producoesAnimal.slice(0, 3).reduce((acc, p) => acc + p.quantidade, 0) / 3;

          // Evitar divisão por zero
          if (mediaAntiga > 0) {
            const variacao = ((mediaRecente - mediaAntiga) / mediaAntiga) * 100;

            if (variacao < -20) { // Queda maior que 20%
              const alertaId = `producao-${animal.id}-${producoesAnimal[0].data}`;
              const alertaResolvido = alertasResolvidos?.find(a => a.id === alertaId);

              novosAlertas.push({
                id: alertaId,
                tipo: "producao",
                animal: `${animal.numero} - ${animal.nome}`,
                descricao: `Queda de ${Math.abs(variacao).toFixed(1)}% na produção recente.`,
                data: producoesAnimal[0].data,
                resolvido: alertaResolvido?.resolvido || false,
                prioridade: "media"
              });
            }
          }
        }
      });

      // 3. Alertas Sanitários: Vacinas vencendo ou vencidas
      sanitario?.forEach(reg => {
        if (reg.proxima_dose) {
          const dataProxima = new Date(reg.proxima_dose);
          // Ajuste de fuso horário
          const dataProximaAjustada = new Date(dataProxima.getTime() + dataProxima.getTimezoneOffset() * 60000);

          const hoje = new Date();
          const diffTempo = dataProximaAjustada.getTime() - hoje.getTime();
          const diffDias = Math.ceil(diffTempo / (1000 * 60 * 60 * 24));

          // Alerta para vencidas ou vencendo em 7 dias
          if (diffDias <= 7) {
            const alertaId = `sanitario-${reg.id}`;
            const alertaResolvido = alertasResolvidos?.find(a => a.id === alertaId);

            /* 
               Se ainda não foi resolvido ou (foi resolvido mas o prazo mudou? Não, só se o usuário deletou o alerta). 
               Vamos assumir que se o usuário clicou em "Resolver", ele já lidou com isso (ex: vacinou e criou novo registro).
               Se ele criar novo registro, este alerta antigo ainda existirá? 
               Não, porque este alerta é baseado no registro ANTERIOR que tem 'proxima_dose'. 
               Se ele vacinar novamente, criará UM NOVO registro. O registro antigo CONTINUA lá.
               Então o "Resolver" tem que persistir para este registro específico.
            */

            // Atrasadas (dias negativos) ou Próximas (0 a 7 dias)
            const statusDesc = diffDias < 0 ? `ATRASADA há ${Math.abs(diffDias)} dias` : `vence em ${diffDias} dias`;
            const prioridade = diffDias < 0 ? "alta" : "media";

            novosAlertas.push({
              id: alertaId,
              tipo: "sanitario",
              animal: reg.animais ? `${reg.animais.numero} - ${reg.animais.nome}` : "Desconhecido",
              descricao: `Revacinação de ${reg.nome_vacina} ${statusDesc} (${new Date(reg.proxima_dose).toLocaleDateString()})`,
              data: reg.proxima_dose,
              resolvido: alertaResolvido?.resolvido || false,
              prioridade: prioridade
            });
          }
        }
      });

      // 4. Alertas Reprodutivos: Diagnóstico de Prenhez e Secagem
      reproducao?.forEach(evento => {
        const hoje = new Date();
        const dataInseminacao = new Date(evento.data_inseminacao);
        const diffDiasInseminacao = Math.floor((hoje.getTime() - dataInseminacao.getTime()) / (1000 * 60 * 60 * 24));

        // Diagnóstico Pendente (> 30 dias após IA e sem diagnóstico)
        if (!evento.data_diagnostico && diffDiasInseminacao >= 30) {
          const alertaId = `diag-${evento.id}`;
          const alertaResolvido = alertasResolvidos?.find(a => a.id === alertaId);

          novosAlertas.push({
            id: alertaId,
            tipo: "inseminacao",
            animal: evento.animais ? `${evento.animais.numero} - ${evento.animais.nome}` : "Desconhecido",
            descricao: `Diagnóstico de gestação pendente (${diffDiasInseminacao} dias após IA).`,
            data: evento.data_inseminacao, // Data de referência
            resolvido: alertaResolvido?.resolvido || false,
            prioridade: "alta"
          });
        }

        // Alerta de Secagem (Gestão confirmada, ~220 dias de gestação = 7 meses) e ainda está lactante
        // Precisaríamos checar se o animal está 'lactante', mas vamos assumir que se está prenhe, pode estar lactante.
        // A lógica de "Secagem" geralmente é 60 dias antes do parto.
        // Se temos `data_proximo_parto` no animal, podemos usar isso tbm.
        // Mas vamos olhar pelo evento de reprodução "prenhe".
        if (evento.status === 'prenhe' && evento.data_inseminacao) {
          // Gestação média gado leiteiro ~280-285 dias.
          // Secagem ideal: 60 dias antes do parto => ~220 dias de gestação.
          if (diffDiasInseminacao >= 215 && diffDiasInseminacao <= 230) {
            const alertaId = `secagem-${evento.id}`;
            const alertaResolvido = alertasResolvidos?.find(a => a.id === alertaId);

            novosAlertas.push({
              id: alertaId,
              tipo: "inseminacao", // Ou criar tipo 'secagem' se o Enum permitir, mas vou usar inseminacao ou parto
              animal: evento.animais ? `${evento.animais.numero} - ${evento.animais.nome}` : "Desconhecido",
              descricao: `Sugestão de secagem (Gestação de ${diffDiasInseminacao} dias).`,
              data: new Date().toISOString(), // Alerta de hoje
              resolvido: alertaResolvido?.resolvido || false,
              prioridade: "media"
            });
          }
        }
      });

      setAlertas(novosAlertas);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar alertas",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const alertasFiltrados = alertas.filter((alerta) => {
    const filtroTipoOk = filtroTipo === "todos" || alerta.tipo === filtroTipo;
    const filtroStatusOk =
      filtroStatus === "todos" ||
      (filtroStatus === "pendentes" && !alerta.resolvido) ||
      (filtroStatus === "resolvidos" && alerta.resolvido);

    return filtroTipoOk && filtroStatusOk;
  });

  const handleResolverAlerta = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: alertaExistente } = await supabase
        .from("alertas")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (alertaExistente) {
        const { error } = await supabase
          .from("alertas")
          .update({ resolvido: true })
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("alertas")
          .insert({
            id,
            user_id: user.id,
            resolvido: true,
            data_resolucao: new Date().toISOString()
          });

        if (error) throw error;
      }

      setAlertas(alertas.map((alerta) =>
        alerta.id === id ? { ...alerta, resolvido: true } : alerta
      ));

      toast({
        title: "Alerta resolvido",
        description: "O alerta foi marcado como resolvido com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao resolver alerta",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getPrioridadeBadge = (prioridade: string) => {
    switch (prioridade) {
      case "alta": return <Badge className="bg-rose-500 hover:bg-rose-600 text-white border-none rounded-lg px-3 font-bold">ALTA</Badge>;
      case "media": return <Badge className="bg-amber-500 hover:bg-amber-600 text-white border-none rounded-lg px-3 font-bold">MÉDIA</Badge>;
      default: return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none rounded-lg px-3 font-bold">BAIXA</Badge>;
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader title="Notificações e Alertas">
        <div className="flex bg-secondary/20 p-1 rounded-xl ring-1 ring-black/5">
          <Button
            variant={filtroStatus === "pendentes" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFiltroStatus("pendentes")}
            className={`rounded-lg text-xs font-bold transition-all ${filtroStatus === "pendentes" ? "shadow-md bg-white text-primary hover:bg-white" : "text-primary/60 hover:text-primary"}`}
          >
            Pendentes
          </Button>
          <Button
            variant={filtroStatus === "resolvidos" ? "default" : "ghost"}
            size="sm"
            onClick={() => setFiltroStatus("resolvidos")}
            className={`rounded-lg text-xs font-bold transition-all ${filtroStatus === "resolvidos" ? "shadow-md bg-white text-primary hover:bg-white" : "text-primary/60 hover:text-primary"}`}
          >
            Resolvidos
          </Button>
        </div>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl ring-1 ring-black/5">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="text-primary/40 h-5 w-5 ml-2" />
          <Select value={filtroTipo} onValueChange={setFiltroTipo}>
            <SelectTrigger className="w-full md:w-48 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus:ring-primary/20">
              <SelectValue placeholder="Tipo de Alerta" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-none shadow-xl ring-1 ring-black/5">
              <SelectItem value="todos">Todos os Tipos</SelectItem>
              <SelectItem value="parto">Partos</SelectItem>
              <SelectItem value="producao">Produção</SelectItem>
              <SelectItem value="inseminacao">Inseminação</SelectItem>
              <SelectItem value="sanitario">Sanitário</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="rounded-xl px-4 py-1.5 font-bold border-primary/10 text-primary">
            {alertasFiltrados.length} Registros
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {alertasFiltrados.map((alerta) => (
          <Card
            key={alerta.id}
            className={`card-hover border-none bg-white glass ring-1 ring-black/5 overflow-hidden group ${alerta.resolvido ? "opacity-60 grayscale-[0.5]" : ""
              }`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
                <div className={`p-4 rounded-2xl ${alerta.tipo === 'parto' ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'} ring-1 ring-black/5`}>
                  <Bell size={32} />
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    {getPrioridadeBadge(alerta.prioridade)}
                    <Badge variant="outline" className="rounded-lg border-primary/10 text-primary/60 font-medium uppercase tracking-widest text-[10px] px-2">
                      {alerta.tipo}
                    </Badge>
                    <span className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground ml-auto">
                      <Clock size={14} /> {new Date(alerta.data).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-primary tracking-tight">{alerta.animal}</h3>
                    <p className="text-sm text-primary/70 font-medium leading-relaxed">{alerta.descricao}</p>
                  </div>

                  {!alerta.resolvido && (
                    <div className="pt-4 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolverAlerta(alerta.id)}
                        className="rounded-xl glass border-primary/20 text-primary hover:bg-primary hover:text-white transition-all font-bold px-6"
                      >
                        <CheckCircle2 className="mr-2 h-4 w-4" /> Marcar como Resolvido
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {alertasFiltrados.length === 0 && (
          <div className="py-20 text-center glass rounded-3xl border-dashed border-2 border-primary/10">
            <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="text-primary/20 h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-primary">Tudo em ordem</h3>
            <p className="text-muted-foreground font-medium">Não há alertas pendentes para os filtros selecionados.</p>
          </div>
        )}
      </div>
    </div>
  );
}
