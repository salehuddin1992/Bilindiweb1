import React, { useState } from 'react';
import { Lock, Filter, School, Check, Plus, X } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ClassFilterBar: React.FC = () => {
  const {
    currentUser,
    selectedClassFilter,
    setSelectedClassFilter,
    availableClasses,
    addClass,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [newClassName, setNewClassName] = useState('');

  const isStudent = currentUser?.role === 'STUDENT';
  const studentClass = currentUser?.className || 'VII-A';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClassName.trim()) return;
    addClass(newClassName.trim());
    setSelectedClassFilter(newClassName.trim());
    setNewClassName('');
    setShowAddModal(false);
  };

  if (isStudent) {
    return (
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-3.5 border-2 border-blue-200 dark:border-blue-900/60 shadow-xs flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-[#1877F2] flex items-center justify-center shrink-0">
          <Lock className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
              Ruang Kelas: {studentClass}
            </h4>
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full shrink-0">
              🔒 Terkunci
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
            Beranda & materi dikhususkan untuk teman sekelasmu agar tidak bingung.
          </p>
        </div>
      </div>
    );
  }

  // Teacher / Principal View
  return (
    <>
      <div className="bg-white dark:bg-[#242526] rounded-2xl p-3.5 border border-slate-200 dark:border-[#3e4042] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <Filter className="w-4 h-4 text-[#1877F2]" />
            <span>Filter Kelas Guru:</span>
          </div>
          <span className="text-[11px] font-bold text-[#1877F2] bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-full">
            {selectedClassFilter === 'Semua Kelas' ? 'Semua Kelas' : `Kelas ${selectedClassFilter}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-none text-xs">
          {availableClasses.map((cls) => {
            const isSelected = selectedClassFilter === cls;
            return (
              <button
                key={cls}
                onClick={() => setSelectedClassFilter(cls)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-[#1877F2] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-[#3a3b3c] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-[#4e4f50]'
                }`}
              >
                {cls === 'Semua Kelas' ? (
                  <School className="w-3.5 h-3.5" />
                ) : isSelected ? (
                  <Check className="w-3.5 h-3.5" />
                ) : null}
                <span>{cls}</span>
              </button>
            );
          })}

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-[#1877F2] hover:text-[#1877F2] font-semibold whitespace-nowrap transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah</span>
          </button>
        </div>
      </div>

      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-sm bg-white dark:bg-[#242526] rounded-2xl p-5 shadow-2xl border border-slate-200 dark:border-[#3e4042] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tambah Ruang Kelas Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <input
                type="text"
                value={newClassName}
                onChange={(e) => setNewClassName(e.target.value)}
                placeholder="cth: IX-A atau VII-C"
                required
                className="w-full bg-slate-50 dark:bg-[#3a3b3c] border border-slate-300 dark:border-[#3e4042] rounded-xl px-3.5 py-2 text-xs text-slate-900 dark:text-white focus:border-[#1877F2] focus:outline-hidden"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-[#1877F2] hover:bg-[#166fe5] rounded-lg shadow-xs"
                >
                  Simpan Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
