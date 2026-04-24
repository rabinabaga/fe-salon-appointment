export type UserRole = 'customer' | 'staff';
export interface User { id: string; name: string; email: string; role: UserRole; }
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';
export interface SalonService { id: string; name: string; duration: number; price: number; description?: string; isActive: boolean; }
export interface Appointment { id: string; userId: string; serviceId: string; service: SalonService; user: User; date: string; startTime: string; endTime: string; duration: number; status: AppointmentStatus; confirmedAt?: string; notes?: string; createdAt: string; }
export interface NotificationTemplate { id: string; name: string; subject: string; body: string; createdAt: string; }
export type BulkJobStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export interface BulkJob { id: string; uploadedBy: string; fileUrl: string; status: BulkJobStatus; totalRows: number; processedCount: number; successCount: number; failCount: number; createdAt: string; logs?: NotificationLog[]; }
export type NotificationLogStatus = 'SUCCESS' | 'FAILED';
export interface NotificationLog { id: string; bulkJobId: string; customerEmail: string; customerName: string; service: string; date: string; startTime: string; status: NotificationLogStatus; errorMessage?: string; processedAt?: string; }
export interface Settings { id: string; activeTemplateId?: string; activeTemplate?: NotificationTemplate; }
export interface ApiResponse<T> { success: boolean; data: T; timestamp: string; }