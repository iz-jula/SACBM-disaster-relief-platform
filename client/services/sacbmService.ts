import { Document, Event, EventRSVP, Member, MemberRole, MemberTier } from "@shared/api";
import { supabase } from "@/services/supabaseService";

type SacbmDocumentRow = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  uploaded_by: string | null;
  uploaded_date: string;
  file_url: string;
  file_path: string | null;
  file_size: number | null;
  file_type: string | null;
  is_approved: boolean;
  approved_by: string | null;
  approved_date: string | null;
  visibility: "admin" | "board" | "exco" | "all";
};

type SacbmEventRow = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  end_time: string | null;
  location: string;
  capacity: number | null;
  image_url: string | null;
  created_by: string | null;
  created_date: string;
  status: "upcoming" | "completed" | "cancelled";
  rsvp_deadline: string;
  zoom_link: string | null;
  registration_info: string | null;
  directions_info: string | null;
};

type SacbmMemberRow = {
  id: string;
  user_id: string | null;
  name: string;
  first_name: string;
  surname: string;
  email: string;
  phone: string | null;
  address: string | null;
  company: string;
  job_title: string | null;
  chamber_title: string | null;
  tier: MemberTier;
  role: MemberRole;
  is_exco: boolean;
  is_board: boolean;
  profile_image_url: string | null;
  nickname: string | null;
  fun_fact: string | null;
  join_date: string;
  is_active: boolean;
};

const toDocument = (row: SacbmDocumentRow, fileUrl: string): Document => ({
  id: row.id,
  title: row.title,
  description: row.description || undefined,
  category: row.category as Document["category"],
  uploadedBy: row.uploaded_by || "",
  uploadedDate: row.uploaded_date,
  fileUrl,
  fileSize: row.file_size ? Number((row.file_size / (1024 * 1024)).toFixed(1)) : 0,
  isApproved: row.is_approved,
  approvedBy: row.approved_by || undefined,
  approvedDate: row.approved_date || undefined,
  visibility: row.visibility,
});

const toEvent = (row: SacbmEventRow): Event => ({
  id: row.id,
  title: row.title,
  description: row.description,
  date: row.date,
  time: row.time.slice(0, 5),
  endTime: row.end_time?.slice(0, 5),
  location: row.location,
  capacity: row.capacity || undefined,
  imageUrl: row.image_url || undefined,
  createdBy: row.created_by || "",
  createdDate: row.created_date,
  status: row.status,
  rsvpDeadline: row.rsvp_deadline,
  zoomLink: row.zoom_link || undefined,
  registrationInfo: row.registration_info || undefined,
  directionsInfo: row.directions_info || undefined,
});

const toMember = (row: SacbmMemberRow): Member => ({
  id: row.id,
  name: row.name,
  firstName: row.first_name,
  surname: row.surname,
  email: row.email,
  company: row.company,
  tier: row.tier,
  role: row.role,
  jobTitle: row.job_title || undefined,
  chamberTitle: row.chamber_title || undefined,
  address: row.address || undefined,
  sacbmRole: row.role === MemberRole.BOARD ? "board-member" : row.role === MemberRole.EXCO ? "exco-member" : row.role,
  isExco: row.is_exco,
  isBoard: row.is_board,
  phone: row.phone || undefined,
  profileImage: row.profile_image_url || undefined,
  nickname: row.nickname || undefined,
  funFact: row.fun_fact || undefined,
  joinDate: row.join_date,
  isActive: row.is_active,
});

async function getMemberForUserId(userId: string): Promise<Member> {
  const { data: memberRow, error: memberError } = await supabase
    .from("sacbm_members")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (memberError) throw new Error("We could not load your chamber profile. Please try again.");
  if (!memberRow) throw new Error("Your account is not linked to an active SACBM member profile.");

  return toMember(memberRow as SacbmMemberRow);
}

export async function getCurrentSacbmMember(): Promise<Member | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return getMemberForUserId(data.user.id);
}

