import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Syringe, Search, Filter, Plus, Pill, CalendarClock, History } from "lucide-react";
import { NovaVacinaDialog } from "@/components/sanitario/NovaVacinaDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fixDateTimezone } from "@/lib/date-utils";
import { Edit, Trash2 } from "lucide-react";

interface RegistroSanitario {
    id: string;
    data_aplicacao: string;
    nome_vacina: string;
    observacoes: string | null;
    dose: string | null;
    proxima_dose: string | null;
    animais: {
        nome: string;
        numero: string;
    };
}

export default function Sanitario() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [registros, setRegistros] = useState<RegistroSanitario[]>([]);
    const [registroParaEditar, setRegistroParaEditar] = useState<RegistroSanitario | undefined>(undefined);
    const [busca, setBusca] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        carregarRegistros();
    }, []);

    const carregarRegistros = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("manejo_sanitario")
                .select(`
          id,
          data_aplicacao,
          nome_vacina,
          observacoes,
          dose,
          proxima_dose,
          animais (
            nome,
            numero
          )
        `)
                .eq("user_id", user.id)
                .order("data_aplicacao", { ascending: false })
                .limit(50); // Limiting for performance initially

            if (error) throw error;
            setRegistros(data || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar registros",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const handleDeleteRegistro = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este registro sanitário?")) return;

        try {
            const { error } = await supabase
                .from("manejo_sanitario")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast({
                title: "Registro excluído",
                description: "O registro sanitário foi removido com sucesso.",
            });
            carregarRegistros();
        } catch (error: any) {
            toast({
                title: "Erro ao excluir",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    const registrosFiltrados = registros.filter(reg =>
        reg.nome_vacina.toLowerCase().includes(busca.toLowerCase()) ||
        reg.animais.nome.toLowerCase().includes(busca.toLowerCase()) ||
        reg.animais.numero.toLowerCase().includes(busca.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in pb-12">
            <PageHeader title="Manejo Sanitário">
                <Button
                    className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-bold px-6"
                    onClick={() => setIsDialogOpen(true)}
                >
                    <Plus className="mr-2 h-4 w-4" /> Nova Aplicação
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Aplicações (Mês)</CardTitle>
                        <Syringe className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{registros.filter(r => new Date(r.data_aplicacao).getMonth() === new Date().getMonth()).length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Registros nos últimos 30 dias</p>
                    </CardContent>
                </Card>
                <Card className="glass border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Próximas Revacinas</CardTitle>
                        <CalendarClock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{registros.filter(r => r.proxima_dose && new Date(r.proxima_dose) > new Date()).length}</div>
                        <p className="text-xs text-muted-foreground mt-1">Animais agendados</p>
                    </CardContent>
                </Card>
                <Card className="glass border-none shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Medicamentos Usados</CardTitle>
                        <Pill className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{new Set(registros.map(r => r.nome_vacina)).size}</div>
                        <p className="text-xs text-muted-foreground mt-1">Tipos diferentes registrados</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl ring-1 ring-black/5">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por vacina, animal..."
                        className="pl-10 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus:ring-primary/20 transition-all"
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button variant="outline" className="flex-1 md:flex-none rounded-xl glass border-primary/10 text-primary font-bold">
                        <Filter className="mr-2 h-4 w-4" /> Filtros
                    </Button>
                </div>
            </div>

            <div className="bg-white glass rounded-3xl shadow-sm border border-black/5 overflow-hidden">
                <div className="p-6 border-b border-black/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <History className="text-primary h-5 w-5" />
                        <h3 className="font-bold text-lg text-primary">Histórico de Aplicações</h3>
                    </div>
                    <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">{registros.length} Registros</Badge>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Data</th>
                                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Animal</th>
                                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Vacina/Medicamento</th>
                                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Dose</th>
                                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Revacinação</th>
                                <th className="text-left p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Obs</th>
                                <th className="text-right p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-black/5">
                            {registrosFiltrados.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-8 text-center text-muted-foreground">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            ) : (
                                registrosFiltrados.map((reg) => (
                                    <tr key={reg.id} className="hover:bg-muted/20 transition-colors">
                                        <td className="p-4 text-sm font-medium text-foreground/80">
                                            {format(fixDateTimezone(reg.data_aplicacao), "dd/MM/yyyy", { locale: ptBR })}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-primary">{reg.animais.nome}</span>
                                                <span className="text-xs text-muted-foreground">ID: {reg.animais.numero}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <Badge variant="outline" className="font-bold border-primary/20 text-primary bg-primary/5">
                                                {reg.nome_vacina}
                                            </Badge>
                                        </td>
                                        <td className="p-4 text-sm text-foreground/70">
                                            {reg.dose || "-"}
                                        </td>
                                        <td className="p-4 text-sm text-foreground/70">
                                            {reg.proxima_dose ? (
                                                <span className="flex items-center gap-1 text-amber-600 font-medium bg-amber-50 px-2 py-1 rounded-md">
                                                    <CalendarClock className="h-3 w-3" />
                                                    {format(fixDateTimezone(reg.proxima_dose), "dd/MM/yyyy", { locale: ptBR })}
                                                </span>
                                            ) : "-"}
                                        </td>
                                        <td className="p-4 text-sm text-muted-foreground italic max-w-xs truncate">
                                            {reg.observacoes || "-"}
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-primary/60 hover:text-primary hover:bg-primary/10"
                                                    onClick={() => {
                                                        setRegistroParaEditar(reg);
                                                        setIsDialogOpen(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-destructive/60 hover:text-destructive hover:bg-destructive/10"
                                                    onClick={() => handleDeleteRegistro(reg.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <NovaVacinaDialog
                isOpen={isDialogOpen}
                onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) setRegistroParaEditar(undefined);
                }}
                onSuccess={carregarRegistros}
                registroParaEditar={registroParaEditar}
            />
        </div>
    );
}
