"use client";

import { useState, useEffect } from "react";
import { Megaphone, Plus, Calendar, Bell } from "lucide-react";
import { Announcement } from "@/lib/supabase/types";
import { getAnnouncements, createAnnouncement } from "@/lib/services/announcements-service";

export default function DuyurularPage() {
  const [list, setList] = useState<Announcement[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnnouncements() {
      const data = await getAnnouncements();
      setList(data);
      setIsLoading(false);
    }
    fetchAnnouncements();
  }, []);

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    const newItem = await createAnnouncement(title, content);
    if (newItem) {
      setList([newItem, ...list]);
    }
    setIsModalOpen(false);
    setTitle("");
    setContent("");
  };

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Şirket ve Tesis İçi Duyurular
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Yemekhane, servis, tatil ve idari operasyon değişikliklerinin anlık yayını.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 transition"
        >
          <Plus className="w-4 h-4" />
          Yeni Duyuru Yayınla
        </button>
      </div>

      <div className="space-y-4">
        {list.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-start gap-4 hover:shadow-md transition"
          >
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
              <Megaphone className="w-6 h-6" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.date}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.content}</p>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-base font-bold text-slate-900 mb-4">Yeni Duyuru Yayınla</h3>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Başlık</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Yemekhane Saatleri Revizyonu"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duyuru Metni</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detaylı duyuru açıklaması..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-semibold text-slate-600"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold"
                >
                  Yayınla & Bildir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
