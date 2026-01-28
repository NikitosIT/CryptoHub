import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { useForecasts } from "@/api/useForecasts";
import { createRouteGuard } from "@/hooks/routeGuards";
import { getSentimentStyles, getSentimentLabel } from "../../utils/sentiment";
import { ForecastEditor } from "@/components/ForecastEditor";

export const Route = createFileRoute("/forecasts/")({
  beforeLoad: createRouteGuard({
    requireAuth: true,
  }),
  component: AdminForecastsWrapper,
});

export default function AdminForecastsWrapper() {
  const { authorized, logout } = useAdminAuth();
  const [editingId, setEditingId] = useState<number | null>(null);
  const {
    forecasts,
    loading,
    actionLoading,
    error: forecastsError,
    updateStatus,
    updateText,
  } = useForecasts(authorized, logout);

  return (
    <div className="max-w-6xl min-h-screen p-4 mx-auto text-white bg-black sm:p-6 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold text-white">
          🧠 AI Прогнозы (Админка)
        </h1>
      </div>

      {forecastsError && (
        <div className="p-4 mb-6 text-red-400 border rounded-lg bg-red-600/20 border-red-500/50">
          {forecastsError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-2 border-orange-500 rounded-full border-t-transparent animate-spin" />
        </div>
      ) : forecasts.length === 0 ? (
        <p className="py-16 text-center text-gray-400">Нет новых прогнозов</p>
      ) : (
        <div className="space-y-6">
          {forecasts.map((forecast) => (
            <div
              key={forecast.id}
              className="p-4 bg-gray-900 border sm:p-6 border-orange-500/20 rounded-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold text-orange-400">
                  {forecast.token_name}
                </h2>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${getSentimentStyles(
                    forecast.sentiment,
                  )}`}
                >
                  {getSentimentLabel(forecast.sentiment)}
                </span>
              </div>

              {editingId === forecast.id ? (
                <ForecastEditor
                  forecast={forecast}
                  onSave={async (id, text) => {
                    await updateText(id, text);
                    setEditingId(null);
                  }}
                  onCancel={() => setEditingId(null)}
                  isSaving={actionLoading === forecast.id}
                />
              ) : (
                <p className="mb-6 leading-relaxed text-gray-200 whitespace-pre-wrap">
                  {forecast.forecast_text}
                </p>
              )}

              <div className="p-4 mb-6 rounded-lg bg-white/5">
                <strong className="block mb-2 text-sm text-gray-400">
                  Источник:
                </strong>
                <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap">
                  {forecast.source_url}
                </pre>
              </div>

              <div className="flex gap-3">
                {editingId !== forecast.id && (
                  <button
                    onClick={() => setEditingId(forecast.id)}
                    className="px-4 py-2 text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    ✏️ Edit
                  </button>
                )}
                <button
                  onClick={() => updateStatus(forecast.id, "approved")}
                  disabled={
                    actionLoading === forecast.id || editingId === forecast.id
                  }
                  className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[120px]"
                >
                  {actionLoading === forecast.id ? (
                    <span className="inline-block w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : (
                    "✅ Approve"
                  )}
                </button>

                <button
                  onClick={() => updateStatus(forecast.id, "rejected")}
                  disabled={
                    actionLoading === forecast.id || editingId === forecast.id
                  }
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center min-w-[120px]"
                >
                  {actionLoading === forecast.id ? (
                    <span className="inline-block w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin" />
                  ) : (
                    "❌ Reject"
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
