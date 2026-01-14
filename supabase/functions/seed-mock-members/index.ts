import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Qatari/Arabic name pools
const maleFirstNames = [
  'أحمد', 'محمد', 'خالد', 'عبدالله', 'فهد', 'سلطان', 'ناصر', 'سعود', 'تركي', 'عبدالرحمن',
  'حمد', 'يوسف', 'علي', 'إبراهيم', 'عمر', 'مبارك', 'جاسم', 'راشد', 'سالم', 'بندر',
  'فيصل', 'نايف', 'ماجد', 'طلال', 'وليد', 'بدر', 'سعد', 'منصور', 'عبدالعزيز', 'زايد',
  'حسن', 'حسين', 'طارق', 'كريم', 'عادل', 'هاني', 'رامي', 'سامي', 'ياسر', 'باسم'
];

const femaleFirstNames = [
  'نورة', 'فاطمة', 'مريم', 'عائشة', 'سارة', 'هند', 'لطيفة', 'موزة', 'شيخة', 'علياء',
  'دانة', 'ريم', 'ميثاء', 'شما', 'حصة', 'ميرا', 'لولوة', 'مها', 'أمل', 'روضة',
  'جواهر', 'بثينة', 'خولة', 'منيرة', 'وفاء', 'سلمى', 'ياسمين', 'رنا', 'هالة', 'سمية'
];

const familyNames = [
  'آل ثاني', 'الثاني', 'المري', 'الهاجري', 'الكواري', 'الكبيسي', 'المهندي', 'النعيمي',
  'السليطي', 'الدوسري', 'البوعينين', 'الخاطر', 'المعضادي', 'السعيد', 'الحمادي',
  'العطية', 'البوسعيد', 'الفضالة', 'الجفيري', 'السادة', 'المناعي', 'البوفلاسة',
  'الأنصاري', 'العمادي', 'الخليفي', 'الغانم', 'الجيدة', 'البادر', 'الملا', 'القحطاني',
  'العتيبي', 'الشمري', 'الحربي', 'المطيري', 'الزهراني', 'الغامدي', 'البلوي', 'الرشيدي',
  'السبيعي', 'العنزي', 'الشهراني', 'القرني', 'الأحمدي', 'البريكي', 'الهتمي', 'المسلماني'
];

const salutations = ['Mr.', 'Mrs.', 'Ms.', 'Dr.', 'Eng.', 'Sheikh', 'Sheikha', null];

function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function weightedRandom(weights: number[]): number {
  const total = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * total;
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i];
    if (random <= 0) return i;
  }
  return weights.length - 1;
}

function generateUniquePhone(isQatar: boolean): string {
  // Generate a truly unique phone using random digits
  const randomNum = Math.floor(Math.random() * 89999999) + 10000000; // 8 random digits
  const timestamp = Date.now() % 10000; // Last 4 digits of timestamp
  
  if (isQatar) {
    return `+974${randomNum}`;
  } else {
    return `+966${randomNum}`;
  }
}

function generateEmail(firstName: string, index: number): string | null {
  // 60% have email
  if (Math.random() > 0.6) return null;
  
  const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com'];
  const translitMap: Record<string, string> = {
    'أحمد': 'ahmed', 'محمد': 'mohammed', 'خالد': 'khalid', 'عبدالله': 'abdullah',
    'فهد': 'fahad', 'سلطان': 'sultan', 'ناصر': 'nasser', 'سعود': 'saud',
    'تركي': 'turki', 'عبدالرحمن': 'abdulrahman', 'حمد': 'hamad', 'يوسف': 'youssef',
    'علي': 'ali', 'إبراهيم': 'ibrahim', 'عمر': 'omar', 'مبارك': 'mubarak',
    'جاسم': 'jassim', 'راشد': 'rashid', 'سالم': 'salem', 'بندر': 'bandar',
    'نورة': 'noura', 'فاطمة': 'fatima', 'مريم': 'mariam', 'عائشة': 'aisha',
    'سارة': 'sara', 'هند': 'hind', 'لطيفة': 'latifa', 'موزة': 'moza',
    'شيخة': 'sheikha', 'علياء': 'alia', 'دانة': 'dana', 'ريم': 'reem'
  };
  
  const first = translitMap[firstName] || 'member';
  const domain = randomChoice(domains);
  const randSuffix = Math.floor(Math.random() * 999999);
  return `${first}.${randSuffix}@${domain}`;
}

