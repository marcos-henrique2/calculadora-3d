import { useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const { pathname } = useLocation();
  useEffect(() => { console.error("404:", pathname); }, [pathname]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <p className="text-8xl font-bold text-primary/20 font-mono">404</p>
        <h1 className="text-2xl font-semibold">Página não encontrada</h1>
        <a href="/" className="inline-block mt-2 px-6 py-2.5 rounded-lg bg-primary text-white text-[14px] font-medium hover:bg-primary/90 transition-colors">
          Voltar ao início
        </a>
      </div>
    </div>
  );
}
