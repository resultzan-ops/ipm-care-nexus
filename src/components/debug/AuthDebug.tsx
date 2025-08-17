import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, User, Database } from "lucide-react";

export function AuthDebug() {
  const { user, profile, loading, error, refetchProfile } = useAuth();

  if (loading) {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Authentication Debug
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            Loading authentication...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Authentication Debug
        </CardTitle>
        <CardDescription>
          Debug information for authentication and profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium flex items-center gap-2 mb-2">
            <Database className="h-4 w-4" />
            User Status
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Authenticated:</span>
              <Badge variant={user ? "default" : "destructive"}>
                {user ? "Yes" : "No"}
              </Badge>
            </div>
            {user && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">User ID:</span>
                  <span className="text-sm font-mono">{user.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <span className="text-sm">{user.email}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Profile Status</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Profile Found:</span>
              <Badge variant={profile ? "default" : "destructive"}>
                {profile ? "Yes" : "No"}
              </Badge>
            </div>
            {profile && (
              <>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Name:</span>
                  <span className="text-sm">{profile.nama_lengkap}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Role:</span>
                  <Badge variant="outline">{profile.role}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Active:</span>
                  <Badge variant={profile.is_active ? "default" : "destructive"}>
                    {profile.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Company:</span>
                  <span className="text-sm">{profile.company_id || "None"}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {error && (
          <div>
            <h4 className="font-medium mb-2 text-destructive">Error</h4>
            <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">
              {error}
            </p>
          </div>
        )}

        <Button 
          onClick={refetchProfile} 
          className="w-full" 
          variant="outline"
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Profile
        </Button>
      </CardContent>
    </Card>
  );
}