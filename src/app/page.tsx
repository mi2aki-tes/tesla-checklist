"use client";

import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { CHECKLIST_ITEMS } from "@/lib/data";
import ChecklistItemComponent, { ItemState } from "@/components/ChecklistItem";
import { Download, Car, Trash2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { track } from "@vercel/analytics";

type ItemData = {
  status: ItemState;
  memo: string;
  photo: string | null;
};

type AppState = {
  selectedModel: string;
  itemsData: Record<string, ItemData>;
};

const DEFAULT_STATE: AppState = {
  selectedModel: "Model Y", 
  itemsData: {},
};

const CAR_MODELS = ["Model 3", "Model Y", "Model S", "Model X", "その他"];

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("teslaChecklistData");
    if (saved) {
      try {
        setState(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("teslaChecklistData", JSON.stringify(state));
    }
  }, [state, mounted]);

  if (!mounted) return null;

  const currentItems = CHECKLIST_ITEMS;
  const categories = Array.from(new Set(currentItems.map((i) => i.category)));

  const totalItems = currentItems.length;
  const completedItems = currentItems.filter(
    (item) => state.itemsData[item.id]?.status
  ).length;
  const progressPercent = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const handleUpdateItem = (id: string, partialData: Partial<ItemData>) => {
    setState((prev) => {
      const existing = prev.itemsData[id] || { status: null, memo: "", photo: null };
      return {
        ...prev,
        itemsData: {
          ...prev.itemsData,
          [id]: { ...existing, ...partialData },
        },
      };
    });
  };

  const handleClearAll = () => {
    if (confirm("すべてのデータを削除してよろしいですか？")) {
      setState((prev) => ({ ...prev, itemsData: {} }));
    }
  };

  const exportPDF = async () => {
    if (isExporting) return;
    setIsExporting(true);
    
    // Analytics tracking for PDF Export
    track('PDF_Exported', { model: state.selectedModel });
    
    window.scrollTo(0, 0);

    try {
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const maxPdfHeight = pdf.internal.pageSize.getHeight();

      // 1. Capture the main table
      const tableElement = document.getElementById("print-template");
      if (tableElement) {
        const canvas = await html2canvas(tableElement, {
          scale: 2, 
          useCORS: true,
          backgroundColor: "#FFFFFF" 
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        let pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        if (pdfHeight > maxPdfHeight) pdfHeight = maxPdfHeight;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }

      // 2. Capture all photo pages
      const photoPages = document.querySelectorAll('.print-photo-page');
      for (let i = 0; i < photoPages.length; i++) {
        const pageEl = photoPages[i] as HTMLElement;
        const canvas = await html2canvas(pageEl, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#FFFFFF"
        });
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        pdf.addPage();
        let pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        if (pdfHeight > maxPdfHeight) pdfHeight = maxPdfHeight;
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      }
      
      pdf.save(`TeslaDeliveryChecklist_${state.selectedModel}.pdf`);
    } catch (error) {
      console.error("PDF export failed", error);
      alert("PDFの出力に失敗しました。");
    } finally {
      setIsExporting(false);
    }
  };

  // Get items with photos
  const itemsWithPhotos = currentItems.filter(item => state.itemsData[item.id]?.photo);
  // Split into chunks of 6
  const photoChunks = [];
  for (let i = 0; i < itemsWithPhotos.length; i += 6) {
    photoChunks.push(itemsWithPhotos.slice(i, i + 6));
  }

  return (
    <main className="min-h-screen text-gray-900 pb-24">
      {/* Header Sticky */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Car className="text-gray-700" />
                Tesla納車時チェックリスト
              </h1>
              <p className="text-xs text-gray-500 mt-1">端末に自動保存されます</p>
            </div>
            <button
              onClick={exportPDF}
              disabled={isExporting}
              className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
            >
              {isExporting ? "作成中..." : (
                <>
                  <Download size={16} /> PDF出力
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress Bar (Full width now) */}
            <div className="flex items-center gap-3 text-xs font-medium flex-1">
              <span className="text-gray-500 w-8">{progressPercent}%</span>
              <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gray-800"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-gray-500 w-10 text-right">
                {completedItems}/{totalItems}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Checklist Content */}
      <div className="max-w-2xl mx-auto px-4 py-8 bg-gray-50">
        
        {/* Car Model Selector Card */}
        <div className="mb-6 bg-white border-2 border-blue-500 rounded-xl p-5 shadow-md transform transition-all duration-300">
           <h2 className="text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
             <Car className="text-blue-500" /> まずはご自身の車種を選択してください
           </h2>
           <select 
             value={state.selectedModel}
             onChange={(e) => setState(prev => ({ ...prev, selectedModel: e.target.value }))}
             className="w-full bg-gray-50 border border-gray-300 rounded-lg py-3 px-4 text-gray-900 font-bold focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer"
           >
              {CAR_MODELS.map(m => <option key={m} value={m}>{m}</option>)}
           </select>
        </div>

        {/* Warning / Notes section */}
        <div className="mb-8 p-4 bg-gray-100 border border-gray-200 rounded-xl text-sm text-gray-700 leading-relaxed shadow-sm">
          <p className="font-semibold mb-2">納車時のアドバイス💡</p>
          <p>
            日本の一般的なディーラーでの納車式とは異なり、テスラでは実車を前にして「ご自身でチェックしてそのまま出発する」セルフサービスのスタイルが基本になります。
            <br className="mb-2" />
            スタッフさんが手取り足取り説明してくれるわけではないため、出発前にこのリストを使って、大きな傷や明確な不備がないかご自身の目でサクッと確認しておくのがおすすめです！（※軽微なものは後日アプリからでも対応依頼できます）
          </p>
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-bold mb-4 flex items-center text-gray-800 border-b border-gray-200 pb-2">
              <ArrowRight className="text-gray-400 mr-2" size={20} />
              {category}
            </h2>
            <div className="flex flex-col gap-2">
              {currentItems
                .filter((item) => item.category === category)
                .map((item) => {
                  const data = state.itemsData[item.id] || { status: null, memo: "", photo: null };
                  return (
                    <ChecklistItemComponent
                      key={item.id}
                      item={item}
                      status={data.status}
                      memo={data.memo}
                      photo={data.photo}
                      onStatusChange={(status) => handleUpdateItem(item.id, { status })}
                      onMemoChange={(memo) => handleUpdateItem(item.id, { memo })}
                      onPhotoChange={(photo) => handleUpdateItem(item.id, { photo })}
                    />
                  );
                })}
            </div>
          </div>
        ))}

        <div className="mt-12 flex justify-center pb-8 border-t border-gray-200 pt-8">
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} /> データをすべてリセット
          </button>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="max-w-2xl mx-auto px-4 pb-12 text-center">
        <div className="inline-flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-2xl shadow-sm w-full">
          <p className="text-gray-800 font-bold mb-4">Developed by mi2aki</p>
          <div className="flex justify-center items-center gap-6">
            <a href="https://mi2aki.com" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors underline underline-offset-4">
              Website
            </a>
            <a href="https://youtube.com/" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-500 hover:text-red-600 transition-colors underline underline-offset-4">
              YouTube
            </a>
            <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-gray-500 hover:text-black transition-colors underline underline-offset-4">
              X (Twitter)
            </a>
          </div>
        </div>
      </footer>

      {/* --- HIDDEN PRINT TEMPLATES --- */}
      <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none">
        
        {/* Page 1: Table */}
        <div id="print-template" className="w-[800px] bg-white p-10 text-black">
          <h1 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">Tesla納車時チェックリスト（{state.selectedModel}）</h1>
          
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800 text-white border-b-2 border-gray-800">
                <th className="py-2.5 px-4 font-bold w-24">結果</th>
                <th className="py-2.5 px-4 font-bold">カテゴリ / 項目</th>
                <th className="py-2.5 px-4 font-bold w-1/3">メモ</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => {
                const data = state.itemsData[item.id] || { status: null, memo: "", photo: null };
                let statusText = "未確認";
                let statusColor = "text-gray-400";
                if (data.status === "OK") { statusText = "✅ OK"; statusColor = "text-green-700 font-bold"; }
                if (data.status === "NG") { statusText = "❌ NG"; statusColor = "text-red-700 font-bold"; }
                if (data.status === "SKIP") { statusText = "➖ SKIP"; statusColor = "text-gray-600"; }

                return (
                  <tr key={item.id} className="border-b border-gray-200 even:bg-gray-50/80">
                    <td className={`py-2 px-4 ${statusColor}`}>{statusText}</td>
                    <td className="py-2 px-4">
                      <div className="font-bold text-gray-900">{item.title}</div>
                      <div className="text-[10px] text-gray-500 font-medium">{item.category}</div>
                    </td>
                    <td className="py-2 px-4 text-xs text-gray-700">
                      {data.memo}
                      {data.photo && <span className="block mt-0.5 text-blue-600 font-semibold">[写真添付あり - 次ページ参照]</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-4 text-right text-xs text-gray-500">
            確認日: {new Date().toLocaleDateString("ja-JP")} / 進行度: {completedItems}/{totalItems} ({progressPercent}%)
          </div>
        </div>

        {/* Pages 2+: Photo Grids */}
        {photoChunks.map((chunk, pageIndex) => (
          <div key={`photo-page-${pageIndex}`} className="print-photo-page w-[800px] h-[1130px] bg-white p-10 text-black flex flex-col">
            <h2 className="text-xl font-bold border-b-2 border-gray-300 pb-2 mb-6">添付写真 ({pageIndex + 1}/{photoChunks.length})</h2>
            <div className="grid grid-cols-2 gap-6 flex-1 content-start">
              {chunk.map((item) => (
                <div key={`photo-${item.id}`} className="flex flex-col gap-2 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="font-bold text-sm text-gray-800">{item.title}</div>
                  <div className="text-xs text-gray-600 mb-2 truncate">{state.itemsData[item.id]?.memo || "メモなし"}</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={state.itemsData[item.id]?.photo || ""} 
                    alt={item.title}
                    className="w-full h-48 object-cover rounded shadow-sm border border-gray-300 bg-white"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}

      </div>
    </main>
  );
}
