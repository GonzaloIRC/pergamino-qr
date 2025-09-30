// Constantes para la aplicación
// apps/admin-web/lib/constants.ts

export const COLLECTIONS = {
  CLIENTS: 'clients',
  ROLES: 'roles',
  HISTORY: 'history',
  REGISTERED_DNIS: 'registeredDNIs',
  REDEMPTIONS: 'redemptions',
  BENEFITS: 'benefits',
  SERIALS: 'serials',
  SYSTEM: 'system'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  CLIENT: 'client',
  STAFF: 'staff'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

export const POINTS_ACTIONS = {
  ACCUMULATION: 'accumulation',
  REDEMPTION: 'redemption',
  ADJUSTMENT: 'adjustment'
};

export default {
  COLLECTIONS,
  USER_ROLES,
  USER_STATUS,
  POINTS_ACTIONS
};