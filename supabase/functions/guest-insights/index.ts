import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Visit {
  date: string;
  brand: string;
  country: string;
  location: string;
}

interface GuestData {
  id: string;
  name: string;
  email: string;
  country: string;
  tier: string;
  totalVisits: number;
  lifetimeVisits: number;
  lastVisit: string;
  joinedAt: string;
  favoriteBrand: string;
  visits: Visit[];
  tags: string[];
}

function analyzePatterns(visits: Visit[]) {
  if (visits.length < 2) {
    return {
      visitFrequency: 'stable' as const,
      averageDaysBetweenVisits: 0,
      preferredDayOfWeek: 'Unknown',
      preferredTimeSlot: 'evening' as const,
    };
  }

  const sortedVisits = [...visits].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Calculate average days between visits
  let totalDays = 0;
  for (let i = 0; i < sortedVisits.length - 1; i++) {
    const diff = new Date(sortedVisits[i].date).getTime() - new Date(sortedVisits[i + 1].date).getTime();
    totalDays += diff / (1000 * 60 * 60 * 24);
  }
  const averageDaysBetweenVisits = Math.round(totalDays / (sortedVisits.length - 1));

  // Determine frequency trend
  const recentVisits = sortedVisits.slice(0, Math.min(5, sortedVisits.length));
  const olderVisits = sortedVisits.slice(Math.min(5, sortedVisits.length));
  
  let recentAvg = 0;
  let olderAvg = 0;
  
  if (recentVisits.length > 1) {
    for (let i = 0; i < recentVisits.length - 1; i++) {
      recentAvg += (new Date(recentVisits[i].date).getTime() - new Date(recentVisits[i + 1].date).getTime()) / (1000 * 60 * 60 * 24);
    }
    recentAvg /= recentVisits.length - 1;
  }
  
  if (olderVisits.length > 1) {
    for (let i = 0; i < olderVisits.length - 1; i++) {
      olderAvg += (new Date(olderVisits[i].date).getTime() - new Date(olderVisits[i + 1].date).getTime()) / (1000 * 60 * 60 * 24);
    }
    olderAvg /= olderVisits.length - 1;
  }

  let visitFrequency: 'increasing' | 'stable' | 'declining' = 'stable';
  if (recentAvg < olderAvg * 0.8) visitFrequency = 'increasing';
  else if (recentAvg > olderAvg * 1.2) visitFrequency = 'declining';

  // Find preferred day
  const dayCount: Record<string, number> = {};
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  visits.forEach(v => {
    const day = days[new Date(v.date).getDay()];
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  const preferredDayOfWeek = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Friday';

  return {
    visitFrequency,
    averageDaysBetweenVisits,
    preferredDayOfWeek,
    preferredTimeSlot: 'evening' as const,
  };
}

function calculateChurnRisk(guest: GuestData): { risk: string; score: number } {
  const lastVisitDate = new Date(guest.lastVisit);
  const daysSinceLastVisit = Math.floor((Date.now() - lastVisitDate.getTime()) / (1000 * 60 * 60 * 24));
  
  let score = 0;
  
  // Days since last visit (0-40 points)
  if (daysSinceLastVisit > 90) score += 40;
  else if (daysSinceLastVisit > 60) score += 30;
  else if (daysSinceLastVisit > 30) score += 20;
  else if (daysSinceLastVisit > 14) score += 10;

  // Visit frequency trend (0-30 points)
  const patterns = analyzePatterns(guest.visits);
  if (patterns.visitFrequency === 'declining') score += 30;
  else if (patterns.visitFrequency === 'stable') score += 10;

  // Total visits consideration (0-30 points) - new guests are more at risk
  if (guest.totalVisits < 3) score += 30;
  else if (guest.totalVisits < 5) score += 20;
  else if (guest.totalVisits < 10) score += 10;

  let risk: string;
  if (score >= 70) risk = 'critical';
  else if (score >= 50) risk = 'high';
  else if (score >= 30) risk = 'medium';
  else risk = 'low';

  return { risk, score };
}

function generateRecommendations(guest: GuestData, churnRisk: string): string[] {
  const recommendations: string[] = [];
  const daysSinceLastVisit = Math.floor((Date.now() - new Date(guest.lastVisit).getTime()) / (1000 * 60 * 60 * 24));

  if (churnRisk === 'critical' || churnRisk === 'high') {
    recommendations.push('Send personalized re-engagement message immediately');
    recommendations.push('Offer exclusive experience invitation');
  }

  if (guest.favoriteBrand === 'noir') {
    recommendations.push('Invite to upcoming SASSO culinary experience for cross-brand discovery');
  } else if (guest.favoriteBrand === 'sasso') {
    recommendations.push('Invite to NOIR literary evening for cross-brand discovery');
  }

  if (daysSinceLastVisit > 30) {
    recommendations.push('Consider personal call from host or manager');
  }

  if (guest.tier === 'inner-circle' || guest.tier === 'black') {
    recommendations.push('Arrange chef table experience or exclusive tasting');
  }

  if (guest.tags.includes('VIP') || guest.tags.includes('Influencer')) {
    recommendations.push('Prioritize with white-glove re-engagement approach');
  }

  return recommendations.slice(0, 4);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify the JWT token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Authenticated user:', user.id);

    const { guest } = await req.json() as { guest: GuestData };
    
    if (!guest) {
      return new Response(JSON.stringify({ error: 'Guest data required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing guest:', guest.name);

    const patterns = analyzePatterns(guest.visits);
    const { risk: churnRisk, score: churnScore } = calculateChurnRisk(guest);
    const recommendations = generateRecommendations(guest, churnRisk);

    // Generate personalized message using Lovable AI
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const brandTone = guest.favoriteBrand === 'noir' 
      ? 'poetic, literary, refined, whispering luxury with elegance and depth'
      : 'Italian fine dining confidence, warm, assured, celebrating craftsmanship and heritage';

    const daysSinceLastVisit = Math.floor((Date.now() - new Date(guest.lastVisit).getTime()) / (1000 * 60 * 60 * 24));

    const prompt = `Generate a luxury re-engagement message for a high-end hospitality guest.

GUEST PROFILE:
- Name: ${guest.name}
- Tier: ${guest.tier}
- Days since last visit: ${daysSinceLastVisit}
- Favorite brand: ${guest.favoriteBrand === 'noir' ? 'NOIR Café' : 'SASSO Italian Fine Dining'}
- Total visits: ${guest.totalVisits}
- Location: ${guest.country === 'qatar' ? 'Doha, Qatar' : 'Riyadh, Saudi Arabia'}
- Tags: ${guest.tags.join(', ') || 'None'}

BRAND TONE: ${brandTone}

REQUIREMENTS:
- Never use discount language or promotional offers
- Frame everything as privileges and exclusive experiences
- Be warm but sophisticated, never salesy
- Keep it concise (2-3 sentences max)
- Make it feel personal and memorable

Generate ONLY the message body, no subject line or greeting.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a luxury hospitality concierge crafting personalized messages for distinguished guests. Your tone is elegant, refined, and never promotional.' },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate message');
    }

    const aiData = await response.json();
    const messageBody = aiData.choices[0]?.message?.content || 'We have missed your presence and look forward to welcoming you back.';

    const insight = {
      guestId: guest.id,
      patterns,
      churnRisk,
      churnScore,
      recommendations,
      suggestedMessage: {
        subject: guest.favoriteBrand === 'noir' 
          ? 'The quiet corners await...' 
          : 'Your table awaits at SASSO',
        body: messageBody.trim(),
        tone: guest.favoriteBrand === 'noir' ? 'noir' : 'sasso',
        channel: 'email',
      },
      generatedAt: new Date().toISOString(),
    };

    console.log('Generated insight for:', guest.name, 'Churn risk:', churnRisk);

    return new Response(JSON.stringify(insight), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in guest-insights function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
