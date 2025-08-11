import React from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CommentManagement from '@/components/CommentManagement';
import LoginForm from '@/components/LoginForm';

const CommentsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-md mx-auto pt-20">
          <LoginForm />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        {/* Navegação */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="sm" asChild>
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Gestão de Comentários</h1>
            <p className="text-muted-foreground">Modere comentários do blog</p>
          </div>
        </div>

        {/* Componente de gestão */}
        <CommentManagement />
      </div>
    </div>
  );
};

export default CommentsPage;
