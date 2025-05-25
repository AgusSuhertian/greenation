import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Fauna } from '../../models/fauna.model'; 
import { FaunaFloraService } from '../../services/fauna-flora.service'; 
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-fauna',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './fauna.component.html',
  styleUrls: ['./fauna.component.css']
})
export class FaunaComponent implements OnInit {
  faunaList: Fauna[] = [];
  isLoading: boolean = false;
  errorMessage: string | null = null;
  searchQuery: string = '';
  hasSearched: boolean = false;

  constructor(private faunaService: FaunaFloraService) { }

  ngOnInit(): void {
    this.loadAllFauna();
  }

  loadAllFauna(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.faunaService.getAllFauna(20).subscribe({
      next: (data) => {
        this.faunaList = data;
        this.isLoading = false;
        if (data.length === 0) {
          this.errorMessage = 'Tidak ada data fauna yang ditemukan.';
        }
      },
      error: (err) => {
        this.errorMessage = 'Terjadi kesalahan saat mengambil data fauna.';
        this.isLoading = false;
        console.error('[FaunaComponent] Error loading all fauna:', err);
      }
    });
  }

  performSearch(): void {
    if (!this.searchQuery.trim()) {
      this.errorMessage = "Masukkan kata kunci untuk pencarian fauna.";
      this.faunaList = [];
      this.hasSearched = true; 
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.faunaList = [];
    this.hasSearched = true;
    console.log(`[FaunaComponent] Performing search for: "${this.searchQuery}"`);

    this.faunaService.searchFauna(this.searchQuery).subscribe({
      next: (data) => {
        this.faunaList = data;
        this.isLoading = false;
        console.log('[FaunaComponent] Data received:', data);
        if (data.length === 0) {
          this.errorMessage = `Tidak ada hasil ditemukan untuk "${this.searchQuery}".`;
        }
      },
      error: (err) => {
        this.errorMessage = 'Terjadi kesalahan saat mengambil data fauna. Coba lagi nanti.';
        this.isLoading = false;
        console.error('[FaunaComponent] Error fetching fauna data:', err);
      }
    });
  }
}
