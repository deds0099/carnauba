import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/date-utils";
import type { Database } from "@/integrations/supabase/types";

type Producao = Database["public"]["Tables"]["producao"]["Row"];

interface ProducaoChartProps {
  data: Producao[];
  tipo: "diario" | "semanal" | "mensal";
}

export function ProducaoChart({ data, tipo }: ProducaoChartProps) {
  const processarDados = () => {
    if (!data.length) return [];

    const dadosProcessados = data.reduce((acc: any[], item) => {
      const dataObj = new Date(item.data);
      let chave = "";

      switch (tipo) {
        case "diario":
          chave = item.data;
          break;
        case "semanal":
          const semana = getWeekNumber(dataObj);
          chave = `Semana ${semana}`;
          break;
        case "mensal":
          chave = `${dataObj.getMonth() + 1}/${dataObj.getFullYear()}`;
          break;
      }

      const existingData = acc.find((d) => d.data === chave);
      if (existingData) {
        existingData[item.periodo] = (existingData[item.periodo] || 0) + item.quantidade;
      } else {
        acc.push({
          data: chave,
          manha: item.periodo === "manha" ? item.quantidade : 0,
          tarde: item.periodo === "tarde" ? item.quantidade : 0,
          noite: item.periodo === "noite" ? item.quantidade : 0,
        });
      }

      return acc;
    }, []);

    return dadosProcessados.sort((a, b) => {
      if (tipo === "diario") {
        return new Date(a.data).getTime() - new Date(b.data).getTime();
      }
      return 0;
    });
  };

  const getWeekNumber = (date: Date) => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const dadosProcessados = processarDados();

  const formatarData = (data: string) => {
    if (tipo === "diario") {
      return formatDate(data);
    }
    return data;
  };

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dadosProcessados}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="data" 
            tickFormatter={formatarData}
          />
          <YAxis />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(1)}L`, "Quantidade"]}
            labelFormatter={formatarData}
          />
          <Bar dataKey="manha" name="Manhã" fill="#4CAF50" />
          <Bar dataKey="tarde" name="Tarde" fill="#2196F3" />
          <Bar dataKey="noite" name="Noite" fill="#9C27B0" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
