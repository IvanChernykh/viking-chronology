import type { RenderQuality } from '../types';

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

export interface DeviceProfile {
  cores: number;
  memoryGb: number | null;
  devicePixelRatio: number;
  coarsePointer: boolean;
  reducedMotion: boolean;
  lowPower: boolean;
}

export function readDeviceProfile(isMobile: boolean): DeviceProfile {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      cores: 4,
      memoryGb: null,
      devicePixelRatio: 1,
      coarsePointer: false,
      reducedMotion: false,
      lowPower: false,
    };
  }

  const extendedNavigator = navigator as NavigatorWithMemory;
  const cores = Math.max(1, navigator.hardwareConcurrency || 4);
  const memoryGb = extendedNavigator.deviceMemory ?? null;
  const devicePixelRatio = Math.max(1, window.devicePixelRatio || 1);
  const coarsePointer = window.matchMedia?.('(pointer: coarse)').matches ?? isMobile;
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const constrainedMemory = memoryGb !== null && memoryGb <= 3;
  const lowPower = constrainedMemory || cores <= 4;

  return {
    cores,
    memoryGb,
    devicePixelRatio,
    coarsePointer,
    reducedMotion,
    lowPower,
  };
}

export function resolveRenderQuality(
  requested: RenderQuality,
  isMobile: boolean,
  profile: DeviceProfile,
): Exclude<RenderQuality, 'auto'> {
  if (requested !== 'auto') return requested;
  if (profile.lowPower) return 'battery';
  if (isMobile || profile.cores <= 8 || (profile.memoryGb !== null && profile.memoryGb <= 6)) {
    return 'balanced';
  }
  return 'high';
}

export function supportsWebGL2(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', {
      powerPreference: 'default',
      failIfMajorPerformanceCaveat: false,
    });
    const supported = Boolean(context);
    const loseContext = context?.getExtension('WEBGL_lose_context');
    loseContext?.loseContext();
    return supported;
  } catch {
    return false;
  }
}
