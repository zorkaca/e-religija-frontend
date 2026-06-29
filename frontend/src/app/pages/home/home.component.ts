import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Religion } from '../../models/models';
import { ReligionService } from '../../services/religion.service';
import { ThemeService } from '../../services/theme.service';
import { AuthService } from '../../services/auth.service';

const FALLBACK_RELIGIONS: Religion[] = [
  {
    id: 1, name: 'Pravoslavlje', code: 'pravoslavlje',
    description: 'Pravoslavna hrišćanska vjera',
    colorPrimary: '#1a3a5c', colorSecondary: '#c9a84c', colorAccent: '#8b0000',
    iconSymbol: '✝', backgroundGradient: 'linear-gradient(135deg, #1a3a5c 0%, #2d6a9f 100%)'
  },
  {
    id: 2, name: 'Katoličanstvo', code: 'katolicanstvo',
    description: 'Rimokatolička hrišćanska vjera',
    colorPrimary: '#003399', colorSecondary: '#ffcc00', colorAccent: '#ffd700',
    iconSymbol: '✝', backgroundGradient: 'linear-gradient(135deg, #003399 0%, #ffcc00 100%)'
  },
  {
    id: 3, name: 'Islam', code: 'islam',
    description: 'Islamska vjera',
    colorPrimary: '#006633', colorSecondary: '#c0a060', colorAccent: '#c0a060',
    iconSymbol: '☪', backgroundGradient: 'linear-gradient(135deg, #004d26 0%, #006633 100%)'
  }
];

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  religions: Religion[] = [];
  loading = true;
  selectedReligion: Religion | null = null;

  features = [
    { icon: 'event', title: 'Online zakazivanje', desc: 'Zakažite vjerske obrede iz udobnosti svog doma' },
    { icon: 'check_circle', title: 'Potvrda termina', desc: 'Svešteno lice pregleda i odobrava vaš zahtjev' },
    { icon: 'account_balance', title: 'Svi objekti', desc: 'Crkve, manastiri, džamije i mesdžidi na jednom mjestu' },
    { icon: 'notifications', title: 'Obavještenja', desc: 'Pratite status vašeg zahtjeva u realnom vremenu' }
  ];

  constructor(
    private religionService: ReligionService,
    private themeService: ThemeService,
    public auth: AuthService
  ) {}

  ngOnInit(): void {
    this.selectedReligion = this.themeService.selectedReligion();

    this.religionService.getReligions().subscribe({
      next: (religions) => {
        this.religions = religions.length ? religions : FALLBACK_RELIGIONS;
        this.loading = false;
        if (!this.selectedReligion && this.religions.length) {
          this.selectedReligion = this.themeService.selectedReligion();
        }
      },
      error: () => {
        this.religions = FALLBACK_RELIGIONS;
        this.loading = false;
      }
    });
  }

  selectReligion(religion: Religion): void {
    this.selectedReligion = religion;
    this.themeService.setTheme(religion);
  }

  get proceedLink(): string {
    return this.auth.isLoggedIn() ? '/dashboard' : '/auth/register';
  }
}
