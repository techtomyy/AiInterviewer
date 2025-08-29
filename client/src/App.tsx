import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Dashboard from "@/pages/dashboard";
import Interview from "@/pages/interview";
import Feedback from "@/pages/feedback";
import Recruiter from "@/pages/recruiter";
import Subscribe from "@/pages/subscribe";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth"; 
import CameraTest from "@/components/CameraTest";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function Router() {
  const { user, loading } = useSupabaseAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/camera-test" component={CameraTest} />

      {/* Protected routes (only if logged in) */}
      {user && (
        <>
          <Route path="/home" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/interview" component={Interview} />
          <Route path="/interview/:id" component={Interview} />
          <Route path="/feedback/:id" component={Feedback} />
          <Route path="/recruiter" component={Recruiter} />
          <Route path="/subscribe" component={Subscribe} />
        </>
      )}

      {/* Catch-all */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
