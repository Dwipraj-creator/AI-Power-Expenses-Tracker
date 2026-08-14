const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

const VoiceOrb = ({ status = 'idle', onClick }) => {
  const isActive = status !== 'idle';
  const isCapturing = status === 'capturing';
  const isWaitingForWake = status === 'waiting-for-wake';

  return (
    <button
      type="button"
      onClick={onClick}
      className="relative w-48 h-48 flex items-center justify-center focus:outline-none group"
      aria-label={isActive ? 'Stop voice assistant' : 'Start voice assistant'}
    >
      {/* Rays — only during waiting-for-wake */}
      {isWaitingForWake &&
        RAY_ANGLES.map((angle, i) => (
          <div
            key={angle}
            className="ray"
            style={{
              transform: `translate(-50%, -100%) rotate(${angle}deg)`,
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}

      {/* Outer glow layer */}
      <div
        className={`absolute inset-0 rounded-full bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-600 blur-3xl transition-opacity duration-500 ${
          isCapturing ? 'opacity-50' : isActive ? 'opacity-30' : 'opacity-10 group-hover:opacity-20'
        } animate-glow`}
        style={{ animationDuration: isCapturing ? '1.2s' : '3s' }}
      />

      {/* Pulsing ring 1 */}
      <div
        className={`absolute inset-0 rounded-full border-2 transition-colors duration-500 ${
          isActive ? 'border-indigo-500/20 animate-pulse' : 'border-white/5'
        }`}
        style={{ animationDuration: isCapturing ? '1s' : '2s' }}
      />

      {/* Pulsing ring 2 */}
      <div
        className={`absolute inset-8 rounded-full border transition-colors duration-500 ${
          isActive ? 'border-purple-500/30 animate-pulse' : 'border-white/5'
        }`}
        style={{ animationDuration: isCapturing ? '1.5s' : '3s' }}
      />

      {/* Middle layer */}
      <div
        className={`absolute inset-12 rounded-full backdrop-blur-sm shadow-inner border transition-all duration-500 ${
          isActive
            ? 'bg-gradient-to-br from-indigo-500/40 to-purple-600/40 border-indigo-400/30'
            : 'bg-gradient-to-br from-white/5 to-white/5 border-white/10 group-hover:border-white/20'
        }`}
      />

      {/* Core orb */}
      <div
        className={`relative rounded-full shadow-2xl flex items-center justify-center animate-float transition-all duration-500 ${
          isCapturing
            ? 'w-24 h-24 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 shadow-indigo-500/60'
            : isActive
            ? 'w-20 h-20 bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 shadow-indigo-500/60'
            : 'w-20 h-20 bg-gradient-to-br from-gray-600 to-gray-700 shadow-none group-hover:from-gray-500 group-hover:to-gray-600'
        }`}
        style={{ animationDuration: isCapturing ? '2s' : '4s' }}
      >
        {/* Inner light */}
        <div
          className={`absolute inset-2 rounded-full blur-xl transition-opacity duration-500 ${
            isActive ? 'bg-white/40' : 'bg-white/10'
          }`}
        />

        {/* Center dot */}
        <div className="relative w-4 h-4 rounded-full bg-white shadow-lg shadow-white/50" />
      </div>
    </button>
  );
};

export default VoiceOrb;