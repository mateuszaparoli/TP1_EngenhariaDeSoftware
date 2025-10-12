import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { createEvent, updateEvent, EventItem } from "@/lib/api";
import { toast } from "sonner";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event?: EventItem | null;
}

export default function EventModal({ isOpen, onClose, onSuccess, event }: EventModalProps) {
  const [form, setForm] = useState<EventItem>({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (event) {
      setForm({ ...event });
    } else {
      setForm({ name: "", description: "" });
    }
  }, [event]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (event && event.id) {
        await updateEvent(event.id, form);
        toast.success("Evento atualizado com sucesso!");
      } else {
        await createEvent(form);
        toast.success("Evento criado com sucesso!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar evento");
    } finally {
      setLoading(false);
    }
  }

  function handleClose() {
    if (!loading) {
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {event ? "Editar Evento" : "Criar Novo Evento"}
          </DialogTitle>
          <DialogDescription>
            {event 
              ? "Faça as alterações necessárias no evento." 
              : "Preencha os dados para criar um novo evento."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="name">Nome do Evento</Label>
              <Input
                id="name"
                required
                placeholder="Ex: Simpósio Brasileiro de Engenharia de Software"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                placeholder="Descrição do evento..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                disabled={loading}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Salvando..." : (event ? "Salvar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}