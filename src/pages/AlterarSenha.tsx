import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Key } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const passwordSchema = z.object({
    password: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
    confirmPassword: z.string().min(6, { message: "Senha deve ter pelo menos 6 caracteres" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

const AlterarSenha = () => {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const form = useForm<PasswordFormValues>({
        resolver: zodResolver(passwordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (data: PasswordFormValues) => {
        setIsLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (error) {
                throw error;
            }

            toast.success("Senha alterada com sucesso!");
            form.reset();

            // Redirecionar para o dashboard após sucesso
            setTimeout(() => {
                navigate("/");
            }, 1500);
        } catch (error: any) {
            console.error("Erro ao alterar senha:", error);
            toast.error(error.message || "Falha ao alterar senha. Tente novamente.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in pb-12">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Alterar Senha</h1>
                    <p className="text-muted-foreground mt-1">Digite sua nova senha abaixo</p>
                </div>

                <Card className="border-none bg-white/50 backdrop-blur-sm ring-1 ring-black/5 shadow-sm max-w-md">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Nova Senha</CardTitle>
                        <CardDescription>
                            Defina uma senha forte para proteger sua conta
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nova Senha</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="******"
                                                        type="password"
                                                        className="pl-10"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="confirmPassword"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Confirmar Nova Senha</FormLabel>
                                            <FormControl>
                                                <div className="relative">
                                                    <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                                    <Input
                                                        placeholder="******"
                                                        type="password"
                                                        className="pl-10"
                                                        {...field}
                                                    />
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => navigate("/")}
                                        disabled={isLoading}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isLoading}
                                        className="flex-1 bg-primary hover:bg-primary/90"
                                    >
                                        {isLoading ? "Alterando..." : "Alterar Senha"}
                                    </Button>
                                </div>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default AlterarSenha;
