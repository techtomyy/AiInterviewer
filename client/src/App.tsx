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
import Contact from "@/pages/contact";
import CameraTest from "@/components/CameraTest";
import { withAuth } from "@/components/withAuth";
import { useSupabaseAuth } from "@/hooks/useSupabaseAuth";

// React Query
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient();

function Router() {
  const { loading } = useSupabaseAuth();

  if (loading) return <div>Loading...</div>;

  // Create authenticated versions of components
  const AuthenticatedDashboard = withAuth(Dashboard);
  const AuthenticatedInterview = withAuth(Interview);
  const AuthenticatedFeedback = withAuth(Feedback);
  const AuthenticatedRecruiter = withAuth(Recruiter);
  const AuthenticatedSubscribe = withAuth(Subscribe);

  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Landing} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/contact" component={Contact} />
      <Route path="/camera-test" component={CameraTest} />

      {/* Public routes that need authentication logic */}
      <Route path="/home" component={Home} />
      
      {/* Protected routes (will redirect to login if not authenticated) */}
      <Route path="/dashboard" component={AuthenticatedDashboard} />
      <Route path="/interview" component={AuthenticatedInterview} />
      <Route path="/interview/:id" component={AuthenticatedInterview} />
      <Route path="/feedback/:id" component={AuthenticatedFeedback} />
      <Route path="/recruiter" component={AuthenticatedRecruiter} />
      <Route path="/subscribe" component={AuthenticatedSubscribe} />

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
