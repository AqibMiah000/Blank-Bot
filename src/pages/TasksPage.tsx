import React, { useState } from 'react';
import {
  Plus,
  Play,
  Square,
  Trash2,
  Edit2,
  Terminal,
  FolderPlus,
  Zap,
  Repeat,
  Folder,
} from 'lucide-react';
import {
  TaskItem,
  TaskGroup,
  BillingProfile,
  ProxyPool,
  RetailAccount,
  Retailer,
} from '../types';
import { TaskModal } from '../components/TaskModal';
import { LogStreamModal } from '../components/LogStreamModal';

interface TasksPageProps {
  tasks: TaskItem[];
  taskGroups: TaskGroup[];
  profiles: BillingProfile[];
  proxyPools: ProxyPool[];
  accounts: RetailAccount[];
  onSaveTask: (task: Partial<TaskItem>) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
  onStartTask: (taskId: string) => void;
  onStopTask: (taskId: string) => void;
  onMassStart: (taskIds: string[]) => void;
  onMassStop: (taskIds: string[]) => void;
  onCreateGroup: (name: string, retailer: Retailer) => Promise<void>;
  onDeleteGroup: (groupId: string) => Promise<void>;
}

export const TasksPage: React.FC<TasksPageProps> = ({
  tasks,
  taskGroups,
  profiles,
  proxyPools,
  accounts,
  onSaveTask,
  onDeleteTask,
  onStartTask,
  onStopTask,
  onMassStart,
  onMassStop,
  onCreateGroup,
  onDeleteGroup,
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>(taskGroups[0]?.id || 'default');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [activeLogTask, setActiveLogTask] = useState<TaskItem | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupRetailer, setNewGroupRetailer] = useState<Retailer>('bestbuy');
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);

  const currentGroupTasks = tasks.filter(
    (t) => t.groupId === selectedGroupId || (selectedGroupId === 'all')
  );

  const toggleSelectAll = () => {
    if (selectedTaskIds.length === currentGroupTasks.length) {
      setSelectedTaskIds([]);
    } else {
      setSelectedTaskIds(currentGroupTasks.map((t) => t.id));
    }
  };

  const toggleSelectTask = (id: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleCreateGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    await onCreateGroup(newGroupName.trim(), newGroupRetailer);
    setNewGroupName('');
    setIsCreateGroupOpen(false);
  };

  const getStatusBadge = (task: TaskItem) => {
    const status = task.status;
    let colorClass = 'bg-surface-800 text-surface-400 border-surface-700';

    if (status === 'SUCCESS') colorClass = 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 glow-emerald';
    else if (status === 'FAILED') colorClass = 'bg-rose-500/20 text-rose-400 border-rose-500/40 glow-rose';
    else if (status === 'MONITORING' || status === 'WAITING_FOR_DROP')
      colorClass = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 glow-cyan animate-pulse';
    else if (status === 'QUEUE' || status === 'WAITING_2FA')
      colorClass = 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse';
    else if (status === 'CARTING' || status === 'CHECKING_OUT')
      colorClass = 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 animate-pulse';

    return (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider border ${colorClass}`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Left Sidebar: Task Groups */}
      <div className="w-56 bg-surface-950/80 border-r border-surface-800 p-3 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-[11px] font-bold text-surface-400 uppercase tracking-wider">
              Release Groups
            </span>
            <button
              onClick={() => setIsCreateGroupOpen(true)}
              className="p-1 rounded bg-surface-800 hover:bg-surface-700 text-brand-400"
              title="New Release Folder"
            >
              <FolderPlus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setSelectedGroupId('all')}
              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between ${
                selectedGroupId === 'all'
                  ? 'bg-surface-800 text-white font-semibold'
                  : 'text-surface-400 hover:text-slate-300 hover:bg-surface-900'
              }`}
            >
              <span>All Tasks</span>
              <span className="font-mono text-[10px] text-surface-500">{tasks.length}</span>
            </button>

            {taskGroups.map((group) => {
              const count = tasks.filter((t) => t.groupId === group.id).length;
              return (
                <div
                  key={group.id}
                  className={`group flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                    selectedGroupId === group.id
                      ? 'bg-brand-600/15 text-brand-300 border border-brand-500/30 font-semibold'
                      : 'text-surface-400 hover:text-slate-300 hover:bg-surface-900'
                  }`}
                  onClick={() => setSelectedGroupId(group.id)}
                >
                  <div className="flex items-center space-x-2 truncate">
                    <Folder className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{group.name}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 shrink-0">
                    <span className="font-mono text-[10px] text-surface-500">{count}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteGroup(group.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Group Creator Modal */}
        {isCreateGroupOpen && (
          <form
            onSubmit={handleCreateGroupSubmit}
            className="bg-surface-900 p-3 rounded-xl border border-surface-700 space-y-2 mt-2"
          >
            <span className="text-[10px] font-bold text-surface-300 uppercase">New Group</span>
            <input
              type="text"
              required
              placeholder="e.g. Pokémon TCG Drop"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              className="w-full bg-surface-950 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white outline-none"
            />
            <select
              value={newGroupRetailer}
              onChange={(e) => setNewGroupRetailer(e.target.value as Retailer)}
              className="w-full bg-surface-950 border border-surface-700 rounded-lg px-2 py-1 text-xs text-white outline-none"
            >
              <option value="bestbuy">Best Buy</option>
              <option value="walmart">Walmart</option>
              <option value="target">Target</option>
              <option value="amazon">Amazon</option>
              <option value="apple">Apple</option>
            </select>
            <div className="flex justify-end space-x-1 pt-1">
              <button
                type="button"
                onClick={() => setIsCreateGroupOpen(false)}
                className="px-2 py-0.5 text-[10px] text-surface-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-2.5 py-0.5 bg-brand-600 text-white font-bold text-[10px] rounded"
              >
                Create
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Main Table Area */}
      <div className="flex-1 flex flex-col bg-surface-950 overflow-hidden">
        {/* Table Top Action Bar */}
        <div className="p-3 px-6 border-b border-surface-800/80 flex items-center justify-between bg-surface-900/40">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="px-3 py-1.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-brand-500/20"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Task</span>
            </button>

            {selectedTaskIds.length > 0 && (
              <div className="flex items-center space-x-2 pl-3 border-l border-surface-800">
                <span className="text-xs text-surface-400 font-mono">
                  {selectedTaskIds.length} selected
                </span>
                <button
                  onClick={() => onMassStart(selectedTaskIds)}
                  className="px-2.5 py-1 bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-emerald-400" />
                  <span>Start</span>
                </button>
                <button
                  onClick={() => onMassStop(selectedTaskIds)}
                  className="px-2.5 py-1 bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Square className="w-3 h-3 fill-rose-400" />
                  <span>Stop</span>
                </button>
              </div>
            )}
          </div>

          <div className="text-xs text-surface-500 font-mono">
            High-Frequency Worker Engine: <span className="text-emerald-400">Ready</span>
          </div>
        </div>

        {/* High-Density Data Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse text-xs font-mono-data">
            <thead>
              <tr className="bg-surface-900/60 border-b border-surface-800/80 text-[11px] font-bold text-surface-400 uppercase tracking-wider sticky top-0 backdrop-blur z-10">
                <th className="p-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      currentGroupTasks.length > 0 &&
                      selectedTaskIds.length === currentGroupTasks.length
                    }
                    onChange={toggleSelectAll}
                    className="w-3.5 h-3.5 rounded text-brand-500"
                  />
                </th>
                <th className="p-3">Retailer</th>
                <th className="p-3">Product / Identifier</th>
                <th className="p-3">Profile</th>
                <th className="p-3">Proxy Pool</th>
                <th className="p-3">Delays</th>
                <th className="p-3">Status</th>
                <th className="p-3">Message / Latency</th>
                <th className="p-3 text-right pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-850">
              {currentGroupTasks.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-16 text-surface-500 font-sans text-xs">
                    No automation tasks in this folder. Click &quot;Create Task&quot; to begin.
                  </td>
                </tr>
              ) : (
                currentGroupTasks.map((task) => {
                  const isSelected = selectedTaskIds.includes(task.id);
                  const profile = profiles.find((p) => p.id === task.profileId);
                  const proxyPool = proxyPools.find((p) => p.id === task.proxyPoolId);

                  return (
                    <tr
                      key={task.id}
                      className={`hover:bg-surface-900/50 transition-colors ${
                        isSelected ? 'bg-brand-950/20' : ''
                      }`}
                    >
                      <td className="p-3 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectTask(task.id)}
                          className="w-3.5 h-3.5 rounded text-brand-500"
                        />
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-[11px] uppercase tracking-wider text-slate-200">
                          {task.retailer}
                        </span>
                      </td>
                      <td className="p-3 max-w-[180px] truncate text-cyan-300 font-mono" title={task.input}>
                        <div className="flex items-center space-x-1.5">
                          {task.flags.skipMonitor && (
                            <span title="Skip Monitoring"><Zap className="w-3 h-3 text-amber-400 shrink-0" /></span>
                          )}
                          {task.flags.loopCheckout && (
                            <span title="Loop Checkout"><Repeat className="w-3 h-3 text-cyan-400 shrink-0" /></span>
                          )}
                          <span className="truncate">{task.input}</span>
                        </div>
                      </td>
                      <td className="p-3 text-slate-300 truncate max-w-[130px]">
                        {profile?.profileName || 'Default'}
                      </td>
                      <td className="p-3 text-surface-400 truncate max-w-[120px]">
                        {proxyPool ? proxyPool.name : 'Direct'}
                      </td>
                      <td className="p-3 text-surface-400 text-[11px] font-mono">
                        {task.monitorDelay}/{task.retryDelay}ms
                      </td>
                      <td className="p-3">{getStatusBadge(task)}</td>
                      <td className="p-3 truncate max-w-[200px]">
                        <span className="text-surface-300 text-xs truncate block" title={task.statusMessage}>
                          {task.statusMessage || 'Standby'}
                        </span>
                        {task.checkoutLatency && (
                          <span className="text-[10px] text-emerald-400 font-mono">
                            ⚡ {task.checkoutLatency}ms
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-right pr-6 space-x-1.5">
                        {task.status === 'IDLE' || task.status === 'STOPPED' || task.status === 'FAILED' ? (
                          <button
                            onClick={() => onStartTask(task.id)}
                            className="p-1 rounded bg-surface-800 hover:bg-emerald-600/30 text-emerald-400"
                            title="Start Task"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onStopTask(task.id)}
                            className="p-1 rounded bg-surface-800 hover:bg-rose-600/30 text-rose-400"
                            title="Stop Task"
                          >
                            <Square className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setActiveLogTask(task)}
                          className="p-1 rounded bg-surface-800 hover:bg-surface-700 text-cyan-400"
                          title="View Live Logs"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingTask(task);
                            setIsTaskModalOpen(true);
                          }}
                          className="p-1 rounded bg-surface-800 hover:bg-surface-700 text-surface-400"
                          title="Edit Task"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1 rounded bg-surface-800 hover:bg-surface-700 text-rose-400"
                          title="Delete Task"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSave={onSaveTask}
        initialTask={editingTask}
        groupId={selectedGroupId === 'all' ? (taskGroups[0]?.id || 'default') : selectedGroupId}
        profiles={profiles}
        proxyPools={proxyPools}
        accounts={accounts}
      />

      {/* Task Console Log Modal */}
      {activeLogTask && (
        <LogStreamModal
          isOpen={Boolean(activeLogTask)}
          onClose={() => setActiveLogTask(null)}
          taskId={activeLogTask.id}
          logs={activeLogTask.logs || []}
        />
      )}
    </div>
  );
};
