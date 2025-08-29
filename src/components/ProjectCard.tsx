import React from 'react';

type ProjectCardProps = {
  title: string;
  summary: string;
  tags: string[];
  demo?: string;
  code: string;
};

const ProjectCard: React.FC<ProjectCardProps> = ({ title, summary, tags, demo, code }) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700 flex flex-col h-full">
      <h3 className="text-2xl font-bold mb-2 text-teal-400">{title}</h3>
      <p className="text-gray-300 mb-4 flex-grow">{summary}</p>
      <div className="mb-4">
        {tags.map((tag) => (
          <span key={tag} className="inline-block bg-gray-700 rounded-full px-3 py-1 text-sm font-semibold text-gray-300 mr-2 mb-2">
            #{tag}
          </span>
        ))}
      </div>
      <div className="mt-auto flex justify-end space-x-4">
        {demo && (
          <a
            href={demo}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
          >
            Demo
          </a>
        )}
        <a
          href={code}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded transition-colors duration-300"
        >
          Code
        </a>
      </div>
    </div>
  );
};

export default ProjectCard;
