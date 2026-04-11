import React, { useEffect } from 'react';
import { useSiteState } from '../context/SiteContext';
import type { Project } from '../data/translations';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const { texts } = useSiteState();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!project) return null;

  return (
    <div className="modal open">
      <div className="modal__overlay" onClick={onClose}></div>
      <div className="modal__content">
        <button className="modal__close" type="button" onClick={onClose}>×</button>
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <p>{project.details}</p>
        <p>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer">
            {texts.repoLink}
          </a>
        </p>
      </div>
    </div>
  );
};
