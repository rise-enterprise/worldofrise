import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { phone, fullName } = await req.json();

    // Validate inputs
    if (!phone || typeof phone !== 'string' || phone.trim().length < 5) {
      return new Response(JSON.stringify({ error: 'Valid phone number required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      return new Response(JSON.stringify({ error: 'Valid full name required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Check if this user already has a member_auth entry
    const { data: existingAuth } = await supabaseAdmin
      .from('member_auth')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existingAuth) {
      return new Response(JSON.stringify({ error: 'Member account already exists' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const sanitizedPhone = phone.trim();
    const sanitizedName = fullName.trim().substring(0, 200);

    // Check if member already exists with this phone
    const { data: existingMember } = await supabaseAdmin
      .from('members')
      .select('id')
      .eq('phone', sanitizedPhone)
      .maybeSingle();

    let memberId: string;

    if (existingMember) {
      memberId = existingMember.id;
    } else {
      const { data: newMember, error: memberError } = await supabaseAdmin
        .from('members')
        .insert({
          full_name: sanitizedName,
          phone: sanitizedPhone,
          email: user.email,
          city: 'doha',
          brand_affinity: 'both',
          status: 'active',
        })
        .select('id')
        .single();

      if (memberError) {
        console.error('Failed to create member:', memberError);
        return new Response(JSON.stringify({ error: 'Failed to create member profile' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      memberId = newMember.id;
    }

    // Create member_auth entry
    const { error: authLinkError } = await supabaseAdmin
      .from('member_auth')
      .insert({
        user_id: user.id,
        phone: sanitizedPhone,
        member_id: memberId,
      });

    if (authLinkError) {
      console.error('Failed to link member auth:', authLinkError);
      return new Response(JSON.stringify({ error: 'Failed to link account' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, memberId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in create-member:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
