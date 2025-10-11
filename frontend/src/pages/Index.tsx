import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, BookOpen, Database, Users, TrendingUp, Star, Zap, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import heroImage from "@/assets/hero-research.jpg";

const Index = () => {
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

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
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-smooth">
              Features
            </a>
            {/* <a href="#about" className="text-muted-foreground hover:text-foreground transition-smooth">
              About
            </a> */}
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
                Advanced search and intelligent storage for millions of scientific papers. 
                Find breakthrough research, organize your library, and accelerate discovery.
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex gap-2 mb-8">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input 
                    name="search"
                    placeholder="Search papers, authors, topics..." 
                    className="pl-10 h-12 text-lg shadow-card border-accent"
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="h-12 px-8">
                  <Search className="mr-2 h-5 w-5" />
                  Search
                </Button>
              </form>

              <div className="flex gap-4">
                <Button variant="research" size="lg">
                  <Database className="mr-2 h-5 w-5" />
                  Browse Library
                </Button>
                <Button variant="outline" size="lg">
                  Learn More
                </Button>
              </div>
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

      {/* Statistics */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">2.5M+</div>
              <div className="text-muted-foreground">Research Papers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">150K+</div>
              <div className="text-muted-foreground">Active Researchers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">50+</div>
              <div className="text-muted-foreground">Research Fields</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-gradient-science">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Powerful Research Tools
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to discover, organize, and analyze scientific literature
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="shadow-card hover:shadow-research transition-smooth border-accent/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-feature rounded-lg flex items-center justify-center mb-4">
                  <Search className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Advanced Search</h3>
                <p className="text-muted-foreground">
                  AI-powered search across millions of papers with semantic understanding and contextual relevance.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-research transition-smooth border-accent/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-feature rounded-lg flex items-center justify-center mb-4">
                  <Database className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Storage</h3>
                <p className="text-muted-foreground">
                  Organize your research library with intelligent tagging, collections, and cross-references.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-research transition-smooth border-accent/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-feature rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Analytics</h3>
                <p className="text-muted-foreground">
                  Track research trends, citation networks, and discover emerging topics in your field.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-research transition-smooth border-accent/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-feature rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Collaboration</h3>
                <p className="text-muted-foreground">
                  Share collections, annotate papers, and collaborate with researchers worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-research transition-smooth border-accent/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-feature rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Recommendations</h3>
                <p className="text-muted-foreground">
                  Get personalized paper recommendations based on your research interests and history.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-card hover:shadow-research transition-smooth border-accent/50">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-gradient-feature rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-accent-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Fast Access</h3>
                <p className="text-muted-foreground">
                  Lightning-fast search results and paper access with advanced caching and CDN delivery.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}{/*
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Accelerate Your Research?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of researchers who trust ResearchHub to find, organize, and analyze scientific literature.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="lg" className="text-lg px-8 py-6">
                Start Free Trial
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Schedule Demo
              </Button>
            </div>
          </div>
        </div>
      </section>*/}

      {/* Footer */}{/*
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">ResearchHub</span>
              </div>
              <p className="text-muted-foreground">
                The future of scientific research discovery and organization.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Features</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">About</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Careers</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-smooth">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Help Center</a></li>
                <li><a href="#" className="hover:text-foreground transition-smooth">Blog</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 ResearchHub. All rights reserved.</p>
          </div>
        </div>
      </footer>*/}
    </div>
  );
};

export default Index;