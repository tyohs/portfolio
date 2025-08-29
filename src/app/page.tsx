import ProjectCard from '../components/ProjectCard';

const projects = [
  {
    title: "Othello",
    summary: "A classic Othello game built with Next.js and TypeScript, featuring a clean UI and game logic.",
    tags: ["Next.js", "TypeScript", "TailwindCSS"],
    demo: "#",
    code: "https://github.com/tyohs/othello",
  },
  {
    title: "Minesweeper",
    summary: "The timeless puzzle game Minesweeper, recreated with modern web technologies.",
    tags: ["Next.js", "TypeScript", "React"],
    demo: "#",
    code: "https://github.com/tyohs/minesweeper",
  },
  {
    title: "Maze Generator & Solver",
    summary: "A fascinating tool that generates complex mazes and visualizes solving algorithms.",
    tags: ["Next.js", "TypeScript", "Algorithm"],
    demo: "#",
    code: "https://github.com/tyohs/maze",
  },
  {
    title: "self-dialog-bot",
    summary: "A Streamlit-based chatbot designed for self-dialogue and reflection, powered by Python.",
    tags: ["Python", "Streamlit", "AI", "Chatbot"],
    demo: "#",
    code: "https://github.com/tyohs/self-dialog-bot",
  },
];

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-12">
      <header className="text-center mb-16">
        <h1 className="text-5xl font-extrabold mb-2">Taro Yamada</h1>
        <p className="text-lg text-gray-400">
          <a href="mailto:example@example.com" className="hover:text-teal-400">example@example.com</a> | INIAD.ts
        </p>
      </header>

      <section id="projects" className="mb-16">
        <h2 className="text-4xl font-bold mb-8 text-center border-b-2 border-teal-500 pb-2">
          Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((project) => (
            <ProjectCard key={project.title} {...project} />
          ))}
        </div>
      </section>

      <section id="about">
        <h2 className="text-4xl font-bold mb-8 text-center border-b-2 border-teal-500 pb-2">
          About Me
        </h2>
        <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg border border-gray-700">
          <p className="text-lg text-gray-300">
            I am a student at INIAD (Information Networking for Innovation and Design) with a passion for building innovative web applications and exploring new technologies. My interests lie in front-end development, algorithms, and creating intuitive user experiences. This portfolio showcases some of the projects I've worked on.
          </p>
        </div>
      </section>
    </main>
  );
}