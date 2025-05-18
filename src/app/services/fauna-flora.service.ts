import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Fauna, TaxonPhoto, Ancestor } from '../models/fauna.model'; 
import { Flora } from '../models/flora.model'; 

@Injectable({
  providedIn: 'root'
})
export class FaunaFloraService {
  private iNaturalistApiBaseUrl = 'https://api.inaturalist.org/v1/taxa';
  private placeholderImageUrl = 'assets/images/placeholder.png'; 

  constructor(private http: HttpClient) { }

  searchFauna(query: string, perPage: number = 12): Observable<Fauna[]> {
    if (!query || !query.trim()) {
      return of([]);
    }
    const params = new HttpParams()
      .set('q', query)
      .set('is_active', 'true')
      .set('rank', 'species')
      .set('locale', 'id-ID') 
      .set('preferred_place_id', '6903') 
      .set('taxon_id', '1')
      .set('per_page', perPage.toString());

    console.log(`[FaunaFloraService] Searching fauna with params: ${params.toString()}`);

    return this.http.get<any>(this.iNaturalistApiBaseUrl, { params }).pipe(
      map(response => {
        console.log('[FaunaFloraService] API Response (Fauna List):', response);
        if (response && response.results) {
          return response.results.map((item: any): Fauna => {
            let statusKonservasiText = 'Tidak Diketahui';
            if (item.conservation_status) {
              statusKonservasiText = `${item.conservation_status.status_name || item.conservation_status.status || ''} (IUCN)`;
            } else if (item.statuses && item.statuses.length > 0) {
              const iucnStatus = item.statuses.find((s: any) => s.authority === 'IUCN Red List');
              if (iucnStatus) {
                statusKonservasiText = `${iucnStatus.status_name || iucnStatus.status} (IUCN)`;
              }
            }

            const taxonPhotos: TaxonPhoto[] = item.taxon_photos ?
              item.taxon_photos.slice(0, 5).map((tp: any) => ({
                id: tp.photo.id,
                url: tp.photo.medium_url || tp.photo.square_url || tp.photo.url,
                attribution: tp.photo.attribution
              })) : [];

            const ancestors: Ancestor[] = item.ancestors ?
              item.ancestors.map((anc: any) => ({
                id: anc.id,
                name: anc.name,
                rank: anc.rank,
                preferred_common_name: anc.preferred_common_name
              })) : [];

            return {
              id: item.id,
              namaUmum: item.preferred_common_name || item.name,
              namaIlmiah: item.name,
              deskripsiSingkat: item.wikipedia_summary || undefined,
              statusKonservasi: statusKonservasiText,
              imageUrl: item.default_photo ? item.default_photo.medium_url : this.placeholderImageUrl,
              photos: taxonPhotos.length > 0 ? taxonPhotos : (item.default_photo ? [{id: item.default_photo.id, url: item.default_photo.medium_url, attribution: item.default_photo.attribution }] : []),
              ancestors: ancestors,
              wikipediaUrl: item.wikipedia_url || undefined
            };
          });
        }
        return [];
      }),
      catchError(this.handleError<Fauna[]>('searchFauna', []))
    );
  }

  getFaunaDetailById(id: number): Observable<Fauna | null> {
    if (!id) {
      return of(null);
    }
    const detailUrl = `${this.iNaturalistApiBaseUrl}/${id}`;
    console.log(`[FaunaFloraService] Fetching fauna detail for ID: ${id} from URL: ${detailUrl}`);

    return this.http.get<any>(detailUrl).pipe(
      map(response => {
        console.log('[FaunaFloraService] RAW API Response (Fauna Detail):', response);
            const item = response && response.results && response.results[0];

        if (item) {
          let statusKonservasiText = 'Tidak Diketahui';
          if (item.conservation_status) {
            statusKonservasiText = `${item.conservation_status.status_name || item.conservation_status.status || ''} (IUCN)`;
          } else if (item.statuses && item.statuses.length > 0) {
            const iucnStatus = item.statuses.find((s: any) => s.authority === 'IUCN Red List');
            if (iucnStatus) {
              statusKonservasiText = `${iucnStatus.status_name || iucnStatus.status} (IUCN)`;
            }
          }
          const taxonPhotos: TaxonPhoto[] = item.taxon_photos ?
            item.taxon_photos.slice(0, 5).map((tp: any) => ({
              id: tp.photo.id,
              url: tp.photo.medium_url || tp.photo.square_url || tp.photo.url,
              attribution: tp.photo.attribution
            })) : [];
          const ancestors: Ancestor[] = item.ancestors ?
            item.ancestors.map((anc: any) => ({
              id: anc.id,
              name: anc.name,
              rank: anc.rank,
              preferred_common_name: anc.preferred_common_name
            })) : [];

          return {
            id: item.id,
            namaUmum: item.preferred_common_name || item.name,
            namaIlmiah: item.name,
            deskripsiSingkat: item.wikipedia_summary || 'Tidak ada deskripsi lebih lanjut.',
            statusKonservasi: statusKonservasiText,
            imageUrl: item.default_photo ? (item.default_photo.large_url || item.default_photo.medium_url) : this.placeholderImageUrl,
            photos: taxonPhotos.length > 0 ? taxonPhotos : (item.default_photo ? [{id: item.default_photo.id, url: item.default_photo.medium_url, attribution: item.default_photo.attribution }] : []),
            ancestors: ancestors,
            wikipediaUrl: item.wikipedia_url || undefined
          };
        }
        console.warn('[FaunaFloraService] Item fauna tidak ditemukan dalam respons API detail atau struktur tidak sesuai.');
        return null;
      }),
      catchError(this.handleError<Fauna | null>(`getFaunaDetailById id=${id}`, null))
    );
  }

