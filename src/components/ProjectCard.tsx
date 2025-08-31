import Image from "next/image";
import Link from "next/link";

type Project = {
  title: string;
  summary: string;
  tech: string[];
  role?: string;
  cover?: string | null;
  demoUrl?: string | null;
  codeUrl?: string | null;
  tags?: string[];
};

export default function ProjectCard({ p }: { p: Project }) {
  return (
<div className="group flex flex-col rounded-2xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900/50 shadow-sm hover:shadow-lg dark:hover:border-zinc-700 transition-all overflow-hidden">
      {p.cover && (
        <div className="relative aspect-[16/9] w-full overflow-hidden">
          <Image src={p.cover} alt={p.title} fill className="object-cover group-hover:scale-[1.02] transition-transform" unoptimized />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col space-y-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold">{p.title}</h3>
          <div className="flex gap-3 shrink-0">
            {p.demoUrl && (
              <Link href={p.demoUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 underline-offset-2 hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Demo
                <span aria-hidden className="ml-1">↗</span>
              </Link>
            )}
            {p.codeUrl && (
              <Link href={p.codeUrl} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-zinc-600 dark:text-zinc-400 underline-offset-2 hover:underline hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Code
                <span aria-hidden className="ml-1">↗</span>
              </Link>
            )}
          </div>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 flex-1">{p.summary}</p>
        {p.role && <p className="text-xs text-zinc-500">Role: {p.role}</p>}
        <div className="flex flex-wrap gap-2">
          {p.tech.map((t) => (
            <span key={t} className="rounded-full border border-zinc-200 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-800/50 px-2.5 py-1 text-xs text-zinc-700 dark:text-zinc-300">
              {t}
            </span>
          ))}
        </div>
        {!!p.tags?.length && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {p.tags!.map((tag) => (
              <span key={tag} className="text-[11px] text-zinc-500 dark:text-zinc-500">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
