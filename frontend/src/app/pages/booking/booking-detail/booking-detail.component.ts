import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AppointmentService } from '../../../services/appointment.service';
import { Appointment, AppointmentStatus } from '../../../models/models';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule],
  template: `
    <div class="page-container">
      <a routerLink="/dashboard" class="back-link">
        <mat-icon>arrow_back</mat-icon> Nazad
      </a>
      <div class="loading-container" *ngIf="loading">
        <mat-spinner diameter="48"></mat-spinner>
      </div>
      <div class="detail-card" *ngIf="appointment">
        <div class="detail-header">
          <h1>{{ appointment.ceremonyTypeName }}</h1>
          <span class="status-badge" [class]="statusClass">{{ appointment.statusLabel }}</span>
        </div>
        <div class="detail-body">
          <div class="detail-row"><mat-icon>account_balance</mat-icon><div><label>Objekat</label><span>{{ appointment.religiousObjectName }}, {{ appointment.religiousObjectCity }}</span></div></div>
          <div class="detail-row"><mat-icon>calendar_today</mat-icon><div><label>Datum i termin</label><span>{{ formatDate(appointment.requestedDate) }} u {{ appointment.requestedTime }}</span></div></div>
          <div class="detail-row" *ngIf="appointment.notes"><mat-icon>notes</mat-icon><div><label>Napomena</label><span>{{ appointment.notes }}</span></div></div>
          <div class="detail-row" *ngIf="appointment.clergypersonNote"><mat-icon>comment</mat-icon><div><label>Odgovor sveštenog lica</label><span>{{ appointment.clergypersonNote }}</span></div></div>
          <div class="detail-row" *ngIf="appointment.alternativeDate"><mat-icon>event_repeat</mat-icon><div><label>Predloženi termin</label><span>{{ formatDate(appointment.alternativeDate!) }} u {{ appointment.alternativeTime }}</span></div></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .back-link { display: inline-flex; align-items: center; gap: 6px; text-decoration: none; color: var(--color-primary); margin-bottom: 20px; font-weight: 500; }
    .detail-card { background: var(--color-surface); border-radius: 16px; padding: 32px; box-shadow: 0 4px 20px rgba(0,0,0,.08); }
    .detail-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 12px; }
    h1 { font-family: var(--font-heading); font-size: 1.8rem; color: var(--color-primary); }
    .detail-row { display: flex; gap: 14px; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,.05); mat-icon { color: var(--color-primary); margin-top: 2px; } div { display: flex; flex-direction: column; gap: 2px; } label { font-size: .75rem; text-transform: uppercase; letter-spacing: .5px; color: var(--color-text-light); font-weight: 600; } span { font-size: .95rem; color: var(--color-text); } }
    .status-badge { padding: 6px 16px; border-radius: 20px; font-weight: 600; font-size: .85rem; &.pending { background: #fff3cd; color: #856404; } &.approved { background: #d1e7dd; color: #0f5132; } &.rejected { background: #f8d7da; color: #842029; } }
  `]
})
export class BookingDetailComponent implements OnInit {
  appointment: Appointment | null = null;
  loading = true;

  get statusClass() {
    return this.appointment?.status === AppointmentStatus.Pending ? 'pending'
      : this.appointment?.status === AppointmentStatus.Approved ? 'approved' : 'rejected';
  }

  constructor(private route: ActivatedRoute, private appointmentService: AppointmentService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.appointmentService.getById(id).subscribe({
      next: (a) => { this.appointment = a; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('bs-BA', { day: '2-digit', month: 'long', year: 'numeric' });
  }
}
