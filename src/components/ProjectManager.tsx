import React, { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Copy, 
  Download,
  Calendar,
  User,
  Building
} from 'lucide-react';
import { Project } from '../types/electrical';

interface SavedProject {
  id: string;
  name: string;
  data: Project;
  folder: string;
  createdAt: string;
  modifiedAt: string;
  client?: string;
  site?: string;
}

interface ProjectManagerProps {
  onLoadProject: (project: Project) => void;
  onClose: () => void;
  currentProject?: Project;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({
  onLoadProject,
  onClose,
  currentProject
}) => {
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [folders, setFolders] = useState<string[]>(['Général']);
  const [selectedFolder, setSelectedFolder] = useState('Général');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [editingProject, setEditingProject] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedProjects = JSON.parse(localStorage.getItem('savedProjects') || '[]');
    const savedFolders = JSON.parse(localStorage.getItem('projectFolders') || '["Général"]');
    setProjects(savedProjects);
    setFolders(savedFolders);
  };

  const saveProject = (project: Project, folder: string = 'Général', client?: string, site?: string) => {
    const savedProject: SavedProject = {
      id: project.id,
      name: project.name,
      data: project,
      folder,
      client,
      site,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };

    const existingIndex = projects.findIndex(p => p.id === project.id);
    let updatedProjects;
    
    if (existingIndex >= 0) {
      updatedProjects = [...projects];
      updatedProjects[existingIndex] = { ...savedProject, createdAt: projects[existingIndex].createdAt };
    } else {
      updatedProjects = [...projects, savedProject];
    }

    setProjects(updatedProjects);
    localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
  };

  const deleteProject = (projectId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
    }
  };

  const duplicateProject = (project: SavedProject) => {
    const newProject: Project = {
      ...project.data,
      id: `${project.data.id}-copy-${Date.now()}`,
      name: `${project.data.name} - Copie`
    };

    saveProject(newProject, project.folder, project.client, project.site);
    loadProjects();
  };

  const createFolder = () => {
    if (newFolderName.trim() && !folders.includes(newFolderName.trim())) {
      const updatedFolders = [...folders, newFolderName.trim()];
      setFolders(updatedFolders);
      localStorage.setItem('projectFolders', JSON.stringify(updatedFolders));
      setNewFolderName('');
      setShowNewFolder(false);
    }
  };

  const moveProjectToFolder = (projectId: string, newFolder: string) => {
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, folder: newFolder } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
  };

  const updateProjectInfo = (projectId: string, updates: Partial<SavedProject>) => {
    const updatedProjects = projects.map(p => 
      p.id === projectId ? { ...p, ...updates, modifiedAt: new Date().toISOString() } : p
    );
    setProjects(updatedProjects);
    localStorage.setItem('savedProjects', JSON.stringify(updatedProjects));
    setEditingProject(null);
  };

  const filteredProjects = projects.filter(project => {
    const matchesFolder = selectedFolder === 'Tous' || project.folder === selectedFolder;
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.client && project.client.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (project.site && project.site.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFolder && matchesSearch;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <FolderOpen className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">Gestionnaire de Projets</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex h-[calc(90vh-80px)]">
          {/* Sidebar - Folders */}
          <div className="w-64 bg-gray-700 border-r border-gray-600 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-300">Dossiers</h3>
              <button
                onClick={() => setShowNewFolder(true)}
                className="p-1 hover:bg-gray-600 rounded"
              >
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            {showNewFolder && (
              <div className="mb-4 space-y-2">
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Nom du dossier"
                  className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                  onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={createFolder}
                    className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                  >
                    Créer
                  </button>
                  <button
                    onClick={() => setShowNewFolder(false)}
                    className="px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded text-xs"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <button
                onClick={() => setSelectedFolder('Tous')}
                className={`w-full text-left px-2 py-1 rounded text-sm ${
                  selectedFolder === 'Tous' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
                }`}
              >
                Tous les projets ({projects.length})
              </button>
              
              {folders.map(folder => {
                const count = projects.filter(p => p.folder === folder).length;
                return (
                  <button
                    key={folder}
                    onClick={() => setSelectedFolder(folder)}
                    className={`w-full text-left px-2 py-1 rounded text-sm ${
                      selectedFolder === folder ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {folder} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 p-4">
            {/* Search bar */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un projet, client ou chantier..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                />
              </div>
            </div>

            {/* Save current project button */}
            {currentProject && (
              <div className="mb-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-blue-300">Projet actuel</h4>
                    <p className="text-xs text-gray-400">{currentProject.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      saveProject(currentProject, selectedFolder);
                      loadProjects();
                    }}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>
            )}

            {/* Projects grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto max-h-[calc(100%-120px)]">
              {filteredProjects.map(project => (
                <div key={project.id} className="bg-gray-700 rounded-lg p-4 hover:bg-gray-600 transition-colors">
                  {editingProject === project.id ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        defaultValue={project.name}
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                        onBlur={(e) => updateProjectInfo(project.id, { name: e.target.value })}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            updateProjectInfo(project.id, { name: (e.target as HTMLInputElement).value });
                          }
                        }}
                        autoFocus
                      />
                      <input
                        type="text"
                        defaultValue={project.client || ''}
                        placeholder="Client"
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                        onBlur={(e) => updateProjectInfo(project.id, { client: e.target.value })}
                      />
                      <input
                        type="text"
                        defaultValue={project.site || ''}
                        placeholder="Chantier"
                        className="w-full px-2 py-1 bg-gray-600 border border-gray-500 rounded text-sm"
                        onBlur={(e) => updateProjectInfo(project.id, { site: e.target.value })}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-sm font-medium text-white truncate">{project.name}</h3>
                        <div className="flex space-x-1 ml-2">
                          <button
                            onClick={() => setEditingProject(project.id)}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            <Edit className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            onClick={() => duplicateProject(project)}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            <Copy className="w-3 h-3 text-gray-400" />
                          </button>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="p-1 hover:bg-gray-500 rounded"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        </div>
                      </div>

                      {project.client && (
                        <div className="flex items-center space-x-1 mb-1">
                          <User className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{project.client}</span>
                        </div>
                      )}

                      {project.site && (
                        <div className="flex items-center space-x-1 mb-1">
                          <Building className="w-3 h-3 text-gray-400" />
                          <span className="text-xs text-gray-400">{project.site}</span>
                        </div>
                      )}

                      <div className="flex items-center space-x-1 mb-2">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {new Date(project.modifiedAt).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs text-gray-500 mb-3">
                        {project.data.elements.length} éléments • {project.data.circuits.length} circuits
                      </div>

                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            onLoadProject(project.data);
                            onClose();
                          }}
                          className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs"
                        >
                          Ouvrir
                        </button>
                        
                        <select
                          value={project.folder}
                          onChange={(e) => moveProjectToFolder(project.id, e.target.value)}
                          className="px-2 py-1 bg-gray-600 border border-gray-500 rounded text-xs"
                        >
                          {folders.map(folder => (
                            <option key={folder} value={folder}>{folder}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <div className="text-center text-gray-400 py-8">
                <FolderOpen className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Aucun projet trouvé</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectManager;