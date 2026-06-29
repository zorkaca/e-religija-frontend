import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment, AppointmentStatus, AvailabilityResult } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AppointmentService {
  private readonly API = `${environment.apiUrl}/appointments`;

  constructor(private http: HttpClient) {}

  create(data: {
    religiousObjectId: number;
    ceremonyTypeId: number;
    requestedDate: string;
    requestedTime: string;
    notes: string;
  }): Observable<Appointment> {
    return this.http.post<Appointment>(this.API, data);
  }

  getMyAppointments(): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API}/my`);
  }

  getById(id: number): Observable<Appointment> {
    return this.http.get<Appointment>(`${this.API}/${id}`);
  }

  getObjectAppointments(objectId: number): Observable<Appointment[]> {
    return this.http.get<Appointment[]>(`${this.API}/object/${objectId}`);
  }

  getAllAppointments(status?: AppointmentStatus): Observable<Appointment[]> {
    let url = `${this.API}/all`;
    if (status !== undefined) url += `?status=${status}`;
    return this.http.get<Appointment[]>(url);
  }

  updateStatus(id: number, data: {
    status: AppointmentStatus;
    clergypersonNote: string;
    alternativeDate?: string;
    alternativeTime?: string;
  }): Observable<Appointment> {
    return this.http.put<Appointment>(`${this.API}/${id}/status`, data);
  }

  checkAvailability(data: {
    religiousObjectId: number;
    date: string;
    time: string;
    ceremonyTypeId: number;
  }): Observable<AvailabilityResult> {
    return this.http.post<AvailabilityResult>(`${this.API}/check-availability`, data);
  }
}
