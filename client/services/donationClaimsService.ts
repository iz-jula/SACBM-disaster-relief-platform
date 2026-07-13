import { supabase } from "./supabaseService";

export type DonationClaimStatus = "pending" | "confirmed" | "fulfilled" | "declined";

export interface DonationClaim {
  id: string;
  eventId: string;
  donorName: string;
  email: string;
  phone?: string;
  membershipStatus: "member" | "non-member";
  company?: string;
  requirement: string;
  quantity: number;
  unit: string;
  notes?: string;
  status: DonationClaimStatus;
  createdAt: string;
}

const mapClaim = (row: any): DonationClaim => ({
  id: row.id,
  eventId: row.event_id,
  donorName: row.donor_name,
  email: row.email,
  phone: row.phone,
  membershipStatus: row.membership_status,
  company: row.company,
  requirement: row.requirement,
  quantity: row.quantity,
  unit: row.unit,
  notes: row.notes,
  status: row.status,
  createdAt: row.created_at,
});

export async function createDonationClaim(claim: Omit<DonationClaim, "id" | "status" | "createdAt">): Promise<DonationClaim | null> {
  const { data, error } = await supabase
    .from("donation_claims")
    .insert({
      event_id: claim.eventId,
      donor_name: claim.donorName,
      email: claim.email,
      phone: claim.phone || null,
      membership_status: claim.membershipStatus,
      company: claim.company || null,
      requirement: claim.requirement,
      quantity: claim.quantity,
      unit: claim.unit,
      notes: claim.notes || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating donation claim:", error);
    return null;
  }

  return data ? mapClaim(data) : null;
}

export async function getDonationClaims(eventId?: string): Promise<DonationClaim[]> {
  let query = supabase
    .from("donation_claims")
    .select("*")
    .order("created_at", { ascending: false });

  if (eventId) query = query.eq("event_id", eventId);

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching donation claims:", error);
    return [];
  }

  return (data || []).map(mapClaim);
}

export async function updateDonationClaimStatus(id: string, status: DonationClaimStatus): Promise<DonationClaim | null> {
  const { data, error } = await supabase
    .from("donation_claims")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating donation claim:", error);
    return null;
  }

  return data ? mapClaim(data) : null;
}
