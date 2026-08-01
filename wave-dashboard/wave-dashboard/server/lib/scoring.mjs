/**
 * Risk scoring engine.
 *
 * This runs on the server so every client sees the same score for the same
 * transaction, and so the factor breakdown can be logged for audit. Weights
 * are deliberately simple and inspectable — this stands in for an ML model
 * without pretending to be one.
 */

import { HIGH_RISK_COUNTRIES } from '../seed.mjs';

export const SAR_THRESHOLD = 0.7;

function isHighRiskLocation(location) {
  return HIGH_RISK_COUNTRIES.some((country) => country.code === location || country.name === location);
}

const CHANNEL_WEIGHTS = { CASH: 0.25, WIRE: 0.2, ONLINE: 0.15, MOBILE: 0.08, ATM: 0.05 };

/**
 * @returns {{score:number, factors:Array<{label:string,weight:number,detail:string}>, typology:string}}
 */
export function scoreTransaction({ amount, channel, location }) {
  const amt = Number(amount) || 0;
  const factors = [];

  if (amt > 50_000) {
    factors.push({
      label: 'High-value transfer',
      weight: 0.45,
      detail: `Amount ${amt.toLocaleString()} far exceeds the customer-profile norm`,
    });
  } else if (amt > 9_000 && amt < 10_000) {
    factors.push({
      label: 'Threshold avoidance',
      weight: 0.4,
      detail: `Amount ${amt.toLocaleString()} sits just under the 10,000 CTR reporting threshold`,
    });
  } else if (amt > 10_000) {
    factors.push({
      label: 'Reportable amount',
      weight: 0.3,
      detail: `Amount ${amt.toLocaleString()} is above the 10,000 CTR reporting threshold`,
    });
  }

  const channelWeight = CHANNEL_WEIGHTS[channel];
  if (channelWeight) {
    factors.push({
      label: `${channel} channel`,
      weight: channelWeight,
      detail: `${channel} carries a ${(channelWeight * 100).toFixed(0)}-point channel weighting`,
    });
  }

  if (isHighRiskLocation(location)) {
    factors.push({
      label: 'High-risk jurisdiction',
      weight: 0.3,
      detail: `${location} is on the elevated-risk jurisdiction watchlist`,
    });
  }

  const raw = factors.reduce((sum, f) => sum + f.weight, 0);
  const score = Math.min(Number(raw.toFixed(2)), 1);

  return { score, factors, typology: classify({ score, amount: amt, location }) };
}

function classify({ score, amount, location }) {
  if (amount > 9_000 && amount < 10_000) return 'Structuring';
  if (score >= 0.9) return 'Money Laundering';
  if (score >= 0.8 && isHighRiskLocation(location)) return 'Sanctions Risk';
  if (score >= SAR_THRESHOLD) return 'Unusual Pattern';
  if (score >= 0.5) return 'Moderate Risk';
  return 'Low Risk';
}

export function riskLabel(score) {
  if (score >= 0.85) return 'CRITICAL';
  if (score >= SAR_THRESHOLD) return 'HIGH';
  if (score >= 0.5) return 'MEDIUM';
  return 'LOW';
}
