import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { AuthProvider } from "@/hooks/use-auth";

// Pages
import Index from "@/pages/Index";
import Sobre from "@/pages/Sobre";
import Programas from "@/pages/Programas";
import Blog from "@/pages/Blog";
import BlogDetail from "@/pages/BlogDetail";
import Doacao from "@/pages/Doacao";
import Contacto from "@/pages/Contacto";
import Dashboard from "@/pages/Dashboard";
import CreatePost from "@/pages/CreatePost";
import EditPost from "@/pages/EditPost";
import Categories from "@/pages/Categories";
import LoginForm from "@/components/LoginForm";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/programas" element={<Programas />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/doacao" element={<Doacao />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/posts/new" element={<CreatePost />} />
            <Route path="/dashboard/posts/edit/:slug" element={<EditPost />} />
            <Route path="/dashboard/categories" element={<Categories />} />
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
