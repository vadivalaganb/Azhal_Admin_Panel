import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
    private baseUrl = 'http://localhost/api';
    // private baseUrl = 'https://azhalitsolutions.com/api';

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

}
