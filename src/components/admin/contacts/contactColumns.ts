// Column definitions mapping display headers to database field names
export interface ContactColumn {
  header: string;
  dbField: string;
  type: "text" | "boolean" | "number" | "date" | "datetime";
  width: string;
}

export const CONTACT_COLUMNS: ContactColumn[] = [
  { header: "Salutation", dbField: "salutation", type: "text", width: "100px" },
  { header: "client last name", dbField: "last_name", type: "text", width: "150px" },
  { header: "client first name", dbField: "first_name", type: "text", width: "150px" },
  { header: "Title", dbField: "title", type: "text", width: "120px" },
  { header: "company", dbField: "company", type: "text", width: "150px" },
  { header: "gender", dbField: "gender", type: "text", width: "80px" },
  { header: "vip", dbField: "vip", type: "boolean", width: "60px" },
  { header: "visits", dbField: "visits", type: "number", width: "70px" },
  { header: "cancels", dbField: "cancels", type: "number", width: "70px" },
  { header: "no show", dbField: "no_show", type: "number", width: "80px" },
  { header: "orders", dbField: "orders", type: "number", width: "70px" },
  { header: "spend / cover", dbField: "spend_per_cover", type: "number", width: "110px" },
  { header: "total spend", dbField: "total_spend", type: "number", width: "110px" },
  { header: "spend / visit", dbField: "spend_per_visit", type: "number", width: "110px" },
  { header: "avg. Rating", dbField: "avg_rating", type: "number", width: "100px" },
  { header: "birthday", dbField: "birthday", type: "date", width: "110px" },
  { header: "anniversary", dbField: "anniversary", type: "date", width: "110px" },
  { header: "phone", dbField: "phone", type: "text", width: "140px" },
  { header: "work phone", dbField: "work_phone", type: "text", width: "140px" },
  { header: "email", dbField: "email", type: "text", width: "200px" },
  { header: "alt email", dbField: "alt_email", type: "text", width: "200px" },
  { header: "address", dbField: "address", type: "text", width: "200px" },
  { header: "city", dbField: "city", type: "text", width: "120px" },
  { header: "state", dbField: "state", type: "text", width: "100px" },
  { header: "postal code", dbField: "postal_code", type: "text", width: "100px" },
  { header: "country", dbField: "country", type: "text", width: "120px" },
  { header: "notes", dbField: "notes", type: "text", width: "200px" },
  { header: "tags", dbField: "tags", type: "text", width: "150px" },
  { header: "loyalty ID", dbField: "loyalty_id", type: "text", width: "120px" },
  { header: "loyalty Tier", dbField: "loyalty_tier", type: "text", width: "120px" },
  { header: "loyalty rank", dbField: "loyalty_rank", type: "text", width: "100px" },
  { header: "created", dbField: "created_date", type: "datetime", width: "150px" },
  { header: "last location", dbField: "last_location", type: "text", width: "150px" },
  { header: "last visit", dbField: "last_visit", type: "datetime", width: "150px" },
  { header: "venue group marketing opt-in", dbField: "venue_group_marketing_opt_in", type: "boolean", width: "200px" },
  { header: "cafe noir - London marketing opt-in", dbField: "cafe_noir_london_opt_in", type: "boolean", width: "250px" },
  { header: "noir cafe - Abu Dhabi marketing opt-in", dbField: "noir_cafe_abu_dhabi_opt_in", type: "boolean", width: "260px" },
  { header: "noir cafe - Al Hazm marketing opt-in", dbField: "noir_cafe_al_hazm_opt_in", type: "boolean", width: "250px" },
  { header: "noir cafe - old Doha port marketing opt-in", dbField: "noir_cafe_old_doha_port_opt_in", type: "boolean", width: "280px" },
  { header: "noir cafe - Riyadh marketing opt-in", dbField: "noir_cafe_riyadh_opt_in", type: "boolean", width: "250px" },
  { header: "noir cafe - tennis marketing opt-in", dbField: "noir_cafe_tennis_opt_in", type: "boolean", width: "250px" },
  { header: "noir cafe - west walk marketing opt-in", dbField: "noir_cafe_west_walk_opt_in", type: "boolean", width: "260px" },
  { header: "Sasso - al Hazm marketing opt-in", dbField: "sasso_al_hazm_opt_in", type: "boolean", width: "240px" },
  { header: "Sasso - London marketing opt-in", dbField: "sasso_london_opt_in", type: "boolean", width: "230px" },
  { header: "Sasso - Riyadh marketing opt-in", dbField: "sasso_riyadh_opt_in", type: "boolean", width: "230px" },
  { header: "Sasso - west walk marketing opt-in", dbField: "sasso_west_walk_opt_in", type: "boolean", width: "250px" },
];

// Map of lowercase header -> dbField for auto-mapping
export const HEADER_TO_DB_MAP: Record<string, string> = {};
CONTACT_COLUMNS.forEach((col) => {
  HEADER_TO_DB_MAP[col.header.toLowerCase().trim()] = col.dbField;
});

export const DB_FIELDS = CONTACT_COLUMNS.map((c) => c.dbField);

export const BOOLEAN_FIELDS = CONTACT_COLUMNS.filter((c) => c.type === "boolean").map((c) => c.dbField);
export const NUMBER_FIELDS = CONTACT_COLUMNS.filter((c) => c.type === "number").map((c) => c.dbField);
export const DATE_FIELDS = CONTACT_COLUMNS.filter((c) => c.type === "date").map((c) => c.dbField);
export const DATETIME_FIELDS = CONTACT_COLUMNS.filter((c) => c.type === "datetime").map((c) => c.dbField);
