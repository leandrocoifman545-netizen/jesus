import MatrixView from "@/components/matrix-view";

export default function MatrixPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Matriz 3D de Ángulos</h1>
          <p className="text-sm text-zinc-500 mt-1">Perspectiva × Emoción × Segmento — encontrá los huecos</p>
        </div>
        <MatrixView />
      </div>
    </div>
  );
}
