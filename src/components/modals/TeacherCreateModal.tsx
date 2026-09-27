import React, { useState } from 'react';
import {
  X,
  BookOpen,
  ClipboardList,
  FileText,
  Video,
  Code,
  Image,
  Eye,
  Info,
  Upload,
  Loader2,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post, SectionData, StructuredLearningContent } from '../../types';
import { PdfPreviewModal } from './PdfPreviewModal';
import { SupabaseSyncService } from '../../services/supabaseSyncService';

interface TeacherCreateModalProps {
  initialPost?: Post | null;
  initialTab?: number;
  onDismiss: () => void;
}

export const TeacherCreateModal: React.FC<TeacherCreateModalProps> = ({
  initialPost,
  initialTab = 0,
  onDismiss,
}) => {
  const { currentUser, addPost, updatePost, availableClasses } = useApp();

  const [activeTab, setActiveTab] = useState<number>(
    initialPost
      ? initialPost.type === 'ASSIGNMENT'
        ? 1
        : 0
      : initialTab
  );

  // Tab 0: Modul Terstruktur
  const [materiTitle, setMateriTitle] = useState(initialPost?.title || '');
  const [materiClass, setMateriClass] = useState(
    initialPost?.targetClass || 'Semua Kelas'
  );

  const initStruct = initialPost?.structuredContent;
  const [headerMedia, setHeaderMedia] = useState<SectionData>(
    initStruct?.headerSection || {
      text: '',
      imageUrl: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?auto=format&fit=crop&q=80&w=800',
    }
  );
  const [pemantik, setPemantik] = useState<SectionData>(
    initStruct?.pemantik || {
      text: 'Pernahkah kalian melihat bintang jatuh di langit malam? Sebenarnya apa itu bintang jatuh dan mengapa planet mengitari matahari tanpa bertabrakan?',
    }
  );
  const [tujuan, setTujuan] = useState<SectionData>(
    initStruct?.tujuan || {
      text: 'Siswa dapat mengidentifikasi 8 komponen utama sistem tata surya, orbit planet, dan karakteristik sabuk asteroid.',
    }
  );
  const [inti, setInti] = useState<SectionData>(
    initStruct?.inti || {
      text: 'Perhatikan simulasi orbit planet secara interaktif. Tarik massa planet untuk melihat perubahan gaya gravitasi secara langsung.',
      embedUrl: 'https://phet.colorado.edu/sims/html/gravity-and-orbits/latest/gravity-and-orbits_en.html',
      fileName: 'Simulasi Gravitasi PhET Interactive Lab',
      videoUrl: 'https://www.youtube.com/watch?v=libKVRa01L8',
      pdfName: 'Modul_Ajar_IPA_Sistem_Tata_Surya.pdf',
    }
  );
  const [asesmen, setAsesmen] = useState<SectionData>(
    initStruct?.asesmen || {
      text: 'Tuliskan nama-nama planet berurutan dari yang terdekat dengan matahari beserta periode rotasinya pada kolom komentar atau postingan mandiri!',
      pdfName: 'LKPD_Pengamatan_Fenomena_Antariksa.pdf',
    }
  );

  // Tab 1: Tugas & Asesmen
  const [tugasTitle, setTugasTitle] = useState(
    initialPost?.type === 'ASSIGNMENT' ? initialPost.title?.replace(/^TUGAS:\s*/i, '') || '' : ''
  );
  const [tugasDeskripsi, setTugasDeskripsi] = useState(
    initialPost?.type === 'ASSIGNMENT' ? initialPost.content || '' : ''
  );
  const [tugasClass, setTugasClass] = useState(
    initialPost?.targetClass || 'VII-A'
  );
  const [tugasDeadline, setTugasDeadline] = useState(
    initialPost?.assignmentDetail?.deadline || 'Besok, 23:59'
  );
  const [tugasAttachment, setTugasAttachment] = useState(
    initialPost?.assignmentDetail?.attachmentName || 'Panduan_Praktik_Gerhana_IPA7.pdf'
  );

  // Preview PDF state
  const [pdfPreview, setPdfPreview] = useState<{ title: string; file: string } | null>(null);
  const [uploadingField, setUploadingField] = useState<string | null>(null);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'header' | 'video' | 'pdf' | 'lkpd' | 'tugas'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(field);
    try {
      const url = await SupabaseSyncService.instance.uploadMedia(
        file,
        field === 'header' ? 'headers' : field === 'video' ? 'videos' : 'modules'
      );

      if (field === 'header') {
        setHeaderMedia((prev) => ({ ...prev, imageUrl: url }));
      } else if (field === 'video') {
        setInti((prev) => ({ ...prev, videoUrl: url }));
      } else if (field === 'pdf') {
        setInti((prev) => ({ ...prev, pdfName: file.name, pdfUrl: url }));
      } else if (field === 'lkpd') {
        setAsesmen((prev) => ({ ...prev, pdfName: file.name, pdfUrl: url }));
      } else if (field === 'tugas') {
        setTugasAttachment(file.name);
      }
    } catch (err) {
      console.error('Gagal upload berkas modul:', err);
    } finally {
      setUploadingField(null);
    }
  };

  // Auto-generated hashtag
  const cleanSubject = (currentUser?.subject || 'IPA').replace(/\s+/g, '').slice(0, 4);
  const cleanClass = tugasClass.replace(/-/g, '');
  const cleanTitle = (tugasTitle || 'Tugas').replace(/\s+/g, '').slice(0, 8);
  const generatedHashtag = `#Tugas${cleanSubject}${cleanClass}${cleanTitle}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 0) {
      // Modul Terstruktur
      if (!materiTitle.trim()) return;
      const structured: StructuredLearningContent = {
        headerSection: headerMedia,
        pemantik,
        tujuan,
        inti,
        asesmen,
      };

      if (initialPost) {
        updatePost({
          ...initialPost,
          title: materiTitle.trim(),
          targetClass: materiClass,
          structuredContent: structured,
        });
      } else {
        addPost({
          type: 'LEARNING',
          status: 'APPROVED',
          title: materiTitle.trim(),
          targetClass: materiClass,
          structuredContent: structured,
        });
      }
    } else {
      // Tugas & Asesmen
      if (!tugasTitle.trim()) return;
      const formattedTitle = tugasTitle.toLowerCase().startsWith('tugas') ? tugasTitle : `TUGAS: ${tugasTitle}`;
      const defaultDesc =
        tugasDeskripsi.trim() ||
        `📢 INSTRUKSI TUGAS:\nLakukan simulasi praktik menggunakan alat sederhana di rumah.\n\n⚠️ Cara Mengumpulkan:\nBuat postingan baru di BilindiWall dengan foto hasil simulasi, dan WAJIB sertakan hashtag ${generatedHashtag} agar otomatis terdata oleh guru.`;

      if (initialPost) {
        updatePost({
          ...initialPost,
          title: formattedTitle,
          content: defaultDesc,
          targetClass: tugasClass,
          hashtag: generatedHashtag,
          assignmentDetail: {
            deadline: tugasDeadline,
            targetClass: tugasClass,
            attachmentName: tugasAttachment,
            attachmentType: 'pdf',
          },
        });
      } else {
        addPost({
          type: 'ASSIGNMENT',
          status: 'APPROVED',
          title: formattedTitle,
          content: defaultDesc,
          targetClass: tugasClass,
          hashtag: generatedHashtag,
          assignmentDetail: {
            deadline: tugasDeadline,
            targetClass: tugasClass,
            attachmentName: tugasAttachment,
            attachmentType: 'pdf',
          },
        });
      }
    }
    onDismiss();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
        <div className="relative flex flex-col w-full max-w-3xl h-[92vh] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#3e4042] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#3e4042]">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {initialPost ? 'Edit Pembelajaran Guru' : 'Publikasi Pembelajaran Guru'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pendidik: {currentUser?.name} ({currentUser?.subject || 'Guru Pengampu'})
              </p>
            </div>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-2 border-b border-slate-200 dark:border-[#3e4042] bg-slate-50 dark:bg-[#18191a]">
            <button
              type="button"
              onClick={() => setActiveTab(0)}
              className={`flex items-center justify-center gap-2 py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 0
                  ? 'border-[#1877F2] text-[#1877F2] bg-white dark:bg-[#242526]'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              Modul Terstruktur (4 Segmen)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab(1)}
              className={`flex items-center justify-center gap-2 py-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 1
                  ? 'border-red-600 text-red-600 bg-white dark:bg-[#242526]'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              Tugas & Asesmen Otomatis
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
            {activeTab === 0 ? (
              // TAB 0: MODUL TERSTRUKTUR
              <div className="space-y-4">
                {/* Title & Class */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Judul Materi / Topik Modul
                    </label>
                    <input
                      type="text"
                      value={materiTitle}
                      onChange={(e) => setMateriTitle(e.target.value)}
                      placeholder="cth: Materi Baru: Sistem Tata Surya"
                      required
                      className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:border-[#1877F2] focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Target Kelas
                    </label>
                    <select
                      value={materiClass}
                      onChange={(e) => setMateriClass(e.target.value)}
                      className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#1877F2] focus:outline-hidden"
                    >
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Banner / Gambar Header Modul */}
                <div className="p-3.5 bg-slate-50 dark:bg-[#18191a] rounded-xl border border-slate-200 dark:border-[#3e4042] space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Image className="w-4 h-4 text-[#1877F2]" />
                      <span>Banner / Gambar Sampul Modul:</span>
                    </label>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#1877F2] text-white hover:bg-[#166fe5] shadow-xs">
                      {uploadingField === 'header' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Unggah Gambar dari Komputer</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'header')}
                        disabled={uploadingField === 'header'}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {headerMedia.imageUrl && (
                    <div className="relative w-full h-28 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700">
                      <img src={headerMedia.imageUrl} alt="Banner" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* 1. Pertanyaan Pemantik */}
                <div className="p-4 rounded-xl border border-amber-300 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    💡 1. Pertanyaan Pemantik (Apersepsi)
                  </span>
                  <textarea
                    rows={2}
                    value={pemantik.text}
                    onChange={(e) => setPemantik({ ...pemantik, text: e.target.value })}
                    placeholder="Pertanyaan untuk memantik rasa penasaran siswa..."
                    className="w-full bg-white dark:bg-[#3a3b3c] border border-amber-200 dark:border-amber-900 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* 2. Tujuan Pembelajaran */}
                <div className="p-4 rounded-xl border border-blue-300 bg-blue-50/50 dark:bg-blue-950/20 space-y-2">
                  <span className="text-xs font-bold text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                    🎯 2. Tujuan Pembelajaran
                  </span>
                  <textarea
                    rows={2}
                    value={tujuan.text}
                    onChange={(e) => setTujuan({ ...tujuan, text: e.target.value })}
                    placeholder="Kompetensi yang akan dicapai peserta didik..."
                    className="w-full bg-white dark:bg-[#3a3b3c] border border-blue-200 dark:border-blue-900 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* 3. Materi Inti & Media */}
                <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1.5">
                    📚 3. Materi Inti & Eksplorasi (Simulasi PhET / Video / PDF)
                  </span>
                  <textarea
                    rows={3}
                    value={inti.text}
                    onChange={(e) => setInti({ ...inti, text: e.target.value })}
                    placeholder="Uraian materi inti atau petunjuk kerja simulasi..."
                    className="w-full bg-white dark:bg-[#3a3b3c] border border-emerald-200 dark:border-emerald-900 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white resize-none"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-0.5">
                        Link Simulasi PhET (Embed):
                      </label>
                      <input
                        type="url"
                        value={inti.embedUrl || ''}
                        onChange={(e) => setInti({ ...inti, embedUrl: e.target.value })}
                        placeholder="https://phet.colorado.edu/..."
                        className="w-full bg-white dark:bg-[#3a3b3c] border border-emerald-200 dark:border-emerald-900 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          Video Materi (MP4 / YouTube):
                        </label>
                        <label className="cursor-pointer text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
                          {uploadingField === 'video' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                          <span>Unggah Video</span>
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileUpload(e, 'video')}
                            disabled={uploadingField === 'video'}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <input
                        type="text"
                        value={inti.videoUrl || ''}
                        onChange={(e) => setInti({ ...inti, videoUrl: e.target.value })}
                        placeholder="Unggah video atau https://..."
                        className="w-full bg-white dark:bg-[#3a3b3c] border border-emerald-200 dark:border-emerald-900 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        Nama Berkas Modul PDF:
                      </label>
                      <label className="cursor-pointer text-[10px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1">
                        {uploadingField === 'pdf' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                        <span>Unggah Dokumen PDF</span>
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => handleFileUpload(e, 'pdf')}
                          disabled={uploadingField === 'pdf'}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inti.pdfName || ''}
                        onChange={(e) => setInti({ ...inti, pdfName: e.target.value })}
                        placeholder="Modul_Ajar_IPA_Sistem_Tata_Surya.pdf"
                        className="flex-1 bg-white dark:bg-[#3a3b3c] border border-emerald-200 dark:border-emerald-900 rounded-lg px-2.5 py-1.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setPdfPreview({
                            title: materiTitle || 'Modul Ajar',
                            file: inti.pdfName || 'Modul_Ajar_IPA_Sistem_Tata_Surya.pdf',
                          })
                        }
                        className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview PDF
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4. Asesmen / LKPD */}
                <div className="p-4 rounded-xl border border-red-300 bg-red-50/50 dark:bg-red-950/20 space-y-2">
                  <span className="text-xs font-bold text-red-800 dark:text-red-400 flex items-center gap-1.5">
                    📝 4. Asesmen Formatif & LKPD Siswa
                  </span>
                  <textarea
                    rows={2}
                    value={asesmen.text}
                    onChange={(e) => setAsesmen({ ...asesmen, text: e.target.value })}
                    placeholder="Instruksi pengerjaan LKPD siswa atau kuis refleksi..."
                    className="w-full bg-white dark:bg-[#3a3b3c] border border-red-200 dark:border-red-900 rounded-lg p-2.5 text-xs text-slate-900 dark:text-white resize-none"
                  />
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={asesmen.pdfName || ''}
                      onChange={(e) => setAsesmen({ ...asesmen, pdfName: e.target.value })}
                      placeholder="LKPD_Pengamatan_Fenomena_Antariksa.pdf"
                      className="flex-1 bg-white dark:bg-[#3a3b3c] border border-red-200 dark:border-red-900 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPdfPreview({
                          title: 'LKPD Siswa',
                          file: asesmen.pdfName || 'LKPD_Pengamatan_Fenomena_Antariksa.pdf',
                        })
                      }
                      className="flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Preview LKPD
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // TAB 1: TUGAS & ASESMEN
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Judul Penugasan
                  </label>
                  <input
                    type="text"
                    value={tugasTitle}
                    onChange={(e) => setTugasTitle(e.target.value)}
                    placeholder="cth: Praktik Simulasi Gerhana Bulan"
                    required
                    className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white focus:border-red-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Kelas Target
                    </label>
                    <select
                      value={tugasClass}
                      onChange={(e) => setTugasClass(e.target.value)}
                      className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                    >
                      {availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Batas Waktu Pengumpulan (Deadline)
                    </label>
                    <input
                      type="text"
                      value={tugasDeadline}
                      onChange={(e) => setTugasDeadline(e.target.value)}
                      placeholder="Besok, 23:59 WIB"
                      className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Instruksi & Panduan Pengerjaan
                  </label>
                  <textarea
                    rows={4}
                    value={tugasDeskripsi}
                    onChange={(e) => setTugasDeskripsi(e.target.value)}
                    placeholder="Tuliskan petunjuk pengerjaan tugas, alat peraga yang dibutuhkan, serta ketentuan penilaian..."
                    className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl p-3 text-xs text-slate-900 dark:text-white resize-none"
                  />
                </div>

                {/* PDF Attachment & Preview */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Lampiran Berkas PDF Panduan Tugas:
                    </label>
                    <label className="cursor-pointer text-xs font-bold text-[#1877F2] hover:underline flex items-center gap-1">
                      {uploadingField === 'tugas' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                      <span>Unggah dari Komputer</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'tugas')}
                        disabled={uploadingField === 'tugas'}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={tugasAttachment}
                      onChange={(e) => setTugasAttachment(e.target.value)}
                      placeholder="Panduan_Praktik_Gerhana_IPA7.pdf"
                      className="flex-1 bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-3 py-2 text-xs"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPdfPreview({
                          title: tugasTitle || 'Panduan Tugas',
                          file: tugasAttachment || 'Panduan_Tugas.pdf',
                        })
                      }
                      className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors shadow-xs"
                    >
                      <Eye className="w-4 h-4" />
                      Preview PDF
                    </button>
                  </div>
                </div>

                {/* Auto-Hashtag Banner */}
                <div className="p-3.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-xl text-xs space-y-1">
                  <div className="flex items-center gap-1.5 text-[#1877F2] font-bold">
                    <Info className="w-4 h-4" />
                    <span>Hashtag Pengumpulan Otomatis:</span>
                  </div>
                  <p className="font-extrabold text-sm text-[#0d47a1] dark:text-blue-300">
                    {generatedHashtag}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400 text-[11px]">
                    Siswa yang memposting tugas dengan tagar ini akan otomatis terhubung ke sistem rekap penilaian kelas Anda.
                  </p>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#3e4042]">
              <button
                type="button"
                onClick={onDismiss}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-sm transition-colors ${
                  activeTab === 0
                    ? 'bg-[#1877F2] hover:bg-[#166fe5]'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {initialPost ? 'Simpan Perubahan' : 'Terbitkan ke Dinding Kelas'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* PDF Preview Modal */}
      {pdfPreview && (
        <PdfPreviewModal
          documentTitle={pdfPreview.title}
          fileName={pdfPreview.file}
          onDismiss={() => setPdfPreview(null)}
        />
      )}
    </>
  );
};
