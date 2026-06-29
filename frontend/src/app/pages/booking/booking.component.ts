import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AppointmentService } from '../../services/appointment.service';
import { ReligionService } from '../../services/religion.service';
import { ThemeService } from '../../services/theme.service';
import { Religion, ReligiousObject, CeremonyType, AvailabilityResult } from '../../models/models';
import { getWeddingChecklist, WeddingChecklistItem } from '../../data/wedding-checklist.data';
import { DEFAULT_TIME_SLOTS, isWeddingCeremony, resolveTimeSlots } from '../../utils/scheduling.utils';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, RouterLink,
    MatFormFieldModule, MatInputModule, MatSelectModule,
    MatButtonModule, MatIconModule, MatDatepickerModule,
    MatNativeDateModule, MatProgressSpinnerModule, MatSnackBarModule,
    MatStepperModule, MatTooltipModule, MatCheckboxModule
  ],
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss']
})
export class BookingComponent implements OnInit {
  step1Form: FormGroup;
  step2Form: FormGroup;
  step3Form: FormGroup;

  religions: Religion[] = [];
  objects: ReligiousObject[] = [];
  ceremonyTypes: CeremonyType[] = [];
  timeSlots = [...DEFAULT_TIME_SLOTS];
  weddingChecklist: WeddingChecklistItem[] = [];
  checkedChecklistItems = new Set<string>();

  loadingReligions = true;
  loadingObjects = false;
  loadingCeremonies = false;
  objectsLoadError = false;
  checkingAvailability = false;
  submitting = false;
  availabilityResult: AvailabilityResult | null = null;
  submitted = false;

