import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PlusCircle, Users, Calendar, Trash2 } from 'lucide-react';

export default function AdminDashboard() {
  const [activities, setActivities] = useState([]);
  const [participants, setParticipants] = useState([]);
  
  // State Form Kegiatan
  const [actTitle, setActTitle] = useState('');
  const [actDate, setActDate] = useState('');
  
  // State Form Peserta
  const [selectedActId, setSelectedActId] = useState('');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [certNumber, setCertNumber] = useState('');

  useEffect(() => {
    fetchActivities();
    fetchParticipants();
  }, []);

  const fetchActivities = async () => {
    const { data } = await supabase.from('activities').select('*').order('date', { ascending: false });
    if (data) {
      setActivities(data);
      if (data.length > 0 && !selectedActId) setSelectedActId(data[0].id);
    }
  };

  const fetchParticipants = async () => {
    const { data } = await supabase.from('participants').select('*, activities(title)').order('created_at', { ascending: false });
    if (data) setParticipants(data);
  };

  const handleCreateActivity = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('activities').insert([{ title: actTitle, date: actDate }]);
    if (error) {
      alert('Gagal menambah kegiatan: ' + error.message);
    } else {
      setActTitle('');
      setActDate('');
      fetchActivities();
      alert('Kegiatan berhasil ditambahkan!');
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!selectedActId) {
      alert('Pilih kegiatan pelatihan terlebih dahulu!');
      return;
    }

    const { error } = await supabase.from('participants').insert([{
      activity_id: selectedActId,
      full_name: fullName,
      institution: institution,
      certificate_number: certNumber
    }]);

    if (error) {
      alert('Gagal menambah peserta (Pastikan Nomor Sertifikat unik): ' + error.message);
    } else {
      setFullName('');
      setInstitution('');
      setCertNumber('');
      fetchParticipants();
      alert('Peserta berhasil didaftarkan!');
    }
  };

  const handleDeleteParticipant = async (id) => {
    if (confirm('Yakin ingin menghapus data peserta ini?')) {
      const { error } = await supabase.from('participants').delete().eq('id', id);
      if (!error) fetchParticipants();
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
        <h2 className="text-xl font-bold text-emerald-900">Dashboard Administrator</h2>
        <p className="text-emerald-700 text-sm">Kelola jadwal kegiatan pelatihan dan database peserta sertifikat Korwilcam Suruh.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Form Tambah Kegiatan */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={20} className="text-emerald-600" /> Tambah Kegiatan Pelatihan
          </h3>
          <form onSubmit={handleCreateActivity} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Kegiatan</label>
              <input 
                type="text" 
                placeholder="Contoh: Pelatihan Implementasi Kurikulum Merdeka" 
                value={actTitle}
                onChange={(e) => setActTitle(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tanggal Pelaksanaan</label>
              <input 
                type="date" 
                value={actDate}
                onChange={(e) => setActDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none text-sm"
                required
              />
            </div>
            <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg text-sm font-medium transition">
              Simpan Kegiatan
            </button>
          </form>
        </div>

        {/* Form Tambah Peserta */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Users size={20} className="text-emerald-600" /> Tambah Peserta / Undangan
          </h3>
          <form onSubmit={handleAddParticipant} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Pilih Kegiatan</label>
              <select 
                value={selectedActId} 
                onChange={(e) => setSelectedActId(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                required
              >
                {activities.map(act => (
                  <option key={act.id} value={act.id}>{act.title}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input 
                  type="text" 
                  placeholder="Budi Santoso, S.Pd." 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Unit Kerja / Sekolah</label>
                <input 
                  type="text" 
                  placeholder="SDN Suruh 02" 
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-2 text-sm focus:outline-none"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Nomor Sertifikat Unik</label>
              <input 
                type="text" 
                placeholder="421.2/045/Suruh/2026" 
                value={certNumber}
                onChange={(e) => setCertNumber(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-2 text-sm font-mono focus:outline-none"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-1">
              <PlusCircle size={16} /> Daftarkan Peserta
            </button>
          </form>
        </div>
      </div>

      {/* Tabel Data Peserta Terdaftar */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Daftar Peserta Terdaftar di Sistem</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-700 text-sm border-b">
                <th className="p-3">No. Sertifikat</th>
                <th className="p-3">Nama Peserta</th>
                <th className="p-3">Unit Kerja</th>
                <th className="p-3">Kegiatan Pelatihan</th>
                <th className="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {participants.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-3 font-mono text-xs text-slate-600">{p.certificate_number}</td>
                  <td className="p-3 font-semibold text-slate-800">{p.full_name}</td>
                  <td className="p-3 text-slate-600">{p.institution}</td>
                  <td className="p-3 text-slate-600 text-xs">{p.activities?.title}</td>
                  <td className="p-3 text-center">
                    <button 
                      onClick={() => handleDeleteParticipant(p.id)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Hapus Peserta"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}