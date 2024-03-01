import React, { createContext, useState, useContext, ReactNode } from 'react';

import { Project, Scene } from '@/lib/types';

// Define the shape of the context
interface ProjectsContextType {
  project: Project;
  setProject: (project: Project) => void;
  scenes: Scene[];
  setScenes: (scenes: Scene[]) => void;
  projects: Project[];
  setProjects: (projects: Project[]) => void;
  isGeneratingScenes: boolean;
  setIsGeneratingScenes: (isGenerating: boolean) => void;
  resetState: () => void;
}

// Create the context
const ProjectsContext = createContext<ProjectsContextType | undefined>(undefined);

// Create a custom hook to use the context
export const useProjects = () => {
  const context = useContext(ProjectsContext);
  if (!context) {
    throw new Error('useProjects must be used within a ProjectsProvider');
  }
  return context;
};

// Create the provider component
interface ProjectsProviderProps {
  children: ReactNode;
}

export const ProjectsProvider: React.FC<ProjectsProviderProps> = ({ children }) => {
  const [project, setProject] = useState<Project>({
    aspect_ratio: '16:9',
    concept: '',
    created_at: '',
    id: 0,
    owner_id: null,
    style: 'cinematic',
    title: ''
  });
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isGeneratingScenes, setIsGeneratingScenes] = useState<boolean>(false);

  const resetState = () => {
    setProject({
      aspect_ratio: '16:9',
      concept: '',
      created_at: '',
      id: 0,
      owner_id: null,
      style: 'cinematic',
      title: ''
    });
    setScenes([]);
  }

  return (
    <ProjectsContext.Provider
      value={
        { project, setProject, scenes, setScenes, projects, setProjects, isGeneratingScenes, setIsGeneratingScenes, resetState }
      }
    >
      {children}
    </ProjectsContext.Provider>
  );
};
