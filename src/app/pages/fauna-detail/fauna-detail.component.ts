import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router'; 
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Fauna } from '../../models/fauna.model'; 
import { FaunaFloraService } from '../../services/fauna-flora.service'; 

@Component({
  selector: 'app-fauna-detail',
  standalone: true,
  imports: [CommonModule, RouterLink], 
  templateUrl: './fauna-detail.component.html',
  styleUrls: ['./fauna-detail.component.css']
})
export class FaunaDetailComponent implements OnInit, OnDestroy {
  fauna: Fauna | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private routeSubscription: Subscription | undefined;
  private dataSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private faunaService: FaunaFloraService
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const idString = params.get('id');
      if (idString) {
        const faunaId = +idString; 
        if (!isNaN(faunaId)) {
          this.loadFaunaDetail(faunaId);
        } else {
          this.isLoading = false;
          this.errorMessage = 'ID Fauna tidak valid.';
          console.error('[FaunaDetailComponent] Invalid ID format:', idString);
        }
      } else {
        this.isLoading = false;
        this.errorMessage = 'ID Fauna tidak ditemukan di URL.';
        console.error('[FaunaDetailComponent] No ID found in URL params');
      }
    });
  }

  loadFaunaDetail(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    console.log(`[FaunaDetailComponent] Requesting detail for fauna ID: ${id}`);
    this.dataSubscription = this.faunaService.getFaunaDetailById(id).subscribe({
      next: (data) => {
        this.fauna = data;
        this.isLoading = false;
        console.log('[FaunaDetailComponent] Fauna detail received:', data);
        if (!data) {
          this.errorMessage = 'Data fauna tidak ditemukan.';
        }
      },
      error: (err) => {
        this.errorMessage = 'Gagal memuat detail fauna. Silakan coba lagi nanti.';
        this.isLoading = false;
        console.error('[FaunaDetailComponent] Error fetching fauna detail:', err);
      }
    });
  }

  ngOnDestroy(): void {
      if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.dataSubscription) {
      this.dataSubscription.unsubscribe();
    }
  }
  updateMainImage(newImageUrl: string): void {
    if (this.fauna) {
      this.fauna.imageUrl = newImageUrl; 
    }
  }
}