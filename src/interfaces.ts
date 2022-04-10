// Interfaces

export interface Sector {
  name: string
}

export interface Stock {
  objectID: string;
  Company: string;
  Symbol: string;
  Sector: string[];
  Exchange: string;
  Currency: string;
}

export interface Quote {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  date: string;
}
