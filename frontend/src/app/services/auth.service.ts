import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, User, UserRole } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;
  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  register(data: { firstName: string; lastName: string; email: string; password: string; phoneNumber: string; religionId?: number }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.API}/login`, { email, password }).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/']);
  }

  handleExpiredSession(): void {
    this.clearSession();
    this.router.navigate(['/auth/login'], {
      queryParams: { sessionExpired: 'true' }
    });
  }

  isTokenExpired(token?: string | null): boolean {
    const value = token ?? this.getToken();
    if (!value) {
      return true;
    }

    try {
      const payload = JSON.parse(atob(value.split('.')[1]));
      if (!payload?.exp) {
        return false;
      }

      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  getMe(): Observable<User> {
    return this.http.get<User>(`${this.API}/me`).pipe(
      tap(u => {
        const user = this.normalizeUser(u);
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  updateMe(data: { firstName: string; lastName: string; phoneNumber: string; religionId?: number }): Observable<User> {
    return this.http.put<User>(`${this.API}/me`, data).pipe(
      tap(u => {
        const user = this.normalizeUser(u);
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    if (this.isTokenExpired(token)) {
      this.clearSession();
      return false;
    }

    return true;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAdmin(): boolean {
    return this.currentUser()?.role === UserRole.Admin;
  }

  isClergy(): boolean {
    return this.currentUser()?.role === UserRole.Clergy;
  }

  private normalizeRole(role: unknown): UserRole {
    if (typeof role === 'number' && !Number.isNaN(role)) {
      if (role === UserRole.Clergy || role === UserRole.Admin || role === UserRole.User) {
        return role as UserRole;
      }
    }

    if (typeof role === 'string') {
      const numericRole = Number(role);
      if (!Number.isNaN(numericRole) && (numericRole === UserRole.User || numericRole === UserRole.Clergy || numericRole === UserRole.Admin)) {
        return numericRole as UserRole;
      }

      const map: Record<string, UserRole> = {
        User: UserRole.User,
        Clergy: UserRole.Clergy,
        Admin: UserRole.Admin
      };
      return map[role] ?? UserRole.User;
    }

    return UserRole.User;
  }

  private normalizeUser(user: User): User {
    return { ...user, role: this.normalizeRole(user.role) };
  }

  private handleAuth(res: AuthResponse): void {
    const user = this.normalizeUser(res.user);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUser.set(user);
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr || this.isTokenExpired(token)) {
      this.clearSession();
      return;
    }

    try {
      const user = this.normalizeUser(JSON.parse(userStr));
      this.currentUser.set(user);
    } catch {
      this.clearSession();
    }
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
  }
}
