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

currentPage: number = 1;
pageSize: number = 9;
totalItems: number = 0;
totalPages: number = 1;

private fullFaunaList: Fauna[] = [];

constructor(private faunaService: FaunaFloraService) { }

ngOnInit(): void {
  this.loadAllFauna();
}

loadAllFauna(): void {
  this.isLoading = true;
  this.errorMessage = null;
  this.faunaService.getAllFauna(100).subscribe({
    next: (data) => {
      this.fullFaunaList = data;
      this.totalItems = data.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.setPage(1);
      this.isLoading = false;
      if (data.length === 0) {
        this.errorMessage = 'Tidak ada data fauna yang ditemukan.';
      }
    },
    error: (err: any) => {
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
  this.hasSearched = true;

  this.faunaService.searchFauna(this.searchQuery).subscribe({
    next: (data) => {
      this.fullFaunaList = data;
      this.totalItems = data.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.setPage(1);
      this.isLoading = false;
      if (data.length === 0) {
        this.errorMessage = `Tidak ada hasil ditemukan untuk "${this.searchQuery}".`;
      }
    },
    error: (err: any) => {
      this.errorMessage = 'Terjadi kesalahan saat mengambil data fauna. Coba lagi nanti.';
      this.isLoading = false;
      console.error('[FaunaComponent] Error fetching fauna data:', err);
    }
  });
}

setPage(page: number): void {
  if (page < 1) page = 1;
  if (page > this.totalPages) page = this.totalPages;
  this.currentPage = page;

  const startIndex = (page - 1) * this.pageSize;
  const endIndex = startIndex + this.pageSize;
  this.faunaList = this.fullFaunaList.slice(startIndex, endIndex);
}

getPages(): number[] {
  const pages: number[] = [];
  for (let i = 1; i <= this.totalPages; i++) {
    pages.push(i);
  }
  return pages;
}

nextPage(): void {
  if (this.currentPage < this.totalPages) {
    this.setPage(this.currentPage + 1);
  }
}

prevPage(): void {
  if (this.currentPage > 1) {
    this.setPage(this.currentPage - 1);
  }
}
}