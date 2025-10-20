function Header() {
  return (
    <header className="mt-3 mb-6 text-center">
      <h1 className="inline-block text-6xl font-bold transition-colors duration-300 cursor-pointer group">
        <span className="text-white transition-colors duration-300 group-hover:text-orange-400">
          Crypto
        </span>
        <span className="text-orange-400 transition-colors duration-300 group-hover:text-white">
          Hub
        </span>
      </h1>
    </header>
  );
}

export default Header;
