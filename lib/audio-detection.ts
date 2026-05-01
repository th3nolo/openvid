interface ExtendedVideoElement extends HTMLVideoElement {
    audioTracks?: { length: number };
    mozHasAudio?: boolean;
    webkitAudioDecodedByteCount?: number;
}

// Probe a video blob for an audio stream. Browser support is uneven:
//   - Safari exposes webkitAudioDecodedByteCount once data has decoded.
//   - Firefox exposes mozHasAudio.
//   - Chromium exposes neither (and audioTracks is gated behind a pref).
// When no signal is available we return true: the export pipeline runs an
// FFmpeg-level audio probe that resolves the actual case, so a false positive
// here is harmless while a false negative silently strips real audio.
export async function detectVideoHasAudio(blob: Blob): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
        const url = URL.createObjectURL(blob);
        const video = document.createElement("video");
        video.muted = true;
        video.preload = "auto";
        let settled = false;

        const cleanup = (result: boolean) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            URL.revokeObjectURL(url);
            video.src = "";
            resolve(result);
        };

        const timeoutId = setTimeout(() => cleanup(true), 8000);

        const checkAudio = (afterData: boolean) => {
            const v = video as ExtendedVideoElement;

            if (afterData && typeof v.webkitAudioDecodedByteCount === "number") {
                return cleanup(v.webkitAudioDecodedByteCount > 0);
            }

            if (v.mozHasAudio !== undefined) {
                return cleanup(Boolean(v.mozHasAudio));
            }

            if (v.audioTracks !== undefined && v.audioTracks.length > 0) {
                return cleanup(true);
            }

            if (!afterData) return;

            // Chromium path: no reliable browser-level signal exists. Assume
            // audio is present and let the export FFmpeg probe make the call.
            cleanup(true);
        };

        video.addEventListener("loadedmetadata", () => checkAudio(false));
        video.addEventListener("loadeddata", () => checkAudio(true));
        video.addEventListener("error", () => cleanup(true));
        video.src = url;
    });
}
