/**
 * Site accent palette. Article colours are decided by category
 * (see categories.ts); this file only holds the swatches.
 */
export const ACCENT = {
  magenta: '#E5007F',
  cyan: '#00A0E9',
  green: '#00B06B',
  orange: '#FF6B00',
  red: '#E51A14',
  yellow: '#FFD400',
  /** No-colour category (essays): light paper grey so black type and borders still read. */
  paper: '#EDEDED',
} as const;
