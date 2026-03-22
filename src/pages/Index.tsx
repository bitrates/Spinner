import { useState, useCallback, useEffect, useRef } from "react";
import SpinWheel from "@/components/SpinWheel";
import WheelSidebar from "@/components/WheelSidebar";
import { Minimize2, X } from "lucide-react";

const Index = () => {
  const [items, setItems] = useState<string[]>([]);
  const [fullscreen, setFullscreen] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const handleResult = useCallback((item: string) => {
    setResult(item);
    setShowPopup(true);
  }, []);

  // Auto-dismiss in fullscreen after 3 seconds
  useEffect(() => {
    if (showPopup && fullscreen) {
      timerRef.current = setTimeout(() => setShowPopup(false), 3000);
      return () => clearTimeout(timerRef.current);
    }
  }, [showPopup, fullscreen]);

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex items-center justify-center p-8">
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-4 right-4 p-2 rounded-md bg-card border border-border hover:bg-accent transition-colors duration-100 z-10"
        >
          <Minimize2 size={20} className="text-foreground" />
        </button>
        {showPopup && result && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 animate-fade-in rounded-lg bg-orange-accent px-6 py-3 text-center z-10">
            <span className="text-sm text-orange-accent-foreground/80">Winner: </span>
            <span className="text-lg font-bold text-orange-accent-foreground">{result}</span>
          </div>
        )}
        <div className="w-full h-full max-w-[80vh]">
          <SpinWheel items={items} onResult={handleResult} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background relative">
      {/* Sidebar */}
      <div className="w-80 min-w-72 border-r border-border flex-shrink-0">
        <WheelSidebar
          items={items}
          setItems={setItems}
          onToggleFullscreen={() => setFullscreen(true)}
          result={result}
        />
      </div>
      {/* Main stage */}
      <main className="flex-1 h-screen p-6 relative">
        <SpinWheel items={items} onResult={handleResult} />
        {/* Winner popup overlay */}
        {showPopup && result && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-foreground/20 backdrop-blur-sm">
            <div className="animate-fade-in rounded-xl bg-orange-accent px-10 py-8 text-center shadow-2xl relative">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2 p-1 rounded-md text-orange-accent-foreground/60 hover:text-orange-accent-foreground transition-colors"
              >
                <X size={18} />
              </button>
              <p className="text-sm font-medium text-orange-accent-foreground/80 mb-1">🎉 Winner</p>
              <p className="text-3xl font-bold text-orange-accent-foreground">{result}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
