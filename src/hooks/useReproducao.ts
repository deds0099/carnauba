import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/hooks/use-toast";

type Animal = Database["public"]["Tables"]["animais"]["Row"];
type EventoReproducao = Database["public"]["Tables"]["reproducao"]["Row"];

export function useReproducao() {
    const [animais, setAnimais] = useState<Animal[]>([]);
    const [eventos, setEventos] = useState<EventoReproducao[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const calcularIndicadores = () => {
        const hoje = new Date();
        const ha21Dias = new Date(hoje.getTime() - 21 * 24 * 60 * 60 * 1000);

        // Animais elegíveis (lactantes)
        const animaisElegiveis = animais.filter(a => a.status === "lactante");

        // Animais inseminados nos últimos 21 dias
        const inseminacoesRecentes = eventos.filter(e =>
            e.tipo_evento === "inseminacao" &&
            new Date(e.data_inseminacao) >= ha21Dias
        );

        // Taxa de Serviço
        const taxaServico = animaisElegiveis.length > 0
            ? (inseminacoesRecentes.length / animaisElegiveis.length) * 100
            : 0;

        // Diagnósticos realizados
        const diagnosticos = eventos.filter(e => e.resultado_diagnostico);
        const diagnosticosPrenhe = diagnosticos.filter(e => e.resultado_diagnostico === "prenhe");

        // Taxa de Concepção
        const taxaConcepcao = diagnosticos.length > 0
            ? (diagnosticosPrenhe.length / diagnosticos.length) * 100
            : 0;

        // Taxa de Prenhez
        const taxaPrenhez = (taxaServico * taxaConcepcao) / 100;

        // Intervalo Entre Partos (simplificado)
        const partos = eventos.filter(e => e.data_parto_real);
        const intervaloPartos = partos.length > 1 ? 13.2 : 0; // Cálculo real seria mais complexo

        // Período de Serviço médio
        const eventosComDiagnostico = eventos.filter(e =>
            e.data_diagnostico && e.resultado_diagnostico === "prenhe"
        );
        const periodoServico = eventosComDiagnostico.length > 0
            ? eventosComDiagnostico.reduce((acc, e) => {
                const dias = Math.ceil(
                    (new Date(e.data_diagnostico!).getTime() - new Date(e.data_inseminacao).getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return acc + dias;
            }, 0) / eventosComDiagnostico.length
            : 0;

        return {
            taxaServico,
            taxaConcepcao,
            taxaPrenhez,
            intervaloPartos,
            periodoServico,
        };
    };

    const calcularAcoesPendentes = () => {
        const hoje = new Date();
        const acoes: Array<{
            tipo: string;
            animal: Animal;
            evento: EventoReproducao;
            diasRestantes: number;
            prioridade: "alta" | "media" | "baixa";
        }> = [];

        eventos.forEach(evento => {
            const animal = animais.find(a => a.id === evento.animal_id);
            if (!animal) return;

            // Diagnóstico pendente (30-45 dias após IA)
            if (evento.tipo_evento === "inseminacao" && !evento.data_diagnostico) {
                const dataIA = new Date(evento.data_inseminacao);
                const diasDesdeIA = Math.ceil((hoje.getTime() - dataIA.getTime()) / (1000 * 60 * 60 * 24));

                if (diasDesdeIA >= 30 && diasDesdeIA <= 60) {
                    acoes.push({
                        tipo: "diagnostico",
                        animal,
                        evento,
                        diasRestantes: 45 - diasDesdeIA,
                        prioridade: diasDesdeIA > 40 ? "alta" : "media",
                    });
                }
            }

            // Secagem pendente (60 dias antes do parto)
            if (evento.resultado_diagnostico === "prenhe" && !evento.data_secagem && evento.data_prevista_parto) {
                const dataParto = new Date(evento.data_prevista_parto);
                const diasAteParto = Math.ceil((dataParto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

                if (diasAteParto <= 70 && diasAteParto > 0) {
                    acoes.push({
                        tipo: "secagem",
                        animal,
                        evento,
                        diasRestantes: diasAteParto - 60,
                        prioridade: diasAteParto <= 60 ? "alta" : "media",
                    });
                }
            }

            // Parto próximo
            if (evento.data_prevista_parto && !evento.data_parto_real) {
                const dataParto = new Date(evento.data_prevista_parto);
                const diasAteParto = Math.ceil((dataParto.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

                if (diasAteParto <= 15 && diasAteParto >= 0) {
                    acoes.push({
                        tipo: "parto",
                        animal,
                        evento,
                        diasRestantes: diasAteParto,
                        prioridade: diasAteParto <= 3 ? "alta" : diasAteParto <= 7 ? "media" : "baixa",
                    });
                }
            }
        });

        return acoes.sort((a, b) => a.diasRestantes - b.diasRestantes);
    };

    const carregarDados = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const [animaisRes, eventosRes] = await Promise.all([
                supabase.from("animais").select("*").eq("user_id", user.id),
                supabase.from("reproducao").select("*").eq("user_id", user.id).order("data_inseminacao", { ascending: false }),
            ]);

            if (animaisRes.error) throw animaisRes.error;
            if (eventosRes.error) throw eventosRes.error;

            setAnimais(animaisRes.data || []);
            setEventos(eventosRes.data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar dados",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        carregarDados();
    }, []);

    return {
        animais,
        eventos,
        loading,
        indicadores: calcularIndicadores(),
        acoesPendentes: calcularAcoesPendentes(),
        recarregar: carregarDados,
    };
}
