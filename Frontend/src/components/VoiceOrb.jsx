const VoiceOrb = () => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      {/* Outer glow layer */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-600 blur-3xl opacity-30 animate-glow" />

      {/* Pulsing ring 1 */}
      <div
        className="absolute inset-0 rounded-full border-2 border-indigo-500/20 animate-pulse"
        style={{ animationDuration: "2s" }}
      />

      {/* Pulsing ring 2 */}
      <div
        className="absolute inset-8 rounded-full border border-purple-500/30 animate-pulse"
        style={{ animationDuration: "3s" }}
      />

      {/* Middle layer */}
      <div className="absolute inset-12 rounded-full bg-gradient-to-br from-indigo-500/40 to-purple-600/40 border border-indigo-400/30 backdrop-blur-sm shadow-inner" />

      {/* Core orb */}
      <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 shadow-2xl shadow-indigo-500/60 flex items-center justify-center animate-float">
        {/* Inner light */}
        <div className="absolute inset-2 rounded-full bg-white/40 blur-xl" />

        {/* Center dot */}
        <div className="relative w-4 h-4 rounded-full bg-white shadow-lg shadow-white/50" />
      </div>
    </div>
  );
};

export default VoiceOrb;
