import { Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-xl font-bold text-white">Goal Labo</p>
          <p className="text-sm">&copy; {new Date().getFullYear()} Goal Labo. All rights reserved.</p>
        </div>
        <div className="flex items-center space-x-4 mb-4 md:mb-0">
          <a href="#" className="hover:text-white"><Globe size={20} /></a>
          <a href="#" className="hover:text-white"><Globe size={20} /></a>
        </div>
        <div className="flex space-x-6 text-sm">
          <a href="#" className="hover:text-white">ニュース</a>
          <a href="#" className="hover:text-white">試合日程</a>
          <a href="#" className="hover:text-white">リーグ順位</a>
          <a href="#" className="hover:text-white">About</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
