import { Routes } from '@angular/router';
import { authGuard, adminGuard, clergyGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent)
      },
      {
        path: 'register',
        canActivate: [guestGuard],
        loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent)
      }
    ]
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/profile/profile.component').then(m => m.ProfileComponent)
  },
  {
    path: 'booking',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/booking/booking.component').then(m => m.BookingComponent)
  },
  {
    path: 'booking/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/booking/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent)
  },
  {
    path: 'objects',
    loadComponent: () => import('./pages/objects/objects.component').then(m => m.ObjectsComponent)
  },
  {
    path: 'objects/:id',
    loadComponent: () => import('./pages/objects/object-detail/object-detail.component').then(m => m.ObjectDetailComponent)
  },
  {
    path: 'clergy',
    canActivate: [clergyGuard],
    loadComponent: () => import('./pages/clergy-dashboard/clergy-dashboard.component').then(m => m.ClergyDashboardComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./pages/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
