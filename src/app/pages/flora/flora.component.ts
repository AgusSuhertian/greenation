import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { RouterLink } from '@angular/router';  
import { Flora } from '../../models/flora.model'; 
import { FaunaFloraService } from '../../services/fauna-flora.service'; 

@Component({
  selector: 'app-flora', 
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink], 
  templateUrl: './flora.component.html', 
  styleUrls: ['./flora.component.css']   
})
export class FloraComponent implements OnInit {
  floraList: Flora[] = []; 
  isLoading: boolean = false;
  errorMessage: string | null = null;
  searchQuery: string = ''; 
  hasSearched: boolean = false; 

  constructor(private faunaFloraService: FaunaFloraService) {
    console.log('[FloraComponent] Constructor - Membuat FloraComponent (daftar).');
  }

  ngOnInit(): void {
    console.log('[FloraComponent] ngOnInit - FloraComponent (daftar) diinisialisasi.');
  }

  performSearch(): void {
    if (!this.searchQuery || !this.searchQuery.trim()) {
      this.errorMessage = "Masukkan kata kunci untuk pencarian flora.";
      this.floraList = [];
      this.hasSearched = true;
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.floraList = []; 
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
