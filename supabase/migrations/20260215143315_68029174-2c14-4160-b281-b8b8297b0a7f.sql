CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_contacts_last_visit ON public.contacts USING btree (last_visit);
CREATE INDEX idx_contacts_loyalty_tier_trgm ON public.contacts USING gin (loyalty_tier gin_trgm_ops);
CREATE INDEX idx_contacts_last_location_trgm ON public.contacts USING gin (last_location gin_trgm_ops);
CREATE INDEX idx_contacts_country_trgm ON public.contacts USING gin (country gin_trgm_ops);
CREATE INDEX idx_contacts_city_trgm ON public.contacts USING gin (city gin_trgm_ops);