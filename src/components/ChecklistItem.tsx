"use client";

import { useState, useRef } from "react";
import type { ChecklistItemType } from "@/lib/data";
import { Check, X, Minus, Camera, MessageSquare, Image as ImageIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type ItemState = "OK" | "NG" | "SKIP" | null;

type Props = {
  item: ChecklistItemType;
  status: ItemState;
  memo: string;
  photo: string | null;
  onStatusChange: (status: ItemState) => void;
  onMemoChange: (memo: string) => void;
  onPhotoChange: (photo: string | null) => void;
};

export default function ChecklistItem({
  item,
  status,
  memo,
  photo,
  onStatusChange,
  onMemoChange,
  onPhotoChange,
}: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const statusColors = {
    OK: "bg-green-100 border-green-500 text-green-800 hover:bg-green-200 shadow-sm",
    NG: "bg-red-100 border-red-500 text-red-800 hover:bg-red-200 shadow-sm",
    SKIP: "bg-gray-200 border-gray-400 text-gray-800 hover:bg-gray-300 shadow-sm",
    null: "bg-white border-gray-300 text-gray-500 hover:border-gray-400",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden mb-3 shadow-sm transition-all duration-300">
      <div className="p-4">
        {/* Header content */}
        <div className="flex justify-between items-start gap-3">
          <div className="flex-1">
            <h3 className="text-base font-semibold text-gray-900 tracking-tight leading-tight">
              {item.title}
            </h3>
            {item.description && (
              <p className="text-xs text-gray-500 mt-1">{item.description}</p>
            )}
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-colors text-xs font-semibold ${
                memo || photo
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {(memo || photo) ? <ImageIcon size={14} /> : <MessageSquare size={14} />}
              <span>{(memo || photo) ? "入力済" : "メモ / 写真"}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4 items-center">
          <button
            onClick={() => onStatusChange(status === "OK" ? null : "OK")}
            className={`flex-1 flex justify-center items-center py-2.5 rounded-lg border-2 font-bold transition-all duration-200 text-sm ${
              status === "OK" ? statusColors.OK : statusColors.null
            }`}
          >
            <Check size={18} className="mr-1" strokeWidth={3} /> OK
          </button>
          <button
            onClick={() => onStatusChange(status === "NG" ? null : "NG")}
            className={`flex-1 flex justify-center items-center py-2.5 rounded-lg border-2 font-bold transition-all duration-200 text-sm ${
              status === "NG" ? statusColors.NG : statusColors.null
            }`}
          >
            <X size={18} className="mr-1" strokeWidth={3} /> NG
          </button>
          <button
            onClick={() => onStatusChange(status === "SKIP" ? null : "SKIP")}
            className={`flex-1 flex justify-center items-center py-2.5 rounded-lg border-2 font-bold transition-all duration-200 text-sm ${
              status === "SKIP" ? statusColors.SKIP : statusColors.null
            }`}
          >
            <Minus size={18} className="mr-1" strokeWidth={3} /> SKIP
          </button>
        </div>
      </div>

      {/* Expandable Details (Memo and Photo) */}
      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 bg-gray-50/50"
          >
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  メモを残す
                </label>
                <textarea
                  className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors resize-none shadow-sm"
                  rows={2}
                  placeholder="気になる点などを記録..."
                  value={memo}
                  onChange={(e) => onMemoChange(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  写真を添付
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Camera size={16} /> 写真を撮る / 選ぶ
                  </button>
                  {photo && (
                    <button
                      onClick={() => onPhotoChange(null)}
                      className="text-sm text-red-500 hover:text-red-600 transition-colors underline"
                    >
                      削除
                    </button>
                  )}
                </div>
                {photo && (
                  <div className="mt-3 relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo}
                      alt="添付写真"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
