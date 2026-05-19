"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";
import Logo from "./ui/Logo";
import ThemeToggle from "./ui/ThemeToggle";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const supabase = createClient();
  const router = useRouter();

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
    router.push('/login');
  };

  const NavLinks = () => (
    <>
      <Link href="/news" className="gl-nav-link">ニュース</Link>
      <Link href="/standings" className="gl-nav-link">リーグ順位</Link>
      <Link href="/board" className="gl-nav-link">掲示板</Link>
      <Link href="/simulator" className="gl-nav-link">監督AI</Link>
      <Link href="/manu" className="gl-nav-link">マンUくん</Link>
      <Link href="/game" className="gl-nav-link">育成ゲーム</Link>
    </>
  );

  return (
    <header className="gl-header">
      <div className="gl-header-inner">
        <Link href="/">
          <Logo />
        </Link>
        
        <nav className="hidden lg:flex items-center space-x-1">
          <NavLinks />
          <div className="w-px h-5 bg-border"></div>
          {session ? (
            <button onClick={handleSignOut} className="gl-nav-link">ログアウト</button>
          ) : (
            <Link href="/login" className="gl-nav-link font-semibold text-text-primary">ログイン</Link>
          )}
          <ThemeToggle />
        </nav>

        <div className="lg:hidden flex items-center gap-3">
          <ThemeToggle />
          <button onClick={() => setIsOpen(!isOpen)} className="text-text-primary">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden bg-card-bg border-t border-border">
          <nav className="flex flex-col items-center space-y-4 py-4">
            <NavLinks />
            <div className="w-full border-t border-border my-2"></div>
            {session ? (
              <button onClick={handleSignOut} className="gl-nav-link">ログアウト</button>
            ) : (
              <Link href="/login" className="gl-nav-link font-semibold text-text-primary">ログイン</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;