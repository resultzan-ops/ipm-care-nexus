import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Max-Age': '86400',
}


interface PromoteRequest {
  user_id: string;
  email: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }


  try {
    console.log('Starting promote-super-admin function...');

    // Parse request
    const { user_id, email }: PromoteRequest = await req.json();
    console.log('Request data:', { user_id, email });

    // Validate target email
    const TARGET_EMAIL = 'dayax19@gmail.com';
    if (email?.toLowerCase() !== TARGET_EMAIL.toLowerCase()) {
      console.log('Invalid email:', email);
      throw new Error(`Only ${TARGET_EMAIL} can be promoted to super admin`);
    }

    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );

    console.log('Checking existing profile...');
    
    // Check if profile exists
    const { data: existingProfile, error: checkError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking profile:', checkError);
      throw checkError;
    }

    console.log('Existing profile:', existingProfile);

    if (existingProfile) {
      // Update existing profile
      console.log('Updating existing profile to super_admin...');
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ 
          role: 'super_admin',
          nama_lengkap: existingProfile.nama_lengkap || email 
        })
        .eq('user_id', user_id);

      if (updateError) {
        console.error('Error updating profile:', updateError);
        throw updateError;
      }
      console.log('Profile updated successfully');
    } else {
      // Create new profile
      console.log('Creating new super_admin profile...');
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({ 
          user_id, 
          nama_lengkap: email,
          role: 'super_admin'
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        throw insertError;
      }
      console.log('Profile created successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Successfully promoted to super_admin' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error) {
    console.error('Promotion error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to promote user' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    );
  }
});