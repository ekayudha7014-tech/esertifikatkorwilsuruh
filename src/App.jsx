import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PublicSearch from './pages/PublicSearch';
import AdminDashboard from './pages/AdminDashboard';
import { ShieldCheck, Search } from 'lucide-react';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
        {/* Navbar */}
        <header className="bg-emerald-800 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold">E-Sertifikat Korwilcam Suruh</h1>
              <p className="text-xs text-emerald-200">Bidang Pendidikan Kecamatan Suruh</p>
            </div>
            <nav className="flex gap-4">
              <Link to="/" className="flex items-center gap-1 px-3 py-2 rounded hover:bg-emerald-700 transition">
                <Search size={18} /> Cari Sertifikat
              </Link>
              <Link to="/admin" className="flex items-center gap-1 px-3 py-2 rounded bg-emerald-900 hover:bg-emerald-950 transition border border-emerald-700">
                <ShieldCheck size={18} /> Admin Dashboard
              </Link>
            </nav>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<PublicSearch />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-slate-800 text-slate-400 text-center py-4 text-sm">
          &copy; {new Date().getFullYear()} Korwilcam Bidang Pendidikan Kecamatan Suruh. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}