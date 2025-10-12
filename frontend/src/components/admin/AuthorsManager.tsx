import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { User, ExternalLink, Search, Users, BookOpen } from "lucide-react";
import { getArticles, ArticleItem } from "@/lib/api";
import { authorNameToSlug } from "@/lib/utils";
import { toast } from "sonner";

type AuthorSummary = {
  id: number;
  name: string;
  email?: string;
  articleCount: number;
  latestYear?: number;
  earliestYear?: number;
};

export default function AuthorsManager() {
  const navigate = useNavigate();
  const [authors, setAuthors] = useState<AuthorSummary[]>([]);
  const [filteredAuthors, setFilteredAuthors] = useState<AuthorSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadAuthors();
  }, []);

  useEffect(() => {
    // Filter authors based on search term
    if (searchTerm.trim() === "") {
      setFilteredAuthors(authors);
    } else {
      const filtered = authors.filter(author =>
        author.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (author.email && author.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredAuthors(filtered);
    }
  }, [searchTerm, authors]);

  const loadAuthors = async () => {
    setLoading(true);
    try {
      // Get all articles to calculate author statistics
      const articles = await getArticles();
      
      // Create a map to aggregate author data
      const authorMap = new Map<number, AuthorSummary>();
      
      articles.forEach(article => {
        if (article.authors) {
          article.authors.forEach(author => {
            const existingAuthor = authorMap.get(author.id);
            const articleYear = article.edition?.year;
            
            if (existingAuthor) {
              existingAuthor.articleCount++;
              if (articleYear) {
                existingAuthor.latestYear = Math.max(existingAuthor.latestYear || 0, articleYear);
                existingAuthor.earliestYear = Math.min(existingAuthor.earliestYear || Infinity, articleYear);
              }
            } else {
              authorMap.set(author.id, {
                id: author.id,
                name: author.name,
                email: author.email || undefined,
                articleCount: 1,
                latestYear: articleYear,
                earliestYear: articleYear
              });
            }
          });
        }
      });
      
      // Convert map to array and sort by article count (descending)
      const authorsArray = Array.from(authorMap.values()).sort((a, b) => b.articleCount - a.articleCount);
      
      setAuthors(authorsArray);
      setFilteredAuthors(authorsArray);
    } catch (error: any) {
      toast.error(`Error loading authors: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorClick = (authorName: string) => {
    const slug = authorNameToSlug(authorName);
    // Open in new tab so admin doesn't lose their place
    window.open(`/authors/${slug}`, '_blank');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Authors Management
          </CardTitle>
          <CardDescription>
            Loading authors...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading authors data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Authors Management
        </CardTitle>
        <CardDescription>
          Browse and manage authors in the system. Click on author names to view their publication pages.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search authors by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Badge variant="secondary">
            {filteredAuthors.length} author{filteredAuthors.length !== 1 ? 's' : ''}
          </Badge>
        </div>

        {/* Authors Table */}
        {filteredAuthors.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No authors found' : 'No authors yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? `No authors match "${searchTerm}". Try adjusting your search.`
                : 'Authors will appear here once articles are imported.'
              }
            </p>
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead className="text-right">Articles</TableHead>
                  <TableHead className="text-right">Years Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuthors.map((author) => (
                  <TableRow key={author.id} className="hover:bg-muted/50">
                    <TableCell>
                      <button
                        onClick={() => handleAuthorClick(author.name)}
                        className="text-left font-medium text-primary hover:text-primary/80 hover:underline transition-colors"
                      >
                        {author.name}
                      </button>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {author.email || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="font-mono">
                        {author.articleCount}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      {author.earliestYear && author.latestYear ? (
                        author.earliestYear === author.latestYear ? (
                          author.latestYear
                        ) : (
                          `${author.earliestYear} - ${author.latestYear}`
                        )
                      ) : (
                        '—'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAuthorClick(author.name)}
                        className="h-8 w-8 p-0"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">View author page</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Summary Stats */}
        {filteredAuthors.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {filteredAuthors.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Authors</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {filteredAuthors.reduce((sum, author) => sum + author.articleCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Articles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(filteredAuthors.reduce((sum, author) => sum + author.articleCount, 0) / filteredAuthors.length * 10) / 10}
              </div>
              <div className="text-sm text-muted-foreground">Avg Articles/Author</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}