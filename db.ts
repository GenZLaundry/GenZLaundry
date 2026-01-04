
import { User, Order, OrderStatus, Expense } from './types';

const STORAGE_KEYS = {
  USERS: 'll_ent_users',
  ORDERS: 'll_ent_orders',
  CURRENT: 'll_ent_current',
  NOTIFS: 'll_ent_notifs',
  EXPENSES: 'll_ent_expenses'
};

export const db = {
  getUsers: (): User[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
  
  saveUser: (user: User) => {
    const users = db.getUsers();
    users.push({ ...user, createdAt: user.createdAt || new Date().toISOString() });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  updateUser: (id: string, updates: Partial<User>) => {
    const users = db.getUsers();
    const i = users.findIndex(u => u.id === id);
    if (i > -1) {
      users[i] = { ...users[i], ...updates };
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      const current = db.getCurrentUser();
      if (current?.id === id) db.setCurrentUser(users[i]);
    }
  },

  findUserByContact: (contact: string) => 
    db.getUsers().find(u => u.email === contact || u.phone === contact),

  getOrders: (): Order[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.ORDERS) || '[]'),

  saveOrder: (order: Order) => {
    const orders = db.getOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    db.addNotification(order.userId, 'Order Placed', `Order #${order.tokenNumber} is being reviewed.`);
    db.addNotification('admin-1', 'New Order', `New request from ${order.userName}.`);
  },

  updateOrder: (id: string, updates: Partial<Order>) => {
    const orders = db.getOrders();
    const i = orders.findIndex(o => o.id === id);
    if (i > -1) {
      const updated = { ...orders[i], ...updates, updatedAt: new Date().toISOString() };
      // Always ensure totalAmount is synchronized if items or delivery charge changed
      if (updates.items || updates.deliveryCharge !== undefined) {
        const subtotal = (updated.items || []).reduce((acc, it) => acc + (it.totalPrice || 0), 0);
        updated.totalAmount = subtotal + (updated.deliveryCharge || 0);
      }
      orders[i] = updated;
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
      return updated;
    }
  },

  updateOrderStatus: (id: string, status: OrderStatus) => {
    db.updateOrder(id, { status });
    const order = db.getOrders().find(o => o.id === id);
    if (order) {
      db.addNotification(order.userId, 'Status Update', `Order #${order.tokenNumber} is now ${status.toUpperCase()}.`);
    }
  },

  getExpenses: (): Expense[] => JSON.parse(localStorage.getItem(STORAGE_KEYS.EXPENSES) || '[]'),
  
  saveExpense: (exp: Expense) => {
    const exps = db.getExpenses();
    exps.push(exp);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(exps));
  },

  deleteExpense: (id: string) => {
    const exps = db.getExpenses().filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(exps));
  },

  getCurrentUser: (): User | null => JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT) || 'null'),
  setCurrentUser: (u: User | null) => u ? localStorage.setItem(STORAGE_KEYS.CURRENT, JSON.stringify(u)) : localStorage.removeItem(STORAGE_KEYS.CURRENT),

  addNotification: (uid: string, title: string, message: string) => {
    const notifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFS) || '[]');
    notifs.push({ id: Math.random().toString(36).substr(2,9), userId: uid, title, message, createdAt: new Date().toISOString(), read: false });
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(notifs));
  },

  getNotifications: (uid: string) => 
    JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFS) || '[]')
      .filter((n: any) => n.userId === uid)
      .sort((a: any, b: any) => b.createdAt.localeCompare(a.createdAt)),

  markNotificationsRead: (uid: string) => {
    const notifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFS) || '[]');
    // Filter out all notifications for this user to "empty" the list
    const remainingNotifs = notifs.filter((n: any) => n.userId !== uid);
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(remainingNotifs));
  },

  markNotificationRead: (nid: string) => {
    const notifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFS) || '[]');
    // Instead of setting read: true, we remove it so it disappears from the list "automatically"
    const remainingNotifs = notifs.filter((n: any) => n.id !== nid);
    localStorage.setItem(STORAGE_KEYS.NOTIFS, JSON.stringify(remainingNotifs));
  },

  generateToken: () => `GenZ-${Math.floor(1000 + Math.random() * 9000)}`
};
