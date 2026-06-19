import localProvider from './localProvider.js';
import supabaseProvider from './supabaseProvider.js';

const useLocalStorage = process.env.LOCAL_UPLOADS?.toLowerCase() === 'true';
const storage = useLocalStorage ? localProvider : supabaseProvider;

if (useLocalStorage) {
  console.log('[Storage] Local filesystem provider enabled');
} else {
  console.log('[Storage] Supabase provider enabled');
}

export default storage;
