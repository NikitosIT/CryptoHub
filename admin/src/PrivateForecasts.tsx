import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

const ADMIN_PASSWORD = "Crypto2025";

export default function AdminForecastsWrapper() {
  const [authorized, setAuthorized] = useState(false);
  const [input, setInput] = useState("");
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  // ✅ Проверяем сохранённый доступ
  useEffect(() => {
    if (localStorage.getItem("adminAccess") === "true") {
      setAuthorized(true);
      loadForecasts();
    }
  }, []);

  // 🔐 Авторизация по паролю
  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === ADMIN_PASSWORD) {
      setAuthorized(true);
      localStorage.setItem("adminAccess", "true");
      loadForecasts();
    } else {
      alert("❌ Неверный пароль");
    }
  }

  // 🔄 Выход из админки
  function logout() {
    localStorage.removeItem("adminAccess");
    setAuthorized(false);
  }

  // 📦 Загрузка прогнозов
  async function loadForecasts() {
    setLoading(true);
    const { data, error } = await supabase
      .from("token_forecasts")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });
    if (error) console.error(error);
    setForecasts(data || []);
    setLoading(false);
  }

  // ✅ Обновление статуса
  async function updateStatus(id: number, status: "approved" | "rejected") {
    setActionLoading(`${id}-${status}`);

    const { error } = await supabase
      .from("token_forecasts")
      .update({ status })
      .eq("id", id);
    if (error) {
      console.error("Ошибка при обновлении статуса:", error.message);
      setActionLoading(null);
      return;
    }
    setForecasts((prev) => prev.filter((f) => f.id !== id));
    setActionLoading(null);
  }

  // 🔄 Регенерация прогноза

  // 🔐 Если не авторизован — показываем экран пароля
  if (!authorized) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4 p-8 bg-gray-900 shadow-lg rounded-xl w-80"
        >
          <h2 className="text-2xl font-semibold text-center text-white">
            🔐 Вход в админку
          </h2>
          <input
            type="password"
            placeholder="Введите пароль"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="p-3 text-white bg-gray-800 border border-gray-700 rounded focus:outline-none focus:border-yellow-500"
          />
          <button
            type="submit"
            className="py-2 font-bold text-black bg-yellow-500 rounded hover:bg-yellow-600"
          >
            Войти
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-6xl p-8 mx-auto text-white">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">🧠 AI Прогнозы (Админка)</h1>
        <button
          onClick={logout}
          className="text-sm text-gray-400 hover:text-red-400"
        >
          Выйти
        </button>
      </div>

      {loading ? (
        <p>Загрузка...</p>
      ) : forecasts.length === 0 ? (
        <p className="text-gray-400">Нет новых прогнозов</p>
      ) : (
        <div className="space-y-6">
          {forecasts.map((f) => (
            <div
              key={f.id}
              className="p-6 bg-gray-800 border border-gray-700 shadow-md rounded-2xl"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-semibold text-yellow-400">
                  {f.token_name}
                </h2>
                <span
                  className={`text-sm px-3 py-1 rounded-full ${
                    f.sentiment === "positive"
                      ? "bg-green-600/20 text-green-400"
                      : f.sentiment === "negative"
                      ? "bg-red-600/20 text-red-400"
                      : "bg-gray-600/20 text-gray-400"
                  }`}
                >
                  {f.sentiment}
                </span>
              </div>

              <p className="leading-relaxed text-gray-200 whitespace-pre-wrap">
                {f.forecast_text}
              </p>

              <div className="mt-4 text-sm text-gray-500">
                <strong>Источник:</strong>
                <pre className="whitespace-pre-wrap">{f.source_url}</pre>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => updateStatus(f.id, "approved")}
                  disabled={!!actionLoading}
                  className="px-4 py-2 text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  ✅ Approve
                </button>

                <button
                  onClick={() => updateStatus(f.id, "rejected")}
                  disabled={!!actionLoading}
                  className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
