import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Animal = Database["public"]["Tables"]["animais"]["Row"];

interface EventoReprodutivoDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    animais: Animal[];
    onSuccess: () => void;
}

export function EventoReprodutivoDialog({ open, onOpenChange, animais, onSuccess }: EventoReprodutivoDialogProps) {
    const [loading, setLoading] = useState(false);
    const [tipoEvento, setTipoEvento] = useState<string>("inseminacao");
    const { toast } = useToast();

    const [formData, setFormData] = useState({
        animal_id: "",
        data_inseminacao: "",
        touro: "",
        tecnico: "",
        protocolo: "",
        data_diagnostico: "",
        resultado_diagnostico: "",
        data_parto_real: "",
        data_secagem: "",
        observacoes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            let status = "pendente";
            let data_prevista_parto: string | null = null;

            // Calcular data prevista de parto (280 dias após IA)
            if (tipoEvento === "inseminacao" && formData.data_inseminacao) {
                const dataIA = new Date(formData.data_inseminacao);
                const dataParto = new Date(dataIA.getTime() + 280 * 24 * 60 * 60 * 1000);
                data_prevista_parto = dataParto.toISOString().split('T')[0];
            }

            // Definir status baseado no tipo de evento
            if (tipoEvento === "diagnostico" && formData.resultado_diagnostico) {
                status = formData.resultado_diagnostico;
            } else if (tipoEvento === "parto") {
                status = "parto";
            } else if (tipoEvento === "secagem") {
                status = "seca";
            }

            const eventoData: any = {
                user_id: user.id,
                animal_id: formData.animal_id,
                tipo_evento: tipoEvento,
                status,
                data_prevista_parto,
            };

            // Adicionar campos específicos por tipo de evento
            if (tipoEvento === "inseminacao") {
                eventoData.data_inseminacao = formData.data_inseminacao;
                eventoData.touro = formData.touro || null;
                eventoData.tecnico = formData.tecnico || null;
                eventoData.protocolo = formData.protocolo || null;
            } else if (tipoEvento === "diagnostico") {
                eventoData.data_diagnostico = formData.data_diagnostico;
                eventoData.resultado_diagnostico = formData.resultado_diagnostico;
            } else if (tipoEvento === "parto") {
                eventoData.data_parto_real = formData.data_parto_real;
            } else if (tipoEvento === "secagem") {
                eventoData.data_secagem = formData.data_secagem;
            }

            eventoData.observacoes = formData.observacoes || null;

            const { error } = await supabase.from("reproducao").insert([eventoData]);

            if (error) throw error;

            toast({
                title: "Evento registrado!",
                description: "O evento reprodutivo foi salvo com sucesso.",
            });

            // Atualizar status do animal se necessário
            if (tipoEvento === "diagnostico" && formData.resultado_diagnostico === "prenhe") {
                await supabase
                    .from("animais")
                    .update({ status: "prenhe" })
                    .eq("id", formData.animal_id);
            } else if (tipoEvento === "parto") {
                await supabase
                    .from("animais")
                    .update({ status: "lactante", data_proximo_parto: null })
                    .eq("id", formData.animal_id);
            }

            onSuccess();
            onOpenChange(false);
            setFormData({
                animal_id: "",
                data_inseminacao: "",
                touro: "",
                tecnico: "",
                protocolo: "",
                data_diagnostico: "",
                resultado_diagnostico: "",
                data_parto_real: "",
                data_secagem: "",
                observacoes: "",
            });
        } catch (error: any) {
            toast({
                title: "Erro ao registrar evento",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Registrar Evento Reprodutivo</DialogTitle>
                    <DialogDescription>
                        Adicione um novo evento de manejo reprodutivo ao sistema
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Animal *</Label>
                            <Select value={formData.animal_id} onValueChange={(value) => setFormData({ ...formData, animal_id: value })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o animal" />
                                </SelectTrigger>
                                <SelectContent>
                                    {animais.map((animal) => (
                                        <SelectItem key={animal.id} value={animal.id}>
                                            {animal.numero} - {animal.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Tipo de Evento *</Label>
                            <Select value={tipoEvento} onValueChange={setTipoEvento}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="inseminacao">Inseminação</SelectItem>
                                    <SelectItem value="diagnostico">Diagnóstico de Gestação</SelectItem>
                                    <SelectItem value="parto">Parto</SelectItem>
                                    <SelectItem value="secagem">Secagem</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Campos específicos por tipo de evento */}
                    {tipoEvento === "inseminacao" && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Data da Inseminação *</Label>
                                    <Input
                                        type="date"
                                        value={formData.data_inseminacao}
                                        onChange={(e) => setFormData({ ...formData, data_inseminacao: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Touro</Label>
                                    <Input
                                        value={formData.touro}
                                        onChange={(e) => setFormData({ ...formData, touro: e.target.value })}
                                        placeholder="Nome ou código do touro"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Técnico</Label>
                                    <Input
                                        value={formData.tecnico}
                                        onChange={(e) => setFormData({ ...formData, tecnico: e.target.value })}
                                        placeholder="Nome do técnico"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Protocolo</Label>
                                    <Input
                                        value={formData.protocolo}
                                        onChange={(e) => setFormData({ ...formData, protocolo: e.target.value })}
                                        placeholder="Ex: IATF, natural"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {tipoEvento === "diagnostico" && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Data do Diagnóstico *</Label>
                                <Input
                                    type="date"
                                    value={formData.data_diagnostico}
                                    onChange={(e) => setFormData({ ...formData, data_diagnostico: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Resultado *</Label>
                                <Select value={formData.resultado_diagnostico} onValueChange={(value) => setFormData({ ...formData, resultado_diagnostico: value })}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="prenhe">Prenhe</SelectItem>
                                        <SelectItem value="vazia">Vazia</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}

                    {tipoEvento === "parto" && (
                        <div className="space-y-2">
                            <Label>Data do Parto *</Label>
                            <Input
                                type="date"
                                value={formData.data_parto_real}
                                onChange={(e) => setFormData({ ...formData, data_parto_real: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    {tipoEvento === "secagem" && (
                        <div className="space-y-2">
                            <Label>Data da Secagem *</Label>
                            <Input
                                type="date"
                                value={formData.data_secagem}
                                onChange={(e) => setFormData({ ...formData, data_secagem: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Observações</Label>
                        <Textarea
                            value={formData.observacoes}
                            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                            placeholder="Informações adicionais..."
                            rows={3}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancelar
                        </Button>
                        <Button type="submit" disabled={loading || !formData.animal_id}>
                            {loading ? "Salvando..." : "Salvar Evento"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
