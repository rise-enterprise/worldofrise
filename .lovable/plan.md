# AI-Powered Loyalty Intelligence Platform — Incremental Roadmap

## Existing Foundation (Already Built)
- Loyalty engine (tiers, points ledger, visits, rewards, redemptions)
- Member portal with QR card, rewards, experiences
- Admin panel with 10 loyalty modules
- CRM contacts database (186K+ records)
- AI guest insights (churn risk, re-engagement messages)
- Campaign management, segmentation
- Full RBAC, audit logging, RLS security
- Crystal DNA design system, RTL/LTR, bilingual

---

## Phase 1: AI Intelligence Layer (PRIORITY)
### 1A — AI Predictions Edge Function
- New `ai-predictions` edge function using Lovable AI
- Churn prediction (0-100% score, Safe/At Risk/High Risk labels)
- LTV prediction (6-month, 12-month projected value)
- Smart auto-segmentation (Future VIP, Dormant, High-margin, Reward abusers)
- Store predictions in new `ai_predictions` table

### 1B — AI Predictions Table
- `ai_predictions` table: member_id, prediction_type, score, label, metadata_json, generated_at
- RLS: admins can read, system can insert

### 1C — Reward Optimization AI
- Analyze reward redemption patterns
- Suggest point pricing adjustments
- Detect low-performing rewards

### 1D — Branch Performance AI
- Compare branch metrics
- Detect underperformers
- Suggest local retention strategies

---

## Phase 2: Advanced Analytics Dashboard
### 2A — Retention Metrics (D7/D30/D90, repeat rate, cohort analysis)
### 2B — RFM Analysis (scoring, heatmap, auto-segment)
### 2C — Enhanced Charts (LTV, ARPU, Reward ROI, Campaign ROI, branch comparison, CSV export)
### 2D — AI Risk Segmentation View

---

## Phase 3: Campaign Automation Engine
### 3A — Enhanced Campaign Builder (AI segments, scheduling, A/B testing)
### 3B — Hybrid Segmentation Builder (manual AND/OR + natural language AI)
### 3C — Campaign Intelligence (best time, incentive, audience recommendations)
### 3D — Integration Prep (Email/SMS/WhatsApp/Push)

---

## Phase 4: Guest Portal Enhancements
- Personalized AI offers, dynamic insights, milestone visualization

---

## Phase 5: Operational Hardening
- Dynamic earn/burn rule builder, fraud detection, consent management
