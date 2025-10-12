import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

const AuthorsManager: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Authors Management
        </CardTitle>
        <CardDescription>
          Authors management functionality will be available soon.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            The authors management interface is being developed and will be available in the next update.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthorsManager;