import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    // private baseUrl = 'http://localhost/api';
    private baseUrl = 'https://azhalitsolutions.com/api';

    constructor(private http: HttpClient) { }
    getBaseUrl(): string {
        return this.baseUrl;
    }

    get<T>(endpoint: string): Observable<T> {
        return this.http.get<T>(`${this.baseUrl}/${endpoint}`);
    }

    post<T>(endpoint: string, body: any): Observable<T> {
        return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
    }

    // Home Content form
    postHomeContent(body: FormData): Observable<any> {
        return this.post<any>('home_content.php', body);
    }

    // Add delete method here
    delete<T>(endpoint: string): Observable<T> {
        return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
    }
    // --- About sections specific helpers (wrap about_content.php) ---
    getAboutSections(): Observable<any[]> {
        // GET about_content.php -> returns array of rows
        return this.get<any[]>('about_content.php');
    }

    createAboutSection(formData: FormData): Observable<any> {
        // POST to about_content.php to create
        return this.post<any>('about_content.php', formData);
    }

    updateAboutSection(id: number, formData: FormData): Observable<any> {
        // about_content.php supports method override via _method=PUT or id>0
        // ensure id present in formData and also send _method=PUT
        formData.append('id', String(id));
        formData.append('_method', 'PUT');
        return this.post<any>('about_content.php', formData);
    }

    deleteAboutSection(id: number): Observable<any> {
        // DELETE request to about_content.php?id=...
        return this.delete<any>(`about_content.php?id=${id}`);
    }


    // --- Items (about_items.php) ---
    getAboutItems(sectionId?: number): Observable<any> {
        const endpoint = sectionId ? `about_items.php?section_id=${sectionId}` : 'about_items.php';
        return this.get<any>(endpoint);
    }
    createAboutItem(payload: any): Observable<any> {
        return this.post<any>('about_items.php', payload);
    }
    updateAboutItem(id: number, payload: any): Observable<any> {
        payload = { ...payload, id, _method: 'PUT' };
        return this.post<any>('about_items.php', payload);
    }
    deleteAboutItem(id: number): Observable<any> {
        return this.delete<any>(`about_items.php?id=${id}`);
    }

    // ==============================
    // SERVICE CONTENT (services_content.php)
    // ==============================
    // GET all services
    getServiceContents(): Observable<any> {
        return this.http.get(`${this.baseUrl}/services_content.php`);
    }

    // CREATE new service
    createServiceContent(payload: any): Observable<any> {
        return this.http.post(`${this.baseUrl}/services_content.php`, payload);
    }

    // UPDATE service
    updateServiceContent(id: number, payload: any): Observable<any> {
        payload.id = id;           // include ID for PHP
        payload._method = 'PUT';   // mark as update
        return this.http.post(`${this.baseUrl}/services_content.php`, payload);
    }

    // DELETE service
    deleteServiceContent(id: number): Observable<any> {
        // send ID as query param ?id=...
        return this.http.delete(`${this.baseUrl}/services_content.php?id=${id}`);
    }
    // =========================
    // EMPLOYEE CRUD
    // =========================

    getemployeelist(): Observable<any[]> {
        return this.get<any[]>('employee.php');
    }

    createEmployee(formData: FormData): Observable<any> {
        return this.post<any>('employee.php', formData);
    }

    updateEmployee(id: number, formData: FormData): Observable<any> {
        // Include ID in query params
        return this.post<any>(`employee.php?id=${id}`, formData);
    }

    deleteEmployee(id: number): Observable<any> {
        return this.delete<any>(`employee.php?id=${id}`);
    }
}
