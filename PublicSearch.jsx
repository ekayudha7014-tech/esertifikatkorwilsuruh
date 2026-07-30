import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Search, Download, Award, Loader2 } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export default function PublicSearch() {
  const [activities, setActivities] = useState([]);
  const [selectedActivityId, setSelectedActivityId] = useState('');
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [activeCert, setActiveCert] = useState(null);
  
  const certificateRef = useRef();

  // Ambil daftar kegiatan saat halaman dimuat
  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const { data, error } = await supabase.from('activities').select('*').order('date', { ascending: false });
    if (!error) {
      setActivities(data);
      if (data.length > 0) setSelectedActivityId(data[0].id);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!selectedActivityId) return;

    setLoading(true);
    setActiveCert(null);

    try {
      let query = supabase
        .from('participants')
        .select('*, activities(*)')
        .eq('activity_id', selectedActivityId);

      if (keyword.trim() !== '') {
        // Filter fleksibel: Mencari kecocokan pada nama lengkap atau unit kerja
        query = query.or(`full_name.ilike.%${keyword}%,institution.ilike.%${keyword}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setResults(data);
    } catch (err) {
      alert('Terjadi kesalahan saat mencari data: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = (participant) => {
    setActiveCert(participant);
    // Tunggu render DOM sebentar sebelum di-convert ke PDF
    setTimeout(() => {
      const element = certificateRef.current;
      const opt = {
        margin: 0,
        filename: `Sertifikat_${participant.full_name.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'landscape' }
      };
      html2pdf().set(opt).from(element).save();
    }, 300);
  };

  const selectedActivityObj = activities.find(a => a.id === selectedActivityId);

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Cari dan Unduh Sertifikat Pelatihan</h2>
        <p className="text-slate-600 mb-6">Pilih kegiatan pelatihan lalu masukkan Nama atau Unit Kerja Anda untuk mengunduh sertifikat.</p>

        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Pilih Kegiatan Pelatihan</label>
            <select 
              value={selectedActivityId} 
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            >
              {activities.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.title} ({new Date(act.date).toLocaleDateString('id-ID')})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cari Nama / Unit Kerja</label>
            <input 
              type="text" 
              placeholder="Contoh: Siti Aminah atau SDN Suruh 01" 
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-end">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
              Cari Sertifikat
            </button>
          </div>
        </form>
      </div>

      {/* Hasil Pencarian */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Hasil Pencarian</h3>
        
        {results.length === 0 ? (
          <p className="text-slate-500 text-center py-8">Belum ada data yang ditampilkan. Silakan lakukan pencarian di atas.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-sm border-b">
                  <th className="p-3">No. Sertifikat</th>
                  <th className="p-3">Nama Lengkap</th>
                  <th className="p-3">Unit Kerja / Instansi</th>
                  <th className="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {results.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="p-3 font-mono text-xs text-slate-600">{row.certificate_number}</td>
                    <td className="p-3 font-semibold text-slate-800">{row.full_name}</td>
                    <td className="p-3 text-slate-600">{row.institution}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => handleDownloadPDF(row)}
                        className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded-md transition"
                      >
                        <Download size={14} /> Unduh PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Hidden Container untuk Template Cetak Sertifikat PDF */}
      <div className="hidden">
        {activeCert && (
          <div 
            ref={certificateRef}
            className="w-[1056px] h-[816px] bg-white border-[16px] border-double border-emerald-800 p-12 text-center relative flex flex-col justify-between font-serif"
            style={{ boxSizing: 'border-box' }}
          >
            <div>
              <div className="flex justify-between items-center border-b-2 border-emerald-800 pb-4 mb-6">
                <div className="text-left">
                  <p className="text-sm font-sans tracking-widest text-emerald-900 font-bold uppercase">KORWILCAM BIDANG PENDIDIKAN</p>
                  <p className="text-xs font-sans text-slate-600">Kecamatan Suruh, Kabupaten Semarang</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-sans text-slate-500">No. Sertifikat:</p>
                  <p className="text-xs font-mono font-bold text-slate-700">{activeCert.certificate_number}</p>
                </div>
              </div>

              <h1 className="text-4xl font-bold uppercase tracking-wider text-slate-900 mt-4">Sertifikat Penghargaan</h1>
              <p className="text-base font-sans text-slate-600 mt-1">Diberikan dengan penuh apresiasi kepada:</p>

              <h2 className="text-5xl font-bold text-emerald-800 my-6 font-serif border-b border-slate-300 pb-2 inline-block px-12">
                {activeCert.full_name}
              </h2>

              <p className="text-lg font-sans text-slate-700">
                Utusan / Unit Kerja: <span className="font-semibold">{activeCert.institution}</span>
              </p>

              <p className="text-base font-sans text-slate-600 mt-4">
                Atas partisipasi aktif dan kontribusinya sebagai peserta dalam kegiatan pelatihan:
              </p>
              
              <h3 className="text-2xl font-bold text-slate-900 mt-2 max-w-2xl mx-auto">
                {selectedActivityObj?.title}
              </h3>
            </div>

            <div className="flex justify-between items-end font-sans mt-8 pt-4">
              <div className="text-left text-xs text-slate-500">
                <p>Dokumen ini diterbitkan secara resmi melalui sistem elektronik</p>
                <p>Korwilcam Bidang Pendidikan Kecamatan Suruh.</p>
              </div>
              <div className="text-center w-64">
                <p className="text-sm text-slate-700">Suruh, {new Date(selectedActivityObj?.date || Date.now()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="text-sm font-bold text-slate-800 mt-1">Korwilcam Bidang Pendidikan</p>
                <div className="h-16"></div> {/* Space untuk tanda tangan / stempel */}
                <p className="font-bold text-sm underline text-slate-900">Tim Pengelola / Panitia</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}