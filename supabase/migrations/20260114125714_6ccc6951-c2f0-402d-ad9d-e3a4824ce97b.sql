-- Seed rewards table with sample data
INSERT INTO public.rewards (title_en, title_ar, description_en, description_ar, points_cost, brand_scope, is_active, stock_limit, per_member_limit)
VALUES
  ('Private Chef''s Table', 'طاولة الشيف الخاصة', 'An intimate dining experience curated by our head chef, featuring a bespoke 7-course tasting menu', 'تجربة طعام حميمة برعاية رئيس الطهاة لدينا، تتميز بقائمة تذوق مخصصة من 7 أطباق', 5000, 'sasso', true, 10, 1),
  ('VIP Lounge Access', 'الدخول إلى صالة كبار الشخصيات', 'Complimentary access to our private lounge with premium beverages and personalized service', 'دخول مجاني إلى صالتنا الخاصة مع مشروبات فاخرة وخدمة شخصية', 2500, 'noir', true, NULL, 2),
  ('Secret Menu Tasting', 'تذوق القائمة السرية', 'Experience our hidden culinary creations, available only to those who know', 'جرب إبداعاتنا الطهوية الخفية، المتاحة فقط لمن يعرفون', 1500, 'both', true, 50, 3),
  ('Royal Gala Invitation', 'دعوة الحفل الملكي', 'An exclusive invitation to our annual Royal Gala, featuring world-renowned performers', 'دعوة حصرية لحفلنا الملكي السنوي، يضم فنانين عالميين', 10000, 'both', true, 5, 1),
  ('Signature Cocktail Creation', 'ابتكار كوكتيل خاص', 'Work with our mixologist to create your own signature cocktail, named after you', 'اعمل مع خبير المشروبات لدينا لإنشاء كوكتيل خاص بك، يحمل اسمك', 3000, 'noir', true, 20, 1),
  ('Wine Cellar Experience', 'تجربة قبو النبيذ', 'A private tour and tasting in our exclusive wine cellar with our sommelier', 'جولة خاصة وتذوق في قبو النبيذ الحصري لدينا مع الساقي', 4500, 'sasso', true, 15, 1),
  ('Birthday Celebration Package', 'باقة احتفال عيد الميلاد', 'A complimentary celebration setup with premium treats on your special day', 'إعداد احتفال مجاني مع حلويات فاخرة في يومك الخاص', 1000, 'both', true, NULL, 1),
  ('Reserved Parking Priority', 'أولوية الموقف المحجوز', 'VIP parking access for 3 months at any RISE venue', 'دخول موقف السيارات لكبار الشخصيات لمدة 3 أشهر في أي مكان من RISE', 2000, 'both', true, 30, 1)
ON CONFLICT DO NOTHING;

-- Seed experiences table with sample events
INSERT INTO public.experiences (title_en, title_ar, description_en, description_ar, experience_date, experience_type, brand, capacity, tier_requirement, is_invite_only, status)
VALUES
  ('Literary Evening with Local Authors', 'أمسية أدبية مع كتاب محليين', 'An intimate evening of poetry and prose with celebrated Qatari authors.', 'أمسية حميمة من الشعر والنثر مع كتاب قطريين مشهورين.', NOW() + INTERVAL '7 days', 'dinner', 'noir', 30, ARRAY['Elite'], false, 'upcoming'),
  ('SASSO Chef Table Experience', 'تجربة طاولة الشيف في ساسو', 'Exclusive 8-course tasting menu crafted by our Executive Chef.', 'قائمة تذوق حصرية من 8 أطباق من إعداد الشيف التنفيذي.', NOW() + INTERVAL '14 days', 'chefs_table', 'sasso', 12, ARRAY['Platinum'], true, 'upcoming'),
  ('Coffee Origins: Ethiopia', 'أصول القهوة: إثيوبيا', 'A curated tasting journey through Ethiopian coffee varieties.', 'رحلة تذوق منسقة عبر أصناف القهوة الإثيوبية.', NOW() + INTERVAL '21 days', 'tasting', 'noir', 20, ARRAY['Gold'], false, 'upcoming'),
  ('Midnight Tasting Ritual', 'طقوس التذوق منتصف الليل', 'An exclusive after-hours tasting experience featuring rare vintages and secret menu items.', 'تجربة تذوق حصرية بعد ساعات العمل تتميز بأصناف نادرة وعناصر قائمة سرية.', NOW() + INTERVAL '30 days', 'tasting', 'noir', 12, ARRAY['Platinum'], true, 'upcoming'),
  ('Chef''s Table: Italian Odyssey', 'طاولة الشيف: أوديسة إيطالية', 'A seven-course journey through the regions of Italy, prepared tableside by Chef Marco.', 'رحلة من سبعة أطباق عبر مناطق إيطاليا، تحضر على الطاولة من قبل الشيف ماركو.', NOW() + INTERVAL '35 days', 'chefs_table', 'sasso', 8, ARRAY['Black'], true, 'upcoming'),
  ('Members'' Evening Soirée', 'أمسية الأعضاء', 'An intimate gathering featuring live jazz, fine spirits, and culinary delights.', 'تجمع حميم يضم موسيقى الجاز الحية والمشروبات الفاخرة والمأكولات الشهية.', NOW() + INTERVAL '45 days', 'dinner', 'both', 30, ARRAY['Gold'], false, 'upcoming'),
  ('Spring Gala 2026', 'حفل الربيع 2026', 'Our annual celebration of excellence, featuring black-tie dinner and world-renowned entertainment.', 'احتفالنا السنوي بالتميز، يضم عشاء رسمي وترفيه عالمي.', NOW() + INTERVAL '60 days', 'gala', 'both', 150, ARRAY['Silver'], false, 'upcoming'),
  ('Wine Pairing Masterclass', 'دورة إقران النبيذ', 'Learn the art of wine pairing with our Head Sommelier in an exclusive session.', 'تعلم فن إقران النبيذ مع رئيس السقاة لدينا في جلسة حصرية.', NOW() + INTERVAL '25 days', 'tasting', 'sasso', 16, ARRAY['Elite'], false, 'upcoming')
ON CONFLICT DO NOTHING;