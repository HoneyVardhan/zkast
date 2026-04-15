'use client'

import { LayoutGrid, ShieldCheck, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-black text-white relative overflow-hidden">
      {/* Background radial gradient for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#0f1f1d,transparent_70%)] pointer-events-none" />

      <div className="z-10 w-full max-w-5xl items-center justify-center font-mono text-sm flex flex-col gap-12 text-center">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-500 text-[10px] font-bold uppercase tracking-widest">
            <Zap size={10} fill="currentColor" />
            V2 Migration Complete
          </div>
          <h1 className="text-6xl font-black tracking-tighter sm:text-7xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            Algorand Wallet<br />Development Kit
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl mx-auto leading-relaxed font-sans">
            The next generation of wallet connectivity. Seamlessly integrate Pera, Defly, and Lute into your decentralized applications with optimized UI components.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mt-8">
          <FeatureCard 
            icon={<ShieldCheck className="text-teal-500" size={20} />}
            title="Secure Connect" 
            desc="Encrypted sessions with industry-standard wallet protocols."
          />
          <FeatureCard 
            icon={<Zap className="text-teal-500" size={20} />}
            title="Ultra Fast" 
            desc="Optimized for zero-latency interactions and real-time state sync."
          />
          <FeatureCard 
            icon={<LayoutGrid className="text-teal-500" size={20} />}
            title="UI Library" 
            desc="Pre-built components with full dark mode support out of the box."
          />
        </div>
      </div>
    </main>
  )
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="p-8 border border-zinc-800 bg-zinc-900/30 rounded-2xl hover:bg-zinc-900/50 hover:border-teal-500/30 transition-all group text-left backdrop-blur-sm">
      <div className="mb-4 p-3 rounded-xl bg-zinc-900 border border-zinc-800 w-fit group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-bold text-white mb-2 uppercase text-xs tracking-widest">{title}</h3>
      <p className="text-sm text-zinc-500 leading-relaxed font-sans">{desc}</p>
    </div>
  )
}
