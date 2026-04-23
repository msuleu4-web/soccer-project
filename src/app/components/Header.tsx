import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const NavLinks = () => (
    <>
      <Link href="#" className="text-base text-text-secondary hover:text-text-primary transition-colors">ニュース</Link>
      <Link href="#" className="text-base text-text-secondary hover:text-text-primary transition-colors">試合日程</Link>
      <Link href="#" className="text-base text-text-secondary hover:text-text-primary transition-colors">リーグ順位</Link>
    </>
  );

  return (
    <header className="sticky top-0 z-50 bg-card-bg/80 backdrop-blur-lg border-b border-white/10">
      <div className="max-w-4xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-text-primary">Goal Labo</Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <NavLinks />
          <div className="w-px h-6 bg-white/10"></div>
          {session ? (
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-text-secondary" />
              <button onClick={handleSignOut} className="text-base text-text-secondary hover:text-text-primary transition-colors">ログアウト</button>
            </div>
          ) : (
            <Link href="/login" className="text-base text-text-secondary hover:text-text-primary transition-colors">ログイン</Link>
          )}
        </nav>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-text-primary">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card-bg border-t border-white/10">
          <nav className="flex flex-col items-center space-y-4 py-4">
            <NavLinks />
            <div className="w-full border-t border-white/10 my-2"></div>
            {session ? (
              <button onClick={handleSignOut} className="text-base text-text-secondary hover:text-text-primary transition-colors">ログアウト</button>
            ) : (
              <Link href="/login" className="text-base text-text-secondary hover:text-text-primary transition-colors">ログイン</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
