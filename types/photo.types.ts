import { AspectRatio } from "./editor.types";

export interface Preview3DConfig {
  id: string;
  label: string;
  rotateX: number;
  rotateY: number;
  rotateZ: number;
  translateY: number;
  scale: number;
  perspective?: number;
}

// Configuraciones 3D estáticas e inmutables para los previews
// Estas configuraciones NUNCA deben cambiar, independientemente del estado del canvas
export const PREVIEW_CONFIGS: readonly Preview3DConfig[] = Object.freeze([
  Object.freeze({ id: "front", label: "Front", rotateX: 0, rotateY: 0, rotateZ: 0, translateY: 0, scale: 0.9, perspective: 600 }),
  Object.freeze({ id: "tilt-up", label: "Tilt Up", rotateX: 15, rotateY: 0, rotateZ: 0, translateY: -2, scale: 0.88, perspective: 500 }),
  Object.freeze({ id: "top-left-angle", label: "Top Left Angle", rotateX: 18, rotateY: 25, rotateZ: -15, translateY: -10, scale: 0.95, perspective: 500 }),
  Object.freeze({ id: "top-right-angle", label: "Top Right Angle", rotateX: 18, rotateY: -22, rotateZ: 15, translateY: 5, scale: 0.95, perspective: 500 }),
]);

// Configuración estática para previews de mask (siempre en posición frontal)
export const PREVIEW_FRONT_CONFIG: Readonly<Preview3DConfig> = Object.freeze({
  id: "front",
  label: "Front",
  rotateX: 0,
  rotateY: 0,
  rotateZ: 0,
  translateY: 0,
  scale: 0.9,
  perspective: 600,
});

export interface ImageMaskConfig {
  enabled: boolean;
  top?: { from: number; to?: number };
  right?: { from: number; to?: number };
  bottom?: { from: number; to?: number };
  left?: { from: number; to?: number };
  angle?: number;
  angleFrom?: number;
  angleTo?: number;
}

export const DEFAULT_MASK_CONFIG: ImageMaskConfig = {
  enabled: false,
};

export interface PhotoEditorPlaceholderProps {
  className?: string;
  canvasImageUrl?: string | null;
  /** Raw uploaded image URL (no canvas effects). Used as static reference in preview cards. */
  staticImageUrl?: string | null;
  onSelectPreview?: (config: Preview3DConfig) => void;
  selectedPreviewId?: string;
  aspectRatio?: AspectRatio;
  onAspectRatioChange?: (ratio: AspectRatio) => void;
  customAspectRatio?: { width: number; height: number } | null;
  onCustomAspectRatioChange?: (dimensions: { width: number; height: number }) => void;
  onOpenCropper?: () => void;
  apply3DToBackground?: boolean;
  onToggle3DBackground?: (value: boolean) => void;
  imageMaskConfig?: ImageMaskConfig;
  onImageMaskConfigChange?: (config: ImageMaskConfig) => void;
  imageTransform?: Preview3DConfig;
  onReset?: () => void;
}