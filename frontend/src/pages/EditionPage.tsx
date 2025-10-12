import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, FileText, Users, BookOpen } from "lucide-react";
import { getEvents, getEditions, getArticles, EventItem, EditionItem, ArticleItem } from "@/lib/api";
import { toast } from "sonner";

export default function EditionPage() {
  const { eventName, year } = useParams<{ eventName: string; year: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [edition, setEdition] = useState<EditionItem | null>(null);
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEditionData();
  }, [eventName, year]);

  async function loadEditionData() {
    if (!eventName || !year) return;
    
    setLoading(true);
    try {
      const [eventsData, editionsData, articlesData] = await Promise.all([
        getEvents(),
        getEditions(),
        getArticles()
      ]);

      // Encontrar o evento pelo nome (slug)
      const foundEvent = eventsData.find(e => 
        e.name.toLowerCase().replace(/\s+/g, '-') === eventName.toLowerCase()
      );

      if (!foundEvent) {
        toast.error("Evento não encontrado");
        navigate("/");
        return;
      }

      setEvent(foundEvent);

      // Encontrar a edição pelo ano e evento
      const foundEdition = editionsData.find(edition => 
        edition.event?.id === foundEvent.id && edition.year === parseInt(year)
      );

      if (!foundEdition) {
        toast.error("Edição não encontrada");
        navigate(`/${eventName}`);
        return;
      }

      setEdition(foundEdition);

      // Filtrar artigos desta edição
      const editionArticles = articlesData.filter(article => 
        article.edition?.id === foundEdition.id
      );
      
      setArticles(editionArticles.sort((a, b) => a.title.localeCompare(b.title)));
    } catch (err: any) {
      toast.error("Erro ao carregar dados da edição");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
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
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Carregando informações da edição...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event || !edition) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border bg-background sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
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
        </header>
        
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Edição não encontrada</h3>
              <p className="text-muted-foreground mb-4">
                A edição solicitada não pôde ser encontrada.
              </p>
              <Button onClick={() => navigate('/')}>
                Voltar ao Início
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      {/* Header */}
      <header className="border-b border-border bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/${eventName}`)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para {event.name}
            </Button>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ResearchHub</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 pb-6 border-b border-blue-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent mb-3">
            {event.name} - {edition.year}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-slate-600">
            {edition.location && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">{edition.location}</span>
              </div>
            )}
            {edition.start_date && edition.end_date && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {new Date(edition.start_date).toLocaleDateString('pt-BR')} - {' '}
                  {new Date(edition.end_date).toLocaleDateString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4 text-slate-800">Artigos Publicados</h2>
          
          {articles.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum artigo cadastrado para esta edição ainda.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {articles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg hover:border-blue-200 transition-all border-l-4 border-l-blue-500">
                  <CardHeader>
                    <CardTitle className="text-xl text-slate-800">{article.title}</CardTitle>
                    {article.authors && article.authors.length > 0 && (
                      <CardDescription className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span>
                          {article.authors.map((author, index) => (
                            <span key={author.id}>
                              {index > 0 && ', '}
                              <Link 
                                to={`/authors/${author.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors"
                              >
                                {author.name}
                              </Link>
                            </span>
                          ))}
                        </span>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {article.abstract && (
                      <p className="text-slate-600 mb-4 line-clamp-3">
                        {article.abstract}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {article.pdf_url && (
                        <Button variant="outline" size="sm" asChild className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300">
                          <a 
                            href={article.pdf_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2"
                          >
                            <FileText className="w-4 h-4" />
                            Ver PDF
                          </a>
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}