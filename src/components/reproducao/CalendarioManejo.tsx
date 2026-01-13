import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle, Syringe, Milk } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Animal = Database["public"]["Tables"]["animais"]["Row"];
type EventoReproducao = Database["public"]["Tables"]["reproducao"]["Row"];

interface AcaoPendente {
    tipo: string;
    animal: Animal;
    evento: EventoReproducao;
    diasRestantes: number;
    prioridade: "alta" | "media" | "baixa";
}

interface CalendarioManejoProps {
    acoes: AcaoPendente[];
}

const getIconByTipo = (tipo: string) => {
    switch (tipo) {
        case "diagnostico":
            return <Syringe className="h-5 w-5" />;
        case "secagem":
            return <Milk className="h-5 w-5" />;
        case "parto":
            return <Calendar className="h-5 w-5" />;
        default:
            return <AlertCircle className="h-5 w-5" />;
    }
};

const getTituloByTipo = (tipo: string) => {
    switch (tipo) {
        case "diagnostico":
            return "Diagnóstico de Gestação";
        case "secagem":
            return "Secagem";
        case "parto":
            return "Parto Previsto";
        default:
            return "Ação Pendente";
    }
};

const getPrioridadeCor = (prioridade: string) => {
    switch (prioridade) {
        case "alta":
            return "bg-red-100 text-red-700 border-red-300";
        case "media":
            return "bg-amber-100 text-amber-700 border-amber-300";
        case "baixa":
            return "bg-blue-100 text-blue-700 border-blue-300";
        default:
            return "bg-gray-100 text-gray-700 border-gray-300";
    }
};

export function CalendarioManejo({ acoes }: CalendarioManejoProps) {
    if (acoes.length === 0) {
        return (
            <Card className="border-none bg-white glass ring-1 ring-black/5">
                <CardContent className="p-12 text-center">
                    <Calendar className="h-16 w-16 mx-auto text-muted-foreground opacity-20 mb-4" />
                    <p className="text-muted-foreground font-medium">Nenhuma ação pendente no momento</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">O manejo está em dia! 🎉</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {acoes.map((acao, index) => (
                <Card
                    key={index}
                    className={`border-none glass ring-1 overflow-hidden transition-all hover:shadow-md ${acao.prioridade === "alta" ? "ring-red-200 bg-red-50/50" :
                            acao.prioridade === "media" ? "ring-amber-200 bg-amber-50/50" :
                                "ring-blue-200 bg-blue-50/50"
                        }`}
                >
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                                <div className={`p-3 rounded-xl ${acao.prioridade === "alta" ? "bg-red-100 text-red-600" :
                                        acao.prioridade === "media" ? "bg-amber-100 text-amber-600" :
                                            "bg-blue-100 text-blue-600"
                                    }`}>
                                    {getIconByTipo(acao.tipo)}
                                </div>

                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="font-bold text-primary">{getTituloByTipo(acao.tipo)}</h4>
                                        <Badge variant="outline" className={`text-[10px] font-bold ${getPrioridadeCor(acao.prioridade)}`}>
                                            {acao.prioridade.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        <span className="font-semibold text-primary">{acao.animal.numero} - {acao.animal.nome}</span>
                                    </p>
                                    {acao.tipo === "diagnostico" && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Inseminação em {new Date(acao.evento.data_inseminacao).toLocaleDateString()}
                                        </p>
                                    )}
                                    {acao.tipo === "parto" && acao.evento.data_prevista_parto && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Parto previsto para {new Date(acao.evento.data_prevista_parto).toLocaleDateString()}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="text-right">
                                <div className={`text-2xl font-black ${acao.diasRestantes <= 0 ? "text-red-600" :
                                        acao.diasRestantes <= 3 ? "text-amber-600" :
                                            "text-blue-600"
                                    }`}>
                                    {Math.abs(acao.diasRestantes)}
                                </div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                                    {acao.diasRestantes <= 0 ? "atrasado" : acao.diasRestantes === 1 ? "dia" : "dias"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
