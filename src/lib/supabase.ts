import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://hnvrinqcfkcvjqomurly.supabase.co';
const supabaseAnonKey = 'sb_publishable_Dbc850KBzNCDbhVouN97Bw__RY60ALE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
