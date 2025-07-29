export default function LoadingOverlay() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="w-64 h-2 bg-gray-300 rounded overflow-hidden">
        <div className="h-full bg-sky-900 animate-loading"></div>
      </div>
    </div>
  );
}
