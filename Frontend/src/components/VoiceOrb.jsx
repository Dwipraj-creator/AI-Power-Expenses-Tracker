const VoiceOrb = () => {
  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 blur-2xl opacity-40 animate-pulse" />
      <div className="absolute inset-4 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-600/30 border border-white/10 backdrop-blur-sm" />
      <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg shadow-indigo-500/50 flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-white/90" />
      </div>
    </div>
  );
};

export default VoiceOrb;