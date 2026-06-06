export type UserRole = 'admin' | 'confirmatrice_whatsapp' | 'confirmatrice_appel';
export type TeamType = 'whatsapp' | 'appel' | 'both';

export type OrderStatusWhatsApp = 'pending' | 'confirmé' | 'pas_intéressé' | 'suivi' | 'livré';
export type OrderStatusAppel = 'pending' | 'confirmé' | 'annulé' | 'pas_de_réponse_1' | 'pas_de_réponse_2' | 'pas_de_réponse_3' | 'pas_de_réponse_4' | 'faux_commande' | 'pas_intéressé' | 'suivi' | 'livré';
export type OrderStatus = OrderStatusWhatsApp | OrderStatusAppel;
export type CommissionStatus = 'pending' | 'paid';
export type OrderSource = 'google_sheet' | 'manual' | 'auto_command';

export interface Product {
  id: string;
  name: string;
  price: number;
  baseCommission: number;
  googleSheetUrl: string;
  teamType: TeamType;
  assignedAgents: string[];
  isActive: boolean;
  createdAt: string;
  variants: ProductVariant[];
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  price: number;
  commission: number;
  description: string;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  productId: string;
  variantId?: string;
  address: string;
  city: string;
  wilaya?: string;
  status: OrderStatus;
  assignedTo: string;
  teamType: 'whatsapp' | 'appel';
  createdAt: string;
  updatedAt: string;
  notes: OrderNote[];
  sheetRowId?: string;
  snoozedUntil?: string;
  lastContactedAt?: string;
  isBlacklisted: boolean;
  isRecurringClient: boolean;
  source: OrderSource;
}

export interface OrderNote {
  id: string;
  text: string;
  addedBy: string;
  addedAt: string;
}

export interface Client {
  id: string;
  phone: string;
  name: string;
  totalOrders: number;
  lastOrderDate: string;
  notes: string;
  isBlacklisted: boolean;
  blacklistReason?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  avatar?: string;
  dailyGoal: number;
  streakDays: number;
  lastActiveDate: string;
  performanceScore: number;
  totalCommissionEarned: number;
  totalCommissionPaid: number;
  bonusThreshold: number;
  bonusAmount: number;
  workingHoursStart: string;
  workingHoursEnd: string;
}

export interface Commission {
  id: string;
  userId: string;
  orderId: string;
  amount: number;
  status: CommissionStatus;
  paidAt?: string;
  paidBy?: string;
  createdAt: string;
}

export interface OrderHistoryEntry {
  id: string;
  orderId: string;
  changedBy: string;
  oldStatus: OrderStatus;
  newStatus: OrderStatus;
  changedAt: string;
  note?: string;
}

export interface WhatsAppTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  createdBy: string;
}

export interface CallScript {
  id: string;
  userId: string;
  content: string;
  isPersonalized: boolean;
  baseScriptId?: string;
  updatedAt: string;
}

export interface Objection {
  id: string;
  question: string;
  response: string;
  copyText: string;
  order: number;
  createdBy: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface BlacklistEntry {
  id: string;
  phone: string;
  reason: string;
  addedBy: string;
  addedAt: string;
}

export interface AppSettings {
  googleSyncInterval: number;
  alertDelayHours: number;
  dailyReportEnabled: boolean;
  roundRobinIndexWhatsapp: number;
  roundRobinIndexAppel: number;
  autoCommandEnabled: boolean;
  commandPrefix: string;
  autoParseEnabled: boolean;
}

export interface AutoCommandHistoryEntry {
  command: string;
  result: string;
  timestamp: string;
}

export const STATUS_COLORS: Record<string, string> = {
  pending: '#8B5CF6',
  confirmé: '#10B981',
  livré: '#3B82F6',
  suivi: '#F59E0B',
  annulé: '#EF4444',
  pas_intéressé: '#F87171',
  pas_de_réponse_1: '#6B7280',
  pas_de_réponse_2: '#6B7280',
  pas_de_réponse_3: '#6B7280',
  pas_de_réponse_4: '#6B7280',
  faux_commande: '#F87171',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  confirmé: 'Confirmé',
  livré: 'Livré',
  suivi: 'Suivi',
  annulé: 'Annulé',
  pas_intéressé: 'Pas intéressé',
  pas_de_réponse_1: 'Pas de réponse 1',
  pas_de_réponse_2: 'Pas de réponse 2',
  pas_de_réponse_3: 'Pas de réponse 3',
  pas_de_réponse_4: 'Pas de réponse 4',
  faux_commande: 'Faux Commande',
};

export const WHATSAPP_STATUSES: OrderStatusWhatsApp[] = ['pending', 'confirmé', 'pas_intéressé', 'suivi', 'livré'];
export const APPEL_STATUSES: OrderStatusAppel[] = ['pending', 'confirmé', 'annulé', 'pas_de_réponse_1', 'pas_de_réponse_2', 'pas_de_réponse_3', 'pas_de_réponse_4', 'faux_commande', 'pas_intéressé', 'suivi', 'livré'];

export const MOROCCAN_CITIES = [
  'Casablanca', 'Rabat', 'Marrakech', 'Fès', 'Tanger', 'Agadir', 'Meknès',
  'Oujda', 'Kénitra', 'Tétouan', 'Safi', 'El Jadida', 'Nador', 'Béni Mellal',
  'Mohammedia', 'Khouribga', 'Settat', 'Berrechid', 'Taza', 'Khemisset'
];
