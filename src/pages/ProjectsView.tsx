import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ProjectInput } from '../schemas/project';
import { projectSchema } from '../schemas/project';
import {  Plus, X, Calendar, User, Users, CheckSquare, Loader2, Tag, Search, Pencil, Trash } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from '../components/Modal';

interface Project {
  _id: string;
  name: string;
  category: string;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  totalMembers: number;
  totalTasks: number;
  members: {
    _id: string;
    name: string;
    email: string;
  }[];
}

interface SystemUser {
  _id: string;
  name: string;
  email: string;
}

export const ProjectsView: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userSearch, setUserSearch] = useState('');

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);
  const [deletingSubmitting, setDeletingSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      category: '',
      members: [],
    },
  });

  // Fetch projects and system users
  const fetchData = async () => {
    try {
      setLoading(true);
      const [projectsResponse, usersResponse] = await Promise.all([
        api.get('/projects'),
        api.get('/users'),
      ]);
      setProjects(projectsResponse.data.projects);
      setSystemUsers(usersResponse.data.users);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load projects or users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);

  const handleEditClick = (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingProject(project);
    reset({
      name: project.name,
      category: project.category,
      members: project.members?.map((m) => m._id) || [],
    });
    setUserSearch('');
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDeletingProjectId(projectId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProjectId) return;
    try {
      setDeletingSubmitting(true);
      await api.delete(`/projects/${deletingProjectId}`);
      toast.success('Project deleted successfully!');
      setDeletingProjectId(null);
      fetchData();
    } catch (error: any) {
      console.error(error);
      const message = error.response?.data?.message || 'Failed to delete project';
      toast.error(message);
    } finally {
      setDeletingSubmitting(false);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    reset({
      name: '',
      category: '',
      members: [],
    });
  };

  const onSubmit = async (data: ProjectInput) => {
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, data);
        toast.success('Project updated successfully!');
      } else {
        await api.post('/projects', data);
        toast.success('Project created successfully!');
      }
      handleCloseModal();
      fetchData(); // reload projects list
    } catch (error: any) {
      console.error(error);
      const action = editingProject ? 'update' : 'create';
      const message = error.response?.data?.message || `Failed to ${action} project`;
      toast.error(message);
    }
  };

  const filteredUsers = systemUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (loading && projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-slate-400">Loading Projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Projects</h1>
          <p className="text-slate-500 mt-1">Manage and assign tasks inside project boards</p>
        </div>
        <button
          onClick={() => {
            setIsModalOpen(true);
            reset();
            setUserSearch('');
          }}
          className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-550/10"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 border border-zinc-200 rounded-2xl bg-white">
          
          <h3 className="text-lg font-semibold text-slate-700">No projects found</h3>
          <p className="text-slate-500 mt-1 max-w-sm mx-auto text-sm">
            Get started by creating your first project.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {projects.map((project) => (
            <Link
              key={project._id}
              to={`/dashboard/projects/${project._id}`}
              className="block group bg-white hover:border-zinc-400 border border-zinc-200 rounded-2xl p-6  transition-all duration-200"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
                      {project.category}
                    </span>
                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-150 truncate">
                    {project.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Created by: <span className="font-semibold text-slate-700">{project.createdBy?.name || 'Unknown'}</span></span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-6 text-xs text-slate-650 md:border-l md:border-slate-100 md:pl-6">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-slate-800">{project.totalMembers}</span> Members
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-slate-400" />
                    <span className="font-semibold text-slate-800">{project.totalTasks}</span> Tasks
                  </div>
                </div>

                {currentUser && project.createdBy?._id === currentUser.id && (
                  <div className="flex items-center gap-1 shrink-0 relative z-10 md:border-l md:border-slate-100 md:pl-4">
                    <button
                      onClick={(e) => handleEditClick(e, project)}
                      className="p-2 text-slate-400 hover:text-indigo-650 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Edit Project"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, project._id)}
                      className="p-2 text-slate-400 hover:text-red-650 hover:bg-red-55 rounded-lg transition-colors cursor-pointer"
                      title="Delete Project"
                    >
                      <Trash className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingProject ? 'Edit Project' : 'Create New Project'}
      >
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="p-6 space-y-6 bg-white">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Project Name
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Website Redesign"
              className={`w-full bg-white border text-slate-900 placeholder-slate-400 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-600 mt-1 pl-1 font-medium">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Category
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Tag className="h-4 w-4" />
              </div>
              <input
                type="text"
                {...register('category')}
                placeholder="e.g. Marketing, Development"
                className={`w-full bg-white border text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.category
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
                }`}
              />
            </div>
            {errors.category && (
              <p className="text-xs text-red-650 mt-1 pl-1 font-medium text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Add Members (Registered Users)
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full bg-white border border-slate-200 text-xs text-slate-900 placeholder-slate-400 pl-9 pr-4 py-2 rounded-md focus:outline-none focus:border-indigo-600"
              />
            </div>

            <Controller
              control={control}
              name="members"
              render={({ field }) => {
                const selectedIds = field.value || [];
                const handleCheckboxChange = (userId: string) => {
                  const updated = selectedIds.includes(userId)
                    ? selectedIds.filter((id) => id !== userId)
                    : [...selectedIds, userId];
                  field.onChange(updated);
                };

                return (
                  <div className="border border-slate-200 bg-white rounded-lg p-3 max-h-40 overflow-y-auto space-y-2.5">
                    {filteredUsers.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-4">No other users found.</p>
                    ) : (
                      filteredUsers.map((user) => (
                        <label
                          key={user._id}
                          className="flex items-center gap-3 cursor-pointer select-none group text-xs py-1"
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(user._id)}
                            onChange={() => handleCheckboxChange(user._id)}
                            className="h-4 w-4 rounded border-slate-200 text-indigo-600 focus:ring-indigo-500 bg-white cursor-pointer"
                          />
                          <div className="overflow-hidden">
                            <span className="font-semibold text-slate-800 group-hover:text-slate-950 transition-colors duration-150 block truncate">
                              {user.name}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">{user.email}</span>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                );
              }}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCloseModal}
              className="cursor-pointer px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {editingProject ? 'Saving...' : 'Creating...'}
                </>
              ) : (
                editingProject ? 'Save Changes' : 'Create Project'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={deletingProjectId !== null}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will permanently delete the project and all its associated tasks. This action cannot be undone."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeletingProjectId(null)}
        isSubmitting={deletingSubmitting}
      />
    </div>
  );
};

export default ProjectsView;