export async function signInSacbmMember(email: string, password: string): Promise<Member> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Invalid email or password.");
  }

  try {
    return await getMemberForUserId(authData.user.id);
  } catch (error) {
    await supabase.auth.signOut();
    throw error;
  }
}

export async function getSacbmDocumentCategories() {
  const { data, error } = await supabase
    .from("sacbm_document_categories")
    .select("name")
    .order("name", { ascending: true });

  if (error) throw new Error("We could not load document categories.");
  return (data || []).map((category) => category.name);
}

export async function createSacbmDocumentCategory(memberId: string, name: string) {
  const { data, error } = await supabase
    .from("sacbm_document_categories")
    .insert({ name: name.trim().toLowerCase(), created_by: memberId })
    .select("name")
    .single();

  if (error || !data) throw new Error("We could not create the document category.");
  return data.name;
}

export async function deleteSacbmDocumentCategory(name: string) {
  const { count, error: documentsError } = await supabase
    .from("sacbm_documents")
    .select("id", { count: "exact", head: true })
    .eq("category", name);

  if (documentsError) throw new Error("We could not check whether this category is in use.");
  if ((count || 0) > 0) throw new Error("This category cannot be removed while documents use it.");

  const { error } = await supabase
    .from("sacbm_document_categories")
    .delete()
    .eq("name", name);

  if (error) throw new Error("We could not remove the document category.");
}

export async function updateSacbmDocument(input: {
  id: string;
  title: string;
  description: string;
  category: string;
  visibility: "all" | "board" | "exco";
}) {
  const { data, error } = await supabase
    .from("sacbm_documents")
    .update({
      title: input.title.trim(),
      description: input.description.trim() || null,
      category: input.category,
      visibility: input.visibility,
    })
    .eq("id", input.id)
    .select("*")
    .single();

  if (error || !data) throw new Error("We could not update the document.");

  const path = data.file_path || data.file_url;
  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from("sacbm-assets")
    .createSignedUrl(path, 3600);

  if (signedUrlError || !signedUrl?.signedUrl) throw new Error("Document updated but the download link could not be prepared.");
  return toDocument(data as SacbmDocumentRow, signedUrl.signedUrl);
}

export async function deleteSacbmDocument(documentId: string) {
  const { data: document, error: lookupError } = await supabase
    .from("sacbm_documents")
    .select("file_path, file_url")
    .eq("id", documentId)
    .single();

  if (lookupError || !document) throw new Error("We could not find this document.");

  const filePath = document.file_path || document.file_url;
  const { error: storageError } = await supabase.storage.from("sacbm-assets").remove([filePath]);
  if (storageError) throw new Error("We could not remove the document file.");

  const { error } = await supabase
    .from("sacbm_documents")
    .delete()
    .eq("id", documentId);

  if (error) throw new Error("We could not remove the document record.");
}

export async function getSacbmDocuments() {
  const { data, error } = await supabase
    .from("sacbm_documents")
    .select("*")
    .eq("is_approved", true)
    .order("uploaded_date", { ascending: false });

  if (error) throw new Error("We could not load chamber documents.");

  return Promise.all((data || []).map(async (row) => {
    const document = row as SacbmDocumentRow;
    const path = document.file_path || document.file_url;
    const { data: signedUrl, error: signedUrlError } = await supabase.storage
      .from("sacbm-assets")
      .createSignedUrl(path, 3600);

    if (signedUrlError || !signedUrl?.signedUrl) throw new Error("We could not prepare a document download.");
    return toDocument(document, signedUrl.signedUrl);
  }));
}

