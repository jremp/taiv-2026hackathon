import React from 'react';
import { Monitor, Calendar, Wrench, ArrowRight } from 'lucide-react';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-2">
          {/* Abstract CSS Logo */}
          <div className="relative w-8 h-8 flex items-center justify-center">
            <div className="absolute inset-0 bg-blue-500 blur-sm opacity-50 rounded-full animate-pulse"></div>
            <div className="z-10 font-black text-xl italic text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500">
              V
            </div>
          </div>
          <div className="text-2xl font-bold tracking-tighter text-blue-400">
            Venue<span className="text-purple-500">Cast</span>
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center justify-center text-center px-4 pt-24 pb-16 max-w-4xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
          Smart Ad Networks. <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            Zero Downtime.
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl">
          A unified platform for managing IoT screen fleets, maximizing ad revenue, and automating maintenance routes.
        </p>
      </main>

      <section className="px-4 py-16 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
        {/* Challenge 1 Link: UserManager & DeviceManager */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
          <Monitor className="text-blue-400 mb-6" size={32} />
          <h3 className="text-xl font-bold mb-3">Fleet Management</h3>
          <p className="text-slate-400 text-sm">
            Complete CRUD control over user accounts and IoT device tracking with geo-fencing capabilities.
          </p>
        </div>

        {/* Challenge 2 Link: Placement & Revenue Engine */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
          <Calendar className="text-purple-400 mb-6" size={32} />
          <h3 className="text-xl font-bold mb-3">Revenue Optimization</h3>
          <p className="text-slate-400 text-sm">
            Intelligent ad scheduling that accounts for location multipliers and advertiser decay to maximize profit.
          </p>
        </div>

        {/* Challenge 3 Link: Technician Dispatch */}
        <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700">
          <Wrench className="text-blue-400 mb-6" size={32} />
          <h3 className="text-xl font-bold mb-3">Maintenance Logistics</h3>
          <p className="text-slate-400 text-sm">
            Algorithmic route optimization and team sizing to ensure every broken device is fixed within the deadline.
          </p>
        </div>
      </section>
    </div>
  );
}