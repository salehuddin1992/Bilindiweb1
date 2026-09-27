import React, { useState } from 'react';
import {
  BookOpen,
  ClipboardList,
  Plus,
  Eye,
  CheckCircle,
  Clock,
  Award,
  Upload,
  Tag,
  ExternalLink,
  Edit,
  Trash2,
  FileText,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Post, Submission, User } from '../../types';
import { TeacherCreateModal } from '../modals/TeacherCreateModal';
import { GradeModal } from '../modals/GradeModal';
import { CreatePostModal } from '../modals/CreatePostModal';
import { PdfPreviewModal } from '../modals/PdfPreviewModal';
import { VideoPlayerModal } from '../modals/VideoPlayerModal';
import { ClassFilterBar } from '../common/ClassFilterBar';

export const LearnDashboardView: React.FC = () => {
  const {
    currentUser,
    posts,
    submissions,
    users,
    selectedClassFilter,
    setSelectedClassFilter,
    availableClasses,
    deletePost,
  } = useApp();

  const isTeacherOrAdmin =
    currentUser?.role === 'TEACHER' || currentUser?.role === 'PRINCIPAL';

  const [activeSubTab, setActiveSubTab] = useState<'materi' | 'tugas'>('materi');
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherModalTab, setTeacherModalTab] = useState(0);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [submittingAssignment, setSubmittingAssignment] = useState<Post | null>(null);

  const [pdfPreview, setPdfPreview] = useState<{ title: string; file: string } | null>(null);
  const [videoPreview, setVideoPreview] = useState<{ title: string; url: string } | null>(null);
  const [viewingMaterial, setViewingMaterial] = useState<Post | null>(null);

  // Filter learning posts
  const learningPosts = posts.filter((p) => p.type === 'LEARNING');
  const displayLearningPosts = learningPosts.filter((p) => {
    if (currentUser?.role === 'STUDENT') {
      const studentClass = currentUser.className || 'VII-A';
      return (
        !p.targetClass ||
        p.targetClass === 'Semua Kelas' ||
        p.targetClass.toLowerCase().includes(studentClass.toLowerCase())
      );
    }
    return (
      selectedClassFilter === 'Semua Kelas' ||
      !selectedClassFilter ||
      p.targetClass === 'Semua Kelas' ||
      p.targetClass?.toLowerCase().includes(selectedClassFilter.toLowerCase())
    );
  });

  // Filter assignment posts
  const assignmentPosts = posts.filter((p) => p.type === 'ASSIGNMENT');
  const displayAssignments = assignmentPosts.filter((p) => {
    if (currentUser?.role === 'STUDENT') {
      const studentClass = currentUser.className || 'VII-A';
      return (
        !p.targetClass ||
        p.targetClass === 'Semua Kelas' ||
        p.targetClass.toLowerCase().includes(studentClass.toLowerCase())
      );
    }
    return (
      selectedClassFilter === 'Semua Kelas' ||
      !selectedClassFilter ||
      p.targetClass === 'Semua Kelas' ||
      p.targetClass?.toLowerCase().includes(selectedClassFilter.toLowerCase())
    );
  });

  const relevantSubmissions = submissions.filter((sub) =>
    displayAssignments.some(
      (a) => a.hashtag?.toLowerCase() === sub.assignmentHashtag.toLowerCase()
    )
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-[#3e4042]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-[#1877F2] flex items-center justify-center shadow-xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {isTeacherOrAdmin
                ? 'Learn - Ruang Modul & Asesmen Terstruktur'
                : 'Learn - Ruang Belajar & Tugas Mandiri'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isTeacherOrAdmin
                ? 'Kelola modul ajar 4-segmen, pantau rekap tugas, dan beri nilai tugas siswa'
                : 'Akses modul pembelajaran mandiri dan kirimkan tugas praktik kepada guru'}
            </p>
          </div>
        </div>

        {/* Quick Teacher Actions */}
        {isTeacherOrAdmin && (
          <div className="flex items-center gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-[#3a3b3c]">
            <button
              onClick={() => {
                setEditingPost(null);
                setTeacherModalTab(0);
                setShowTeacherModal(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Tambah Materi Ajar
            </button>
            <button
              onClick={() => {
                setEditingPost(null);
                setTeacherModalTab(1);
                setShowTeacherModal(true);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              + Buat Tugas Baru
            </button>
          </div>
        )}
      </div>

      {/* 2. Metrics Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#242526] p-4 rounded-xl border border-slate-200 dark:border-[#3e4042] text-center shadow-xs">
          <span className="text-2xl font-black text-emerald-600">
            {displayLearningPosts.length}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Materi Ajar</p>
        </div>
        <div className="bg-white dark:bg-[#242526] p-4 rounded-xl border border-slate-200 dark:border-[#3e4042] text-center shadow-xs">
          <span className="text-2xl font-black text-[#1877F2]">
            {displayAssignments.length}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Penugasan</p>
        </div>
        <div className="bg-white dark:bg-[#242526] p-4 rounded-xl border border-slate-200 dark:border-[#3e4042] text-center shadow-xs">
          <span className="text-2xl font-black text-amber-600">
            {relevantSubmissions.length}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Karya Siswa</p>
        </div>
        <div className="bg-white dark:bg-[#242526] p-4 rounded-xl border border-slate-200 dark:border-[#3e4042] text-center shadow-xs">
          <span className="text-2xl font-black text-purple-600">
            {relevantSubmissions.filter((s) => s.isGraded).length}
          </span>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">Sudah Dinilai</p>
        </div>
      </div>

      {/* 3. Class Filter Bar */}
      <ClassFilterBar />

      {/* 4. SubTabs (Daftar Materi vs Tugas & Asesmen) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-[#18191a] p-1.5 rounded-2xl">
        <button
          onClick={() => setActiveSubTab('materi')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'materi'
              ? 'bg-white dark:bg-[#242526] text-[#1877F2] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Daftar Materi Ajar ({displayLearningPosts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('tugas')}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'tugas'
              ? 'bg-white dark:bg-[#242526] text-[#1877F2] shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          Tugas & Asesmen ({displayAssignments.length})
        </button>
      </div>

      {/* 5. SubTab Content */}
      {activeSubTab === 'materi' ? (
        <div className="space-y-4">
          {displayLearningPosts.length === 0 ? (
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-slate-200 dark:border-[#3e4042] text-slate-500">
              <BookOpen className="w-10 h-10 mx-auto text-slate-400 opacity-60 mb-2" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                Belum ada materi pembelajaran
              </h4>
              <p className="text-xs mt-1">
                {isTeacherOrAdmin
                  ? 'Klik tombol "+ Tambah Materi Ajar" untuk membuat modul 4 segmen baru.'
                  : 'Materi dari Bapak/Ibu guru untuk kelasmu akan tampil di sini.'}
              </p>
            </div>
          ) : (
            displayLearningPosts.map((material) => {
              const author = users[material.authorId];
              const struct = material.structuredContent;

              return (
                <div
                  key={material.id}
                  className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-slate-200 dark:border-[#3e4042] shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={author?.avatarUrl}
                        alt={author?.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {author?.name || 'Guru Pengampu'}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {author?.subject || 'IPA'} · {material.timestamp}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-400 px-2.5 py-0.5 rounded-full">
                        {material.targetClass || 'Semua Kelas'}
                      </span>

                      {isTeacherOrAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingPost(material);
                              setTeacherModalTab(0);
                              setShowTeacherModal(true);
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-[#1877F2] hover:bg-slate-100"
                            title="Edit Materi"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Hapus materi "${material.title}"?`)) {
                                deletePost(material.id);
                              }
                            }}
                            className="p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100"
                            title="Hapus Materi"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {material.title}
                  </h3>

                  {struct?.pemantik?.text && (
                    <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-2">
                      "💡 {struct.pemantik.text}"
                    </p>
                  )}

                  {/* Feature indicators */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {struct?.inti?.embedUrl && (
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                        ⚡ Simulasi PhET Lab
                      </span>
                    )}
                    {struct?.inti?.videoUrl && (
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-semibold border border-red-200">
                        🎥 Video YouTube
                      </span>
                    )}
                    {struct?.inti?.pdfName && (
                      <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">
                        📄 Modul PDF
                      </span>
                    )}
                    {struct?.asesmen?.text && (
                      <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold border border-purple-200">
                        📝 Asesmen LKPD
                      </span>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-[#3a3b3c]">
                    <button
                      onClick={() => setViewingMaterial(material)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Pelajari Modul Lengkap
                    </button>

                    {struct?.inti?.pdfName && (
                      <button
                        onClick={() =>
                          setPdfPreview({
                            title: material.title || 'Modul Ajar',
                            file: struct.inti.pdfName!,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-[#3e4042] text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 rounded-xl"
                      >
                        <FileText className="w-4 h-4 text-red-600" />
                        Preview PDF
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* SUBTAB 1: TUGAS & ASESMEN */
        <div className="space-y-5">
          {displayAssignments.length === 0 ? (
            <div className="bg-white dark:bg-[#242526] rounded-2xl p-10 text-center border border-slate-200 dark:border-[#3e4042] text-slate-500">
              <ClipboardList className="w-10 h-10 mx-auto text-slate-400 opacity-60 mb-2" />
              <h4 className="font-bold text-sm text-slate-800 dark:text-white">
                Belum ada tugas atau asesmen aktif
              </h4>
              <p className="text-xs mt-1">
                {isTeacherOrAdmin
                  ? 'Klik tombol "+ Buat Tugas Baru" untuk menerbitkan penugasan dengan hashtag otomatis.'
                  : 'Tugas dari guru akan tampil di sini lengkap dengan batas waktu pengerjaan.'}
              </p>
            </div>
          ) : (
            displayAssignments.map((assignment) => {
              const matchingSubs = submissions.filter(
                (s) => s.assignmentHashtag.toLowerCase() === assignment.hashtag?.toLowerCase()
              );

              return (
                <div
                  key={assignment.id}
                  className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-slate-200 dark:border-[#3e4042] shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        {assignment.targetClass || 'Semua Kelas'}
                      </span>
                      <span className="text-xs font-bold text-[#1877F2]">
                        {assignment.hashtag}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {matchingSubs.length} Tugas Terkumpul
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {assignment.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {assignment.content}
                    </p>
                    <p className="text-xs font-semibold text-slate-500 mt-2">
                      Batas Waktu: {assignment.assignmentDetail?.deadline || 'Tidak ada'}
                    </p>
                  </div>

                  {/* Attachment & Action button */}
                  <div className="flex items-center gap-3">
                    {assignment.assignmentDetail?.attachmentName && (
                      <button
                        onClick={() =>
                          setPdfPreview({
                            title: assignment.title || 'Panduan Tugas',
                            file: assignment.assignmentDetail!.attachmentName!,
                          })
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#3a3b3c] rounded-lg hover:bg-slate-200 transition-colors"
                      >
                        <FileText className="w-4 h-4 text-red-600" />
                        {assignment.assignmentDetail.attachmentName}
                      </button>
                    )}

                    {currentUser?.role === 'STUDENT' && (
                      <button
                        onClick={() => setSubmittingAssignment(assignment)}
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold transition-colors ml-auto shadow-xs"
                      >
                        <Upload className="w-4 h-4" />
                        Kumpulkan Tugas Saya
                      </button>
                    )}
                  </div>

                  {/* Accordion List of Submissions */}
                  <div className="pt-3 border-t border-slate-100 dark:border-[#3a3b3c] space-y-2">
                    <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Hasil Pengerjaan Siswa ({matchingSubs.length}):
                    </h5>

                    {matchingSubs.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">
                        Belum ada siswa yang mengunggah tugas dengan tagar {assignment.hashtag}.
                      </p>
                    ) : (
                      matchingSubs.map((sub) => {
                        const student = users[sub.studentId];
                        return (
                          <div
                            key={sub.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#18191a] border border-slate-200 dark:border-[#3e4042] text-xs"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={student?.avatarUrl}
                                alt={student?.name}
                                className="w-8 h-8 rounded-full object-cover border"
                              />
                              <div>
                                <span className="font-bold text-slate-900 dark:text-white block">
                                  {student?.name || 'Siswa'} ({student?.className || 'VII-A'})
                                </span>
                                <span className="text-[10px] text-slate-500">{sub.timestamp}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {sub.isGraded ? (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-black text-emerald-800 bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300">
                                  Nilai: {sub.grade}
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-100">
                                  Belum Dinilai
                                </span>
                              )}

                              {isTeacherOrAdmin && (
                                <button
                                  onClick={() => setGradingSubmission(sub)}
                                  className="px-3 py-1.5 bg-[#1877F2] text-white rounded-lg font-bold hover:bg-[#166fe5] shadow-xs text-xs"
                                >
                                  {sub.isGraded ? 'Ubah Nilai' : 'Beri Nilai'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Teacher Create Modal */}
      {showTeacherModal && (
        <TeacherCreateModal
          initialPost={editingPost}
          initialTab={teacherModalTab}
          onDismiss={() => {
            setShowTeacherModal(false);
            setEditingPost(null);
          }}
        />
      )}

      {/* Grade Modal */}
      {gradingSubmission && (
        <GradeModal
          submission={gradingSubmission}
          student={users[gradingSubmission.studentId]}
          onDismiss={() => setGradingSubmission(null)}
          onSaveGrade={(score, note) => {
            // Updated via context
            alert(`Nilai ${score} berhasil tersimpan untuk karya siswa!`);
          }}
        />
      )}

      {/* Submit Assignment Modal for Student */}
      {submittingAssignment && (
        <CreatePostModal
          initialHashtag={submittingAssignment.hashtag || ''}
          onDismiss={() => setSubmittingAssignment(null)}
        />
      )}

      {/* PDF Preview Modal */}
      {pdfPreview && (
        <PdfPreviewModal
          documentTitle={pdfPreview.title}
          fileName={pdfPreview.file}
          onDismiss={() => setPdfPreview(null)}
        />
      )}

      {/* Video Modal */}
      {videoPreview && (
        <VideoPlayerModal
          title={videoPreview.title}
          videoUrl={videoPreview.url}
          onDismiss={() => setVideoPreview(null)}
        />
      )}

      {/* Full Material Reader Dialog */}
      {viewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative flex flex-col w-full max-w-3xl h-[88vh] bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#3e4042] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#3e4042]">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {viewingMaterial.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Target Kelas: {viewingMaterial.targetClass || 'Semua Kelas'}
                </p>
              </div>
              <button
                onClick={() => setViewingMaterial(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs sm:text-sm">
              {viewingMaterial.structuredContent?.pemantik?.text && (
                <div className="border-l-4 border-amber-500 bg-amber-50 p-3 rounded-r-xl">
                  <span className="font-bold text-amber-900 block text-xs">1. Pertanyaan Pemantik:</span>
                  <p className="italic mt-1">"{viewingMaterial.structuredContent.pemantik.text}"</p>
                </div>
              )}

              {viewingMaterial.structuredContent?.tujuan?.text && (
                <div className="border-l-4 border-blue-500 bg-blue-50 p-3 rounded-r-xl">
                  <span className="font-bold text-blue-900 block text-xs">2. Tujuan Pembelajaran:</span>
                  <p className="mt-1">{viewingMaterial.structuredContent.tujuan.text}</p>
                </div>
              )}

              {viewingMaterial.structuredContent?.inti?.text && (
                <div className="border-l-4 border-emerald-500 bg-emerald-50 p-3 rounded-r-xl space-y-2">
                  <span className="font-bold text-emerald-900 block text-xs">3. Materi Inti & Eksplorasi:</span>
                  <p>{viewingMaterial.structuredContent.inti.text}</p>
                  <div className="flex gap-2 pt-2">
                    {viewingMaterial.structuredContent.inti.embedUrl && (
                      <a
                        href={viewingMaterial.structuredContent.inti.embedUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="px-3 py-1.5 bg-[#1877F2] text-white rounded-lg text-xs font-bold inline-block"
                      >
                        Buka PhET Simulator
                      </a>
                    )}
                    {viewingMaterial.structuredContent.inti.pdfName && (
                      <button
                        onClick={() =>
                          setPdfPreview({
                            title: viewingMaterial.title || 'Modul',
                            file: viewingMaterial.structuredContent!.inti.pdfName!,
                          })
                        }
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-bold inline-block"
                      >
                        Preview PDF
                      </button>
                    )}
                  </div>
                </div>
              )}

              {viewingMaterial.structuredContent?.asesmen?.text && (
                <div className="border-l-4 border-purple-500 bg-purple-50 p-3 rounded-r-xl">
                  <span className="font-bold text-purple-900 block text-xs">4. Asesmen Formatif:</span>
                  <p className="mt-1">{viewingMaterial.structuredContent.asesmen.text}</p>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-[#3e4042] flex justify-end">
              <button
                onClick={() => setViewingMaterial(null)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1877F2] rounded-xl"
              >
                Selesai Membaca
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
