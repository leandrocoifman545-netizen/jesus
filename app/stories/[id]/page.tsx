import { notFound } from "next/navigation";
import Link from "next/link";
import { getStory } from "@/lib/storage/local";
import StoryEditor from "./story-editor";

export default async function StoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const story = await getStory(id);

  if (!story) {
    notFound();
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <nav className="flex items-center gap-2 text-xs">
          <Link
            href="/stories"
            className="text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5" />
            </svg>
            Stories
          </Link>
          <svg className="w-3 h-3 text-zinc-700" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
          </svg>
          <span className="text-zinc-400 font-medium">{story.title}</span>
        </nav>
        <p className="text-zinc-600 text-[11px] mt-3 flex items-center gap-1.5">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
          {new Date(story.createdAt).toLocaleString("es-AR")}
        </p>
      </div>

      <StoryEditor story={story} />
    </div>
  );
}
