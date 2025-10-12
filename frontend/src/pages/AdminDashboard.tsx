import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import EventsManager from "@/components/admin/EventsManager";
import EditionsManager from "@/components/admin/EditionsManager";
import PapersManager from "@/components/admin/PapersManager";
import BulkImportManager from "@/components/admin/BulkImportManager";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    const email = localStorage.getItem("userEmail");
    
    if (role !== "admin") {
      toast.error("Acesso negado. Privilégios de administrador necessários.");
      navigate("/admin/signin");
      return;
    }
    
    if (email) {
      setUserEmail(email);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    toast.success("Logout realizado com sucesso");
    navigate("/admin/signin");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50">
      <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">Painel Administrativo</h1>
            <p className="text-sm text-slate-600">{userEmail}</p>
          </div>
          <Button variant="outline" onClick={handleLogout} className="hover:bg-slate-50">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-white shadow-sm border border-blue-100">
            <TabsTrigger value="events" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white">Eventos</TabsTrigger>
            <TabsTrigger value="editions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white">Edições</TabsTrigger>
            <TabsTrigger value="papers" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white">Artigos</TabsTrigger>
            <TabsTrigger value="bulk-import" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-blue-700 data-[state=active]:text-white">Importação</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <EventsManager />
          </TabsContent>

          <TabsContent value="editions" className="space-y-4">
            <EditionsManager />
          </TabsContent>

          <TabsContent value="papers" className="space-y-4">
            <PapersManager />
          </TabsContent>

          <TabsContent value="bulk-import" className="space-y-4">
            <BulkImportManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
