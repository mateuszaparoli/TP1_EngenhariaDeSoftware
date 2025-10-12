import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, FileText, Plus } from "lucide-react";
import { getArticles, deleteArticle, ArticleItem } from "@/lib/api";
import { toast } from "sonner";
import ArticleModal from "./ArticleModal";

export default function PapersManager(): React.JSX.Element {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleItem | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const articlesData = await getArticles();
      setArticles(articlesData);
    } catch (err: any) {
      toast.error(err.message || "Erro ao carregar dados");
    } finally {
      setLoading(false);
    }
  }

  function openCreateModal() {
    setEditingArticle(null);
    setModalOpen(true);
  }

  function openEditModal(article: ArticleItem) {
    setEditingArticle(article);
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingArticle(null);
  }

  async function onDelete(id?: number) {
    if (!id || !confirm("Tem certeza que deseja deletar este artigo?")) return;
    try {
      await deleteArticle(id);
      await loadData();
      toast.success("Artigo deletado com sucesso!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao deletar artigo");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Artigos</h2>
          <p className="text-muted-foreground">Gerencie os artigos cadastrados</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Artigo
        </Button>
      </div>

      <div>
        {loading ? (
          <div className="text-center py-8">Carregando...</div>
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
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
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
                          onClick={() => openEditModal(article)}
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

      <ArticleModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={loadData}
        article={editingArticle}
      />
    </div>
  );
}
