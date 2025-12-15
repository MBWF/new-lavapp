import type { User, UserRole } from '@/types/auth';
import { supabase } from '../client';
import type { UserRow } from '../types/database';

export const usersQueries = {
  login: async (email: string, password: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('password_hash', password)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    const userRow = data as UserRow;

    return {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRow.role as UserRole,
    };
  },

  getById: async (id: string): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error || !data) {
      return null;
    }

    const userRow = data as UserRow;

    return {
      id: userRow.id,
      name: userRow.name,
      email: userRow.email,
      role: userRow.role as UserRole,
    };
  },
};
