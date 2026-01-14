import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Use service role to bypass RLS
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch a random member with their tier and visits
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select(`
        id,
        full_name,
        phone,
        email,
        avatar_url,
        city,
        brand_affinity,
        total_visits,
        total_points,
        last_visit_date,
        is_vip,
        status,
        member_tiers (
          tier_id,
          tiers (
            id,
            name,
            name_ar,
            color,
            min_visits
          )
        )
      `)
      .eq('status', 'active')
      .order('total_visits', { ascending: false })
      .limit(1)
      .single();

    if (memberError) {
      console.error('Error fetching member:', memberError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch member', details: memberError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!member) {
      return new Response(
        JSON.stringify({ error: 'No member found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch recent visits for this member
    const { data: visits, error: visitsError } = await supabase
      .from('visits')
      .select(`
        id,
        brand,
        visit_datetime,
        location_id,
        locations (
          name,
          name_ar,
          city
        )
      `)
      .eq('member_id', member.id)
      .eq('is_voided', false)
      .order('visit_datetime', { ascending: false })
      .limit(10);

    if (visitsError) {
      console.error('Error fetching visits:', visitsError);
    }

    // Transform the data to match expected format
    const memberTier = member.member_tiers as any[];
    const tierData = memberTier?.[0]?.tiers as { id: string; name: string; color: string } | undefined;
    
    const transformedMember = {
      id: member.id,
      name: member.full_name,
      phone: member.phone,
      email: member.email,
      avatarUrl: member.avatar_url,
      city: member.city,
      favoriteBrand: member.brand_affinity || 'noir',
      totalVisits: member.total_visits || 0,
      totalPoints: member.total_points || 0,
      lastVisit: member.last_visit_date ? new Date(member.last_visit_date) : new Date(),
      isVIP: member.is_vip || false,
      status: member.status,
      tierName: tierData?.name || 'Bronze',
      tierColor: tierData?.color || '#CD7F32',
      visits: (visits || []).map((v: any) => ({
        id: v.id,
        brand: v.brand,
        date: new Date(v.visit_datetime),
        location: v.locations?.name || 'Unknown Location',
      })),
    };

    return new Response(
      JSON.stringify({ member: transformedMember }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
