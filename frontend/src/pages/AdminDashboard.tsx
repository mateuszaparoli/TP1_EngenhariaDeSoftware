import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, Plus } from "lucide-react";
import { toast } from "sonner";
import EventsManager from "@/components/admin/EventsManager";
import PapersManager from "@/components/admin/PapersManager";
import EditionsManager from "@/components/admin/EditionsManager";

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
          <Button onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto py-8">
        <Tabs defaultValue="events" className="w-full">
          <TabsList>
            <TabsTrigger value="events">Eventos</TabsTrigger>
            <TabsTrigger value="editions">Edições</TabsTrigger>
            <TabsTrigger value="papers">Artigos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="events">
            <EventsManager />
          </TabsContent>
          
          <TabsContent value="editions">
            <EditionsManager />
          </TabsContent>
          
          <TabsContent value="papers">
            <PapersManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
