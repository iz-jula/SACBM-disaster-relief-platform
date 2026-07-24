import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { createSacbmMember, deleteSacbmMember, getSacbmMembers, setSacbmMemberActive, updateSacbmMember } from "@/services/sacbmService";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Mail, Phone, Building2, MapPin, UserPlus, Pencil, UserX, RotateCcw, Trash2 } from "lucide-react";
import { Member, MemberTier, MemberRole } from "@shared/api";

// Mock members data
const MOCK_MEMBERS: Member[] = [
  {
    id: "1",
    name: "João Silva",
    email: "joao@silva-industries.com",
    company: "Silva Industries",
    tier: MemberTier.PLATINUM,
    role: MemberRole.ADMIN,
    phone: "+258 84 123 4567",
    joinDate: "2020-01-15",
    isActive: true,
  },
  {
    id: "2",
    name: "Maria Santos",
    email: "maria@santos-commerce.com",
    company: "Santos Commerce",
    tier: MemberTier.GOLD,
    role: MemberRole.BOARD,
    phone: "+258 84 234 5678",
    joinDate: "2021-03-20",
    isActive: true,
  },
  {
    id: "3",
    name: "Pedro Costa",
    email: "pedro@costa-trading.com",
    company: "Costa Trading",
    tier: MemberTier.GOLD,
    role: MemberRole.EXCO,
    phone: "+258 84 345 6789",
    joinDate: "2022-05-10",
    isActive: true,
  },
  {
    id: "4",
    name: "Ana Ferreira",
    email: "ana@ferreira-logistics.com",
    company: "Ferreira Logistics",
    tier: MemberTier.BRONZE,
    role: MemberRole.MEMBER,
    phone: "+258 84 456 7890",
    joinDate: "2023-01-01",
    isActive: true,
  },
  {
    id: "5",
    name: "Carlos Mendes",
    email: "carlos@mendes-tech.com",
    company: "Mendes Technology Solutions",
    tier: MemberTier.PLATINUM,
    role: MemberRole.BOARD,
    phone: "+258 84 567 8901",
    joinDate: "2019-06-10",
    isActive: true,
  },
  {
    id: "6",
    name: "Rita Neves",
    email: "rita@neves-consulting.com",
    company: "Neves Consulting",
    tier: MemberTier.GOLD,
    role: MemberRole.MEMBER,
    phone: "+258 84 678 9012",
    joinDate: "2021-11-05",
    isActive: true,
  },
  {
    id: "7",
    name: "Marco Antunes",
    email: "marco@antunes-import.com",
    company: "Antunes Import/Export",
    tier: MemberTier.BRONZE,
    role: MemberRole.MEMBER,
    phone: "+258 84 789 0123",
    joinDate: "2023-08-20",
    isActive: true,
  },
  {
    id: "8",
    name: "Lucia Moreira",
    email: "lucia@moreira-events.com",
    company: "Moreira Events Management",
    tier: MemberTier.GOLD,
    role: MemberRole.MEMBER,
    phone: "+258 84 890 1234",
    joinDate: "2022-02-15",
    isActive: true,
  },
];

interface SACBMMembersProps {
  currentMember: Member;
}

