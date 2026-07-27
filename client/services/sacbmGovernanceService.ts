import { supabase } from "@/services/supabaseService";
import { MemberRole, MemberTier } from "@shared/api";

export type GovernanceFinancialRecord = {
  id: string;
  title: string;
  type: "receipt" | "invoice" | "contract";
  amount?: number;
  date: string;
  uploadedBy: string;
  category: string;
  fileUrl: string;
  status: "approved" | "pending" | "rejected";
};

export type GovernanceMemberRenewal = {
  id: string;
  memberName: string;
  company: string;
  tier: MemberTier;
  currentExpiry: string;
  renewalDate: string;
  status: "upcoming" | "expiring-soon" | "expired";
  lastRenewal: string;
};

export type GovernanceAuthorization = {
  id: string;
  title: string;
  requester: string;
  amount?: number;
  type: "payment" | "document-approval" | "event-approval" | "member-change";
  requestDate: string;
  status: "pending" | "approved" | "rejected";
  priority: "high" | "medium" | "low";
  requiredApprovals: number;
  approvedBy: string[];
  pendingApprovers: string[];
  deadline: string;
  attachmentUrl?: string;
  rejectionNote?: string;
};

export type GovernanceMemo = {
  id: string;
  subject: string;
  body: string;
  sender: string;
  recipientIds: string[];
  createdAt: string;
  readBy: string[];
};

export type GovernanceNotification = {
  id: string;
  title: string;
  message: string;
  recipient: string;
  createdAt: string;
  read: boolean;
};

const statusForRenewal = (date: string): GovernanceMemberRenewal["status"] => {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  return days < 0 ? "expired" : days <= 60 ? "expiring-soon" : "upcoming";
};

