// src/lib/clientAreaApi.ts
import { 
  UserProfile, 
  Donor, 
  Beneficiary, 
  Volunteer, 
  Partner,
  Cause,
  Skill,
  Certification,
  Notification,
  MatchingRequest,
  DashboardStats
} from '@/types/clientArea';
import { getApiBase } from '@/lib/config';

const API_BASE = getApiBase();

function getAuthHeaders() {
  const token = localStorage.getItem('authToken');
  const headers: any = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  return headers;
}

// ===== USER PROFILES =====
export async function fetchUserProfile(): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/auth/user/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar perfil');
  return res.json();
}

export async function updateUserProfile(profileData: Partial<UserProfile>): Promise<UserProfile> {
  const res = await fetch(`${API_BASE}/client-area/profile/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error('Erro ao atualizar perfil');
  return res.json();
}

// ===== USER REGISTRATION =====
export async function registerUser(userData: {
  username: string;
  email: string;
  password: string;
  user_type: 'donor' | 'beneficiary' | 'volunteer' | 'partner';
  full_name: string;
}) {
  const requestData = {
    ...userData,
    confirm_password: userData.password, // Add confirm_password field
  };
  
  const res = await fetch(`${API_BASE}/client-area/auth/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestData),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    
    // Extract field-specific errors for better user experience
    if (errorData.username) {
      throw new Error(`Nome de usuário: ${errorData.username[0]}`);
    }
    if (errorData.email) {
      throw new Error(`Email: ${errorData.email[0]}`);
    }
    if (errorData.password) {
      throw new Error(`Senha: ${errorData.password[0]}`);
    }
    if (errorData.confirm_password) {
      throw new Error(`Confirmação de senha: ${errorData.confirm_password[0]}`);
    }
    if (errorData.non_field_errors) {
      throw new Error(errorData.non_field_errors[0]);
    }
    
    throw new Error('Erro ao registrar usuário. Verifique os dados informados.');
  }
  
  return res.json();
}

