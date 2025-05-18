export interface TaxonPhoto { 
  id: number;
  url: string; 
  attribution?: string;
}

export interface Ancestor {
  id: number;
  name: string;
  rank: string; 
  preferred_common_name?: string;
}

export interface Fauna {
  id: number;
  namaUmum: string;
  namaIlmiah: string;
  deskripsiSingkat?: string;
  statusKonservasi?: string;
  imageUrl: string;
  photos?: TaxonPhoto[]; 
  ancestors?: Ancestor[]; 
  wikipediaUrl?: string; 
  }