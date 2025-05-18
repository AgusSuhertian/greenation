import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { Flora } from '../../models/flora.model'; 
import { FaunaFloraService } from '../../services/fauna-flora.service';

@Component({
  selector: 'app-flora-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './flora-detail.component.html',
  styleUrls: ['./flora-detail.component.css']
})
export class FloraDetailComponent implements OnInit, OnDestroy {
  flora: Flora | null = null;
  isLoading: boolean = true;
  errorMessage: string | null = null;
  private routeSubscription: Subscription | undefined;
  private dataSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private faunaFloraService: FaunaFloraService 
  ) {}

  ngOnInit(): void {
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const idString = params.get('id');
      if (idString) {
        const floraId = +idString;
        if (!isNaN(floraId)) {
          this.loadFloraDetail(floraId);
        } else {
          this.isLoading = false;
          this.errorMessage = 'ID Flora tidak valid.';
          console.error('[FloraDetailComponent] Invalid ID format:', idString);
        }
      } else {
        this.isLoading = false;
        this.errorMessage = 'ID Flora tidak ditemukan di URL.';
        console.error('[FloraDetailComponent] No ID found in URL params');
      }
    });
  }

  loadFloraDetail(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;
    console.log(`[FloraDetailComponent] Requesting detail for flora ID: ${id}`);
    this.dataSubscription = this.faunaFloraService.getFloraDetailById(id).subscribe({ 
      next: (data) => {
        this.flora = data;
        this.isLoading = false;
        console.log('[FloraDetailComponent] Flora detail received:', data);
        if (!data) {
          this.errorMessage = 'Data flora tidak ditemukan.';
        }
      },
      error: (err) => {
        this.errorMessage = 'Gagal memuat detail flora. Silakan coba lagi nanti.';
        this.isLoading = false;
        console.error('[FloraDetailComponent] Error fetching flora detail:', err);
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
}