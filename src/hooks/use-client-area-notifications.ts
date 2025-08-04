// src/hooks/use-client-area-notifications.ts
import useNotification from '@/hooks/use-notification';

export const useClientAreaNotifications = () => {
  const notification = useNotification();

  const notifyDonationSuccess = (amount: string) => {
    notification.success('Doação enviada com sucesso!', {
      description: `Sua doação de MT ${amount} foi registrada e está sendo processada.`,
      duration: 10000,
      action: {
        label: 'Ver Doações',
        onClick: () => {
          // Implementar navegação para lista de doações
          console.log('Navegar para minhas doações');
        }
      }
    });
  };

  const notifyDonationError = (message: string) => {
    notification.error('Erro ao processar doação', {
      description: message,
      duration: 8000,
      action: {
        label: 'Tentar Novamente',
        onClick: () => {
          console.log('Tentar novamente');
        }
      }
    });
  };

  const notifyFeatureNotImplemented = (featureName: string) => {
    notification.info(`${featureName} em desenvolvimento`, {
      description: 'Esta funcionalidade estará disponível em breve. Obrigado pela sua paciência!',
      duration: 5000,
    });
  };

  const notifyProfileUpdate = () => {
    notification.success('Perfil atualizado!', {
      description: 'Suas informações foram salvas com sucesso.',
      duration: 5000,
    });
  };

  const notifyVolunteerRequest = () => {
    notification.success('Solicitação enviada!', {
      description: 'Sua solicitação para voluntariado foi enviada. Entraremos em contato em breve.',
      duration: 8000,
    });
  };

  const notifyDataError = (dataType: string) => {
    notification.error(`Erro ao carregar ${dataType}`, {
      description: 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.',
      duration: 6000,
      action: {
        label: 'Recarregar',
        onClick: () => {
          window.location.reload();
        }
      }
    });
  };

  const notifyLogout = () => {
    notification.info('Até logo!', {
      description: 'Você foi desconectado com sucesso.',
      duration: 3000,
    });
  };

  const notifyLoginRequired = () => {
    notification.warning('Login necessário', {
      description: 'Você precisa estar logado para acessar esta funcionalidade.',
      duration: 5000,
    });
  };

  return {
    notifyDonationSuccess,
    notifyDonationError,
    notifyFeatureNotImplemented,
    notifyProfileUpdate,
    notifyVolunteerRequest,
    notifyDataError,
    notifyLogout,
    notifyLoginRequired,
    notification, // Para casos customizados
  };
};

export default useClientAreaNotifications;
