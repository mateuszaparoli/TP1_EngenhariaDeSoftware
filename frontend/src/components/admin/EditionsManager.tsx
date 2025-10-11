import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2 } from "lucide-react";
import { getEvents, getEditions, createEdition, updateEdition, deleteEdition, EventItem, EditionItem } from "@/lib/api";

export default function EditionsManager(): React.JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editions, setEditions] = useState<EditionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<EditionItem | null>(null);
  const [form, setForm] = useState<EditionItem>({
    event_id: undefined,
    year: new Date().getFullYear(),
    location: "",
    start_date: "",
    end_date: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [eventsData, editionsData] = await Promise.all([getEvents(), getEditions()]);
      setEvents(eventsData);
      setEditions(editionsData);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setEditing(null);
    setForm({
      event_id: undefined,
      year: new Date().getFullYear(),
      location: "",
      start_date: "",
      end_date: "",
    });
  }

  function startEdit(edition: EditionItem) {
    setEditing(edition);
    setForm({
      event_id: edition.event?.id,
      year: edition.year,
      location: edition.location || "",
      start_date: edition.start_date || "",
      end_date: edition.end_date || "",
    });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.event_id) {
      setError("Selecione um evento");
      return;
    }

    try {
      const payload = {
        event_id: form.event_id,
        year: form.year,
        location: form.location || "",
        start_date: form.start_date || undefined,
        end_date: form.end_date || undefined,
      };

      if (editing && editing.id) {
        await updateEdition(editing.id, payload);
      } else {
        await createEdition(payload);
      }
      await loadData();
      startCreate();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar edição");
    }
  }

  async function onDelete(id?: number) {
    if (!id || !confirm("Tem certeza que deseja deletar esta edição?")) return;
    setError(null);
    try {
      await deleteEdition(id);
      await loadData();
    } catch (err: any) {
      setError(err.message || "Erro ao deletar edição");
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar Edições de Eventos</h2>
        <Button onClick={startCreate}>Nova Edição</Button>
      </div>

      <div className="mb-6 border p-4 rounded-lg">
        <h3 className="font-semibold mb-4">
          {editing ? "Editar Edição" : "Criar Nova Edição"}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="event">Evento *</Label>
            <Select
              value={form.event_id?.toString()}
              onValueChange={(value) => setForm({ ...form, event_id: parseInt(value) })}
            >
              <SelectTrigger>
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
            <Label htmlFor="year">Ano *</Label>
            <Input
              id="year"
              type="number"
              required
              placeholder="Ex: 2025"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label htmlFor="location">Local</Label>
            <Input
              id="location"
              placeholder="Ex: São Paulo, Brasil"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_date">Data de Início</Label>
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="end_date">Data de Término</Label>
              <Input
                id="end_date"
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              {editing ? "Salvar Alterações" : "Criar Edição"}
            </Button>
            {editing && (
              <Button type="button" variant="outline" onClick={startCreate}>
                Cancelar
              </Button>
            )}
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
        </form>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Lista de Edições</h3>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Evento</TableHead>
                <TableHead>Ano</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Data de Término</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {editions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhuma edição cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                editions.map((edition) => (
                  <TableRow key={edition.id}>
                    <TableCell className="font-medium">{edition.event?.name}</TableCell>
                    <TableCell>{edition.year}</TableCell>
                    <TableCell>{edition.location || "-"}</TableCell>
                    <TableCell>{edition.start_date || "-"}</TableCell>
                    <TableCell>{edition.end_date || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(edition)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(edition.id)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}