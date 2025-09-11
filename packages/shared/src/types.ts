// Shared DTOs and types (to be expanded as schemas evolve)

export type UUID = string & { readonly brand: unique symbol };

export interface Incident {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'triaged' | 'closed';
  coords: [number, number];
  createdAt: string; // ISO
}
