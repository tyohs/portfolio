import Image from "next/image";
import ProjectCard from "@/components/ProjectCard";
import { projects } from "@/lib/projects";
import AskMe from "@/components/AskMe";

export default function Page() {
  return (
<main className="mx-auto max-w-5xl px-6 py-16 sm:py-24">
      {/* Hero */}
      <section className="flex flex-col sm:flex-row items-start gap-6 sm:gap-8 mb-12">
        <Image
          src="https://placehold.co/200x200/a7f3d0/333?text=YH" // or /profile.png
          alt="Yoh Kaminaga"
          width={96}
          height={96}
          className="rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800"
          unoptimized // remove this if you use a local image
        />
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold">
            <a href="https://github.com/tyohs" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline underline-offset-4 decoration-blue-600/30 dark:decoration-blue-400/30 hover:decoration-blue-600 dark:hover:decoration-blue-400 transition-all">神永 陽/Yoh Kaminaga</a> 
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 max-w-prose">
            東洋大学 INIAD(情報連携学部) 1年 / iniad.ts 所属。TypeScript / React を中心に学習中。ハッカソンや個人開発で実装力を強化しています。
          </p>
        </div>
      </section>

      {/* Projects */}
      <section className="space-y-6">
        <h2 className="text-2xl font-bold">Projects</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => (
            <ProjectCard key={p.title} p={p} />
          ))}
        </div>
      </section>

      <AskMe />

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 pt-8 text-sm text-zinc-500 dark:text-zinc-400">
        <p>
          © {new Date().getFullYear()} Yoh Kaminaga. Built with Next.js + Tailwind.{" "}
          <span className="opacity-50">/</span>{" "}
          <a href="https://github.com/YOUR_GH/portfolio" target="_blank" rel="noreferrer" className="underline-offset-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}

