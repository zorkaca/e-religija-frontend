import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AdminService } from '../../services/admin.service';
import { ReligionService, CreateReligiousObjectRequest } from '../../services/religion.service';
import { AppointmentService } from '../../services/appointment.service';
import {
  AdminStats, AdminUser, Appointment, AppointmentStatus,
  Religion, ReligiousObject, ReligiousObjectType, UserRole
} from '../../models/models';

interface NewObjectForm {
  name: string;
  address: string;
  city: string;
  objectType: ReligiousObjectType | '';
  workingHours: string;
  description: string;
  phoneNumber: string;
  email: string;
  religionId: number | null;
  clergypersonId: number | null;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatIconModule,
    MatTabsModule, MatProgressSpinnerModule, MatSnackBarModule
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  UserRole = UserRole;
  AppointmentStatus = AppointmentStatus;
  ReligiousObjectType = ReligiousObjectType;

  stats: AdminStats | null = null;
  users: AdminUser[] = [];
  appointments: Appointment[] = [];
  objects: ReligiousObject[] = [];
  religions: Religion[] = [];
  loading = { stats: true, users: true, appointments: true, objects: true };

  editingRoleId: number | null = null;
  newRole: UserRole = UserRole.User;
  newObjectId: number | null = null;

  filterStatus: AppointmentStatus | '' = '';

  showAddObjectForm = false;
  savingObject = false;
  newObject: NewObjectForm = this.emptyObjectForm();

  objectTypes = [
    { value: ReligiousObjectType.OrthodoxChurch, label: 'Pravoslavna crkva' },
    { value: ReligiousObjectType.CatholicChurch, label: 'Katolička crkva' },
    { value: ReligiousObjectType.Monastery, label: 'Manastir' },
    { value: ReligiousObjectType.Mosque, label: 'Džamija' },
    { value: ReligiousObjectType.Mesdzhid, label: 'Mesdžid' },
    { value: ReligiousObjectType.Parish, label: 'Župa' },
  ];

  get clergyUsers(): AdminUser[] {
    return this.users.filter(u => u.role === UserRole.Clergy);
  }

  constructor(
    private adminService: AdminService,
    private religionService: ReligionService,
    private appointmentService: AppointmentService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.adminService.getStats().subscribe({
      next: (s) => { this.stats = s; this.loading.stats = false; },
      error: () => { this.loading.stats = false; }
    });

    this.adminService.getUsers().subscribe({
      next: (u) => { this.users = u; this.loading.users = false; },
      error: () => { this.loading.users = false; }
    });

    this.appointmentService.getAllAppointments().subscribe({
      next: (a) => { this.appointments = a; this.loading.appointments = false; },
      error: () => { this.loading.appointments = false; }
    });

    this.religionService.getReligiousObjects().subscribe({
      next: (o) => { this.objects = o; this.loading.objects = false; },
      error: () => { this.loading.objects = false; }
    });

    this.religionService.getReligions().subscribe({
      next: (r) => { this.religions = r; },
      error: () => {}
    });
  }

  // --- Upravljanje objektima ---

  openAddObjectForm(): void {
    this.newObject = this.emptyObjectForm();
    this.showAddObjectForm = true;
  }

  cancelAddObject(): void {
    this.showAddObjectForm = false;
  }

  saveObject(): void {
    if (!this.newObject.name || !this.newObject.address || !this.newObject.city ||
        this.newObject.objectType === '' || !this.newObject.religionId) {
      this.snackBar.open('Popunite sva obavezna polja.', 'OK', { duration: 3000, panelClass: 'error-snack' });
      return;
    }

    this.savingObject = true;
    const payload: CreateReligiousObjectRequest = {
      name: this.newObject.name,
      address: this.newObject.address,
      city: this.newObject.city,
      objectType: Number(this.newObject.objectType),
      workingHours: this.newObject.workingHours,
      description: this.newObject.description,
      phoneNumber: this.newObject.phoneNumber,
      email: this.newObject.email,
      religionId: Number(this.newObject.religionId),
      clergypersonId: this.newObject.clergypersonId ? Number(this.newObject.clergypersonId) : null
    };
    this.religionService.createReligiousObject(payload).subscribe({
      next: (created) => {
        this.objects = [created, ...this.objects];
        this.showAddObjectForm = false;
        this.savingObject = false;
        this.snackBar.open('Objekat uspješno dodan!', 'OK', { duration: 3000, panelClass: 'success-snack' });
      },
      error: () => {
        this.savingObject = false;
        this.snackBar.open('Greška pri dodavanju objekta.', 'OK', { duration: 3000, panelClass: 'error-snack' });
      }
    });
  }

  deleteObject(id: number): void {
    if (!confirm('Deaktivirati ovaj objekat?')) return;
    this.religionService.deleteReligiousObject(id).subscribe({
      next: () => {
        this.objects = this.objects.filter(o => o.id !== id);
        this.snackBar.open('Objekat deaktiviran.', 'OK', { duration: 3000, panelClass: 'success-snack' });
      },
      error: () => { this.snackBar.open('Greška.', 'OK', { duration: 3000, panelClass: 'error-snack' }); }
    });
  }

  // --- Upravljanje korisnicima ---

  startEditRole(user: AdminUser): void {
    this.editingRoleId = user.id;
    this.newRole = user.role;
    this.newObjectId = user.religiousObjectId ?? null;
  }

  saveRole(userId: number): void {
    this.adminService.updateUserRole(userId, Number(this.newRole) as UserRole, this.newObjectId ? Number(this.newObjectId) : undefined).subscribe({
      next: () => {
        const user = this.users.find(u => u.id === userId);
        if (user) {
          user.role = this.newRole;
          user.roleLabel = this.getRoleLabel(this.newRole);
          user.religiousObjectId = this.newObjectId ?? undefined;
          const obj = this.objects.find(o => o.id === this.newObjectId);
          user.religiousObjectName = obj?.name;
        }
        this.editingRoleId = null;
        this.snackBar.open('Uloga ažurirana.', 'OK', { duration: 3000, panelClass: 'success-snack' });
      },
      error: () => { this.snackBar.open('Greška.', 'OK', { duration: 3000, panelClass: 'error-snack' }); }
    });
  }

  toggleActive(user: AdminUser): void {
    this.adminService.toggleUserActive(user.id).subscribe({
      next: (res) => {
        user.isActive = res.isActive;
        this.snackBar.open(res.message, 'OK', { duration: 3000, panelClass: 'success-snack' });
      },
      error: () => { this.snackBar.open('Greška.', 'OK', { duration: 3000, panelClass: 'error-snack' }); }
    });
  }

  // --- Helpers ---

  getRoleLabel(role: UserRole): string {
    return role === UserRole.Admin ? 'Administrator' : role === UserRole.Clergy ? 'Svešteno lice' : 'Korisnik';
  }

  getStatusClass(status: AppointmentStatus): string {
    return status === AppointmentStatus.Pending ? 'pending'
      : status === AppointmentStatus.Approved ? 'approved' : 'rejected';
  }

  get filteredAppointments(): Appointment[] {
    if (this.filterStatus === '') return this.appointments;
    return this.appointments.filter(a => a.status === Number(this.filterStatus));
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('bs-BA', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  private emptyObjectForm(): NewObjectForm {
    return {
      name: '', address: '', city: '', objectType: '',
      workingHours: '', description: '', phoneNumber: '',
      email: '', religionId: null, clergypersonId: null
    };
  }
}
