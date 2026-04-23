import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, User } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Logo from "./ui/Logo";
import ThemeToggle from "./ui/ThemeToggle";

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
      <Link href="#" className="gl-nav-link">ニュース</Link>
      <Link href="#" className="gl-nav-link">試合日程</Link>
      <Link href="#" className="gl-nav-link">リーグ順位</Link>
    </>
  );

  return (
    <header className="gl-header">
      <div className="gl-header-inner">
        <Link href="/">
          <Logo />
        </Link>
        
        <nav className="hidden md:flex items-center space-x-6">
          <NavLinks />
          <div className="w-px h-5 bg-border"></div>
          {session ? (
            <div className="flex items-center gap-4">
              <User className="w-5 h-5 text-text-secondary" />
              <button onClick={handleSignOut} className="gl-nav-link">ログアウト</button>
            </div>
          ) : (
            <Link href="/login" className="gl-nav-link font-semibold text-text-primary">ログイン</Link>
          )}
          <ThemeToggle />
        </nav>

        <div className="md:hidden">
          <button onClick={() => setIsOpen(!isOpen)} className="text-text-primary">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-card-bg border-t border-border">
          <nav className="flex flex-col items-center space-y-4 py-4">
            <NavLinks />
            <div className="w-full border-t border-border my-2"></div>
            {session ? (
              <button onClick={handleSignOut} className="gl-nav-link">ログアウト</button>
            ) : (
              <Link href="/login" className="gl-nav-link font-semibold text-text-primary">ログイン</Link>
            )}
            <ThemeToggle />
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
