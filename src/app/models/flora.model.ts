// src/app/models/flora.model.ts
export interface Flora {
  id: number;
  namaUmum: string;
  namaIlmiah: string;
  deskripsiSingkat?: string; // Deskripsi dari Wikipedia Summary jika ada
  keluarga?: string; // Nama famili tumbuhan, jika tersedia
  imageUrl: string;
  // Anda bisa tambahkan properti lain sesuai kebutuhan dan ketersediaan data dari API
}