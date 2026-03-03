import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Message {
  id: string;
  senderId: string;
  senderRole: string;
  content: string;
  createdAt: string;
  readAt: string | null;
}

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function ConversationPage() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<Participant | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLTextAreaElement>(null);
  const [liveRegionMessage, setLiveRegionMessage] = useState('');

  // Charger messages
  useEffect(() => {
    if (conversationId) {
      loadMessages();
      markAsRead();
      
      // Rafraîchir toutes les 5 secondes
      const interval = setInterval(() => {
        loadMessages(true);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [conversationId]);

  // Scroll auto vers le bas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  async function loadMessages(silent = false) {
    try {
      if (!silent) setLoading(true);
      
      const response = await api.get(`/messages/conversations/${conversationId}`);
      if (response.data.success) {
        const newMessages = response.data.messages;
        
        // Détecter nouveaux messages pour annonce vocale
        if (silent && messages.length > 0 && newMessages.length > messages.length) {
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.senderId !== user?.id) {
            // Nouveau message reçu
            setLiveRegionMessage(`Nouveau message de ${otherUser?.firstName} : ${lastMessage.content}`);
            // Nettoyer après annonce
            setTimeout(() => setLiveRegionMessage(''), 100);
          }
        }
        
        setMessages(newMessages);
      }
      
      // Récupérer infos conversation
      const convResponse = await api.get('/messages/conversations');
      if (convResponse.data.success) {
        const conv = convResponse.data.conversations.find((c: any) => c.id === conversationId);
        if (conv) {
          setOtherUser(conv.otherUser);
        }
      }
    } catch (error) {
    } finally {
      if (!silent) setLoading(false);
    }
  }

  async function markAsRead() {
    try {
      await api.put(`/messages/conversations/${conversationId}/read`);
    } catch (error) {
    }
  }

  function scrollToBottom() {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    
    if (!newMessage.trim() || sending) return;
    
    try {
      setSending(true);
      const response = await api.post(`/messages/conversations/${conversationId}/messages`, {
        content: newMessage.trim(),
      });
      
      if (response.data.success) {
        setMessages([...messages, response.data.message]);
        setNewMessage('');
        setLiveRegionMessage('Message envoyé');
        setTimeout(() => setLiveRegionMessage(''), 100);
        
        // Focus sur input après envoi
        setTimeout(() => {
          messageInputRef.current?.focus();
        }, 100);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Erreur lors de l\'envoi du message';
      setLiveRegionMessage(`Erreur: ${errorMsg}`);
      setTimeout(() => setLiveRegionMessage(''), 100);
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Chargement de la conversation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* ✅ ACCESSIBILITÉ: Live region pour annonces vocales */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {liveRegionMessage}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link
            to="/messages"
            className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded p-2"
            aria-label="Retour à la liste des conversations"
          >
            <ArrowLeft size={24} />
          </Link>
          
          {otherUser && (
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {otherUser.firstName} {otherUser.lastName}
              </h1>
              <p className="text-sm text-gray-600">
                {otherUser.role === 'TEACHER'
                  ? 'Professeur'
                  : otherUser.role === 'PARENT'
                  ? 'Parent'
                  : otherUser.role === 'STUDENT'
                  ? 'Élève'
                  : 'École'}
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Aucun message pour le moment. Commencez la conversation !</p>
            </div>
          ) : (
            /* ✅ ACCESSIBILITÉ: role="log" pour les messages */
            <div role="log" aria-label="Fil de la conversation" className="space-y-4">
              {messages.map((message) => {
                const isOwn = message.senderId === user?.id;
                const sender = isOwn ? 'Vous' : `${otherUser?.firstName}`;
                
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <article
                      className={`max-w-[70%] px-4 py-3 rounded-lg ${
                        isOwn
                          ? 'bg-primary-600 text-white'
                          : 'bg-white text-gray-900 border border-gray-200'
                      }`}
                      /* ✅ ACCESSIBILITÉ: aria-label explicite */
                      aria-label={`Message de ${sender} envoyé ${formatDistanceToNow(new Date(message.createdAt), { addSuffix: true, locale: fr })}`}
                    >
                      {!isOwn && (
                        <p className="text-sm font-semibold mb-1">{sender}</p>
                      )}
                      <p className="text-base break-words">{message.content}</p>
                      <time
                        className={`text-xs mt-1 block ${isOwn ? 'text-primary-100' : 'text-gray-500'}`}
                        dateTime={message.createdAt}
                      >
                        {formatDistanceToNow(new Date(message.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </time>
                    </article>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Zone envoi */}
      <footer className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSendMessage} className="flex gap-3">
            <label htmlFor="message-input" className="sr-only">
              Votre message
            </label>
            <textarea
              id="message-input"
              ref={messageInputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Écrivez votre message..."
              rows={1}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              aria-label="Tapez votre message. Appuyez sur Entrée pour envoyer, Shift+Entrée pour nouvelle ligne"
              disabled={sending}
            />
            <Button
              type="submit"
              disabled={!newMessage.trim() || sending}
              aria-label="Envoyer le message"
              className="flex-shrink-0"
            >
              <Send size={20} className="mr-2" aria-hidden="true" />
              Envoyer
            </Button>
          </form>
          <p className="text-xs text-gray-500 mt-2">
            Appuyez sur <kbd className="px-1 py-0.5 bg-gray-200 rounded">Entrée</kbd> pour envoyer,{' '}
            <kbd className="px-1 py-0.5 bg-gray-200 rounded">Shift</kbd>+<kbd className="px-1 py-0.5 bg-gray-200 rounded">Entrée</kbd> pour nouvelle ligne
          </p>
        </div>
      </footer>
    </div>
  );
}
