import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { MessageSquare, Search, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  } | null;
  unreadCount: number;
  lastMessageAt: string;
}

export function MessagesListPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadConversations();
  }, []);

  async function loadConversations() {
    try {
      setLoading(true);
      const response = await api.get('/messages/conversations');
      if (response.data.success) {
        setConversations(response.data.conversations);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  const filteredConversations = conversations.filter((conv) =>
    `${conv.otherUser.firstName} ${conv.otherUser.lastName}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Chargement des conversations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Mes messages</h1>
        <p className="text-gray-600">
          Discutez avec vos {user?.role === 'PARENT' ? 'professeurs' : user?.role === 'TEACHER' ? 'parents et élèves' : 'professeurs'}
        </p>
      </header>

      {/* Recherche */}
      <div className="mb-6">
        <label htmlFor="search-conversations" className="sr-only">
          Rechercher une conversation
        </label>
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
            aria-hidden="true"
          />
          <input
            id="search-conversations"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une conversation..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            aria-label="Rechercher parmi vos conversations"
          />
        </div>
      </div>

      {/* Liste conversations */}
      {filteredConversations.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} aria-hidden="true" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {searchQuery ? 'Aucune conversation trouvée' : 'Aucune conversation'}
          </h2>
          <p className="text-gray-600">
            {searchQuery
              ? 'Essayez avec un autre nom'
              : 'Vos conversations apparaîtront ici'}
          </p>
        </div>
      ) : (
        <ul className="space-y-3" role="list" aria-label="Liste de vos conversations">
          {filteredConversations.map((conversation) => (
            <li key={conversation.id}>
              <Link
                to={`/messages/${conversation.id}`}
                className="block bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={`Conversation avec ${conversation.otherUser.firstName} ${conversation.otherUser.lastName}${conversation.unreadCount > 0 ? `, ${conversation.unreadCount} message${conversation.unreadCount > 1 ? 's' : ''} non lu${conversation.unreadCount > 1 ? 's' : ''}` : ''}`}
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="text-primary-600" size={24} aria-hidden="true" />
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {conversation.otherUser.firstName} {conversation.otherUser.lastName}
                      </h3>
                      {conversation.lastMessage && (
                        <time
                          className="text-sm text-gray-500 flex-shrink-0"
                          dateTime={conversation.lastMessage.createdAt}
                        >
                          {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </time>
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {conversation.otherUser.role === 'TEACHER'
                        ? 'Professeur'
                        : conversation.otherUser.role === 'PARENT'
                        ? 'Parent'
                        : conversation.otherUser.role === 'STUDENT'
                        ? 'Élève'
                        : 'École'}
                    </p>

                    {conversation.lastMessage && (
                      <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>
                        {conversation.lastMessage.senderId === user?.id ? 'Vous : ' : ''}
                        {conversation.lastMessage.content}
                      </p>
                    )}

                    {/* Badge non lu */}
                    {conversation.unreadCount > 0 && (
                      <span
                        className="inline-block mt-2 px-2 py-1 bg-primary-600 text-white text-xs font-semibold rounded-full"
                        aria-label={`${conversation.unreadCount} message${conversation.unreadCount > 1 ? 's' : ''} non lu${conversation.unreadCount > 1 ? 's' : ''}`}
                      >
                        {conversation.unreadCount} nouveau{conversation.unreadCount > 1 ? 'x' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
