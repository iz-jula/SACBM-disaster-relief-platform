import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  Download,
  Plus,
  Search,
  Filter,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Member, MemberRole } from "@shared/api";

interface FinancialRecord {
  id: string;
  title: string;
  type: "receipt" | "invoice" | "contract";
  amount?: number;
  date: string;
  uploadedBy: string;
  category: string;
  fileUrl: string;
  status: "approved" | "pending" | "rejected";
}

interface MemberRenewal {
  id: string;
  memberName: string;
  company: string;
  tier: "bronze" | "gold" | "platinum";
  currentExpiry: string;
  renewalDate: string;
  status: "upcoming" | "expiring-soon" | "expired";
  lastRenewal: string;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  recipient: string;
  createdAt: string;
  read: boolean;
}

interface PortalMemo {
  id: string;
  subject: string;
  body: string;
  sender: string;
  recipientIds: string[];
  createdAt: string;
  readBy: string[];
}

interface PendingAuthorization {
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
}

const AVAILABLE_REVIEWERS = [
  { id: "sean-exco", name: "Sean Williams", role: MemberRole.EXCO },
  { id: "amina-exco", name: "Amina Patel", role: MemberRole.EXCO },
  { id: "thandi-board", name: "Thandi Mokoena", role: MemberRole.BOARD },
  { id: "joao-admin", name: "João Silva", role: MemberRole.ADMIN },
];

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MOCK_FINANCIAL_RECORDS: FinancialRecord[] = [
  {
    id: "1",
    title: "Annual Gala Event Invoice",
    type: "invoice",
    amount: 5000,
    date: "2024-02-10",
    uploadedBy: "events-admin",
    category: "events",
    fileUrl: "/docs/invoice-gala.pdf",
    status: "approved",
  },
  {
    id: "2",
    title: "Office Supplies Receipt",
    type: "receipt",
    amount: 250,
    date: "2024-02-08",
    uploadedBy: "admin",
    category: "operations",
    fileUrl: "/docs/receipt-supplies.pdf",
    status: "approved",
  },
  {
    id: "3",
    title: "Speaker Honorarium Invoice",
    type: "invoice",
    amount: 1500,
    date: "2024-02-12",
    uploadedBy: "events-admin",
    category: "events",
    fileUrl: "/docs/invoice-speaker.pdf",
    status: "pending",
  },
];

const MOCK_MEMBER_RENEWALS: MemberRenewal[] = [
  {
    id: "1",
    memberName: "John Smith",
    company: "TechCore Solutions",
    tier: "platinum",
    currentExpiry: "2024-03-15",
    renewalDate: "2024-02-28",
    status: "upcoming",
    lastRenewal: "2023-03-15",
  },
  {
    id: "2",
    memberName: "Sarah Johnson",
    company: "BuildRight Consultancy",
    tier: "gold",
    currentExpiry: "2024-02-20",
    renewalDate: "2024-02-10",
    status: "expiring-soon",
    lastRenewal: "2023-02-20",
  },
  {
    id: "3",
    memberName: "Mike Chen",
    company: "Global Trading Inc",
    tier: "bronze",
    currentExpiry: "2024-01-31",
    renewalDate: "2024-01-20",
    status: "expired",
    lastRenewal: "2023-01-31",
  },
];

const MOCK_PENDING_AUTHORIZATIONS: PendingAuthorization[] = [
  {
    id: "1",
    title: "Budget Approval: Q1 Marketing",
    requester: "Marketing Lead",
    amount: 3000,
    type: "payment",
    requestDate: "2024-02-10",
    status: "pending",
    priority: "high",
    requiredApprovals: 3,
    approvedBy: ["Thandi Mokoena"],
    pendingApprovers: ["Ian Smith", "Amina Patel"],
    deadline: "2024-02-18",
    attachmentUrl: "/docs/q1-marketing-budget.pdf",
  },
  {
    id: "2",
    title: "New Member Application",
    requester: "Admin",
    type: "member-change",
    requestDate: "2024-02-09",
    status: "pending",
    priority: "medium",
    requiredApprovals: 2,
    approvedBy: [],
    pendingApprovers: ["Thandi Mokoena", "Amina Patel"],
    deadline: "2024-02-20",
    attachmentUrl: "/docs/new-member-application.pdf",
  },
  {
    id: "3",
    title: "Sponsorship Agreement",
    requester: "Partnership Manager",
    amount: 5000,
    type: "document-approval",
    requestDate: "2024-02-08",
    status: "approved",
    priority: "high",
    requiredApprovals: 2,
    approvedBy: ["Thandi Mokoena", "Amina Patel"],
    pendingApprovers: [],
    deadline: "2024-02-15",
    attachmentUrl: "/docs/sponsorship-agreement.pdf",
  },
];

interface BoardExcoProps {
  member: Member;
}

const FinancialRecordRow = ({
  record,
  onSelect,
}: {
  record: FinancialRecord;
  onSelect: (record: FinancialRecord) => void;
}) => (
  <div
    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer"
    onClick={() => onSelect(record)}
  >
    <div className="flex-1 min-w-0">
      <p className="font-medium text-slate-900 truncate">{record.title}</p>
      <div className="flex flex-wrap items-center gap-3 mt-2">
        <span className="text-xs font-medium text-slate-600">{record.category}</span>
        <span className="text-xs text-slate-500">Uploaded {record.date}</span>
      </div>
    </div>
    <div className="flex items-center gap-4 flex-shrink-0">
      {record.amount !== undefined && <p className="font-semibold text-slate-900">${record.amount.toLocaleString()}</p>}
      <span
        className={`text-xs font-medium px-3 py-1.5 rounded-full ${
          record.status === "approved"
            ? "bg-emerald-50 text-emerald-700"
            : record.status === "pending"
            ? "bg-amber-50 text-amber-700"
            : "bg-red-50 text-red-700"
        }`}
      >
        {record.status}
      </span>
      <Eye className="h-4 w-4 text-slate-400" />
    </div>
  </div>
);

