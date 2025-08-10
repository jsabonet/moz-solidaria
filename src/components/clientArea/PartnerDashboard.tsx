// src/components/clientArea/PartnerDashboard.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Building, 
  Users, 
  Handshake,
  Send,
  MessageSquare,
  RefreshCw,
  Loader2,
  AlertCircle,
  Clock,
  Bell
} from 'lucide-react';
import api from '@/lib/api';
import { DashboardStats } from '@/types/clientArea';
import PartnerAssignmentNotifications from '../PartnerAssignmentNotifications';

interface PartnerDashboardProps {
  stats: DashboardStats | null;
}

interface PartnerMessage {
  id: number;
  content: string;
  sender_type: 'admin' | 'partner';
  created_at: string;
  read?: boolean;
  attachment_url?: string;
}

interface PartnerProjectSummary {
  id: number;
  name: string;
  slug: string;
  progress_percentage?: number;
  metrics?: {
    progressPercentage?: number;
  };
  priority?: string;
  status?: string;
}

interface AssignmentApiItem {
  id: number;
  status: string;
  project: number;
  project_details: {
    id: number;
    name?: string; // new backend field
    title?: string; // legacy fallback
    slug: string;
    status?: string;
    progress_percentage?: number;
    metrics?: { progressPercentage?: number };
    priority?: string;
  };
}

