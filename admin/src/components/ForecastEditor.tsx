import { useState } from "react";
import type { TokenForecast } from "../types/admins";

interface ForecastEditorProps {
  forecast: TokenForecast;
  onSave: (id: number, text: string) => Promise<void>;
  onCancel: () => void;
  isSaving: boolean;
}

export function ForecastEditor({
  forecast,
  onSave,
  onCancel,
  isSaving,
}: ForecastEditorProps) {
  const [editedText, setEditedText] = useState(forecast.forecast_text);

  const handleSave = async () => {
    if (editedText.trim() === forecast.forecast_text.trim()) {
      onCancel();
      return;
    }
    await onSave(forecast.id, editedText);
  };

  return (
    <div className="mb-6">
      <textarea
        value={editedText}
        onChange={(e) => setEditedText(e.target.value)}
        disabled={isSaving}
        className="w-full p-4 text-gray-200 border rounded-lg bg-white/5 border-orange-500/30 focus:outline-none focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed resize-y min-h-[300px] font-mono text-sm leading-relaxed"
      />
      <div className="flex gap-3 mt-3">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? "Сохранение..." : "💾 Сохранить"}
        </button>
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-gray-300 bg-gray-700 rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Отмена
        </button>
      </div>
    </div>
  );
}
