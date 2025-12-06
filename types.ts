export enum Category {
  CELL_STOCK = 'CELL_STOCK',
  MEDIA = 'MEDIA',
  REAGENT = 'REAGENT'
}

export interface InventoryItem {
  id: string;
  name: string;
  category: Category;
  quantity: number;
  unit: string; // e.g., 'vials', 'mL', 'bottles'
  location: string; // e.g., 'LN2 Tank 1', '4C Fridge'
  expiryDate?: string; // ISO Date string
  notes?: string;
  
  // Specific to Cell Stock
  passage?: number;
  freezeDate?: string; // ISO Date string
  cellLineType?: string; // e.g., 'Adherent', 'Suspension'
  
  // Specific to Reagents
  lotNumber?: string;

  // Order Status
  isOrdered?: boolean;
}

export interface AIAnalysisResult {
  summary: string;
  alerts: Array<{
    severity: 'high' | 'medium' | 'low';
    message: string;
    itemId?: string;
  }>;
  suggestions: string[];
}

export interface User {
  id: string;
  password?: string; // In a real app, never store plain text passwords
  name: string;
  isAdmin: boolean;
}