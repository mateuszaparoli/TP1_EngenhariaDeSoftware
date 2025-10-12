import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Bell, Mail, User, ArrowLeft, Home } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const NotificationSignup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !email.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("http://localhost:8000/api/subscriptions/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
        }),
      });

      if (response.ok) {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Você receberá notificações quando novos artigos com seu nome forem disponibilizados.",
        });
        setName("");
        setEmail("");
      } else {
        throw new Error("Erro ao realizar cadastro");
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível realizar o cadastro. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-science">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 hover:text-primary transition-colors">
            <ArrowLeft className="h-6 w-6" />
            <span>Voltar</span>
          </Link>
          <div className="flex items-center space-x-2">
            <Bell className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
              Notificações
            </span>
          </div>
          <Link to="/" className="flex items-center space-x-2 hover:text-primary transition-colors">
            <Home className="h-6 w-6" />
            <span>Página Inicial</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <Card className="shadow-card">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Bell className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Receber Notificações</CardTitle>
              <p className="text-muted-foreground">
                Cadastre-se para receber um email sempre que um novo artigo com seu nome for disponibilizado
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Digite seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Digite seu nome exatamente como aparece nos artigos
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu.email@exemplo.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  variant="hero"
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar para Notificações"}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2">Como funciona:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Digite seu nome exatamente como aparece nos artigos</li>
                  <li>• Sempre que um novo artigo com seu nome for cadastrado, você receberá um email</li>
                  <li>• O email conterá todos os dados do artigo cadastrado</li>
                </ul>
              </div>

              <div className="mt-4 text-center">
                <Link 
                  to="/" 
                  className="inline-flex items-center space-x-2 text-primary hover:underline"
                >
                  <Home className="h-4 w-4" />
                  <span>Voltar à Página Inicial</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default NotificationSignup;