import type { Layout } from 'react-grid-layout';

const STORAGE_KEY = 'dashboard-widget-layout';

export const WIDGET_IDS = {
  METRIC_MEMBERS: 'metric-members',
  METRIC_VISITS: 'metric-visits',
  METRIC_VIP: 'metric-vip',
  METRIC_CHURN: 'metric-churn',
  TIER_DISTRIBUTION: 'tier-distribution',
  BRAND_METRICS: 'brand-metrics',
  COUNTRY_METRICS: 'country-metrics',
  VIP_GUESTS: 'vip-guests',
} as const;

export const defaultLayouts: Record<string, Layout[]> = {
  lg: [
    { i: WIDGET_IDS.METRIC_MEMBERS, x: 0, y: 0, w: 3, h: 2, minW: 2, maxW: 6, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.METRIC_VISITS, x: 3, y: 0, w: 3, h: 2, minW: 2, maxW: 6, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.METRIC_VIP, x: 6, y: 0, w: 3, h: 2, minW: 2, maxW: 6, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.METRIC_CHURN, x: 9, y: 0, w: 3, h: 2, minW: 2, maxW: 6, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.TIER_DISTRIBUTION, x: 0, y: 2, w: 4, h: 6, minW: 3, maxW: 12, minH: 4, maxH: 10 },
    { i: WIDGET_IDS.BRAND_METRICS, x: 4, y: 2, w: 4, h: 3, minW: 3, maxW: 12, minH: 3, maxH: 6 },
    { i: WIDGET_IDS.COUNTRY_METRICS, x: 4, y: 5, w: 4, h: 3, minW: 3, maxW: 12, minH: 3, maxH: 6 },
    { i: WIDGET_IDS.VIP_GUESTS, x: 8, y: 2, w: 4, h: 6, minW: 3, maxW: 12, minH: 4, maxH: 10 },
  ],
  md: [
    { i: WIDGET_IDS.METRIC_MEMBERS, x: 0, y: 0, w: 3, h: 2, minW: 2, maxW: 6, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.METRIC_VISITS, x: 3, y: 0, w: 3, h: 2, minW: 2, maxW: 6, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.METRIC_VIP, x: 6, y: 0, w: 3, h: 2, minW: 2, maxW: 6, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.METRIC_CHURN, x: 9, y: 0, w: 3, h: 2, minW: 2, maxW: 6, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.TIER_DISTRIBUTION, x: 0, y: 2, w: 6, h: 6, minW: 3, maxW: 12, minH: 4, maxH: 10 },
    { i: WIDGET_IDS.BRAND_METRICS, x: 6, y: 2, w: 6, h: 3, minW: 3, maxW: 12, minH: 3, maxH: 6 },
    { i: WIDGET_IDS.COUNTRY_METRICS, x: 6, y: 5, w: 6, h: 3, minW: 3, maxW: 12, minH: 3, maxH: 6 },
    { i: WIDGET_IDS.VIP_GUESTS, x: 0, y: 8, w: 12, h: 5, minW: 3, maxW: 12, minH: 4, maxH: 10 },
  ],
  sm: [
    { i: WIDGET_IDS.METRIC_MEMBERS, x: 0, y: 0, w: 6, h: 2, minW: 3, maxW: 12, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.METRIC_VISITS, x: 6, y: 0, w: 6, h: 2, minW: 3, maxW: 12, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.METRIC_VIP, x: 0, y: 2, w: 6, h: 2, minW: 3, maxW: 12, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.METRIC_CHURN, x: 6, y: 2, w: 6, h: 2, minW: 3, maxW: 12, minH: 2, maxH: 3 },
    { i: WIDGET_IDS.TIER_DISTRIBUTION, x: 0, y: 4, w: 12, h: 6, minW: 6, maxW: 12, minH: 4, maxH: 10 },
    { i: WIDGET_IDS.BRAND_METRICS, x: 0, y: 10, w: 12, h: 3, minW: 6, maxW: 12, minH: 3, maxH: 6 },
    { i: WIDGET_IDS.COUNTRY_METRICS, x: 0, y: 13, w: 12, h: 3, minW: 6, maxW: 12, minH: 3, maxH: 6 },
    { i: WIDGET_IDS.VIP_GUESTS, x: 0, y: 16, w: 12, h: 5, minW: 6, maxW: 12, minH: 4, maxH: 10 },
  ],
};

export function loadSavedLayouts(): Record<string, Layout[]> | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }
  return null;
}

export function saveLayouts(layouts: Record<string, Layout[]>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
  } catch {
    // ignore
  }
}

export function clearSavedLayouts() {
  localStorage.removeItem(STORAGE_KEY);
}
