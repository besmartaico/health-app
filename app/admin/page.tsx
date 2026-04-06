export default function AdminDashboard() {
  const cards = [['CRM','/admin/crm','Manage customers'],['Inventory','/admin/inventory','Track stock'],['Calculator','/admin/calculator','Dose calculator'],['Instructions','/admin/instructions','Reconstitution guide'],['Peptide AI','/admin/peptide-ai','AI assistant'],['COAs','/admin/coa','Lab documents']];
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Dashboard</h1>
      <p className="text-slate-500 mb-8">Welcome to BeSmart Health Admin</p>
      <div className="grid grid-cols-3 gap-4">
        {cards.map(([title,href,desc])=>(
          <a key={href} href={href} className="bg-white rounded-xl border border-slate-200 p-6 hover:border-green-500 hover:shadow-md transition-all">
            <div className="font-semibold text-slate-900 mb-1">{title}</div>
            <div className="text-sm text-slate-500">{desc}</div>
          </a>
        ))}
      </div>
    </div>
  );
}