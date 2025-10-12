import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
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

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("");
  const articlesPerPage = 10;

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const articlesData = await getArticles();
      // Sort articles alphabetically by title
      const sortedArticles = articlesData.sort((a, b) => 
        a.title.localeCompare(b.title, 'pt-BR', { sensitivity: 'base' })
      );
      setArticles(sortedArticles);
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

  // Pagination calculations
  const totalPages = Math.ceil(articles.length / articlesPerPage);
  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = articles.slice(indexOfFirstArticle, indexOfLastArticle);

  // Reset to page 1 when articles change (e.g., after adding/deleting)
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [articles.length, currentPage, totalPages]);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is less than max
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Smart pagination logic
      const halfWay = Math.ceil(maxPagesToShow / 2);
      
      if (currentPage <= halfWay) {
        // Near the beginning
        for (let i = 1; i <= maxPagesToShow; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - halfWay + 1) {
        // Near the end
        for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // In the middle
        for (let i = currentPage - halfWay + 1; i <= currentPage + halfWay - 1; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  function handlePageJump(e: React.FormEvent) {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
      setPageInput("");
    } else {
      toast.error(`Por favor, insira um número entre 1 e ${totalPages}`);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Artigos</h2>
          <p className="text-muted-foreground">
            Gerencie os artigos cadastrados ({articles.length} {articles.length === 1 ? 'artigo' : 'artigos'})
          </p>
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
                <TableHead>Página Inicial</TableHead>
                <TableHead>Página Final</TableHead>
                <TableHead>PDF</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nenhum artigo cadastrado
                  </TableCell>
                </TableRow>
              ) : (
                currentArticles.map((article) => (
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
                      {article.pagina_inicial ?? "-"}
                    </TableCell>
                    <TableCell>
                      {article.pagina_final ?? "-"}
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

      {/* Pagination */}
      {!loading && articles.length > articlesPerPage && (
        <div className="flex flex-col items-center gap-4 mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              
              {getPageNumbers().map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentPage(page)}
                    isActive={currentPage === page}
                    className="cursor-pointer"
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              
              <PaginationItem>
                <PaginationNext
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>

          {/* Page Jump Input */}
          <form onSubmit={handlePageJump} className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Ir para página:</span>
            <Input
              type="number"
              min="1"
              max={totalPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder={`1-${totalPages}`}
              className="w-20 h-8"
            />
            <Button type="submit" size="sm" variant="outline">
              Ir
            </Button>
          </form>
        </div>
      )}

      <ArticleModal
        isOpen={modalOpen}
        onClose={closeModal}
        onSuccess={loadData}
        article={editingArticle}
      />
    </div>
  );
}
