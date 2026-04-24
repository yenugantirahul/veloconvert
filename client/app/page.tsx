import Navbar from "@/components/Navbar";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#131315] font-sans text-[#e5e1e4]">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] rounded-full bg-[#4cd7f6] opacity-[0.08] blur-[120px]" />
        <div className="absolute right-[-10%] bottom-[-10%] h-[60%] w-[60%] rounded-full bg-[#4edea3] opacity-[0.06] blur-[150px]" />
      </div>


      <main className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-6 pt-32 pb-16 md:px-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-6 text-center lg:text-left">
            <h1 className="bg-gradient-to-br from-white to-zinc-500 bg-clip-text font-display text-5xl font-bold text-transparent md:text-6xl">
              Convert Files in Seconds
            </h1>

            <p className="mx-auto max-w-xl text-lg text-zinc-400 lg:mx-0">
              Fast, secure, and effortless file conversion. Built for speed and scale.
            </p>

            <div className="flex justify-center gap-4 lg:justify-start">
              <button className="rounded bg-gradient-to-br from-[#4cd7f6] to-[#4edea3] px-8 py-3 text-sm font-semibold text-[#003640]">
                Start Converting
              </button>

              <button className="rounded border border-white/10 px-8 py-3 text-sm hover:bg-[#2a2a2c]">
                See How It Works
              </button>
            </div>
          </div>

          <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
            <div className="rounded-lg border-2 border-dashed border-[#3d494c] p-10 text-center">
              <p className="text-lg font-medium">Drag & Drop files</p>
              <p className="text-sm text-zinc-400">or click to upload</p>
            </div>

            <div className="mt-6 rounded-lg bg-[#201f22] p-4">
              <p className="text-sm">presentation.mp4</p>
              <p className="text-xs text-[#4cd7f6]">Converting... 65%</p>

              <div className="mt-2 h-1 rounded bg-[#2a2a2c]">
                <div className="h-full w-[65%] rounded bg-gradient-to-r from-[#4cd7f6] to-[#4edea3]" />
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-900 bg-zinc-950 py-10 text-center text-sm text-zinc-500">
        © 2026 VeloConvert — Built for performance
      </footer>
    </div>
  );
}