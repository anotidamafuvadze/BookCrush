// filepath: /Users/anotidamafuvadze/Desktop/Book Crush Website/book-crush/src/services/supabase/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabaseUrl = 'https://lkqgruvexwesvppoypwz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrcWdydXZleHdlc3ZwcG95cHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzNDkzNjEsImV4cCI6MjA3NDkyNTM2MX0.nnD2Y5X9HLs96QJqN_qsV-VO0U61iW_Soxji8_BQnDQ';

if (!supabaseUrl) {
    throw new Error('Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_URL');
}

if (!supabaseKey) {
    throw new Error('Missing Supabase environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseKey);