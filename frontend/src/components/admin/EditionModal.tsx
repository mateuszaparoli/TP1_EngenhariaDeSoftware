import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEvents, createEdition, updateEdition, EventItem, EditionItem } from "@/lib/api";
import { toast } from "sonner";

interface EditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  edition?: EditionItem | null;
}

export default function EditionModal({ isOpen, onClose, onSuccess, edition }: EditionModalProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<EditionItem>({
    event_id: undefined,
    year: new Date().getFullYear(),
    location: "",
    start_date: "",
    end_date: "",
  });
  const [loading, setLoading] = useState(false);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEvents();
    }
  }, [isOpen]);

  useEffect(() => {
    if (edition) {
      setForm({
        event_id: edition.event?.id,
        year: edition.year,
        location: edition.location || "",
        start_date: edition.start_date || "",
        end_date: edition.end_date || "",
      });
    } else {
      setForm({
        event_id: undefined,
        year: new Date().getFullYear(),
        location: "",
        start_date: "",
        end_date: "",
      });
    }
  }, [edition]);

  async function loadEvents() {
    setLoadingEvents(true);
    try {
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (err: any) {
      toast.error("Erro ao carregar eventos");
    } finally {
      setLoadingEvents(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.event_id) {
      toast.error("Selecione um evento");
      return;
    }

    setLoading(true);
    
    try {
      const payload = {
        event_id: form.event_id,
        year: form.year,
        location: form.location || "",
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      };

      if (edition && edition.id) {
        await updateEdition(edition.id, payload);
        toast.success("Edição atualizada com sucesso!");
      } else {
        await createEdition(payload);
        toast.success("Edição criada com sucesso!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar edição");
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader className="border-b border-blue-100 pb-4">
          <DialogTitle className="text-2xl bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            {edition ? "Editar Edição" : "Criar Nova Edição"}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {edition 
              ? "Faça as alterações necessárias na edição." 
              : "Preencha os dados para criar uma nova edição de evento."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="event" className="text-slate-700 font-medium">Evento</Label>
              <Select
                value={form.event_id?.toString() || ""}
                onValueChange={(value) => setForm({ ...form, event_id: parseInt(value) })}
                disabled={loading || loadingEvents}
              >
                <SelectTrigger className="focus:ring-blue-500 focus:border-blue-500">
                  <SelectValue placeholder="Selecione um evento" />
                </SelectTrigger>
                <SelectContent>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id!.toString()}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="year" className="text-slate-700 font-medium">Ano</Label>
              <Input
                id="year"
                type="number"
                required
                placeholder="Ex: 2025"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 0 })}
                disabled={loading}
                className="focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <Label htmlFor="location" className="text-slate-700 font-medium">Local</Label>
              <Input
                id="location"
                placeholder="Ex: São Paulo, Brasil"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                disabled={loading}
                className="focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date" className="text-slate-700 font-medium">Data de Início</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  disabled={loading}
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="end_date" className="text-slate-700 font-medium">Data de Término</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  disabled={loading}
                  className="focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-blue-50 pt-4 mt-2">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading} className="hover:bg-slate-50">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || loadingEvents} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
              {loading ? "Salvando..." : (edition ? "Salvar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}