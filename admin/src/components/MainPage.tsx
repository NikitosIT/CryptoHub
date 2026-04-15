import { Link } from "@tanstack/react-router";

function MainPage() {
  return (
    <div className="max-w-6xl mx-auto text-white">
      <div className="py-8 sm:py-12">
        <h1 className="mb-4 text-4xl font-bold text-white sm:text-5xl md:text-6xl">
          Добро пожаловать в админ-панель
        </h1>
        <p className="mb-8 text-lg text-gray-400 sm:text-xl">
          Управляйте прогнозами и сообщениями пользователей
        </p>

        <div className="grid gap-6 mt-12 sm:grid-cols-2">
          <Link to="/forecasts" className={linkStyles}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">🧑‍💻</div>
              <h2 className="text-2xl font-semibold text-orange-400">
                AI Прогнозы
              </h2>
            </div>
            <p className="text-gray-400">
              Просмотр и управление прогнозов от AI. Одобряйте, изменяйте или
              отклоняйте прогнозы перед публикацией.
            </p>
          </Link>
          <Link to="/notifications" className={linkStyles}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">💬</div>
              <h2 className="text-2xl font-semibold text-orange-400">
                Сообщения пользователям
              </h2>
            </div>
            <p className="text-gray-400">
              Отправляйте сообщения пользователям сайта
            </p>
          </Link>
          <Link to="/tokens" className={linkStyles}>
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">🪙</div>
              <h2 className="text-2xl font-semibold text-orange-400">
                Список криптовалют
              </h2>
            </div>
            <p className="text-gray-400">Для просмотра и создания прогноза</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default MainPage;

const linkStyles =
  "p-6 transition-all bg-gray-900 border rounded-xl border-orange-500/20 hover:border-orange-500/40 hover:bg-gray-800";
