import React, { useState } from 'react';
import { FileText, X, ZoomIn, ZoomOut, ArrowLeft, ArrowRight, Download, CheckCircle, School } from 'lucide-react';

interface PdfPreviewModalProps {
  documentTitle: string;
  fileName: string;
  fileSize?: string;
  pageCount?: number;
  subject?: string;
  onDismiss: () => void;
}

export const PdfPreviewModal: React.FC<PdfPreviewModalProps> = ({
  documentTitle,
  fileName,
  fileSize = '1.8 MB',
  pageCount = 4,
  subject = 'IPA / Modul Ajar',
  onDismiss,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [zoomScale, setZoomScale] = useState(1.0);

  const pageTitles = [
    'Hal 1: Identitas & CP',
    'Hal 2: Materi & Pemantik',
    'Hal 3: LKPD Siswa',
    'Hal 4: Rubrik Asesmen',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative flex flex-col w-full max-w-4xl h-[92vh] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-[#3e4042]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-[#3e4042] bg-white dark:bg-[#242526]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-red-600 text-white shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate max-w-xs sm:max-w-md">
                {fileName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {fileSize} · {subject} · Halaman {currentPage} dari {pageCount}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setZoomScale((prev) => (prev >= 1.25 ? 1.0 : 1.25))}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
              title="Perbesar / Perkecil"
            >
              {zoomScale > 1.0 ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                alert(`Mengunduh berkas '${fileName}'...`);
              }}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
              title="Unduh PDF"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onDismiss}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Page Switcher Navigation */}
        <div className="flex items-center gap-2 px-5 py-2 bg-slate-50 dark:bg-[#18191a] border-b border-slate-200 dark:border-[#3e4042] overflow-x-auto text-xs">
          {pageTitles.map((title, idx) => {
            const pageNum = idx + 1;
            const isSelected = currentPage === pageNum;
            return (
              <button
                key={title}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-[#1877F2] text-white shadow-sm'
                    : 'bg-white dark:bg-[#242526] text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] border border-slate-200 dark:border-[#3e4042]'
                }`}
              >
                {title}
              </button>
            );
          })}
        </div>

        {/* Document Content Canvas */}
        <div className="flex-1 overflow-y-auto bg-slate-200 dark:bg-[#121212] p-4 sm:p-6 flex justify-center">
          <div
            className={`w-full max-w-2xl bg-white text-slate-900 shadow-xl rounded-sm p-6 sm:p-8 transition-transform duration-200 origin-top border border-slate-300 ${
              zoomScale > 1.0 ? 'scale-105' : 'scale-100'
            }`}
          >
            {currentPage === 1 && (
              <div className="space-y-4">
                {/* Official Letterhead */}
                <div className="flex items-center gap-3 border-b-2 border-black pb-3">
                  <div className="w-13 h-13 rounded-xl bg-white border border-slate-300 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                    <img
                      src="/ic_logo_bilindi.jpg"
                      alt="Logo SMP Negeri Sinombayuga"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 text-center">
                    <h3 className="text-xs font-bold tracking-wide uppercase">
                      Kementerian Pendidikan, Kebudayaan, Riset dan Teknologi
                    </h3>
                    <h2 className="text-sm font-black text-[#0d47a1] uppercase">
                      SMP Negeri Sinombayuga
                    </h2>
                    <p className="text-[10px] text-slate-600">
                      Jalan Pendidikan No. 12, Sinombayuga · Surel: info@smpnsinombayuga.sch.id
                    </p>
                  </div>
                </div>

                <div className="text-center py-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Modul Ajar Kurikulum Merdeka
                  </span>
                  <h1 className="text-base sm:text-lg font-extrabold text-[#1877F2] uppercase">
                    {documentTitle}
                  </h1>
                </div>

                {/* Metadata Table */}
                <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs space-y-1">
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Mata Pelajaran</span>
                    <span className="col-span-2 font-semibold">Ilmu Pengetahuan Alam (IPA)</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Fase / Kelas</span>
                    <span className="col-span-2 font-semibold">Fase D / Kelas VII (Tujuh)</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Semester / TP</span>
                    <span className="col-span-2 font-semibold">Semester Ganjil / 2026-2027</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Alokasi Waktu</span>
                    <span className="col-span-2 font-semibold">2 x 40 Menit (1 Pertemuan)</span>
                  </div>
                  <div className="grid grid-cols-3">
                    <span className="text-slate-500">Penyusun</span>
                    <span className="col-span-2 font-semibold">Salehuddin, S.Pd (Guru Penggerak)</span>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    A. Capaian Pembelajaran & Tujuan
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    Peserta didik memahami sistem tata surya, karakteristik anggota tata surya, orbit planet mengelilingi matahari, serta keterkaitannya dengan gaya gravitasi semesta dan fenomena alam di bumi.
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    B. Profil Pelajar Pancasila
                  </h4>
                  <ul className="text-xs text-slate-700 mt-1 space-y-1 list-disc list-inside">
                    <li><strong className="font-semibold">Bernalar Kritis:</strong> Menganalisis alasan planet tidak bertabrakan saat mengorbit.</li>
                    <li><strong className="font-semibold">Mandiri:</strong> Menyelesaikan lembar pengamatan simulasi laboratorium mandiri.</li>
                    <li><strong className="font-semibold">Gotong Royong:</strong> Berkolaborasi dalam kelompok merumuskan kesimpulan fenomena.</li>
                  </ul>
                </div>
              </div>
            )}

            {currentPage === 2 && (
              <div className="space-y-4">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="text-sm font-bold text-[#0d47a1]">
                    Kegiatan Pembelajaran & Materi Esensial
                  </h3>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    1. Pertanyaan Pemantik (Apersepsi)
                  </h4>
                  <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-1 text-xs text-amber-900 italic">
                    "Pernahkah kalian melihat bintang jatuh di langit malam? Sebenarnya apa itu bintang jatuh? Dan mengapa planet-planet mengitari matahari secara teratur tanpa pernah bertabrakan?"
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    2. Eksplorasi Konsep Utama
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    Sistem Tata Surya kita terdiri atas Matahari sebagai pusat massa gravitasi, 8 planet utama, komet, meteoroid, dan sabuk asteroid. Gravitasi matahari menjaga stabilitas orbit setiap planet berdasarkan hukum Kepler dan gravitasi universal Newton.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-2">
                  <h5 className="font-bold text-slate-900">Tabel Pengelompokan Planet:</h5>
                  <div className="grid grid-cols-3 gap-1 border-t border-slate-200 pt-1">
                    <span className="font-medium">Terestrial (Kebumian)</span>
                    <span className="col-span-2 text-slate-600">Merkurius, Venus, Bumi, Mars (Padat berbatu)</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 border-t border-slate-200 pt-1">
                    <span className="font-medium">Jovian (Raksasa Gas)</span>
                    <span className="col-span-2 text-slate-600">Jupiter, Saturnus, Uranus, Neptunus</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 border-t border-slate-200 pt-1">
                    <span className="font-medium">Pembatas Orbit</span>
                    <span className="col-span-2 text-slate-600">Sabuk Asteroid (antara Mars & Jupiter)</span>
                  </div>
                </div>
              </div>
            )}

            {currentPage === 3 && (
              <div className="space-y-4">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="text-sm font-bold text-[#10b981]">
                    Lembar Kerja Peserta Didik (LKPD) Terstruktur
                  </h3>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">Petunjuk Kerja Siswa:</h4>
                  <ol className="text-xs text-slate-700 mt-1 space-y-1 list-decimal list-inside">
                    <li>Buka simulasi PhET atau video pembelajaran yang disisipkan oleh guru di BilindiWall.</li>
                    <li>Amati hubungan jarak orbit dengan periode revolusi planet terhadap matahari.</li>
                    <li>Lengkapi tabel pengamatan di bawah ini dengan tepat dan teliti.</li>
                  </ol>
                </div>

                <div className="overflow-hidden border border-slate-300 rounded text-[11px]">
                  <table className="w-full text-left">
                    <thead className="bg-slate-900 text-white">
                      <tr>
                        <th className="p-2">No</th>
                        <th className="p-2">Objek Planet</th>
                        <th className="p-2">Jarak (AU)</th>
                        <th className="p-2">Karakteristik Kunci</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr><td className="p-2 font-mono">1</td><td className="p-2 font-semibold">Merkurius</td><td className="p-2">0.39 AU</td><td className="p-2 text-slate-600">Suhu ekstrem, tanpa atmosfer</td></tr>
                      <tr><td className="p-2 font-mono">2</td><td className="p-2 font-semibold">Venus</td><td className="p-2">0.72 AU</td><td className="p-2 text-slate-600">Efek rumah kaca terkuat, terpanas</td></tr>
                      <tr><td className="p-2 font-mono">3</td><td className="p-2 font-semibold">Bumi</td><td className="p-2">1.00 AU</td><td className="p-2 text-slate-600">Air cair, oksigen, kehidupan</td></tr>
                      <tr><td className="p-2 font-mono">4</td><td className="p-2 font-semibold">Mars</td><td className="p-2">1.52 AU</td><td className="p-2 text-slate-600">Planet merah, kaya oksida besi</td></tr>
                      <tr><td className="p-2 font-mono">5</td><td className="p-2 font-semibold">Jupiter</td><td className="p-2">5.20 AU</td><td className="p-2 text-slate-600">Planet terbesar, bintik merah raksasa</td></tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3 text-xs text-blue-900">
                  <span className="font-bold">Pertanyaan Analisis:</span>
                  <p className="mt-1 italic">
                    "Mengapa semakin jauh posisi sebuah planet dari matahari, periode revolusinya menjadi semakin lama? Hubungkan jawabanmu dengan gaya gravitasi!"
                  </p>
                </div>
              </div>
            )}

            {currentPage === 4 && (
              <div className="space-y-4">
                <div className="border-b border-slate-300 pb-2">
                  <h3 className="text-sm font-bold text-[#ef4444]">
                    Rubrik Asesmen & Refleksi Pembelajaran
                  </h3>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    1. Kriteria Ketercapaian Tujuan Pembelajaran (KKTP)
                  </h4>
                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex gap-2">
                      <span className="font-semibold text-emerald-700 min-w-28">Sangat Mahir (90-100):</span>
                      <span className="text-slate-600">Mampu memodelkan gaya gravitasi dan orbit 8 planet secara matematis dan konseptual.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold text-blue-700 min-w-28">Mahir (75-89):</span>
                      <span className="text-slate-600">Mampu mengelompokkan planet dan menjelaskan alasan stabilitas orbit tata surya.</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="font-semibold text-amber-700 min-w-28">Perlu Bimbingan (&lt;75):</span>
                      <span className="text-slate-600">Belum dapat mengurutkan planet dan konsep dasar gravitasi matahari.</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-between text-[11px] text-slate-700">
                  <div className="text-center">
                    <p>Mengetahui,</p>
                    <p className="font-semibold">Kepala SMP Negeri Sinombayuga</p>
                    <div className="h-10"></div>
                    <p className="font-bold underline">Drs. H. Ahmad</p>
                    <p className="text-[10px] text-slate-500">NIP. 19700315 199503 1 002</p>
                  </div>

                  <div className="text-center">
                    <p>Sinombayuga, September 2026</p>
                    <p className="font-semibold">Guru Pengampu IPA</p>
                    <div className="h-10"></div>
                    <p className="font-bold underline">Salehuddin, S.Pd</p>
                    <p className="text-[10px] text-slate-500">NIP. 19820415 200801 1 011</p>
                  </div>
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="mt-8 pt-3 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                Dokumen Resmi Terverifikasi · BilindiWall SMP Negeri Sinombayuga
              </span>
              <span className="font-semibold text-slate-600">
                Halaman {currentPage} dari {pageCount}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom Pagination Control */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-[#3e4042] bg-white dark:bg-[#242526]">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] disabled:opacity-40 disabled:cursor-not-allowed border border-slate-200 dark:border-[#3e4042]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Halaman Sebelumnya
          </button>

          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Halaman {currentPage} / {pageCount}
          </span>

          <button
            onClick={() => setCurrentPage((p) => Math.min(pageCount, p + 1))}
            disabled={currentPage === pageCount}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#1877F2] text-white hover:bg-[#166fe5] disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            Halaman Berikutnya
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
