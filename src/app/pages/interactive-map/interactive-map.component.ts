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
    deskripsi: "Habitat asli Komodo di Nusa Tenggara Timur.",
    imageUrl: "https://placehold.co/100x80/A1887F/FFFFFF?text=Komodo",
    linkDetail: "/fauna/komodo-slug"
  },
  {
    lat: -0.502106, lng: 111.475285, nama: "Hutan Kalimantan",
    deskripsi: "Rumah bagi Orangutan dan biodiversitas tropis.",
    imageUrl: "https://placehold.co/100x80/66BB6A/FFFFFF?text=Orangutan",
    linkDetail: "/fauna/orangutan-slug"
  },
  {
    lat: -6.752222, lng: 105.331111, nama: "Ujung Kulon",
    deskripsi: "Habitat Badak Jawa yang terancam punah.",
    imageUrl: "https://placehold.co/100x80/757575/FFFFFF?text=Badak",
    linkDetail: "/fauna/badak-jawa"
  },
  {
    lat: -8.409518, lng: 115.188919, nama: "Taman Nasional Bali Barat",
    deskripsi: "Habitat Jalak Bali, burung langka endemik Bali.",
    imageUrl: "https://placehold.co/100x80/4FC3F7/FFFFFF?text=Jalak+Bali",
    linkDetail: "/flora/jalak-bali"
  },
  {
    lat: -2.990934, lng: 104.756554, nama: "Taman Nasional Sembilang",
    deskripsi: "Ekosistem mangrove dan tempat persinggahan burung migran.",
    imageUrl: "https://placehold.co/100x80/388E3C/FFFFFF?text=Sembilang",
    linkDetail: "/konservasi/sembilang"
  },
  {
    lat: -2.2667, lng: 99.6167, nama: "Danau Toba",
    deskripsi: "Danau vulkanik terbesar dengan flora-fauna endemik air tawar.",
    imageUrl: "https://placehold.co/100x80/0288D1/FFFFFF?text=Toba",
    linkDetail: "/flora-fauna/danau-toba"
  },
  {
    lat: -7.8014, lng: 110.3647, nama: "Gunung Merapi",
    deskripsi: "Wilayah konservasi pegunungan dengan vegetasi khas.",
    imageUrl: "https://placehold.co/100x80/F57C00/FFFFFF?text=Merapi",
    linkDetail: "/konservasi/merapi"
  },
  {
    lat: -1.495, lng: 124.836, nama: "Taman Nasional Bogani Nani Wartabone",
    deskripsi: "Habitat Maleo dan spesies burung langka lainnya.",
    imageUrl: "https://placehold.co/100x80/5D4037/FFFFFF?text=Maleo",
    linkDetail: "/fauna/maleo"
  },
  {
    lat: -4.222, lng: 137.056, nama: "Pegunungan Cyclops Papua",
    deskripsi: "Flora dan fauna unik khas Papua bagian timur.",
    imageUrl: "https://placehold.co/100x80/00796B/FFFFFF?text=Cyclops",
    linkDetail: "/flora-fauna/cyclops"
  },
  {
    lat: -0.1769, lng: 117.3563, nama: "Taman Nasional Kutai",
    deskripsi: "Salah satu kawasan penting pelestarian hutan tropis Kalimantan.",
    imageUrl: "https://placehold.co/100x80/8D6E63/FFFFFF?text=Kutai",
    linkDetail: "/konservasi/kutai"
  },
  {
    lat: -3.8594, lng: 126.7555, nama: "Pulau Seram",
    deskripsi: "Dikenal dengan kakatua seram dan anggrek endemik.",
    imageUrl: "https://placehold.co/100x80/BA68C8/FFFFFF?text=Seram",
    linkDetail: "/fauna/kakatua-seram"
  },
  {
    lat: -8.1667, lng: 124.0167, nama: "Pulau Flores",
    deskripsi: "Tumbuhan langka dan budaya lokal menyatu dalam ekosistem.",
    imageUrl: "https://placehold.co/100x80/9E9D24/FFFFFF?text=Flores",
    linkDetail: "/flora/flores"
  },
  {
    lat: -1.3364, lng: 100.5722, nama: "Taman Nasional Kerinci Seblat",
    deskripsi: "Rumah Harimau Sumatera dan Rafflesia arnoldii.",
    imageUrl: "https://placehold.co/100x80/EF5350/FFFFFF?text=Kerinci",
    linkDetail: "/fauna/harimau-sumatera"
  },
  {
    lat: 1.5029, lng: 124.9244, nama: "Tangkoko Batuangus",
    deskripsi: "Habitat monyet hitam Sulawesi (Yaki) dan burung rangkong.",
    imageUrl: "https://placehold.co/100x80/455A64/FFFFFF?text=Yaki",
    linkDetail: "/fauna/yaki"
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