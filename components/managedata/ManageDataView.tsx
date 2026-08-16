"use client";

import { useState, useEffect } from "react";
import {
  Database,
  FileText,
  ListChecks,
  Star,
  Plus,
  Search,
  Edit2,
  Trash2,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FolderTree,
} from "lucide-react";
import { axiosInstance } from "@/lib/axiosInstance";
import { toast } from "react-toastify";

import { TitleModal, TitleItem } from "./TitleModal";
import { SubTitleModal, SubTitleItem } from "./SubTitleModal";
import { ScoreModal, ScoreItem } from "./ScoreModal";

type ActiveTab = "title" | "subtitle" | "score";

export function ManageDataView() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("title");

  // Master Data Lists
  const [titlesList, setTitlesList] = useState<TitleItem[]>([]);
  const [subTitlesList, setSubTitlesList] = useState<SubTitleItem[]>([]);
  const [scoresList, setScoresList] = useState<ScoreItem[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modals state
  const [isTitleModalOpen, setIsTitleModalOpen] = useState(false);
  const [titleToEdit, setTitleToEdit] = useState<TitleItem | null>(null);

  const [isSubTitleModalOpen, setIsSubTitleModalOpen] = useState(false);
  const [subTitleToEdit, setSubTitleToEdit] = useState<SubTitleItem | null>(null);

  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [scoreToEdit, setScoreToEdit] = useState<ScoreItem | null>(null);

  // Fetch all master data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [tRes, sRes, scRes] = await Promise.all([
        axiosInstance.get<TitleItem[]>("/titles"),
        axiosInstance.get<SubTitleItem[]>("/subtitles"),
        axiosInstance.get<ScoreItem[]>("/scores"),
      ]);

      setTitlesList(tRes.data || []);
      setSubTitlesList(sRes.data || []);
      setScoresList(scRes.data || []);
    } catch (err) {
      console.error("Failed to fetch manage data lists:", err);
      toast.error("ບໍ່ສາມາດໂຫຼດຂໍ້ມູນໄດ້ ກະລຸນາລອງໃໝ່");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Filtered Lists by Search
  const filteredTitles = titlesList.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredSubTitles = subTitlesList.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.title?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const filteredScores = scoresList.filter((sc) =>
    String(sc.sc_num).includes(search)
  );

  // Delete Handlers
  const handleDeleteTitle = async (id: number) => {
    if (!confirm("ທ່ານຕ້ອງການລົບຫົວຂໍ້ຫຼັກນີ້ແທ້ບໍ?")) return;
    try {
      await axiosInstance.delete(`/titles/${id}`);
      toast.success("ລົບຫົວຂໍ້ຫຼັກສຳເລັດ!");
      fetchAllData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ບໍ່ສາມາດລົບຫົວຂໍ້ຫຼັກໄດ້");
    }
  };

  const handleDeleteSubTitle = async (id: number) => {
    if (!confirm("ທ່ານຕ້ອງການລົບຫົວຂໍ້ຍ່ອຍນີ້ແທ້ບໍ?")) return;
    try {
      await axiosInstance.delete(`/subtitles/${id}`);
      toast.success("ລົບຫົວຂໍ້ຍ່ອຍສຳເລັດ!");
      fetchAllData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ບໍ່ສາມາດລົບຫົວຂໍ້ຍ່ອຍໄດ້");
    }
  };

  const handleDeleteScore = async (id: number) => {
    if (!confirm("ທ່ານຕ້ອງການລົບຄະແນນນີ້ແທ້ບໍ?")) return;
    try {
      await axiosInstance.delete(`/scores/${id}`);
      toast.success("ລົບຄະແນນສຳເລັດ!");
      fetchAllData();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "ບໍ່ສາມາດລົບຄະແນນໄດ້");
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner Header */}
      <div className="py-4 px-5 rounded-xl bg-edl-gradient text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative overflow-hidden font-sans">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1 relative z-10">
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            ຈັດການຂໍ້ມູນການປະເມີນ
          </h2>
          <p className="text-xs sm:text-sm text-sky-100 font-medium">
            ຈັດການຂໍ້ມູນ ຫົວຂໍ້ຫຼັກ, ຫົວຂໍ້ຍ່ອຍ ແລະ ຕົວເລກຄະແນນ
          </p>
        </div>
      </div>

      {/* 3 Category Cards Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Title */}
        <div
          onClick={() => setActiveTab("title")}
          className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm ${activeTab === "title"
            ? "bg-sky-50 border-sky-400 ring-2 ring-sky-400/20 shadow-md"
            : "bg-white border-slate-200 hover:border-sky-300 hover:bg-slate-50/50"
            }`}
        >
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-sky-600 uppercase tracking-wider">
              ຫົວຂໍ້ຫຼັກ
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              {titlesList.length} <span className="text-xs text-slate-400 font-medium">ລາຍການ</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              ຫົວຂໍ້ຫຼັກໃນການປະເມີນຜົນ
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${activeTab === "title"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/30"
              : "bg-sky-100 text-sky-700"
              }`}
          >
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: SubTitle */}
        <div
          onClick={() => setActiveTab("subtitle")}
          className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm ${activeTab === "subtitle"
            ? "bg-indigo-50 border-indigo-400 ring-2 ring-indigo-400/20 shadow-md"
            : "bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50"
            }`}
        >
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
              ຫົວຂໍ້ຍ່ອຍ
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              {subTitlesList.length} <span className="text-xs text-slate-400 font-medium">ລາຍການ</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              ຫົວຂໍ້ຍ່ອຍປະເມີນຄະແນນ
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${activeTab === "subtitle"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
              : "bg-indigo-100 text-indigo-700"
              }`}
          >
            <ListChecks className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Score */}
        <div
          onClick={() => setActiveTab("score")}
          className={`p-5 rounded-3xl border transition-all duration-200 cursor-pointer flex items-center justify-between shadow-sm ${activeTab === "score"
            ? "bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-md"
            : "bg-white border-slate-200 hover:border-amber-300 hover:bg-slate-50/50"
            }`}
        >
          <div className="space-y-1">
            <p className="text-xs font-extrabold text-amber-600 uppercase tracking-wider">
              ຄະແນນປະເມີນ
            </p>
            <h3 className="text-2xl font-black text-slate-800">
              {scoresList.length} <span className="text-xs text-slate-400 font-medium">ລາຍການ</span>
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">
              ຄະແນນປະເມີນ
            </p>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${activeTab === "score"
              ? "bg-amber-500 text-white shadow-md shadow-amber-500/30"
              : "bg-amber-100 text-amber-800"
              }`}
          >
            <Star className="w-6 h-6 fill-amber-300" />
          </div>
        </div>
      </div>

      {/* Control Action Bar: Search & Add Button */}
      <div className="p-4 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tab Badges */}
        <div className="flex items-center space-x-1.5 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab("title")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${activeTab === "title"
              ? "bg-sky-600 text-white shadow-md shadow-sky-600/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            📌 ຫົວຂໍ້ຫຼັກ ({titlesList.length})
          </button>
          <button
            onClick={() => setActiveTab("subtitle")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${activeTab === "subtitle"
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            📝 ຫົວຂໍ້ຍ່ອຍ ({subTitlesList.length})
          </button>
          <button
            onClick={() => setActiveTab("score")}
            className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${activeTab === "score"
              ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
          >
            ⭐ ຄະແນນ ({scoresList.length})
          </button>
        </div>

        {/* Search & Add New Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ຄົ້ນຫາຂໍ້ມູນ..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:border-sky-500 focus:bg-white focus:outline-none font-medium"
            />
          </div>

          <button
            onClick={() => {
              if (activeTab === "title") {
                setTitleToEdit(null);
                setIsTitleModalOpen(true);
              } else if (activeTab === "subtitle") {
                setSubTitleToEdit(null);
                setIsSubTitleModalOpen(true);
              } else {
                setScoreToEdit(null);
                setIsScoreModalOpen(true);
              }
            }}
            className="px-4 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-black shadow-md shadow-sky-600/20 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ເພີ່ມຂໍ້ມູນໃໝ່</span>
          </button>

          <button
            onClick={fetchAllData}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-600 border border-slate-200 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold text-sm animate-pulse space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-sky-600" />
            <p>ກຳລັງໂຫຼດຂໍ້ມູນ...</p>
          </div>
        ) : activeTab === "title" ? (
          /* Title Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">ຊື່ຫົວຂໍ້ຫຼັກ</th>
                  <th className="px-6 py-4">ຈຳນວນຫົວຂໍ້ຍ່ອຍ</th>
                  <th className="px-6 py-4 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTitles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-semibold">
                      ບໍ່ພົບຂໍ້ມູນຫົວຂໍ້ຫຼັກ
                    </td>
                  </tr>
                ) : (
                  filteredTitles.map((item) => {
                    const subCount = subTitlesList.filter((s) => s.titleId === item.id).length;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-sky-700">#{item.id}</td>
                        <td className="px-6 py-4 font-bold text-slate-800 text-sm">{item.name}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 rounded-xl bg-sky-50 text-sky-700 font-bold text-xs border border-sky-100">
                            {subCount} ຫົວຂໍ້
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setTitleToEdit(item);
                              setIsTitleModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                            ແກ້ໄຂ
                          </button>
                          <button
                            onClick={() => handleDeleteTitle(item.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                            ລົບ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : activeTab === "subtitle" ? (
          /* SubTitle Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">ຫົວຂໍ້ຫຼັກ</th>
                  <th className="px-6 py-4">ຊື່ຫົວຂໍ້ຍ່ອຍ</th>
                  <th className="px-6 py-4 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredSubTitles.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-slate-400 font-semibold">
                      ບໍ່ພົບຂໍ້ມູນຫົວຂໍ້ຍ່ອຍ
                    </td>
                  </tr>
                ) : (
                  filteredSubTitles.map((item) => {
                    const titleObj = item.title || titlesList.find((t) => t.id === item.titleId);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-sky-700">#{item.id}</td>
                        <td className="px-6 py-4 font-semibold text-slate-600">
                          <span className="px-2.5 py-1 rounded-xl bg-indigo-50 text-indigo-700 font-bold text-xs border border-indigo-100">
                            {titleObj?.name || `Title #${item.titleId}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-800 leading-relaxed max-w-md">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => {
                              setSubTitleToEdit(item);
                              setIsSubTitleModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                            ແກ້ໄຂ
                          </button>
                          <button
                            onClick={() => handleDeleteSubTitle(item.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                            ລົບ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* Score Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-extrabold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4">ID</th>
                  <th className="px-6 py-4">ຄະແນນປະເມີນ</th>
                  <th className="px-6 py-4 text-right">ຈັດການ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredScores.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-10 text-center text-slate-400 font-semibold">
                      ບໍ່ພົບຂໍ້ມູນຄະແນນ
                    </td>
                  </tr>
                ) : (
                  filteredScores.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-sky-700">#{item.id}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-2xl bg-amber-50 text-amber-800 font-black text-sm border border-amber-200 shadow-2xs">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          ຄະແນນ: {item.sc_num}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setScoreToEdit(item);
                            setIsScoreModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 font-bold transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 inline mr-1" />
                          ແກ້ໄຂ
                        </button>
                        <button
                          onClick={() => handleDeleteScore(item.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                          ລົບ
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modals */}
      <TitleModal
        isOpen={isTitleModalOpen}
        onClose={() => setIsTitleModalOpen(false)}
        titleToEdit={titleToEdit}
        onSuccess={fetchAllData}
      />

      <SubTitleModal
        isOpen={isSubTitleModalOpen}
        onClose={() => setIsSubTitleModalOpen(false)}
        subTitleToEdit={subTitleToEdit}
        titlesList={titlesList}
        onSuccess={fetchAllData}
      />

      <ScoreModal
        isOpen={isScoreModalOpen}
        onClose={() => setIsScoreModalOpen(false)}
        scoreToEdit={scoreToEdit}
        onSuccess={fetchAllData}
      />
    </div>
  );
}
