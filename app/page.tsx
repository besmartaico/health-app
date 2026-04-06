export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">BeSmart Health</h1>
        <p className="text-slate-400 mb-8">Premium peptide therapy</p>
        <a href="/consult" className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-medium mr-4">Get Guidance</a>
        <a href="/admin" className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium">Admin</a>
      </div>
    </div>
  );
}