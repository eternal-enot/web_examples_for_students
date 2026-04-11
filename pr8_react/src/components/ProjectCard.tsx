import React from 'react';
import { useSiteState } from '../context/SiteContext';
import type { Project } from '../data/translations';

interface ProjectCardProps {
  project: Project;
  onOpenDetails: (id: number) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenDetails }) => {
  const { texts } = useSiteState();

  return (
    <article className="project-card">
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="project-tags">
        {project.tags.map(tag => (
          <span key={tag} className="project-tag">{tag}</span>
        ))}
      </div>
      <div className="project-actions">
        <button type="button" onClick={() => onOpenDetails(project.id)}>
          {texts.detailsButton}
        </button>
      </div>
    </article>
  );
};