export async function uploadSacbmDocument(input: {
  memberId: string;
  title: string;
  description: string;
  category: string;
  visibility: "all" | "board" | "exco";
  file: File;
}) {
  const safeFileName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filePath = `documents/${input.memberId}/${crypto.randomUUID()}-${safeFileName}`;
  const { error: uploadError } = await supabase.storage.from("sacbm-assets").upload(filePath, input.file, {
    contentType: input.file.type || "application/octet-stream",
    upsert: false,
  });

  if (uploadError) throw new Error("We could not upload the document file.");

  const { data, error } = await supabase
    .from("sacbm_documents")
    .insert({
      title: input.title.trim(),
      description: input.description.trim() || null,
      category: input.category,
      uploaded_by: input.memberId,
      file_url: filePath,
      file_path: filePath,
      file_size: input.file.size,
      file_type: input.file.type || null,
      is_approved: true,
      approved_by: input.memberId,
      approved_date: new Date().toISOString(),
      visibility: input.visibility,
    })
    .select("*")
    .single();

  if (error || !data) {
    await supabase.storage.from("sacbm-assets").remove([filePath]);
    throw new Error("We could not save the document metadata.");
  }

  const { data: signedUrl, error: signedUrlError } = await supabase.storage
    .from("sacbm-assets")
    .createSignedUrl(filePath, 3600);

  if (signedUrlError || !signedUrl?.signedUrl) throw new Error("Document uploaded but the download link could not be prepared.");
  return toDocument(data as SacbmDocumentRow, signedUrl.signedUrl);
}

export type SacbmDashboardNotification = {
  id: string;
  title: string;
  body: string;
  type: "info" | "approval" | "rejection" | "event" | "finance";
  createdAt: string;
};

export async function getSacbmDashboardData(memberId: string) {
  const [eventsResult, membersResult, notificationsResult, rsvpsResult] = await Promise.all([
    supabase.from("sacbm_events").select("*").in("status", ["upcoming", "completed"]).order("date", { ascending: true }),
    supabase.from("sacbm_members").select("id", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("sacbm_notifications").select("id, title, body, type, created_at").eq("recipient_id", memberId).order("created_at", { ascending: false }).limit(5),
    supabase.from("sacbm_event_rsvps").select("event_id, status").eq("member_id", memberId),
  ]);

  const firstError = eventsResult.error || membersResult.error || notificationsResult.error || rsvpsResult.error;
  if (firstError) throw new Error("We could not load the chamber dashboard.");

  return {
    events: (eventsResult.data || []).map((row) => toEvent(row as SacbmEventRow)),
    activeMemberCount: membersResult.count || 0,
    notifications: (notificationsResult.data || []).map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.body,
      type: notification.type,
      createdAt: notification.created_at,
    })) as SacbmDashboardNotification[],
    rsvps: Object.fromEntries((rsvpsResult.data || []).map((rsvp) => [rsvp.event_id, rsvp.status as EventRSVP["status"]])),
  };
}

export async function saveSacbmRsvp(memberId: string, eventId: string, status: EventRSVP["status"]) {
  const { data: existing, error: lookupError } = await supabase
    .from("sacbm_event_rsvps")
    .select("id")
    .eq("member_id", memberId)
    .eq("event_id", eventId)
    .maybeSingle();

  if (lookupError) throw new Error("We could not update your RSVP.");

  const response = existing
    ? await supabase.from("sacbm_event_rsvps").update({ status, updated_at: new Date().toISOString() }).eq("id", existing.id)
    : await supabase.from("sacbm_event_rsvps").insert({ member_id: memberId, event_id: eventId, status });

  if (response.error) throw new Error("We could not update your RSVP.");
}

export async function requestSacbmPasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/sacbm-login`,
  });

  if (error) {
    throw new Error("We could not send the credentials reset email. Please try again.");
  }
}

export async function createSacbmMember(input: {
  firstName: string;
  surname: string;
  company: string;
  jobTitle: string;
  chamberTitle: string;
  email: string;
  phone: string;
  address: string;
  tier: MemberTier;
  role: MemberRole;
  isExco: boolean;
  isBoard: boolean;
}): Promise<Member> {
  const { data, error } = await supabase.functions.invoke("create-sacbm-member", {
    body: {
      ...input,
      redirectTo: `${window.location.origin}/sacbm-login`,
    },
  });

  if (error) {
    throw new Error(error.message || "Could not register the member.");
  }

  if (!data?.member) {
    throw new Error("Could not register the member.");
  }

  return toMember(data.member as SacbmMemberRow);
}

export async function signOutSacbmMember() {
  await supabase.auth.signOut();
}
