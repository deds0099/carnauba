import React from "react";
import { Layout } from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Bell, Mail, MessageSquare } from "lucide-react";

const Configuracoes = () => {
    return (
        <Layout>
            <div className="space-y-6 animate-fade-in pb-12">
                <div>
                    <h1 className="text-3xl font-bold text-primary tracking-tight">Configurações</h1>
                    <p className="text-muted-foreground mt-1">Personalize suas preferências do sistema</p>
                </div>

                <Card className="border-none bg-white/50 backdrop-blur-sm ring-1 ring-black/5 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Notificações</CardTitle>
                        <CardDescription>Gerencie como você recebe alertas e atualizações</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Bell className="h-5 w-5 text-primary" />
                                <div>
                                    <Label htmlFor="notif-sistema" className="font-semibold">Notificações do Sistema</Label>
                                    <p className="text-sm text-muted-foreground">Alertas sobre próximos partos e quedas de produção</p>
                                </div>
                            </div>
                            <Switch id="notif-sistema" defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Mail className="h-5 w-5 text-primary" />
                                <div>
                                    <Label htmlFor="notif-email" className="font-semibold">Notificações por Email</Label>
                                    <p className="text-sm text-muted-foreground">Receba resumos semanais por email</p>
                                </div>
                            </div>
                            <Switch id="notif-email" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <MessageSquare className="h-5 w-5 text-primary" />
                                <div>
                                    <Label htmlFor="notif-sms" className="font-semibold">Notificações por SMS</Label>
                                    <p className="text-sm text-muted-foreground">Alertas urgentes via mensagem de texto</p>
                                </div>
                            </div>
                            <Switch id="notif-sms" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none bg-white/50 backdrop-blur-sm ring-1 ring-black/5 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-xl font-bold text-primary">Preferências</CardTitle>
                        <CardDescription>Configure a aparência e comportamento do sistema</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="modo-escuro" className="font-semibold">Modo Escuro</Label>
                                <p className="text-sm text-muted-foreground">Ative o tema escuro do sistema</p>
                            </div>
                            <Switch id="modo-escuro" />
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <Label htmlFor="auto-atualizar" className="font-semibold">Atualização Automática</Label>
                                <p className="text-sm text-muted-foreground">Recarregar dados automaticamente a cada 5 minutos</p>
                            </div>
                            <Switch id="auto-atualizar" defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
};

export default Configuracoes;
