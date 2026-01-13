import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, Database, Edit, Trash2, Tag, Info } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { AnimalForm } from "@/components/animais/AnimalForm";
import { AnimalDetailsDialog } from "@/components/animais/AnimalDetailsDialog";
import { supabase } from "@/integrations/supabase/client";
import type { Database as DB } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

type Animal = DB["public"]["Tables"]["animais"]["Row"];

export default function Animais() {
  const [animais, setAnimais] = useState<Animal[]>([]);
  const [busca, setBusca] = useState("");
  const [animalEmEdicao, setAnimalEmEdicao] = useState<Animal | undefined>(undefined);
  const [animalSelecionado, setAnimalSelecionado] = useState<Animal | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    carregarAnimais();
  }, []);

  const carregarAnimais = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("animais")
        .select("*")
        .eq("user_id", user.id)
        .order("nome");

      if (error) throw error;
      setAnimais(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar animais",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSaveAnimal = async (dados: any) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      if (animalEmEdicao) {
        const { error } = await supabase
          .from("animais")
          .update({ ...dados, user_id: user.id })
          .eq("id", animalEmEdicao.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("animais")
          .insert([{ ...dados, user_id: user.id }]);
        if (error) throw error;
      }

      toast({
        title: animalEmEdicao ? "Animal atualizado" : "Animal cadastrado",
        description: "As informações foram salvas com sucesso.",
      });
      setIsDialogOpen(false);
      setAnimalEmEdicao(undefined);
      carregarAnimais();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar animal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteAnimal = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este animal?")) return;

    try {
      const { error } = await supabase
        .from("animais")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast({
        title: "Animal excluído",
        description: "O registro foi removido com sucesso.",
      });
      carregarAnimais();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir animal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const animaisFiltrados = animais.filter(a =>
    a.nome.toLowerCase().includes(busca.toLowerCase()) ||
    a.numero.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <PageHeader title="Gestão do Rebanho">
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setAnimalEmEdicao(undefined);
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 font-bold px-6">
              <Plus className="mr-2 h-4 w-4" /> Novo Animal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl glass-dark border-white/10 text-white rounded-3xl overflow-hidden p-0">
            <div className="p-8 bg-gradient-to-br from-primary to-[#1a3a2a]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white">
                  {animalEmEdicao ? "Editar Informações" : "Cadastrar Novo Animal"}
                </DialogTitle>
                <DialogDescription className="text-white/60 font-medium pt-1">
                  Preencha os dados técnicos do animal abaixo.
                </DialogDescription>
              </DialogHeader>
            </div>
            <div className="p-8 bg-white text-foreground">
              <AnimalForm
                defaultValues={animalEmEdicao}
                onSubmit={handleSaveAnimal}
              />
            </div>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass p-4 rounded-2xl ring-1 ring-black/5">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou número..."
            className="pl-10 rounded-xl bg-white/50 border-none ring-1 ring-black/5 focus:ring-primary/20 transition-all"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none rounded-xl glass border-primary/10 text-primary font-bold">
            <Filter className="mr-2 h-4 w-4" /> Filtros
          </Button>
          <Badge variant="secondary" className="hidden sm:flex rounded-xl px-4 font-bold border-primary/10 text-primary">
            {animaisFiltrados.length} Animais
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {animaisFiltrados.map((animal) => (
          <Card key={animal.id} className="card-hover border-none bg-white glass ring-1 ring-black/5 overflow-hidden group">
            <div className="h-2 bg-gradient-to-r from-primary to-secondary/50" />
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold text-primary group-hover:text-primary/80 transition-colors">
                  {animal.nome}
                </CardTitle>
                <CardDescription className="flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-primary/40">
                  <Tag size={12} /> {animal.numero}
                </CardDescription>
              </div>
              <Badge variant="outline" className="rounded-lg border-primary/10 text-primary font-bold bg-primary/5">
                {animal.status}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Raça</p>
                    <p className="text-sm font-bold text-primary/80">{animal.raca}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Idade</p>
                    <p className="text-sm font-bold text-primary/80">
                      {new Date().getFullYear() - new Date(animal.data_nascimento).getFullYear()} anos
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-black/5">
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-primary/40 hover:text-primary hover:bg-primary/5"
                      onClick={() => {
                        setAnimalEmEdicao(animal);
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit size={16} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                      onClick={() => handleDeleteAnimal(animal.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[10px] font-bold uppercase tracking-wider text-primary hover:bg-primary/5"
                    onClick={() => {
                      setAnimalSelecionado(animal);
                      setIsDetailsDialogOpen(true);
                    }}
                  >
                    Detalhes <Info size={12} className="ml-1" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnimalDetailsDialog
        animal={animalSelecionado}
        open={isDetailsDialogOpen}
        onOpenChange={setIsDetailsDialogOpen}
      />
    </div>
  );
}
