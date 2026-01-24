export type Role = 'student' | 'warden';
export type LeaveType = 'Outing' | 'Leave';
export type LeaveStatus = 'Approved' | 'Pending' | 'Rejected';

export interface User {
  id: string;
  register_number: string | null;
  full_name: string;
  role: Role;
  hostel_block: string | null;
  room_number: string | null;
  course: string | null;
  student_mobile: string | null;
  parent_mobile: string | null;
  blood_group: string | null;
  address: string | null;
  profile_pic_url?: string | null;
  created_at: string;
}

export interface LeaveRequest {
  id: number;
  student_id: string;
  type: LeaveType;
  reason: string;
  out_date: string; // ISO timestamp
  in_date: string; // ISO timestamp
  status: LeaveStatus;
  document_url: string | null;
  actual_out_time: string | null;
  actual_in_time: string | null;
  created_at: string;
}
