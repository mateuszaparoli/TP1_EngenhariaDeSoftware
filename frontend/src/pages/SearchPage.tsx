import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, BookOpen, FileText, Users, Calendar, ArrowLeft, ExternalLink } from "lucide-react";
import { getArticles, ArticleItem } from "@/lib/api";
import { authorNameToSlug } from "@/lib/utils";
import { toast } from "sonner";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchType, setSearchType] = useState(searchParams.get('type') || 'title');

  useEffect(() => {
    performSearch();
  }, [searchParams]);

  const performSearch = async () => {
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'title';
    
    if (!query?.trim()) {
      setArticles([]);
      return;
    }

    setLoading(true);
    try {
      // Usar a API existente com parâmetros de filtro
      const url = new URL('/api/articles/', 'http://localhost:8000');
      
      switch (type) {
        case 'title':
          url.searchParams.set('title', query);
          break;
        case 'author':
          url.searchParams.set('author', query);
          break;
        case 'event':
          url.searchParams.set('event', query);
          break;
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Erro na pesquisa');
      }
      
      const results = await response.json();
      setArticles(results);
    } catch (error: any) {
      toast.error(`Erro ao pesquisar: ${error.message}`);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery, type: searchType });
    }
  };

  const getSearchTypeLabel = () => {
    switch (searchType) {
      case 'title': return 'título';
      case 'author': return 'autor';
      case 'event': return 'evento';
      default: return 'título';
    }
  };

  const getPlaceholder = () => {
    switch (searchType) {
      case "title":
        return "Buscar por título do artigo...";
      case "author":
        return "Buscar por nome do autor...";
      case "event":
        return "Buscar por nome do evento...";
      default:
        return "Buscar artigos...";
    }
  };

  const handleAuthorClick = (authorName: string) => {
    const slug = authorNameToSlug(authorName);
    navigate(`/authors/${slug}`);
  };

  const currentQuery = searchParams.get('q');
  const currentType = searchParams.get('type') || 'title';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Voltar ao Início
              </Button>
              <div className="flex items-center space-x-2">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ResearchHub</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Buscar Artigos de Pesquisa
            </CardTitle>
            <CardDescription>
              Encontre artigos por título, autor ou nome do evento
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex gap-2">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Título</SelectItem>
                    <SelectItem value="author">Autor</SelectItem>
                    <SelectItem value="event">Evento</SelectItem>
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input 
                    placeholder={getPlaceholder()}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Buscando...' : 'Buscar'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {currentQuery && (
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-2">Resultados da Busca</h2>
            <p className="text-muted-foreground">
              {loading ? (
                'Buscando...'
              ) : (
                `${articles.length} resultado(s) encontrado(s) para "${currentQuery}" em ${getSearchTypeLabel()}`
              )}
            </p>
          </div>
        )}

        {/* Articles List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Buscando artigos...</p>
            </div>
          ) : articles.length > 0 ? (
            articles.map((article) => (
              <Card key={article.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 leading-tight">
                        {article.title}
                      </h3>
                      
                      {/* Authors */}
                      {article.authors && article.authors.length > 0 && (
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div className="flex flex-wrap gap-1">
                            {article.authors.map((author, index) => (
                              <span key={author.id} className="text-sm">
                                <button
                                  onClick={() => handleAuthorClick(author.name)}
                                  className="text-primary hover:text-primary/80 hover:underline transition-colors"
                                >
                                  {author.name}
                                </button>
                                {index < article.authors.length - 1 && (
                                  <span className="text-muted-foreground">, </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Event and Year */}
                      {article.edition && (
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            {article.edition.event?.name} {article.edition.year}
                          </span>
                          {article.edition.location && (
                            <Badge variant="secondary" className="text-xs">
                              {article.edition.location}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Abstract */}
                    {article.abstract && (
                      <p className="text-muted-foreground text-sm leading-relaxed">
                        {article.abstract.length > 300 
                          ? `${article.abstract.substring(0, 300)}...`
                          : article.abstract
                        }
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-3 pt-2">
                      {article.pdf_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(article.pdf_url, '_blank')}
                          className="flex items-center gap-2"
                        >
                          <FileText className="h-4 w-4" />
                          Ver PDF
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                      
                      {article.created_at && (
                        <span className="text-xs text-muted-foreground">
                          Adicionado em {new Date(article.created_at).toLocaleDateString('pt-BR')}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : currentQuery && !loading ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum artigo encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Nenhum artigo corresponde à sua busca por "{currentQuery}" em {getSearchTypeLabel()}.
                </p>
                <p className="text-sm text-muted-foreground">
                  Tente ajustar seus termos de busca ou pesquisar em um campo diferente.
                </p>
              </CardContent>
            </Card>
          ) : !currentQuery ? (
            <Card>
              <CardContent className="text-center py-12">
                <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Inicie sua busca</h3>
                <p className="text-muted-foreground">
                  Digite um termo de busca acima para encontrar artigos de pesquisa por título, autor ou evento.
                </p>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}