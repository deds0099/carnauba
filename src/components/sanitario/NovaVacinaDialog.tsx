import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Syringe, Users, User, CheckCircle2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface NovaVacinaDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

type ModoAplicacao = "individual" | "rebanho_completo" | "rebanho_exceto";

export function NovaVacinaDialog({ isOpen, onOpenChange, onSuccess }: NovaVacinaDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [animais, setAnimais] = useState<{ id: string; nome: string; numero: string }[]>([]);
    const [modoAplicacao, setModoAplicacao] = useState<ModoAplicacao>("rebanho_completo");

    // Form states
    const [nomeVacina, setNomeVacina] = useState("");
    const [dataAplicacao, setDataAplicacao] = useState(new Date().toISOString().split("T")[0]);
    const [lote, setLote] = useState("");
    const [dose, setDose] = useState("");
    const [responsavel, setResponsavel] = useState("");
    const [observacoes, setObservacoes] = useState("");
    const [proximaDose, setProximaDose] = useState("");

    // Selection states
    const [animaisSelecionados, setAnimaisSelecionados] = useState<string[]>([]);
    const [animaisExcluidos, setAnimaisExcluidos] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen) {
            carregarAnimais();
        } else {
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setNomeVacina("");
        setDataAplicacao(new Date().toISOString().split("T")[0]);
        setLote("");
        setDose("");
        setResponsavel("");
        setObservacoes("");
        setProximaDose("");
        setAnimaisSelecionados([]);
        setAnimaisExcluidos([]);
        setModoAplicacao("rebanho_completo");
    };

    const carregarAnimais = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("animais")
                .select("id, nome, numero")
                .eq("user_id", user.id)
                .order("nome");

            if (error) throw error;
            setAnimais(data || []);
        } catch (error) {
            toast({
                title: "Erro ao carregar animais",
                description: "Não foi possível buscar a lista de animais.",
                variant: "destructive",
            });
        }
    };

    const handleToggleAnimal = (id: string, isExclusionMode: boolean) => {
        if (isExclusionMode) {
            setAnimaisExcluidos(prev =>
                prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
            );
        } else {
            setAnimaisSelecionados(prev =>
                prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
            );
        }
    };

    const handleSubmit = async () => {
        if (!nomeVacina) {
            toast({ title: "Erro", description: "Informe o nome da vacina/medicamento.", variant: "destructive" });
            return;
        }
        if (!dataAplicacao) {
            toast({ title: "Erro", description: "Informe a data da aplicação.", variant: "destructive" });
            return;
        }

        let targetAnimaisIds: string[] = [];

        if (modoAplicacao === "rebanho_completo") {
            targetAnimaisIds = animais.map(a => a.id);
        } else if (modoAplicacao === "rebanho_exceto") {
            targetAnimaisIds = animais.filter(a => !animaisExcluidos.includes(a.id)).map(a => a.id);
        } else {
            if (animaisSelecionados.length === 0) {
                toast({ title: "Erro", description: "Selecione pelo menos um animal.", variant: "destructive" });
                return;
            }
            targetAnimaisIds = animaisSelecionados;
        }

        if (targetAnimaisIds.length === 0) {
            toast({ title: "Atenção", description: "Nenhum animal selecionado para aplicação.", variant: "warning" });
            return;
        }

        if (modoAplicacao === "rebanho_completo") {
            if (!confirm(`Tem certeza que deseja aplicar "${nomeVacina}" para TODO O REBANHO (${targetAnimaisIds.length} animais)?`)) {
                return;
            }
        }

        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");

            const records = targetAnimaisIds.map(animalId => ({
                user_id: user.id,
                animal_id: animalId,
                data_aplicacao: dataAplicacao,
                nome_vacina: nomeVacina,
                lote: lote || null,
                dose: dose || null,
                responsavel: responsavel || null,
                observacoes: observacoes || null,
                proxima_dose: proximaDose || null
            }));

            const { error } = await supabase
                .from("manejo_sanitario")
                .insert(records);

            if (error) throw error;

            toast({
                title: "Registro realizado com sucesso!",
                description: `${records.length} animais receberam o registro de ${nomeVacina}.`,
            });
            onSuccess();
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Erro ao salvar",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Syringe className="h-5 w-5 text-primary" />
                        Novo Registro Sanitário
                    </DialogTitle>
                    <DialogDescription>
                        Lance vacinas, vermífugos ou medicamentos para um ou múltiplos animais.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-6 py-4">
                    {/* Dados da Aplicação */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome da Vacina/Medicamento *</Label>
                            <Input
                                id="nome"
                                placeholder="Ex: Febre Aftosa, Ivermectina"
                                value={nomeVacina}
                                onChange={(e) => setNomeVacina(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="data">Data da Aplicação *</Label>
                            <Input
                                id="data"
                                type="date"
                                value={dataAplicacao}
                                onChange={(e) => setDataAplicacao(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lote">Lote / Fabricante</Label>
                            <Input
                                id="lote"
                                placeholder="Opcional"
                                value={lote}
                                onChange={(e) => setLote(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="dose">Dose (ml)</Label>
                            <Input
                                id="dose"
                                placeholder="Ex: 5ml"
                                value={dose}
                                onChange={(e) => setDose(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="responsavel">Responsável</Label>
                            <Input
                                id="responsavel"
                                placeholder="Quem aplicou?"
                                value={responsavel}
                                onChange={(e) => setResponsavel(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="proxima">Próxima Dose (Revacinação)</Label>
                            <Input
                                id="proxima"
                                type="date"
                                value={proximaDose}
                                onChange={(e) => setProximaDose(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="obs">Observações</Label>
                        <Textarea
                            id="obs"
                            placeholder="Detalhes adicionais..."
                            value={observacoes}
                            onChange={(e) => setObservacoes(e.target.value)}
                        />
                    </div>

                    {/* Seleção de Animais */}
                    <div className="space-y-4 border-t pt-4">
                        <div className="flex flex-col gap-2">
                            <Label className="text-base font-semibold">Seleção de Animais</Label>
                            <div className="flex gap-2 p-1 bg-muted rounded-lg">
                                <Button
                                    type="button"
                                    variant={modoAplicacao === "rebanho_completo" ? "default" : "ghost"}
                                    className="flex-1 text-sm"
                                    onClick={() => setModoAplicacao("rebanho_completo")}
                                >
                                    <Users className="mr-2 h-4 w-4" /> Todo Rebanho
                                </Button>
                                <Button
                                    type="button"
                                    variant={modoAplicacao === "rebanho_exceto" ? "default" : "ghost"}
                                    className="flex-1 text-sm"
                                    onClick={() => setModoAplicacao("rebanho_exceto")}
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" /> Exceto...
                                </Button>
                                <Button
                                    type="button"
                                    variant={modoAplicacao === "individual" ? "default" : "ghost"}
                                    className="flex-1 text-sm"
                                    onClick={() => setModoAplicacao("individual")}
                                >
                                    <User className="mr-2 h-4 w-4" /> Individual
                                </Button>
                            </div>
                        </div>

                        <div className="bg-muted/30 rounded-lg p-4">
                            {modoAplicacao === "rebanho_completo" && (
                                <div className="text-center py-4 text-muted-foreground">
                                    <p className="font-medium text-primary">Todos os {animais.length} animais do rebanho serão selecionados.</p>
                                    <p className="text-sm mt-1">Isso criará um registro individual para cada animal.</p>
                                </div>
                            )}

                            {modoAplicacao === "rebanho_exceto" && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium mb-2">Selecione quem NÃO vai receber (Excluídos: {animaisExcluidos.length})</p>
                                    <ScrollArea className="h-[200px] border rounded-md p-2 bg-white">
                                        {animais.map(animal => (
                                            <div key={animal.id} className="flex items-center space-x-2 py-2 border-b last:border-0 hover:bg-muted/50 px-2 rounded cursor-pointer" onClick={() => handleToggleAnimal(animal.id, true)}>
                                                <Checkbox
                                                    id={`exc-${animal.id}`}
                                                    checked={animaisExcluidos.includes(animal.id)}
                                                    onCheckedChange={() => handleToggleAnimal(animal.id, true)}
                                                />
                                                <label className="text-sm cursor-pointer flex-1">
                                                    <span className="font-bold">{animal.numero}</span> - {animal.nome}
                                                </label>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                            )}

                            {modoAplicacao === "individual" && (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium mb-2">Selecione quem vai receber (Selecionados: {animaisSelecionados.length})</p>
                                    <ScrollArea className="h-[200px] border rounded-md p-2 bg-white">
                                        {animais.map(animal => (
                                            <div key={animal.id} className="flex items-center space-x-2 py-2 border-b last:border-0 hover:bg-muted/50 px-2 rounded cursor-pointer" onClick={() => handleToggleAnimal(animal.id, false)}>
                                                <Checkbox
                                                    id={`sel-${animal.id}`}
                                                    checked={animaisSelecionados.includes(animal.id)}
                                                    onCheckedChange={() => handleToggleAnimal(animal.id, false)}
                                                />
                                                <label className="text-sm cursor-pointer flex-1">
                                                    <span className="font-bold">{animal.numero}</span> - {animal.nome}
                                                </label>
                                            </div>
                                        ))}
                                    </ScrollArea>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Salvar Registros
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
