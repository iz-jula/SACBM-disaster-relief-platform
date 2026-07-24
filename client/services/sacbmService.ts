import { Member, MemberRole, MemberTier } from "@shared/api";
import { supabase } from "@/services/supabaseService";

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

export async function signInSacbmMember(email: string, password: string): Promise<Member> {
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (authError || !authData.user) {
    throw new Error(authError?.message || "Invalid email or password.");
  }

  const { data: memberRow, error: memberError } = await supabase
    .from("sacbm_members")
    .select("*")
    .eq("user_id", authData.user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (memberError) {
    await supabase.auth.signOut();
    throw new Error("We could not load your chamber profile. Please try again.");
  }

  if (!memberRow) {
    await supabase.auth.signOut();
    throw new Error("Your account is not linked to an active SACBM member profile.");
  }

  return toMember(memberRow as SacbmMemberRow);
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
