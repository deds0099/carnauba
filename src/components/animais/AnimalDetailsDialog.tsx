import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, Droplets, Syringe, Tag, Info, Activity, TrendingUp } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Animal = Database["public"]["Tables"]["animais"]["Row"];
type Producao = Database["public"]["Tables"]["producao"]["Row"];
type Reproducao = Database["public"]["Tables"]["reproducao"]["Row"];

interface AnimalDetailsDialogProps {
    animal: Animal | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AnimalDetailsDialog({ animal, open, onOpenChange }: AnimalDetailsDialogProps) {
    const [producaoData, setProducaoData] = useState<Producao[]>([]);
    const [reproducaoData, setReproducaoData] = useState<Reproducao[]>([]);
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (animal && open) {
            loadAnimalDetails();
        }
    }, [animal, open]);

    const loadAnimalDetails = async () => {
        if (!animal) return;

        setLoading(true);
        try {
            // Carregar dados de produção
            const { data: producao, error: producaoError } = await supabase
                .from("producao")
                .select("*")
                .eq("animal_id", animal.id)
                .order("data", { ascending: false })
                .limit(10);

            if (producaoError) throw producaoError;
            setProducaoData(producao || []);

            // Carregar dados de reprodução
            const { data: reproducao, error: reproducaoError } = await supabase
                .from("reproducao")
                .select("*")
                .eq("animal_id", animal.id)
                .order("data_evento", { ascending: false });

            if (reproducaoError) throw reproducaoError;
            setReproducaoData(reproducao || []);
        } catch (error: any) {
            toast({
                title: "Erro ao carregar detalhes",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    if (!animal) return null;

    const calcularIdade = () => {
        const hoje = new Date();
        const nascimento = new Date(animal.data_nascimento);
        let anos = hoje.getFullYear() - nascimento.getFullYear();
        const meses = hoje.getMonth() - nascimento.getMonth();

        if (meses < 0 || (meses === 0 && hoje.getDate() < nascimento.getDate())) {
            anos--;
        }

        return anos;
    };

    const calcularProducaoTotal = () => {
        return producaoData.reduce((acc, p) => acc + p.quantidade, 0);
    };

    const calcularMediaProducao = () => {
        if (producaoData.length === 0) return 0;
        return calcularProducaoTotal() / producaoData.length;
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto glass-dark border-white/10 text-white rounded-3xl p-0">
                <div className="p-8 bg-gradient-to-br from-primary to-[#1a3a2a] sticky top-0 z-10">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <DialogTitle className="text-3xl font-bold text-white flex items-center gap-3">
                                    {animal.nome}
                                    <Badge variant="outline" className="rounded-lg border-white/20 text-white font-bold bg-white/10">
                                        {animal.status}
                                    </Badge>
                                </DialogTitle>
                                <DialogDescription className="text-white/60 font-medium pt-2 flex items-center gap-2">
                                    <Tag size={16} />
                                    Número: {animal.numero} | {animal.sexo} | {animal.raca}
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                </div>

                <div className="p-8 bg-white text-foreground">
                    <Tabs defaultValue="geral" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 mb-6 bg-secondary/10">
                            <TabsTrigger value="geral" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                <Info className="mr-2 h-4 w-4" />
                                Informações Gerais
                            </TabsTrigger>
                            <TabsTrigger value="producao" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                <Droplets className="mr-2 h-4 w-4" />
                                Produção
                            </TabsTrigger>
                            <TabsTrigger value="reproducao" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                                <Calendar className="mr-2 h-4 w-4" />
                                Reprodução
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="geral" className="space-y-6">
                            <Card className="border-primary/10">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center gap-2">
                                        <Tag size={20} />
                                        Dados Cadastrais
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Nome</p>
                                        <p className="text-sm font-bold text-primary">{animal.nome}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Número</p>
                                        <p className="text-sm font-bold text-primary">{animal.numero}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Raça</p>
                                        <p className="text-sm font-bold text-primary">{animal.raca}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Sexo</p>
                                        <p className="text-sm font-bold text-primary">{animal.sexo}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Data de Nascimento</p>
                                        <p className="text-sm font-bold text-primary">
                                            {new Date(animal.data_nascimento).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Idade</p>
                                        <p className="text-sm font-bold text-primary">{calcularIdade()} anos</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Peso (kg)</p>
                                        <p className="text-sm font-bold text-primary">{animal.peso || 'Não informado'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-1">Status</p>
                                        <Badge variant="outline" className="border-primary/20 text-primary font-bold">
                                            {animal.status}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            {animal.observacoes && (
                                <Card className="border-primary/10">
                                    <CardHeader>
                                        <CardTitle className="text-primary flex items-center gap-2">
                                            <Info size={20} />
                                            Observações
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground">{animal.observacoes}</p>
                                    </CardContent>
                                </Card>
                            )}
                        </TabsContent>

                        <TabsContent value="producao" className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-primary/10">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs uppercase tracking-wider text-primary/60">Total Produzido</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black text-primary flex items-baseline gap-1">
                                            {calcularProducaoTotal().toFixed(1)}
                                            <span className="text-sm font-medium opacity-60">L</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-primary/10 bg-gradient-to-br from-secondary/5 to-secondary/10">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs uppercase tracking-wider text-primary/60">Média por Ordenha</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black text-primary flex items-baseline gap-1">
                                            {calcularMediaProducao().toFixed(1)}
                                            <span className="text-sm font-medium opacity-60">L</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="border-primary/10 bg-gradient-to-br from-primary/5 to-secondary/5">
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-xs uppercase tracking-wider text-primary/60">Registros</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-3xl font-black text-primary">
                                            {producaoData.length}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="border-primary/10">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center gap-2">
                                        <Activity size={20} />
                                        Histórico de Produção (Últimos 10 registros)
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <p className="text-center text-muted-foreground py-4">Carregando...</p>
                                    ) : producaoData.length > 0 ? (
                                        <div className="space-y-3">
                                            {producaoData.map((prod, index) => (
                                                <div key={prod.id || index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/5 border border-primary/5">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                            <Droplets className="h-5 w-5 text-primary" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-primary">
                                                                {new Date(prod.data).toLocaleDateString('pt-BR')}
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {prod.periodo || 'Período não especificado'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-lg font-black text-primary">{prod.quantidade.toFixed(1)} L</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">Nenhum registro de produção encontrado.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="reproducao" className="space-y-6">
                            <Card className="border-primary/10">
                                <CardHeader>
                                    <CardTitle className="text-primary flex items-center gap-2">
                                        <Calendar size={20} />
                                        Histórico Reprodutivo
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {loading ? (
                                        <p className="text-center text-muted-foreground py-4">Carregando...</p>
                                    ) : reproducaoData.length > 0 ? (
                                        <div className="space-y-3">
                                            {reproducaoData.map((repr, index) => (
                                                <div key={repr.id || index} className="p-4 rounded-lg bg-secondary/5 border border-primary/5">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <Badge variant="outline" className="border-primary/20 text-primary font-bold">
                                                            {repr.tipo_evento}
                                                        </Badge>
                                                        <p className="text-sm font-bold text-primary">
                                                            {new Date(repr.data_evento).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    </div>
                                                    {repr.data_prevista_parto && (
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Data prevista do parto: {new Date(repr.data_prevista_parto).toLocaleDateString('pt-BR')}
                                                        </p>
                                                    )}
                                                    {repr.observacoes && (
                                                        <p className="text-xs text-muted-foreground mt-2">
                                                            Obs: {repr.observacoes}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-muted-foreground py-8">Nenhum evento reprodutivo registrado.</p>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </DialogContent>
        </Dialog>
    );
}
