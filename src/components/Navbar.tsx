import { Button } from "@/components/ui/button";
import { Sprout, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed out",
      description: "You've been successfully logged out.",
    });
    navigate("/");
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Sprout className="h-8 w-8 text-primary transition-transform group-hover:scale-110" />
            <div>
              <h1 className="text-2xl font-heading font-bold text-primary">CES Consult</h1>
              <p className="text-xs text-muted-foreground font-body">Agriculture Investment</p>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">
              Home
            </Link>
            <Link to="/packages" className="text-foreground hover:text-primary transition-colors font-medium">
              Investment Packages
            </Link>
            <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">
              About
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground hidden md:inline">
                  {user.email}
                </span>
                <Button variant="ghost" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild className="emboss-hover">
                  <Link to="/register">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
