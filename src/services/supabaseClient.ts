import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://yfnbyuwbxqvyqqankmlt.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_36mKWfLllgdWr5ZSmArIPg__PHDVS47';
export const BUCKET_NAME = 'media_belajar';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
