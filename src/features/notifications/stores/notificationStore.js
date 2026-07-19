import { create } from 'zustand';

const MAX_ITEMS = 30;

const normalize = (n) => ({
  _id: String(n._id || n.id || `temp-${Date.now()}-${Math.random()}`),
  type: n.type,
  title: n.title || '',
  message: n.message || '',
  data: n.data || {},
  createdAt: n.createdAt || new Date().toISOString(),
});

export const useNotificationStore = create((set) => ({
  items: [],
  unreadCount: 0,
  lastReadAt: null,

  setItems: (items) =>
    set({
      items: (Array.isArray(items) ? items : []).map(normalize).slice(0, MAX_ITEMS),
    }),

  prepend: (notification) =>
    set((state) => {
      const incoming = normalize(notification);
      const exists = state.items.some((n) => n._id === incoming._id);
      if (exists) return state;
      return {
        items: [incoming, ...state.items].slice(0, MAX_ITEMS),
        unreadCount: state.unreadCount + 1,
      };
    }),

  setUnreadCount: (count) => set({ unreadCount: Math.max(0, Number(count) || 0) }),

  setLastReadAt: (timestamp) => set({ lastReadAt: timestamp || new Date().toISOString() }),

  markAllRead: () =>
    set(() => {
      const now = new Date().toISOString();
      return { unreadCount: 0, lastReadAt: now };
    }),

  clear: () => set({ items: [], unreadCount: 0, lastReadAt: null }),
}));
