// src/services/reportsApi.ts
import { toast } from 'sonner';
import { 
  Report, 
  ScheduledReport, 
  StatsMetrics, 
  CreateReportRequest, 
  CreateScheduledReportRequest,
  ExportRequest,
  ReportsApiResponse 
} from '@/types/reports';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL
  ? `${(import.meta as any).env.VITE_API_URL}/reports`
  : (typeof window !== 'undefined' && window.location?.origin.includes('mozsolidaria.org') ? 'https://mozsolidaria.org/api/v1/reports' : 'http://localhost:8000/api/v1/reports');

class ReportsApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      // Add auth token if available
      ...(localStorage.getItem('authToken') && {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      })
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Relatórios
  async getReports(params: {
    type?: string;
    status?: string;
    page?: number;
    per_page?: number;
  } = {}): Promise<ReportsApiResponse<Report[]>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString());
      }
    });

    return this.makeRequest<ReportsApiResponse<Report[]>>(
      `/reports/?${searchParams.toString()}`
    );
  }

  async getReport(id: string): Promise<ReportsApiResponse<Report>> {
    return this.makeRequest<ReportsApiResponse<Report>>(`/reports/${id}/`);
  }

  async generateReport(data: CreateReportRequest): Promise<ReportsApiResponse<Report>> {
  return this.makeRequest<ReportsApiResponse<Report>>('/reports/generate/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async downloadReport(id: string, format: string = 'pdf'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/reports/${id}/download/?format=${format}`, {
      headers: {
        ...(localStorage.getItem('authToken') && {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        })
      }
    });

    if (!response.ok) {
      throw new Error('Erro ao baixar relatório');
    }

    return response.blob();
  }

  async deleteReport(id: string): Promise<void> {
    await this.makeRequest(`/reports/${id}/`, {
      method: 'DELETE',
    });
  }

  // Relatórios Agendados
  async getScheduledReports(): Promise<ReportsApiResponse<ScheduledReport[]>> {
    return this.makeRequest<ReportsApiResponse<ScheduledReport[]>>('/scheduled/');
  }

  async createScheduledReport(data: CreateScheduledReportRequest): Promise<ReportsApiResponse<ScheduledReport>> {
    return this.makeRequest<ReportsApiResponse<ScheduledReport>>('/scheduled/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateScheduledReport(
    id: string, 
    data: Partial<CreateScheduledReportRequest>
  ): Promise<ReportsApiResponse<ScheduledReport>> {
    return this.makeRequest<ReportsApiResponse<ScheduledReport>>(`/scheduled/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteScheduledReport(id: string): Promise<void> {
    await this.makeRequest(`/scheduled/${id}/`, {
      method: 'DELETE',
    });
  }

  async runScheduledReport(id: string): Promise<ReportsApiResponse<any>> {
    return this.makeRequest<ReportsApiResponse<any>>(`/scheduled/${id}/run_now/`, {
      method: 'POST',
    });
  }

  // Estatísticas Avançadas
  async getAdvancedStats(timeRange: string = '6months'): Promise<ReportsApiResponse<StatsMetrics>> {
    return this.makeRequest<ReportsApiResponse<StatsMetrics>>(
      `/reports/advanced_stats/?range=${timeRange}`
    );
  }

  async getQuickStats(): Promise<ReportsApiResponse<any>> {
    return this.makeRequest<ReportsApiResponse<any>>('/reports/quick_stats/');
  }

  async getExecutiveDashboard(filters: Record<string, any> = {}): Promise<ReportsApiResponse<any>> {
    return this.makeRequest<ReportsApiResponse<any>>('/reports/executive_dashboard/', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  }

  // Exportações
  async exportData(data: ExportRequest): Promise<Blob> {
  const response = await fetch(`${API_BASE_URL}/exports/generate/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('authToken') && {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        })
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erro ao exportar dados');
    }

    return response.blob();
  }

  // Analytics específicos
  async getProjectTimeline(params: {
    period?: string;
    date_from?: string;
    date_to?: string;
  } = {}): Promise<ReportsApiResponse<any>> {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value);
      }
    });

    return this.makeRequest<ReportsApiResponse<any>>(
      `/analytics/project_timeline/?${searchParams.toString()}`
    );
  }

  async getProjectPerformance(projectId?: number): Promise<ReportsApiResponse<any>> {
    const endpoint = projectId 
      ? `/analytics/project_performance/?project_id=${projectId}`
      : '/analytics/project_performance/';
    
    return this.makeRequest<ReportsApiResponse<any>>(endpoint);
  }

  // Dados específicos por área
  async getDonationsData(filters: Record<string, any> = {}): Promise<any[]> {
    try {
      const response = await this.makeRequest<any>('/donations/', {
        method: 'POST',
        body: JSON.stringify({ filters }),
      });
      return response.results || response.data || [];
    } catch (error) {
      return [];
    }
  }

  async getVolunteersData(filters: Record<string, any> = {}): Promise<any[]> {
    try {
      const response = await this.makeRequest<any>('/volunteers/', {
        method: 'POST',
        body: JSON.stringify({ filters }),
      });
      return response.results || response.data || [];
    } catch (error) {
      return [];
    }
  }

  async getBeneficiariesData(filters: Record<string, any> = {}): Promise<any[]> {
    try {
      const response = await this.makeRequest<any>('/beneficiaries/', {
        method: 'POST',
        body: JSON.stringify({ filters }),
      });
      return response.results || response.data || [];
    } catch (error) {
      return [];
    }
  }

  async getPartnersData(filters: Record<string, any> = {}): Promise<any[]> {
    try {
      const response = await this.makeRequest<any>('/partners/', {
        method: 'POST',
        body: JSON.stringify({ filters }),
      });
      return response.results || response.data || [];
    } catch (error) {
      return [];
    }
  }

  async getProjectsData(filters: Record<string, any> = {}): Promise<any[]> {
    try {
      const response = await this.makeRequest<any>('/projects/', {
        method: 'POST',
        body: JSON.stringify({ filters }),
      });
      return response.results || response.data || [];
    } catch (error) {
      return [];
    }
  }

  async getBlogData(filters: Record<string, any> = {}): Promise<any[]> {
    try {
      const response = await this.makeRequest<any>('/blog/posts/', {
        method: 'POST',
        body: JSON.stringify({ filters }),
      });
      return response.results || response.data || [];
    } catch (error) {
      return [];
    }
  }
}

// Singleton instance
export const reportsApi = new ReportsApiService();

// Utility functions
export const downloadFile = (blob: Blob, filename: string, format: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = `${filename}.${format}`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export const handleApiError = (error: any, defaultMessage: string = 'Erro na operação') => {
  const message = error?.message || defaultMessage;
  toast.error(message);
};
