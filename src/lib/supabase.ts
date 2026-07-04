import { createClient } from "@supabase/supabase-js";


const supabaseUrl =
"https://vcawfjxcvnfxzuwfwnoz.supabase.co";


const supabaseAnonKey =
"sb_publishable_kzJztJcAJ9wZSSzR8RvVDw_2JCUs62b";



export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {

    auth: {

      persistSession: true,

      autoRefreshToken: true,

      detectSessionInUrl: true,

    },

  }
);