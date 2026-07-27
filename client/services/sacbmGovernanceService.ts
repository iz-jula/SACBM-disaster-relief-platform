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

const statusForRenewal = (date: string): GovernanceMemberRenewal["status"] => {
  const days = Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  return days < 0 ? "expired" : days <= 60 ? "expiring-soon" : "upcoming";
};

export async function getSacbmGovernanceData() {
  const [financialResult, authorizationResult, approvalResult, memoResult, memoRecipientResult, membersResult, companiesResult] = await Promise.all([
    supabase.from("sacbm_financial_records").select("*").order("date", { ascending: false }),
    supabase.from("sacbm_authorizations").select("*").order("request_date", { ascending: false }),
    supabase.from("sacbm_authorization_approvals").select("*"),
    supabase.from("sacbm_memos").select("*").order("created_at", { ascending: false }),
    supabase.from("sacbm_memo_recipients").select("*"),
    supabase.from("sacbm_members").select("*").eq("is_active", true).order("name", { ascending: true }),
    supabase.from("sacbm_companies").select("*").eq("is_active", true).order("name", { ascending: true }),
  ]);

  const firstError = financialResult.error || authorizationResult.error || approvalResult.error || memoResult.error || memoRecipientResult.error || membersResult.error || companiesResult.error;
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

  return {
    financialRecords: (financialResult.data || []).map((row) => ({
      id: row.id,
      title: row.title,
      type: row.type,
      amount: row.amount == null ? undefined : Number(row.amount),
      date: row.date,
      uploadedBy: memberNames.get(row.uploaded_by) || "Chamber administration",
      category: row.description || "Finance",
      fileUrl: row.file_url || row.file_path || "",
      status: row.status,
    })) as GovernanceFinancialRecord[],
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
  };
}
