import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, MapPin, FileText, BookOpen } from "lucide-react";
import { getEvents, getEditions, EventItem, EditionItem } from "@/lib/api";
import { toast } from "sonner";

export default function EventPage() {
  const { eventName } = useParams<{ eventName: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [editions, setEditions] = useState<EditionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEventData();
  }, [eventName]);

  async function loadEventData() {
    if (!eventName) return;
    
    setLoading(true);
    try {
      const [eventsData, editionsData] = await Promise.all([
        getEvents(),
        getEditions()
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

      // Filtrar edições deste evento
      const eventEditions = editionsData.filter(edition => 
        edition.event?.id === foundEvent.id
      );
      
      setEditions(eventEditions.sort((a, b) => b.year - a.year));
    } catch (err: any) {
      toast.error("Erro ao carregar dados do evento");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function getEditionSlug(edition: EditionItem) {
    return `${eventName}/${edition.year}`;
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
            <p className="mt-4 text-muted-foreground">Carregando informações do evento...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
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
              <h3 className="text-lg font-semibold mb-2">Evento não encontrado</h3>
              <p className="text-muted-foreground mb-4">
                O evento solicitado não pôde ser encontrado.
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
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">{event.name}</h1>
          {event.description && (
            <p className="text-muted-foreground text-lg">{event.description}</p>
          )}
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-4">Edições do Evento</h2>
          
          {editions.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma edição cadastrada para este evento ainda.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {editions.map((edition) => (
                <Card key={edition.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <Link to={`/${getEditionSlug(edition)}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        {edition.year}
                      </CardTitle>
                      {edition.location && (
                        <CardDescription className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {edition.location}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      {edition.start_date && edition.end_date && (
                        <p className="text-sm text-muted-foreground">
                          {new Date(edition.start_date).toLocaleDateString('pt-BR')} - {' '}
                          {new Date(edition.end_date).toLocaleDateString('pt-BR')}
                        </p>
                      )}
                      <p className="text-sm text-blue-600 mt-2">
                        Clique para ver os artigos →
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}