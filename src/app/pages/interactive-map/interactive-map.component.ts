import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';

const iconRetinaUrl = 'images/marker-icon-2x.png';
const iconUrl = 'images/marker-icon.png';
const shadowUrl = 'images/marker-shadow.png';

const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;

interface LokasiItem {
  lat: number;
  lng: number;
  nama: string;
  deskripsi?: string;
  imageUrl?: string;
  linkDetail?: string;
}

@Component({
  selector: 'app-interactive-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './interactive-map.component.html',
  styleUrls: ['./interactive-map.component.css']
})
export class InteractiveMapComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainerEl') mapContainer!: ElementRef<HTMLDivElement>;
  private map!: L.Map;
  public isMapLoading = true;

  private lokasiData: LokasiItem[] = [
    {
        lat: -8.583333, lng: 119.491667, nama: "Taman Nasional Komodo",
        deskripsi: "Habitat asli Komodo.",
        imageUrl: "https://placehold.co/100x80/A1887F/FFFFFF?text=Komodo",
        linkDetail: "/fauna/komodo-slug"
    },
    {
        lat: -0.502106, lng: 111.475285, nama: "Hutan Kalimantan (Orangutan)",
        deskripsi: "Rumah Orangutan Kalimantan.",
        imageUrl: "https://placehold.co/100x80/66BB6A/FFFFFF?text=Orangutan",
        linkDetail: "/fauna/orangutan-slug"
    },
    {
        lat: -6.752222, lng: 105.331111, nama: "Taman Nasional Ujung Kulon",
        deskripsi: "Rumah Badak Jawa.",
        imageUrl: "https://placehold.co/100x80/757575/FFFFFF?text=Badak",
        linkDetail: "/fauna/badak-jawa"
    },
    {
        lat: -8.409518, lng: 115.188919, nama: "Taman Nasional Bali Barat (Jalak Bali)",
        deskripsi: "Habitat Jalak Bali.",
        imageUrl: "https://placehold.co/100x80/4FC3F7/FFFFFF?text=Jalak+Bali",
        linkDetail: "/flora/jalak-bali"
    }
  ];

  constructor(private cdr: ChangeDetectorRef ) {}

  ngAfterViewInit(): void {
    console.log('[InteractiveMapComponent] ngAfterViewInit dipanggil.');
    if (this.mapContainer && this.mapContainer.nativeElement) {
      console.log('[InteractiveMapComponent] mapContainer ditemukan. Menginisialisasi peta...');
      this.initMap();
      this.addMarkers();
      setTimeout(() => {
        this.isMapLoading = false;
        this.cdr.detectChanges();
        console.log('[InteractiveMapComponent] Peta selesai dimuat.');
      }, 0);
    } else {
      console.error('[InteractiveMapComponent] Elemen mapContainerEl tidak ditemukan di DOM!');
      this.isMapLoading = false;
    }
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-2.548926, 118.0148634],
      zoom: 5
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 18,
      minZoom: 3
    }).addTo(this.map);

    L.control.scale({ imperial: false }).addTo(this.map);
  }

  private buatKontenPopup(item: LokasiItem): HTMLElement {
    const container = L.DomUtil.create('div', 'popup-container');
    let kontenHTML = `<h4>${item.nama}</h4>`;
    if (item.imageUrl) {
        kontenHTML += `<img src="${item.imageUrl}" alt="${item.nama}" style="width:100px;height:auto;margin-bottom:5px;border-radius:4px;"><br>`;
    }
    if (item.deskripsi) {
        kontenHTML += `<p style="margin:0 0 5px 0;font-size:13px;">${item.deskripsi}</p>`;
    }
    container.innerHTML = kontenHTML;

    if (item.linkDetail) {
        const link = L.DomUtil.create('a', 'popup-link', container);
        link.textContent = 'Lihat Detail';
        link.href = '#'; 
        link.style.color = '#1976D2';
        link.style.textDecoration = 'none';

        L.DomEvent.on(link, 'click', (e) => {
            L.DomEvent.stop(e); 
                     alert(`Navigasi ke: ${item.linkDetail} (implementasi dengan Angular Router)`);
            this.map.closePopup(); 
        });
    }
    return container;
  }

  private addMarkers(): void {
    this.lokasiData.forEach(item => {
      if (typeof item.lat === 'number' && typeof item.lng === 'number') {
        const marker = L.marker([item.lat, item.lng]).addTo(this.map);
        marker.bindPopup(() => this.buatKontenPopup(item));
      } else {
        console.warn("Data lokasi tidak valid (lat/lng missing):", item.nama);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      console.log('[InteractiveMapComponent] Peta Leaflet dihancurkan.');
    }
  }
}