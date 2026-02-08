import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ContactRow {
  id: string;
  [key: string]: unknown;
}

export function useContacts(search: string, filters: Record<string, unknown>) {
  return useQuery({
    queryKey: ["contacts", search, filters],
    queryFn: async () => {
      let query = (supabase as any).from("contacts").select("*");

      if (search.trim()) {
        const s = `%${search.trim()}%`;
        query = query.or(
          `first_name.ilike.${s},last_name.ilike.${s},phone.ilike.${s},email.ilike.${s},loyalty_id.ilike.${s},company.ilike.${s}`
        );
      }

      if (filters.vip !== undefined && filters.vip !== "") {
        query = query.eq("vip", filters.vip === "true" || filters.vip === true);
      }
      if (filters.loyalty_tier) query = query.eq("loyalty_tier", filters.loyalty_tier);
      if (filters.loyalty_rank) query = query.eq("loyalty_rank", filters.loyalty_rank);
      if (filters.city) query = query.eq("city", filters.city);
      if (filters.country) query = query.eq("country", filters.country);
      if (filters.last_location) query = query.eq("last_location", filters.last_location);

      const optInFields = [
        "venue_group_marketing_opt_in", "cafe_noir_london_opt_in", "noir_cafe_abu_dhabi_opt_in",
        "noir_cafe_al_hazm_opt_in", "noir_cafe_old_doha_port_opt_in", "noir_cafe_riyadh_opt_in",
        "noir_cafe_tennis_opt_in", "noir_cafe_west_walk_opt_in", "sasso_al_hazm_opt_in",
        "sasso_london_opt_in", "sasso_riyadh_opt_in", "sasso_west_walk_opt_in",
      ];
      for (const field of optInFields) {
        if (filters[field] !== undefined && filters[field] !== "") {
          query = query.eq(field, filters[field] === "true" || filters[field] === true);
        }
      }

      query = query.order("last_name", { ascending: true }).limit(1000);

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as ContactRow[];
    },
  });
}

export function useContactsCount() {
  return useQuery({
    queryKey: ["contacts-count"],
    queryFn: async () => {
      const { count, error } = await (supabase as any)
        .from("contacts")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      return count ?? 0;
    },
  });
}
