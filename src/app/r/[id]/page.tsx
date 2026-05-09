export default function SharedAuditPage({ params }: { params: { id: string } }) {
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-6">Shared Audit Report</h1>
      <p>Viewing report ID: {params.id}</p>
    </div>
  );
}
