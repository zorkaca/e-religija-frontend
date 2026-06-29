import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AppointmentService } from '../../services/appointment.service';
import { AuthService } from '../../services/auth.service';
import { Appointment, AppointmentStatus } from '../../models/models';

@Component({
  selector: 'app-clergy-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule,
    MatProgressSpinnerModule, MatTabsModule, MatSnackBarModule
  ],
  templateUrl: './clergy-dashboard.component.html',
  styleUrls: ['./clergy-dashboard.component.scss']
})
export class ClergyDashboardComponent implements OnInit {
  AppointmentStatus = AppointmentStatus;
  appointments: Appointment[] = [];
  loading = true;
  processingId: number | null = null;

  activeAction: { id: number; type: 'approve' | 'reject' } | null = null;
  clergyNote = '';
  alternativeDate = '';
  alternativeTime = '';

  get user() { return this.auth.currentUser(); }
  get pending() { return this.appointments.filter(a => a.status === AppointmentStatus.Pending); }
  get approved() { return this.appointments.filter(a => a.status === AppointmentStatus.Approved); }
  get rejected() { return this.appointments.filter(a => a.status === AppointmentStatus.Rejected); }

  constructor(
    private appointmentService: AppointmentService,
    public auth: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const objectId = this.user?.religiousObjectId;
    if (objectId) {
      this.appointmentService.getObjectAppointments(objectId).subscribe({
        next: (apps) => { this.appointments = apps; this.loading = false; },
        error: () => { this.loading = false; }
      });
    } else if (this.auth.isAdmin()) {
      this.appointmentService.getAllAppointments().subscribe({
        next: (apps) => { this.appointments = apps; this.loading = false; },
        error: () => { this.loading = false; }
      });
    } else {
      this.loading = false;
    }
  }

  startAction(id: number, type: 'approve' | 'reject'): void {
    this.activeAction = { id, type };
    this.clergyNote = '';
    this.alternativeDate = '';
    this.alternativeTime = '';
  }

  cancelAction(): void {
    this.activeAction = null;
  }

  confirmAction(): void {
    if (!this.activeAction) return;
    this.processingId = this.activeAction.id;
    const status = this.activeAction.type === 'approve' ? AppointmentStatus.Approved : AppointmentStatus.Rejected;

    this.appointmentService.updateStatus(this.activeAction.id, {
      status,
      clergypersonNote: this.clergyNote,
      alternativeDate: this.alternativeDate || undefined,
      alternativeTime: this.alternativeTime || undefined
    }).subscribe({
      next: (updated) => {
        const idx = this.appointments.findIndex(a => a.id === updated.id);
        if (idx >= 0) this.appointments[idx] = updated;
        this.processingId = null;
        this.activeAction = null;
        const msg = status === AppointmentStatus.Approved ? 'Termin odobren!' : 'Termin odbijen.';
        this.snackBar.open(msg, 'OK', { duration: 3000, panelClass: status === AppointmentStatus.Approved ? 'success-snack' : 'error-snack' });
      },
      error: () => {
        this.processingId = null;
        this.snackBar.open('Greška pri ažuriranju.', 'OK', { duration: 3000, panelClass: 'error-snack' });
      }
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
