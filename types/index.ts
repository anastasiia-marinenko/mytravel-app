// ============================================
// types/index.ts - TypeScript типи
// ============================================

export interface User {
  id: number;
  name: string;
  email: string;
  person_id?: number;
  role_id: number;
  role?: UserRole;
}

export interface UserRole {
  role_id: number;
  role_name: string;
  description?: string;
}

export interface Tour {
  vacation_type_id: number;
  name: string;
  description?: string;
  is_closed: boolean;
}

export interface Booking {
  package_id: number;
  client_id: number;
  employee_id: number;
  vacation_type_id: number;
  booking_status_id: number;
  payment_status_id: number;
  booking_date: string;
  start_date: string;
  end_date: string;
  number_of_people?: number;
  service_fee: number;
  notes?: string;
  vacation_type?: VacationType;
  booking_status?: StatusType;
  payment_status?: StatusType;
  rooms?: HotelRoom[];
  transports?: Transport[];
  services?: AdditionalService[];
  insurances?: TravelInsurance[];
}

export interface VacationType {
  vacation_type_id: number;
  name: string;
  description?: string;
}

export interface StatusType {
  status_id: number;
  category: string;
  name: string;
}

export interface HotelRoom {
  room_id: number;
  hotel_id: number;
  room_number: string;
  price_per_night: number;
  hotel?: Hotel;
}

export interface Hotel {
  hotel_id: number;
  name: string;
  stars?: number;
}

export interface Transport {
  transport_id: number;
  transport_type: string;
  company: string;
  price: number;
}

export interface AdditionalService {
  service_id: number;
  name: string;
  price: number;
}

export interface TravelInsurance {
  insurance_id: number;
  provider: string;
  coverage: number;
}

export interface DirectorStats {
  total_bookings: number;
  active_bookings: number;
  total_revenue: number;
  total_employees: number;
  monthly_revenue: number;
  monthly_bookings: number;
}

export interface TopManager {
  employee_id: number;
  first_name: string;
  last_name: string;
  bookings_count: number;
  revenue: number;
}