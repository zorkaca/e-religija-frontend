import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { ReligionService } from '../../services/religion.service';
import { ThemeService } from '../../services/theme.service';
import { Religion, UserRole } from '../../models/models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  UserRole = UserRole;
  form: FormGroup;
  religions: Religion[] = [];
  loading = true;
  saving = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private religionService: ReligionService,
    public themeService: ThemeService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', Validators.required],
      religionId: [null]
    });
  }

  ngOnInit(): void {
    this.religionService.getReligions().subscribe({
      next: (religions) => { this.religions = religions; },
      error: () => {}
    });

    this.auth.getMe().subscribe({
      next: (user) => {
        this.form.patchValue({
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          religionId: user.religionId ?? null
        });
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  get user() {
    return this.auth.currentUser();
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }

    this.saving = true;
    this.auth.updateMe(this.form.value).subscribe({
      next: (user) => {
        const religion = this.religions.find(r => r.id === user.religionId);
        if (religion) {
          this.themeService.setTheme(religion);
        }
        this.saving = false;
        this.snackBar.open('Profil je uspješno ažuriran.', 'OK', { duration: 3000, panelClass: 'success-snack' });
      },
      error: (err) => {
        this.saving = false;
        this.snackBar.open(err.error?.message || 'Greška pri ažuriranju profila.', 'OK', { duration: 4000, panelClass: 'error-snack' });
      }
    });
  }
}
