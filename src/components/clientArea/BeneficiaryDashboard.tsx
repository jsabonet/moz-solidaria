// src/components/clientArea/BeneficiaryDashboard.tsx
// Dashboard do Beneficiário – versão inicial mínima para corrigir erro de lazy load
// Pode ser expandido depois (perfil, solicitações de apoio, comunicação, etc.)

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Home, FileText, MessageCircle, User, RefreshCcw, Save, CheckCircle, MapPin, Users, Plus, Calendar, DollarSign, Filter, Send, Heart, GraduationCap, Package } from 'lucide-react';
import api from '@/lib/api';
import { DashboardStats } from '@/types/clientArea';
import { useAuth } from '@/hooks/use-auth';

interface BeneficiaryDashboardProps {
	stats: DashboardStats | null; // vindo do ClientArea (pode estar genérico ou vazio)
}

interface BeneficiaryProfile {
	id: number;
	full_name: string;
	age: number;
	district: string;
	locality: string;
	family_members_count: number;
	vulnerability_score: number;
	is_verified: boolean;
}

interface SupportRequestSummary {
	id: number;
	title: string;
	description: string;
	status: string;
	urgency: string;
	requested_date: string;
	created_at: string;
	request_type: string;
	estimated_cost?: number;
	needed_by_date?: string;
	communications_count: number;
}

interface NewSupportRequest {
	request_type: string;
	title: string;
	description: string;
	urgency: string;
	estimated_beneficiaries: number;
	estimated_cost?: number;
	needed_by_date?: string;
}

interface SupportRequestMessage {
	id: number;
	sender_name: string;
	sender_type: 'beneficiary' | 'admin';
	message: string;
	created_at: string;
	is_read: boolean;
	is_from_beneficiary: boolean;
}

interface BeneficiaryDashboardApiStats {
	profile: BeneficiaryProfile | null;
	requests_count: number;
	pending_requests: number;
	approved_requests: number;
	completed_requests: number;
	unread_messages: number;
	recent_requests: SupportRequestSummary[];
}

