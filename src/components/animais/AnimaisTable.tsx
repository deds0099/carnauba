import React, { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Trash2, MoreHorizontal } from "lucide-react";
import { formatDate } from "@/lib/date-utils";
import type { Database } from "@/integrations/supabase/types";

type Animal = Database["public"]["Tables"]["animais"]["Row"];

interface AnimaisTableProps {
  animais: Animal[];
  onEdit: (animal: Animal) => void;
  onDelete: (id: string) => void;
}

export function AnimaisTable({ animais, onEdit, onDelete }: AnimaisTableProps) {
  const [search, setSearch] = useState("");
  
  const filteredAnimais = animais.filter(animal => 
    animal.nome.toLowerCase().includes(search.toLowerCase()) || 
    animal.numero.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: Animal["status"]) => {
    switch (status) {
      case "lactante":
        return <Badge className="bg-farm-info">Lactante</Badge>;
      case "seca":
        return <Badge variant="outline">Seca</Badge>;
      case "prenhe":
        return <Badge className="bg-farm-success">Prenhe</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <Input
          placeholder="Buscar por nome ou número..."
          className="max-w-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Número</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Nascimento</TableHead>
              <TableHead>Raça</TableHead>
              <TableHead>Próximo Parto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAnimais.length > 0 ? (
              filteredAnimais.map((animal) => (
                <TableRow key={animal.id}>
                  <TableCell>{animal.numero}</TableCell>
                  <TableCell>{animal.nome}</TableCell>
                  <TableCell>{formatDate(animal.data_nascimento)}</TableCell>
                  <TableCell>{animal.raca}</TableCell>
                  <TableCell>{formatDate(animal.data_proximo_parto || "")}</TableCell>
                  <TableCell>{getStatusBadge(animal.status)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(animal)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDelete(animal.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                  Nenhum animal encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
