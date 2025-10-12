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
      toast.error("Access denied. Admin privileges required.");
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
    toast.success("Logged out successfully");
    navigate("/admin/signin");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card shadow-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="events" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="editions">Edições</TabsTrigger>
            <TabsTrigger value="papers">Artigos</TabsTrigger>
            <TabsTrigger value="bulk-import">Importação</TabsTrigger>
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
