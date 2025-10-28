import { useUserStore } from "@/store/useUserStore";
import { Link, useNavigate } from "@tanstack/react-router";
function Header() {
  const { user } = useUserStore();
  const navigate = useNavigate();
  return (
    <header className="mt-3 mb-6 text-center">
      <h1
        onClick={() => navigate({ to: "/" })}
        className="inline-block text-6xl font-bold transition-colors duration-300 cursor-pointer group"
      >
        <span className="text-white transition-colors duration-300 group-hover:text-orange-400">
          Crypto
        </span>
        <span className="text-orange-400 transition-colors duration-300 group-hover:text-white">
          Hub
        </span>
      </h1>
      <nav>
        <ul className="flex justify-center gap-10 mb-4">
          {!user && (
            <li>
              <Link className="text-white hover:text-blue-400" to="/auth/email">
                Login
              </Link>
            </li>
          )}
          {user && (
            <li>
              <Link
                className="text-white hover:text-blue-400"
                to="/profile/profile"
              >
                Profile
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default Header;