const SACBMMembers: React.FC<SACBMMembersProps> = ({ currentMember }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [members, setMembers] = useState<Member[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState("");
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberSaving, setMemberSaving] = useState(false);
  const [memberSaveError, setMemberSaveError] = useState("");
  useEffect(() => {
    let cancelled = false;
    setMembersLoading(true);
    setMembersError("");

    getSacbmMembers()
      .then((loadedMembers) => {
        if (!cancelled) setMembers(loadedMembers);
      })
      .catch((error) => {
        if (!cancelled) setMembersError(error instanceof Error ? error.message : "We could not load the member directory.");
      })
      .finally(() => {
        if (!cancelled) setMembersLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const [memberForm, setMemberForm] = useState({
    firstName: "",
    surname: "",
    company: "",
    jobTitle: "",
    chamberTitle: "",
    email: "",
    phone: "",
    address: "",
    tier: MemberTier.BRONZE,
    role: MemberRole.MEMBER,
    isExco: false,
    isBoard: false,
  });


  // Filter members
  const filteredMembers = useMemo(() => {
    let result = members.filter((m) => m.id !== currentMember.id && m.isActive); // Exclude self and inactive members

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (m) =>
          m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          m.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Tier filter
    if (tierFilter !== "all") {
      result = result.filter((m) => m.tier === tierFilter);
    }

    // Role filter
    if (roleFilter !== "all") {
      result = result.filter((m) => m.role === roleFilter);
    }

    // Sort alphabetically by name
    result.sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [searchTerm, tierFilter, roleFilter, currentMember.id, members]);

  const getTierColor = (tier: MemberTier) => {
    const colors: Record<MemberTier, string> = {
      [MemberTier.BRONZE]: "bg-amber-50 text-amber-800 border-amber-200",
      [MemberTier.GOLD]: "bg-yellow-50 text-yellow-800 border-yellow-200",
      [MemberTier.PLATINUM]: "bg-cyan-50 text-cyan-800 border-cyan-200",
    };
    return colors[tier];
  };

  const getRoleColor = (role: MemberRole) => {
    const colors: Record<MemberRole, string> = {
      [MemberRole.ADMIN]: "bg-red-100 text-red-800",
      [MemberRole.EXCO]: "bg-purple-100 text-purple-800",
      [MemberRole.BOARD]: "bg-blue-100 text-blue-800",
      [MemberRole.MEMBER]: "bg-gray-100 text-gray-800",
    };
    return colors[role];
  };

  const getTierLabel = (tier: MemberTier) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  const getRoleLabel = (role: MemberRole) => {
    const labels: Record<MemberRole, string> = {
      [MemberRole.ADMIN]: "Admin",
      [MemberRole.EXCO]: "EXCO",
      [MemberRole.BOARD]: "Board",
      [MemberRole.MEMBER]: "Member",
    };
    return labels[role];
  };

  const getTierCounts = () => {
    const counts = {
      bronze: members.filter((m) => m.tier === MemberTier.BRONZE && m.isActive).length,
      gold: members.filter((m) => m.tier === MemberTier.GOLD && m.isActive).length,
      platinum: members.filter((m) => m.tier === MemberTier.PLATINUM && m.isActive).length,
    };
    return counts;
  };

  const counts = getTierCounts();

  const openMemberForm = (member?: Member) => {
    if (member) {
      setEditingMemberId(member.id);
      setMemberForm({
        firstName: member.firstName || member.name.split(" ")[0] || "",
        surname: member.surname || member.name.split(" ").slice(1).join(" "),
        company: member.company,
        jobTitle: member.jobTitle || "",
        chamberTitle: member.chamberTitle || "",
        email: member.email,
        phone: member.phone || "",
        address: member.address || "",
        tier: member.tier,
        role: member.role,
        isExco: member.isExco || member.role === MemberRole.EXCO,
        isBoard: member.isBoard || member.role === MemberRole.BOARD,
      });
    } else {
      setEditingMemberId(null);
      setMemberForm({ firstName: "", surname: "", company: "", jobTitle: "", chamberTitle: "", email: "", phone: "", address: "", tier: MemberTier.BRONZE, role: MemberRole.MEMBER, isExco: false, isBoard: false });
    }
    setMemberSaveError("");
    setShowMemberForm(true);
  };

  const saveMember = async () => {
    if (!memberForm.firstName.trim() || !memberForm.surname.trim() || !memberForm.company.trim() || !memberForm.email.trim()) return;

    if (!editingMemberId) {
      setMemberSaving(true);
      setMemberSaveError("");
      try {
        const createdMember = await createSacbmMember(memberForm);
        setMembers((current) => [...current, createdMember]);
        setShowMemberForm(false);
      } catch (error) {
        setMemberSaveError(error instanceof Error ? error.message : "Could not register the member.");
      } finally {
        setMemberSaving(false);
      }
      return;
    }

    setMemberSaving(true);
    setMemberSaveError("");
    try {
      const updatedMember = await updateSacbmMember({ id: editingMemberId, ...memberForm });
      setMembers((current) => current.map((item) => item.id === updatedMember.id ? updatedMember : item));
      setShowMemberForm(false);
    } catch (error) {
      setMemberSaveError(error instanceof Error ? error.message : "Could not update the member.");
    } finally {
      setMemberSaving(false);
    }
  };

  const toggleMemberStatus = async (memberId: string) => {
    const existingMember = members.find((item) => item.id === memberId);
    if (!existingMember) return;

    setMembersError("");
    try {
      const updatedMember = await setSacbmMemberActive(memberId, !existingMember.isActive);
      setMembers((current) => current.map((item) => item.id === updatedMember.id ? updatedMember : item));
    } catch (error) {
      setMembersError(error instanceof Error ? error.message : "We could not update the member status.");
    }
  };

  const deleteMember = async (memberId: string) => {
    const member = members.find((item) => item.id === memberId);
    if (!member || !window.confirm(`Permanently delete ${member.name} from the directory?`)) return;

    setMembersError("");
    try {
      await deleteSacbmMember(memberId);
      setMembers((current) => current.filter((item) => item.id !== memberId));
    } catch (error) {
      setMembersError(error instanceof Error ? error.message : "We could not permanently delete the member.");
    }
  };

  const inactiveMembers = members.filter((member) => !member.isActive);

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Members Directory</h2>
          <p className="text-slate-600 text-sm mt-1">
            Connect with {members.filter((item) => item.isActive).length} active chamber members
          </p>
        </div>
        {membersError && <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{membersError}</p>}
        {currentMember.role === MemberRole.ADMIN && (
          <button onClick={() => openMemberForm()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700">
            <UserPlus className="h-4 w-4" />
            Add member
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-700 mb-2">{counts.bronze}</div>
              <p className="text-sm text-slate-600">Bronze Members</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-700 mb-2">{counts.gold}</div>
              <p className="text-sm text-slate-600">Gold Members</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-700 mb-2">{counts.platinum}</div>
              <p className="text-sm text-slate-600">Platinum Members</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6 border-0 shadow-sm">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by name or company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Tier</label>
              <Select value={tierFilter} onValueChange={setTierFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="bronze">Bronze</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="platinum">Platinum</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-2">Role</label>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="exco">EXCO</SelectItem>
                  <SelectItem value="board">Board</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "grid"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                List
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <p className="text-sm text-slate-600 mb-4">
        Showing {filteredMembers.length} of {members.filter((item) => item.isActive).length - 1} members
      </p>

      {/* Members Grid/List View */}
      {membersLoading ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="py-12 text-center text-sm text-slate-500">Loading member directory...</CardContent>
        </Card>
      ) : filteredMembers.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-12 pb-12 text-center">
            <Building2 className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">No members found</p>
            <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters</p>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <CardContent className="p-6">
                {/* Member Avatar */}
                <div className="flex items-center justify-center w-16 h-16 overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-xl font-bold mx-auto mb-4">
                  {member.profileImage ? <img src={member.profileImage} alt={member.name} className="h-full w-full object-cover" /> : member.name.split(" ").map((n) => n[0]).join("")}
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold text-slate-900 text-center">{member.name}</h3>

                {/* Company */}
                <p className="text-sm text-slate-600 text-center mt-1 flex items-center justify-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {member.company}
                </p>
                {member.chamberTitle && (
                  <p className="mt-2 text-center text-xs font-medium text-emerald-700">{member.chamberTitle}</p>
                )}
                {member.funFact && (
                  <p className="mt-2 text-center text-xs italic text-slate-500">“{member.funFact}”</p>
                )}

                {/* Badges */}
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  <Badge
                    className={`text-xs ${getTierColor(member.tier)}`}
                    variant="outline"
                  >
                    {getTierLabel(member.tier)}
                  </Badge>
                  <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                    {getRoleLabel(member.role)}
                  </Badge>
                </div>

                {/* Contact Info */}
                <div className="space-y-2 mt-4 pt-4 border-t border-slate-200">
                  <a
                    href={`mailto:${member.email}`}
                    className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{member.email}</span>
                  </a>
                  {member.phone && (
                    <a
                      href={`tel:${member.phone}`}
                      className="flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      <Phone className="h-4 w-4" />
                      {member.phone}
                    </a>
                  )}
                </div>

                {/* Join Date */}
                <p className="text-xs text-slate-500 text-center mt-4">
                  Member since {new Date(member.joinDate).getFullYear()}
                </p>
                {currentMember.role === MemberRole.ADMIN && (
                  <div className="mt-4 flex gap-2 border-t border-slate-100 pt-4">
                    <button onClick={() => openMemberForm(member)} className="flex-1 rounded-md border border-slate-200 px-2 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"><Pencil className="mr-1 inline h-3.5 w-3.5" />Edit</button>
                    <button onClick={() => toggleMemberStatus(member.id)} className="flex-1 rounded-md border border-red-100 px-2 py-2 text-xs font-medium text-red-600 hover:bg-red-50"><UserX className="mr-1 inline h-3.5 w-3.5" />Deactivate</button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMembers.map((member) => (
            <Card key={member.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-12 h-12 overflow-hidden rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold">
                    {member.profileImage ? <img src={member.profileImage} alt={member.name} className="h-full w-full object-cover" /> : member.name.split(" ").map((n) => n[0]).join("")}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{member.name}</h3>
                        <p className="text-sm text-slate-600 flex items-center gap-1 mt-1">
                          <Building2 className="h-4 w-4" />
                          {member.company}
                        </p>
                        {member.chamberTitle && (
                          <p className="mt-1 text-xs font-medium text-emerald-700">{member.chamberTitle}</p>
                        )}
                        {member.funFact && (
                          <p className="mt-1 text-xs italic text-slate-500">“{member.funFact}”</p>
                        )}
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          <Badge
                            className={`text-xs ${getTierColor(member.tier)}`}
                            variant="outline"
                          >
                            {getTierLabel(member.tier)}
                          </Badge>
                          <Badge className={`text-xs ${getRoleColor(member.role)}`}>
                            {getRoleLabel(member.role)}
                          </Badge>
                        </div>
                      </div>

                      {/* Contact Actions */}
                      <div className="flex items-center gap-2">
                        <a
                          href={`mailto:${member.email}`}
                          className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                          title="Send email"
                        >
                          <Mail className="h-5 w-5" />
                        </a>
                        {member.phone && (
                          <a
                            href={`tel:${member.phone}`}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-600 transition-colors"
                            title="Call"
                          >
                            <Phone className="h-5 w-5" />
                          </a>
                        )}
                        {currentMember.role === MemberRole.ADMIN && (
                          <>
                            <button onClick={() => openMemberForm(member)} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100" title="Edit member"><Pencil className="h-5 w-5" /></button>
                            <button onClick={() => toggleMemberStatus(member.id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Deactivate member"><UserX className="h-5 w-5" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {currentMember.role === MemberRole.ADMIN && inactiveMembers.length > 0 && (
        <Card className="mt-8 border border-slate-200 shadow-sm">
          <CardContent className="p-5">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-base font-semibold text-slate-900">Inactive members</h3>
                <p className="mt-1 text-sm text-slate-500">Deactivated members are hidden from the directory but can still be restored or removed.</p>
              </div>
              <Badge variant="outline" className="border-slate-200 text-slate-600">{inactiveMembers.length}</Badge>
            </div>
            <div className="space-y-2">
              {inactiveMembers.map((member) => (
                <div key={member.id} className="flex flex-col gap-3 rounded-lg border border-slate-100 bg-slate-50/70 p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{member.name}</p>
                    <p className="truncate text-sm text-slate-500">{member.company} · {member.email}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="outline" size="sm" onClick={() => toggleMemberStatus(member.id)} className="border-emerald-200 text-emerald-700 hover:bg-emerald-50">
                      <RotateCcw className="h-4 w-4" />
                      Reactivate
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => deleteMember(member.id)} className="border-red-200 text-red-700 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                      Permanently delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {showMemberForm && currentMember.role === MemberRole.ADMIN && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto border-0 shadow-2xl">
            <CardContent className="p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-light tracking-tight text-slate-900">{editingMemberId ? "Edit member" : "Add member"}</h3>
                  <p className="mt-1 text-sm text-slate-600">Capture the member profile and SACBM governance responsibilities.</p>
                </div>
                <button onClick={() => setShowMemberForm(false)} className="rounded-md px-2 py-1 text-xl text-slate-400 hover:bg-slate-100">×</button>
              </div>
              {memberSaveError && (
                <p className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{memberSaveError}</p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input placeholder="First name" value={memberForm.firstName} onChange={(event) => setMemberForm((form) => ({ ...form, firstName: event.target.value }))} />
                <Input placeholder="Surname" value={memberForm.surname} onChange={(event) => setMemberForm((form) => ({ ...form, surname: event.target.value }))} />
                <Input placeholder="Company" value={memberForm.company} onChange={(event) => setMemberForm((form) => ({ ...form, company: event.target.value }))} />
                <Input placeholder="Role within company" value={memberForm.jobTitle} onChange={(event) => setMemberForm((form) => ({ ...form, jobTitle: event.target.value }))} />
                <Input type="email" placeholder="Email" value={memberForm.email} onChange={(event) => setMemberForm((form) => ({ ...form, email: event.target.value }))} />
                <Input placeholder="Phone" value={memberForm.phone} onChange={(event) => setMemberForm((form) => ({ ...form, phone: event.target.value }))} />
                <textarea placeholder="Address" value={memberForm.address} onChange={(event) => setMemberForm((form) => ({ ...form, address: event.target.value }))} rows={2} className="resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 sm:col-span-2" />
              </div>
              <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-slate-900">SACBM profile</h4>
                  <p className="mt-1 text-xs text-slate-600">Add the member’s chamber title and governance responsibilities.</p>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <select aria-label="Membership tier" value={memberForm.tier} onChange={(event) => setMemberForm((form) => ({ ...form, tier: event.target.value as MemberTier }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
                    <option value={MemberTier.BRONZE}>Bronze membership</option>
                    <option value={MemberTier.GOLD}>Gold membership</option>
                    <option value={MemberTier.PLATINUM}>Platinum membership</option>
                  </select>
                  <Input placeholder="Chamber title (e.g. CEO of SACBM)" value={memberForm.chamberTitle} onChange={(event) => setMemberForm((form) => ({ ...form, chamberTitle: event.target.value }))} />
                  <select aria-label="Role within SACBM" value={memberForm.role} onChange={(event) => setMemberForm((form) => ({ ...form, role: event.target.value as MemberRole }))} className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700">
                    <option value={MemberRole.MEMBER}>Member</option>
                    <option value={MemberRole.BOARD}>Board</option>
                    <option value={MemberRole.EXCO}>EXCO</option>
                    <option value={MemberRole.ADMIN}>Admin</option>
                  </select>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 border-t border-emerald-100 pt-4">
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={memberForm.isExco} onChange={(event) => setMemberForm((form) => ({ ...form, isExco: event.target.checked }))} className="accent-emerald-600" /> EXCO member</label>
                  <label className="flex items-center gap-2 text-sm text-slate-700"><input type="checkbox" checked={memberForm.isBoard} onChange={(event) => setMemberForm((form) => ({ ...form, isBoard: event.target.checked }))} className="accent-emerald-600" /> Board member</label>
                </div>
              </div>
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setShowMemberForm(false)} className="border-slate-300">Cancel</Button>
                <Button onClick={saveMember} disabled={memberSaving || !memberForm.firstName.trim() || !memberForm.surname.trim() || !memberForm.company.trim() || !memberForm.email.trim()} className="bg-emerald-600 text-white hover:bg-emerald-700 disabled:bg-slate-300">{memberSaving ? "Registering..." : editingMemberId ? "Save changes" : "Add member"}</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default SACBMMembers;
