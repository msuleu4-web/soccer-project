
  "use client";

  import { useState } from "react";
  import { createClient } from "../../lib/supabase/client";

  export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
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
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
      // This should be handled by a route handler
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-deep-dark-navy">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-card-bg border border-gray-800 rounded-xl p-8">
            <h1 className="text-2xl font-bold text-center text-text-primary mb-6">Goal Laboにログイン</h1>
            
            <button 
              onClick={handleSignInWithGoogle}
              className="w-full flex items-center justify-center gap-2 bg-white text-black font-semibold py-2.5 rounded-lg hover:bg-gray-200 transition-colors mb-4"
            >
              <span>Googleでログイン</span>
            </button>

            <div className="relative flex py-4 items-center">
              <div className="flex-grow border-t border-gray-700"></div>
              <span className="flex-shrink mx-4 text-xs text-text-secondary">またはメールアドレスで</span>
              <div className="flex-grow border-t border-gray-700"></div>
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
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gamba-blue focus:border-gamba-blue outline-none transition"
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
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-gamba-blue focus:border-gamba-blue outline-none transition"
                  />
                </div>
              </div>
              <button 
                type="submit" 
                className="w-full mt-6 bg-gamba-blue text-white font-semibold py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
              >
                ログイン
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