const BeneficiaryDashboard: React.FC<BeneficiaryDashboardProps> = ({ stats: parentStats }) => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('overview');
	const [bStats, setBStats] = useState<BeneficiaryDashboardApiStats | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [noProfile, setNoProfile] = useState(false);
	const [completing, setCompleting] = useState(false);
	
	// Estados para solicitações
	const [allRequests, setAllRequests] = useState<SupportRequestSummary[]>([]);
	const [loadingRequests, setLoadingRequests] = useState(false);
	const [showCreateForm, setShowCreateForm] = useState(false);
	const [creatingRequest, setCreatingRequest] = useState(false);
	const [filterStatus, setFilterStatus] = useState<string>('todos');
	const [selectedRequest, setSelectedRequest] = useState<SupportRequestSummary | null>(null);
	
	// Estados para comunicação
	const [messages, setMessages] = useState<SupportRequestMessage[]>([]);
	const [loadingMessages, setLoadingMessages] = useState(false);
	const [newMessage, setNewMessage] = useState('');
	const [sendingMessage, setSendingMessage] = useState(false);
	
	// Dados para nova solicitação
	const [newRequest, setNewRequest] = useState<NewSupportRequest>({
		request_type: '',
		title: '',
		description: '',
		urgency: '',
		estimated_beneficiaries: 1,
		estimated_cost: undefined,
		needed_by_date: undefined
	});
	
	// Estados para formulário multi-página
	const [currentFormPage, setCurrentFormPage] = useState(1);
	const [totalFormPages] = useState(5);
	
	// Dados mínimos para completar perfil - TODOS os campos necessários
	const [completeData, setCompleteData] = useState({
		// Página 1: Dados Pessoais Básicos
		full_name: user?.username || '',
		date_of_birth: '',
		gender: 'M',
		phone_number: '',
		alternative_phone: '',
		
		// Página 2: Localização
		province: 'Cabo Delgado',
		district: '',
		administrative_post: '',
		locality: '',
		neighborhood: '',
		address_details: '',
		
		// Página 3: Família
		family_status: 'solteiro',
		family_members_count: 1,
		children_count: 0,
		elderly_count: 0,
		disabled_count: 0,
		
		// Página 4: Situação Socioeconômica
		education_level: 'primario',
		employment_status: 'desempregado',
		monthly_income: 0,
		
		// Página 5: Vulnerabilidades e Necessidades
		is_displaced: false,
		displacement_reason: '',
		has_chronic_illness: false,
		chronic_illness_details: '',
		priority_needs: '',
		additional_information: ''
	});

	useEffect(() => {
		fetchBeneficiaryStats();
	}, []);

		const fetchBeneficiaryStats = async () => {
			setLoading(true);
			setError(null);
			try {
				// Novo endpoint estável
				let res = await api.get('/beneficiaries/dashboard/summary/');
				setBStats(res.data);
			} catch (err: any) {
				// Fallback para endpoint alternativo definido em urls
				if (err?.response?.status === 404) {
					try {
						// Primeiro fallback: action explicitamente mapeada
						let alt = await api.get('/beneficiaries/profiles/dashboard_stats/');
						setBStats(alt.data);
						setLoading(false);
						return;
					} catch {}
					try {
						// Segundo fallback
						const alt2 = await api.get('/beneficiaries/dashboard/stats/');
						setBStats(alt2.data);
						setLoading(false);
						return;
					} catch (err2: any) {
						console.error('[BeneficiaryDashboard] Falha também no endpoint alternativo', err2);
						setError(err2?.response?.data?.error || 'Não foi possível carregar dados do beneficiário.');
					}
						} else {
					console.error('[BeneficiaryDashboard] Erro ao obter stats', err);
					setError(err?.response?.data?.error || 'Não foi possível carregar dados do beneficiário.');
				}
			} finally {
				setLoading(false);
			}
		};

	useEffect(() => {
		if (error && /beneficiário não encontrado/i.test(error)) {
			setNoProfile(true);
		}
	}, [error]);

	const handleCompleteProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setCompleting(true);
		setError(null);
		try {
			// Usar endpoint simplificado que cria perfil com dados existentes do usuário
			const profileData = {
				...completeData,
				// Reutilizar dados já existentes do usuário logado
				email: user?.email || user?.username,
			};
			
			await api.post('/beneficiaries/profiles/', profileData);
			setNoProfile(false);
			await fetchBeneficiaryStats();
		} catch (err: any) {
			console.error('[BeneficiaryDashboard] Erro ao completar perfil', err);
			setError(err?.response?.data?.detail || 'Falha ao completar perfil. Contacte o suporte.');
		} finally {
			setCompleting(false);
		}
	};

	// Navegação entre páginas do formulário
	const nextFormPage = () => {
		if (currentFormPage < totalFormPages) {
			setCurrentFormPage(currentFormPage + 1);
		}
	};

	const prevFormPage = () => {
		if (currentFormPage > 1) {
			setCurrentFormPage(currentFormPage - 1);
		}
	};

	const isCurrentPageValid = () => {
		switch (currentFormPage) {
			case 1:
				return completeData.full_name && completeData.date_of_birth && completeData.gender && completeData.phone_number;
			case 2:
				return completeData.province && completeData.district && completeData.administrative_post && completeData.locality;
			case 3:
				return completeData.family_status && completeData.family_members_count > 0;
			case 4:
				return completeData.education_level && completeData.employment_status;
			case 5:
				return completeData.priority_needs;
			default:
				return true;
		}
	};

	const fetchAllRequests = async () => {
		setLoadingRequests(true);
		try {
			const res = await api.get('/beneficiaries/support-requests/');
			setAllRequests(res.data.results || res.data);
		} catch (err: any) {
			console.error('[BeneficiaryDashboard] Erro ao carregar solicitações', err);
			setError('Não foi possível carregar suas solicitações.');
		} finally {
			setLoadingRequests(false);
		}
	};

	const handleCreateRequest = async () => {
		setCreatingRequest(true);
		setError(null);
		try {
			await api.post('/beneficiaries/support-requests/', newRequest);
			setShowCreateForm(false);
			setNewRequest({
				request_type: '',
				title: '',
				description: '',
				urgency: '',
				estimated_beneficiaries: 1,
				estimated_cost: undefined,
				needed_by_date: undefined
			});
			await Promise.all([fetchBeneficiaryStats(), fetchAllRequests()]);
		} catch (err: any) {
			console.error('[BeneficiaryDashboard] Erro ao criar solicitação', err);
			setError('Falha ao criar solicitação. Tente novamente.');
		} finally {
			setCreatingRequest(false);
		}
	};

	const fetchRequestMessages = async (requestId: number) => {
		setLoadingMessages(true);
		try {
			const res = await api.get(`/beneficiaries/communications/?support_request=${requestId}`);
			setMessages(res.data.results || res.data);
		} catch (err: any) {
			console.error('[BeneficiaryDashboard] Erro ao carregar mensagens', err);
		} finally {
			setLoadingMessages(false);
		}
	};

	const handleSendMessage = async () => {
		if (!selectedRequest || !newMessage.trim()) return;
		
		setSendingMessage(true);
		try {
			await api.post('/beneficiaries/communications/', {
				support_request: selectedRequest.id,
				message_type: 'pergunta',
				subject: `Re: ${selectedRequest.title || selectedRequest.request_type}`,
				message: newMessage
			});
			setNewMessage('');
			await fetchRequestMessages(selectedRequest.id);
		} catch (err: any) {
			console.error('[BeneficiaryDashboard] Erro ao enviar mensagem', err);
			setError('Falha ao enviar mensagem. Tente novamente.');
		} finally {
			setSendingMessage(false);
		}
	};

	useEffect(() => {
		if (!noProfile && bStats?.profile) {
			fetchAllRequests();
		}
	}, [noProfile, bStats]);

	const vulnerabilityLabel = (score?: number) => {
		if (score == null) return '—';
		if (score >= 7) return 'Alta';
		if (score >= 4) return 'Média';
		return 'Baixa';
	};

	const getStatusColor = (status: string) => {
		const colors: Record<string, string> = {
			'pendente': 'bg-yellow-100 text-yellow-800',
			'em_analise': 'bg-blue-100 text-blue-800',
			'aprovada': 'bg-green-100 text-green-800',
			'em_andamento': 'bg-purple-100 text-purple-800',
			'concluida': 'bg-emerald-100 text-emerald-800',
			'rejeitada': 'bg-red-100 text-red-800',
			'cancelada': 'bg-gray-100 text-gray-800'
		};
		return colors[status] || 'bg-gray-100 text-gray-800';
	};

	const getUrgencyColor = (urgency: string) => {
		const colors: Record<string, string> = {
			'baixa': 'bg-blue-100 text-blue-800',
			'media': 'bg-yellow-100 text-yellow-800',
			'alta': 'bg-orange-100 text-orange-800',
			'critica': 'bg-red-100 text-red-800'
		};
		return colors[urgency] || 'bg-gray-100 text-gray-800';
	};

	const getRequestTypeIcon = (type: string) => {
		const icons: Record<string, string> = {
			'alimentar': '🍞',
			'medico': '🏥',
			'educacao': '📚',
			'habitacao': '🏠',
			'emprego': '💼',
			'psicologico': '🧠',
			'juridico': '⚖️',
			'emergencia': '🚨',
			'outro': '❓'
		};
		return icons[type] || '❓';
	};

	const filteredRequests = allRequests.filter(req => 
		filterStatus === 'todos' || req.status === filterStatus
	);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-bold">Portal do Beneficiário</h1>
				<Button variant="outline" size="sm" onClick={fetchBeneficiaryStats} disabled={loading}>
					<RefreshCcw className="h-4 w-4 mr-2" />
					Atualizar
				</Button>
			</div>

			{error && (
				<Card className="border-red-300 bg-red-50">
					<CardHeader className="pb-2">
						<CardTitle className="text-sm flex items-center gap-2 text-red-700">
							<AlertTriangle className="h-4 w-4" /> Erro
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-red-700">{error}</p>
					</CardContent>
				</Card>
			)}

			{noProfile ? (
				<Card className="max-w-2xl mx-auto">
					<CardHeader className="text-center">
						<div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
							<User className="h-8 w-8 text-blue-600" />
						</div>
						<CardTitle className="text-xl">Bem-vindo ao Portal de Beneficiários</CardTitle>
						<p className="text-muted-foreground">Para receber apoio, precisa completar algumas informações sobre si</p>
						
						{/* Indicador de progresso */}
						<div className="mt-4 mb-2">
							<div className="flex items-center justify-between text-sm text-gray-600 mb-2">
								<span>Página {currentFormPage} de {totalFormPages}</span>
								<span>{Math.round((currentFormPage / totalFormPages) * 100)}%</span>
							</div>
							<div className="w-full bg-gray-200 rounded-full h-2">
								<div 
									className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
									style={{ width: `${(currentFormPage / totalFormPages) * 100}%` }}
								></div>
							</div>
						</div>
						
						{/* Ajuda visual para utilizadores com baixa alfabetização */}
						<div className="mt-4 p-3 bg-blue-50 rounded-lg text-sm text-blue-800">
							<div className="flex items-center gap-2 mb-2">
								<AlertTriangle className="h-4 w-4" />
								<span className="font-medium">Precisa de ajuda?</span>
							</div>
							<p className="text-xs">Peça a alguém para o ajudar a preencher estas informações. Todos os campos são importantes para receber o melhor apoio.</p>
						</div>
					</CardHeader>
					<CardContent>
						<form onSubmit={handleCompleteProfile} className="space-y-6">
							
							{/* PÁGINA 1: Dados Pessoais Básicos */}
							{currentFormPage === 1 && (
								<div className="space-y-4">
									<h3 className="flex items-center gap-2 font-medium text-lg bg-gray-50 p-3 rounded-lg">
										<User className="h-6 w-6 text-blue-600" />
										Dados Pessoais Básicos
									</h3>
									<div className="grid grid-cols-1 gap-4 pl-4">
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Como se chama?</label>
											<input 
												required 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-blue-500" 
												value={completeData.full_name} 
												onChange={e => setCompleteData({...completeData, full_name: e.target.value})}
												placeholder="Escreva o seu nome completo"
											/>
										</div>
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Quando nasceu?</label>
											<input 
												type="date" 
												required 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-blue-500" 
												value={completeData.date_of_birth} 
												onChange={e => setCompleteData({...completeData, date_of_birth: e.target.value})} 
											/>
										</div>
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">É homem ou mulher?</label>
											<div className="grid grid-cols-2 gap-3">
												<button
													type="button"
													className={`p-4 border-2 rounded-lg text-base font-medium transition-colors ${
														completeData.gender === 'M' 
														? 'bg-blue-100 border-blue-500 text-blue-700' 
														: 'border-gray-300 hover:border-gray-400'
													}`}
													onClick={() => setCompleteData({...completeData, gender: 'M'})}
												>
													👨 Homem
												</button>
												<button
													type="button"
													className={`p-4 border-2 rounded-lg text-base font-medium transition-colors ${
														completeData.gender === 'F' 
														? 'bg-blue-100 border-blue-500 text-blue-700' 
														: 'border-gray-300 hover:border-gray-400'
													}`}
													onClick={() => setCompleteData({...completeData, gender: 'F'})}
												>
													👩 Mulher
												</button>
											</div>
										</div>
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Número de telefone principal</label>
											<input 
												required 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-blue-500" 
												value={completeData.phone_number} 
												onChange={e => setCompleteData({...completeData, phone_number: e.target.value})}
												placeholder="Ex: 82 123 4567"
											/>
											<p className="text-xs text-gray-500 mt-1">Para podermos contactá-lo</p>
										</div>
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Telefone alternativo (opcional)</label>
											<input 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-blue-500" 
												value={completeData.alternative_phone} 
												onChange={e => setCompleteData({...completeData, alternative_phone: e.target.value})}
												placeholder="Ex: 84 987 6543"
											/>
											<p className="text-xs text-gray-500 mt-1">Caso não consigamos no primeiro número</p>
										</div>
									</div>
								</div>
							)}

							{/* PÁGINA 2: Localização */}
							{currentFormPage === 2 && (
								<div className="space-y-4">
									<h3 className="flex items-center gap-2 font-medium text-lg bg-gray-50 p-3 rounded-lg">
										<MapPin className="h-6 w-6 text-green-600" />
										Onde Mora
									</h3>
									<div className="grid grid-cols-1 gap-4 pl-4">
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Província</label>
											<select 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-green-500" 
												value={completeData.province} 
												onChange={e => setCompleteData({...completeData, province: e.target.value})}
											>
												<option value="Cabo Delgado">Cabo Delgado</option>
												<option value="Gaza">Gaza</option>
												<option value="Inhambane">Inhambane</option>
												<option value="Manica">Manica</option>
												<option value="Maputo">Maputo</option>
												<option value="Maputo Cidade">Maputo Cidade</option>
												<option value="Nampula">Nampula</option>
												<option value="Niassa">Niassa</option>
												<option value="Sofala">Sofala</option>
												<option value="Tete">Tete</option>
												<option value="Zambézia">Zambézia</option>
											</select>
											<p className="text-xs text-gray-500 mt-1">Selecione a sua província</p>
										</div>
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Em que distrito mora?</label>
											<input 
												required 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-green-500" 
												value={completeData.district} 
												onChange={e => setCompleteData({...completeData, district: e.target.value})}
												placeholder="Ex: Pemba, Montepuez, Mueda"
											/>
										</div>
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Posto Administrativo</label>
											<input 
												required 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-blue-500" 
												value={completeData.administrative_post} 
												onChange={e => setCompleteData({...completeData, administrative_post: e.target.value})}
												placeholder="Ex: Pemba Metuge, Montepuez Sede"
											/>
										</div>
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Localidade</label>
											<input 
												required 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-blue-500" 
												value={completeData.locality} 
												onChange={e => setCompleteData({...completeData, locality: e.target.value})}
												placeholder="Nome da sua zona"
											/>
										</div>
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Bairro (opcional)</label>
											<input 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-blue-500" 
												value={completeData.neighborhood} 
												onChange={e => setCompleteData({...completeData, neighborhood: e.target.value})}
												placeholder="Nome do bairro"
											/>
										</div>
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Outros detalhes do endereço (opcional)</label>
											<textarea 
												rows={2} 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-blue-500" 
												value={completeData.address_details} 
												onChange={e => setCompleteData({...completeData, address_details: e.target.value})}
												placeholder="Ex: Perto da escola, próximo ao mercado..."
											/>
										</div>
									</div>
								</div>
							)}

							{/* PÁGINA 3: Família */}
							{currentFormPage === 3 && (
								<div className="space-y-4">
									<h3 className="flex items-center gap-2 font-medium text-lg bg-gray-50 p-3 rounded-lg">
										<Users className="h-6 w-6 text-purple-600" />
										A Sua Família
									</h3>
									<div className="pl-4 space-y-4">
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Estado Civil</label>
											<div className="grid grid-cols-2 gap-2">
												{[
													{ value: 'solteiro', label: '💍 Solteiro(a)' },
													{ value: 'casado', label: '👫 Casado(a)' },
													{ value: 'viuvo', label: '⚫ Viúvo(a)' },
													{ value: 'divorciado', label: '💔 Divorciado(a)' }
												].map(option => (
													<button
														key={option.value}
														type="button"
														className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
															completeData.family_status === option.value 
															? 'bg-purple-100 border-purple-500 text-purple-700' 
															: 'border-gray-300 hover:border-gray-400'
														}`}
														onClick={() => setCompleteData({...completeData, family_status: option.value})}
													>
														{option.label}
													</button>
												))}
											</div>
										</div>
										
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Quantas pessoas moram na sua casa?</label>
											<div className="grid grid-cols-3 gap-2">
												{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
													<button
														key={num}
														type="button"
														className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
															completeData.family_members_count === num 
															? 'bg-purple-100 border-purple-500 text-purple-700' 
															: 'border-gray-300 hover:border-gray-400'
														}`}
														onClick={() => setCompleteData({...completeData, family_members_count: num})}
													>
														{num === 1 ? 'Só eu' : num >= 10 ? '10+' : `${num}`}
													</button>
												))}
											</div>
										</div>

										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Quantas crianças (menores de 18 anos)?</label>
											<div className="grid grid-cols-5 gap-2">
												{[0, 1, 2, 3, 4, 5].map(num => (
													<button
														key={num}
														type="button"
														className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
															completeData.children_count === num 
															? 'bg-blue-100 border-blue-500 text-blue-700' 
															: 'border-gray-300 hover:border-gray-400'
														}`}
														onClick={() => setCompleteData({...completeData, children_count: num})}
													>
														{num === 0 ? 'Nenhuma' : num >= 5 ? '5+' : `${num}`}
													</button>
												))}
											</div>
										</div>

										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Quantos idosos (maiores de 60 anos)?</label>
											<div className="grid grid-cols-5 gap-2">
												{[0, 1, 2, 3, 4].map(num => (
													<button
														key={num}
														type="button"
														className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
															completeData.elderly_count === num 
															? 'bg-orange-100 border-orange-500 text-orange-700' 
															: 'border-gray-300 hover:border-gray-400'
														}`}
														onClick={() => setCompleteData({...completeData, elderly_count: num})}
													>
														{num === 0 ? 'Nenhum' : num >= 4 ? '4+' : `${num}`}
													</button>
												))}
											</div>
										</div>

										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Pessoas com deficiência na família?</label>
											<div className="grid grid-cols-5 gap-2">
												{[0, 1, 2, 3, 4].map(num => (
													<button
														key={num}
														type="button"
														className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors ${
															completeData.disabled_count === num 
															? 'bg-red-100 border-red-500 text-red-700' 
															: 'border-gray-300 hover:border-gray-400'
														}`}
														onClick={() => setCompleteData({...completeData, disabled_count: num})}
													>
														{num === 0 ? 'Nenhuma' : num >= 4 ? '4+' : `${num}`}
													</button>
												))}
											</div>
										</div>
									</div>
								</div>
							)}

							{/* PÁGINA 4: Situação Socioeconômica */}
							{currentFormPage === 4 && (
								<div className="space-y-4">
									<h3 className="flex items-center gap-2 font-medium text-lg bg-gray-50 p-3 rounded-lg">
										<GraduationCap className="h-6 w-6 text-indigo-600" />
										Educação e Trabalho
									</h3>
									<div className="pl-4 space-y-4">
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Qual é o seu nível de educação?</label>
											<div className="grid grid-cols-1 gap-2">
												{[
													{ value: 'nenhuma', label: '📚 Nunca fui à escola' },
													{ value: 'primario', label: '📖 Escola primária (1ª a 7ª classe)' },
													{ value: 'secundario', label: '🎓 Escola secundária (8ª a 12ª classe)' },
													{ value: 'tecnico', label: '🔧 Curso técnico/profissional' },
													{ value: 'superior', label: '🏛️ Universidade' }
												].map(option => (
													<button
														key={option.value}
														type="button"
														className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors text-left ${
															completeData.education_level === option.value 
															? 'bg-indigo-100 border-indigo-500 text-indigo-700' 
															: 'border-gray-300 hover:border-gray-400'
														}`}
														onClick={() => setCompleteData({...completeData, education_level: option.value})}
													>
														{option.label}
													</button>
												))}
											</div>
										</div>

										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Qual é a sua situação de trabalho?</label>
											<div className="grid grid-cols-1 gap-2">
												{[
													{ value: 'formal', label: '💼 Tenho trabalho fixo' },
													{ value: 'autonomo', label: '🛠️ Trabalho por conta própria' },
													{ value: 'desempregado', label: '❌ Não tenho trabalho' },
													{ value: 'estudante', label: '📚 Sou estudante' },
													{ value: 'aposentado', label: '🏖️ Aposentado' },
													{ value: 'domestico', label: '🏠 Trabalho doméstico' },
													{ value: 'informal', label: '📦 Trabalho informal' }
												].map(option => (
													<button
														key={option.value}
														type="button"
														className={`p-3 border-2 rounded-lg text-sm font-medium transition-colors text-left ${
															completeData.employment_status === option.value 
															? 'bg-green-100 border-green-500 text-green-700' 
															: 'border-gray-300 hover:border-gray-400'
														}`}
														onClick={() => setCompleteData({...completeData, employment_status: option.value})}
													>
														{option.label}
													</button>
												))}
											</div>
										</div>

										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Renda mensal da família (opcional)</label>
											<select 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-blue-500" 
												value={completeData.monthly_income} 
												onChange={e => setCompleteData({...completeData, monthly_income: parseInt(e.target.value)})}
											>
												<option value={0}>Prefiro não informar</option>
												<option value={1000}>Menos de 1.000 MZN</option>
												<option value={2500}>1.000 - 2.500 MZN</option>
												<option value={5000}>2.500 - 5.000 MZN</option>
												<option value={10000}>5.000 - 10.000 MZN</option>
												<option value={15000}>10.000 - 15.000 MZN</option>
												<option value={20000}>Mais de 15.000 MZN</option>
											</select>
											<p className="text-xs text-gray-500 mt-1">Esta informação ajuda-nos a avaliar a sua situação</p>
										</div>
									</div>
								</div>
							)}

							{/* PÁGINA 5: Vulnerabilidades e Necessidades */}
							{currentFormPage === 5 && (
								<div className="space-y-4">
									<h3 className="flex items-center gap-2 font-medium text-lg bg-gray-50 p-3 rounded-lg">
										<AlertTriangle className="h-6 w-6 text-red-600" />
										Situações Especiais e Necessidades
									</h3>
									<div className="pl-4 space-y-4">
										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">É uma pessoa deslocada?</label>
											<div className="grid grid-cols-2 gap-3">
												<button
													type="button"
													className={`p-4 border-2 rounded-lg text-base font-medium transition-colors ${
														completeData.is_displaced === false 
														? 'bg-green-100 border-green-500 text-green-700' 
														: 'border-gray-300 hover:border-gray-400'
													}`}
													onClick={() => setCompleteData({...completeData, is_displaced: false, displacement_reason: ''})}
												>
													✅ Não
												</button>
												<button
													type="button"
													className={`p-4 border-2 rounded-lg text-base font-medium transition-colors ${
														completeData.is_displaced === true 
														? 'bg-orange-100 border-orange-500 text-orange-700' 
														: 'border-gray-300 hover:border-gray-400'
													}`}
													onClick={() => setCompleteData({...completeData, is_displaced: true})}
												>
													⚠️ Sim
												</button>
											</div>
											{completeData.is_displaced && (
												<div className="mt-3">
													<label className="block text-sm font-medium mb-1 text-gray-700">Por que foi deslocado?</label>
													<textarea 
														rows={2} 
														className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:border-orange-500" 
														value={completeData.displacement_reason} 
														onChange={e => setCompleteData({...completeData, displacement_reason: e.target.value})}
														placeholder="Ex: Guerra, desastres naturais, conflitos..."
													/>
												</div>
											)}
										</div>

										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Tem alguma doença crónica na família?</label>
											<div className="grid grid-cols-2 gap-3">
												<button
													type="button"
													className={`p-4 border-2 rounded-lg text-base font-medium transition-colors ${
														completeData.has_chronic_illness === false 
														? 'bg-green-100 border-green-500 text-green-700' 
														: 'border-gray-300 hover:border-gray-400'
													}`}
													onClick={() => setCompleteData({...completeData, has_chronic_illness: false, chronic_illness_details: ''})}
												>
													✅ Não
												</button>
												<button
													type="button"
													className={`p-4 border-2 rounded-lg text-base font-medium transition-colors ${
														completeData.has_chronic_illness === true 
														? 'bg-red-100 border-red-500 text-red-700' 
														: 'border-gray-300 hover:border-gray-400'
													}`}
													onClick={() => setCompleteData({...completeData, has_chronic_illness: true})}
												>
													❤️ Sim
												</button>
											</div>
											{completeData.has_chronic_illness && (
												<div className="mt-3">
													<label className="block text-sm font-medium mb-1 text-gray-700">Que tipo de doença?</label>
													<textarea 
														rows={2} 
														className="w-full border-2 rounded-lg px-3 py-2 text-sm focus:border-red-500" 
														value={completeData.chronic_illness_details} 
														onChange={e => setCompleteData({...completeData, chronic_illness_details: e.target.value})}
														placeholder="Ex: Diabetes, hipertensão, HIV/SIDA..."
													/>
												</div>
											)}
										</div>

										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Do que precisa de ajuda?</label>
											<textarea 
												required 
												rows={4} 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-blue-500" 
												value={completeData.priority_needs} 
												onChange={e => setCompleteData({...completeData, priority_needs: e.target.value})}
												placeholder="Ex: Comida para a família, medicamentos, materiais escolares, ajuda para encontrar trabalho..."
											/>
											<p className="text-xs text-gray-500 mt-1">Conte-nos as suas maiores necessidades</p>
										</div>

										<div>
											<label className="block text-base font-medium mb-2 text-gray-700">Informações adicionais (opcional)</label>
											<textarea 
												rows={3} 
												className="w-full border-2 rounded-lg px-4 py-3 text-base focus:border-blue-500" 
												value={completeData.additional_information} 
												onChange={e => setCompleteData({...completeData, additional_information: e.target.value})}
												placeholder="Qualquer outra informação que ache importante..."
											/>
										</div>
									</div>
								</div>
							)}

							{/* Botões de navegação */}
							<div className="flex justify-between pt-6">
								{currentFormPage > 1 && (
									<Button 
										type="button"
										variant="outline"
										onClick={prevFormPage}
										className="flex items-center gap-2"
									>
										← Anterior
									</Button>
								)}
								
								<div className="flex-1"></div>
								
								{currentFormPage < totalFormPages ? (
									<Button 
										type="button"
										onClick={nextFormPage}
										disabled={!isCurrentPageValid()}
										className="flex items-center gap-2"
									>
										Próximo →
									</Button>
								) : (
									<Button 
										type="submit" 
										disabled={completing || !isCurrentPageValid()}
										className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
									>
										<Save className="h-5 w-5" /> 
										{completing ? 'A guardar...' : 'Finalizar Cadastro'}
									</Button>
								)}
							</div>
						</form>
					</CardContent>
				</Card>
			) : (
					<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
				<TabsList className="grid w-full grid-cols-4">
					<TabsTrigger value="overview" className="flex items-center gap-2">
						<Home className="h-4 w-4" /> Visão Geral
					</TabsTrigger>
					<TabsTrigger value="requests" className="flex items-center gap-2">
						<FileText className="h-4 w-4" /> Solicitações
					</TabsTrigger>
				</TabsList>

				<TabsContent value="overview" className="mt-6 space-y-6">
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium">Resumo</CardTitle>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="animate-pulse h-24 bg-gray-100 rounded" />
							) : bStats?.profile ? (
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
									<div className="space-y-1">
										<p><span className="text-muted-foreground">Nome:</span> <strong>{bStats.profile.full_name}</strong></p>
										<p><span className="text-muted-foreground">Idade:</span> <strong>{bStats.profile.age} anos</strong></p>
										<p><span className="text-muted-foreground">Local:</span> <strong>{bStats.profile.district}, {bStats.profile.locality}</strong></p>
									</div>
									<div className="space-y-1">
										<p><span className="text-muted-foreground">Família:</span> <strong>{bStats.profile.family_members_count}</strong></p>
										<p><span className="text-muted-foreground">Vulnerabilidade:</span> <strong>{vulnerabilityLabel(bStats.profile.vulnerability_score)} ({bStats.profile.vulnerability_score})</strong></p>
										<div><span className="text-muted-foreground">Verificação:</span> {bStats.profile.is_verified ? <Badge className="bg-green-100 text-green-700">Verificado</Badge> : <Badge className="bg-yellow-100 text-yellow-700">Pendente</Badge>}</div>
									</div>
									<div className="space-y-1">
										<p><span className="text-muted-foreground">Solicitações:</span> <strong>{bStats.requests_count}</strong></p>
										<p><span className="text-muted-foreground">Aprovadas:</span> <strong>{bStats.approved_requests}</strong></p>
										<p><span className="text-muted-foreground">Concluídas:</span> <strong>{bStats.completed_requests}</strong></p>
									</div>
								</div>
							) : (
								<div className="text-sm text-muted-foreground">Nenhum perfil de beneficiário encontrado. Complete seu registro.</div>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="text-sm font-medium flex justify-between items-center">Solicitações Recentes
								<Badge variant="outline">{bStats?.requests_count || 0} total</Badge>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{loading ? (
								<div className="animate-pulse h-20 bg-gray-100 rounded" />
							) : bStats?.recent_requests?.length ? (
								<div className="space-y-3">
									{bStats.recent_requests.slice(0, 5).map(req => (
										<div key={req.id} className="p-3 border rounded-lg flex items-center justify-between">
											<div>
												<p className="font-medium text-sm">{req.title}</p>
												<p className="text-xs text-muted-foreground line-clamp-1">{req.description}</p>
											</div>
											<Badge variant="secondary" className="capitalize ml-2 whitespace-nowrap">{req.status.replace('_',' ')}</Badge>
										</div>
									))}
								</div>
							) : (
								<p className="text-sm text-muted-foreground">Nenhuma solicitação registrada.</p>
							)}
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="requests" className="mt-6">
					{showCreateForm ? (
						<CreateRequestForm 
							newRequest={newRequest}
							setNewRequest={setNewRequest}
							onSubmit={handleCreateRequest}
							onCancel={() => setShowCreateForm(false)}
							creating={creatingRequest}
							getRequestTypeIcon={getRequestTypeIcon}
						/>
					) : (
						<RequestsManager 
							requests={filteredRequests}
							loading={loadingRequests}
							filterStatus={filterStatus}
							setFilterStatus={setFilterStatus}
							onCreateNew={() => setShowCreateForm(true)}
							onSelectRequest={(req) => {
								setSelectedRequest(req);
								setActiveTab('messages');
								fetchRequestMessages(req.id);
							}}
							getStatusColor={getStatusColor}
							getUrgencyColor={getUrgencyColor}
							getRequestTypeIcon={getRequestTypeIcon}
						/>
					)}
				</TabsContent>

			</Tabs>) }
		</div>
	);
};

