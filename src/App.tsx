import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "sonner";
import { AuthProvider } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { Suspense } from "react";
import { 
  LazyClientArea, 
  LazyBlog, 
  LazyBlogDetail, 
  LazyDashboard, 
  LazyCreatePost, 
  LazyEditPost,
  ComponentLoader 
} from "@/components/LazyComponents";

// Pages que são carregadas imediatamente (críticas)
import Index from "@/pages/Index";
import Sobre from "@/pages/Sobre";
import Programas from "@/pages/Programas";
import Doacao from "@/pages/Doacao";
import Contacto from "@/pages/Contacto";
import Categories from "@/pages/Categories";
import CommentsPage from "@/pages/CommentsPage";
import AuthPage from "@/pages/AuthPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/programas" element={<Programas />} />
            <Route 
              path="/blog" 
              element={
                <Suspense fallback={<ComponentLoader />}>
                  <LazyBlog />
                </Suspense>
              } 
            />
            <Route 
              path="/blog/:slug" 
              element={
                <Suspense fallback={<ComponentLoader />}>
                  <LazyBlogDetail />
                </Suspense>
              } 
            />
            <Route path="/doacao" element={<Doacao />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/login" element={<AuthPage />} />
            
            {/* Portal de Comunidade - restrito a usuários não-admin */}
            <Route 
              path="/client-area" 
              element={
                <ProtectedRoute requireAuth={true} blockStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyClientArea />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            
            {/* Rotas protegidas - requer autenticação */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/posts/new" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyCreatePost />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/posts/edit/:slug" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyEditPost />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/categories" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Categories />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/comments" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <CommentsPage />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
      <Toaster />
      <Sonner />
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
