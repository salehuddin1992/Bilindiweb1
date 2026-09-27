import React, { useState } from 'react';
import {
  MessageSquare,
  Search,
  Send,
  Image,
  ArrowLeft,
  Check,
  CheckCheck,
  User as UserIcon,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { User, DirectMessage } from '../../types';

export const MessengerView: React.FC = () => {
  const {
    currentUser,
    users,
    directMessages,
    sendDirectMessage,
    markDirectMessagesAsRead,
  } = useApp();

  const [selectedContact, setSelectedContact] = useState<User | null>(() => {
    // Default open conversation with u3 (Salehuddin) if current is student, or u1 if teacher
    if (currentUser?.role === 'STUDENT') {
      return users['u3'] || null;
    }
    return users['u1'] || null;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'TEACHER' | 'STUDENT'>('ALL');
  const [inputText, setInputText] = useState('');

  // Get active contacts excluding current user
  const otherUsers = Object.values(users).filter((u) => u.id !== currentUser?.id);

  const filteredContacts = otherUsers.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.subject && u.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.className && u.className.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesRole =
      roleFilter === 'ALL'
        ? true
        : roleFilter === 'TEACHER'
        ? u.role === 'TEACHER' || u.role === 'PRINCIPAL'
        : u.role === 'STUDENT';

    return matchesSearch && matchesRole;
  });

  // Conversation messages with selected contact
  const conversationMessages = selectedContact
    ? directMessages.filter(
        (m) =>
          (m.senderId === currentUser?.id && m.recipientId === selectedContact.id) ||
          (m.senderId === selectedContact.id && m.recipientId === currentUser?.id)
      )
    : [];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !selectedContact) return;

    sendDirectMessage(selectedContact.id, inputText.trim());
    setInputText('');
  };

  const handleSelectContact = (contact: User) => {
    setSelectedContact(contact);
    markDirectMessagesAsRead(contact.id);
  };

  const suggestions =
    selectedContact?.role === 'TEACHER'
      ? [
          'Pak/Bu, izin bertanya materi tugas...',
          'Apakah tugas saya sudah diperiksa?',
          'Terima kasih atas bimbingannya!',
          'Siap, akan saya kerjakan segera.',
        ]
      : [
          'Halo, apakah sudah selesai tugas tadi?',
          'Ayo belajar kelompok bareng di perpustakaan!',
          'Bisa tolong jelaskan bagian ini?',
          'Siap, terima kasih ya!',
        ];

  return (
    <div className="bg-white dark:bg-[#242526] rounded-2xl shadow-sm border border-slate-200 dark:border-[#3e4042] overflow-hidden max-w-4xl mx-auto w-full h-[82vh] flex">
      {/* Left Column: Contact List */}
      <div className={`w-full sm:w-80 border-r border-slate-200 dark:border-[#3e4042] flex flex-col h-full ${selectedContact ? 'hidden sm:flex' : 'flex'}`}>
        {/* Contact List Header */}
        <div className="p-4 border-b border-slate-200 dark:border-[#3e4042] space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#1877F2]" />
              Messenger Sekolah
            </h2>
          </div>

          {/* Search field */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari guru atau siswa..."
              className="w-full bg-slate-100 dark:bg-[#3a3b3c] border-0 rounded-full pl-9 pr-4 py-2 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-[#1877F2] focus:outline-hidden"
            />
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-1.5 text-xs">
            {(['ALL', 'TEACHER', 'STUDENT'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-full font-semibold transition-colors ${
                  roleFilter === r
                    ? 'bg-[#1877F2] text-white'
                    : 'bg-slate-100 dark:bg-[#3a3b3c] text-slate-600 dark:text-slate-300'
                }`}
              >
                {r === 'ALL' ? 'Semua' : r === 'TEACHER' ? 'Guru' : 'Siswa'}
              </button>
            ))}
          </div>
        </div>

        {/* Contacts Scroll */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-[#3e4042]">
          {filteredContacts.map((contact) => {
            const lastMsg = directMessages
              .filter(
                (m) =>
                  (m.senderId === currentUser?.id && m.recipientId === contact.id) ||
                  (m.senderId === contact.id && m.recipientId === currentUser?.id)
              )
              .slice(-1)[0];

            const isSelected = selectedContact?.id === contact.id;

            return (
              <div
                key={contact.id}
                onClick={() => handleSelectContact(contact)}
                className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-blue-50 dark:bg-blue-950/40'
                    : 'hover:bg-slate-50 dark:hover:bg-[#3a3b3c]/50'
                }`}
              >
                <div className="relative">
                  <img
                    src={contact.avatarUrl}
                    alt={contact.name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-[#3e4042]"
                  />
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-[#242526]" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {contact.name}
                    </span>
                    {lastMsg && (
                      <span className="text-[10px] text-slate-400 shrink-0">
                        {lastMsg.timestamp}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 mt-0.5">
                    {contact.role === 'TEACHER' && (
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1 rounded">
                        Guru
                      </span>
                    )}
                    {contact.role === 'STUDENT' && (
                      <span className="text-[9px] text-slate-500">
                        {contact.className || 'Siswa'}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {lastMsg ? lastMsg.text : 'Mulai percakapan baru'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Chat Conversation View */}
      {selectedContact ? (
        <div className="flex-1 flex flex-col h-full bg-slate-50/50 dark:bg-[#18191a]">
          {/* Chat Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[#3e4042] bg-white dark:bg-[#242526]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedContact(null)}
                className="sm:hidden p-1 rounded-lg text-slate-500 hover:bg-slate-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={selectedContact.avatarUrl}
                  alt={selectedContact.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-[#3e4042]"
                />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-white" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {selectedContact.name}
                  </h3>
                  {selectedContact.role === 'TEACHER' && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded">
                      Guru
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-emerald-600 font-medium">
                  {selectedContact.role === 'TEACHER'
                    ? `Guru Mata Pelajaran ${selectedContact.subject || 'IPA'} · Aktif`
                    : `Siswa Kelas ${selectedContact.className || 'VII-A'} · Aktif`}
                </p>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
            {/* Encryption pill */}
            <div className="text-center py-2">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-[#3a3b3c] px-3 py-1 rounded-full">
                🔒 Pesan aman untuk lingkungan belajar SMP Negeri Sinombayuga
              </span>
            </div>

            {conversationMessages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img
                      src={selectedContact.avatarUrl}
                      alt=""
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  )}

                  <div className={`max-w-xs sm:max-w-md space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-[#1877F2] text-white rounded-br-xs'
                          : 'bg-white dark:bg-[#242526] text-slate-900 dark:text-white border border-slate-200 dark:border-[#3e4042] rounded-bl-xs'
                      }`}
                    >
                      {msg.imageUrl && (
                        <img
                          src={msg.imageUrl}
                          alt="Lampiran"
                          className="w-full max-h-48 object-cover rounded-xl mb-2"
                        />
                      )}
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-[10px] text-slate-400 block px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick suggestions */}
          <div className="px-4 py-1.5 flex items-center gap-1.5 overflow-x-auto bg-white dark:bg-[#242526] border-t border-slate-100 dark:border-[#3a3b3c]">
            {suggestions.map((hint) => (
              <button
                key={hint}
                type="button"
                onClick={() => setInputText(hint)}
                className="px-3 py-1 rounded-full text-[11px] bg-slate-100 dark:bg-[#3a3b3c] text-slate-600 dark:text-slate-300 hover:bg-slate-200 whitespace-nowrap"
              >
                {hint}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-slate-200 dark:border-[#3e4042] bg-white dark:bg-[#242526] flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tulis pesan..."
              className="flex-1 bg-slate-100 dark:bg-[#3a3b3c] text-xs sm:text-sm text-slate-900 dark:text-white px-4 py-2.5 rounded-full border border-transparent focus:border-[#1877F2] focus:outline-hidden"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="p-2.5 rounded-full bg-[#1877F2] text-white hover:bg-[#166fe5] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 hidden sm:flex flex-col items-center justify-center p-8 text-center text-slate-400">
          <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
          <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
            Pilih kontak untuk mulai berkirim pesan
          </h4>
          <p className="text-xs max-w-xs mt-1">
            Terhubung langsung dengan dewan guru pengampu dan teman sekelasmu.
          </p>
        </div>
      )}
    </div>
  );
};
