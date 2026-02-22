"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";
import { SliderControl } from "@/app/components/ui/slider-control";
import { SidebarTool } from "@/app/components/ui/sidebar-tool";
import { TabButton } from "@/app/components/ui/tab-button";
import { WallpaperGrid } from "@/app/components/ui/wallpaper-grid";
import { loadVideoFromIndexedDB } from "@/hooks/useScreenRecording";
import Image from "next/image";
import "../../globals.css";
import { ExportDropdown } from "@/app/components/ui/exportDropdown";
import { AspectRatioSelect } from "@/app/components/ui/aspectRatioSelect";

type Tool = "screenshot" | "text" | "audio" | "zoom";
type BackgroundTab = "wallpaper" | "image" | "gradient" | "color";

export default function Editor() {
    const [activeTool, setActiveTool] = useState<Tool>("screenshot");
    const [backgroundTab, setBackgroundTab] = useState<BackgroundTab>("wallpaper");
    const [selectedWallpaper, setSelectedWallpaper] = useState(0);
    const [backgroundBlur, setBackgroundBlur] = useState(10);
    const [padding, setPadding] = useState(15);
    const [roundedCorners, setRoundedCorners] = useState(40);
    const [shadows, setShadows] = useState(25);

    // Video state
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [videoDuration, setVideoDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Load video from IndexedDB
    useEffect(() => {
        const loadVideo = async () => {
            try {
                const videoData = await loadVideoFromIndexedDB();
                if (videoData) {
                    setVideoUrl(videoData.url);
                    setVideoDuration(videoData.duration);
                }
            } catch (error) {
                console.error("Error loading video:", error);
            }
        };

        loadVideo();
    }, []);

    // Video playback controls
    const togglePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime);
        }
    };

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setVideoDuration(videoRef.current.duration);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (videoRef.current && videoDuration > 0) {
            const rect = e.currentTarget.getBoundingClientRect();
            const pos = (e.clientX - rect.left) / rect.width;
            videoRef.current.currentTime = pos * videoDuration;
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const skipBackward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
        }
    };

    const skipForward = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = Math.min(videoDuration, videoRef.current.currentTime + 5);
        }
    };

    return (
        <div className="flex flex-col h-screen w-full bg-[#0E0E12] text-[#A1A1AA] font-sans overflow-hidden select-none">
            <div className="flex flex-1 overflow-hidden">
                <div className="w-15 flex flex-col items-center py-4 bg-[#141417] border-r border-white/5 gap-6">
                    <div className="mb-2">
                        <Image src="/svg/logo-freeshot.svg" alt="Logo" width={40} height={40} />
                    </div>
                    <SidebarTool
                        icon="mdi:monitor-screenshot"
                        isActive={activeTool === "screenshot"}
                        onClick={() => setActiveTool("screenshot")}
                    />
                    <SidebarTool
                        icon="iconoir:text-size"
                        isActive={activeTool === "text"}
                        onClick={() => setActiveTool("text")}
                    />
                    <SidebarTool
                        icon="mdi:volume-high"
                        isActive={activeTool === "audio"}
                        onClick={() => setActiveTool("audio")}
                    />
                    <SidebarTool
                        icon="iconamoon:zoom-in-bold"
                        isActive={activeTool === "zoom"}
                        onClick={() => setActiveTool("zoom")}
                    />
                    <div className="mt-auto">
                        <SidebarTool
                            icon="lucide:sidebar-close"
                        />
                    </div>
                </div>

                <div className="w-[320px] bg-[#141417] border-r border-white/5 flex flex-col overflow-y-auto custom-scrollbar">

                    {activeTool === "screenshot" && (
                        <>
                            <div className="p-4 border-b border-white/5">
                                <div className="flex items-center gap-2 text-white font-medium mb-4">
                                    <Icon icon="mdi:image-outline" width="20" />
                                    <span>Background</span>
                                </div>

                                <div className="flex bg-[#09090B] rounded-lg p-1 text-xs font-medium">
                                    <TabButton
                                        label="Fondos"
                                        isActive={backgroundTab === "wallpaper"}
                                        onClick={() => setBackgroundTab("wallpaper")}
                                    />
                                    <TabButton
                                        label="Imagen"
                                        isActive={backgroundTab === "image"}
                                        onClick={() => setBackgroundTab("image")}
                                    />
                                    <TabButton
                                        label="Gradiente"
                                        isActive={backgroundTab === "gradient"}
                                        onClick={() => setBackgroundTab("gradient")}
                                    />
                                    <TabButton
                                        label="Color"
                                        isActive={backgroundTab === "color"}
                                        onClick={() => setBackgroundTab("color")}
                                    />
                                </div>
                            </div>

                            <div className="p-4 flex flex-col gap-6 pb-12">
                                {/* Wallpaper Section */}
                                {backgroundTab === "wallpaper" && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Icon icon="mdi:monitor" width="16" />
                                            <span className="text-sm text-white">Fondos</span>
                                        </div>

                                        <WallpaperGrid
                                            selectedIndex={selectedWallpaper}
                                            onSelect={setSelectedWallpaper}
                                        />
                                    </div>
                                )}

                                {backgroundTab === "image" && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Icon icon="mdi:image" width="16" />
                                            <span className="text-sm text-white">Subir imagen</span>
                                        </div>
                                        <button className="w-full p-8 border-2 border-dashed border-white/10 rounded-lg hover:border-white/20 transition">
                                            <Icon icon="mdi:upload" width="32" className="mx-auto mb-2" />
                                            <p className="text-sm">Haga clic para cargar o arrastre y suelte</p>
                                        </button>
                                    </div>
                                )}

                                {backgroundTab === "gradient" && (
                                    <div className="space-y-6">
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Icon icon="mdi:tune-variant" width="16" className="text-white/70" />
                                                <span className="text-sm text-white font-medium">Colores personalizados</span>
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-[#667eea] shadow-inner" />
                                                        <span className="text-xs font-mono text-white/60">#667EEA</span>
                                                    </div>
                                                    <span className="text-[10px] text-white/40 uppercase font-bold mr-2">Inicio</span>
                                                </div>

                                                <div className="flex items-center justify-between bg-white/5 p-2 rounded-lg border border-white/10">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full border-2 border-white/20 bg-[#764ba2] shadow-inner" />
                                                        <span className="text-xs font-mono text-white/60">#764BA2</span>
                                                    </div>
                                                    <span className="text-[10px] text-white/40 uppercase font-bold mr-2">Fin</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-3">
                                                <Icon icon="mdi:gradient-horizontal" width="16" />
                                                <span className="text-sm text-white">Gradientes</span>
                                            </div>
                                            <div className="grid grid-cols-6 gap-2">
                                                {[
                                                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                                    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                                                    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
                                                    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                                                    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
                                                    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                                                    "linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)",
                                                    "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
                                                    "linear-gradient(135deg, #f067b4 0%, #8131ff 100%)",
                                                    "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
                                                    "linear-gradient(135deg, #fee2e2 0%, #f87171 100%)",
                                                    "linear-gradient(135deg, #f8fafc 0%, #cbd5e1 100%)"
                                                ].map((gradient, i) => (
                                                    <div
                                                        key={i}
                                                        className="aspect-square rounded-lg cursor-pointer hover:ring-2 ring-white/30"
                                                        style={{ background: gradient }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {backgroundTab === "color" && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Icon icon="mdi:palette" width="16" />
                                            <span className="text-sm text-white">Color sólido</span>
                                        </div>
                                        <div className="grid grid-cols-6 gap-2">
                                            {["#FF6B6B", "#4ECDC4", "#45B7D1", "#FFA07A", "#98D8C8", "#F7DC6F",
                                                "#BB8FCE", "#85C1E2", "#F8B739", "#52B788", "#E63946", "#457B9D"].map((color, i) => (
                                                    <div
                                                        key={i}
                                                        className="aspect-square rounded-lg cursor-pointer hover:ring-2 ring-white/30"
                                                        style={{ background: color }}
                                                    />
                                                ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col gap-5">
                                    <SliderControl
                                        icon="mdi:blur"
                                        label="Fondo borroso"
                                        value={backgroundBlur}
                                    />

                                    <div className="text-sm font-medium text-white mt-2">Forma</div>
                                    <SliderControl
                                        icon="mdi:border-outside"
                                        label="Espaciado"
                                        value={padding}
                                    />
                                    <SliderControl
                                        icon="mdi:rounded-corner"
                                        label="Esquinas redondeadas"
                                        value={roundedCorners}
                                    />
                                    <SliderControl
                                        icon="mdi:weather-sunny"
                                        label="Sombras"
                                        value={shadows}
                                    />
                                </div>

                            </div>
                        </>
                    )}

                    {activeTool === "text" && (
                        <div className="p-4 flex flex-col gap-6">
                            <div className="flex items-center gap-2 text-white font-medium">
                                <Icon icon="mdi:message-text-outline" width="20" />
                                <span>Configuración de texto</span>
                            </div>
                            <div>
                                <label className="text-sm text-white mb-2 block">Fuente</label>
                                <select className="w-full bg-[#27272A] text-white p-2 rounded-md border border-white/10">
                                    <option>Inter</option>
                                    <option>Roboto</option>
                                    <option>Poppins</option>
                                    <option>Montserrat</option>
                                </select>
                            </div>
                            <SliderControl icon="mdi:format-size" label="Tamaño de fuente" value={60} />
                            <SliderControl icon="mdi:opacity" label="Opacidad" value={100} />
                        </div>
                    )}

                    {activeTool === "audio" && (
                        <div className="p-4 flex flex-col gap-6">
                            <div className="flex items-center gap-2 text-white font-medium">
                                <Icon icon="mdi:volume-high" width="20" />
                                <span>Configuración de audio</span>
                            </div>
                            <SliderControl icon="mdi:volume-medium" label="Volumen" value={80} />
                            <SliderControl icon="mdi:tune" label="Amplificación de graves" value={30} />
                        </div>
                    )}

                    {activeTool === "zoom" && (
                        <div className="p-4 flex flex-col gap-6">
                            <div className="flex items-center">
                                <div className="flex items-center gap-2 text-white font-medium">
                                    <Icon icon="iconamoon:zoom-in-bold" width="18" />
                                    <span>Configuración de zoom</span>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <SliderControl icon="mdi:zoom-in" label="Nivel de zoom" value={80} />
                                        <span className="bg-blue-500/10 px-2 py-0.5 rounded text-xs text-white">2.0x</span>
                                    </div>
                                </div>
                            </div>
                            <Button variant="outline">
                                Añadir fragmento
                            </Button>
                        </div>
                    )}

                </div>

                <div className="flex-1 bg-[#09090B] flex flex-col relative overflow-hidden">
                    {/* Top Navbar */}
                    <div className="h-14 border-b border-white/5 flex items-center justify-end px-4 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 border-r border-white/10 pr-3">
                                <button className="hover:text-white"><Icon icon="mdi:undo" width="20" /></button>
                                <button className="hover:text-white opacity-50"><Icon icon="mdi:redo" width="20" /></button>
                            </div>
                            <ExportDropdown />
                        </div>
                    </div>

                    {/* Canvas Wrapper - Ajustado para ocupar el espacio real */}
                    <div className="flex-1 flex items-center justify-center min-h-0 overflow-hidden bg-[#09090B]">
                        <div
                            className="relative flex items-center justify-center shadow-2xl transition-all duration-300 w-full h-full max-w-fit max-h-full"
                            style={{
                                padding: `${padding}px`,
                                backgroundColor: '#b1d4ff',
                                borderRadius: `${roundedCorners}px`,
                            }}
                        >
                            {videoUrl ? (
                                <video
                                    ref={videoRef}
                                    src={videoUrl}
                                    className="w-full h-full object-contain"
                                    style={{
                                        borderRadius: `${Math.max(0, roundedCorners - padding / 2)}px`,
                                        boxShadow: `0 ${shadows}px ${shadows * 2}px rgba(0,0,0,0.3)`
                                    }}
                                    onTimeUpdate={handleTimeUpdate}
                                    onLoadedMetadata={handleLoadedMetadata}
                                    onEnded={() => setIsPlaying(false)}
                                />
                            ) : (
                                <div
                                    className="w-full h-full aspect-video bg-[#1E1E1E] flex flex-col overflow-hidden"
                                    style={{
                                        borderRadius: `${Math.max(0, roundedCorners - padding / 2)}px`
                                    }}
                                >
                                    <div className="h-8 bg-[#2D2D2D] flex items-center px-3 gap-2 shrink-0">
                                        <div className="flex gap-1.5">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]"></div>
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]"></div>
                                        </div>
                                    </div>
                                    <div className="flex-1 flex items-center justify-center">
                                        <Icon icon="mdi:video-off-outline" className="text-5xl text-neutral-700" />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>


                    {/* Player Controls - shrink-0 evita que esta barra se comprima */}
                    <div className="h-14 border-t border-white/5 flex items-center justify-between px-6 bg-[#09090B] shrink-0">
                        <div className="flex items-center gap-4 text-xs">
                            <button><Icon icon="material-symbols:fullscreen" width="18" /></button>
                            <div className="flex items-center gap-2">
                                <button><Icon icon="mingcute:zoom-in-line" width="18" /></button>
                                <div className="w-24 h-1 bg-gray-800 rounded-full">
                                    <div className="w-1/2 h-full bg-gray-500 rounded-full relative">
                                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full"></div>
                                    </div>
                                </div>
                                <button><Icon icon="mingcute:zoom-out-line" width="18" /></button>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <span className="text-xs font-mono">{formatTime(currentTime)}</span>
                            <div className="flex items-center gap-3">
                                <button className="hover:text-white" onClick={skipBackward}><Icon icon="mdi:rewind-5" width="22" /></button>
                                <button className="hover:text-white" onClick={togglePlayPause}>
                                    <Icon icon={isPlaying ? "mdi:pause" : "mdi:play"} width="28" />
                                </button>
                                <button className="hover:text-white" onClick={skipForward}><Icon icon="mdi:fast-forward-5" width="22" /></button>
                            </div>
                            <span className="text-xs font-mono">{formatTime(videoDuration)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" className="gap-2 px-3 py-2">
                                <Icon icon="mdi:crop" width="16" /> Recortar
                            </Button>
                            <AspectRatioSelect />
                        </div>
                    </div>
                </div>
            </div>

            {/* --- BOTTOM SECTION (TIMELINE) --- */}
            <div className="h-[152px] shrink-0 bg-[#0D0D11] border-t border-white/[0.06] flex flex-col font-mono text-[10px]">

                {/* Ruler row */}
                <div
                    className="h-7 border-b border-white/[0.04] flex items-center relative overflow-hidden cursor-pointer shrink-0"
                    onClick={handleSeek}
                >
                    {/* Ruler marks offset to match track area start */}
                    <div className="absolute left-20 right-0 flex justify-between px-3 text-zinc-700">
                        {videoDuration > 0 ? (
                            Array.from({ length: 7 }, (_, i) => (
                                <span key={i}>{formatTime((videoDuration / 6) * i)}</span>
                            ))
                        ) : (
                            <>
                                <span>00:00</span><span>00:01</span><span>00:02</span>
                                <span>00:03</span><span>00:04</span><span>00:05</span><span>00:06</span>
                            </>
                        )}
                    </div>

                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-px bg-blue-500 z-10 transition-[left]"
                        style={{ left: `calc(80px + ${videoDuration > 0 ? (currentTime / videoDuration) : 0} * (100% - 80px))` }}
                    >
                        <div className="w-3 h-3 bg-blue-500 rounded-sm -ml-[5px]" />
                    </div>
                </div>

                {/* Tracks */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Track label sidebar */}
                    <div className="w-20 shrink-0 border-r border-white/[0.04] flex flex-col">
                        <div className="flex-1 flex items-center px-3">
                            <span className="text-[9px] uppercase font-semibold tracking-wider text-zinc-700">Video</span>
                        </div>
                        <div className="flex-1 flex items-center px-3 border-t border-white/[0.04]">
                            <span className="text-[9px] uppercase font-semibold tracking-wider text-zinc-700">Zoom</span>
                        </div>
                    </div>

                    {/* Track content area */}
                    <div className="flex-1 flex flex-col overflow-x-auto overflow-y-hidden">
                        {/* Video track */}
                        <div className="flex-1 flex items-center px-2 py-1.5">
                            <div
                                className="h-full rounded-md flex items-center px-3 relative border border-[#34A853]/25 bg-[#182e20]"
                                style={{ width: videoUrl ? '100%' : '95%' }}
                            >
                                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#34A853] rounded-l-md" />
                                <div className="absolute right-0 top-0 bottom-0 w-[3px] bg-[#34A853] rounded-r-md" />
                                <span className="text-emerald-400/50 ml-2">
                                    {videoUrl ? 'Video grabado' : 'Sin video'} · {formatTime(videoDuration)}
                                </span>
                            </div>
                        </div>

                        {/* Zoom track */}
                        <div className="flex-1 flex gap-24 ml-[15%] py-1"> <div className="w-48 h-full bg-[#3B82F6]/80 rounded flex flex-col items-center justify-center text-white border border-[#60A5FA]"> <span>Zoom</span> <span className="scale-75">Q 2.0x 1.00s</span> </div> <div className="w-48 h-full bg-[#3B82F6]/80 rounded flex flex-col items-center justify-center text-white border border-[#60A5FA]"> <span>Zoom</span> <span className="scale-75">Q 2.0x 1.00s</span> </div> </div>
                    </div>
                </div>
            </div>

        </div>
    );
}