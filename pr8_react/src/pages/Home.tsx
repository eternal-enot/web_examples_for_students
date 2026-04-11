import React, { useState, useMemo, useEffect } from 'react';
import { useSiteState } from '../context/SiteContext';
import { ProjectCard } from '../components/ProjectCard';
import { ProjectModal } from '../components/ProjectModal';
import type { Project } from '../data/translations';

export const Home: React.FC = () => {
  const { texts, pageTitle } = useSiteState();
  const projects: Project[] = texts.projects;
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [modalProject, setModalProject] = useState<Project | null>(null);

  useEffect(() => {
    document.title = pageTitle('index');
  }, [texts, pageTitle]);

  const tags = useMemo(() => {
    const allTags = new Set<string>();
    projects.forEach(p => p.tags.forEach(t => allTags.add(t)));
    return ['all', ...Array.from(allTags)];
  }, [projects]);

  const filteredProjects = selectedTag === 'all' 
    ? projects 
    : projects.filter(p => p.tags.includes(selectedTag));

  return (
    <main>
      <header className="hero">
        <div className="container">
          <p className="hero__label">ПРАКТИЧНА РОБОТА №3</p>
          <h1>{texts.heroTitle}</h1>
          <p>{texts.heroText}</p>
          <div className="hero__actions">
            <a className="btn-link" href="#projects">{texts.projectsLink}</a>
          </div>
        </div>
      </header>

      <section className="section">
        <div className="container">
          <h2>{texts.aboutTitle}</h2>
          <p>{texts.aboutText}</p>
        </div>
      </section>

      <section className="section section--alt" id="projects">
        <div className="container">
          <h2>{texts.projectsTitle}</h2>
          <div className="controls">
            <p><span>{texts.shownLabel}</span> <span>{filteredProjects.length} / {projects.length}</span></p>
            <div className="tag-list">
              {tags.map(tag => (
                <button 
                  key={tag}
                  type="button" 
                  className={`tag-button ${selectedTag === tag ? 'active' : ''}`}
                  onClick={() => setSelectedTag(tag)}
                >
                  {tag === 'all' ? texts.allTag : tag}
                </button>
              ))}
            </div>
          </div>

          <div className="project-grid">
            {filteredProjects.map(project => (
              <ProjectCard 
                key={project.id} 
                project={project} 
                onOpenDetails={(id) => setModalProject(projects.find(p => p.id === id) || null)} 
              />
            ))}
          </div>
        </div>
      </section>
      
      <ProjectModal project={modalProject} onClose={() => setModalProject(null)} />
    </main>
  );
};
