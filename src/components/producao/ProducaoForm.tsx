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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { fixDateTimezone } from "@/lib/date-utils";

const producaoFormSchema = z.object({
  data: z.string().min(1, "Data é obrigatória"),
  animal_id: z.string().min(1, "Animal é obrigatório"),
  periodo: z.enum(["manha", "tarde", "noite"]),
  quantidade: z
    .string()
    .min(1, "Quantidade é obrigatória")
    .refine((val) => !isNaN(parseFloat(val)), {
      message: "Quantidade deve ser um número válido",
    }),
});

type ProducaoFormValues = z.infer<typeof producaoFormSchema>;

interface ProducaoFormProps {
  animais: Array<{ id: string; numero: string; nome: string }>;
  onSubmit: (data: ProducaoFormValues) => void;
}

export function ProducaoForm({ animais, onSubmit }: ProducaoFormProps) {
  const { toast } = useToast();
  
  const today = fixDateTimezone(new Date().toISOString().split("T")[0]);
  
  const form = useForm<ProducaoFormValues>({
    resolver: zodResolver(producaoFormSchema),
    defaultValues: {
      data: today,
      animal_id: "",
      periodo: "manha",
      quantidade: "",
    },
  });

  const handleSubmit = (values: ProducaoFormValues) => {
    const correctedValues = {
      ...values,
      data: fixDateTimezone(values.data),
    };
    
    onSubmit(correctedValues);
    toast({
      title: "Produção registrada com sucesso",
      description: `Foram registrados ${values.quantidade}L no período da ${values.periodo}.`,
    });
    form.reset({
      ...form.getValues(),
      quantidade: "",
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="data"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="animal_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Animal</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o animal" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {animais.map((animal) => (
                      <SelectItem key={animal.id} value={animal.id}>
                        {animal.numero} - {animal.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="periodo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Período</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o período" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="manha">Manhã</SelectItem>
                    <SelectItem value="tarde">Tarde</SelectItem>
                    <SelectItem value="noite">Noite</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="quantidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade (Litros)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Ex: 15.5" 
                    step="0.1" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="flex justify-end">
          <Button type="submit">Registrar Produção</Button>
        </div>
      </form>
    </Form>
  );
}
