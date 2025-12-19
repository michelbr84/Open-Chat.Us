import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Contact {
  id: string;
  user_id: string;
  contact_user_id: string;
  nickname?: string;
  created_at: string;
  // Joined profile data
  contact_profile?: {
    username?: string;
    display_name?: string;
    avatar_url?: string;
    status?: string;
  };
}

export const useContacts = () => {
  const { user } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user's contacts
  const fetchContacts = useCallback(async () => {
    if (!user) {
      setContacts([]);
      setIsLoading(false);
      return;
    }

    try {
      // Get contacts
      const { data: contactsData, error: contactsError } = await supabase
        .from('contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (contactsError) throw contactsError;

      // Get profile data for each contact
      if (contactsData && contactsData.length > 0) {
        const contactUserIds = contactsData.map(c => c.contact_user_id);
        
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('user_id, username, display_name, avatar_url, status')
          .in('user_id', contactUserIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        const contactsWithProfiles = contactsData.map(contact => ({
          ...contact,
          contact_profile: profiles?.find(p => p.user_id === contact.contact_user_id) || undefined
        }));

        setContacts(contactsWithProfiles);
      } else {
        setContacts([]);
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Add a contact
  const addContact = async (contactUserId: string, nickname?: string) => {
    if (!user) {
      toast.error('You must be logged in to add contacts');
      return false;
    }

    if (contactUserId === user.id) {
      toast.error("You can't add yourself as a contact");
      return false;
    }

    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert({
          user_id: user.id,
          contact_user_id: contactUserId,
          nickname: nickname?.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch profile for the new contact
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, status')
        .eq('user_id', contactUserId)
        .single();

      const newContact: Contact = {
        ...data,
        contact_profile: profile || undefined
      };

      setContacts(prev => [newContact, ...prev]);
      toast.success('Contact added successfully!');
      return true;
    } catch (error: any) {
      console.error('Error adding contact:', error);
      if (error.code === '23505') {
        toast.error('This user is already in your contacts');
      } else {
        toast.error('Failed to add contact');
      }
      return false;
    }
  };

  // Remove a contact
  const removeContact = async (contactId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('contacts')
        .delete()
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev => prev.filter(c => c.id !== contactId));
      toast.success('Contact removed successfully!');
      return true;
    } catch (error) {
      console.error('Error removing contact:', error);
      toast.error('Failed to remove contact');
      return false;
    }
  };

  // Update contact nickname
  const updateNickname = async (contactId: string, nickname: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('contacts')
        .update({ nickname: nickname.trim() || null })
        .eq('id', contactId)
        .eq('user_id', user.id);

      if (error) throw error;

      setContacts(prev => 
        prev.map(c => c.id === contactId ? { ...c, nickname: nickname.trim() || undefined } : c)
      );
      toast.success('Nickname updated!');
      return true;
    } catch (error) {
      console.error('Error updating nickname:', error);
      toast.error('Failed to update nickname');
      return false;
    }
  };

  // Check if a user is in contacts
  const isContact = (userId: string): boolean => {
    return contacts.some(c => c.contact_user_id === userId);
  };

  // Search for users to add as contacts
  const searchUsers = async (query: string) => {
    if (!user || !query.trim()) return [];

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
        .neq('user_id', user.id)
        .limit(10);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  };

  return {
    contacts,
    isLoading,
    addContact,
    removeContact,
    updateNickname,
    isContact,
    searchUsers,
    refreshContacts: fetchContacts,
  };
};
