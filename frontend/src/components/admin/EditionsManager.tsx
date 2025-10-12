import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, ExternalLink, Plus } from "lucide-react";
import { getEvents, getEditions, deleteEdition, EventItem, EditionItem } from "@/lib/api";
import { toast } from "sonner";
import EditionModal from "./EditionModal";

export default function EditionsManager(): React.JSX.Element {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editions, setEditions] = useState<EditionItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEdition, setEditingEdition] = useState<EditionItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [eventsData, editionsData] = await Promise.all([getEvents(), getEditions()]);
      setEvents(eventsData);
      setEditions(editionsData);
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingEdition(null);
    setModalOpen(true);
  }

  function openEditModal(edition: EditionItem) {
    setEditingEdition(edition);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingEdition(null);
  }

  async function onDelete(id?: number) {
    if (!id || !confirm("Tem certeza que deseja deletar esta edição?")) return;
    try {
      await deleteEdition(id);
      await loadData();
      toast.success("Edição deletada com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao deletar edição");
    }
  }

  function getEditionSlug(edition: EditionItem) {
    if (!edition.event) return '#';
    const eventSlug = edition.event.name.toLowerCase().replace(/\s+/g, '-');
    return `/${eventSlug}/${edition.year}`;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Edições de Eventos</h2>
          <p className="text-muted-foreground">Gerencie as edições dos eventos cadastrados</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Edição
        </Button>
      </div>

      <div>
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
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
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    Nenhuma edição cadastrada
                  </TableCell>
                </TableRow>
              ) : (
                editions.map((edition) => (
                  <TableRow key={edition.id}>
                    <TableCell className="font-medium">
                      <Link 
                        to={getEditionSlug(edition)}
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-2"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {edition.event?.name} - {edition.year}
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </TableCell>
                    <TableCell>{edition.year}</TableCell>
                    <TableCell>{edition.location || "-"}</TableCell>
                    <TableCell>{edition.start_date || "-"}</TableCell>
                    <TableCell>{edition.end_date || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(edition)}
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

      <EditionModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={loadData}
        edition={editingEdition}
      />
    </div>
  );
}