type TabType = "overview" | "renewals" | "authorizations" | "finance" | "contracts" | "admin" | "memos";

type FinanceView = "summary" | "invoices" | "receipts";
type ActivityFilter = "day" | "month" | "year" | "range";
type ActivityCategory = "all" | "invoices" | "receipts" | "member-renewals";
type AdminView = "overview" | "approvals" | "finance" | "notifications";

const FinanceSubnav = ({
  activeView,
  onChange,
}: {
  activeView: FinanceView;
  onChange: (view: FinanceView) => void;
}) => (
  <div className="flex min-w-max items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3">
    {([
      ["summary", "Financial Activity"],
      ["invoices", "Invoices"],
      ["receipts", "Receipts"],
    ] as [FinanceView, string][]).map(([view, label]) => (
      <button
        key={view}
        onClick={() => onChange(view)}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          activeView === view
            ? "bg-emerald-600 text-white"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        }`}
      >
        {label}
      </button>
    ))}
  </div>
);

const SACBMBoardExco: React.FC<BoardExcoProps> = ({ member }) => {
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [financeView, setFinanceView] = useState<FinanceView>("summary");
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("month");
  const [activityCategory, setActivityCategory] = useState<ActivityCategory>("all");
  const [activityDate, setActivityDate] = useState("2024-02");
  const [activityEndDate, setActivityEndDate] = useState("2024-02-29");
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [monthPickerYear, setMonthPickerYear] = useState(2024);
  const [selectedFile, setSelectedFile] = useState<FinancialRecord | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<"receipt" | "invoice" | "contract">("receipt");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadCategory, setUploadCategory] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [financialRecords, setFinancialRecords] = useState<FinancialRecord[]>(MOCK_FINANCIAL_RECORDS);
  const [authorizationRequests, setAuthorizationRequests] = useState<PendingAuthorization[]>(MOCK_PENDING_AUTHORIZATIONS);
  const [selectedAuthorization, setSelectedAuthorization] = useState<PendingAuthorization | null>(null);
  const [authorizationNotes, setAuthorizationNotes] = useState("");
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [adminView, setAdminView] = useState<AdminView>("overview");
  const [memos, setMemos] = useState<PortalMemo[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("sacbmMemos");
    return stored ? JSON.parse(stored) : [];
  });
  const [memoSubject, setMemoSubject] = useState("");
  const [memoBody, setMemoBody] = useState("");
  const [memoRecipients, setMemoRecipients] = useState<string[]>([]);
  const [approvalTitle, setApprovalTitle] = useState("");
  const [approvalAmount, setApprovalAmount] = useState("");
  const [approvalType, setApprovalType] = useState<PendingAuthorization["type"]>("payment");
  const [approvalRecipients, setApprovalRecipients] = useState<string[]>([]);

  const isAdmin = member.role === MemberRole.ADMIN;
  const hasAccess = [MemberRole.ADMIN, MemberRole.EXCO, MemberRole.BOARD].includes(member.role);
  const isGovernanceMember = hasAccess;

  useEffect(() => {
    localStorage.setItem("sacbmMemos", JSON.stringify(memos));
  }, [memos]);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-12 pb-12 text-center">
            <AlertCircle className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Access Restricted</p>
            <p className="text-slate-500 text-sm mt-1">This section is only available for Board, EXCO, and Admin members</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Financial Overview Stats
  const financialStats = useMemo(() => {
    const approved = financialRecords.filter((r) => r.status === "approved");
    const pending = financialRecords.filter((r) => r.status === "pending");
    const totalApproved = approved.reduce((sum, r) => sum + (r.amount || 0), 0);

    return {
      totalRecords: financialRecords.length,
      approved: approved.length,
      pending: pending.length,
      totalAmount: totalApproved,
      spendToDate: approved
        .filter((record) => record.type === "receipt" || record.type === "invoice")
        .reduce((sum, record) => sum + (record.amount || 0), 0),
      renewalIncome: MOCK_MEMBER_RENEWALS.reduce((sum, renewal) => {
        const annualFee = { bronze: 500, gold: 1200, platinum: 2500 }[renewal.tier];
        return sum + annualFee;
      }, 0),
    };
  }, [financialRecords]);

  const activityData = useMemo(() => {
    const activityEntries = [
      ...financialRecords
        .filter(
          (record) =>
            record.status === "approved" &&
            (record.type === "receipt" || record.type === "invoice") &&
            (activityCategory === "all" || activityCategory === `${record.type}s`)
        )
        .map((record) => ({ date: record.date, amount: record.amount || 0 })),
      ...MOCK_MEMBER_RENEWALS
        .filter(() => activityCategory === "all" || activityCategory === "member-renewals")
        .map((renewal) => ({
          date: renewal.renewalDate,
          amount: { bronze: 500, gold: 1200, platinum: 2500 }[renewal.tier],
        })),
    ];

    if (activityFilter === "day") {
      const amount = activityEntries
        .filter((entry) => entry.date === activityDate)
        .reduce((sum, entry) => sum + entry.amount, 0);
      return [{ label: activityDate, amount }];
    }

    if (activityFilter === "range") {
      const amount = activityEntries
        .filter((entry) => entry.date >= activityDate && entry.date <= activityEndDate)
        .reduce((sum, entry) => sum + entry.amount, 0);
      return [{ label: `${activityDate} – ${activityEndDate}`, amount }];
    }

    if (activityFilter === "year") {
      const year = activityDate.slice(0, 4);
      return Array.from({ length: 12 }, (_, index) => {
        const month = String(index + 1).padStart(2, "0");
        const amount = activityEntries
          .filter((entry) => entry.date.startsWith(`${year}-${month}`))
          .reduce((sum, entry) => sum + entry.amount, 0);
        return {
          label: new Date(Number(year), index, 1).toLocaleDateString("en-US", { month: "short" }),
          amount,
        };
      });
    }

    return Array.from({ length: 5 }, (_, index) => {
      const startDay = index * 7 + 1;
      const endDay = startDay + 6;
      const amount = activityEntries
        .filter((entry) => {
          if (!entry.date.startsWith(`${activityDate}-`)) return false;
          const day = Number(entry.date.slice(-2));
          return day >= startDay && day <= endDay;
        })
        .reduce((sum, entry) => sum + entry.amount, 0);
      return { label: `Week ${index + 1}`, amount };
    });
  }, [activityCategory, activityDate, activityEndDate, activityFilter, financialRecords]);

  const selectedMonthLabel = new Date(`${activityDate.slice(0, 7)}-01T00:00:00`).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  const selectedPeriodLabel = activityFilter === "range" ? `${activityDate} – ${activityEndDate}` : activityDate;

  const activitySpend = useMemo(
    () => activityData.reduce((sum, item) => sum + item.amount, 0),
    [activityData]
  );

  const activityCategoryLabel =
    activityCategory === "member-renewals"
      ? "Member renewal income"
      : activityCategory === "all"
      ? "Financial activity"
      : activityCategory.charAt(0).toUpperCase() + activityCategory.slice(1);

  const activityMax = Math.max(...activityData.map((item) => item.amount), 1);

  const renewalStats = useMemo(() => {
    const upcoming = MOCK_MEMBER_RENEWALS.filter((r) => r.status === "upcoming").length;
    const expiringSoon = MOCK_MEMBER_RENEWALS.filter((r) => r.status === "expiring-soon").length;
    const expired = MOCK_MEMBER_RENEWALS.filter((r) => r.status === "expired").length;

    return { upcoming, expiringSoon, expired, total: MOCK_MEMBER_RENEWALS.length };
  }, []);

  const authStats = useMemo(() => {
    const pending = authorizationRequests.filter((a) => a.status === "pending").length;
    const approved = authorizationRequests.filter((a) => a.status === "approved").length;
    const highPriority = authorizationRequests.filter((a) => a.priority === "high" && a.status === "pending").length;

    return { pending, approved, highPriority };
  }, [authorizationRequests]);

  const receivedMemos = useMemo(
    () => memos.filter((memo) => memo.recipientIds.includes(member.id) || memo.recipientIds.some((id) => AVAILABLE_REVIEWERS.find((reviewer) => reviewer.id === id)?.name === member.name)),
    [member.id, member.name, memos]
  );

  const handleAuthorization = (decision: "approved" | "rejected") => {
    if (!selectedAuthorization) return;
    if (decision === "rejected" && !authorizationNotes.trim()) return;

    if (decision === "rejected") {
      const rejectionNote = authorizationNotes.trim();
      setAdminNotifications((notifications) => [
        {
          id: `notification-${Date.now()}`,
          title: "Authorization rejected",
          message: `${selectedAuthorization.title} was rejected by ${member.name}. Reason: ${rejectionNote}`,
          recipient: selectedAuthorization.requester,
          createdAt: new Date().toISOString(),
          read: false,
        },
        ...notifications,
      ]);
    }

    setAuthorizationRequests((requests) =>
      requests.map((request) => {
        if (request.id !== selectedAuthorization.id) return request;
        if (decision === "rejected") {
          return { ...request, status: "rejected", rejectionNote: authorizationNotes.trim() };
        }
        const approvedBy = request.approvedBy.includes(member.name)
          ? request.approvedBy
          : [...request.approvedBy, member.name];
        const pendingApprovers = request.pendingApprovers.filter((approver) => approver !== member.name);
        return {
          ...request,
          approvedBy,
          pendingApprovers,
          status: approvedBy.length >= request.requiredApprovals ? "approved" : "pending",
        };
      })
    );
    setSelectedAuthorization(null);
    setAuthorizationNotes("");
  };

  const handleSendMemo = () => {
    if (!memoSubject.trim() || !memoBody.trim() || memoRecipients.length === 0) return;
    setMemos((current) => [
      {
        id: `memo-${Date.now()}`,
        subject: memoSubject.trim(),
        body: memoBody.trim(),
        sender: member.name,
        recipientIds: memoRecipients,
        createdAt: new Date().toISOString(),
        readBy: [],
      },
      ...current,
    ]);
    setMemoSubject("");
    setMemoBody("");
    setMemoRecipients([]);
  };

  const handleSendApproval = () => {
    if (!approvalTitle.trim() || approvalRecipients.length === 0) return;
    const recipients = AVAILABLE_REVIEWERS.filter((reviewer) => approvalRecipients.includes(reviewer.id));
    const newRequest: PendingAuthorization = {
      id: `authorization-${Date.now()}`,
      title: approvalTitle.trim(),
      requester: member.name,
      amount: approvalAmount ? Number(approvalAmount) : undefined,
      type: approvalType,
      requestDate: new Date().toISOString().split("T")[0],
      status: "pending",
      priority: "medium",
      requiredApprovals: recipients.length,
      approvedBy: [],
      pendingApprovers: recipients.map((recipient) => recipient.name),
      deadline: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
      attachmentUrl: "/docs/placeholder.pdf",
    };
    setAuthorizationRequests((requests) => [newRequest, ...requests]);
    setApprovalTitle("");
    setApprovalAmount("");
    setApprovalRecipients([]);
  };

  const handleUploadFile = () => {
    if (uploadTitle.trim() && uploadCategory.trim() && uploadFile) {
      const newRecord: FinancialRecord = {
        id: `record-${Date.now()}`,
        title: uploadTitle,
        type: uploadType,
        date: new Date().toISOString().split("T")[0],
        uploadedBy: member.name,
        category: uploadCategory,
        fileUrl: URL.createObjectURL(uploadFile),
        fileSize: uploadFile.size / (1024 * 1024),
        status: "approved",
      };

      setFinancialRecords([newRecord, ...financialRecords]);
      setUploadTitle("");
      setUploadCategory("");
      setUploadFile(null);
      setShowUploadModal(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Board & EXCO Dashboard</h2>
        <p className="text-slate-600 text-sm mt-1">
          Manage finances, member renewals, approvals, and key documents
        </p>
      </div>

      {/* Overview Stats */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Financial Records</p>
                  <p className="text-3xl font-light text-slate-900 mt-2">{financialStats.totalRecords}</p>
                  <p className="text-xs text-slate-500 mt-2">{financialStats.pending} pending approval</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Member Renewals</p>
                  <p className="text-3xl font-light text-slate-900 mt-2">{renewalStats.total}</p>
                  <p className="text-xs text-slate-500 mt-2">{renewalStats.expiringSoon} expiring soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Pending Approvals</p>
                  <p className="text-3xl font-light text-slate-900 mt-2">{authStats.pending}</p>
                  <p className={`mt-2 text-xs font-medium ${authStats.highPriority > 0 ? "text-rose-800" : "text-slate-500"}`}>
                    {authStats.highPriority} high priority
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">Approved Amount</p>
                  <p className="text-3xl font-light text-slate-900 mt-2">${financialStats.totalAmount.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 mt-2">{financialStats.approved} documents</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-slate-200 overflow-x-auto">
        <div className="flex min-w-max gap-6 px-1">
          {(["overview", "renewals", "authorizations", "finance", "contracts", ...(isGovernanceMember ? ["memos"] : []), ...(isAdmin ? ["admin"] : [])] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "finance") setFinanceView("summary");
              }}
              className={`py-4 px-1 font-medium text-sm transition-colors border-b-2 ${
                activeTab === tab
                  ? "border-emerald-600 text-emerald-600"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              {tab === "overview" && "Overview"}
              {tab === "renewals" && "Member Renewals"}
              {tab === "authorizations" && "Authorizations"}
              {tab === "finance" && "Finance"}
              {tab === "contracts" && "Contracts"}
              {tab === "admin" && "Admin Operations"}
              {tab === "memos" && "Memos"}
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}

      {/* Overview Tab - Detail Cards */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Renewals */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Upcoming Renewals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_MEMBER_RENEWALS.slice(0, 3).map((renewal) => (
                <div key={renewal.id} className="flex items-start justify-between p-3 border border-slate-100 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{renewal.memberName}</p>
                    <p className="text-xs text-slate-600 mt-1">{renewal.company}</p>
                    <p className="text-xs text-slate-500 mt-1">Expires: {renewal.currentExpiry}</p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${
                      renewal.status === "upcoming"
                        ? "bg-blue-50 text-blue-700"
                        : renewal.status === "expiring-soon"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {renewal.status === "upcoming" && "Upcoming"}
                    {renewal.status === "expiring-soon" && "Expiring Soon"}
                    {renewal.status === "expired" && "Expired"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Pending High-Priority Approvals */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {MOCK_PENDING_AUTHORIZATIONS.filter((a) => a.status === "pending").slice(0, 3).map((auth) => (
                <div
                  key={auth.id}
                  className={`flex items-start justify-between p-3 border-l-4 rounded-lg ${
                    auth.priority === "high"
                      ? "border-l-red-600 bg-red-50"
                      : auth.priority === "medium"
                      ? "border-l-amber-600 bg-amber-50"
                      : "border-l-slate-400 bg-slate-50"
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{auth.title}</p>
                    <p className="text-xs text-slate-600 mt-1">By {auth.requester}</p>
                    {auth.amount && <p className="text-sm font-semibold text-slate-900 mt-1">${auth.amount.toLocaleString()}</p>}
                  </div>
                  <Clock className="h-5 w-5 text-slate-400 flex-shrink-0 ml-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Renewals Tab */}
      {activeTab === "renewals" && (
        <div className="space-y-6">
          {/* Renewal Status Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-slate-600 uppercase">Upcoming</p>
                <p className="text-2xl font-light text-blue-600 mt-2">{renewalStats.upcoming}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-slate-600 uppercase">Expiring Soon</p>
                <p className="text-2xl font-light text-amber-600 mt-2">{renewalStats.expiringSoon}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-slate-600 uppercase">Expired</p>
                <p className="text-2xl font-light text-red-600 mt-2">{renewalStats.expired}</p>
              </CardContent>
            </Card>
          </div>

          {/* Member Renewals List */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>All Member Renewals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_MEMBER_RENEWALS.map((renewal) => (
                  <div key={renewal.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-sm font-bold text-slate-700">
                          {renewal.memberName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{renewal.memberName}</p>
                          <p className="text-xs text-slate-600">{renewal.company}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            renewal.tier === "platinum"
                              ? "bg-cyan-50 text-cyan-700"
                              : renewal.tier === "gold"
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {renewal.tier.toUpperCase()}
                        </span>
                        <p className="text-xs text-slate-600 mt-2">Expires {renewal.currentExpiry}</p>
                      </div>
                      <span
                        className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${
                          renewal.status === "upcoming"
                            ? "bg-blue-50 text-blue-700"
                            : renewal.status === "expiring-soon"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {renewal.status === "upcoming" && "Upcoming"}
                        {renewal.status === "expiring-soon" && "Expiring Soon"}
                        {renewal.status === "expired" && "Expired"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Authorizations Tab */}
      {activeTab === "authorizations" && (
        <div className="space-y-6">
          {/* Auth Status Summary */}
          <div className="grid grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-slate-600 uppercase">Pending</p>
                <p className="text-2xl font-light text-amber-600 mt-2">{authStats.pending}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-slate-600 uppercase">Approved</p>
                <p className="text-2xl font-light text-emerald-600 mt-2">{authStats.approved}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-4 pb-4">
                <p className="text-xs font-medium text-slate-600 uppercase">High Priority</p>
                <p className="text-2xl font-light text-red-600 mt-2">{authStats.highPriority}</p>
              </CardContent>
            </Card>
          </div>

          {/* Authorizations List */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Authorization Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {authorizationRequests.map((auth) => (
                  <button
                    key={auth.id}
                    onClick={() => setSelectedAuthorization(auth)}
                    className={`w-full text-left p-4 border-l-4 rounded-lg transition-shadow hover:shadow-sm ${
                      auth.priority === "high"
                        ? "border-l-red-600 bg-red-50"
                        : auth.priority === "medium"
                        ? "border-l-amber-600 bg-amber-50"
                        : "border-l-slate-400 bg-slate-50"
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-slate-900">{auth.title}</p>
                        <p className="text-sm text-slate-600 mt-1">Requested by {auth.requester} · Due {auth.deadline}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                          <span className="font-medium text-slate-900">{auth.approvedBy.length}/{auth.requiredApprovals} approvals</span>
                          <span>{auth.pendingApprovers.length} EXCO {auth.pendingApprovers.length === 1 ? "member" : "members"} missing</span>
                          {auth.attachmentUrl && <span className="text-emerald-700">Attachment available</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        {auth.amount !== undefined && <p className="text-lg font-semibold text-slate-900">${auth.amount.toLocaleString()}</p>}
                        <span
                          className={`text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap ${
                            auth.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : auth.status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {auth.status}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Memo Inbox */}
      {activeTab === "memos" && isGovernanceMember && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium text-slate-900">Memos</h3>
            <p className="mt-1 text-sm text-slate-600">Internal notes and updates sent to you by the chamber administration.</p>
          </div>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Send a memo</CardTitle>
              <CardDescription>Write to Admin, Board, or EXCO members.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input value={memoSubject} onChange={(event) => setMemoSubject(event.target.value)} placeholder="Memo subject" />
              <textarea value={memoBody} onChange={(event) => setMemoBody(event.target.value)} rows={4} placeholder="Write an internal note or update..." className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_REVIEWERS.filter((reviewer) => reviewer.name !== member.name).map((reviewer) => (
                  <label key={reviewer.id} className="flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={memoRecipients.includes(reviewer.id)}
                      onChange={() => setMemoRecipients((recipients) => recipients.includes(reviewer.id) ? recipients.filter((id) => id !== reviewer.id) : [...recipients, reviewer.id])}
                      className="accent-emerald-600"
                    />
                    {reviewer.name} <span className="text-xs text-slate-400">({reviewer.role})</span>
                  </label>
                ))}
              </div>
              <Button onClick={handleSendMemo} disabled={!memoSubject.trim() || !memoBody.trim() || memoRecipients.length === 0} className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300">Send memo</Button>
            </CardContent>
          </Card>

          {receivedMemos.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="px-6 py-12 text-center">
                <p className="text-sm font-medium text-slate-700">No memos yet</p>
                <p className="mt-1 text-xs text-slate-500">Memos sent to you will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {receivedMemos.map((memo) => {
                const isRead = memo.readBy.includes(member.id);
                return (
                  <Card key={memo.id} className={`border shadow-sm ${isRead ? "border-slate-100" : "border-emerald-200 bg-emerald-50/30"}`}>
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-slate-900">{memo.subject}</p>
                          <p className="mt-1 text-xs text-slate-500">From {memo.sender} · {new Date(memo.createdAt).toLocaleString()}</p>
                        </div>
                        {!isRead && <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">New</span>}
                      </div>
                      <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{memo.body}</p>
                      {!isRead && (
                        <Button
                          variant="outline"
                          className="mt-4 border-slate-300 text-slate-700"
                          onClick={() => setMemos((items) => items.map((item) => item.id === memo.id ? { ...item, readBy: [...item.readBy, member.id] } : item))}
                        >
                          Mark as read
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Admin Operations Tab */}
      {activeTab === "admin" && isAdmin && (
        <div className="space-y-6">
          <div>
            <h3 className="text-xl font-medium text-slate-900">Admin Operations</h3>
            <p className="mt-1 text-sm text-slate-600">Daily chamber management, notifications, and review queues.</p>
          </div>
          <div className="flex min-w-max gap-2 overflow-x-auto border-b border-slate-200 pb-3">
            {(["overview", "approvals", "finance", "notifications"] as AdminView[]).map((view) => (
              <button
                key={view}
                onClick={() => setAdminView(view)}
                className={`rounded-full px-4 py-2 text-sm font-medium capitalize transition-colors ${adminView === view ? "bg-slate-900 text-white" : "text-slate-600 hover:bg-slate-100"}`}
              >
                {view}
              </button>
            ))}
          </div>

          <div className={`${adminView === "overview" ? "" : "hidden"} grid grid-cols-1 gap-4 md:grid-cols-3`}>
            <Card className="border-0 shadow-sm">
              <CardContent className="px-5 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Unread notifications</p>
                <p className="mt-1 text-2xl font-light text-slate-900">{adminNotifications.filter((notification) => !notification.read).length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="px-5 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Authorization queue</p>
                <p className="mt-1 text-2xl font-light text-amber-600">{authStats.pending}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="px-5 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Financial records</p>
                <p className="mt-1 text-2xl font-light text-emerald-700">{financialStats.totalRecords}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card className={`${adminView === "finance" ? "" : "hidden"} border-0 shadow-sm`}>
              <CardHeader>
                <CardTitle>Finance uploads</CardTitle>
                <CardDescription>Store finance records and keep them ready for review.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button onClick={() => { setUploadType("invoice"); setShowUploadModal(true); }} className="bg-emerald-600 text-white hover:bg-emerald-700">Upload invoice</Button>
                <Button onClick={() => { setUploadType("receipt"); setShowUploadModal(true); }} variant="outline" className="border-slate-300">Upload receipt</Button>
              </CardContent>
            </Card>

            <Card className={`${adminView === "approvals" ? "" : "hidden"} border-0 shadow-sm lg:col-span-2`}>
              <CardHeader>
                <CardTitle>Send for approval</CardTitle>
                <CardDescription>Select the EXCO or Board members required to approve this request.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input value={approvalTitle} onChange={(event) => setApprovalTitle(event.target.value)} placeholder="Request title" />
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Input type="number" value={approvalAmount} onChange={(event) => setApprovalAmount(event.target.value)} placeholder="Amount (optional)" />
                  <Select value={approvalType} onValueChange={(value) => setApprovalType(value as PendingAuthorization["type"])}>
                    <SelectTrigger><SelectValue placeholder="Request type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="payment">Payment</SelectItem>
                      <SelectItem value="document-approval">Document approval</SelectItem>
                      <SelectItem value="event-approval">Event approval</SelectItem>
                      <SelectItem value="member-change">Member change</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  {AVAILABLE_REVIEWERS.filter((reviewer) => reviewer.role !== MemberRole.ADMIN).map((reviewer) => (
                    <label key={reviewer.id} className="flex items-center gap-2 rounded-md border border-slate-100 p-2 text-sm text-slate-700 hover:bg-slate-50">
                      <input
                        type="checkbox"
                        checked={approvalRecipients.includes(reviewer.id)}
                        onChange={() => setApprovalRecipients((recipients) => recipients.includes(reviewer.id) ? recipients.filter((id) => id !== reviewer.id) : [...recipients, reviewer.id])}
                        className="accent-emerald-600"
                      />
                      {reviewer.name} <span className="text-xs text-slate-400">({reviewer.role})</span>
                    </label>
                  ))}
                </div>
                <Button onClick={handleSendApproval} disabled={!approvalTitle.trim() || approvalRecipients.length === 0} className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300">Send approval request</Button>
              </CardContent>
            </Card>

          </div>

          <Card className={`${adminView === "notifications" ? "" : "hidden"} border-0 shadow-sm`}>
            <CardHeader>
              <CardTitle>Admin notifications</CardTitle>
              <CardDescription>Updates sent to request originators and chamber administrators.</CardDescription>
            </CardHeader>
            <CardContent>
              {adminNotifications.length === 0 ? (
                <div className="rounded-lg border border-dashed border-slate-200 px-4 py-8 text-center">
                  <p className="text-sm font-medium text-slate-700">No notifications yet</p>
                  <p className="mt-1 text-xs text-slate-500">Rejection notes and workflow updates will appear here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {adminNotifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() =>
                        setAdminNotifications((notifications) =>
                          notifications.map((item) => item.id === notification.id ? { ...item, read: true } : item)
                        )
                      }
                      className={`w-full rounded-lg border p-4 text-left transition-colors hover:bg-slate-50 ${notification.read ? "border-slate-100" : "border-amber-200 bg-amber-50/50"}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{notification.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                          <p className="mt-2 text-xs text-slate-500">Originator: {notification.recipient} · {new Date(notification.createdAt).toLocaleString()}</p>
                        </div>
                        {!notification.read && <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-amber-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className={`${adminView === "overview" ? "" : "hidden"} grid grid-cols-1 gap-6 lg:grid-cols-2`}>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Daily management queue</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button onClick={() => setActiveTab("authorizations")} className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left hover:bg-slate-50">
                  <span className="text-sm text-slate-700">Review authorization requests</span>
                  <span className="text-sm font-medium text-amber-700">{authStats.pending}</span>
                </button>
                <button onClick={() => { setActiveTab("finance"); setFinanceView("invoices"); }} className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left hover:bg-slate-50">
                  <span className="text-sm text-slate-700">Manage invoices and receipts</span>
                  <span className="text-sm font-medium text-slate-900">{financialStats.totalRecords}</span>
                </button>
                <button onClick={() => setActiveTab("renewals")} className="flex w-full items-center justify-between rounded-lg border border-slate-100 p-3 text-left hover:bg-slate-50">
                  <span className="text-sm text-slate-700">Monitor member renewals</span>
                  <span className="text-sm font-medium text-slate-900">{renewalStats.total}</span>
                </button>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Admin access</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-6 text-slate-600">This workspace is visible only to chamber administrators. Board and EXCO members continue to see the shared finance and authorization views without access to administrative operations.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Authorization Review Modal */}
      {selectedAuthorization && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden border-0 shadow-2xl">
            <CardHeader className="flex-shrink-0 border-b border-slate-200 bg-slate-50">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-xl font-light tracking-tight">{selectedAuthorization.title}</CardTitle>
                  <CardDescription className="mt-1">
                    Requested by {selectedAuthorization.requester} on {selectedAuthorization.requestDate}
                  </CardDescription>
                </div>
                <button
                  onClick={() => setSelectedAuthorization(null)}
                  className="rounded-md px-2 py-1 text-xl text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                  aria-label="Close authorization review"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-6 overflow-y-auto p-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Status</p>
                  <p className="mt-1 text-sm font-medium capitalize text-slate-900">{selectedAuthorization.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Deadline</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedAuthorization.deadline}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Required</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{selectedAuthorization.requiredApprovals} EXCO</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Amount</p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedAuthorization.amount !== undefined ? `$${selectedAuthorization.amount.toLocaleString()}` : "—"}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-900">Approval progress</p>
                  <p className="text-sm text-slate-600">{selectedAuthorization.approvedBy.length} of {selectedAuthorization.requiredApprovals}</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-600 transition-all"
                    style={{ width: `${Math.min((selectedAuthorization.approvedBy.length / selectedAuthorization.requiredApprovals) * 100, 100)}%` }}
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Approved by</p>
                    <p className="mt-1 text-sm text-emerald-900">{selectedAuthorization.approvedBy.length ? selectedAuthorization.approvedBy.join(", ") : "No approvals yet"}</p>
                  </div>
                  <div className="rounded-lg bg-amber-50 p-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-amber-700">Still needed</p>
                    <p className="mt-1 text-sm text-amber-900">{selectedAuthorization.pendingApprovers.length ? selectedAuthorization.pendingApprovers.join(", ") : "Quorum reached"}</p>
                  </div>
                </div>
              </div>

              {selectedAuthorization.attachmentUrl && (
                <div>
                  <p className="mb-2 text-sm font-medium text-slate-900">Attachment</p>
                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    <iframe
                      src={`${selectedAuthorization.attachmentUrl}#toolbar=1&navpanes=0`}
                      className="h-64 w-full border-0"
                      title={`${selectedAuthorization.title} attachment`}
                    />
                  </div>
                </div>
              )}

              {selectedAuthorization.rejectionNote && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-red-700">Rejection notes</p>
                  <p className="mt-1 text-sm text-red-900">{selectedAuthorization.rejectionNote}</p>
                </div>
              )}

              {selectedAuthorization.status === "pending" && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">Review notes</label>
                  <textarea
                    value={authorizationNotes}
                    onChange={(event) => setAuthorizationNotes(event.target.value)}
                    placeholder="Required when rejecting this request"
                    rows={3}
                    className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              )}
            </CardContent>
            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:flex-row sm:justify-end">
              <Button variant="outline" onClick={() => setSelectedAuthorization(null)} className="border-slate-300 text-slate-700 hover:bg-white">
                Close
              </Button>
              {selectedAuthorization.status === "pending" && (
                <>
                  <Button
                    onClick={() => handleAuthorization("rejected")}
                    disabled={!authorizationNotes.trim()}
                    className="bg-red-600 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    Reject with notes
                  </Button>
                  <Button onClick={() => handleAuthorization("approved")} className="bg-emerald-600 text-white hover:bg-emerald-700">
                    Approve request
                  </Button>
                </>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Finance Overview Tab */}
      {activeTab === "finance" && financeView === "summary" && (
        <div className="space-y-6">
          <FinanceSubnav activeView={financeView} onChange={setFinanceView} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-w-3xl">
            <Card className="border-0 shadow-sm">
              <CardContent className="px-5 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Spend to date</p>
                <p className="text-2xl font-light text-slate-900 mt-1">${financialStats.spendToDate.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Approved invoices and receipts</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="px-5 py-4">
                <p className="text-xs uppercase tracking-wide text-slate-500">Member renewal income</p>
                <p className="text-2xl font-light text-emerald-700 mt-1">${financialStats.renewalIncome.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">Current renewal cycle</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="border-0 shadow-sm lg:col-span-2">
              <CardHeader>
                <div>
                  <CardTitle>Financial activity</CardTitle>
                  <CardDescription>{activityCategoryLabel} for the selected period</CardDescription>
                </div>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
                  <span className="text-xs font-medium uppercase tracking-wide text-slate-500">View by</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="flex rounded-md bg-slate-100 p-1">
                      {(["day", "month", "year", "range"] as ActivityFilter[]).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => {
                            setActivityFilter(filter);
                            if (filter === "year") setActivityDate(activityDate.slice(0, 4));
                            if (filter === "month") setActivityDate(activityDate.length === 4 ? `${activityDate}-01` : activityDate.slice(0, 7));
                            if (filter === "range") {
                              setActivityDate(activityDate.length === 4 ? `${activityDate}-01-01` : activityDate.length === 7 ? `${activityDate}-01` : activityDate);
                              if (activityEndDate.length === 7) setActivityEndDate(`${activityEndDate}-28`);
                            }
                            if (filter === "day") {
                              setActivityDate(
                                activityDate.length === 4
                                  ? `${activityDate}-01-01`
                                  : activityDate.length === 7
                                  ? `${activityDate}-01`
                                  : activityDate
                              );
                            }
                          }}
                          className={`rounded px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                            activityFilter === filter
                              ? "bg-white text-emerald-700 shadow-sm"
                              : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          {filter}
                        </button>
                      ))}
                    </div>
                    {activityFilter === "month" && (
                      <div className="relative">
                        <button
                          onClick={() => {
                            setMonthPickerYear(Number(activityDate.slice(0, 4)));
                            setMonthPickerOpen((open) => !open);
                          }}
                          className="flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:border-emerald-400 hover:text-emerald-700"
                          aria-expanded={monthPickerOpen}
                          aria-haspopup="dialog"
                        >
                          {selectedMonthLabel}
                        </button>
                        {monthPickerOpen && (
                          <div className="absolute right-0 top-11 z-20 w-64 rounded-xl border border-slate-200 bg-white p-4 shadow-xl">
                            <div className="mb-4 flex items-center justify-between">
                              <button
                                onClick={() => setMonthPickerYear((year) => year - 1)}
                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                aria-label="Previous year"
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </button>
                              <span className="text-sm font-semibold text-slate-900">{monthPickerYear}</span>
                              <button
                                onClick={() => setMonthPickerYear((year) => year + 1)}
                                className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                                aria-label="Next year"
                              >
                                <ChevronRight className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              {MONTHS.map((month, index) => {
                                const isSelected =
                                  Number(activityDate.slice(0, 4)) === monthPickerYear &&
                                  Number(activityDate.slice(5, 7)) === index + 1;
                                return (
                                  <button
                                    key={month}
                                    onClick={() => {
                                      setActivityDate(`${monthPickerYear}-${String(index + 1).padStart(2, "0")}`);
                                      setMonthPickerOpen(false);
                                    }}
                                    className={`rounded-md px-2 py-2 text-xs font-medium transition-colors ${
                                      isSelected
                                        ? "bg-emerald-600 text-white"
                                        : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-700"
                                    }`}
                                  >
                                    {month.slice(0, 3)}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    {activityFilter === "year" && (
                      <input
                        type="number"
                        value={activityDate}
                        min="2000"
                        max="2100"
                        onChange={(event) => setActivityDate(event.target.value)}
                        className="h-9 w-24 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        aria-label="Select year"
                      />
                    )}
                    {activityFilter === "day" && (
                      <input
                        type="date"
                        value={activityDate}
                        onChange={(event) => setActivityDate(event.target.value)}
                        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                        aria-label="Select day"
                      />
                    )}
                    {activityFilter === "range" && (
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="date"
                          value={activityDate}
                          onChange={(event) => setActivityDate(event.target.value)}
                          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          aria-label="Range start date"
                        />
                        <span className="text-xs text-slate-400">to</span>
                        <input
                          type="date"
                          value={activityEndDate}
                          min={activityDate}
                          onChange={(event) => setActivityEndDate(event.target.value)}
                          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-xs text-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                          aria-label="Range end date"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-slate-500 mr-1">Filter:</span>
                  {(["all", "invoices", "receipts", "member-renewals"] as ActivityCategory[]).map((category) => (
                    <button
                      key={category}
                      onClick={() => setActivityCategory(category)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        activityCategory === category
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {category === "all" ? "All activity" : category === "member-renewals" ? "Member renewals" : category}
                    </button>
                  ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">Selected period</p>
                    <p className="text-2xl font-light text-slate-900 mt-1">${activitySpend.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">{activityCategoryLabel} · {activityFilter === "month" ? selectedMonthLabel : selectedPeriodLabel}</p>
                  </div>
                  <p className="text-xs text-slate-500">{activityData.filter((item) => item.amount > 0).length} active periods</p>
                </div>
                <div className="h-48 flex items-end gap-1 border-b border-slate-200 px-2 overflow-hidden">
                  {activityData.map((item) => (
                    <div key={item.label} className="flex-1 min-w-0 flex flex-col items-center justify-end gap-2 h-full group">
                      <div className="relative w-full max-w-12 rounded-t-md bg-emerald-500/80 hover:bg-emerald-600 transition-colors" style={{ height: `${Math.max((item.amount / activityMax) * 100, item.amount > 0 ? 5 : 0)}%` }} title={`${item.label}: $${item.amount.toLocaleString()}`} />
                      <span className="text-[10px] text-slate-500 truncate max-w-full">{item.label}</span>
                    </div>
                  ))}
                </div>
                {activitySpend === 0 && (
                  <p className="mt-4 text-center text-sm text-slate-500">No approved financial activity for this period.</p>
                )}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Finance summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Approved value</p>
                  <p className="text-2xl font-light text-slate-900 mt-1">${financialStats.totalAmount.toLocaleString()}</p>
                </div>
                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="text-sm text-slate-600">Invoices</span>
                  <span className="font-medium text-slate-900">{financialRecords.filter((record) => record.type === "invoice").length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Receipts</span>
                  <span className="font-medium text-slate-900">{financialRecords.filter((record) => record.type === "receipt").length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Pending review</span>
                  <span className="font-medium text-amber-700">{financialStats.pending}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === "finance" && financeView === "invoices" && (
        <div className="space-y-6">
          <FinanceSubnav activeView={financeView} onChange={setFinanceView} />
          {isAdmin && (
            <Button
              onClick={() => {
                setUploadType("invoice");
                setShowUploadModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Invoice
            </Button>
          )}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
              <CardDescription>Track invoices submitted for chamber activity and operations.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {financialRecords.filter((record) => record.type === "invoice").map((record) => (
                <FinancialRecordRow key={record.id} record={record} onSelect={setSelectedFile} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Receipts Tab */}
      {activeTab === "finance" && financeView === "receipts" && (
        <div className="space-y-6">
          <FinanceSubnav activeView={financeView} onChange={setFinanceView} />
          {isAdmin && (
            <Button
              onClick={() => {
                setUploadType("receipt");
                setShowUploadModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Receipt
            </Button>
          )}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Receipts</CardTitle>
              <CardDescription>Keep a clear record of chamber expenses and payments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {financialRecords.filter((record) => record.type === "receipt").map((record) => (
                <FinancialRecordRow key={record.id} record={record} onSelect={setSelectedFile} />
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Contracts Tab */}
      {activeTab === "contracts" && (
        <div className="space-y-6">
          {/* Contracts Actions */}
          {isAdmin && (
            <Button
              onClick={() => {
                setUploadType("contract");
                setShowUploadModal(true);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Contract
            </Button>
          )}

          {/* Contracts List */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Stored Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {financialRecords
                  .filter((r) => r.type === "contract")
                  .map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 border border-slate-100 rounded-lg hover:bg-slate-50 cursor-pointer"
                      onClick={() => setSelectedFile(record)}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{record.title}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-medium text-slate-600">{record.category}</span>
                          <span className="text-xs text-slate-500">Uploaded {record.date}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() => window.open(record.fileUrl, "_blank")}
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                        <Eye className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && isAdmin && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md border-0 shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
              <CardTitle className="text-xl font-light tracking-tight">
                Upload {uploadType === "receipt" ? "Receipt" : uploadType === "invoice" ? "Invoice" : "Contract"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Document Title</label>
                <Input
                  placeholder="e.g., Q1 Office Supplies"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">File</label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(event) => setUploadFile(event.target.files?.[0] || null)}
                  className="w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-emerald-700 hover:file:bg-emerald-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-2">Category</label>
                <Select value={uploadCategory} onValueChange={setUploadCategory}>
                  <SelectTrigger className="border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operations">Operations</SelectItem>
                    <SelectItem value="events">Events</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="partnerships">Partnerships</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleUploadFile}
                  disabled={!uploadTitle.trim() || !uploadCategory || !uploadFile}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium disabled:bg-slate-300 disabled:cursor-not-allowed"
                >
                  Upload
                </Button>
                <Button
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadTitle("");
                    setUploadCategory("");
                    setUploadFile(null);
                  }}
                  variant="outline"
                  className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-100"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SACBMBoardExco;
