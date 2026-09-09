export function TacticalGrid() {
  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Precision Grid Matrix */}
      <div 
        className="absolute inset-0 opacity-[0.14]" 
        style={{
          backgroundImage: `linear-gradient(to right, #00ffcc 1px, transparent 1px), linear-gradient(to bottom, #00ffcc 1px, transparent 1px)`,
          backgroundSize: "42px 42px"
        }}
      />
      {/* Radial vignette mask */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06090d]/60 via-[#06090d]/90 to-[#040608]" />
      
      {/* Center atmospheric glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[320px] bg-cyan-500/10 blur-[130px] rounded-full pointer-events-none" />
    </div>
  );
}
