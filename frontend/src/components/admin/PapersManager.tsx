import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Trash2, FileText } from "lucide-react";
import { getEditions, getArticles, createArticle, updateArticle, deleteArticle, EditionItem, ArticleItem, ArticlePayload } from "@/lib/api";
import { toast } from "sonner";

export default function PapersManager(): React.JSX.Element {
  const [editions, setEditions] = useState<EditionItem[]>([]);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState<ArticleItem | null>(null);
  const [form, setForm] = useState<ArticlePayload>({
    title: "",
    abstract: "",
    pdf_url: "",
    edition_id: undefined,
    authors: [],
    bibtex: "",
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [authorsInput, setAuthorsInput] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getArticles();
        // map backend shape to local Paper shape
        const mapped = data.map((a: any) => ({
          id: String(a.id),
          title: a.title,
          authors: a.authors.map((x: any) => x.name).join(', '),
          abstract: a.abstract || '',
          year: a.edition?.year || new Date().getFullYear(),
          event: a.edition?.event?.name || '',
          url: a.pdf_url || '',
        }));
        setPapers(mapped);
      } catch (err) {
        console.error('Failed to load papers', err);
      }
    })();
  }, []);

  const handleSavePaper = async () => {
    try {
      if (editingPaper) {
        // update
        await updateArticle(Number(editingPaper.id), {
          title: paperForm.title,
          abstract: paperForm.abstract,
          authors: paperForm.authors,
          event_name: paperForm.event,
          year: paperForm.year,
          pdf_url: paperForm.url,
        }, (paperForm as any).file);
        toast.success("Paper updated successfully");
      } else {
        await createArticle({
          title: paperForm.title,
          abstract: paperForm.abstract,
          authors: paperForm.authors,
          event_name: paperForm.event,
          year: paperForm.year,
          pdf_url: paperForm.url,
        }, (paperForm as any).file);
        toast.success("Paper created successfully");
      }
      // refresh list
      const data = await getArticles();
      const mapped = data.map((a: any) => ({
        id: String(a.id),
        title: a.title,
        authors: a.authors.map((x: any) => x.name).join(', '),
        abstract: a.abstract || '',
        year: a.edition?.year || new Date().getFullYear(),
        event: a.edition?.event?.name || '',
        url: a.pdf_url || '',
      }));
      setPapers(mapped);
      setIsDialogOpen(false);
      resetForm();
    } catch (err:any) {
      toast.error(err?.message || 'Error saving paper')
    }
  };

  const handleDeletePaper = async (id: string) => {
    try {
      await deleteArticle(Number(id));
      const data = await getArticles();
      const mapped = data.map((a: any) => ({
        id: String(a.id),
        title: a.title,
        authors: a.authors.map((x: any) => x.name).join(', '),
        abstract: a.abstract || '',
        year: a.edition?.year || new Date().getFullYear(),
        event: a.edition?.event?.name || '',
        url: a.pdf_url || '',
      }));
      setPapers(mapped);
      toast.success("Paper deleted successfully");
    } catch (err) {
      toast.error('Failed to delete paper');
    }
  };

  const openDialog = (paper?: Paper) => {
    if (paper) {
      setEditingPaper(paper);
      setPaperForm({
        title: paper.title,
        authors: paper.authors,
        abstract: paper.abstract,
        year: paper.year,
        event: paper.event,
        url: paper.url,
      });
    }
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingPaper(null);
    setPaperForm({
  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [editionsData, articlesData] = await Promise.all([getEditions(), getArticles()]);
      setEditions(editionsData);
      setArticles(articlesData);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar dados");
      toast.error("Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  function startCreate() {
    setEditing(null);
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

  function startEdit(article: ArticleItem) {
    setEditing(article);
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
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.edition_id) {
      setError("Selecione uma edição");
      toast.error("Selecione uma edição");
      return;
    }

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

      console.log('Submitting payload:', payload);

      if (editing && editing.id) {
        await updateArticle(editing.id, payload, pdfFile || undefined);
        toast.success("Artigo atualizado com sucesso!");
      } else {
        await createArticle(payload, pdfFile || undefined);
        toast.success("Artigo criado com sucesso!");
      }
      await loadData();
      startCreate();
    } catch (err: any) {
      setError(err.message || "Erro ao salvar artigo");
      toast.error(err.message || "Erro ao salvar artigo");
    }
  }

  async function onDelete(id?: number) {
    if (!id || !confirm("Tem certeza que deseja deletar este artigo?")) return;
    setError(null);
    try {
      await deleteArticle(id);
      await loadData();
      toast.success("Artigo deletado com sucesso!");
    } catch (err: any) {
      setError(err.message || "Erro ao deletar artigo");
      toast.error(err.message || "Erro ao deletar artigo");
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setPdfFile(e.target.files[0]);
    }
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gerenciar Artigos</h2>
        <Button onClick={startCreate}>Novo Artigo</Button>
      </div>

      <div className="mb-6 border p-4 rounded-lg">
        <h3 className="font-semibold mb-4">
          {editing ? "Editar Artigo" : "Criar Novo Artigo"}
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              required
              placeholder="Título do artigo"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="edition">Edição *</Label>
            <Select
              value={form.edition_id?.toString() || ""}
              onValueChange={(value) => setForm({ ...form, edition_id: value ? parseInt(value) : undefined })}
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
            />
          </div>

          <div>
            <Label htmlFor="abstract">Resumo</Label>
            <Textarea
              id="abstract"
              placeholder="Resumo do artigo"
              rows={4}
              value={form.abstract}
              onChange={(e) => setForm({ ...form, abstract: e.target.value })}
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
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              {editing ? "Salvar Alterações" : "Criar Artigo"}
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
        <h3 className="font-semibold mb-2">Lista de Artigos</h3>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Autores</TableHead>
                <TableHead>Edição</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    Nenhum artigo cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                articles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>
                      {article.authors && article.authors.length > 0
                        ? article.authors.map(a => a.name).join(", ")
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {article.edition
                        ? `${article.edition.event?.name} ${article.edition.year}`
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {article.pdf_url ? (
                        <a
                          href={article.pdf_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <FileText className="w-4 h-4" />
                          Ver PDF
                        </a>
                      ) : (
                        "-"
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(article)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(article.id)}
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
