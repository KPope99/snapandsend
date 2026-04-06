import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white px-4 py-6">
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Link to="/about" className="text-sm text-gray-300 hover:text-white transition-colors">
          About Us
        </Link>
        <Link to="/how-it-works" className="text-sm text-gray-300 hover:text-white transition-colors">
          How it Works
        </Link>
        <Link to="/collaborate" className="text-sm text-gray-300 hover:text-white transition-colors">
          Collaborate with Us
        </Link>
        <Link to="/fixers" className="text-sm text-gray-300 hover:text-white transition-colors">
          Fixers
        </Link>
        <Link to="/help" className="text-sm text-gray-300 hover:text-white transition-colors">
          Help Centre
        </Link>
      </div>
      <div className="border-t border-gray-700 pt-4 text-center">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Tech84. All rights reserved.</p>
      </div>
    </footer>
  );
}
