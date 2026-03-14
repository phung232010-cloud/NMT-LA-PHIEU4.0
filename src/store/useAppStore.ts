import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

const MASTER_ADMIN_KEY = 'THANGCYRUS';

export interface Candidate {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  voteCount: number;
  createdAt: string;
}

export interface CandidateRating {
  userId: string;
  userName: string;
  candidateId: string;
  groupId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface VotingGroup {
  id: string;
  name: string;
  description: string;
  ownerId: string;
  candidates: Candidate[];
  votes: Record<string, string>;
  ratings: CandidateRating[];
  createdAt: string;
  isPublic: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface VoteLog {
  action: string;
  performedBy: string;
  metadata: string;
  timestamp: string;
}

interface StoredUser {
  email: string;
  password: string;
  user: User;
}

interface AdminKey {
  id: string;
  key: string;
  createdAt: string;
}

interface AppState {
  user: User | null;
  groups: VotingGroup[];
  logs: VoteLog[];
  registeredUsers: StoredUser[];
  isAuthenticated: boolean;
  adminKeys: AdminKey[];
  isLoading: boolean;
  // Supabase Methods
  fetchData: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string, adminKey?: string) => Promise<boolean>;
  createAdminKey: (key: string) => boolean;
  revokeAdminKey: (keyId: string) => void;
  createGroup: (name: string, description: string) => Promise<string>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  adminDeleteGroup: (groupId: string) => Promise<boolean>;
  toggleGroupVisibility: (groupId: string) => Promise<void>;
  addCandidate: (groupId: string, name: string, description: string, imageUrl: string) => Promise<void>;
  deleteCandidate: (groupId: string, candidateId: string) => Promise<void>;
  vote: (groupId: string, candidateId: string) => Promise<boolean>;
  unvote: (groupId: string) => Promise<boolean>;
  resetVotes: (groupId: string) => Promise<void>;
  rateCandidate: (groupId: string, candidateId: string, rating: number, comment: string) => Promise<boolean>;
  getGroup: (groupId: string) => VotingGroup | undefined;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      groups: [],
      logs: [
        { action: 'SYSTEM_START', performedBy: 'system', metadata: 'Hệ thống khởi động', timestamp: new Date().toISOString() },
      ],
      registeredUsers: [],
      isAuthenticated: false,
      adminKeys: [],
      isLoading: false,

      fetchData: async () => {
        set({ isLoading: true });
        const { data: groups, error } = await supabase.from('groups').select('*');
        if (!error && groups) {
          const formattedGroups: VotingGroup[] = groups.map(g => ({
            id: g.id,
            name: g.name,
            description: g.description,
            ownerId: g.owner_id,
            isPublic: g.is_public,
            candidates: g.candidates || [],
            votes: g.votes || {},
            ratings: g.ratings || [],
            createdAt: g.created_at,
          }));
          set({ groups: formattedGroups });
        }
        set({ isLoading: false });

        // Subscribe to real-time updates
        supabase
          .channel('public:groups')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'groups' }, (payload) => {
            const newGroup = payload.new as any;
            const oldGroup = payload.old as any;
            
            const { groups } = get();
            if (payload.eventType === 'INSERT') {
              const formatted: VotingGroup = {
                id: newGroup.id,
                name: newGroup.name,
                description: newGroup.description,
                ownerId: newGroup.owner_id,
                isPublic: newGroup.is_public,
                candidates: newGroup.candidates || [],
                votes: newGroup.votes || {},
                ratings: newGroup.ratings || [],
                createdAt: newGroup.created_at,
              };
              set({ groups: [...groups, formatted] });
            } else if (payload.eventType === 'UPDATE') {
              set({
                groups: groups.map(g => g.id === newGroup.id ? {
                  id: newGroup.id,
                  name: newGroup.name,
                  description: newGroup.description,
                  ownerId: newGroup.owner_id,
                  isPublic: newGroup.is_public,
                  candidates: newGroup.candidates || [],
                  votes: newGroup.votes || {},
                  ratings: newGroup.ratings || [],
                  createdAt: newGroup.created_at,
                } : g)
              });
            } else if (payload.eventType === 'DELETE') {
              set({ groups: groups.filter(g => g.id !== oldGroup.id) });
            }
          })
          .subscribe();
      },

      login: async (email, password) => {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .single();

        if (!error && users) {
          const user: User = {
            id: users.id,
            name: users.name,
            email: users.email,
            isAdmin: users.is_admin,
            createdAt: users.created_at,
          };
          set({ user, isAuthenticated: true });
          return true;
        }
        return false;
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      register: async (name, email, password, adminKey?) => {
        const { adminKeys } = get();
        
        // Check if email exists
        const { data: existing } = await supabase.from('users').select('email').eq('email', email).single();
        if (existing) return false;

        let isAdmin = false;
        if (adminKey) {
          isAdmin = adminKey === MASTER_ADMIN_KEY || adminKeys.some(k => k.key === adminKey);
          if (!isAdmin) return false;
        }
        
        const newUser: User = { id: `u${Date.now()}`, name, email, isAdmin, createdAt: new Date().toISOString() };
        const { error } = await supabase.from('users').insert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          password: password,
          is_admin: newUser.isAdmin,
          created_at: newUser.createdAt,
        });

        if (!error) {
          set({ user: newUser, isAuthenticated: true });
          return true;
        }
        return false;
      },

      createAdminKey: (key) => {
        const { adminKeys } = get();
        if (key === MASTER_ADMIN_KEY || adminKeys.some(k => k.key === key)) return false;
        set({
          adminKeys: [...adminKeys, { id: `ak${Date.now()}`, key, createdAt: new Date().toISOString() }],
        });
        return true;
      },

      revokeAdminKey: (keyId) => {
        set({ adminKeys: get().adminKeys.filter(k => k.id !== keyId) });
      },

      createGroup: async (name, description) => {
        const { user } = get();
        if (!user) return '';
        const id = `g${Date.now()}`;
        const newGroup = { 
          id, 
          name, 
          description, 
          owner_id: user.id, 
          candidates: [], 
          votes: {}, 
          ratings: [], 
          is_public: true 
        };
        
        const { error } = await supabase.from('groups').insert(newGroup);
        if (!error) {
          set({
            logs: [...get().logs, { action: 'CREATE_GROUP', performedBy: user.name, metadata: `Tạo nhóm: ${name}`, timestamp: new Date().toISOString() }],
          });
          return id;
        }
        return '';
      },

      deleteGroup: async (groupId) => {
        const { user, groups } = get();
        const group = groups.find(g => g.id === groupId);
        if (!user || !group || group.ownerId !== user.id) return false;
        
        const { error } = await supabase.from('groups').delete().eq('id', groupId);
        return !error;
      },

      adminDeleteGroup: async (groupId) => {
        const { user, groups } = get();
        if (!user?.isAdmin) return false;
        const group = groups.find(g => g.id === groupId);
        if (!group) return false;
        
        const { error } = await supabase.from('groups').delete().eq('id', groupId);
        if (!error) {
          set({
            logs: [...get().logs, { action: 'ADMIN_DELETE_GROUP', performedBy: user.name, metadata: `Xóa nhóm: ${group.name}`, timestamp: new Date().toISOString() }],
          });
          return true;
        }
        return false;
      },

      toggleGroupVisibility: async (groupId) => {
        const { user, groups } = get();
        const group = groups.find(g => g.id === groupId);
        if (!user || !group || group.ownerId !== user.id) return;
        
        await supabase.from('groups').update({ is_public: !group.isPublic }).eq('id', groupId);
      },

      addCandidate: async (groupId, name, description, imageUrl) => {
        const { groups, user } = get();
        const group = groups.find(g => g.id === groupId);
        if (!group || !user || group.ownerId !== user.id) return;
        const newCandidate: Candidate = { id: `c${Date.now()}`, name, description, imageUrl, voteCount: 0, createdAt: new Date().toISOString() };
        
        await supabase.from('groups').update({ 
          candidates: [...group.candidates, newCandidate] 
        }).eq('id', groupId);
      },

      deleteCandidate: async (groupId, candidateId) => {
        const { groups, user } = get();
        const group = groups.find(g => g.id === groupId);
        if (!group || !user || group.ownerId !== user.id) return;
        
        await supabase.from('groups').update({ 
          candidates: group.candidates.filter(c => c.id !== candidateId) 
        }).eq('id', groupId);
      },

      vote: async (groupId, candidateId) => {
        const { user, groups } = get();
        if (!user) return false;
        const group = groups.find(g => g.id === groupId);
        if (!group || group.votes[user.id]) return false;
        
        const { error } = await supabase.from('groups').update({
          candidates: group.candidates.map(c => c.id === candidateId ? { ...c, voteCount: c.voteCount + 1 } : c),
          votes: { ...group.votes, [user.id]: candidateId },
        }).eq('id', groupId);

        if (!error) {
          set({
            logs: [...get().logs, { action: 'VOTE', performedBy: user.name, metadata: `Bầu cho ${candidateId} trong nhóm ${groupId}`, timestamp: new Date().toISOString() }],
          });
          return true;
        }
        return false;
      },

      unvote: async (groupId) => {
        const { user, groups } = get();
        if (!user) return false;
        const group = groups.find(g => g.id === groupId);
        if (!group || !group.votes[user.id]) return false;
        const candidateId = group.votes[user.id];
        const newVotes = { ...group.votes };
        delete newVotes[user.id];
        
        const { error } = await supabase.from('groups').update({
          candidates: group.candidates.map(c => c.id === candidateId ? { ...c, voteCount: Math.max(0, c.voteCount - 1) } : c),
          votes: newVotes,
        }).eq('id', groupId);

        if (!error) {
          set({
            logs: [...get().logs, { action: 'UNVOTE', performedBy: user.name, metadata: `Hủy bầu trong nhóm ${groupId}`, timestamp: new Date().toISOString() }],
          });
          return true;
        }
        return false;
      },

      resetVotes: async (groupId) => {
        const { groups, user } = get();
        const group = groups.find(g => g.id === groupId);
        if (!group || !user || group.ownerId !== user.id) return;
        
        const { error } = await supabase.from('groups').update({
          candidates: group.candidates.map(c => ({ ...c, voteCount: 0 })),
          votes: {},
        }).eq('id', groupId);

        if (!error) {
          set({
            logs: [...get().logs, { action: 'RESET_VOTES', performedBy: user.name, metadata: `Reset nhóm ${groupId}`, timestamp: new Date().toISOString() }],
          });
        }
      },

      rateCandidate: async (groupId, candidateId, rating, comment) => {
        const { user, groups } = get();
        if (!user) return false;
        const group = groups.find(g => g.id === groupId);
        if (!group) return false;
        
        const existingIdx = (group.ratings || []).findIndex(r => r.userId === user.id && r.candidateId === candidateId);
        const newRating: CandidateRating = {
          userId: user.id, userName: user.name, candidateId, groupId, rating, comment, createdAt: new Date().toISOString(),
        };
        let newRatings = [...(group.ratings || [])];
        if (existingIdx >= 0) {
          newRatings[existingIdx] = newRating;
        } else {
          newRatings.push(newRating);
        }
        
        const { error } = await supabase.from('groups').update({
          ratings: newRatings
        }).eq('id', groupId);

        return !error;
      },

      getGroup: (groupId) => {
        return get().groups.find(g => g.id === groupId);
      },
    }),
    {
      name: 'laphieu-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        adminKeys: state.adminKeys,
      }),
    }
  )
);
