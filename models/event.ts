import { IDocument } from './user';

export interface IAttendee {
  _id: string;
  user: string;
  status: 'attending' | 'maybe' | 'not_attending';
  registeredAt: Date;
  checkedIn: boolean;
  checkedInAt?: Date;
  name: string;
  email: string;
  avatar: string;
}

export interface ILocation {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  coordinates?: {
    latitude?: number;
    longitude?: number;
  };
}

export interface IOnlineDetails {
  platform?: string;
  meetingLink?: string;
  meetingId?: string;
  password?: string;
}

export interface IAgenda {
  time?: string;
  title?: string;
  description?: string;
  speaker?: string;
}

export interface IResource {
  title?: string;
  description?: string;
  url?: string;
  type?: 'document' | 'video' | 'link' | 'other';
}

export interface IImage {
  filename: string;
  originalName: string;
  url: string;
  isPrimary?: boolean;
}

export interface IRecurringPattern {
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  endDate?: Date;
  daysOfWeek?: number[];
  dayOfMonth?: number;
}

export interface IFeedback {
  user: string;
  rating: number;
  comment?: string;
  submittedAt: Date;
}

export interface IEvent extends IDocument {
  title: string;
  description: string;
  organizer: string;
  category: 'workshop' | 'seminar' | 'meeting' | 'training' | 'conference' | 'social' | 'team-building' | 'presentation' | 'webinar' | 'other';
  type: 'online' | 'offline' | 'hybrid';
  location?: ILocation;
  onlineDetails?: IOnlineDetails;
  startDate: Date;
  endDate: Date;
  timezone?: string;
  capacity?: number;
  attendees: IAttendee[];
  waitlist: string[];
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  visibility: 'public' | 'private' | 'invite-only';
  tags?: string[];
  requirements?: string[];
  agenda?: IAgenda[];
  resources?: IResource[];
  images?: IImage[];
  registrationDeadline?: Date;
  allowWaitlist: boolean;
  requiresApproval: boolean;
  isRecurring: boolean;
  recurringPattern?: IRecurringPattern;
  feedback?: IFeedback[];
}
