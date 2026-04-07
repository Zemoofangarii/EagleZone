import { supabase } from "@/integrations/supabase/client";
import type { UserProfile, UserRole } from "@/types/database";

export async function signUp(email: string, password: string, fullName?: string) {
  const redirectUrl = `${window.location.origin}/`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: {
        full_name: fullName,
      },
    },
  });

  return { data, error };
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  return { user, error };
}

export async function getCurrentSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  return { session, error };
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }

  return data;
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }

  return data?.map((ur: any) => ur.role).filter(Boolean) || [];
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes("admin");
}

export async function checkIsStaff(userId: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.includes("admin") || roles.includes("manager");
}
