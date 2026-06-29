import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../services/auth.service';
import { AppointmentService } from '../../services/appointment.service';
import { ThemeService } from '../../services/theme.service';
import { Appointment, AppointmentStatus } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, MatIconModule,
    MatProgressSpinnerModule, MatTabsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  AppointmentStatus = AppointmentStatus;
  appointments: Appointment[] = [];
  loading = true;

  get user() { return this.auth.currentUser(); }
  get religion() { return this.themeService.selectedReligion(); }

  get pending() { return this.appointments.filter(a => a.status === AppointmentStatus.Pending); }
  get approved() { return this.appointments.filter(a => a.status === AppointmentStatus.Approved); }
  get rejected() { return this.appointments.filter(a => a.status === AppointmentStatus.Rejected); }

  constructor(
    public auth: AuthService,
    private appointmentService: AppointmentService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.appointmentService.getMyAppointments().subscribe({
      next: (apps) => {
        this.appointments = apps;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getStatusClass(status: AppointmentStatus): string {
    return status === AppointmentStatus.Pending ? 'pending'
      : status === AppointmentStatus.Approved ? 'approved' : 'rejected';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('bs-BA', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
