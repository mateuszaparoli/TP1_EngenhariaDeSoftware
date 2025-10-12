import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, BookOpen, Calendar, Users, ExternalLink, Star, Filter } from "lucide-react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";

// Mock data for search results
const mockResults = [
  {
    id: 1,
    title: "Attention Is All You Need",
    authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit"],
    abstract: "Os modelos dominantes de transdução de sequência são baseados em redes neurais recorrentes ou convolucionais complexas que incluem um codificador e um decodificador. Os modelos com melhor desempenho também conectam o codificador e o decodificador através de um mecanismo de atenção.",
    year: 2017,
    journal: "arXiv preprint",
    citations: 78532,
    tags: ["Aprendizado de Máquina", "Processamento de Linguagem Natural", "Transformers"],
    arxivId: "1706.03762"
  },
  {
    id: 2,
    title: "BERT: Pre-training of Deep Bidirectional Transformers for Language Understanding",
    authors: ["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee", "Kristina Toutanova"],
    abstract: "Introduzimos um novo modelo de representação de linguagem chamado BERT, que significa Representações de Codificador Bidirecional de Transformers. Ao contrário de modelos recentes de representação de linguagem, o BERT é projetado para pré-treinar representações bidirecionais profundas.",
    year: 2018,
    journal: "arXiv preprint",
    citations: 65847,
    tags: ["Aprendizado de Máquina", "Processamento de Linguagem Natural", "Aprendizado Profundo"],
    arxivId: "1810.04805"
  },
  {
    id: 3,
    title: "Language Models are Few-Shot Learners",
    authors: ["Tom B. Brown", "Benjamin Mann", "Nick Ryder", "Melanie Subbiah"],
    abstract: "Trabalhos recentes demonstraram ganhos substanciais em muitas tarefas e benchmarks de PLN através do pré-treinamento em um grande corpus de texto seguido de ajuste fino em uma tarefa específica. Embora tipicamente agnóstico à tarefa na arquitetura, este método ainda requer conjuntos de dados de ajuste fino específicos da tarefa.",
    year: 2020,
    journal: "arXiv preprint", 
    citations: 45231,
    tags: ["Aprendizado de Máquina", "Processamento de Linguagem Natural", "GPT"],
    arxivId: "2005.14165"
  },
  {
    id: 4,
    title: "Deep Residual Learning for Image Recognition",
    authors: ["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"],
    abstract: "Redes neurais mais profundas são mais difíceis de treinar. Apresentamos uma estrutura de aprendizado residual para facilitar o treinamento de redes que são substancialmente mais profundas do que aquelas usadas anteriormente.",
    year: 2015,
    journal: "arXiv preprint",
    citations: 89342,
    tags: ["Visão Computacional", "Aprendizado Profundo", "ResNet"],
    arxivId: "1512.03385"
  },
  {
    id: 5,
    title: "Generative Adversarial Networks",
    authors: ["Ian J. Goodfellow", "Jean Pouget-Abadie", "Mehdi Mirza", "Bing Xu"],
    abstract: "Propomos uma nova estrutura para estimar modelos generativos através de um processo adversarial, no qual treinamos simultaneamente dois modelos: um modelo generativo G que captura a distribuição de dados, e um modelo discriminativo D que estima a probabilidade de que uma amostra veio dos dados de treinamento em vez de G.",
    year: 2014,
    journal: "arXiv preprint",
    citations: 67584,
    tags: ["Aprendizado de Máquina", "Modelos Generativos", "GANs"],
    arxivId: "1406.2661"
  }
];

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('relevance');
  const [filterYear, setFilterYear] = useState('all');
  
  const totalResults = 2847;
  const resultsPerPage = 10;
  const totalPages = Math.ceil(totalResults / resultsPerPage);

  const handleNewSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newQuery = formData.get('search') as string;
    navigate(`/search?q=${encodeURIComponent(newQuery)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-science">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <button 
              onClick={() => navigate('/')}
              className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent hover:opacity-80 transition-smooth"
            >
              ResearchHub
            </button>
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

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleNewSearch} className="flex gap-2 max-w-4xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                name="search"
                defaultValue={query}
                placeholder="Buscar artigos científicos..."
                className="pl-10 h-12 bg-background/50 backdrop-blur-sm border-border/50"
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="h-12 px-8">
              Buscar
            </Button>
          </form>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-background/50 backdrop-blur-sm border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Ordenar por</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevance">Relevância</SelectItem>
                      <SelectItem value="date">Data (mais recente)</SelectItem>
                      <SelectItem value="citations">Citações</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Ano</label>
                  <Select value={filterYear} onValueChange={setFilterYear}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os anos</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2020-2023">2020-2023</SelectItem>
                      <SelectItem value="2015-2020">2015-2020</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Categorias</label>
                  <div className="space-y-2">
                    {["Aprendizado de Máquina", "Visão Computacional", "Processamento de Linguagem Natural", "Aprendizado Profundo"].map((category) => (
                      <label key={category} className="flex items-center space-x-2 text-sm">
                        <input type="checkbox" className="rounded border-border" />
                        <span>{category}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {/* Results Header */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Cerca de <span className="font-semibold text-foreground">{totalResults.toLocaleString()}</span> resultados para "<span className="font-semibold text-foreground">{query}</span>"
              </p>
            </div>

            {/* Results List */}
            <div className="space-y-6">
              {mockResults.map((paper) => (
                <Card key={paper.id} className="bg-background/50 backdrop-blur-sm border-border/50 hover:bg-background/70 transition-smooth">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-semibold text-primary hover:text-primary/80 cursor-pointer leading-tight">
                        {paper.title}
                      </h3>
                      <Button variant="ghost" size="sm">
                        <Star className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {paper.authors.slice(0, 3).join(", ")}
                        {paper.authors.length > 3 && ` +${paper.authors.length - 3} mais`}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {paper.year}
                      </span>
                      <span>{paper.citations.toLocaleString()} citações</span>
                    </div>

                    <p className="text-muted-foreground mb-4 leading-relaxed">
                      {paper.abstract}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 flex-wrap">
                        {paper.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-1" />
                          arXiv
                        </Button>
                        <Button variant="research" size="sm">
                          Salvar na Biblioteca
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            <div className="mt-8 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious 
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                  
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1;
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchResults;