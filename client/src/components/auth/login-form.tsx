import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { signInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface LoginFormProps {
  role: "student" | "teacher";
}

export const LoginForm = ({ role }: LoginFormProps) => {
  const { loading } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <i className="fas fa-leaf text-primary-foreground text-2xl"></i>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Welcome to Planet Heroes
          </CardTitle>
          <CardDescription>
            Sign in as a {role} to start your eco-adventure!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGoogleSignIn}
            className="w-full bg-primary hover:bg-primary/90"
            data-testid="button-google-signin"
          >
            <i className="fab fa-google mr-2"></i>
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
