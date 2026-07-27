/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// ============ SACBM PORTAL TYPES ============

export enum MemberTier {
  BRONZE = "bronze",
  GOLD = "gold",
  PLATINUM = "platinum",
}

export enum MemberRole {
  MEMBER = "member",
  BOARD = "board",
  EXCO = "exco",
  ADMIN = "admin",
}

export interface Member {
  id: string;
  name: string;
  email: string;
  company: string;
  companyId?: string;
  tier: MemberTier;
  role: MemberRole;
  firstName?: string;
  surname?: string;
  jobTitle?: string;
  chamberTitle?: string;
  address?: string;
  sacbmRole?: "member" | "board-member" | "exco-member" | "admin";
  isExco?: boolean;
  isBoard?: boolean;
  phone?: string;
  profileImage?: string;
  nickname?: string;
  funFact?: string;
  joinDate: string;
  isActive: boolean;
}

export interface Company {
  id: string;
  name: string;
  address?: string;
  sector?: string;
  phone?: string;
  email?: string;
  website?: string;
  description?: string;
  logoUrl?: string;
  representatives: Member[];
}

export interface Document {
  id: string;
  title: string;
  description?: string;
  category: "policy" | "meeting-minutes" | "governance" | "other";
  uploadedBy: string;
  uploadedDate: string;
  fileUrl: string;
  fileSize: number;
  isApproved: boolean;
  approvedBy?: string;
  approvedDate?: string;
  visibility: "admin" | "board" | "exco" | "all";
}

export interface EventAttachment {
  name: string;
  fileUrl: string;
  fileType: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  endTime?: string;
  location: string;
  capacity?: number;
  imageUrl?: string;
  createdBy: string;
  createdDate: string;
  status: "upcoming" | "completed" | "cancelled";
  rsvpDeadline: string;
  zoomLink?: string;
  registrationInfo?: string;
  directionsInfo?: string;
  attachments?: EventAttachment[];
}

export interface EventRSVP {
  id: string;
  eventId: string;
  memberId: string;
  status: "accepted" | "declined" | "maybe";
  rsvpDate: string;
  notes?: string;
}

export interface EventGallery {
  id: string;
  eventId: string;
  imageUrl: string;
  caption?: string;
  uploadedBy: string;
  uploadedDate: string;
}

export interface PortalStats {
  totalMembers: number;
  activeBronzeMembers: number;
  activeGoldMembers: number;
  activePlatinumMembers: number;
  totalDocuments: number;
  upcomingEvents: number;
  recentEvents: number;
}
