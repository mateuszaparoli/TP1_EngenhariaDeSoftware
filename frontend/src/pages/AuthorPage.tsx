import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, User, Calendar, FileText, ArrowLeft, ExternalLink, Mail } from "lucide-react";
import { getAuthorByName, AuthorPageData } from "@/lib/api";
import { authorNameToSlug } from "@/lib/utils";
import { toast } from "sonner";

export default function AuthorPage() {
  const { authorName } = useParams<{ authorName: string }>();
  const navigate = useNavigate();
  const [authorData, setAuthorData] = useState<AuthorPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authorName) {
      loadAuthorData();
    }
  }, [authorName]);

  const loadAuthorData = async () => {
    if (!authorName) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await getAuthorByName(authorName);
      setAuthorData(data);
    } catch (err: any) {
      setError(err.message || "Autor não encontrado");
      toast.error(`Erro ao carregar dados do autor: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorClick = (authorName: string) => {
    const slug = authorNameToSlug(authorName);
    navigate(`/authors/${slug}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
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
                Back to Home
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
            <p className="mt-4 text-muted-foreground">Loading author information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !authorData) {
    return (
      <div className="min-h-screen bg-background">
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
                Back to Home
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
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Author not found</h3>
              <p className="text-muted-foreground mb-4">
                The author "{authorName?.replace('-', ' ')}" could not be found.
              </p>
              <Button onClick={() => navigate('/')}>
                Return to Home
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
              Back to Home
            </Button>
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ResearchHub</span>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Author Header */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-3xl flex items-center gap-3">
                    <User className="h-8 w-8 text-primary" />
                    {authorData.author.name}
                  </CardTitle>
                  <CardDescription className="text-lg">
                    Research Publications
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="text-sm">
                    {authorData.total_articles} article{authorData.total_articles !== 1 ? 's' : ''}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            {authorData.author.email && (
              <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{authorData.author.email}</span>
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Publications by Year */}
        {authorData.total_articles === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No publications found</h3>
              <p className="text-muted-foreground">
                This author doesn't have any published articles yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Publications</h2>
              <p className="text-muted-foreground">
                Organized by year, most recent first
              </p>
            </div>

            {authorData.years.map((year) => (
              <div key={year} className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-semibold">{year}</h3>
                  <Badge variant="outline">
                    {authorData.articles_by_year[year].length} article{authorData.articles_by_year[year].length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="space-y-4 ml-8">
                  {authorData.articles_by_year[year].map((article) => (
                    <Card key={article.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div>
                            <h4 className="text-lg font-semibold leading-tight mb-2">
                              {article.title}
                            </h4>
                            
                            {/* Event and Location */}
                            {article.edition && (
                              <div className="flex items-center gap-2 mb-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
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

                            {/* Co-authors */}
                            {article.authors && article.authors.length > 1 && (
                              <div className="flex items-center gap-2 mb-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">
                                  Co-authors: 
                                </span>
                                <div className="flex flex-wrap gap-1">
                                  {article.authors
                                    .filter(a => a.name !== authorData.author.name)
                                    .map((coauthor, index, filteredAuthors) => (
                                      <span key={coauthor.id} className="text-sm">
                                        <button
                                          onClick={() => handleAuthorClick(coauthor.name)}
                                          className="text-primary hover:text-primary/80 hover:underline transition-colors"
                                        >
                                          {coauthor.name}
                                        </button>
                                        {index < filteredAuthors.length - 1 && (
                                          <span className="text-muted-foreground">, </span>
                                        )}
                                      </span>
                                    ))}
                                </div>
                              </div>
                            )}

                          </div>

                          {/* Abstract */}
                          {article.abstract && (
                            <p className="text-muted-foreground text-sm leading-relaxed">
                              {article.abstract.length > 400 
                                ? `${article.abstract.substring(0, 400)}...`
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
                                View PDF
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                            
                            {article.created_at && (
                              <span className="text-xs text-muted-foreground">
                                Added {new Date(article.created_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {year !== authorData.years[authorData.years.length - 1] && (
                  <Separator className="my-6" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}