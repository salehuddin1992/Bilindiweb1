import React, { useState } from 'react';
import { X, Award, CheckCircle } from 'lucide-react';
import { Submission, User } from '../../types';

interface GradeModalProps {
  submission: Submission;
  student: User | undefined;
  onDismiss: () => void;
  onSaveGrade: (grade: number, feedback: string) => void;
}

export const GradeModal: React.FC<GradeModalProps> = ({
  submission,
  student,
  onDismiss,
  onSaveGrade,
}) => {
  const [grade, setGrade] = useState<string>(submission.grade?.toString() || '90');
  const [feedback, setFeedback] = useState<string>(
    submission.feedback || 'Pekerjaan rapi, analisis perbedaan umbra dan penumbra dijelaskan dengan runtut.'
  );
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(grade, 10);
    if (isNaN(num) || num < 0 || num > 100) {
      setError('Masukkan nilai valid antara 0 dan 100');
      return;
    }
    onSaveGrade(num, feedback.trim());
    onDismiss();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#3e4042] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#3e4042]">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Penilaian Tugas Siswa
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {student?.name || 'Siswa'} · Kelas {student?.className || 'VII-A'}
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-[#3a3b3c] text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-slate-50 dark:bg-[#18191a] p-3 rounded-xl border border-slate-200 dark:border-[#3e4042] text-xs">
            <span className="font-bold text-[#1877F2]">Tagar Tugas: {submission.assignmentHashtag}</span>
            {submission.content && (
              <p className="mt-1 text-slate-600 dark:text-slate-300 italic">
                "{submission.content}"
              </p>
            )}
            {submission.imageUrl && (
              <img
                src={submission.imageUrl}
                alt="Lampiran Siswa"
                className="mt-2 w-full h-36 object-cover rounded-lg border border-slate-200 dark:border-[#3e4042]"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Nilai Skor (0 - 100)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={grade}
              onChange={(e) => {
                setGrade(e.target.value);
                setError(null);
              }}
              required
              className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 dark:text-white focus:border-[#1877F2] focus:outline-hidden"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Catatan & Masukan Konstruktif Guru
            </label>
            <textarea
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Berikan apresiasi dan arahan peningkatan konsep..."
              className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white focus:border-[#1877F2] focus:outline-hidden resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#3e4042]">
            <button
              type="button"
              onClick={onDismiss}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#3a3b3c] rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] rounded-xl shadow-sm transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Simpan & Publikasikan Nilai
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
