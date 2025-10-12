import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BookOpen, Database, Users, TrendingUp, Star, Zap, ChevronDown, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getEvents, EventItem } from "@/lib/api";
import heroImage from "@/assets/hero-research.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState("title");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    setLoadingEvents(true);
    try {
      const eventsData = await getEvents();
      setEvents(eventsData);
    } catch (err) {
      console.error("Erro ao carregar eventos:", err);
    } finally {
      setLoadingEvents(false);
    }
  }

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}&type=${searchType}`);
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
        return "Buscar artigos, autores, tópicos...";
    }
  };

  function getEventSlug(event: EventItem) {
    return event.name.toLowerCase().replace(/\s+/g, '-');
  }

  return (
    <div className="min-h-screen bg-gradient-science">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              ResearchHub
            </span>
          </div>
          <nav className="hidden md:flex items-center space-x-8">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/admin/signin')}
            >
              Registrar como Administrador
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
                Descubra, Armazene & 
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Pesquise </span> 
                Artigos Científicos
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Busca avançada e armazenamento inteligente para artigos científicos. 
                Encontre pesquisas revolucionárias, organize sua biblioteca e acelere descobertas.
              </p>
              
              {/* Enhanced Search Bar */}
              <form onSubmit={handleSearch} className="space-y-4 mb-8">
                <div className="flex gap-2">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-40 h-12 shadow-card border-accent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Título</SelectItem>
                      <SelectItem value="author">Autor</SelectItem>
                      <SelectItem value="event">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input 
                      name="search"
                      placeholder={getPlaceholder()}
                      className="pl-10 h-12 text-lg shadow-card border-accent"
                    />
                  </div>
                  <Button type="submit" variant="hero" size="lg" className="h-12 px-8">
                    <Search className="mr-2 h-5 w-5" />
                    Buscar
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Busque por {searchType === "title" ? "título do artigo" : searchType === "author" ? "nome do autor" : "nome do evento"} para encontrar artigos de pesquisa relevantes
                </p>
              </form>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
              <img 
                src={heroImage} 
                alt="Visualização de pesquisa científica" 
                className="relative rounded-3xl shadow-research w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-muted-foreground">
              &copy; 2025 ResearchHub. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;