const PartnerDashboard: React.FC<PartnerDashboardProps> = ({ stats }) => {
  const partnerStats = stats?.stats || {};
  const organizationName = partnerStats.organization_name || 'Organização Parceira';
  const organizationType = (partnerStats.organization_type as unknown as string) || 'ngo';
  const partnershipLevel = (partnerStats.partnership_level as unknown as string) || 'operational';

  // Mensagens
  const [messages, setMessages] = useState<PartnerMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sending, setSending] = useState(false);
  const [messageContent, setMessageContent] = useState('');
  const [messageError, setMessageError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [nextMessagesUrl, setNextMessagesUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const initialLoadedRef = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  // Projetos atribuídos ao parceiro
  const [projects, setProjects] = useState<PartnerProjectSummary[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [showProjectsMobile, setShowProjectsMobile] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
    const [mobileView, setMobileView] = useState<'messages' | 'projects' | 'assignments'>('messages');

  const getPartnershipTypeColor = (type: string) => {
    switch (type) {
      case 'ngo': return 'bg-green-500 text-white';
      case 'government': return 'bg-blue-500 text-white';
      case 'private': return 'bg-purple-500 text-white';
      case 'international': return 'bg-orange-500 text-white';
      case 'academic': return 'bg-indigo-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const fetchMessages = useCallback(async () => {
    setLoadingMessages(true);
    setMessageError(null);
    try {
  // Updated endpoint to new partnerships API
  const res = await api.get('/partnerships/messages/');
      const data = res.data;
      const list = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
      if (Array.isArray(list)) {
        const sorted = [...list].sort((a:any,b:any)=> new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        setMessages(sorted);
      }
      setNextMessagesUrl(data.next || null);
    } catch (err: any) {
      console.error('[PartnerDashboard] Erro ao carregar mensagens', err);
      setMessageError('Não foi possível carregar mensagens agora.');
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  const loadMoreMessages = async () => {
    if (!nextMessagesUrl || loadingMore) return;
    setLoadingMore(true);
    try {
      const res = await api.get(nextMessagesUrl);
      const data = res.data;
      const list = Array.isArray(data.results) ? data.results : Array.isArray(data) ? data : [];
      if (Array.isArray(list) && list.length) {
        setMessages(prev => {
          const ids = new Set(prev.map(m => m.id));
          const additions = list.filter(m => !ids.has(m.id));
            const merged = [...prev, ...additions];
            return merged.sort((a:any,b:any)=> new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
      }
      setNextMessagesUrl(data.next || null);
    } catch (err) {
      console.warn('[PartnerDashboard] Falha ao carregar mais mensagens');
    } finally {
      setLoadingMore(false);
    }
  };

  const fetchProjects = useCallback(async () => {
    setLoadingProjects(true);
    try {
      // Nova lógica: derivar projetos a partir das atribuições do parceiro (accepted/completed)
      const res = await api.get('/partnerships/assignments/');
      const raw = res.data.results || res.data || [];
      if (Array.isArray(raw)) {
        const assignments: AssignmentApiItem[] = raw.filter((a: any) => a && a.project_details);
        const validStatuses = new Set(['accepted','completed']);
        const projectMap = new Map<number, PartnerProjectSummary>();
        assignments.forEach(a => {
          if (!validStatuses.has(a.status)) return; // somente vinculados realmente aceitos
          const pd = a.project_details;
          if (!projectMap.has(pd.id)) {
            projectMap.set(pd.id, {
              id: pd.id,
              name: pd.name || pd.title || `Projeto #${pd.id}`,
              slug: pd.slug,
              progress_percentage: (pd as any).progress_percentage,
              metrics: pd.metrics,
              priority: (pd as any).priority,
              status: pd.status
            });
          }
        });
        const list = Array.from(projectMap.values());
        if (list.length === 0) {
          // fallback antigo se nenhuma atribuição (para compatibilidade temporária)
          try {
            const fallback = await api.get('/projects/?assigned_to_partner=1');
            const data = fallback.data.results || fallback.data || [];
            if (Array.isArray(data)) {
              const simplified = data.map((p: any) => ({
                id: p.id,
                name: p.name,
                slug: p.slug,
                progress_percentage: p.progress_percentage,
                metrics: p.metrics,
                priority: p.priority,
                status: p.status
              }));
              setProjects(simplified);
              return;
            }
          } catch {
            // ignora fallback
          }
        }
        setProjects(list);
      }
    } catch (err) {
      console.warn('[PartnerDashboard] Falha ao buscar atribuições para derivar projetos vinculados');
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    fetchMessages();
    fetchProjects();
  }, [fetchMessages, fetchProjects, refreshTick]);

  // Scroll ao final ao carregar ou enviar
  useEffect(() => {
    if (!messages.length) return;
    if (!initialLoadedRef.current) {
      initialLoadedRef.current = true;
      if (autoScroll) messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      return;
    }
    if (autoScroll) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, autoScroll]);

  // Marcar mensagens de admin como lidas
  useEffect(() => {
    const unreadAdmin = messages.filter(m => !m.read && m.sender_type === 'admin').map(m => m.id);
    if (!unreadAdmin.length) return;
    (async () => {
      try {
  await api.post('/partnerships/messages/mark_multiple_as_read/', { message_ids: unreadAdmin });
        setMessages(prev => prev.map(m => unreadAdmin.includes(m.id) ? { ...m, read: true } : m));
      } catch {
  unreadAdmin.forEach(async id => { try { await api.post(`/partnerships/messages/${id}/mark_as_read/`); } catch {} });
        setMessages(prev => prev.map(m => unreadAdmin.includes(m.id) ? { ...m, read: true } : m));
      }
    })();
  }, [messages]);

  // SSE / WebSocket realtime
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    const connectSSE = () => {
      try {
        const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
        const es = new EventSource(`${API_BASE}/partnerships/messages/stream/`);
        eventSourceRef.current = es;
        es.onmessage = (e) => {
          try {
            if (!e.data) return;
            const payload = JSON.parse(e.data);
            if (payload.type === 'new_message' && payload.data) {
              const msg = payload.data;
              // Only append if addressed to this partner (recipient is self) or sent by partner (should already be present after send)
              setMessages(prev => {
                if (prev.find(m => m.id === msg.id)) return prev;
                const next = [...prev, msg];
                return next.sort((a:any,b:any)=> new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              });
            }
          } catch {}
        };
        es.onerror = () => {
          es.close();
          eventSourceRef.current = null;
          connectWS();
        };
        cleanup = () => { es.close(); };
      } catch {
        connectWS();
      }
    };
    const connectWS = () => {
      try {
        const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const ws = new WebSocket(`${proto}://${window.location.host}/ws/partner/messages/`);
        wsRef.current = ws;
        ws.onmessage = (e) => {
          try {
            const data = JSON.parse(e.data);
            if (data && data.id) {
              setMessages(prev => {
                if (prev.find(m => m.id === data.id)) return prev;
                const next = [...prev, data];
                return next.sort((a:any,b:any)=> new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              });
            }
          } catch {}
        };
        ws.onclose = () => { wsRef.current = null; };
        cleanup = () => { ws.close(); };
      } catch {
        cleanup = () => {};
      }
    };
    connectSSE();
    return () => { cleanup && cleanup(); };
  }, []);

  const sendMessage = async () => {
    if (!messageContent.trim() && !selectedFile) return;
    setSending(true);
    setMessageError(null);
    try {
      let res;
      if (selectedFile) {
        const form = new FormData();
        form.append('content', messageContent.trim());
        form.append('attachment', selectedFile);
  res = await api.post('/partnerships/messages/', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
  // Backend will auto-select an admin recipient if not provided
  res = await api.post('/partnerships/messages/', { content: messageContent.trim() });
      }
      const saved = {
        ...res.data,
        status: res.data.status || 'delivered',
        read: res.data.is_read || false
      };
      setMessages(prev => {
        if (prev.some(m => m.id === saved.id)) return prev;
        const next = [...prev, saved];
        return next.sort((a:any,b:any)=> new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });
      setMessageContent('');
      setSelectedFile(null);
    } catch (err: any) {
      console.error('[PartnerDashboard] Erro ao enviar mensagem', err);
      setMessageError('Falha ao enviar mensagem.');
    } finally {
      setSending(false);
    }
  };

  const calculateProgress = (p: PartnerProjectSummary) => {
    if (p.metrics && p.metrics.progressPercentage && p.metrics.progressPercentage > 0) return p.metrics.progressPercentage;
    if (p.progress_percentage && p.progress_percentage > 0) return p.progress_percentage;
    return 0;
  };

  const formatDateTime = (iso: string) => {
    try { return new Date(iso).toLocaleString('pt-PT'); } catch { return iso; }
  };

  const unreadCount = messages.filter(m => !m.read && m.sender_type === 'admin').length;

  const fetchPartnerProjects = fetchProjects; // alias para reutilizar na atualização pós-resposta

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Parceria (resumido) */}
      <Card>
        <CardHeader className="pb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Handshake className="h-5 w-5" /> Parceria Ativa
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{organizationName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={getPartnershipTypeColor(organizationType)}>{organizationType}</Badge>
            <Badge variant="outline">Nível: {partnershipLevel}</Badge>
            {unreadCount > 0 && <Badge variant="destructive">{unreadCount} novas mensagens</Badge>}
            <Button size="sm" variant="outline" className="md:hidden" onClick={() => setShowProjectsMobile(v=>!v)}>
              {showProjectsMobile ? 'Ocultar Projetos' : 'Projetos'}
            </Button>
            <Button size="sm" variant={autoScroll ? 'secondary':'outline'} className="md:hidden" onClick={()=>setAutoScroll(a=>!a)}>
              {autoScroll ? 'Auto-Scroll ON':'Auto-Scroll OFF'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Comunicação */}
      {/* Mobile Tabs */}
      <div className="lg:hidden space-y-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant={mobileView==='messages' ? 'secondary':'outline'} className="flex-1" onClick={()=>setMobileView('messages')}>Mensagens</Button>
          <Button size="sm" variant={mobileView==='projects' ? 'secondary':'outline'} className="flex-1" onClick={()=>setMobileView('projects')}>Projetos</Button>
          <Button size="sm" variant={mobileView==='assignments' ? 'secondary':'outline'} className="flex-1" onClick={()=>setMobileView('assignments')}>
            <Bell className="h-4 w-4 mr-1" />
            Atribuições
          </Button>
        </div>
        {mobileView === 'messages' && (
          <Card className="flex flex-col h-[70vh]">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" /> Comunicação
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => setRefreshTick(t => t + 1)} disabled={loadingMessages}>
                  {loadingMessages ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto pr-1 space-y-4 border rounded-md p-3 bg-muted/30" aria-label="Lista de mensagens" aria-live="polite">
                {nextMessagesUrl && (
                  <div className="sticky top-0 z-10 flex justify-center mb-2">
                    <Button size="sm" variant="outline" disabled={loadingMore} onClick={loadMoreMessages} className="text-[11px] h-6 px-2">
                      {loadingMore ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Carregar mais'}
                    </Button>
                  </div>
                )}
                {loadingMessages && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando mensagens...</div>
                )}
                {!loadingMessages && messages.length === 0 && (
                  <div className="text-sm text-muted-foreground flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Nenhuma mensagem ainda.</div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex flex-col ${msg.sender_type === 'partner' ? 'items-end' : 'items-start'}`}>
                    <div className={`max-w-[85%] rounded-lg px-3 py-2 text-sm shadow-sm space-y-1 ${msg.sender_type === 'partner' ? 'bg-primary text-white' : 'bg-white border'}`}>
                      {msg.content && <p className="whitespace-pre-wrap leading-relaxed break-words">{msg.content}</p>}
                      {msg.attachment_url && (
                        <div>
                          <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className={`text-xs underline ${msg.sender_type === 'partner' ? 'text-white' : 'text-blue-600'}`}>Ver Anexo</a>
                        </div>
                      )}
                      <div className={`text-[10px] opacity-70 flex items-center gap-1 ${msg.sender_type === 'partner' ? 'text-white' : 'text-muted-foreground'}`}>
                        <Clock className="h-3 w-3" /> {formatDateTime(msg.created_at)} {msg.sender_type === 'admin' && !msg.read && <span className="ml-1">•</span>}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
                {messageError && <p className="text-xs text-red-600">{messageError}</p>}
              </div>
              <div className="mt-3 space-y-2 border-t pt-2 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50">
                <Textarea
                  placeholder="Escreva uma mensagem..."
                  value={messageContent}
                  onChange={e => setMessageContent(e.target.value)}
                  className="resize-none h-24"
                />
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <input id="file-input-partner-mobile" type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                  <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={()=>document.getElementById('file-input-partner-mobile')?.click()}>
                    {selectedFile ? 'Trocar Anexo':'Anexo'}
                  </Button>
                  {selectedFile && <span className="truncate max-w-[140px]" title={selectedFile.name}>{selectedFile.name}</span>}
                  {selectedFile && <Button type="button" variant="ghost" size="sm" className="h-6 px-2" onClick={()=>setSelectedFile(null)}>Remover</Button>}
                  <Button size="sm" onClick={sendMessage} disabled={sending || (!messageContent.trim() && !selectedFile)} className="ml-auto">
                    {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}Enviar
                  </Button>
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <button type="button" onClick={()=>setAutoScroll(a=>!a)} className="underline">{autoScroll ? 'Desativar auto-scroll':'Ativar auto-scroll'}</button>
                  <span>{messages.length} msgs</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        {mobileView === 'projects' && (
          <Card className="flex flex-col h-[70vh]">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Building className="h-4 w-4" /> Projetos Vinculados
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 overflow-y-auto pr-1">
              {loadingProjects && <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Carregando projetos...</div>}
              {!loadingProjects && projects.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum projeto vinculado ainda.</p>
              )}
              {projects.map(p => {
                const progress = calculateProgress(p);
                return (
                  <div key={p.id} className="border rounded-md p-3 bg-muted/20 space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="text-sm font-medium leading-tight break-words">{p.name}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {p.priority && <Badge variant="outline" className="text-[10px]">Prioridade: {p.priority}</Badge>}
                          {p.status && <Badge variant="outline" className="text-[10px]">Status: {p.status}</Badge>}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
        {mobileView === 'assignments' && (
          <PartnerAssignmentNotifications 
            className="h-[70vh] overflow-y-auto"
            onAssignmentResponse={() => {
              // Refresh partner projects when assignment is responded to
              fetchPartnerProjects();
            }}
          />
        )}
      </div>
      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-6">
        {/* Comunicação */}
        <Card className="lg:col-span-2 flex flex-col max-h-[560px] md:h-[560px] h-[calc(100vh-320px)]">
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <MessageSquare className="h-4 w-4" /> Comunicação com Administração
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setRefreshTick(t => t + 1)} disabled={loadingMessages}>
                {loadingMessages ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto pr-1 space-y-4 border rounded-md p-3 bg-muted/30 relative">
              {nextMessagesUrl && (
                <div className="sticky top-0 z-10 flex justify-center mb-2">
                  <Button size="sm" variant="outline" disabled={loadingMore} onClick={loadMoreMessages} className="text-[11px] h-6 px-2">
                    {loadingMore ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Carregar mais'}
                  </Button>
                </div>
              )}
              {loadingMessages && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando mensagens...</div>
              )}
              {!loadingMessages && messages.length === 0 && (
                <div className="text-sm text-muted-foreground flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Nenhuma mensagem ainda.</div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex flex-col ${msg.sender_type === 'partner' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm space-y-1 ${msg.sender_type === 'partner' ? 'bg-primary text-white' : 'bg-white border'}`}>
                    {msg.content && <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>}
                    {msg.attachment_url && (
                      <div>
                        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer" className={`text-xs underline ${msg.sender_type === 'partner' ? 'text-white' : 'text-blue-600'}`}>Ver Anexo</a>
                      </div>
                    )}
                    <div className={`text-[10px] opacity-70 flex items-center gap-1 ${msg.sender_type === 'partner' ? 'text-white' : 'text-muted-foreground'}`}>
                      <Clock className="h-3 w-3" /> {formatDateTime(msg.created_at)} {msg.sender_type === 'admin' && !msg.read && <span className="ml-1">•</span>}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {messageError && <p className="text-xs text-red-600">{messageError}</p>}
            </div>
            <div className="mt-3 space-y-2 border-t pt-2 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/50 sticky bottom-0">
              <Textarea
                placeholder="Escreva uma mensagem para o administrador..."
                value={messageContent}
                onChange={e => setMessageContent(e.target.value)}
                className="resize-none h-24 md:h-20"
              />
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <input id="file-input-partner" type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
                  <Button type="button" size="sm" variant="outline" className="h-8 px-2" onClick={()=>document.getElementById('file-input-partner')?.click()}>
                    {selectedFile ? 'Trocar Anexo':'Anexo'}
                  </Button>
                  {selectedFile && <span className="truncate max-w-[140px]" title={selectedFile.name}>{selectedFile.name}</span>}
                  {selectedFile && <Button type="button" variant="ghost" size="sm" className="h-6 px-2" onClick={()=>setSelectedFile(null)}>Remover</Button>}
                  <span className="text-muted-foreground hidden md:inline">pdf, imagens, docs.</span>
                </div>
                <div className="flex items-center justify-between gap-2 w-full md:w-auto">
                  <Button size="sm" onClick={sendMessage} disabled={sending || (!messageContent.trim() && !selectedFile)} className="ml-auto">
                    {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}Enviar
                  </Button>
                </div>
              </div>
              <div className="flex justify-between md:hidden text-[10px] text-muted-foreground">
                <button type="button" onClick={()=>setAutoScroll(a=>!a)} className="underline">{autoScroll ? 'Desativar auto-scroll':'Ativar auto-scroll'}</button>
                <span>{messages.length} msgs</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Projetos atribuídos */}
        <Card className={`flex flex-col max-h-[560px] ${showProjectsMobile ? 'block':'hidden md:block'}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building className="h-4 w-4" /> Projetos Vinculados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 overflow-y-auto pr-1">
            {loadingProjects && <div className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Carregando projetos...</div>}
            {!loadingProjects && projects.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum projeto vinculado ainda.</p>
            )}
            {projects.map(p => {
              const progress = calculateProgress(p);
              return (
                <div key={p.id} className="border rounded-md p-3 bg-muted/20 space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <p className="text-sm font-medium leading-tight break-words">{p.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.priority && <Badge variant="outline" className="text-[10px]">Prioridade: {p.priority}</Badge>}
                        {p.status && <Badge variant="outline" className="text-[10px]">Status: {p.status}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span>Progresso</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                  </div>
                  <div className="flex gap-2 pt-1 flex-wrap">
                    <Button asChild size="sm" variant="outline" className="text-[11px] h-6 px-2">
                      <a href={`/projetos/${p.slug}`} target="_blank" rel="noopener noreferrer">Ver Público</a>
                    </Button>
                    <Button size="sm" variant="secondary" className="text-[11px] h-6 px-2" onClick={() => setMessageContent(prev => prev ? prev : `Solicito atualização detalhada do projeto \"${p.name}\".`)}>
                      Pedir Atualização
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Atribuições de Projetos */}
      <PartnerAssignmentNotifications 
        className="hidden lg:block" /* Evita duplicação em mobile: já exibido na tab 'Atribuições' */
        onAssignmentResponse={() => {
          // Refresh partner projects when assignment is responded to
          fetchPartnerProjects();
        }}
      />

      {/* Atividades recentes de parceria (se existirem) */}
      {stats?.recent_activities && stats.recent_activities.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" /> Atividades Recentes da Parceria
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.recent_activities.slice(0,5).map((act: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm border-b last:border-b-0 pb-2 last:pb-0">
                <div className="flex-1 mr-4">
                  <p className="font-medium leading-snug">{act.title}</p>
                  {act.description && <p className="text-xs text-muted-foreground line-clamp-2">{act.description}</p>}
                </div>
                {act.timestamp && <span className="text-[10px] text-muted-foreground whitespace-nowrap">{act.timestamp}</span>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PartnerDashboard;
