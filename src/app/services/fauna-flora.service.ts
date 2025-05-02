import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FaunaFloraService {

  private faunaApiUrl = 'https://api.example.com/fauna';  
  private floraApiUrl = 'https://api.example.com/flora'; 

  constructor(private http: HttpClient) { }

  // Ambil data fauna
  getFaunaData(): Observable<any> {
    return this.http.get<any>(this.faunaApiUrl);
  }

  // Ambil data flora
  getFloraData(): Observable<any> {
    return this.http.get<any>(this.floraApiUrl);
  }
}
