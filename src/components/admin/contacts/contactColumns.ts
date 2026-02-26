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

// Map of lowercase header -> dbField for auto-mapping (includes aliases)
export const HEADER_TO_DB_MAP: Record<string, string> = {};
CONTACT_COLUMNS.forEach((col) => {
  HEADER_TO_DB_MAP[col.header.toLowerCase().trim()] = col.dbField;
});

// Extended alias mapping for common CSV variations
const HEADER_ALIASES: Record<string, string> = {
  // Name fields
  "first name": "first_name", "firstname": "first_name", "given name": "first_name", "fname": "first_name",
  "last name": "last_name", "lastname": "last_name", "surname": "last_name", "family name": "last_name", "lname": "last_name",
  "client first name": "first_name", "client last name": "last_name",
  "full name": "first_name", "name": "first_name", "guest name": "first_name", "customer name": "first_name",
  // Contact
  "mobile": "phone", "mobile phone": "phone", "cell": "phone", "telephone": "phone", "tel": "phone", "contact number": "phone",
  "phone number": "phone", "mobile number": "phone", "primary phone": "phone",
  "email address": "email", "e-mail": "email", "primary email": "email", "e mail": "email",
  "secondary email": "alt_email", "alternate email": "alt_email", "other email": "alt_email",
  "office phone": "work_phone", "business phone": "work_phone",
  // Spend / metrics
  "total revenue": "total_spend", "revenue": "total_spend", "lifetime spend": "total_spend", "ltv": "total_spend",
  "spend": "total_spend", "lifetime value": "total_spend", "total amount": "total_spend",
  "avg spend": "spend_per_visit", "average spend": "spend_per_visit", "avg. spend / visit": "spend_per_visit",
  "spend per cover": "spend_per_cover", "avg. spend / cover": "spend_per_cover", "cover spend": "spend_per_cover",
  "rating": "avg_rating", "average rating": "avg_rating", "avg rating": "avg_rating",
  "visit count": "visits", "total visits": "visits", "num visits": "visits", "number of visits": "visits",
  "order count": "orders", "total orders": "orders",
  "cancel count": "cancels", "cancellations": "cancels", "cancelled": "cancels",
  "no shows": "no_show", "noshow": "no_show", "no-show": "no_show", "no show count": "no_show",
  // Dates
  "date of birth": "birthday", "dob": "birthday", "birth date": "birthday", "birthdate": "birthday",
  "wedding anniversary": "anniversary", "anniversary date": "anniversary",
  "last visited": "last_visit", "last visit date": "last_visit", "most recent visit": "last_visit",
  "created at": "created_date", "create date": "created_date", "date created": "created_date", "registration date": "created_date", "signup date": "created_date",
  // Location
  "branch": "last_location", "location": "last_location", "venue": "last_location", "restaurant": "last_location",
  "last branch": "last_location", "last venue": "last_location", "preferred location": "last_location",
  "zip code": "postal_code", "zip": "postal_code", "postcode": "postal_code",
  "region": "state", "province": "state",
  // Loyalty
  "loyalty id": "loyalty_id", "member id": "loyalty_id", "customer id": "loyalty_id", "guest id": "loyalty_id",
  "card number": "loyalty_id", "membership number": "loyalty_id", "membership id": "loyalty_id",
  "tier": "loyalty_tier", "loyalty level": "loyalty_tier", "member tier": "loyalty_tier", "status tier": "loyalty_tier",
  "rank": "loyalty_rank", "loyalty ranking": "loyalty_rank",
  // Other
  "vip status": "vip", "is vip": "vip", "vip flag": "vip",
  "sex": "gender", "mr/mrs": "salutation", "prefix": "salutation",
  "job title": "title", "position": "title", "role": "title",
  "organization": "company", "employer": "company", "firm": "company", "business": "company",
  "comment": "notes", "remarks": "notes", "note": "notes", "memo": "notes",
  "label": "tags", "category": "tags", "group": "tags",
};

// Merge aliases into the map
for (const [alias, dbField] of Object.entries(HEADER_ALIASES)) {
  if (!HEADER_TO_DB_MAP[alias]) {
    HEADER_TO_DB_MAP[alias] = dbField;
  }
}

export const DB_FIELDS = CONTACT_COLUMNS.map((c) => c.dbField);

export const BOOLEAN_FIELDS = CONTACT_COLUMNS.filter((c) => c.type === "boolean").map((c) => c.dbField);
export const NUMBER_FIELDS = CONTACT_COLUMNS.filter((c) => c.type === "number").map((c) => c.dbField);
export const DATE_FIELDS = CONTACT_COLUMNS.filter((c) => c.type === "date").map((c) => c.dbField);
export const DATETIME_FIELDS = CONTACT_COLUMNS.filter((c) => c.type === "datetime").map((c) => c.dbField);
