export default function COAPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Certificates of Analysis</h1>
      <p className="text-slate-500 mb-8">COA documents stored in Google Drive</p>
      <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
        <div className="text-5xl mb-4">📄</div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">COA Document Library</h2>
        <p className="text-slate-500 mb-6 max-w-md mx-auto">All Certificates of Analysis are stored in your Google Drive folder.</p>
        <a href={`https://drive.google.com/drive/folders/${process.env.NEXT_PUBLIC_DRIVE_FOLDER_ID||'1MCNvupIgjY7h3aYBkT_Eq89AZL54TX4B'}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium">Open Google Drive COA Folder</a>
      </div>
    </div>
  );
}