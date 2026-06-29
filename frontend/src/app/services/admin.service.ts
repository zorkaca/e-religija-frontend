import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AdminStats, AdminUser, UserRole } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly API = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.API}/stats`);
  }

  getUsers(role?: UserRole): Observable<AdminUser[]> {
    let url = `${this.API}/users`;
    if (role !== undefined) url += `?role=${role}`;
    return this.http.get<AdminUser[]>(url);
  }

  updateUserRole(userId: number, role: UserRole, religiousObjectId?: number): Observable<void> {
    return this.http.put<void>(`${this.API}/users/${userId}/role`, { role, religiousObjectId });
  }

  toggleUserActive(userId: number): Observable<{ isActive: boolean; message: string }> {
    return this.http.put<{ isActive: boolean; message: string }>(`${this.API}/users/${userId}/toggle-active`, {});
  }
}
