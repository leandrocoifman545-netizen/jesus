import { notFound } from "next/navigation";
import { getGeneration } from "@/lib/storage/local";
import YouTubeViewer from "@/components/youtube-viewer";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function YouTubeVideoPage({ params }: Props) {
  const { id } = await params;
  const generation = await getGeneration(id);

  if (!generation || generation.contentType !== "longform") {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      <YouTubeViewer generation={generation} />
    </div>
  );
}
