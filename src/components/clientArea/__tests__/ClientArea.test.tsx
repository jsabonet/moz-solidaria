// src/components/clientArea/__tests__/ClientArea.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ClientArea from '@/pages/ClientArea';
import { useAuth } from '@/hooks/use-auth';

// Mock do hook de autenticação
vi.mock('@/hooks/use-auth');

// Mock das APIs
vi.mock('@/lib/clientAreaApi', () => ({
  fetchUserProfile: vi.fn(),
  fetchDashboardStats: vi.fn()
}));

// Mock dos componentes pesados
vi.mock('@/components/clientArea/DonorDashboard', () => ({
  default: () => <div data-testid="donor-dashboard">Donor Dashboard</div>
}));

vi.mock('@/components/clientArea/VolunteerDashboard', () => ({
  default: () => <div data-testid="volunteer-dashboard">Volunteer Dashboard</div>
}));

vi.mock('@/components/clientArea/BeneficiaryDashboard', () => ({
  default: () => <div data-testid="beneficiary-dashboard">Beneficiary Dashboard</div>
}));

vi.mock('@/components/clientArea/PartnerDashboard', () => ({
  default: () => <div data-testid="partner-dashboard">Partner Dashboard</div>
}));

vi.mock('@/components/Header', () => ({
  default: () => <div data-testid="header">Header</div>
}));

vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer">Footer</div>
}));

const mockUseAuth = vi.mocked(useAuth);

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('ClientArea', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('redireciona para login se não autenticado', () => {
    mockUseAuth.mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      logout: vi.fn()
    } as any);

    render(<ClientArea />, { wrapper: createWrapper() });
    
    // Deve redirecionar para login (verificar pela ausência de conteúdo)
    expect(screen.queryByText('Olá,')).not.toBeInTheDocument();
  });

  it('exibe loading quando dados estão carregando', async () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'testuser' },
      isAuthenticated: true,
      loading: false,
      logout: vi.fn()
    } as any);

    const { fetchUserProfile, fetchDashboardStats } = await import('@/lib/clientAreaApi');
    vi.mocked(fetchUserProfile).mockImplementation(() => new Promise(() => {})); // Promise que nunca resolve
    vi.mocked(fetchDashboardStats).mockImplementation(() => new Promise(() => {}));

    render(<ClientArea />, { wrapper: createWrapper() });

    expect(screen.getByText('Carregando área do cliente...')).toBeInTheDocument();
  });

  it('exibe dashboard do doador para usuário doador', async () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'testuser' },
      isAuthenticated: true,
      loading: false,
      logout: vi.fn()
    } as any);

    const { fetchUserProfile, fetchDashboardStats } = await import('@/lib/clientAreaApi');
    vi.mocked(fetchUserProfile).mockResolvedValue({
      id: 1,
      user_type: 'donor',
      full_name: 'João Silva',
      user: { username: 'testuser', email: 'test@test.com' }
    } as any);
    vi.mocked(fetchDashboardStats).mockResolvedValue({} as any);

    render(<ClientArea />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Olá, João Silva!')).toBeInTheDocument();
    });

    expect(screen.getByTestId('donor-dashboard')).toBeInTheDocument();
  });

  it('exibe dashboard do voluntário para usuário voluntário', async () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'testuser' },
      isAuthenticated: true,
      loading: false,
      logout: vi.fn()
    } as any);

    const { fetchUserProfile, fetchDashboardStats } = await import('@/lib/clientAreaApi');
    vi.mocked(fetchUserProfile).mockResolvedValue({
      id: 1,
      user_type: 'volunteer',
      full_name: 'Maria Santos',
      user: { username: 'testuser', email: 'test@test.com' }
    } as any);
    vi.mocked(fetchDashboardStats).mockResolvedValue({} as any);

    render(<ClientArea />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Olá, Maria Santos!')).toBeInTheDocument();
    });

    expect(screen.getByTestId('volunteer-dashboard')).toBeInTheDocument();
  });

  it('permite navegação entre abas', async () => {
    mockUseAuth.mockReturnValue({
      user: { username: 'testuser' },
      isAuthenticated: true,
      loading: false,
      logout: vi.fn()
    } as any);

    const { fetchUserProfile, fetchDashboardStats } = await import('@/lib/clientAreaApi');
    vi.mocked(fetchUserProfile).mockResolvedValue({
      id: 1,
      user_type: 'donor',
      full_name: 'João Silva',
      user: { username: 'testuser', email: 'test@test.com' }
    } as any);
    vi.mocked(fetchDashboardStats).mockResolvedValue({} as any);

    render(<ClientArea />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });

    // Verificar se as abas existem
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Notificações')).toBeInTheDocument();
    expect(screen.getByText('Perfil')).toBeInTheDocument();
    expect(screen.getByText('Configurações')).toBeInTheDocument();
  });
});