  searchFlora(query: string, perPage: number = 12): Observable<Flora[]> {
    if (!query || !query.trim()) {
      return of([]);
    }
    const params = new HttpParams()
      .set('q', query)
      .set('is_active', 'true')
      .set('rank', 'species')
      .set('taxon_id', '47126')
      .set('locale', 'id-ID')
      .set('preferred_place_id', '6903')
      .set('per_page', perPage.toString());

    console.log(`[FaunaFloraService] Searching flora with params: ${params.toString()}`);
    return this.http.get<any>(this.iNaturalistApiBaseUrl, { params }).pipe(
      map(response => {
        console.log('[FaunaFloraService] API Response (Flora List):', response);
        if (response && response.results) {
          return response.results.map((item: any): Flora => {
            const taxonPhotos: TaxonPhoto[] = item.taxon_photos ?
              item.taxon_photos.slice(0, 5).map((tp: any) => ({
                id: tp.photo.id,
                url: tp.photo.medium_url || tp.photo.square_url || tp.photo.url,
                attribution: tp.photo.attribution
              })) : [];
            const ancestors: Ancestor[] = item.ancestors ?
              item.ancestors.map((anc: any) => ({
                id: anc.id,
                name: anc.name,
                rank: anc.rank,
                preferred_common_name: anc.preferred_common_name
              })) : [];

            return {
              id: item.id,
              namaUmum: item.preferred_common_name || item.name,
              namaIlmiah: item.name,
              deskripsiSingkat: item.wikipedia_summary || undefined,
              keluarga: ancestors?.find(a => a.rank === 'family')?.name || 'Tidak diketahui',
              imageUrl: item.default_photo ? item.default_photo.medium_url : this.placeholderImageUrl,
                      };
          });
        }
        return [];
      }),
      catchError(this.handleError<Flora[]>('searchFlora', []))
    );
  }

  getFloraDetailById(id: number): Observable<Flora | null> {
    if (!id) {
      return of(null);
    }
    const detailUrl = `${this.iNaturalistApiBaseUrl}/${id}`;
    console.log(`[FaunaFloraService] Fetching flora detail for ID: ${id} from URL: ${detailUrl}`);

    return this.http.get<any>(detailUrl).pipe(
      map(response => {
        console.log('[FaunaFloraService] RAW API Response (Flora Detail):', response);
        const item = response && response.results && response.results[0];

        if (item) {
          const taxonPhotos: TaxonPhoto[] = item.taxon_photos ?
            item.taxon_photos.slice(0, 5).map((tp: any) => ({
              id: tp.photo.id,
              url: tp.photo.medium_url || tp.photo.square_url || tp.photo.url,
              attribution: tp.photo.attribution
            })) : [];
          const ancestors: Ancestor[] = item.ancestors ?
            item.ancestors.map((anc: any) => ({
              id: anc.id,
              name: anc.name,
              rank: anc.rank,
              preferred_common_name: anc.preferred_common_name
            })) : [];

          return {
            id: item.id,
            namaUmum: item.preferred_common_name || item.name,
            namaIlmiah: item.name,
            deskripsiSingkat: item.wikipedia_summary || 'Tidak ada deskripsi lebih lanjut.',
            keluarga: ancestors?.find(a => a.rank === 'family')?.name || 'Tidak diketahui',
            imageUrl: item.default_photo ? (item.default_photo.large_url || item.default_photo.medium_url) : this.placeholderImageUrl,
                     };
        }
        console.warn('[FaunaFloraService] Item flora tidak ditemukan dalam respons API detail atau struktur tidak sesuai.');
        return null;
      }),
      catchError(this.handleError<Flora | null>(`getFloraDetailById id=${id}`, null))
    );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`[FaunaFloraService] ${operation} failed:`, error);
      return of(result as T);
    };
  }
}
