import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Mail, Phone, Building2, MapPin } from "lucide-react";
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

  // Filter members
  const filteredMembers = useMemo(() => {
    let result = MOCK_MEMBERS.filter((m) => m.id !== currentMember.id); // Exclude self

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
  }, [searchTerm, tierFilter, roleFilter, currentMember.id]);

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
      bronze: MOCK_MEMBERS.filter((m) => m.tier === MemberTier.BRONZE).length,
      gold: MOCK_MEMBERS.filter((m) => m.tier === MemberTier.GOLD).length,
      platinum: MOCK_MEMBERS.filter((m) => m.tier === MemberTier.PLATINUM).length,
    };
    return counts;
  };

  const counts = getTierCounts();

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Members Directory</h2>
        <p className="text-slate-600 text-sm mt-1">
          Connect with {MOCK_MEMBERS.length} chamber members
        </p>
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
        Showing {filteredMembers.length} of {MOCK_MEMBERS.length - 1} members
      </p>

      {/* Members Grid/List View */}
      {filteredMembers.length === 0 ? (
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
                <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-xl font-bold mx-auto mb-4">
                  {member.name.split(" ").map((n) => n[0]).join("")}
                </div>

                {/* Name */}
                <h3 className="text-lg font-semibold text-slate-900 text-center">{member.name}</h3>

                {/* Company */}
                <p className="text-sm text-slate-600 text-center mt-1 flex items-center justify-center gap-1">
                  <Building2 className="h-4 w-4" />
                  {member.company}
                </p>

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
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold">
                    {member.name.split(" ").map((n) => n[0]).join("")}
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
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SACBMMembers;
