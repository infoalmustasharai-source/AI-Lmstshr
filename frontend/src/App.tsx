import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./pages/login";
import ChatPageNew from "./pages/chat-new";
import ResetPasswordPage from "./pages/reset-password";
import AdminLoginPage from "./pages/admin-login";
import AdminDashboardPage from "./pages/admin-dashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/chat" component={ChatPageNew} />
      <Route path="/admin-login" component={AdminLoginPage} />
      <Route path="/admin" component={AdminDashboardPage} />
      <Route path="/" component={LoginPage} />
      <Route>
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground">
          <h1 className="text-4xl font-bold mb-4 text-primary">404</h1>
          <p className="text-muted-foreground">الصفحة غير موجودة</p>
        </div>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