  minDate = new Date();
  private preselectedObjectId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private appointmentService: AppointmentService,
    private religionService: ReligionService,
    private snackBar: MatSnackBar,
    public themeService: ThemeService
  ) {
    this.step1Form = this.fb.group({
      religionId: [null, Validators.required],
      religiousObjectId: [null, Validators.required]
    });
    this.step2Form = this.fb.group({
      ceremonyTypeId: [null, Validators.required],
      requestedDate: [null, Validators.required],
      requestedTime: ['', Validators.required]
    });
    this.step3Form = this.fb.group({
      notes: ['']
    });
  }

  ngOnInit(): void {
    const objectIdParam = this.route.snapshot.queryParamMap.get('objectId');
    this.preselectedObjectId = objectIdParam ? Number(objectIdParam) : null;

    this.step1Form.get('religiousObjectId')?.valueChanges.subscribe((objectId: number | null) => {
      this.updateTimeSlots(objectId);
      this.resetAvailabilityCheck();
    });

    this.step2Form.get('ceremonyTypeId')?.valueChanges.subscribe(() => {
      this.updateWeddingChecklist();
      this.resetAvailabilityCheck();
    });

    this.step2Form.get('requestedDate')?.valueChanges.subscribe(() => {
      this.resetAvailabilityCheck();
    });

    this.step2Form.get('requestedTime')?.valueChanges.subscribe(() => {
      this.resetAvailabilityCheck();
    });

    this.religionService.getReligions().subscribe({
      next: (religions) => {
        this.religions = religions;
        this.loadingReligions = false;

        const selected = this.themeService.selectedReligion();
        if (selected) {
          this.step1Form.patchValue({ religionId: selected.id });
          this.loadObjectsAndCeremonies(selected.id);
        }
      },
      error: () => {
        this.loadingReligions = false;
      }
    });
  }

  onReligionChange(religionId: number): void {
    this.step1Form.patchValue({ religiousObjectId: null });
    this.objects = [];
    this.ceremonyTypes = [];
    this.resetAvailabilityCheck();
    this.objectsLoadError = false;
    this.checkedChecklistItems.clear();
    this.weddingChecklist = [];
    this.timeSlots = [...DEFAULT_TIME_SLOTS];

    if (religionId) {
      this.loadObjectsAndCeremonies(religionId);
    }
  }

  private loadObjectsAndCeremonies(religionId: number): void {
    this.loadingObjects = true;
    this.objectsLoadError = false;

    this.religionService.getReligiousObjects(religionId).subscribe({
      next: (objects) => {
        this.objects = objects;
        this.loadingObjects = false;

        if (this.preselectedObjectId) {
          const selectedObject = this.objects.find(o => o.id === this.preselectedObjectId);
          if (selectedObject) {
            this.step1Form.patchValue({ religiousObjectId: selectedObject.id });
          }
          this.preselectedObjectId = null;
        }
      },
      error: () => {
        this.loadingObjects = false;
        this.objectsLoadError = true;
      }
    });

    this.loadingCeremonies = true;
    this.religionService.getCeremonyTypes(religionId).subscribe({
      next: (types) => {
        this.ceremonyTypes = types;
        this.loadingCeremonies = false;
        this.updateWeddingChecklist();
      },
      error: () => {
        this.loadingCeremonies = false;
      }
    });
  }

  private updateTimeSlots(objectId: number | null): void {
    const selectedObject = this.objects.find(o => o.id === objectId);
    this.timeSlots = resolveTimeSlots(selectedObject?.workingHours);

    const currentTime = this.step2Form.value.requestedTime;
    if (currentTime && !this.timeSlots.includes(currentTime)) {
      this.step2Form.patchValue({ requestedTime: '' });
    }
  }

  private updateWeddingChecklist(): void {
    const ceremony = this.getSelectedCeremony();
    const religion = this.getSelectedReligion();

    if (!ceremony || !isWeddingCeremony(ceremony.name)) {
      this.weddingChecklist = [];
      this.checkedChecklistItems.clear();
      return;
    }

    this.weddingChecklist = getWeddingChecklist(religion?.code);
    this.checkedChecklistItems.clear();
  }

  get showWeddingChecklist(): boolean {
    return this.weddingChecklist.length > 0;
  }

  get requiredChecklistComplete(): boolean {
    if (!this.showWeddingChecklist) {
      return true;
    }

    return this.weddingChecklist
      .filter(item => item.required)
      .every(item => this.checkedChecklistItems.has(item.text));
  }

  toggleChecklistItem(item: WeddingChecklistItem, checked: boolean): void {
    if (checked) {
      this.checkedChecklistItems.add(item.text);
      return;
    }

    this.checkedChecklistItems.delete(item.text);
  }

  isChecklistItemChecked(item: WeddingChecklistItem): boolean {
    return this.checkedChecklistItems.has(item.text);
  }

  get isAvailabilityConfirmed(): boolean {
    return this.availabilityResult?.isAvailable === true;
  }

  get step2ValidationMessage(): string {
    if (this.step2Form.invalid) {
      return 'Popunite obred, datum i termin';
    }

    if (!this.requiredChecklistComplete) {
      return 'Označite sve obavezne stavke na checklisti';
    }

    if (!this.availabilityResult) {
      return 'Provjerite dostupnost termina prije nastavka';
    }

    if (!this.isAvailabilityConfirmed) {
      return 'Izabrani termin nije slobodan. Odaberite predloženi termin i provjerite ponovo';
    }

    return '';
  }

  private resetAvailabilityCheck(): void {
    this.availabilityResult = null;
  }

  checkAvailability(): void {
    const { ceremonyTypeId, requestedDate, requestedTime } = this.step2Form.value;
    const { religiousObjectId } = this.step1Form.value;
    if (!ceremonyTypeId || !requestedDate || !requestedTime || !religiousObjectId) {
      return;
    }

    this.checkingAvailability = true;
    this.resetAvailabilityCheck();
    const date = new Date(requestedDate);
    date.setHours(12);

    this.appointmentService.checkAvailability({
      religiousObjectId,
      date: date.toISOString(),
      time: requestedTime,
      ceremonyTypeId
    }).subscribe({
      next: (result) => {
        this.availabilityResult = result;
        this.checkingAvailability = false;
      },
      error: () => {
        this.checkingAvailability = false;
      }
    });
  }

  submit(): void {
    if (this.step1Form.invalid || this.step2Form.invalid) {
      return;
    }

    if (!this.requiredChecklistComplete) {
      this.snackBar.open('Označite sve obavezne stavke na checklisti za vjenčanje.', 'OK', {
        duration: 4000,
        panelClass: 'error-snack'
      });
      return;
    }

    if (!this.isAvailabilityConfirmed) {
      this.snackBar.open('Provjerite dostupnost termina prije slanja zahtjeva.', 'OK', {
        duration: 4000,
        panelClass: 'error-snack'
      });
      return;
    }

    this.submitting = true;
    const date = new Date(this.step2Form.value.requestedDate);
    date.setHours(12);

    this.appointmentService.create({
      religiousObjectId: this.step1Form.value.religiousObjectId,
      ceremonyTypeId: this.step2Form.value.ceremonyTypeId,
      requestedDate: date.toISOString(),
      requestedTime: this.step2Form.value.requestedTime,
      notes: (this.step3Form.value.notes ?? '').trim()
    }).subscribe({
      next: () => {
        this.submitted = true;
        this.submitting = false;
        this.snackBar.open('Zahtjev je uspješno poslan!', 'OK', { duration: 4000, panelClass: 'success-snack' });
      },
      error: (err) => {
        this.submitting = false;
        const msg = err.status === 401
          ? 'Sesija je istekla. Prijavite se ponovo.'
          : (err.error?.message || 'Greška pri zakazivanju.');
        this.snackBar.open(msg, 'OK', { duration: 4000, panelClass: 'error-snack' });
      }
    });
  }

  getSelectedObject(): ReligiousObject | undefined {
    return this.objects.find(o => o.id === this.step1Form.value.religiousObjectId);
  }

  getSelectedCeremony(): CeremonyType | undefined {
    return this.ceremonyTypes.find(c => c.id === this.step2Form.value.ceremonyTypeId);
  }

  getSelectedReligion(): Religion | undefined {
    return this.religions.find(r => r.id === this.step1Form.value.religionId);
  }

  resetForm(): void {
    this.step1Form.reset();
    this.step2Form.reset();
    this.step3Form.reset();
    this.submitted = false;
    this.resetAvailabilityCheck();
    this.objects = [];
    this.ceremonyTypes = [];
    this.objectsLoadError = false;
    this.weddingChecklist = [];
    this.checkedChecklistItems.clear();
    this.timeSlots = [...DEFAULT_TIME_SLOTS];
  }

  formatDate(date: any): string {
    if (!date) {
      return '';
    }

    return new Date(date).toLocaleDateString('bs-BA', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  selectSuggestedTime(time: string): void {
    this.step2Form.patchValue({ requestedTime: time });
    this.resetAvailabilityCheck();
  }

  get step1ValidationMessage(): string {
    if (!this.step1Form.get('religionId')?.value) {
      return 'Izaberite vjeru';
    }

    if (this.loadingObjects) {
      return 'Učitavanje objekata...';
    }

    if (this.objectsLoadError) {
      return 'Greška pri učitavanju objekata';
    }

    if (this.objects.length === 0 && !this.loadingObjects) {
      return 'Nema dostupnih objekata za ovu vjeru';
    }

    if (!this.step1Form.get('religiousObjectId')?.value) {
      return 'Izaberite vjerski objekat';
    }

    return '';
  }
}
