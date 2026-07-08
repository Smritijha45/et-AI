import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Mock Supabase Client for local fallback
class MockSupabaseStorage {
  from(bucket: string) {
    return {
      upload: async (path: string, file: File) => {
        console.log(`[Mock Storage] Uploaded to ${bucket}/${path}`, file);
        return { data: { path }, error: null };
      },
      getPublicUrl: (path: string) => {
        return { data: { publicUrl: `https://mock-storage.supabase.co/${bucket}/${path}` } };
      }
    };
  }
}

class MockSupabaseQuery {
  private table: string;
  private messagesKey = 'et_ai_mock_chat_messages';

  constructor(table: string) {
    this.table = table;
  }

  private getStoredMessages() {
    try {
      const msgs = localStorage.getItem(this.messagesKey);
      return msgs ? JSON.parse(msgs) : [];
    } catch {
      return [];
    }
  }

  private saveMessages(messages: any[]) {
    try {
      localStorage.setItem(this.messagesKey, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save mock messages:', e);
    }
  }

  select(columns: string = '*') {
    return {
      order: (column: string, { ascending = true } = {}) => {
        return {
          limit: async (num: number) => {
            if (this.table === 'messages') {
              const msgs = this.getStoredMessages();
              const sorted = [...msgs].sort((a, b) => {
                const timeA = new Date(a.created_at).getTime();
                const timeB = new Date(b.created_at).getTime();
                return ascending ? timeA - timeB : timeB - timeA;
              });
              return { data: sorted.slice(0, num), error: null };
            }
            return { data: [], error: null };
          }
        };
      }
    };
  }

  insert(values: any[]) {
    return {
      select: async () => {
        if (this.table === 'messages') {
          const msgs = this.getStoredMessages();
          const newMsgs = values.map(val => ({
            id: Math.floor(Math.random() * 100000000),
            created_at: new Date().toISOString(),
            ...val
          }));
          const updated = [...msgs, ...newMsgs];
          this.saveMessages(updated);

          // Broadcast real-time events to all tabs/listeners
          newMsgs.forEach(msg => {
            const event = new CustomEvent('mock_supabase_message', { detail: msg });
            window.dispatchEvent(event);
          });

          return { data: newMsgs, error: null };
        }
        return { data: [], error: null };
      }
    };
  }
}

class MockSupabaseChannel {
  private name: string;
  private callbacks: any[] = [];

  constructor(name: string) {
    this.name = name;
  }

  on(type: string, filter: any, callback: (payload: any) => void) {
    if (this.name === 'messages' && type === 'postgres_changes') {
      const listener = (e: Event) => {
        const customEvent = e as CustomEvent;
        callback({ new: customEvent.detail });
      };
      this.callbacks.push({ listener, name: 'mock_supabase_message' });
      window.addEventListener('mock_supabase_message', listener);
    }
    return this;
  }

  subscribe() {
    console.log(`[Mock Realtime] Subscribed to Supabase channel: ${this.name}`);
    return this;
  }

  unsubscribe() {
    this.callbacks.forEach(cb => {
      window.removeEventListener(cb.name, cb.listener);
    });
    console.log(`[Mock Realtime] Unsubscribed from channel: ${this.name}`);
  }
}

class MockSupabaseAuth {
  private sessionKey = 'et_ai_mock_session';

  private getStoredSession() {
    try {
      const sess = localStorage.getItem(this.sessionKey);
      return sess ? JSON.parse(sess) : null;
    } catch {
      return null;
    }
  }

  private saveSession(user: any) {
    try {
      localStorage.setItem(this.sessionKey, JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
  }

  async getSession() {
    const user = this.getStoredSession();
    return { data: { session: user ? { user } : null }, error: null };
  }

  async getUser() {
    const user = this.getStoredSession();
    return { data: { user }, error: null };
  }

  async signInWithPassword({ email }: { email: string }) {
    // Generate username from email
    const username = email.split('@')[0];
    const user = {
      id: `usr_${Math.random().toString(36).substring(2, 9)}`,
      email,
      user_metadata: { username }
    };
    this.saveSession(user);
    this.triggerAuthStateChange(user);
    return { data: { user, session: { user } }, error: null };
  }

  async signUp({ email }: { email: string }) {
    return this.signInWithPassword({ email });
  }

  async signOut() {
    localStorage.removeItem(this.sessionKey);
    this.triggerAuthStateChange(null);
    return { error: null };
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    const listener = (e: Event) => {
      const customEvent = e as CustomEvent;
      const user = customEvent.detail;
      callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null);
    };
    window.addEventListener('mock_supabase_auth_change', listener);
    
    // Initial call
    const currentUser = this.getStoredSession();
    callback(currentUser ? 'SIGNED_IN' : 'SIGNED_OUT', currentUser ? { user: currentUser } : null);

    return {
      data: {
        subscription: {
          unsubscribe: () => {
            window.removeEventListener('mock_supabase_auth_change', listener);
          }
        }
      }
    };
  }

  private triggerAuthStateChange(user: any) {
    const event = new CustomEvent('mock_supabase_auth_change', { detail: user });
    window.dispatchEvent(event);
  }
}

const mockClient = {
  auth: new MockSupabaseAuth(),
  storage: new MockSupabaseStorage(),
  from: (table: string) => new MockSupabaseQuery(table),
  channel: (name: string) => new MockSupabaseChannel(name)
};

// Export active Supabase client (Real or Mock)
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (mockClient as any);
