import MinerView from "@/components/miner-view";

export default function MinerPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">WhatsApp Angle Miner</h1>
        </div>
        <MinerView />
      </div>
    </div>
  );
}
