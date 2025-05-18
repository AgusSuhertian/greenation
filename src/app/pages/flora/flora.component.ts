// src/app/pages/flora/flora.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Diperlukan untuk [(ngModel)]
import { RouterLink } from '@angular/router';    // Diperlukan untuk [routerLink] jika kartu bisa diklik
import { Flora } from '../../models/flora.model'; // Sesuaikan path jika perlu
import { FaunaFloraService } from '../../services/fauna-flora.service'; // Sesuaikan path jika perlu

@Component({
  selector: 'app-flora', // Selector untuk halaman daftar flora
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], // Pastikan FormsModule dan RouterLink ada
  templateUrl: './flora.component.html', // Template untuk daftar flora
  styleUrls: ['./flora.component.css']   // Style untuk daftar flora
})
export class FloraComponent implements OnInit { // Nama class harus FloraComponent
  floraList: Flora[] = []; // Untuk menampung daftar flora
  isLoading: boolean = false;
  errorMessage: string | null = null;
  searchQuery: string = ''; // Untuk input pencarian
  hasSearched: boolean = false; // Untuk menandai apakah pencarian sudah dilakukan

  constructor(private faunaFloraService: FaunaFloraService) {
    console.log('[FloraComponent] Constructor - Membuat FloraComponent (daftar).');
  }

  ngOnInit(): void {
    console.log('[FloraComponent] ngOnInit - FloraComponent (daftar) diinisialisasi.');
    // Anda bisa memuat data awal di sini jika mau, misalnya:
    // this.searchQuery = "Mawar";
    // this.performSearch();
  }

  // ---> INI METODE YANG HILANG DAN MENYEBABKAN ERROR <---
  performSearch(): void {
    if (!this.searchQuery || !this.searchQuery.trim()) {
      this.errorMessage = "Masukkan kata kunci untuk pencarian flora.";
      this.floraList = [];
      this.hasSearched = true;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.floraList = []; // Kosongkan list sebelum pencarian baru
    this.hasSearched = true;
    console.log(`[FloraComponent] Performing search for flora: "${this.searchQuery}"`);

    this.faunaFloraService.searchFlora(this.searchQuery).subscribe({
      next: (data: Flora[]) => {
        this.floraList = data;
        this.isLoading = false;
        console.log('[FloraComponent] Data flora (daftar) received:', this.floraList);
             this.floraList.forEach(item => {
          if (item.id === undefined || item.id === null) {
            console.warn('[FloraComponent] DITEMUKAN ITEM FLORA TANPA ID YANG VALID:', item);
          }
        });
        if (data.length === 0) {
          this.errorMessage = `Tidak ada hasil flora ditemukan untuk "${this.searchQuery}".`;
        }
      },
      error: (err: any) => {
        this.errorMessage = 'Terjadi kesalahan saat mengambil data flora. Coba lagi nanti.';
        this.isLoading = false;
        console.error('[FloraComponent] Error fetching flora data (daftar):', err);
      }
    });
  }
}