// Componente para criação de nova solicitação
const CreateRequestForm = ({ newRequest, setNewRequest, onSubmit, onCancel, creating, getRequestTypeIcon }: {
	newRequest: NewSupportRequest;
	setNewRequest: (req: NewSupportRequest) => void;
	onSubmit: () => void;
	onCancel: () => void;
	creating: boolean;
	getRequestTypeIcon: (type: string) => React.ReactNode;
}) => (
	<Card>
		<CardHeader>
			<CardTitle className="flex items-center gap-2">
				<Plus className="w-5 h-5" />
				Nova Solicitação
			</CardTitle>
		</CardHeader>
		<CardContent className="space-y-6">
			<div className="space-y-2">
				<Label className="text-base">📋 Tipo de Ajuda</Label>
				<Select value={newRequest.request_type} onValueChange={(value) => setNewRequest({...newRequest, request_type: value})}>
					<SelectTrigger className="h-12 text-base">
						<SelectValue placeholder="Selecione o tipo de ajuda" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="alimentar">
							<div className="flex items-center gap-2">
								{getRequestTypeIcon('alimentar')}
								Apoio Alimentar
							</div>
						</SelectItem>
						<SelectItem value="medico">
							<div className="flex items-center gap-2">
								{getRequestTypeIcon('medico')}
								Apoio Médico
							</div>
						</SelectItem>
						<SelectItem value="educacao">
							<div className="flex items-center gap-2">
								{getRequestTypeIcon('educacao')}
								Apoio Educacional
							</div>
						</SelectItem>
						<SelectItem value="habitacao">
							<div className="flex items-center gap-2">
								{getRequestTypeIcon('habitacao')}
								Apoio Habitacional
							</div>
						</SelectItem>
						<SelectItem value="emergencia">
							<div className="flex items-center gap-2">
								{getRequestTypeIcon('emergencia')}
								Emergência
							</div>
						</SelectItem>
						<SelectItem value="outro">
							<div className="flex items-center gap-2">
								{getRequestTypeIcon('outro')}
								Outro
							</div>
						</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label className="text-base">🧾 Título da Solicitação</Label>
				<Input
					value={newRequest.title}
					onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
					placeholder="Ex: Apoio com cesta básica"
					className="h-12 text-base"
				/>
			</div>

			<div className="space-y-2">
				<Label className="text-base">👥 Nº de Pessoas Beneficiadas</Label>
				<Input
					type="number"
					min={1}
					value={newRequest.estimated_beneficiaries}
					onChange={(e) => setNewRequest({...newRequest, estimated_beneficiaries: Number(e.target.value) || 1})}
					className="h-12 text-base"
				/>
			</div>

			<div className="space-y-2">
				<Label className="text-base">📝 Conte sobre sua necessidade</Label>
				<Textarea
					value={newRequest.description}
					onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
					placeholder="Descreva o que você precisa de forma simples..."
					className="min-h-[100px] text-base"
				/>
			</div>

			<div className="space-y-2">
				<Label className="text-base">⚠️ Urgência</Label>
				<Select value={newRequest.urgency} onValueChange={(value) => setNewRequest({...newRequest, urgency: value})}>
					<SelectTrigger className="h-12 text-base">
						<SelectValue placeholder="Quão urgente é?" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="baixa">🟢 Não é urgente</SelectItem>
						<SelectItem value="media">🟡 Moderado</SelectItem>
						<SelectItem value="alta">🟠 Urgente</SelectItem>
						<SelectItem value="critica">🔴 Muito urgente</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="space-y-2">
				<Label className="text-base">💰 Valor aproximado (opcional)</Label>
				<Input
					type="number"
					value={newRequest.estimated_cost || ''}
					onChange={(e) => setNewRequest({...newRequest, estimated_cost: e.target.value ? Number(e.target.value) : undefined})}
					placeholder="Ex: 500"
					className="h-12 text-base"
				/>
				<p className="text-sm text-muted-foreground">Se souber quanto custa, nos ajuda a organizar melhor</p>
			</div>

			<div className="space-y-2">
				<Label className="text-base">📅 Quando precisa? (opcional)</Label>
				<Input
					type="date"
					value={newRequest.needed_by_date || ''}
					onChange={(e) => setNewRequest({...newRequest, needed_by_date: e.target.value})}
					className="h-12 text-base"
				/>
			</div>

			<div className="flex gap-3 pt-4">
				<Button 
					onClick={onSubmit} 
					disabled={!newRequest.request_type || !newRequest.description || creating}
					className="flex-1 h-12 text-base"
				>
					{creating ? 'Enviando...' : '📤 Enviar Solicitação'}
				</Button>
				<Button 
					variant="outline" 
					onClick={onCancel}
					className="h-12 px-6"
				>
					❌ Cancelar
				</Button>
			</div>
		</CardContent>
	</Card>
);

