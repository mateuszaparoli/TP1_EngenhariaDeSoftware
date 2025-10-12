import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, BookOpen, Database, Users, TrendingUp, Star, Zap, ChevronDown, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        return "Search by paper title...";
      case "author":
        return "Search by author name...";
      case "event":
        return "Search by event name...";
      default:
        return "Search papers, authors, topics...";
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Sign In
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => navigate('/signin')}>
                  Sign in as User
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/admin/signin')}>
                  Sign in as Admin
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                Discover, Store & 
                <span className="bg-gradient-hero bg-clip-text text-transparent"> Research </span> 
                Scientific Papers
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Advanced search and intelligent storage for scientific papers. 
                Find breakthrough research, organize your library, and accelerate discovery.
              </p>
              
              {/* Enhanced Search Bar */}
              <form onSubmit={handleSearch} className="space-y-4 mb-8">
                <div className="flex gap-2">
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger className="w-40 h-12 shadow-card border-accent">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="author">Author</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
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
                    Search
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Search by {searchType === "title" ? "paper title" : searchType === "author" ? "author name" : "event name"} to find relevant research papers
                </p>
              </form>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-hero rounded-3xl blur-3xl opacity-30 animate-pulse"></div>
              <img 
                src={heroImage} 
                alt="Scientific research visualization" 
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
              &copy; 2025 ResearchHub. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;