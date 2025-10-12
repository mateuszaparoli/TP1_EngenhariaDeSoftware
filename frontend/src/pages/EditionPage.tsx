import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, FileText, Users } from "lucide-react";
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
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Carregando...</div>
        </div>
      </div>
    );
  }

  if (!event || !edition) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Edição não encontrada</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(`/${eventName}`)} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para {event.name}
          </Button>
          
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {event.name} - {edition.year}
          </h1>
          
          <div className="flex flex-wrap gap-4 text-muted-foreground">
            {edition.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                {edition.location}
              </div>
            )}
            {edition.start_date && edition.end_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(edition.start_date).toLocaleDateString('pt-BR')} - {' '}
                {new Date(edition.end_date).toLocaleDateString('pt-BR')}
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Artigos Publicados</h2>
          
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
                <Card key={article.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-xl">{article.title}</CardTitle>
                    {article.authors && article.authors.length > 0 && (
                      <CardDescription className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>
                          {article.authors.map((author, index) => (
                            <span key={author.id}>
                              {index > 0 && ', '}
                              <Link 
                                to={`/authors/${author.name.toLowerCase().replace(/\s+/g, '-')}`}
                                className="text-blue-600 hover:underline"
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
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {article.abstract}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {article.pdf_url && (
                        <Button variant="outline" size="sm" asChild>
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