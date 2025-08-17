import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/lib/permissions";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  role: string; // Use string to match database schema
  company_id?: string;
  company_name?: string;
  company_type?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

export function useSecureUserData() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Only Super Admin can fetch all users
      if (profile?.role !== 'super_admin') {
        throw new Error('Unauthorized: Only Super Admin can access user data');
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          tenants:company_id(
            nama_perusahaan,
            company_type
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers: User[] = data?.map(profile => ({
        id: profile.id,
        name: profile.nama_lengkap || profile.name,
        email: profile.name, // In this schema, name seems to store email
        phone: profile.no_hp || profile.phone,
        avatar_url: profile.avatar_url,
        role: profile.role, // Keep as string from database
        company_id: profile.company_id,
        company_name: (profile.tenants as any)?.nama_perusahaan,
        company_type: (profile.tenants as any)?.company_type,
        is_active: profile.is_active,
        created_at: profile.created_at,
      })) || [];

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch user data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      if (profile?.role !== 'super_admin') {
        throw new Error('Unauthorized: Only Super Admin can update roles');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole as any }) // Type cast to handle role enum
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));

      toast({
        title: "Success",
        description: "User role updated successfully",
      });

    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      if (profile?.role !== 'super_admin') {
        throw new Error('Unauthorized: Only Super Admin can change user status');
      }

      const { error } = await supabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) throw error;

      // Update local state
      setUsers(users.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      ));

      toast({
        title: "Success",
        description: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      });

    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (profile?.role === 'super_admin') {
      fetchUsers();
    }
  }, [profile]);

  return {
    users,
    loading,
    fetchUsers,
    updateUserRole,
    toggleUserStatus
  };
}