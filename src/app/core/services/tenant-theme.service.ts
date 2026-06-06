import { Inject, Injectable } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { TenantRead } from '../models/api.models';

type ThemePalette = {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  background: string;
  surface: string;
  text: string;
};

@Injectable({ providedIn: 'root' })
export class TenantThemeService {
  private readonly fallbacks: Record<string, ThemePalette> = {
    '#c40016': {
      primary: '#C40016',
      primaryDark: '#8F0010',
      primarySoft: '#FEEBEE',
      background: '#FFF8F8',
      surface: '#FFFFFF',
      text: '#1D1B1B',
    },
    '#1e88e5': {
      primary: '#1E88E5',
      primaryDark: '#1565C0',
      primarySoft: '#EAF3FF',
      background: '#F6FAFF',
      surface: '#FFFFFF',
      text: '#10233D',
    },
    '#43a047': {
      primary: '#43A047',
      primaryDark: '#2E7D32',
      primarySoft: '#E9F8EB',
      background: '#F5FBF5',
      surface: '#FFFFFF',
      text: '#17321B',
    },
    '#fbc02d': {
      primary: '#FBC02D',
      primaryDark: '#F9A825',
      primarySoft: '#FFF6D7',
      background: '#FFFDF4',
      surface: '#FFFFFF',
      text: '#342600',
    },
  };

  constructor(@Inject(DOCUMENT) private document: Document) {}

  applyTenantTheme(tenant: TenantRead | null | undefined): void {
    const theme = this.resolvePalette(tenant?.color_tema);
    const root = this.document.documentElement.style;

    root.setProperty('--primary-red', theme.primary);
    root.setProperty('--primary-container', theme.primaryDark);
    root.setProperty('--primary-soft', theme.primarySoft);
    root.setProperty('--bg-light', theme.background);
    root.setProperty('--bg-smoke', theme.background);
    root.setProperty('--surface', theme.surface);
    root.setProperty('--surface-white', theme.surface);
    root.setProperty('--surface-lowest', theme.surface);
    root.setProperty('--surface-low', this.lighten(theme.primary, 96));
    root.setProperty('--text-dark', theme.text);
    root.setProperty('--text-main', theme.text);
    root.setProperty('--text-muted', this.blendWithGray(theme.primary, 40));
    root.setProperty('--border-light', this.lighten(theme.primary, 88));
    root.setProperty('--tenant-accent', theme.primary);
    this.document.body?.setAttribute('data-tenant-color', (tenant?.color_tema || '#C40016').toLowerCase());
  }

  private resolvePalette(color?: string): ThemePalette {
    const normalized = (color || '#C40016').toLowerCase();
    return this.fallbacks[normalized] ?? this.generateDynamicPalette(color ?? '#C40016');
  }

  private generateDynamicPalette(hex: string): ThemePalette {
    return {
      primary: hex,
      primaryDark: this.darken(hex, 20),
      primarySoft: this.lighten(hex, 90),
      background: this.lighten(hex, 97),
      surface: '#FFFFFF',
      text: '#1A1A1A',
    };
  }

  private darken(hex: string, amount: number): string {
    const [r, g, b] = this.hexToRgb(hex);
    const f = (1 - amount / 100);
    return this.rgbToHex(Math.round(r * f), Math.round(g * f), Math.round(b * f));
  }

  private lighten(hex: string, amount: number): string {
    const [r, g, b] = this.hexToRgb(hex);
    const f = amount / 100;
    return this.rgbToHex(
      Math.round(r + (255 - r) * f),
      Math.round(g + (255 - g) * f),
      Math.round(b + (255 - b) * f),
    );
  }

  private blendWithGray(hex: string, grayAmount: number): string {
    const [r, g, b] = this.hexToRgb(hex);
    const gray = 120;
    const f = grayAmount / 100;
    return this.rgbToHex(
      Math.round(r + (gray - r) * f),
      Math.round(g + (gray - g) * f),
      Math.round(b + (gray - b) * f),
    );
  }

  private hexToRgb(hex: string): [number, number, number] {
    const clean = hex.replace('#', '');
    const num = parseInt(clean.length === 3
      ? clean.split('').map(c => c + c).join('')
      : clean, 16);
    return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return '#' + [r, g, b].map(v => Math.min(255, Math.max(0, v)).toString(16).padStart(2, '0')).join('');
  }
}