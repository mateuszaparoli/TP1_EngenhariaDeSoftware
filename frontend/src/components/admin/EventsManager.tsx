import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getEvents, deleteEvent, EventItem } from "../../lib/api";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import EventModal from "./EventModal";

export default function EventsManager(): React.JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await getEvents();
      setEvents(data);
    } catch (e: any) {
      toast.error(e.message || "Erro ao carregar eventos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function openCreateModal() {
    setEditingEvent(null);
    setModalOpen(true);
  }

  function openEditModal(event: EventItem) {
    setEditingEvent(event);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingEvent(null);
  }

  async function onDelete(id?: number) {
    if (!id) return;
    if (!confirm("Confirma exclusão?")) return;
    try {
      await deleteEvent(id);
      await load();
      toast.success("Evento deletado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao deletar");
    }
  }

  function getEventSlug(event: EventItem) {
    return event.name.toLowerCase().replace(/\s+/g, '-');
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Eventos</h2>
          <p className="text-muted-foreground">Gerencie os eventos cadastrados</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Evento
        </Button>
      </div>

      <div>
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                    Nenhum evento cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                events.map((ev) => (
                  <TableRow key={ev.id}>
                    <TableCell className="font-medium">
                      <Link 
                        to={`/${getEventSlug(ev)}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {ev.name}
                      </Link>
                    </TableCell>
                    <TableCell>{ev.description}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(ev)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(ev.id)}
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

      <EventModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={load}
        event={editingEvent}
      />
    </div>
  );
}
