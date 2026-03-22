import { useRef, useState, useCallback, useEffect } from "react";

const WHEEL_COLORS = [
  "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4",
  "#EC4899", "#14B8A6", "#F97316", "#6366F1", "#84CC16",
];

interface SpinWheelProps {
  items: string[];
  onResult?: (item: string) => void;
}

const SpinWheel = ({ items, onResult }: SpinWheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const animRef = useRef<number>(0);
  const rotRef = useRef(0);
  const sizeRef = useRef(0);

  const drawWheel = useCallback(
    (rot: number) => {
      const canvas = canvasRef.current;
      if (!canvas || items.length === 0) return;
      const ctx = canvas.getContext("2d")!;
      const size = canvas.width / 2; // account for retina
      const center = size / 2;
      const radius = center - 4;
      const sliceAngle = (2 * Math.PI) / items.length;

      ctx.save();
      ctx.setTransform(2, 0, 0, 2, 0, 0); // retina scale
      ctx.clearRect(0, 0, size, size);

      items.forEach((item, i) => {
        const startAngle = rot + i * sliceAngle;
        const endAngle = startAngle + sliceAngle;

        ctx.beginPath();
        ctx.moveTo(center, center);
        ctx.arc(center, center, radius, startAngle, endAngle);
        ctx.closePath();
        ctx.fillStyle = WHEEL_COLORS[i % WHEEL_COLORS.length];
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.3)";
        ctx.lineWidth = 2;
        ctx.stroke();

        // Text
        ctx.save();
        ctx.translate(center, center);
        ctx.rotate(startAngle + sliceAngle / 2);
        ctx.textAlign = "right";
        ctx.fillStyle = "#fff";
        const fontSize = Math.max(12, Math.min(20, (radius * 0.12)));
        ctx.font = `600 ${fontSize}px Inter, sans-serif`;
        const maxLen = Math.floor(radius / (fontSize * 0.55));
        const label = item.length > maxLen ? item.slice(0, maxLen - 1) + "…" : item;
        ctx.fillText(label, radius - 18, fontSize / 3);
        ctx.restore();
      });

      ctx.restore();
    },
    [items]
  );

  useEffect(() => {
    drawWheel(rotation);
  }, [rotation, drawWheel]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(() => {
      const s = Math.min(container.clientWidth, container.clientHeight);
      sizeRef.current = s;
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = s * 2;
      canvas.height = s * 2;
      canvas.style.width = `${s}px`;
      canvas.style.height = `${s}px`;
      drawWheel(rotRef.current);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [drawWheel]);

  const spin = useCallback(() => {
    if (spinning || items.length < 2) return;
    setSpinning(true);

    const totalRotation = Math.PI * 2 * (8 + Math.random() * 6);
    const duration = 4000 + Math.random() * 2000;
    const startTime = performance.now();
    const startRot = rotRef.current;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentRot = startRot + totalRotation * eased;

      rotRef.current = currentRot;
      setRotation(currentRot);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setSpinning(false);
        const sliceAngle = (2 * Math.PI) / items.length;
        // Pointer is at top (-PI/2). Find which segment is under it.
        const pointerAngle = ((-Math.PI / 2 - currentRot) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const winnerIndex = Math.floor(pointerAngle / sliceAngle) % items.length;
        onResult?.(items[winnerIndex]);
      }
    };

    animRef.current = requestAnimationFrame(animate);
  }, [spinning, items, onResult]);

  useEffect(() => {
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-lg">
        Add items to spin the wheel
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center relative">
      <div className="relative">
        {/* Pointer at top center */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <svg width="32" height="40" viewBox="0 0 32 40">
            <polygon points="16,40 0,0 32,0" fill="hsl(30, 100%, 50%)" />
          </svg>
        </div>
        <canvas ref={canvasRef} className="block rounded-full" />
        {/* Center spin button */}
        <button
          onClick={spin}
          disabled={spinning || items.length < 2}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-16 h-16 rounded-full bg-orange-accent text-orange-accent-foreground font-bold text-sm shadow-lg hover:opacity-90 transition-opacity duration-100 disabled:opacity-50 disabled:cursor-not-allowed border-4 border-background"
        >
          {spinning ? "…" : "SPIN"}
        </button>
      </div>
    </div>
  );
};

export default SpinWheel;
