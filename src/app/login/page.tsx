
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
   import { createClient } from "../../lib/supabase/client";
   import Logo from "../components/ui/Logo";
import HologramCard from "./HologramCard";

   export default function LoginPage() {
     const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [loading, setLoading] = useState(false);
const router = useRouter();
const supabase = createClient();

const handleSignInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${location.origin}/auth/callback`,
    },
  });
};

const handleSignInWithEmail = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      alert(`エラーが発生しました: ${error.message}`);
    } else {
      router.push('/');
      router.refresh();
    }
  } catch (error) {
    alert(`予期せぬエラーが発生しました: ${error}`);
  } finally {
    setLoading(false);
  }
};

     return (
       <div className="min-h-screen flex items-center justify-center bg-page px-4 py-12">
         <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20 max-w-5xl w-full">

           {/* ホログラムカード (md以上で表示) */}
           <div className="hidden md:flex justify-center flex-shrink-0">
             <HologramCard />
           </div>

           {/* ログインフォーム */}
           <div className="w-full max-w-md mx-auto lg:mx-0">
          <div className="text-center mb-6">
            <Logo />
          </div>
           <div className="gl-card p-8">
             <h1 className="text-2xl font-bold text-center text-text-primary mb-2">おかえりなさい 👋</h1>
             <p className="text-center text-text-muted mb-6">Goal Laboにログインして続ける</p>
             
             <button 
               onClick={handleSignInWithGoogle}
               className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition-colors mb-4"
             >
               <span>Googleでログイン</span>
             </button>

             <div className="relative flex py-4 items-center">
               <div className="flex-grow border-t border-border"></div>
               <span className="flex-shrink mx-4 text-xs text-text-muted">またはメールアドレスで</span>
               <div className="flex-grow border-t border-border"></div>
             </div>

             <form onSubmit={handleSignInWithEmail}>
               <div className="space-y-4">
                 <div>
                   <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">メールアドレス</label>
                   <input
                     id="email"
                     type="email"
                     value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     required
                     className="gl-input"
                   />
                 </div>
                 <div>
                   <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1">パスワード</label>
                   <input
                     id="password"
                     type="password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                     className="gl-input"
                   />
                 </div>
               </div>
<button 
  type="submit" 
  disabled={loading}
  className="w-full mt-6 gl-btn gl-btn-primary"
>
  {loading ? 'ログイン中...' : 'ログイン'}
</button>
             </form>
              <p className="text-center mt-4 text-sm text-text-muted">
                アカウントをお持ちでないですか？{' '}
                <a href="/signup" className="font-semibold text-accent-primary hover:underline">
                  会員登録
                </a>
              </p>
           </div>
           </div>

         </div>
       </div>
     );
   }
