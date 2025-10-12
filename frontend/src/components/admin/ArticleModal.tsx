import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getEditions, getEvents, createArticle, updateArticle, EditionItem, ArticleItem, ArticlePayload, EventItem } from "@/lib/api";
import { FileText } from "lucide-react";
import { toast } from "sonner";

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  article?: ArticleItem | null;
}

export default function ArticleModal({ isOpen, onClose, onSuccess, article }: ArticleModalProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [editions, setEditions] = useState<EditionItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>(undefined);
  const [form, setForm] = useState<ArticlePayload>({
    title: "",
    abstract: "",
    edition_id: undefined,
    authors: [],
  });
  const [authorsInput, setAuthorsInput] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEditions, setLoadingEditions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  useEffect(() => {
    if (article) {
      const authorNames = article.authors?.map(a => a.name) || [];
      setForm({
        title: article.title,
        abstract: article.abstract || "",
        edition_id: article.edition?.id,
        authors: authorNames,
      });
      setAuthorsInput(authorNames.join(", "));
      setPdfFile(null);
      // Set selected event when editing - only after events are loaded
      if (article.edition?.event?.id && events.length > 0) {
        setSelectedEventId(article.edition.event.id);
      }
    } else {
      setForm({
        title: "",
        abstract: "",
        edition_id: undefined,
        authors: [],
      });
      setAuthorsInput("");
      setPdfFile(null);
      setSelectedEventId(undefined);
    }
  }, [article, events]);

  async function loadData() {
    setLoadingEditions(true);
    try {
      const [eventsData, editionsData] = await Promise.all([getEvents(), getEditions()]);
      setEvents(eventsData);
      setEditions(editionsData);
    } catch (err: any) {
      console.error("Error loading modal data:", err);
      toast.error("Erro ao carregar dados");
    } finally {
      setLoadingEditions(false);
    }
  }

  // Filter editions by selected event
  const filteredEditions = selectedEventId 
    ? editions.filter(edition => edition.event?.id === selectedEventId)
    : [];

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.edition_id) {
      toast.error("Selecione uma edição");
      return;
    }

    if (!authorsInput.trim()) {
      toast.error("Informe pelo menos um autor");
      return;
    }

    // Only require PDF for new articles, not when editing
    if (!article && !pdfFile) {
      toast.error("Faça upload do arquivo PDF");
      return;
    }

    setLoading(true);
    
    try {
      const authors = authorsInput
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const payload: ArticlePayload = {
        title: form.title,
        abstract: form.abstract,
        edition_id: form.edition_id,
        authors: authors,
      };

      if (article && article.id) {
        await updateArticle(article.id, payload, pdfFile || undefined);
        toast.success("Artigo atualizado com sucesso!");
      } else {
        await createArticle(payload, pdfFile || undefined);
        toast.success("Artigo criado com sucesso!");
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar artigo");
    } finally {
      setLoading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  }

  function handleClose() {
    if (!loading) {
      onClose();
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {article ? "Editar Artigo" : "Criar Novo Artigo"}
          </DialogTitle>
          <DialogDescription>
            {article 
              ? "Faça as alterações necessárias no artigo." 
              : "Preencha os dados para criar um novo artigo."
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                placeholder="Título do artigo"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="event">Evento</Label>
              <Select
                value={selectedEventId?.toString() || ""}
                onValueChange={(value) => {
                  const eventId = value ? parseInt(value) : undefined;
                  setSelectedEventId(eventId);
                  // Reset edition selection when event changes
                  setForm({ ...form, edition_id: undefined });
                }}
                disabled={loading || loadingEditions}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um evento primeiro" />
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
              <Label htmlFor="edition">Edição</Label>
              <Select
                value={form.edition_id?.toString() || ""}
                onValueChange={(value) => setForm({ ...form, edition_id: value ? parseInt(value) : undefined })}
                disabled={loading || loadingEditions || !selectedEventId || filteredEditions.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedEventId 
                      ? "Selecione um evento primeiro" 
                      : filteredEditions.length === 0 
                        ? "Nenhuma edição encontrada para este evento"
                        : "Selecione uma edição"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {filteredEditions.map((edition) => (
                    <SelectItem key={edition.id} value={edition.id!.toString()}>
                      {edition.year} {edition.location && `- ${edition.location}`}
                      {edition.start_date && ` (${new Date(edition.start_date).toLocaleDateString('pt-BR')})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="authors">Autores</Label>
              <Input
                id="authors"
                placeholder="Ex: João Silva, Maria Santos (separados por vírgula)"
                value={authorsInput}
                onChange={(e) => setAuthorsInput(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Informe os nomes completos dos autores separados por vírgula
              </p>
            </div>

            <div>
              <Label htmlFor="abstract">Resumo</Label>
              <Textarea
                id="abstract"
                placeholder="Resumo do artigo (opcional)"
                rows={3}
                value={form.abstract}
                onChange={(e) => setForm({ ...form, abstract: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="pdf_file">Upload de PDF</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="pdf_file"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="flex-1"
                  disabled={loading}
                />
                {pdfFile && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    {pdfFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {article 
                  ? "Opcional: faça upload apenas se deseja atualizar o PDF" 
                  : "Faça upload do arquivo PDF do artigo"}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || loadingEditions}>
              {loading ? "Salvando..." : (article ? "Salvar" : "Criar")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}