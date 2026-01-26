import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

export interface RelieRequest {
  id?: number;
  originator: string;
  location: string;
  help_type: string;
  evacuation_type: string;
  people: string;
  value: string;
  status: boolean;
  created_at?: string;
  edited_at?: string;
}

// Fetch all relief requests
export async function getRequests(): Promise<RelieRequest[]> {
  try {
    const { data, error } = await supabase
      .from('relief_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching requests:', error);
    return [];
  }
}

// Fetch recent requests (limited)
export async function getRecentRequests(limit = 5): Promise<RelieRequest[]> {
  try {
    const { data, error } = await supabase
      .from('relief_requests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching recent requests:', error);
    return [];
  }
}

// Create a new relief request
export async function createRequest(request: Omit<RelieRequest, 'id' | 'created_at' | 'edited_at'>): Promise<RelieRequest | null> {
  try {
    const { data, error } = await supabase
      .from('relief_requests')
      .insert([request])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating request:', error);
    return null;
  }
}

// Update a relief request
export async function updateRequest(id: number, updates: Partial<RelieRequest>): Promise<RelieRequest | null> {
  try {
    const { data, error } = await supabase
      .from('relief_requests')
      .update({ ...updates, edited_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating request:', error);
    return null;
  }
}

// Delete a relief request
export async function deleteRequest(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('relief_requests')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting request:', error);
    return false;
  }
}

// Get metrics for dashboard
export async function getMetrics() {
  try {
    const { data, error } = await supabase
      .from('relief_requests')
      .select('*');

    if (error) throw error;

    const totalRequests = data?.length || 0;
    const metRequests = data?.filter((r: RelieRequest) => r.status === true).length || 0;
    const pendingRequests = data?.filter((r: RelieRequest) => r.status === false).length || 0;
    const partiallyMet = 0; // Based on your schema, you may want to add a separate column for this

    return {
      totalRequests,
      metRequests,
      pendingRequests,
      partiallyMet,
    };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return {
      totalRequests: 0,
      metRequests: 0,
      pendingRequests: 0,
      partiallyMet: 0,
    };
  }
}

// Subscribe to real-time changes
export function subscribeToRequests(callback: (request: RelieRequest) => void) {
  const subscription = supabase
    .from('relief_requests')
    .on('*', (payload) => {
      callback(payload.new);
    })
    .subscribe();

  return subscription;
}
