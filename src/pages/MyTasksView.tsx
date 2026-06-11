import React, { useState, useEffect } from 'react';
import {  Calendar,  Loader2} from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface ProjectInfo {
  _id: string;
  name: string;
  category: string;
}

interface Task {
  _id: string;
  name: string;
  status: 'pending' | 'in progress' | 'completed';
  deadline: string;
  project: ProjectInfo;
  createdAt: string;
}

export const MyTasksView: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchMyTasks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/tasks/my-tasks');
      setTasks(response.data.tasks);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to load assigned tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      setUpdatingTaskId(taskId);
      const response = await api.put(`/tasks/${taskId}/status`, { status: newStatus });
      
      toast.success('Task status updated!');
      // Update local state
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task._id === taskId ? { ...task, status: response.data.task.status } : task
        )
      );
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update task status');
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const getStatusBadgeStyles = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-50 border-emerald-250 text-emerald-700';
      case 'in progress':
        return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      default:
        return 'bg-slate-50 border-slate-200 text-slate-700';
    }
  };

  if (loading && tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-650 mx-auto" />
          <p className="text-slate-500">Loading your tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">My Tasks</h1>
        <p className="text-slate-550 mt-1">Review and manage the tasks assigned to you</p>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-16 border  border-zinc-200 rounded-2xl bg-white">
          
          <h3 className="text-lg font-semibold text-slate-705 text-slate-700">No tasks are assigned to you.</h3>
          
        </div>
      ) : (
        <div className="bg-white border border-slate-205 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Task Details</th>
                  <th className="py-4 px-6">Project Name</th>
                  <th className="py-4 px-6">Deadline</th>
                  <th className="py-4 px-6 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm text-slate-800">
                {tasks.map((task) => (
                  <tr key={task._id} className="hover:bg-slate-50/50 transition-colors">
                    
                    <td className="py-4 px-6 font-semibold text-slate-900 max-w-xs truncate">
                      {task.name}
                    </td>

                    
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-700 truncate">
                          {task.project?.name || 'Unlinked Project'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Category: {task.project?.category || 'None'}
                        </span>
                      </div>
                    </td>

                    
                    <td className="py-4 px-6 text-slate-550 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {new Date(task.deadline).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </td>

                    
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        {updatingTaskId === task._id && (
                          <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                        )}
                        <select
                          disabled={updatingTaskId === task._id}
                          value={task.status}
                          onChange={(e) => handleStatusChange(task._id, e.target.value)}
                          className={`border text-[11px] font-bold rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer ${getStatusBadgeStyles(
                            task.status
                          )}`}
                        >
                          <option value="pending" className="text-slate-800 font-medium bg-white">Pending</option>
                          <option value="in progress" className="text-slate-800 font-medium bg-white">In Progress</option>
                          <option value="completed" className="text-slate-800 font-medium bg-white">Completed</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyTasksView;