export async function getSacbmGovernanceData(memberId: string) {
  const [financialResult, authorizationResult, approvalResult, memoResult, memoRecipientResult, membersResult, companiesResult, notificationsResult] = await Promise.all([
    supabase.from("sacbm_financial_records").select("*").order("date", { ascending: false }),
    supabase.from("sacbm_authorizations").select("*").order("request_date", { ascending: false }),
    supabase.from("sacbm_authorization_approvals").select("*"),
    supabase.from("sacbm_memos").select("*").order("created_at", { ascending: false }),
    supabase.from("sacbm_memo_recipients").select("*"),
    supabase.from("sacbm_members").select("*").eq("is_active", true).order("name", { ascending: true }),
    supabase.from("sacbm_companies").select("*").eq("is_active", true).order("name", { ascending: true }),
    supabase.from("sacbm_notifications").select("*").eq("recipient_id", memberId).order("created_at", { ascending: false }),
  ]);

  const firstError = financialResult.error || authorizationResult.error || approvalResult.error || memoResult.error || memoRecipientResult.error || membersResult.error || companiesResult.error || notificationsResult.error;
  if (firstError) throw new Error("We could not load the Board and EXCO workspace.");

  const members = (membersResult.data || []) as Array<{ id: string; name: string; company: string; tier: MemberTier; role: MemberRole }>;
  const memberNames = new Map(members.map((item) => [item.id, item.name]));
  const companyByName = new Map((companiesResult.data || []).map((item) => [String(item.name).trim().toLowerCase(), item]));
  const renewals = members.flatMap((member) => {
    const company = companyByName.get(member.company.trim().toLowerCase());
    if (!company?.renewal_date) return [];
    return [{
      id: member.id,
      memberName: member.name,
      company: member.company,
      tier: (company.membership_tier || member.tier) as MemberTier,
      currentExpiry: company.renewal_date,
      renewalDate: company.renewal_date,
      status: statusForRenewal(company.renewal_date),
      lastRenewal: company.renewal_date,
    }];
  });

  const approvals = (approvalResult.data || []) as Array<{ authorization_id: string; approver_id: string; status: string; note: string | null }>;
  const memoRecipients = (memoRecipientResult.data || []) as Array<{ memo_id: string; recipient_id: string; read_at: string | null }>;

  const financialRecords = await Promise.all((financialResult.data || []).map(async (row) => {
    const filePath = row.file_path || row.file_url || "";
    const { data: signed } = filePath
      ? await supabase.storage.from("sacbm-assets").createSignedUrl(filePath, 3600)
      : { data: null };
    return {
      id: row.id,
      title: row.title,
      type: row.type,
      amount: row.amount == null ? undefined : Number(row.amount),
      date: row.date,
      uploadedBy: memberNames.get(row.uploaded_by) || "Chamber administration",
      category: row.description || "Finance",
      fileUrl: signed?.signedUrl || row.file_url || "",
      status: row.status,
    };
  })) as GovernanceFinancialRecord[];

  return {
    financialRecords,
    memberRenewals: renewals,
    authorizationRequests: (authorizationResult.data || []).map((row) => {
      const rowApprovals = approvals.filter((approval) => approval.authorization_id === row.id);
      const approvedBy = rowApprovals.filter((approval) => approval.status === "approved").map((approval) => memberNames.get(approval.approver_id) || approval.approver_id);
      const pendingApprovers = rowApprovals.filter((approval) => approval.status === "pending").map((approval) => memberNames.get(approval.approver_id) || approval.approver_id);
      const rejection = rowApprovals.find((approval) => approval.status === "rejected");
      return {
        id: row.id,
        title: row.title,
        requester: memberNames.get(row.requester_id) || "Chamber administration",
        requesterId: row.requester_id,
        amount: row.amount == null ? undefined : Number(row.amount),
        type: row.type,
        requestDate: row.request_date,
        status: row.status,
        priority: row.priority,
        requiredApprovals: row.required_approvals,
        approvedBy,
        pendingApprovers,
        deadline: row.deadline || "No deadline",
        attachmentUrl: row.attachment_url || undefined,
        rejectionNote: rejection?.note || undefined,
      };
    }) as GovernanceAuthorization[],
    reviewers: members.filter((item) => [MemberRole.ADMIN, MemberRole.BOARD, MemberRole.EXCO].includes(item.role)).map((item) => ({ id: item.id, name: item.name, role: item.role })),
    memos: (memoResult.data || []).map((row) => {
      const recipients = memoRecipients.filter((recipient) => recipient.memo_id === row.id);
      return {
        id: row.id,
        subject: row.subject,
        body: row.body,
        sender: memberNames.get(row.sender_id) || "Chamber administration",
        recipientIds: recipients.map((recipient) => recipient.recipient_id),
        createdAt: row.created_at,
        readBy: recipients.filter((recipient) => recipient.read_at).map((recipient) => recipient.recipient_id),
      };
    }) as GovernanceMemo[],
    notifications: (notificationsResult.data || []).map((row) => ({
      id: row.id,
      title: row.title,
      message: row.body,
      recipient: memberNames.get(row.recipient_id) || "Chamber member",
      createdAt: row.created_at,
      read: Boolean(row.read_at),
    })) as GovernanceNotification[],
  };
}

export async function uploadSacbmFinancialRecord(input: { memberId: string; title: string; type: "receipt" | "invoice" | "contract"; category: string; file: File }) {
  const safeFileName = input.file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filePath = `governance/${input.memberId}/${crypto.randomUUID()}-${safeFileName}`;
  const { error: uploadError } = await supabase.storage.from("sacbm-assets").upload(filePath, input.file, { contentType: input.file.type || "application/octet-stream", upsert: false });
  if (uploadError) throw new Error("We could not upload the finance file.");
  const { data, error } = await supabase.from("sacbm_financial_records").insert({ title: input.title.trim(), type: input.type, date: new Date().toISOString().slice(0, 10), status: "approved", description: input.category.trim(), file_url: filePath, file_path: filePath, uploaded_by: input.memberId, approved_by: input.memberId }).select("*").single();
  if (error || !data) { await supabase.storage.from("sacbm-assets").remove([filePath]); throw new Error("We could not save the finance record."); }
  const { data: signed, error: signedError } = await supabase.storage.from("sacbm-assets").createSignedUrl(filePath, 3600);
  if (signedError || !signed?.signedUrl) throw new Error("The record was saved but its download link could not be prepared.");
  return { id: data.id, title: data.title, type: data.type, date: data.date, uploadedBy: "", category: data.description || "Finance", fileUrl: signed.signedUrl, status: data.status } as GovernanceFinancialRecord;
}

