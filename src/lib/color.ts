/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

export const hexToRgb = (hex: string): [number, number, number] => {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const int = parseInt(h.slice(0, 6) || '000000', 16);
  return [(int >> 16) & 255, (int >> 8) & 255, int & 255];
};

export const withAlpha = (hex: string, alpha: number) => {
  const [r, g, b] = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

// factor < 1 darkens, > 1 lightens
export const shade = (hex: string, factor: number) => {
  const [r, g, b] = hexToRgb(hex);
  const f = factor;
  return `#${[r, g, b]
    .map((c) => clamp(c * f).toString(16).padStart(2, '0'))
    .join('')}`;
};
