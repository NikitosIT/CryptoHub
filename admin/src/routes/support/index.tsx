import { createFileRoute } from "@tanstack/react-router";

import { createRouteGuard } from "@/hooks/routeGuards";

export const Route = createFileRoute("/support/")({
  beforeLoad: createRouteGuard({
    requireAuth: true,
  }),
  component: SupportPage,
});

function SupportPage() {
  return (
    <div className="max-w-6xl min-h-screen p-4 mx-auto text-white bg-black sm:p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">
          💬 Сообщения пользователей
        </h1>
        <p className="mt-2 text-gray-400">
          Просматривайте и управляйте сообщениями от пользователей
        </p>
      </div>

      <div className="space-y-6">
        {/* Placeholder for messages - will be populated with actual data later */}
        <div className="p-6 bg-gray-900 border rounded-xl border-orange-500/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Сообщения скоро появятся
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Здесь будут отображаться сообщения от пользователей
              </p>
            </div>
            <span className="px-3 py-1 text-xs font-medium text-gray-400 bg-gray-800 rounded-full">
              Новое
            </span>
          </div>
          <p className="text-gray-300">
            После подключения API здесь будут отображаться сообщения,
            отправленные пользователями через форму обратной связи.
          </p>
        </div>

        {/* Example message card structure */}
        <div className="p-6 bg-gray-900 border opacity-50 rounded-xl border-orange-500/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold text-white">
                  Пример сообщения
                </h3>
                <span className="px-2 py-1 text-xs font-medium text-orange-400 rounded bg-orange-500/20">
                  Пример
                </span>
              </div>
              <p className="text-sm text-gray-400">user@example.com</p>
              <p className="mt-2 text-sm text-gray-500">2024-01-01 12:00:00</p>
            </div>
          </div>
          <div className="p-4 mb-4 rounded-lg bg-white/5">
            <p className="text-gray-300 whitespace-pre-wrap">
              Это пример структуры сообщения. Здесь будет отображаться текст,
              отправленный пользователем через форму обратной связи.
            </p>
          </div>
          <div className="flex gap-3">
            <button
              disabled
              className="px-4 py-2 text-sm font-medium text-white transition-colors bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Отметить как прочитанное
            </button>
            <button
              disabled
              className="px-4 py-2 text-sm font-medium text-white transition-colors bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              📧 Ответить
            </button>
            <button
              disabled
              className="px-4 py-2 text-sm font-medium text-white transition-colors bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              🗑️ Удалить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
