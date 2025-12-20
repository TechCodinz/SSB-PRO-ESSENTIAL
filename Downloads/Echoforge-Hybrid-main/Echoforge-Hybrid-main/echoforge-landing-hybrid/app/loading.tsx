// Global loading state for the app
export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1020]">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        </div>
        <p className="text-white/70 text-lg">Loading EchoForge...</p>
        <div className="flex gap-2 justify-center">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
}
