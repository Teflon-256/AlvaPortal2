import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(hsl(217,100%,70%) 1px, transparent 1px),
            linear-gradient(90deg, hsl(217,100%,70%) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>
      
      <Card className="w-full max-w-md mx-4 bg-zinc-900/50 border-2 border-cyan-500/30 backdrop-blur-sm relative z-10">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2 items-center">
            <AlertCircle className="h-8 w-8 text-red-400" />
            <h1 className="text-2xl font-mono font-bold text-cyan-400">404 NOT FOUND</h1>
          </div>

          <p className="mt-4 text-sm text-zinc-400 font-mono">
            THE PAGE YOU ARE LOOKING FOR DOES NOT EXIST
          </p>
          
          <a 
            href="/" 
            className="mt-6 inline-block bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black px-6 py-2 rounded-md font-mono font-bold transition-colors"
          >
            RETURN HOME
          </a>
        </CardContent>
      </Card>
      
      <style>{`
        @keyframes grid-move {
          0% { transform: translateY(0); }
          100% { transform: translateY(50px); }
        }
      `}</style>
    </div>
  );
}
