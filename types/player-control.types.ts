import type { AspectRatio } from "./editor.types";

export interface PlayerControlsProps {
    isPlaying: boolean;
    currentTime: number;
    videoDuration: number;
    aspectRatio: AspectRatio;
    isFullscreen: boolean;
    zoomLevel: number;
    customAspectRatio?: { width: number; height: number } | null;
    onTogglePlayPause: () => void;
    onSkipBackward: () => void;
    onSkipForward: () => void;
    onToggleFullscreen: () => void;
    onAspectRatioChange: (ratio: AspectRatio) => void;
    onCustomAspectRatioChange?: (dimensions: { width: number; height: number }) => void;
    onOpenCropper: () => void;
    onZoomChange: (zoom: number) => void;
}

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 10;
export const ZOOM_STEP = 1;