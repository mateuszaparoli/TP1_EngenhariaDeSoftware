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
import { getEditions, createArticle, updateArticle, EditionItem, ArticleItem, ArticlePayload } from "@/lib/api";
import { FileText } from "lucide-react";
import { toast } from "sonner";

interface ArticleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  article?: ArticleItem | null;
}

export default function ArticleModal({ isOpen, onClose, onSuccess, article }: ArticleModalProps) {
  const [editions, setEditions] = useState<EditionItem[]>([]);
  const [form, setForm] = useState<ArticlePayload>({
    title: "",
    abstract: "",
    pdf_url: "",
    edition_id: undefined,
    authors: [],
    bibtex: "",
  });
  const [authorsInput, setAuthorsInput] = useState("");
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingEditions, setLoadingEditions] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadEditions();
    }
  }, [isOpen]);

  useEffect(() => {
    if (article) {
      const authorNames = article.authors?.map(a => a.name) || [];
      setForm({
        title: article.title,
        abstract: article.abstract || "",
        pdf_url: article.pdf_url || "",
        edition_id: article.edition?.id,
        authors: authorNames,
        bibtex: article.bibtex || "",
      });
      setAuthorsInput(authorNames.join(", "));
      setPdfFile(null);
    } else {
      setForm({
        title: "",
        abstract: "",
        pdf_url: "",
        edition_id: undefined,
        authors: [],
        bibtex: "",
      });
      setAuthorsInput("");
      setPdfFile(null);
    }
  }, [article]);

  async function loadEditions() {
    setLoadingEditions(true);
    try {
      const editionsData = await getEditions();
      setEditions(editionsData);
    } catch (err: any) {
      toast.error("Erro ao carregar edições");
    } finally {
      setLoadingEditions(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!form.edition_id) {
      toast.error("Selecione uma edição");
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
        pdf_url: form.pdf_url,
        edition_id: form.edition_id,
        authors: authors,
        bibtex: form.bibtex,
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
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                required
                placeholder="Título do artigo"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="edition">Edição *</Label>
              <Select
                value={form.edition_id?.toString() || ""}
                onValueChange={(value) => setForm({ ...form, edition_id: value ? parseInt(value) : undefined })}
                disabled={loading || loadingEditions}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma edição" />
                </SelectTrigger>
                <SelectContent>
                  {editions.map((edition) => (
                    <SelectItem key={edition.id} value={edition.id!.toString()}>
                      {edition.event?.name} - {edition.year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="authors">Autores (separados por vírgula)</Label>
              <Input
                id="authors"
                placeholder="Ex: João Silva, Maria Santos"
                value={authorsInput}
                onChange={(e) => setAuthorsInput(e.target.value)}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="abstract">Resumo</Label>
              <Textarea
                id="abstract"
                placeholder="Resumo do artigo"
                rows={3}
                value={form.abstract}
                onChange={(e) => setForm({ ...form, abstract: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="pdf_url">URL do PDF (opcional)</Label>
              <Input
                id="pdf_url"
                type="url"
                placeholder="https://exemplo.com/artigo.pdf"
                value={form.pdf_url}
                onChange={(e) => setForm({ ...form, pdf_url: e.target.value })}
                disabled={loading}
              />
            </div>

            <div>
              <Label htmlFor="pdf_file">Upload de PDF (opcional)</Label>
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
                Você pode fornecer uma URL ou fazer upload de um arquivo PDF
              </p>
            </div>

            <div>
              <Label htmlFor="bibtex">BibTeX (opcional)</Label>
              <Textarea
                id="bibtex"
                placeholder="@article{...}"
                rows={3}
                value={form.bibtex}
                onChange={(e) => setForm({ ...form, bibtex: e.target.value })}
                disabled={loading}
              />
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