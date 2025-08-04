// src/types/clientArea.ts
export interface UserProfile {
  id: number;
  user: number;
  user_type: 'donor' | 'beneficiary' | 'volunteer' | 'partner';
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  is_profile_complete: boolean;
  created_at: string;
  updated_at: string;
}

export interface Donor {
  id: number;
  user_profile: UserProfile;
  total_donated: string;
  donation_frequency: 'one_time' | 'monthly' | 'quarterly' | 'annual';
  preferred_causes: Cause[];
  anonymous_donations: boolean;
  tax_receipt_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface Beneficiary {
  id: number;
  user_profile: UserProfile;
  family_size: number;
  location: string;
  needs: string;
  income_level: 'none' | 'very_low' | 'low' | 'moderate';
  is_urgent: boolean;
  documentation?: string;
  created_at: string;
  updated_at: string;
}

export interface Volunteer {
  id: number;
  user_profile: UserProfile;
  skills: Skill[];
  certifications: VolunteerCertification[];
  availability: any;
  hours_contributed: number;
  preferred_activities: string;
  emergency_contact?: string;
  created_at: string;
  updated_at: string;
}

export interface Partner {
  id: number;
  user_profile: UserProfile;
  organization_name: string;
  organization_type: 'ngo' | 'company' | 'government' | 'individual';
  partnership_type: 'sponsor' | 'implementer' | 'technical' | 'logistic';
  resources_available: any;
  contact_person?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Cause {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export interface Skill {
  id: number;
  name: string;
  category?: string;
  description?: string;
}

export interface VolunteerCertification {
  id: number;
  volunteer: number;
  certification: Certification;
  date_obtained: string;
  expiry_date?: string;
  certificate_file?: string;
}

export interface Certification {
  id: number;
  name: string;
  issuing_organization?: string;
  validity_period_months?: number;
  description?: string;
}

export interface Notification {
  id: number;
  title: string;
  message: string;
  notification_type: 'donation_created' | 'donation_status_changed' | 'donation_comment_added' | 
                    'donation_approved' | 'donation_rejected' | 'payment_verified' | 
                    'admin_comment' | 'donor_comment';
  type_display: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  priority_display: string;
  related_donation_id?: number;
  related_comment_id?: number;
  metadata: Record<string, any>;
  is_read: boolean;
  is_sent: boolean;
  sent_at?: string;
  read_at?: string;
  action_url?: string;
  action_text?: string;
  created_at: string;
  updated_at: string;
  recipient_name: string;
  time_ago: string;
}

export interface MatchingRequest {
  id: number;
  beneficiary: Beneficiary;
  volunteer?: Volunteer;
  cause: Cause;
  title: string;
  description: string;
  skills_needed: Skill[];
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
  location?: string;
  estimated_hours?: number;
  created_at: string;
  matched_at?: string;
  completed_at?: string;
}

export interface DashboardStats {
  user_type: string;
  stats: {
    [key: string]: any;
    // Campos específicos para doadores
    total_donated?: number;
    donations_this_month?: number;
    donations_growth?: number;
    donation_count?: number;
    pending_count?: number;
    donor_level?: string;
    next_level_amount?: number;
    next_level_name?: string;
    level_progress?: number;
  };
  recent_activities: RecentActivity[];
  notifications_count: number;
  upcoming_events?: any[];
  donorStats?: any; // Para compatibilidade com a nova API
}

export interface RecentActivity {
  id: number;
  type: string;
  title: string;
  description: string;
  timestamp: string;
  icon?: string;
}
