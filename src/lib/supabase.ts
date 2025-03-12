
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rqeezagqtjmfliyuaytj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJxZWV6YWdxdGptZmxpeXVheXRqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3ODA0MzIsImV4cCI6MjA1NzM1NjQzMn0.pxsywLJHteT2YrkCRKCXmmjXkVwl1bCZp7g3mH_-P_U';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
