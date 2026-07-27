import { Company, Document, Event, EventAttachment, EventGallery, EventRSVP, Member, MemberRole, MemberTier } from "@shared/api";
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

type SacbmEventGalleryRow = {
  id: string;
  event_id: string;
  image_url: string;
  caption: string | null;
  uploaded_by: string | null;
  uploaded_date: string;
};

type SacbmEventAttachmentRow = {
  id: string;
  event_id: string;
  name: string;
  file_url: string;
  file_path: string | null;
  file_type: string | null;
  uploaded_by: string | null;
  uploaded_date: string;
};

type SacbmCompanyRow = {
  id: string;
  name: string;
  address: string | null;
  sector: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  description: string | null;
  logo_url: string | null;
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

const toEvent = (row: SacbmEventRow, attachments: EventAttachment[] = []): Event => ({
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
  attachments: attachments.length > 0 ? attachments : undefined,
});

async function getEventAssetUrl(path: string) {
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) return path;
  const { data, error } = await supabase.storage.from("sacbm-assets").createSignedUrl(path, 3600);
  if (error || !data?.signedUrl) throw new Error("We could not prepare an event asset.");
  return data.signedUrl;
}

const toGallery = async (row: SacbmEventGalleryRow): Promise<EventGallery> => ({
  id: row.id,
  eventId: row.event_id,
  imageUrl: await getEventAssetUrl(row.image_url),
  caption: row.caption || undefined,
  uploadedBy: row.uploaded_by || "",
  uploadedDate: row.uploaded_date,
});

const toAttachment = async (row: SacbmEventAttachmentRow): Promise<EventAttachment> => ({
  name: row.name,
  fileUrl: await getEventAssetUrl(row.file_path || row.file_url),
  fileType: row.file_type || "application/octet-stream",
});

