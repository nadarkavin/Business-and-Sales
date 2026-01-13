import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private API_URL = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /* ---------- PRODUCTS ---------- */

  getProducts(): Observable<any[]> {
    return this.http.get<any[]>(`${this.API_URL}/products`);
  }

  addProduct(product: any): Observable<any> {
    return this.http.post(`${this.API_URL}/products`, product);
  }

  updateProduct(id: number, product: any): Observable<any> {
    return this.http.put(`${this.API_URL}/products/${id}`, product);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.API_URL}/products/${id}`);
  }

  /* ---------- PERSONAL INFO ---------- */

  getPersonalInfo(): Observable<any> {
    return this.http.get(`${this.API_URL}/personalInfo`);
  }

  savePersonalInfo(data: any): Observable<any> {
    return this.http.put(`${this.API_URL}/personalInfo`, data);
  }
}
