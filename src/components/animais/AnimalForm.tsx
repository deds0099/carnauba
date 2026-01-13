import React from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { fixDateTimezone } from "@/lib/date-utils";

const animalFormSchema = z.object({
  numero: z.string().min(1, "Número é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  data_nascimento: z.string().min(1, "Data de nascimento é obrigatória"),
  raca: z.string().min(1, "Raça é obrigatória"),
  data_proximo_parto: z.string().optional(),
  status: z.enum(["lactante", "seca", "prenhe"]),
});

type AnimalFormValues = z.infer<typeof animalFormSchema>;

interface AnimalFormProps {
  defaultValues?: Partial<AnimalFormValues>;
  onSubmit: (data: AnimalFormValues) => void;
}

export function AnimalForm({ defaultValues, onSubmit }: AnimalFormProps) {
  const { toast } = useToast();
  
  const form = useForm<AnimalFormValues>({
    resolver: zodResolver(animalFormSchema),
    defaultValues: defaultValues || {
      numero: "",
      nome: "",
      data_nascimento: "",
      raca: "",
      data_proximo_parto: "",
      status: "lactante",
    },
  });

  const handleSubmit = (values: AnimalFormValues) => {
    // Corrigir o problema do timezone nas datas antes de enviar
    const correctedValues = {
      ...values,
      data_nascimento: fixDateTimezone(values.data_nascimento),
      data_proximo_parto: values.data_proximo_parto ? fixDateTimezone(values.data_proximo_parto) : "",
    };
    
    onSubmit(correctedValues);
    toast({
      title: "Animal cadastrado com sucesso",
      description: `O animal ${values.nome} foi salvo no sistema.`,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="numero"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número (ID)</FormLabel>
                <FormControl>
                  <Input placeholder="Número de identificação" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="Nome do animal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="data_nascimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="raca"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raça</FormLabel>
                <FormControl>
                  <Input placeholder="Raça do animal" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="data_proximo_parto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data do Próximo Parto</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="lactante">Lactante</SelectItem>
                    <SelectItem value="seca">Seca</SelectItem>
                    <SelectItem value="prenhe">Prenhe</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit">Salvar Animal</Button>
        </div>
      </form>
    </Form>
  );
}
