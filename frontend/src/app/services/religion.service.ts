import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Religion, CeremonyType, ReligiousObject, ReligiousObjectType } from '../models/models';
import { environment } from '../../environments/environment';

export interface CreateReligiousObjectRequest {
  name: string;
  address: string;
  city: string;
  objectType: number;
  workingHours: string;
  description: string;
  phoneNumber: string;
  email: string;
  religionId: number;
  clergypersonId: number | null;
}

@Injectable({ providedIn: 'root' })
export class ReligionService {
  private readonly API = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getReligions(): Observable<Religion[]> {
    return this.http.get<Religion[]>(`${this.API}/religions`);
  }

  getReligion(id: number): Observable<Religion> {
    return this.http.get<Religion>(`${this.API}/religions/${id}`);
  }

  getCeremonyTypes(religionId: number): Observable<CeremonyType[]> {
    return this.http.get<CeremonyType[]>(`${this.API}/religions/${religionId}/ceremony-types`);
  }

  getReligiousObjects(religionId?: number, city?: string): Observable<ReligiousObject[]> {
    let url = `${this.API}/religious-objects`;
    const params: string[] = [];
    if (religionId) params.push(`religionId=${religionId}`);
    if (city) params.push(`city=${city}`);
    if (params.length) url += `?${params.join('&')}`;
    return this.http.get<ReligiousObject[]>(url);
  }

  getReligiousObject(id: number): Observable<ReligiousObject> {
    return this.http.get<ReligiousObject>(`${this.API}/religious-objects/${id}`);
  }

  createReligiousObject(data: CreateReligiousObjectRequest): Observable<ReligiousObject> {
    return this.http.post<ReligiousObject>(`${this.API}/religious-objects`, data);
  }

  updateReligiousObject(id: number, data: Partial<ReligiousObject>): Observable<void> {
    return this.http.put<void>(`${this.API}/religious-objects/${id}`, data);
  }

  deleteReligiousObject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/religious-objects/${id}`);
  }
}
