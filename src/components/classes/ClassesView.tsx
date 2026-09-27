import React, { useState } from 'react';
import {
  Users,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  MessageSquare,
  Calendar,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ClassItem, User } from '../../types';

export const ClassesView: React.FC = () => {
  const {
    currentUser,
    classes,
    users,
    saveClass,
    deleteClass,
    approveStudent,
    rejectStudent,
    setActiveTab,
  } = useApp();

  const isTeacherOrAdmin =
    currentUser?.role === 'TEACHER' || currentUser?.role === 'PRINCIPAL';

  const [activeTeacherTab, setActiveTeacherTab] = useState<'classes' | 'confirmation'>('classes');
  const [studentSearch, setStudentSearch] = useState('');
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [showClassModal, setShowClassModal] = useState(false);

  // Form states for adding/editing class
  const [classNameInput, setClassNameInput] = useState('');
  const [homeroomInput, setHomeroomInput] = useState('');
  const [studentCountInput, setStudentCountInput] = useState('30');
  const [scheduleInput, setScheduleInput] = useState('Senin - Jumat (07.00 - 13.30 WIB)');
  const [subjectsInput, setSubjectsInput] = useState('IPA, Matematika, Bahasa Indonesia, Informatika');

  const pendingStudents = Object.values(users).filter(
    (u) => u.role === 'STUDENT' && !u.isApproved
  );

  const approvedStudents = Object.values(users).filter(
    (u) => u.role === 'STUDENT' && u.isApproved
  );

  const filteredStudents = approvedStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.className && s.className.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  // Filter classes for students: show their own class
  const displayClasses =
    currentUser?.role === 'STUDENT'
      ? classes.filter((c) =>
          c.name.toLowerCase().includes((currentUser.className || 'VII-A').toLowerCase())
        )
      : classes;

  const handleOpenAddClass = () => {
    setEditingClass(null);
    setClassNameInput('');
    setHomeroomInput(currentUser?.name || 'Guru Pengampu');
    setStudentCountInput('30');
    setScheduleInput('Senin - Jumat (07.00 - 13.30 WIB)');
    setSubjectsInput('IPA, Matematika, Bahasa Indonesia, Informatika');
    setShowClassModal(true);
  };

  const handleOpenEditClass = (c: ClassItem) => {
    setEditingClass(c);
    setClassNameInput(c.name);
    setHomeroomInput(c.homeroomTeacher);
    setStudentCountInput(c.studentCount.toString());
    setScheduleInput(c.schedule);
    setSubjectsInput(c.subjectList.join(', '));
    setShowClassModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classNameInput.trim()) return;

    const formattedName = classNameInput.toLowerCase().startsWith('kelas')
      ? classNameInput.trim()
      : `Kelas ${classNameInput.trim()}`;

    const newOrUpdated: ClassItem = {
      id: editingClass?.id || `c_${Date.now()}`,
      name: formattedName,
      homeroomTeacher: homeroomInput.trim() || 'Guru Pengampu',
      studentCount: parseInt(studentCountInput, 10) || 30,
      schedule: scheduleInput.trim() || 'Senin - Jumat (07.00 - 13.30 WIB)',
      subjectList: subjectsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    saveClass(newOrUpdated);
    setShowClassModal(false);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto w-full pb-12">
      {/* 1. Header Banner */}
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-sm border border-slate-200 dark:border-[#3e4042] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shadow-xs">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              {currentUser?.role === 'STUDENT'
                ? `Ruang Kelas ${currentUser.className || 'VII-A'}`
                : 'Kelas & Komunitas Belajar Siswa'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {currentUser?.role === 'STUDENT'
                ? 'Terhubung khusus dengan wali kelas, guru pengampu, dan teman sekelasmu.'
                : 'Kelola rombel kelas, jadwal belajar, dan konfirmasi registrasi siswa baru SMP Negeri Sinombayuga'}
            </p>
          </div>
        </div>

        {isTeacherOrAdmin && (
          <button
            onClick={handleOpenAddClass}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Kelas Baru
          </button>
        )}
      </div>

      {/* 2. Teacher SubTabs (Daftar Kelas vs Konfirmasi Siswa) */}
      {isTeacherOrAdmin && (
        <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-[#18191a] p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveTeacherTab('classes')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTeacherTab === 'classes'
                ? 'bg-white dark:bg-[#242526] text-[#1877F2] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            Daftar Ruang Kelas ({classes.length})
          </button>
          <button
            onClick={() => setActiveTeacherTab('confirmation')}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTeacherTab === 'confirmation'
                ? 'bg-white dark:bg-[#242526] text-[#1877F2] shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Konfirmasi Siswa
            {pendingStudents.length > 0 && (
              <span className="bg-red-500 text-white rounded-full px-2 py-0.5 text-[10px]">
                {pendingStudents.length} Baru
              </span>
            )}
          </button>
        </div>
      )}

      {/* 3. Tab Content */}
      {(!isTeacherOrAdmin || activeTeacherTab === 'classes') && (
        <div className="space-y-4">
          {displayClasses.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-[#242526] rounded-2xl p-5 border border-slate-200 dark:border-[#3e4042] shadow-sm space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {item.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Wali Kelas: <strong className="font-semibold text-slate-700 dark:text-slate-300">{item.homeroomTeacher}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-[#1877F2]">
                    {item.studentCount} Siswa Terdaftar
                  </span>

                  {isTeacherOrAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditClass(item)}
                        className="p-1 rounded-lg text-slate-500 hover:text-[#1877F2] hover:bg-slate-100"
                        title="Edit Kelas"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus ${item.name}?`)) {
                            deleteClass(item.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-500 hover:text-red-600 hover:bg-slate-100"
                        title="Hapus Kelas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#18191a] p-2.5 rounded-xl border border-slate-200 dark:border-[#3e4042]">
                <Calendar className="w-4 h-4 text-[#1877F2]" />
                <span>Jadwal Belajar: {item.schedule}</span>
              </div>

              {/* Subject Chips */}
              <div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Mata Pelajaran Aktif:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {item.subjectList.map((subj) => (
                    <span
                      key={subj}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#3a3b3c] text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                    >
                      {subj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Class discussion trigger */}
              <div className="pt-2 border-t border-slate-100 dark:border-[#3a3b3c] flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  SMP Negeri Sinombayuga · Ruang Belajar Kolaboratif
                </span>
                <button
                  onClick={() => setActiveTab('home')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Diskusi Kelas
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation of student registration */}
      {isTeacherOrAdmin && activeTeacherTab === 'confirmation' && (
        <div className="space-y-6">
          {/* Pending Approval Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Menunggu Konfirmasi Guru ({pendingStudents.length} Siswa):
            </h4>

            {pendingStudents.length === 0 ? (
              <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-6 text-center text-xs text-emerald-800 dark:text-emerald-200 space-y-1">
                <CheckCircle className="w-8 h-8 mx-auto text-emerald-600 mb-1" />
                <h5 className="font-bold text-sm">Semua Pendaftaran Siswa Telah Dikonfirmasi</h5>
                <p>Tidak ada registrasi siswa baru yang menunggu verifikasi saat ini.</p>
              </div>
            ) : (
              pendingStudents.map((student) => (
                <div
                  key={student.id}
                  className="bg-white dark:bg-[#242526] rounded-2xl p-4 border border-amber-300 dark:border-amber-800 shadow-sm flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={student.avatarUrl}
                      alt={student.name}
                      className="w-11 h-11 rounded-full object-cover border-2 border-amber-400"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {student.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        @{student.username} · Pengajuan: Kelas {student.className || 'VII-A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => rejectStudent(student.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-xs font-semibold"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Tolak
                    </button>
                    <button
                      onClick={() => approveStudent(student.id)}
                      className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Setujui Masuk Kelas
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Directory of active students */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-[#3e4042]">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Direktori Siswa Aktif ({approvedStudents.length} Siswa):
              </h4>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Cari siswa aktif berdasarkan nama atau kelas..."
                className="w-full bg-white dark:bg-[#242526] border border-slate-300 dark:border-[#3e4042] rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {filteredStudents.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-[#242526] border border-slate-200 dark:border-[#3e4042]"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={s.avatarUrl}
                      alt={s.name}
                      className="w-8 h-8 rounded-full object-cover border"
                    />
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</h5>
                      <span className="text-[10px] text-slate-500">@{s.username}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-blue-50 text-[#1877F2] text-[10px] font-bold rounded-md">
                    {s.className || 'Umum'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Class Modal (Add/Edit) */}
      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#242526] rounded-2xl shadow-2xl border border-slate-200 dark:border-[#3e4042] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[#3e4042]">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingClass ? 'Edit Ruang Kelas' : 'Tambah Ruang Kelas Baru'}
              </h3>
              <button
                onClick={() => setShowClassModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Kelas
                </label>
                <input
                  type="text"
                  value={classNameInput}
                  onChange={(e) => setClassNameInput(e.target.value)}
                  placeholder="cth: Kelas VII-C atau IX-A"
                  required
                  className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Wali Kelas / Guru Pengampu
                </label>
                <input
                  type="text"
                  value={homeroomInput}
                  onChange={(e) => setHomeroomInput(e.target.value)}
                  placeholder="cth: Salehuddin, S.Pd"
                  className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Kapasitas Siswa
                  </label>
                  <input
                    type="number"
                    value={studentCountInput}
                    onChange={(e) => setStudentCountInput(e.target.value)}
                    className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Jadwal Belajar
                  </label>
                  <input
                    type="text"
                    value={scheduleInput}
                    onChange={(e) => setScheduleInput(e.target.value)}
                    className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mata Pelajaran (pisahkan koma)
                </label>
                <input
                  type="text"
                  value={subjectsInput}
                  onChange={(e) => setSubjectsInput(e.target.value)}
                  className="w-full bg-white dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-4 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-[#3e4042]">
                <button
                  type="button"
                  onClick={() => setShowClassModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] rounded-xl"
                >
                  {editingClass ? 'Simpan Perubahan' : 'Tambah Kelas'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
