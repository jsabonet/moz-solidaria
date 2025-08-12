// src/types/reports.ts
export interface Report {
  id: string;
  title: string;
  type: 'impact' | 'financial' | 'progress' | 'executive' | 'quarterly' | 'annual' | 'custom';
  status: 'generating' | 'completed' | 'failed' | 'scheduled';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  generated_at: string;
  generated_by?: {
    id: number;
    username: string;
    full_name: string;
  };
  file_url?: string;
  file_size?: string;
  filters: Record<string, any>;
  data?: any;
  error_message?: string;
}

export interface ScheduledReport {
  id: string;
  name: string;
  description?: string;
  report_type: 'impact' | 'financial' | 'progress' | 'executive' | 'quarterly' | 'annual' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  is_active: boolean;
  config: Record<string, any>;
  recipients: string[];
  last_run?: string;
  next_run: string;
  created_by?: {
    id: number;
    username: string;
    full_name: string;
  };
  created_at: string;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf' | 'json';
  includeHeaders: boolean;
  dateRange?: { 
    from: string; 
    to: string; 
  };
  selectedFields: string[];
  emailRecipients: string[];
  includeImages: boolean;
  summaryStats: boolean;
  customFilters?: Record<string, any>;
}

export interface ReportField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'boolean' | 'email' | 'phone' | 'currency';
  default: boolean;
  required?: boolean;
  description?: string;
}

export interface StatsMetrics {
  financialMetrics: {
    totalDonations: number;
    donationsGrowth: number;
    averageDonation: number;
    recurringDonors: number;
    monthlyRevenue: number;
    projectedRevenue: number;
    donorRetentionRate: number;
    conversionRate: number;
  };
  communityMetrics: {
    totalVolunteers: number;
    activeVolunteers: number;
    totalBeneficiaries: number;
    activeBeneficiaries: number;
    totalPartners: number;
    activePartners: number;
    communityGrowthRate: number;
    engagementRate: number;
  };
  projectMetrics: {
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    pausedProjects: number;
    cancelledProjects: number;
    averageCompletion: number;
    totalBudget: number;
    totalSpent: number;
    onTimeDelivery: number;
    budgetUtilization: number;
  };
  performanceMetrics: {
    donorRetention: number;
    volunteerRetention: number;
    beneficiaryRetention: number;
    projectSuccessRate: number;
    averageProjectDuration: number;
    costPerBeneficiary: number;
    impactScore: number;
    efficiency: number;
  };
  contentMetrics: {
    totalPosts: number;
    publishedPosts: number;
    draftPosts: number;
    totalViews: number;
    averageViews: number;
    engagementRate: number;
    shareRate: number;
    commentRate: number;
  };
}

export interface ChartData {
  label: string;
  value: number;
  date?: string;
  category?: string;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

export interface TimelineData {
  date: string;
  events: Array<{
    type: 'donation' | 'project' | 'volunteer' | 'partnership' | 'blog';
    title: string;
    description?: string;
    value?: number;
    impact?: 'low' | 'medium' | 'high';
  }>;
}

export interface GeographicData {
  region: string;
  province?: string;
  city?: string;
  coordinates?: [number, number];
  beneficiaries: number;
  projects: number;
  donations: number;
  volunteers: number;
  impactScore: number;
}

export interface PerformanceIndicator {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: 'number' | 'percentage' | 'currency' | 'days';
  trend: 'up' | 'down' | 'stable';
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
  lastUpdated: string;
}

export interface ReportTemplate {
  id: string;
  name: string;
  type: 'impact' | 'financial' | 'progress' | 'executive' | 'quarterly' | 'annual' | 'custom';
  description: string;
  defaultFormat: 'pdf' | 'excel' | 'csv' | 'json';
  sections: Array<{
    id: string;
    name: string;
    type: 'chart' | 'table' | 'kpi' | 'text' | 'image';
    config: Record<string, any>;
    required: boolean;
  }>;
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    recipients: string[];
  };
  isDefault: boolean;
  createdBy?: string;
  createdAt: string;
}

export interface ExportProgress {
  id: string;
  type: string;
  status: 'preparing' | 'processing' | 'completed' | 'failed';
  progress: number;
  message: string;
  totalRecords?: number;
  processedRecords?: number;
  estimatedTime?: number;
  downloadUrl?: string;
}

// API Response Types
export interface ReportsApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    pages: number;
  };
}

export interface StatsApiResponse extends ReportsApiResponse<StatsMetrics> {}
export interface ReportListApiResponse extends ReportsApiResponse<Report[]> {}
export interface ScheduledReportListApiResponse extends ReportsApiResponse<ScheduledReport[]> {}

// Request Types
export interface CreateReportRequest {
  title?: string;
  report_type: 'impact' | 'financial' | 'progress' | 'executive' | 'quarterly' | 'annual' | 'custom';
  format: 'pdf' | 'excel' | 'csv' | 'json';
  filters: Record<string, any>;
  email_recipients?: string[];
  schedule?: {
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
    start_date: string;
  };
}

export interface CreateScheduledReportRequest {
  name: string;
  description?: string;
  report_type: 'impact' | 'financial' | 'progress' | 'executive' | 'quarterly' | 'annual' | 'custom';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  config: Record<string, any>;
  recipients: string[];
  is_active: boolean;
}

export interface ExportRequest {
  type: 'donations' | 'volunteers' | 'beneficiaries' | 'partners' | 'projects' | 'blog';
  options: ExportOptions;
  filename: string;
  data?: any[];
}

// Error Types
export interface ReportError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

// Filter Types
export interface ReportFilters {
  dateRange?: {
    from: string;
    to: string;
  };
  status?: string[];
  categories?: string[];
  locations?: string[];
  amounts?: {
    min: number;
    max: number;
  };
  customFields?: Record<string, any>;
}
