import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { TaskInput, ProjectInput } from '../schemas/project';
import { taskSchema, projectSchema } from '../schemas/project';
import { ArrowLeft, Plus, Users, Calendar, CheckSquare, X, Loader2, User, HelpCircle, ShieldCheck, Pencil, Trash, Search, Tag } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from '../components/Modal';

interface UserDetail {
  _id: string;
  name: string;
  email: string;
}

interface Project {
  _id: string;
  name: string;
  category: string;
  createdBy: UserDetail;
  createdAt: string;
  members: UserDetail[];
}

interface Task {
  _id: string;
  name: string;
  status: 'pending' | 'in progress' | 'completed';
  deadline: string;
  assignedTo: UserDetail;
  createdAt: string;
  createdBy?: UserDetail;
}

export const ProjectDetailsView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState<{ id: string; name: string } | null>(null);

  // Task edit and delete states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);
  const [deletingTaskSubmitting, setDeletingTaskSubmitting] = useState(false);

  // Project edit and delete states
  const [isProjectEditOpen, setIsProjectEditOpen] = useState(false);
  const [isProjectDeleteOpen, setIsProjectDeleteOpen] = useState(false);
  const [projectDeleteSubmitting, setProjectDeleteSubmitting] = useState(false);
  const [systemUsers, setSystemUsers] = useState<UserDetail[]>([]);
  const [userSearch, setUserSearch] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      deadline: '',
      assignedTo: '',
    },
  });

  const {
    register: registerProject,
    handleSubmit: handleSubmitProject,
    reset: resetProject,
    control: controlProject,
    formState: { errors: errorsProject, isSubmitting: isSubmittingProject },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: '',
      category: '',
      members: [],
    },
  });

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectResponse, usersResponse] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get('/users'),
      ]);
      setProject(projectResponse.data.project);
      setTasks(projectResponse.data.tasks);
      setSystemUsers(usersResponse.data.users);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, [id]);

  const handleEditTaskClick = (task: Task) => {
    setEditingTask(task);
    reset({
      name: task.name,
      deadline: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '',
      assignedTo: task.assignedTo?._id || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteTaskClick = (taskId: string) => {
    setDeletingTaskId(taskId);
  };

  const handleTaskDeleteConfirm = async () => {
    if (!deletingTaskId) return;
    try {
      setDeletingTaskSubmitting(true);
      await api.delete(`/tasks/${deletingTaskId}`);
      toast.success('Task deleted successfully!');
      setDeletingTaskId(null);
      fetchProjectDetails();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setDeletingTaskSubmitting(false);
    }
  };

  const handleCloseTaskModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
    reset({
      name: '',
      deadline: '',
      assignedTo: '',
    });
  };

  const onSubmit = async (data: TaskInput) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, data);
        toast.success('Task updated successfully!');
      } else {
        await api.post(`/projects/${id}/tasks`, data);
        toast.success('Task added successfully!');
      }
      handleCloseTaskModal();
      fetchProjectDetails(); // refresh details
    } catch (error: any) {
      console.error(error);
      const action = editingTask ? 'edit' : 'add';
      toast.error(error.response?.data?.message || `Failed to ${action} task`);
    }
  };

  const handleEditProjectClick = () => {
    if (!project) return;
    resetProject({
      name: project.name,
      category: project.category,
      members: project.members?.map((m) => m._id) || [],
    });
    setUserSearch('');
    setIsProjectEditOpen(true);
  };

  const handleCloseProjectModal = () => {
    setIsProjectEditOpen(false);
    resetProject({
      name: '',
      category: '',
      members: [],
    });
  };

  const onProjectSubmit = async (data: ProjectInput) => {
    try {
      await api.put(`/projects/${id}`, data);
      toast.success('Project details updated successfully!');
      handleCloseProjectModal();
      fetchProjectDetails();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update project');
    }
  };

  const handleProjectDeleteConfirm = async () => {
    try {
      setProjectDeleteSubmitting(true);
      await api.delete(`/projects/${id}`);
      toast.success('Project and associated tasks deleted successfully!');
      setIsProjectDeleteOpen(false);
      navigate('/dashboard/projects');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to delete project');
    } finally {
      setProjectDeleteSubmitting(false);
    }
  };

  // Compile candidate list for assignees (creator + project members)
  const getCandidateAssignees = (): UserDetail[] => {
    if (!project) return [];
    const candidates: UserDetail[] = [];
    if (project.createdBy) {
      candidates.push(project.createdBy);
    }
    project.members.forEach((member) => {
      if (!candidates.some((c) => c._id === member._id)) {
        candidates.push(member);
      }
    });
    return candidates;
  };

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500 mx-auto" />
          <p className="text-slate-400">Loading Project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-16">
        <h3 className="text-xl font-bold text-slate-300">Project not found</h3>
        <Link to="/dashboard/projects" className="text-indigo-400 hover:underline inline-flex items-center gap-1 mt-4">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>
      </div>
    );
  }



  const candidateAssignees = getCandidateAssignees();

  const isOwner = !!(currentUser && project && project.createdBy?._id === currentUser.id);

  return (
    <div className="space-y-8">
     
      <div className="space-y-4">
        <Link
          to="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <span className="inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded">
              {project.category}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">{project.name}</h1>
            <p className="text-slate-500 text-xs flex items-center gap-4">
              <span>Created: {new Date(project.createdAt).toLocaleDateString()}</span>
              <span>By: {project.createdBy?.name}</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {isOwner && (
              <>
                <button
                  onClick={handleEditProjectClick}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 focus:outline-none transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit Project
                </button>
                <button
                  onClick={() => setIsProjectDeleteOpen(true)}
                  className="cursor-pointer flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-semibold text-red-650 border border-slate-200 bg-white hover:bg-red-50 focus:outline-none transition-colors"
                >
                  <Trash className="h-3.5 w-3.5 text-red-600" />
                  Delete Project
                </button>
              </>
            )}
            <button
              onClick={() => {
                setEditingTask(null);
                setIsModalOpen(true);
                reset({
                  name: '',
                  deadline: '',
                  assignedTo: '',
                });
              }}
              className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-all duration-200 active:scale-[0.98] shadow-lg shadow-indigo-550/10"
            >
              <Plus className="h-4 w-4" />
              Add Task
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-150/50 border border-slate-200 rounded-2xl p-6">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-200 pb-3 mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 text-indigo-650" />
          Project Team ({candidateAssignees.length})
        </h3>
        <div className="flex flex-wrap gap-3">
          {candidateAssignees.map((user) => {
            const isCreator = user._id === project.createdBy?._id;
            return (
              <div
                key={user._id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs"
              >
                <div className="h-5 w-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-[9px] font-bold">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="font-semibold text-slate-700">{user.name}</span>
                {isCreator && (
                  <span className="text-[9px] font-bold text-indigo-650 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200/50 ml-1">
                    Owner
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center bg-slate-100 border border-slate-205 px-4 py-3 rounded-xl">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">Project Tasks ({tasks.length})</span>
        </div>

        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm bg-white">
              No tasks created yet.
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                projectCreatorId={project.createdBy?._id}
                currentUserId={currentUser?.id}
                onEdit={handleEditTaskClick}
                onDelete={handleDeleteTaskClick}
              />
            ))
          )}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseTaskModal}
        title={editingTask ? 'Edit Task' : 'Add New Task'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5 bg-white">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Task Name
            </label>
            <input
              type="text"
              {...register('name')}
              placeholder="e.g. Design Landing Page"
              className={`w-full bg-white border text-slate-900 placeholder-slate-400 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.name
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
              }`}
            />
            {errors.name && (
              <p className="text-xs text-red-650 mt-1 pl-1 font-medium text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Deadline Date
            </label>
            <div className="relative">
              <input
                type="date"
                {...register('deadline')}
                className={`w-full bg-white border text-slate-900 placeholder-slate-400 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errors.deadline
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
                }`}
              />
            </div>
            {errors.deadline && (
              <p className="text-xs text-red-655 mt-1 pl-1 font-medium text-red-600">{errors.deadline.message}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Assign To
            </label>
            <select
              {...register('assignedTo')}
              className={`w-full bg-white border text-slate-900 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                errors.assignedTo
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
              }`}
            >
              <option value="" className="text-slate-400">Select project member...</option>
              {candidateAssignees.map((user) => (
                <option key={user._id} value={user._id} className="text-slate-800">
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            {errors.assignedTo && (
              <p className="text-xs text-red-655 mt-1 pl-1 font-medium text-red-600">{errors.assignedTo.message}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={handleCloseTaskModal}
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
                  {editingTask ? 'Saving...' : 'Adding...'}
                </>
              ) : (
                editingTask ? 'Save Changes' : 'Add Task'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isProjectEditOpen}
        onClose={handleCloseProjectModal}
        title="Edit Project"
      >
        <form onSubmit={handleSubmitProject(onProjectSubmit)} className="p-6 space-y-6 bg-white">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block">
              Project Name
            </label>
            <input
              type="text"
              {...registerProject('name')}
              placeholder="e.g. Website Redesign"
              className={`w-full bg-white border text-slate-900 placeholder-slate-400 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                errorsProject.name
                  ? 'border-red-500 focus:ring-red-500/20'
                  : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
              }`}
            />
            {errorsProject.name && (
              <p className="text-xs text-red-655 mt-1 pl-1 font-medium text-red-600">{errorsProject.name.message}</p>
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
                {...registerProject('category')}
                placeholder="e.g. Marketing, Development"
                className={`w-full bg-white border text-slate-900 placeholder-slate-400 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 transition-all duration-200 ${
                  errorsProject.category
                    ? 'border-red-500 focus:ring-red-500/20'
                    : 'border-slate-200 focus:border-indigo-600 focus:ring-indigo-600/20'
                }`}
              />
            </div>
            {errorsProject.category && (
              <p className="text-xs text-red-655 mt-1 pl-1 font-medium text-red-600">{errorsProject.category.message}</p>
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
              control={controlProject}
              name="members"
              render={({ field }) => {
                const selectedIds = field.value || [];
                const handleCheckboxChange = (userId: string) => {
                  const updated = selectedIds.includes(userId)
                    ? selectedIds.filter((id) => id !== userId)
                    : [...selectedIds, userId];
                  field.onChange(updated);
                };

                const filteredUsers = systemUsers.filter(
                  (u) =>
                    u._id !== project?.createdBy?._id && (
                    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.email.toLowerCase().includes(userSearch.toLowerCase())
                  )
                );

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
              onClick={handleCloseProjectModal}
              className="cursor-pointer px-4 py-2.5 rounded-lg text-sm font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-colors bg-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingProject}
              className="cursor-pointer flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmittingProject ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmationModal
        isOpen={deletingTaskId !== null}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        onConfirm={handleTaskDeleteConfirm}
        onCancel={() => setDeletingTaskId(null)}
        isSubmitting={deletingTaskSubmitting}
      />

      <ConfirmationModal
        isOpen={isProjectDeleteOpen}
        title="Delete Project"
        message="Are you sure you want to delete this project? This will permanently delete the project and all its tasks. This action cannot be undone."
        onConfirm={handleProjectDeleteConfirm}
        onCancel={() => setIsProjectDeleteOpen(false)}
        isSubmitting={projectDeleteSubmitting}
      />
    </div>
  );
};

interface TaskCardProps {
  task: Task;
  projectCreatorId?: string;
  currentUserId?: string;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

// Task Card Inner Component (Full width card)
const TaskCard: React.FC<TaskCardProps> = ({ task, projectCreatorId, currentUserId, onEdit, onDelete }) => {
  // Check if current user created the task (or fallback to project creator if createdBy is missing)
  const isCreator = !!(currentUserId && (
    (task.createdBy && task.createdBy._id === currentUserId) ||
    (!task.createdBy && projectCreatorId === currentUserId)
  ));

  // Status badge style helper
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in progress':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-250';
    }
  };

  return (
    <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-205 flex flex-col md:flex-row md:items-center justify-between gap-6 group/card w-full">
      <div className="space-y-3 flex-1 min-w-0">
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className={`inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${getStatusStyle(task.status)}`}>
            {task.status}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="h-3 w-3 text-slate-450" />
            Created: {new Date(task.createdAt).toLocaleDateString()}
          </span>
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <span className="font-semibold text-red-500">Deadline:</span> {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'No Deadline'}
          </span>
        </div>

        <h4 className="text-lg font-bold text-slate-900 leading-snug truncate">
          {task.name}
        </h4>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-500 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              Assigned to: <span className="font-semibold text-slate-700">{task.assignedTo?.name || 'Unassigned'}</span>
            </span>
          </div>
          <div className="flex items-center gap-1.5 min-w-0 md:border-l md:border-slate-100 md:pl-6">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="truncate">
              Created by: <span className="font-semibold text-slate-700">{task.createdBy?.name || 'Owner'}</span>
            </span>
          </div>
        </div>
      </div>

      {isCreator && (
        <div className="flex items-center gap-2 shrink-0 md:border-l md:border-slate-100 md:pl-6">
          <button
            onClick={() => onEdit(task)}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-800 transition-colors"
            title="Edit Task"
          >
            <Pencil className="h-3.5 w-3.5 text-slate-500" />
            Edit
          </button>
          <button
            onClick={() => onDelete(task._id)}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-red-650 border border-slate-200 bg-white hover:bg-red-50 hover:text-red-700 transition-colors"
            title="Delete Task"
          >
            <Trash className="h-3.5 w-3.5 text-red-500" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectDetailsView;