export async function createSacbmAuthorization(input: { requesterId: string; title: string; amount?: number; type: GovernanceAuthorization["type"]; priority: GovernanceAuthorization["priority"]; deadline: string; approverIds: string[] }) {
  const { data, error } = await supabase.from("sacbm_authorizations").insert({ requester_id: input.requesterId, title: input.title.trim(), amount: input.amount ?? null, type: input.type, priority: input.priority, deadline: input.deadline || null, required_approvals: input.approverIds.length, status: "pending" }).select("id").single();
  if (error || !data) throw new Error("We could not create the authorization request.");
  if (input.approverIds.length > 0) {
    const { error: approvalError } = await supabase.from("sacbm_authorization_approvals").insert(input.approverIds.map((approverId) => ({ authorization_id: data.id, approver_id: approverId, status: "pending" })));
    if (approvalError) throw new Error("The authorization was created but reviewers could not be assigned.");
  }
  return data.id as string;
}

export async function decideSacbmAuthorization(input: { authorizationId: string; approverId: string; decision: "approved" | "rejected"; note?: string }) {
  const { error: approvalError } = await supabase.from("sacbm_authorization_approvals").update({ status: input.decision, note: input.note?.trim() || null, decided_at: new Date().toISOString() }).eq("authorization_id", input.authorizationId).eq("approver_id", input.approverId);
  if (approvalError) throw new Error("We could not record your authorization decision.");
  const [{ data: request, error: requestError }, { data: approvals, error: approvalsError }] = await Promise.all([supabase.from("sacbm_authorizations").select("required_approvals").eq("id", input.authorizationId).single(), supabase.from("sacbm_authorization_approvals").select("status").eq("authorization_id", input.authorizationId)]);
  if (requestError || approvalsError || !request) throw new Error("We could not refresh the authorization status.");
  const rejected = (approvals || []).some((approval) => approval.status === "rejected");
  const approvedCount = (approvals || []).filter((approval) => approval.status === "approved").length;
  const status = rejected ? "rejected" : approvedCount >= request.required_approvals ? "approved" : "pending";
  const { error: statusError } = await supabase.from("sacbm_authorizations").update({ status }).eq("id", input.authorizationId);
  if (statusError) throw new Error("The decision was saved but the authorization status could not be updated.");
}

export async function sendSacbmMemo(input: { senderId: string; subject: string; body: string; recipientIds: string[] }) {
  const { data, error } = await supabase.from("sacbm_memos").insert({ sender_id: input.senderId, subject: input.subject.trim(), body: input.body.trim() }).select("id").single();
  if (error || !data) throw new Error("We could not send the memo.");
  const { error: recipientError } = await supabase.from("sacbm_memo_recipients").insert(input.recipientIds.map((recipientId) => ({ memo_id: data.id, recipient_id: recipientId })));
  if (recipientError) throw new Error("The memo was created but recipients could not be assigned.");
  return data.id as string;
}

export async function markSacbmMemoRead(memoId: string, memberId: string) {
  const { error } = await supabase.from("sacbm_memo_recipients").update({ read_at: new Date().toISOString() }).eq("memo_id", memoId).eq("recipient_id", memberId);
  if (error) throw new Error("We could not mark the memo as read.");
}

export async function createSacbmNotification(input: { recipientIds: string[]; title: string; body: string; type: "info" | "approval" | "rejection" | "event" | "finance" }) {
  const { error } = await supabase.from("sacbm_notifications").insert(input.recipientIds.map((recipientId) => ({
    recipient_id: recipientId,
    title: input.title.trim(),
    body: input.body.trim(),
    type: input.type,
  })));
  if (error) throw new Error("We could not create the notification.");
}

export async function markSacbmNotificationRead(notificationId: string, memberId: string) {
  const { error } = await supabase.from("sacbm_notifications").update({ read_at: new Date().toISOString() }).eq("id", notificationId).eq("recipient_id", memberId);
  if (error) throw new Error("We could not mark the notification as read.");
}