const toCompany = (row: SacbmCompanyRow, representatives: Member[] = []): Company => ({
  id: row.id,
  name: row.name,
  address: row.address || undefined,
  sector: row.sector || undefined,
  phone: row.phone || undefined,
  email: row.email || undefined,
  website: row.website || undefined,
  description: row.description || undefined,
  logoUrl: row.logo_url || undefined,
  representatives,
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

export async function getSacbmEvents() {
  const [eventsResult, galleriesResult, attachmentsResult] = await Promise.all([
    supabase.from("sacbm_events").select("*").order("date", { ascending: true }).order("time", { ascending: true }),
    supabase.from("sacbm_event_galleries").select("*"),
    supabase.from("sacbm_event_attachments").select("*"),
  ]);

  const firstError = eventsResult.error || galleriesResult.error || attachmentsResult.error;
  if (firstError) throw new Error("We could not load chamber events.");

  const attachmentRows = (attachmentsResult.data || []) as SacbmEventAttachmentRow[];
  const attachmentsByEvent = new Map<string, EventAttachment[]>();

  await Promise.all(attachmentRows.map(async (row) => {
    const attachment = await toAttachment(row);
    const current = attachmentsByEvent.get(row.event_id) || [];
    attachmentsByEvent.set(row.event_id, [...current, attachment]);
  }));

  return Promise.all((eventsResult.data || []).map(async (row) => {
    const event = row as SacbmEventRow;
    const imageUrl = event.image_url ? await getEventAssetUrl(event.image_url) : null;
    return toEvent({ ...event, image_url: imageUrl }, attachmentsByEvent.get(event.id) || []);
  }));
}

export async function getSacbmEventGalleries(eventId: string) {
  const { data, error } = await supabase
    .from("sacbm_event_galleries")
    .select("*")
    .eq("event_id", eventId)
    .order("uploaded_date", { ascending: true });

  if (error) throw new Error("We could not load the event gallery.");
  return Promise.all(((data || []) as SacbmEventGalleryRow[]).map(toGallery));
}

export async function createSacbmEvent(input: {
  title: string;
  description: string;
  date: string;
  time: string;
  endTime: string;
  location: string;
  capacity?: number;
  rsvpDeadline: string;
  zoomLink: string;
  registrationInfo: string;
  directionsInfo: string;
  createdBy: string;
  imageFile?: File;
  attachmentFiles: File[];
}) {
  const { data: eventRow, error } = await supabase
    .from("sacbm_events")
    .insert({
      title: input.title.trim(),
      description: input.description.trim(),
      date: input.date,
      time: input.time,
      end_time: input.endTime || null,
      location: input.location.trim(),
      capacity: input.capacity || null,
      created_by: input.createdBy,
      status: "upcoming",
      rsvp_deadline: input.rsvpDeadline,
      zoom_link: input.zoomLink.trim() || null,
      registration_info: input.registrationInfo.trim() || null,
      directions_info: input.directionsInfo.trim() || null,
    })
    .select("*")
    .single();

  if (error || !eventRow) throw new Error("We could not create the event.");
  const event = eventRow as SacbmEventRow;
  let imageUrl: string | null = null;

  if (input.imageFile) {
    const imagePath = `events/${event.id}/cover-${crypto.randomUUID()}-${input.imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: imageError } = await supabase.storage.from("sacbm-assets").upload(imagePath, input.imageFile, {
      contentType: input.imageFile.type || "image/jpeg",
      upsert: false,
    });
    if (imageError) throw new Error("The event was created but the cover image could not be uploaded.");
    imageUrl = imagePath;
    const { error: updateError } = await supabase.from("sacbm_events").update({ image_url: imagePath }).eq("id", event.id);
    if (updateError) throw new Error("The event was created but the cover image could not be saved.");
  }

  const attachmentRows: SacbmEventAttachmentRow[] = [];
  for (const file of input.attachmentFiles) {
    const filePath = `events/${event.id}/attachments/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: fileError } = await supabase.storage.from("sacbm-assets").upload(filePath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
    if (fileError) throw new Error("The event was created but an attachment could not be uploaded.");
    const { data: attachment, error: attachmentError } = await supabase
      .from("sacbm_event_attachments")
      .insert({ event_id: event.id, name: file.name, file_url: filePath, file_path: filePath, file_type: file.type || null, uploaded_by: input.createdBy })
      .select("*")
      .single();
    if (attachmentError || !attachment) throw new Error("The event was created but an attachment could not be saved.");
    attachmentRows.push(attachment as SacbmEventAttachmentRow);
  }

  const signedImageUrl = imageUrl ? await getEventAssetUrl(imageUrl) : null;
  return toEvent({ ...event, image_url: signedImageUrl }, await Promise.all(attachmentRows.map(toAttachment)));
}

export async function uploadSacbmEventGallery(input: { eventId: string; memberId: string; files: File[] }) {
  const uploaded = [] as EventGallery[];
  for (const file of input.files) {
    const filePath = `events/${input.eventId}/gallery/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error: uploadError } = await supabase.storage.from("sacbm-assets").upload(filePath, file, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });
    if (uploadError) throw new Error("We could not upload the event photo.");

    const { data, error } = await supabase
      .from("sacbm_event_galleries")
      .insert({ event_id: input.eventId, image_url: filePath, caption: file.name, uploaded_by: input.memberId })
      .select("*")
      .single();
    if (error || !data) throw new Error("We could not save the event photo.");
    uploaded.push(await toGallery(data as SacbmEventGalleryRow));
  }
  return uploaded;
}

export async function getSacbmEventRsvps(memberId: string) {
  const { data, error } = await supabase
    .from("sacbm_event_rsvps")
    .select("event_id, status")
    .eq("member_id", memberId);

  if (error) throw new Error("We could not load your event responses.");
  return Object.fromEntries((data || []).map((rsvp) => [rsvp.event_id, rsvp.status as EventRSVP["status"]]));
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

export async function getSacbmCompanies() {
  const [companiesResult, membersResult] = await Promise.all([
    supabase.from("sacbm_companies").select("*").order("name", { ascending: true }),
    supabase.from("sacbm_members").select("*").eq("is_active", true).order("name", { ascending: true }),
  ]);

  if (companiesResult.error || membersResult.error) throw new Error("We could not load the company directory.");
  const members = (membersResult.data || []).map((row) => toMember(row as SacbmMemberRow));
  return (companiesResult.data || []).map((row) => {
    const company = row as SacbmCompanyRow;
    const representatives = members.filter((member) => member.company.trim().toLowerCase() === company.name.trim().toLowerCase());
    return toCompany(company, representatives);
  });
}

export async function createSacbmCompany(input: {
  name: string;
  address: string;
  sector: string;
  phone: string;
  email: string;
  website: string;
  description: string;
  createdBy: string;
}) {
  const { data, error } = await supabase
    .from("sacbm_companies")
    .insert({
      name: input.name.trim(),
      address: input.address.trim() || null,
      sector: input.sector.trim() || null,
      phone: input.phone.trim() || null,
      email: input.email.trim() || null,
      website: input.website.trim() || null,
      description: input.description.trim() || null,
      created_by: input.createdBy,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error("We could not create the company.");
  return toCompany(data as SacbmCompanyRow);
}

export async function updateSacbmCompany(input: {
  id: string;
  name: string;
  address: string;
  sector: string;
  phone: string;
  email: string;
  website: string;
  description: string;
}) {
  const { data, error } = await supabase
    .from("sacbm_companies")
    .update({
      name: input.name.trim(),
      address: input.address.trim() || null,
      sector: input.sector.trim() || null,
      phone: input.phone.trim() || null,
      email: input.email.trim() || null,
      website: input.website.trim() || null,
      description: input.description.trim() || null,
    })
    .eq("id", input.id)
    .select("*")
    .single();

  if (error || !data) throw new Error("We could not update the company.");
  return toCompany(data as SacbmCompanyRow);
}

export async function getSacbmMembers() {
  const { data, error } = await supabase
    .from("sacbm_members")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw new Error("We could not load the member directory.");
  return (data || []).map((row) => toMember(row as SacbmMemberRow));
}

export async function updateSacbmMember(input: {
  id: string;
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
}) {
  const { data, error } = await supabase
    .from("sacbm_members")
    .update({
      name: `${input.firstName.trim()} ${input.surname.trim()}`,
      first_name: input.firstName.trim(),
      surname: input.surname.trim(),
      company: input.company.trim(),
      job_title: input.jobTitle.trim() || null,
      chamber_title: input.chamberTitle.trim() || null,
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim() || null,
      address: input.address.trim() || null,
      tier: input.tier,
      role: input.role,
      is_exco: input.isExco,
      is_board: input.isBoard,
    })
    .eq("id", input.id)
    .select("*")
    .single();

  if (error || !data) throw new Error("We could not update the member.");
  return toMember(data as SacbmMemberRow);
}

export async function setSacbmMemberActive(memberId: string, isActive: boolean) {
  const { data, error } = await supabase
    .from("sacbm_members")
    .update({ is_active: isActive })
    .eq("id", memberId)
    .select("*")
    .single();

  if (error || !data) throw new Error(isActive ? "We could not reactivate the member." : "We could not deactivate the member.");
  return toMember(data as SacbmMemberRow);
}

export async function deleteSacbmMember(memberId: string) {
  const { error } = await supabase
    .from("sacbm_members")
    .delete()
    .eq("id", memberId);

  if (error) throw new Error("We could not permanently delete the member.");
}

export async function signOutSacbmMember() {
  await supabase.auth.signOut();
}