function generateBirthday(): string | null {
  if (Math.random() > 0.6) return null;
  
  const year = 1960 + Math.floor(Math.random() * 45);
  const month = 1 + Math.floor(Math.random() * 12);
  const day = 1 + Math.floor(Math.random() * 28);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateVisits(): number {
  const weights = [40, 25, 20, 10, 5];
  const bucket = weightedRandom(weights);
  
  switch (bucket) {
    case 0: return Math.floor(Math.random() * 11);
    case 1: return 11 + Math.floor(Math.random() * 10);
    case 2: return 21 + Math.floor(Math.random() * 15);
    case 3: return 36 + Math.floor(Math.random() * 15);
    case 4: return 51 + Math.floor(Math.random() * 50);
    default: return Math.floor(Math.random() * 10);
  }
}

function generateMember(index: number) {
  const isMale = Math.random() > 0.5;
  const firstName = randomChoice(isMale ? maleFirstNames : femaleFirstNames);
  const lastName = randomChoice(familyNames);
  const fullName = `${firstName} ${lastName}`;
  
  const isQatar = Math.random() < 0.7;
  const city = isQatar ? 'doha' : 'riyadh';
  
  const brandWeights = [40, 35, 25];
  const brandIndex = weightedRandom(brandWeights);
  const brandAffinity = ['noir', 'sasso', 'both'][brandIndex];
  
  const totalVisits = generateVisits();
  const totalPoints = totalVisits * 10;
  
  const isVip = Math.random() < 0.02;
  const isBlocked = Math.random() < 0.05;
  
  return {
    full_name: fullName,
    phone: generateUniquePhone(isQatar),
    email: generateEmail(firstName, index),
    city: city as 'doha' | 'riyadh',
    brand_affinity: brandAffinity as 'noir' | 'sasso' | 'both',
    total_visits: totalVisits,
    total_points: totalPoints,
    is_vip: isVip,
    status: isBlocked ? 'blocked' : 'active',
    salutation: randomChoice(salutations),
    birthday: generateBirthday(),
    preferred_language: Math.random() > 0.3 ? 'ar' : 'en',
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { count = 10000, batchSize = 200 } = await req.json();
    
    console.log(`Starting to seed ${count} mock members in batches of ${batchSize}`);
    
    let inserted = 0;
    let errors = 0;
    
    // Get existing tiers for assignment
    const { data: tiers } = await supabase
      .from('tiers')
      .select('id, min_visits')
      .order('min_visits', { ascending: false });
    
    function getTierId(visits: number): string | null {
      if (!tiers || tiers.length === 0) return null;
      for (const tier of tiers) {
        if (visits >= tier.min_visits) {
          return tier.id;
        }
      }
      return tiers[tiers.length - 1]?.id || null;
    }

    const totalBatches = Math.ceil(count / batchSize);
    
    for (let batch = 0; batch < totalBatches; batch++) {
      const currentBatchSize = Math.min(batchSize, count - inserted);
      const members = [];
      
      for (let i = 0; i < currentBatchSize; i++) {
        members.push(generateMember(inserted + i));
      }
      
      const { data: insertedMembers, error: memberError } = await supabase
        .from('members')
        .insert(members)
        .select('id, total_visits');
      
      if (memberError) {
        console.error(`Batch ${batch + 1} error:`, memberError);
        errors += currentBatchSize;
        continue;
      }
      
      // Assign tiers to newly created members
      if (insertedMembers && tiers) {
        const tierAssignments = insertedMembers.map(m => ({
          member_id: m.id,
          tier_id: getTierId(m.total_visits || 0),
        })).filter(t => t.tier_id !== null);
        
        if (tierAssignments.length > 0) {
          await supabase.from('member_tiers').insert(tierAssignments);
        }
      }
      
      inserted += insertedMembers?.length || 0;
      
      if ((batch + 1) % 10 === 0) {
        console.log(`Progress: ${inserted}/${count} members`);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        inserted,
        errors,
        message: `Successfully seeded ${inserted} mock members`,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Seed error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
