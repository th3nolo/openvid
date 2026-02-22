import EditorPreview from "../components/ui/editor-preview";
import Hero from "../components/ui/hero";
import InteractiveRecordingSteps from "../components/ui/recordingSteps";
export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative pt-32 pb-20 overflow-hidden bg-gradient-radial-primary w-full">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] rounded-[100%] blur-3xl pointer-events-none -z-10"></div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <Hero />
          <EditorPreview />
        </div>
      </section>

      <section className="w-full py-16">
        <div className="max-w-6xl mx-auto px-6">
          <InteractiveRecordingSteps />
        </div>
      </section>
    </div>
  );
}