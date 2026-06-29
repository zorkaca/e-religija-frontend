import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReligionService } from '../../services/religion.service';
import { ThemeService } from '../../services/theme.service';
import { Religion, ReligiousObject } from '../../models/models';

@Component({
  selector: 'app-objects',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink, MatIconModule,
    MatProgressSpinnerModule, MatSelectModule, MatFormFieldModule, MatInputModule
  ],
  templateUrl: './objects.component.html',
  styleUrls: ['./objects.component.scss']
})
export class ObjectsComponent implements OnInit {
  religions: Religion[] = [];
  objects: ReligiousObject[] = [];
  loading = true;
  selectedReligionId: number | null = null;
  searchCity = '';

  constructor(
    private religionService: ReligionService,
    public themeService: ThemeService
  ) {}

  ngOnInit(): void {
    this.religionService.getReligions().subscribe(r => {
      this.religions = r;
      const selected = this.themeService.selectedReligion();
      if (selected) this.selectedReligionId = selected.id;
      this.loadObjects();
    });
  }

  loadObjects(): void {
    this.loading = true;
    this.religionService.getReligiousObjects(
      this.selectedReligionId ?? undefined,
      this.searchCity || undefined
    ).subscribe({
      next: (o) => { this.objects = o; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  getObjectIcon(objectTypeLabel: string): string {
    if (objectTypeLabel.includes('Džamija') || objectTypeLabel.includes('Mesdžid')) return 'mosque';
    if (objectTypeLabel.includes('Manastir')) return 'fort';
    return 'church';
  }
}
