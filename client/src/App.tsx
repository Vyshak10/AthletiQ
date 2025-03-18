import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/hooks/use-auth';
import AuthPage from '@/pages/auth-page';
import HomePage from '@/pages/home-page';
import LandingPage from '@/pages/landing-page';
import CreateTournamentPage from '@/pages/create-tournament-page';
import TournamentDetailsPage from '@/pages/tournament-details-page';
import TeamDetailsPage from '@/pages/team-details-page';
import MatchDetailsPage from '@/pages/match-details-page';
import NotFound from '@/pages/not-found';
import { ProtectedRoute } from '@/lib/protected-route';
import { queryClient } from '@/lib/queryClient';

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/dashboard" component={HomePage} />
      <ProtectedRoute path="/tournaments/create" component={CreateTournamentPage} />
      <ProtectedRoute path="/tournaments/:id" component={TournamentDetailsPage} />
      <ProtectedRoute path="/teams/:id" component={TeamDetailsPage} />
      <ProtectedRoute path="/matches/:id" component={MatchDetailsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}