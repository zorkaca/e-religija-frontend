export interface Religion {
  id: number;
  name: string;
  code: string;
  description: string;
  colorPrimary: string;
  colorSecondary: string;
  colorAccent: string;
  iconSymbol: string;
  backgroundGradient: string;
}

export enum UserRole {
  User = 0,
  Clergy = 1,
  Admin = 2
}

export enum AppointmentStatus {
  Pending = 0,
  Approved = 1,
  Rejected = 2
}

export enum ReligiousObjectType {
  OrthodoxChurch = 0,
  CatholicChurch = 1,
  Monastery = 2,
  Mosque = 3,
  Mesdzhid = 4,
  Parish = 5
}

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  religionId?: number;
  religionName?: string;
  religionCode?: string;
  religiousObjectId?: number;
  religiousObjectName?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ReligiousObject {
  id: number;
  name: string;
  address: string;
  city: string;
  objectType: ReligiousObjectType;
  objectTypeLabel: string;
  workingHours: string;
  description: string;
  phoneNumber: string;
  email: string;
  latitude?: number;
  longitude?: number;
  religionId: number;
  religionName: string;
  clergypersonId?: number;
  clergypersonName?: string;
}

export interface CeremonyType {
  id: number;
  name: string;
  description: string;
  durationMinutes: number;
  iconName: string;
  religionId: number;
  religionName: string;
}

export interface Appointment {
  id: number;
  requestedDate: string;
  requestedTime: string;
  status: AppointmentStatus;
  statusLabel: string;
  notes: string;
  clergypersonNote: string;
  alternativeDate?: string;
  alternativeTime?: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userFullName: string;
  userEmail: string;
  userPhone: string;
  religiousObjectId: number;
  religiousObjectName: string;
  religiousObjectCity: string;
  ceremonyTypeId: number;
  ceremonyTypeName: string;
  ceremonyIcon: string;
}

export interface AvailabilityResult {
  isAvailable: boolean;
  message: string;
  suggestedTimes: string[];
}

export interface AdminStats {
  totalUsers: number;
  totalClergy: number;
  totalObjects: number;
  totalAppointments: number;
  pendingAppointments: number;
  approvedAppointments: number;
  rejectedAppointments: number;
  appointmentsByReligion: { religion: string; count: number }[];
}

export interface AdminUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: UserRole;
  roleLabel: string;
  religionId?: number;
  religionName?: string;
  religiousObjectId?: number;
  religiousObjectName?: string;
  createdAt: string;
  isActive: boolean;
}
