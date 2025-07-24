import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { AgeGate } from '@/components/AgeGate';
import { ChatHeader } from '@/components/ChatHeader';
import { UserList } from '@/components/UserList';
import { ChatMessage } from '@/components/ChatMessage';
import { MessageInput } from '@/components/MessageInput';
import { LoginModal } from '@/components/LoginModal';
import { DonateModal } from '@/components/DonateModal';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_id: string | null;
  created_at: string;
}

interface OnlineUser {
  name: string;
  isMember: boolean;
  key: string;
}

const Index = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ageVerified, setAgeVerified] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDonate, setShowDonate] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [guestName, setGuestName] = useState('Guest' + Math.floor(1000 + Math.random() * 9000));
  const [userList, setUserList] = useState<OnlineUser[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (localStorage.getItem('ageVerified') === 'true') {
      setAgeVerified(true);
    }
  }, []);

  const sendMessage = async (content: string) => {
    const senderName = user?.user_metadata?.name || user?.email || guestName;
    await supabase.from('messages').insert({
      content,
      sender_name: senderName,
      sender_id: user?.id || null,
    });
  };

  return (
    <>
      {!ageVerified ? (
        <AgeGate onConfirm={() => setAgeVerified(true)} />
      ) : (
        <div className="h-screen flex flex-col">
          <ChatHeader
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onLoginClick={() => setShowLogin(true)}
            onDonateClick={() => setShowDonate(true)}
          />
          <div className="flex-1 flex">
            <UserList
              users={userList}
              guestName={guestName}
              onUserClick={() => {}}
              onGuestNameChange={setGuestName}
            />
            <main className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => (
                  <ChatMessage 
                    key={message.id}
                    message={message} 
                    isOwn={user ? message.sender_id === user.id : message.sender_name === guestName}
                  />
                ))}
                <div ref={messagesEndRef} />
              </div>
              <MessageInput onSendMessage={sendMessage} />
            </main>
          </div>
        </div>
      )}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showDonate && <DonateModal onClose={() => setShowDonate(false)} />}
    </>
  );
};

export default Index;
