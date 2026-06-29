import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { AuthService } from '../../../services/auth.service';
import { ReligionService } from '../../../services/religion.service';
import { ThemeService } from '../../../services/theme.service';
import { Religion } from '../../../models/models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatButtonModule,
    MatIconModule, MatSelectModule, MatProgressSpinnerModule,
    MatSnackBarModule, MatStepperModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  personalForm: FormGroup;
  credentialsForm: FormGroup;
  loading = false;
  hidePassword = true;
  hideConfirm = true;
  religions: Religion[] = [];

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private religionService: ReligionService,
    private router: Router,
    private snackBar: MatSnackBar,
    public themeService: ThemeService
  ) {
    this.personalForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phoneNumber: ['', Validators.required],
      religionId: [this.themeService.selectedReligion()?.id || null]
    });

    this.credentialsForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.religionService.getReligions().subscribe(r => this.religions = r);
    const religion = this.themeService.selectedReligion();
    if (religion) {
      this.personalForm.patchValue({ religionId: religion.id });
    }
  }

  passwordMatchValidator(group: FormGroup) {
    const pass = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  submit(): void {
    if (this.personalForm.invalid || this.credentialsForm.invalid) return;
    this.loading = true;

    const data = {
      ...this.personalForm.value,
      ...this.credentialsForm.value
    };
    delete data['confirmPassword'];

    this.auth.register(data).subscribe({
      next: (res) => {
        const religion = this.religions.find(r => r.id === data.religionId);
        if (religion) this.themeService.setTheme(religion);
        this.snackBar.open(`Dobrodošli, ${res.user.firstName}!`, 'OK', { duration: 3000, panelClass: 'success-snack' });
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        const msg = err.error?.message || 'Greška pri registraciji.';
        this.snackBar.open(msg, 'OK', { duration: 4000, panelClass: 'error-snack' });
      }
    });
  }
}
