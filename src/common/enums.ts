// ===== Users =====
export enum Role {
  ADMIN = 'admin',
  BRANCH_MANAGER = 'branch_manager',
  STAFF = 'staff',
}

// ===== Orders =====
export enum OrderType {
  ONLINE = 'online',
  POS = 'pos',
}

export enum OrderStatus {
  CONFIRMED = 'confirmed', // stock deducted, waiting for delivery
  COMPLETED = 'completed', // customer received the order
  CANCELLED = 'cancelled', // cancelled, stock returned
}