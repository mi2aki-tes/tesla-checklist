"use client";

import { useState, useEffect } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { CHECKLIST_ITEMS } from "@/lib/data";
import ChecklistItemComponent, { ItemState } from "@/components/ChecklistItem";
import { Download, Car, Trash2, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

type ItemData = {
  status: ItemState;
  memo: string;
  photo: string | null;
};

type AppState = {
  itemsData: Record<string, ItemData>;
};

const DEFAULT_STATE: AppState = {
  itemsData: {},
};

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isExporting, setIsExporting] = useState(false);

  // Load from localStorage
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

  // Save to localStorage
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("teslaChecklistData", JSON.stringify(state));
    }
  }, [state, mounted]);

  if (!mounted) return null; // Avoid hydration mismatch

  // Current items
  const currentItems = CHECKLIST_ITEMS;

  // Group by category
  const categories = Array.from(new Set(currentItems.map((i) => i.category)));

  // Progress calculation
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
    
    window.scrollTo(0, 0);

    try {
      const element = document.getElementById("print-template");
      if (!element) return;
      
      // html2canvas capture 
      const canvas = await html2canvas(element, {
        scale: 2, 
        useCORS: true,
        backgroundColor: "#FFFFFF" 
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.8);
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      // Calculate height to fit A4 ratio identically
      let pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      // Force it to fit on one page if it's slightly too long
      const maxPdfHeight = pdf.internal.pageSize.getHeight();
      if (pdfHeight > maxPdfHeight) {
         pdfHeight = maxPdfHeight;
      }
      
      // Calculate centering (Optional, but let's draw it from top)
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
      
      pdf.save(`Tesla_Delivery_Checklist.pdf`);
    } catch (error) {
      console.error("PDF export failed", error);
      alert("PDFの出力に失敗しました。");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <main className="min-h-screen text-gray-900 pb-24">
      {/* Header Sticky */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2 text-gray-900">
                <Car className="text-gray-700" />
                納車チェックリスト
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

          {/* Progress Bar */}
          <div className="mt-4 flex items-center gap-3 text-xs font-medium">
            <span className="text-gray-500 w-10">{progressPercent}%</span>
            <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gray-800"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className="text-gray-500 w-12 text-right">
              {completedItems}/{totalItems}
            </span>
          </div>
        </div>
      </header>

      {/* Main Checklist Content */}
      <div id="pdf-content" className="max-w-2xl mx-auto px-4 py-8 bg-gray-50">
        
        {/* Warning / Notes section matching user's pdf vibe */}
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

      {/* Hidden Print Template for PDF Generation */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
        <div id="print-template" className="w-[800px] bg-white p-10 text-black">
          <h1 className="text-2xl font-bold border-b-2 border-black pb-2 mb-6">テスラ 納車チェックリスト 結果レポート</h1>
          
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-400">
                <th className="py-2 px-3 font-semibold w-24">結果</th>
                <th className="py-2 px-3 font-semibold">カテゴリ / 項目</th>
                <th className="py-2 px-3 font-semibold w-1/3">メモ</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item) => {
                const data = state.itemsData[item.id] || { status: null, memo: "", photo: null };
                
                // Color formatting for PDF
                let statusText = "未確認";
                let statusColor = "text-gray-400";
                if (data.status === "OK") { statusText = "✅ OK"; statusColor = "text-green-600 font-bold"; }
                if (data.status === "NG") { statusText = "❌ NG"; statusColor = "text-red-600 font-bold"; }
                if (data.status === "SKIP") { statusText = "➖ SKIP"; statusColor = "text-gray-500"; }

                return (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className={`py-2 px-3 ${statusColor}`}>{statusText}</td>
                    <td className="py-2 px-3">
                      <div className="font-semibold text-gray-800">{item.title}</div>
                      <div className="text-xs text-gray-500">{item.category}</div>
                    </td>
                    <td className="py-2 px-3 text-xs text-gray-700">
                      {data.memo}
                      {data.photo && <span className="block mt-1 text-blue-500">[写真添付あり]</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-6 text-right text-sm text-gray-500">
            確認日: {new Date().toLocaleDateString("ja-JP")} / 進行度: {completedItems}/{totalItems} ({progressPercent}%)
          </div>
        </div>
      </div>
    </main>
  );
}
