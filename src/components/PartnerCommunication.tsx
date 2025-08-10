// src/components/PartnerCommunication.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, 
  Send, 
  Users, 
  RefreshCw, 
  Loader2,
  AlertCircle,
  Clock,
  Building,
  Plus,
  UserPlus
} from 'lucide-react';
import api from '@/lib/api';
import ProjectAssignmentModal from './ProjectAssignmentModal';
import PartnerAssignmentsList from './PartnerAssignmentsList';

interface Partner {
  id: number;
  name: string;
  username: string;
  email: string;
  unread_messages: number;
  active_projects: number;
  last_activity: string | null;
}

interface PartnerMessage {
  id: number;
  content: string;
  sender_type: 'admin' | 'partner';
  sender_name: string;
  created_at: string;
  read: boolean;
  attachment_url?: string;
  status?: string;
}

interface PartnerCommunicationProps {
  onPartnerSelect?: (partnerId: number) => void;
}

const PartnerCommunication: React.FC<PartnerCommunicationProps> = ({ onPartnerSelect }) => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [messages, setMessages] = useState<PartnerMessage[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [refreshAssignments, setRefreshAssignments] = useState(0);
  const esRef = React.useRef<EventSource | null>(null);

  useEffect(() => {
    fetchPartners();
  }, []);

  // Realtime (SSE) basic subscription for admin inbound messages
  useEffect(() => {
    // only start after user selects a partner to reduce traffic
    if (!selectedPartner) return;
    if (esRef.current) {
      esRef.current.close();
      esRef.current = null;
    }
    try {
      const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';
      const es = new EventSource(`${API_BASE}/partnerships/messages/stream/`);
      esRef.current = es;
      es.onmessage = (e) => {
        if (!e.data) return;
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'new_message' && payload.data) {
            const msg = payload.data;
            if ((msg.sender === selectedPartner.id || msg.recipient === selectedPartner.id)) {
              const adapted = {
                id: msg.id,
                content: msg.content,
                sender_type: msg.sender_type,
                sender_name: msg.sender_details?.username || msg.sender_details?.email || 'user',
                created_at: msg.created_at,
                read: msg.is_read || false,
                attachment_url: msg.attachment_url,
                status: msg.status,
              };
              setMessages(prev => {
                if (prev.some(m => m.id === adapted.id)) return prev;
                const next = [...prev, adapted];
                return next.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              });
              if (msg.sender === selectedPartner.id && msg.sender_type === 'partner') {
                setPartners(prev => prev.map(p => p.id === selectedPartner.id ? { ...p, unread_messages: p.unread_messages + 1 } : p));
              }
            }
          }
        } catch {}
      };
      es.onerror = () => {
        es.close();
        esRef.current = null;
      };
      setRealtimeEnabled(true);
      return () => { es.close(); };
    } catch {
      setRealtimeEnabled(false);
    }
  }, [selectedPartner]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      // Fetch all users with partner profile
      const res = await api.get('/partnerships/messages/partner_users/');
      const partnerList = Array.isArray(res.data) ? res.data : [];
      const mapped = partnerList.map((p: any) => ({
        id: p.id,
        name: p.name || p.username || p.email || 'Parceiro',
        username: p.username || 'user',
        email: p.email || '',
        unread_messages: p.unread_count || 0,
        active_projects: p.active_projects || 0,
        last_activity: p.last_activity || null,
      }));
      setPartners(mapped.sort((a,b) => b.unread_messages - a.unread_messages));
    } catch (error) {
      console.error('Erro ao carregar parceiros:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId: number) => {
    setLoadingMessages(true);
    try {
      const res = await api.get(`/partnerships/messages/?partner_id=${partnerId}`);
      const raw = res.data.results || res.data || [];
      const normalized = raw.map((m: any) => ({
        id: m.id,
        content: m.content,
        sender_type: m.sender_type,
        sender_name: m.sender_details?.username || m.sender_details?.email || 'user',
        created_at: m.created_at,
        read: m.is_read || m.read || false,
        attachment_url: m.attachment_url,
        status: m.status,
      })).sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      setMessages(normalized);
      const unreadIds = raw.filter((m: any) => m.sender_type === 'partner' && !m.is_read && m.id).map((m: any) => m.id);
      if (unreadIds.length) {
        try { await api.post('/partnerships/messages/mark_multiple_as_read/', { message_ids: unreadIds }); } catch {}
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!messageContent.trim() || !selectedPartner) return;
    setSending(true);
    try {
      const payload: any = { content: messageContent.trim(), recipient: selectedPartner.id };
      const res = await api.post('/partnerships/messages/', payload);
      const incoming = res.data;
      setMessages(prev => {
        if (!incoming || typeof incoming.id === 'undefined') return prev;
        if (prev.some(m => m.id === incoming.id)) return prev;
        const adapted = {
          id: incoming.id,
            content: incoming.content,
            sender_type: incoming.sender_type,
            sender_name: incoming.sender_details?.username || incoming.sender_details?.email || 'user',
            created_at: incoming.created_at,
            read: incoming.is_read || false,
            attachment_url: incoming.attachment_url,
            status: incoming.status,
        };
        const next = [...prev, adapted];
        return next.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });
      setMessageContent('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    } finally { setSending(false); }
  };

  const selectPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    fetchMessages(partner.id);
    onPartnerSelect?.(partner.id);
  };

  const formatDateTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleString('pt-PT');
    } catch {
      return iso;
    }
  };

  const totalUnread = partners.reduce((sum, p) => sum + p.unread_messages, 0);

  return (
    <div className="space-y-6">
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Parceiros</p>
                <p className="text-xl font-bold">{partners.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Mensagens Não Lidas</p>
                <p className="text-xl font-bold">{totalUnread}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Building className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Projetos Ativos</p>
                <p className="text-xl font-bold">
                  {partners.reduce((sum, p) => sum + p.active_projects, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interface de Comunicação */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Parceiros */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Parceiros</CardTitle>
              <Button size="sm" variant="outline" onClick={fetchPartners} disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
            {loading && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
              </div>
            )}
            {!loading && partners.length === 0 && (
              <p className="text-sm text-muted-foreground">Nenhum parceiro encontrado.</p>
            )}
            {partners.map(partner => (
              <div
                key={partner.id}
                onClick={() => selectPartner(partner)}
                className={`p-3 border rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
                  selectedPartner?.id === partner.id ? 'bg-muted border-primary' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{partner.name}</p>
                    <p className="text-xs text-muted-foreground">@{partner.username}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {partner.unread_messages > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {partner.unread_messages}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {partner.active_projects} projeto{partner.active_projects !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Chat */}
        <Card className="lg:col-span-2 flex flex-col max-h-[500px]">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              {selectedPartner ? (
                <>Conversando com {selectedPartner.name}</>
              ) : (
                <>Selecione um parceiro para iniciar a conversa</>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col overflow-hidden">
            {!selectedPartner ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um parceiro para iniciar a comunicação</p>
                </div>
              </div>
            ) : (
              <>
                {/* Mensagens */}
                <div className="flex-1 overflow-y-auto pr-1 space-y-4 border rounded-md p-3 bg-muted/30">
                  {loadingMessages && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Carregando mensagens...
                    </div>
                  )}
                  {!loadingMessages && messages.length === 0 && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" /> Nenhuma mensagem ainda.
                    </div>
                  )}
                  {messages.map(msg => (
                    <div key={`msg-${msg.id}`} className={`flex flex-col ${msg.sender_type === 'admin' ? 'items-end' : 'items-start'}`}>
                      <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm shadow-sm ${
                        msg.sender_type === 'admin' 
                          ? 'bg-primary text-white' 
                          : 'bg-white border'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                        {msg.attachment_url && (
                          <div className="mt-1">
                            <a 
                              href={msg.attachment_url} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className={`text-xs underline ${
                                msg.sender_type === 'admin' ? 'text-white' : 'text-blue-600'
                              }`}
                            >
                              Ver Anexo
                            </a>
                          </div>
                        )}
                        <div className={`mt-1 text-[10px] opacity-70 flex items-center gap-1 ${
                          msg.sender_type === 'admin' ? 'text-white' : 'text-muted-foreground'
                        }`}>
                          <Clock className="h-3 w-3" /> {formatDateTime(msg.created_at)}
                          {msg.status && <span className="ml-1 uppercase tracking-wide">{msg.status}</span>}
                          {!msg.read && <span className="ml-1">•</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Envio */}
                <div className="mt-3 space-y-2">
                  <Textarea
                    placeholder="Escreva uma mensagem para o parceiro..."
                    value={messageContent}
                    onChange={e => setMessageContent(e.target.value)}
                    className="resize-none h-20"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      Comunicação oficial com {selectedPartner.name}
                    </span>
                    <Button 
                      size="sm" 
                      onClick={sendMessage} 
                      disabled={sending || !messageContent.trim()}
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4 mr-2" />
                      )}
                      Enviar
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PartnerCommunication;
