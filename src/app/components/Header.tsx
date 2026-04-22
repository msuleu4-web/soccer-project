import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-lg border-b border-slate-800">
      <div className="container mx-auto px-4 h-16 flex justify-between items-center">
        <div className="text-2xl font-bold text-white">Goal Labo</div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-slate-300 hover:text-white transition-colors">ニュース</a>
          <a href="#" className="text-slate-300 hover:text-white transition-colors">試合日程</a>
          <a href="#" className="text-slate-300 hover:text-white transition-colors">リーグ順位</a>
          <a href="#" className="text-slate-300 hover:text-white transition-colors">About</a>
        </nav>
        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-white">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden bg-slate-900">
          <nav className="flex flex-col items-center space-y-4 py-4">
            <a href="#" className="text-slate-300 hover:text-white">ニュース</a>
            <a href="#" className="text-slate-300 hover:text-white">試合日程</a>
            <a href="#" className="text-slate-300 hover:text-white">リーグ順位</a>
            <a href="#" className="text-slate-300 hover:text-white">About</a>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;


