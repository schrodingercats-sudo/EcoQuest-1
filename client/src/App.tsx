import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import Home from "@/pages/home";
import StudentPortal from "@/pages/student-portal";
import TeacherDashboard from "@/pages/teacher-dashboard";
import Leaderboard from "@/pages/leaderboard";
import NotFound from "@/pages/not-found";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth";

// Navigation Header Component
function NavigationHeader() {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      setLocation("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const isActive = (path: string) => location === path;

  return (
    <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div 
            className="flex items-center space-x-3 cursor-pointer" 
            onClick={() => setLocation("/")}
            data-testid="logo-home-link"
          >
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <i className="fas fa-leaf text-primary-foreground text-xl"></i>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Planet Heroes
              </h1>
              <p className="text-xs text-muted-foreground">Save the Planet!</p>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <button 
              onClick={() => setLocation("/")}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/") ? "text-foreground" : "text-muted-foreground"
              }`}
              data-testid="nav-home"
            >
              <i className="fas fa-home mr-2"></i>Home
            </button>
            <button 
              onClick={() => setLocation("/student")}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/student") ? "text-foreground" : "text-muted-foreground"
              }`}
              data-testid="nav-student"
            >
              <i className="fas fa-gamepad mr-2"></i>Student Portal
            </button>
            <button 
              onClick={() => setLocation("/teacher")}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/teacher") ? "text-foreground" : "text-muted-foreground"
              }`}
              data-testid="nav-teacher"
            >
              <i className="fas fa-chart-line mr-2"></i>Teacher Dashboard
            </button>
            <button 
              onClick={() => setLocation("/leaderboard")}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive("/leaderboard") ? "text-foreground" : "text-muted-foreground"
              }`}
              data-testid="nav-leaderboard"
            >
              <i className="fas fa-trophy mr-2"></i>Leaderboard
            </button>
          </nav>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                <span className="text-sm text-foreground">{user.name}</span>
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  size="sm"
                  data-testid="button-sign-out"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>Sign Out
                </Button>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                Ready to become a Planet Hero?
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

function Router() {
  return (
    <div className="min-h-screen">
      <NavigationHeader />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/student" component={StudentPortal} />
        <Route path="/teacher" component={TeacherDashboard} />
        <Route path="/leaderboard" component={Leaderboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
