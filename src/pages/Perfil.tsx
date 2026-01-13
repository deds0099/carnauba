import React, { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Phone, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Perfil = () => {
    const [loading, setLoading] = useState(false);
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        telefone: "",
        cidade: ""
    });

    useEffect(() => {
        loadUserData();
    }, []);

    const loadUserData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            setUserData({
                name: user.user_metadata?.name || "",
                email: user.email || "",
                telefone: user.user_metadata?.telefone || "",
                cidade: user.user_metadata?.cidade || ""
            });
        } catch (error: any) {
            toast.error("Erro ao carregar dados: " + error.message);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.updateUser({
                data: {
                    name: userData.name,
                    telefone: userData.telefone,
                    cidade: userData.cidade
                }
            });

            if (error) throw error;

            toast.success("Dados atualizados com sucesso!");
        } catch (error: any) {
            toast.error("Erro ao salvar: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="space-y-6 animate-fade-in pb-12">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Meu Perfil</h1>
                    <p className="text-muted-foreground mt-1">Gerencie suas informações pessoais</p>
                </div>

                <Card className="border-none bg-white/50 backdrop-blur-sm ring-1 ring-black/5 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Informações Pessoais</CardTitle>
                        <CardDescription>Atualize seus dados cadastrais</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome Completo</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="nome"
                                        placeholder="Seu nome"
                                        className="pl-10"
                                        value={userData.name}
                                        onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="seu@email.com"
                                        className="pl-10"
                                        value={userData.email}
                                        disabled
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Email não pode ser alterado</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="telefone">Telefone</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="telefone"
                                        placeholder="(00) 00000-0000"
                                        className="pl-10"
                                        value={userData.telefone}
                                        onChange={(e) => setUserData({ ...userData, telefone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="cidade">Cidade</Label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        id="cidade"
                                        placeholder="Sua cidade"
                                        className="pl-10"
                                        value={userData.cidade}
                                        onChange={(e) => setUserData({ ...userData, cidade: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => loadUserData()}>Cancelar</Button>
                            <Button className="bg-primary hover:bg-primary/90" onClick={handleSave} disabled={loading}>
                                {loading ? "Salvando..." : "Salvar Alterações"}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default Perfil;
