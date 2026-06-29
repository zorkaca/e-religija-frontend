import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { ReligionService } from '../../../services/religion.service';
import { AuthService } from '../../../services/auth.service';
import { ReligiousObject } from '../../../models/models';
import { getMapEmbedUrl, getMapExternalUrl } from '../../../utils/scheduling.utils';

@Component({
  selector: 'app-object-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule, MatButtonModule],
  templateUrl: './object-detail.component.html',
  styleUrls: ['./object-detail.component.scss']
})
export class ObjectDetailComponent implements OnInit {
  object: ReligiousObject | null = null;
  loading = true;
  mapEmbedUrl: SafeResourceUrl | null = null;
  mapExternalUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private religionService: ReligionService,
    public auth: AuthService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.religionService.getReligiousObject(id).subscribe({
      next: (object) => {
        this.object = object;
        this.loading = false;

        if (object.latitude != null && object.longitude != null) {
          this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
            getMapEmbedUrl(object.latitude, object.longitude)
          );
          this.mapExternalUrl = getMapExternalUrl(object.latitude, object.longitude);
        }
      },
      error: () => {
        this.loading = false;
      }
    });
  }
}
