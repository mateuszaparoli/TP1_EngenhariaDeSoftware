import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEvents, createEvent, updateEvent, deleteEvent, EventItem } from "../../lib/api";
import { Plus, Edit, Trash2 } from "lucide-react";

export default function EventsManager(): React.JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<EventItem | null>(null);
  const [form, setForm] = useState<EventItem>({ name: "", sigla: "", promoter: "", description: "" });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (e: any) {
      setError(e.message || "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function startCreate() {
    setEditing(null);
    setForm({ name: "", sigla: "", promoter: "", description: "" });
  }

  function startEdit(ev: EventItem) {
    setEditing(ev);
    setForm({ ...ev });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      if (editing && editing.id) {
        await updateEvent(editing.id, form);
      } else {
        await createEvent(form);
      }
      await load();
      startCreate();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar");
    }
  }

  async function onDelete(id?: number) {
    if (!id) return;
    if (!confirm("Confirma exclusão?")) return;
    try {
      await deleteEvent(id);
      await load();
    } catch (err: any) {
      setError(err.message || "Erro ao deletar");
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Eventos</h2>
          <p className="text-muted-foreground">Gerencie os eventos cadastrados</p>
        </div>
        <Button onClick={startCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div className="mb-6">
        <form onSubmit={onSubmit} className="space-y-2">
          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="sigla">Sigla</Label>
            <Input
              id="sigla"
              value={form.sigla}
              onChange={(e) => setForm({ ...form, sigla: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="promoter">Entidade Promotora</Label>
            <Input
              id="promoter"
              value={form.promoter}
              onChange={(e) => setForm({ ...form, promoter: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div>
            <Button type="submit" className="btn">
              {editing ? "Salvar" : "Criar"}
            </Button>
          </div>
          {error && <div className="text-red-600 mt-2">{error}</div>}
        </form>
      </div>

      <div>
        <h3 className="font-semibold mb-2">Lista de Eventos</h3>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Sigla</TableHead>
                <TableHead>Promotora</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map((ev) => (
                <TableRow key={ev.id}>
                  <TableCell>{ev.name}</TableCell>
                  <TableCell>{ev.sigla}</TableCell>
                  <TableCell>{ev.promoter}</TableCell>
                  <TableCell className="text-right">
                    <Button onClick={() => startEdit(ev)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => onDelete(ev.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Event Dialog */}
      <Dialog open={!!editing} onOpenChange={() => setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar Evento" : "Criar Evento"}</DialogTitle>
            <DialogDescription>
              {editing ? "Atualize as informações do evento" : "Adicione um novo evento ao sistema"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Evento</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="sigla">Sigla</Label>
              <Input
                id="sigla"
                value={form.sigla}
                onChange={(e) => setForm({ ...form, sigla: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="promoter">Entidade Promotora</Label>
              <Input
                id="promoter"
                value={form.promoter}
                onChange={(e) => setForm({ ...form, promoter: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="btn-outline" onClick={() => setEditing(null)}>
              Cancelar
            </Button>
            <Button onClick={onSubmit}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