// Componente para gerenciar lista de solicitações
const RequestsManager = ({ requests, loading, filterStatus, setFilterStatus, onCreateNew, onSelectRequest, getStatusColor, getUrgencyColor, getRequestTypeIcon }: {
	requests: SupportRequestSummary[];
	loading: boolean;
	filterStatus: string;
	setFilterStatus: (status: string) => void;
	onCreateNew: () => void;
	onSelectRequest: (request: SupportRequestSummary) => void;
	getStatusColor: (status: string) => string;
	getUrgencyColor: (urgency: string) => string;
	getRequestTypeIcon: (type: string) => React.ReactNode;
}) => (
	<div className="space-y-6">
		<div className="flex flex-col sm:flex-row gap-4 justify-between">
			<div className="flex items-center gap-2">
				<Filter className="w-5 h-5" />
				<Select value={filterStatus} onValueChange={setFilterStatus}>
					<SelectTrigger className="w-48">
						<SelectValue placeholder="Filtrar por status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="todos">Todos</SelectItem>
						<SelectItem value="pendente">Pendente</SelectItem>
						<SelectItem value="em_analise">Em Análise</SelectItem>
						<SelectItem value="aprovado">Aprovado</SelectItem>
						<SelectItem value="rejeitado">Rejeitado</SelectItem>
						<SelectItem value="concluido">Concluído</SelectItem>
					</SelectContent>
				</Select>
			</div>
			
			<Button onClick={onCreateNew} className="flex items-center gap-2">
				<Plus className="w-4 h-4" />
				Nova Solicitação
			</Button>
		</div>

		{loading ? (
			<div className="text-center py-8">
				<p>Carregando solicitações...</p>
			</div>
		) : requests.length === 0 ? (
			<Card>
				<CardContent className="text-center py-8">
					<p className="text-muted-foreground mb-4">Nenhuma solicitação encontrada</p>
					<Button onClick={onCreateNew}>Criar primeira solicitação</Button>
				</CardContent>
			</Card>
		) : (
			<div className="grid gap-4">
				{requests.map((request) => (
					<Card key={request.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onSelectRequest(request)}>
						<CardContent className="p-4">
							<div className="flex items-start justify-between mb-2">
								<div className="flex items-center gap-2">
									{getRequestTypeIcon(request.request_type)}
									<span className="font-medium capitalize">{request.request_type}</span>
								</div>
								<div className="flex items-center gap-2">
									<span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(request.status)}`}>
										{request.status}
									</span>
									<span className={`px-2 py-1 rounded-full text-xs ${getUrgencyColor(request.urgency)}`}>
										{request.urgency}
									</span>
								</div>
							</div>
							
							<p className="text-sm text-muted-foreground mb-2 line-clamp-2">
								{request.description}
							</p>
							
							<div className="flex items-center justify-between text-xs text-muted-foreground">
								<span>Criada em: {new Date(request.created_at).toLocaleDateString('pt-BR')}</span>
								<div className="flex items-center gap-3">
									{request.estimated_cost && (
										<span className="flex items-center gap-1">
											<DollarSign className="w-3 h-3" />
											{request.estimated_cost.toLocaleString('pt-BR')} MT
										</span>
									)}
									{request.needed_by_date && (
										<span className="flex items-center gap-1">
											<Calendar className="w-3 h-3" />
											{new Date(request.needed_by_date).toLocaleDateString('pt-BR')}
										</span>
									)}
									{request.communications_count > 0 && (
										<span>💬 {request.communications_count} mensagens</span>
									)}
								</div>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		)}
	</div>
);

export default BeneficiaryDashboard;
