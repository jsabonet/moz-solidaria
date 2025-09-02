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
  LazyCreateProject,
  ComponentLoader 
} from "@/components/LazyComponents";

// Pages que são carregadas imediatamente (críticas)
import Index from "@/pages/Index";
import Sobre from "@/pages/Sobre";
import Programas from "@/pages/Programas";
import ProgramaDetail from "@/pages/ProgramaDetail";
import PoliticaPrivacidade from "@/pages/PoliticaPrivacidade";
import TermosUso from "@/pages/TermosUso";
import Transparencia from "@/pages/Transparencia";
import Doacao from "@/pages/Doacao";
import Contacto from "@/pages/Contacto";
import Categories from "@/pages/Categories";
import CommentsPage from "@/pages/CommentsPage";
import AuthPage from "@/pages/AuthPage";
import DonationProofPage from "@/pages/DonationProofPage";
import ProjectDetail from "@/pages/ProjectDetail";
import Projects from "@/pages/Projects";
import AuthCacheManager from "@/components/auth/AuthCacheManager";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AuthCacheManager />
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PWAInstallPrompt />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/programas" element={<Programas />} />
            <Route path="/programas/:id" element={<ProgramaDetail />} />
            <Route path="/politica-privacidade" element={<PoliticaPrivacidade />} />
            <Route path="/termos-uso" element={<TermosUso />} />
            <Route path="/transparencia" element={<Transparencia />} />
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
            <Route path="/projeto/:slug" element={<ProjectDetail />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/doacao" element={<Doacao />} />
            <Route path="/enviar-comprovante" element={<DonationProofPage />} />
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
            
            {/* Rotas das Abas do Dashboard */}
            <Route 
              path="/dashboard/overview" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/blog" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/projects" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/settings" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/users" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/reports" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/project-categories" 
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
              path="/dashboard/projects/new" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyCreateProject />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/projects/edit/:slug" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyCreateProject />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/projects/view/:slug" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <ProjectDetail />
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
            
            {/* Rotas da Comunidade */}
            <Route 
              path="/dashboard/community" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/community/donations" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/community/partners" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/community/volunteers" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/dashboard/community/beneficiaries" 
              element={
                <ProtectedRoute requireAuth={true} requireStaff={true}>
                  <Suspense fallback={<ComponentLoader />}>
                    <LazyDashboard />
                  </Suspense>
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