// ===== USER LOGIN =====
export async function loginUser(credentials: {
  username: string;
  password: string;
}) {
  const res = await fetch(`${API_BASE}/client-area/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
    
    if (errorData.non_field_errors) {
      throw new Error(errorData.non_field_errors[0]);
    }
    if (errorData.username) {
      throw new Error(`Nome de usuário: ${errorData.username[0]}`);
    }
    if (errorData.password) {
      throw new Error(`Senha: ${errorData.password[0]}`);
    }
    
    throw new Error('Erro ao fazer login. Verifique suas credenciais.');
  }
  
  return res.json();
}

export async function completeProfile(profileData: any) {
  const res = await fetch(`${API_BASE}/core/auth/complete-profile/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error('Erro ao completar perfil');
  return res.json();
}

// ===== DONORS =====
export async function fetchDonors(): Promise<Donor[]> {
  const res = await fetch(`${API_BASE}/core/donors/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar doadores');
  return res.json();
}

export async function fetchDonorById(id: number): Promise<Donor> {
  const res = await fetch(`${API_BASE}/core/donors/${id}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar doador');
  return res.json();
}

export async function updateDonor(id: number, donorData: Partial<Donor>): Promise<Donor> {
  const res = await fetch(`${API_BASE}/core/donors/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(donorData),
  });
  if (!res.ok) throw new Error('Erro ao atualizar doador');
  return res.json();
}

// ===== BENEFICIARIES =====
export async function fetchBeneficiaries(): Promise<Beneficiary[]> {
  const res = await fetch(`${API_BASE}/core/beneficiaries/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar beneficiários');
  return res.json();
}

export async function fetchBeneficiaryById(id: number): Promise<Beneficiary> {
  const res = await fetch(`${API_BASE}/core/beneficiaries/${id}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar beneficiário');
  return res.json();
}

export async function updateBeneficiary(id: number, beneficiaryData: Partial<Beneficiary>): Promise<Beneficiary> {
  const res = await fetch(`${API_BASE}/core/beneficiaries/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(beneficiaryData),
  });
  if (!res.ok) throw new Error('Erro ao atualizar beneficiário');
  return res.json();
}

// ===== VOLUNTEERS =====
export async function fetchVolunteers(): Promise<Volunteer[]> {
  const res = await fetch(`${API_BASE}/core/volunteers/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar voluntários');
  return res.json();
}

export async function fetchVolunteerById(id: number): Promise<Volunteer> {
  const res = await fetch(`${API_BASE}/core/volunteers/${id}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar voluntário');
  return res.json();
}

export async function updateVolunteer(id: number, volunteerData: Partial<Volunteer>): Promise<Volunteer> {
  const res = await fetch(`${API_BASE}/core/volunteers/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(volunteerData),
  });
  if (!res.ok) throw new Error('Erro ao atualizar voluntário');
  return res.json();
}

// ===== PARTNERS =====
export async function fetchPartners(): Promise<Partner[]> {
  const res = await fetch(`${API_BASE}/core/partners/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar parceiros');
  return res.json();
}

export async function fetchPartnerById(id: number): Promise<Partner> {
  const res = await fetch(`${API_BASE}/core/partners/${id}/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar parceiro');
  return res.json();
}

export async function updatePartner(id: number, partnerData: Partial<Partner>): Promise<Partner> {
  const res = await fetch(`${API_BASE}/core/partners/${id}/`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify(partnerData),
  });
  if (!res.ok) throw new Error('Erro ao atualizar parceiro');
  return res.json();
}

// ===== CAUSES =====
export async function fetchCauses(): Promise<Cause[]> {
  const res = await fetch(`${API_BASE}/client-area/causes/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar causas');
  
  const data = await res.json();
  console.log('API response for causes:', data);
  
  // Check if it's a paginated response
  if (data.results && Array.isArray(data.results)) {
    return data.results;
  }
  
  // If it's already an array, return it
  if (Array.isArray(data)) {
    return data;
  }
  
  // Otherwise, return empty array
  return [];
}

// ===== SKILLS =====
export async function fetchSkills(): Promise<Skill[]> {
  const res = await fetch(`${API_BASE}/core/skills/`);
  if (!res.ok) throw new Error('Erro ao buscar habilidades');
  return res.json();
}

// ===== CERTIFICATIONS =====
export async function fetchCertifications(): Promise<Certification[]> {
  const res = await fetch(`${API_BASE}/core/certifications/`);
  if (!res.ok) throw new Error('Erro ao buscar certificações');
  return res.json();
}

// ===== DASHBOARD STATS =====
export async function fetchDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${API_BASE}/client-area/dashboard/stats/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar estatísticas');
  return res.json();
}

// ===== NOTIFICATIONS =====
export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch(`${API_BASE}/notifications/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar notificações');
  return res.json();
}

export async function markNotificationAsRead(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${id}/read/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao marcar notificação como lida');
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/mark-all-read/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao marcar todas as notificações como lidas');
}

export async function getNotificationStats(): Promise<{
  total: number;
  unread: number;
  read: number;
  by_type: Record<string, number>;
  by_priority: Record<string, number>;
}> {
  const res = await fetch(`${API_BASE}/notifications/stats/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar estatísticas de notificações');
  return res.json();
}

export async function bulkActionNotifications(notificationIds: number[], action: 'mark_read' | 'mark_unread' | 'delete'): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/bulk-action/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      notification_ids: notificationIds,
      action: action
    }),
  });
  if (!res.ok) throw new Error('Erro ao executar ação em massa');
}

export async function createNotification(notificationData: Partial<Notification>): Promise<Notification> {
  const res = await fetch(`${API_BASE}/notifications/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(notificationData),
  });
  if (!res.ok) throw new Error('Erro ao criar notificação');
  return res.json();
}

// ===== MATCHING SYSTEM =====
export async function fetchMatchingRequests(): Promise<MatchingRequest[]> {
  const res = await fetch(`${API_BASE}/core/matching-requests/`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao buscar solicitações de matching');
  return res.json();
}

export async function createMatchingRequest(requestData: {
  title: string;
  description: string;
  cause: number;
  skills_needed: number[];
  urgency_level: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  estimated_hours?: number;
}): Promise<MatchingRequest> {
  const res = await fetch(`${API_BASE}/core/matching-requests/`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(requestData),
  });
  if (!res.ok) throw new Error('Erro ao criar solicitação de matching');
  return res.json();
}

export async function acceptMatchingRequest(id: number): Promise<MatchingRequest> {
  const res = await fetch(`${API_BASE}/core/matching-requests/${id}/accept/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao aceitar solicitação');
  return res.json();
}

export async function completeMatchingRequest(id: number): Promise<MatchingRequest> {
  const res = await fetch(`${API_BASE}/core/matching-requests/${id}/complete/`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error('Erro ao completar solicitação');
  return res.json();
}
