import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nsimaellgaargjljpimc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zaW1hZWxsZ2FhcmdqbGpwaW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI0MDIwMTcsImV4cCI6MjA1Nzk3ODAxN30.e_U--aTpfaNXEjBJ2Nifr0n0Dypvy9qNcWzRzJJiKVs';

const productionUrl = 'https://splioqurpro.vercel.app';
const developmentUrl = 'http://localhost:5173';
const redirectUrl = process.env.NODE_ENV === 'production' ? productionUrl : developmentUrl;

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit',
    storage: window.localStorage,
    storageKey: 'supabase.auth.token',
    debug: process.env.NODE_ENV === 'development'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=minimal'
    }
  },
  db: {
    schema: 'public'
  }
}); 