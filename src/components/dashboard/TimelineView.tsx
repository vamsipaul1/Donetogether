import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    ChevronLeft, ChevronRight,
    Calendar as CalendarIcon, Filter,
    Plus, ChevronDown, GripVertical
} from 'lucide-react';
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isToday, differenceInDays, parseISO, isValid, addMilliseconds } from 'date-fns';
import type { Task, ProjectMember, User as UserType } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface TimelineViewProps {
    tasks: Task[];
    members: (ProjectMember & { users?: UserType })[];
    currentUserId: string;
    isOwner: boolean;
    onTasksUpdated: () => void;
    onAddTask: () => void;
}

const TimelineView = ({ tasks, members, currentUserId, isOwner, onTasksUpdated, onAddTask }: TimelineViewProps) => {
    const [viewDate, setViewDate] = useState(new Date());
    const [timelineRange, setTimelineRange] = useState(28); // Default 4 weeks
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

    const COLUMN_WIDTH = 52; // Fixed width for perfect alignment

    // Optimistic State
    const [optimisticTasks, setOptimisticTasks] = useState(tasks);
    useEffect(() => {
        setOptimisticTasks(tasks);
    }, [tasks]);

    // Manipulation State
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [manipulationType, setManipulationType] = useState<'drag' | 'resize-start' | 'resize-end' | null>(null);
    const [manipulationOffset, setManipulationOffset] = useState(0);
    const dragStartX = useRef<number>(0);
    const initialDates = useRef<{ start: string | undefined, end: string | undefined }>({ start: undefined, end: undefined });
    const gridRef = useRef<HTMLDivElement>(null);

    // Calculate timeline range
    const startDate = useMemo(() => startOfWeek(viewDate, { weekStartsOn: 1 }), [viewDate]);
    const timelineDays = useMemo(() => Array.from({ length: timelineRange }, (_, i) => addDays(startDate, i)), [startDate, timelineRange]);

    // Unique Colors Calculation (Sequential & Consistent)
    const taskColors = useMemo(() => {
        const sortedIds = [...optimisticTasks]
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
            .map(t => t.id);

        const colorPalette = [
            'bg-violet-500 shadow-violet-500/40 border-violet-400/50',
            'bg-indigo-500 shadow-indigo-500/40 border-indigo-400/50',
            'bg-blue-500 shadow-blue-500/40 border-blue-400/50',
            'bg-sky-500 shadow-sky-500/40 border-sky-400/50',
            'bg-cyan-500 shadow-cyan-500/40 border-cyan-400/50',
            'bg-teal-500 shadow-teal-500/40 border-teal-400/50',
            'bg-emerald-500 shadow-emerald-500/40 border-emerald-400/50',
            'bg-green-500 shadow-green-500/40 border-green-400/50',
            'bg-lime-500 shadow-lime-500/40 border-lime-400/50',
            'bg-yellow-500 shadow-yellow-500/40 border-yellow-400/50',
            'bg-amber-500 shadow-amber-500/40 border-amber-400/50',
            'bg-orange-500 shadow-orange-500/40 border-orange-400/50',
            'bg-red-500 shadow-red-500/40 border-red-400/50',
            'bg-rose-500 shadow-rose-500/40 border-rose-400/50',
            'bg-pink-500 shadow-pink-500/40 border-pink-400/50',
            'bg-fuchsia-500 shadow-fuchsia-500/40 border-fuchsia-400/50',
            'bg-purple-500 shadow-purple-500/40 border-purple-400/50',
            'bg-slate-500 shadow-slate-500/40 border-slate-400/50',
            'bg-stone-500 shadow-stone-500/40 border-stone-400/50',
            'bg-zinc-500 shadow-zinc-500/40 border-zinc-400/50',
        ];

        const map: Record<string, string> = {};
        sortedIds.forEach((id, index) => {
            map[id] = colorPalette[index % colorPalette.length];
        });
        return map;
    }, [tasks]);

    // Manipulation Handlers
    const handleStartTaskManipulation = (e: React.MouseEvent | React.TouchEvent, task: Task, type: 'drag' | 'resize-start' | 'resize-end') => {
        // e.stopPropagation(); 
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        setActiveTaskId(task.id);
        setManipulationType(type);
        dragStartX.current = clientX;
        initialDates.current = { start: task.start_date, end: task.due_date };
        setManipulationOffset(0);
    };

    const handleDragStart = (e: React.MouseEvent | React.TouchEvent, task: Task) => handleStartTaskManipulation(e, task, 'drag');

    const handleManipulationMove = useCallback((clientX: number) => {
        if (!activeTaskId) return;
        const dayWidth = COLUMN_WIDTH;
        const pixelDelta = clientX - dragStartX.current;
        const daysDelta = Math.round(pixelDelta / dayWidth);
        setManipulationOffset(daysDelta);
    }, [activeTaskId, COLUMN_WIDTH]);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        handleManipulationMove(e.clientX);
    }, [handleManipulationMove]);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        handleManipulationMove(e.touches[0].clientX);
    }, [handleManipulationMove]);

    const handleManipulationEnd = useCallback(async () => {
        if (!activeTaskId || !manipulationType) return;

        const { font_start, font_end } = { font_start: initialDates.current.start, font_end: initialDates.current.end };

        if (manipulationOffset !== 0) {
            const currentStart = font_start ? new Date(font_start) : (font_end ? new Date(font_end) : new Date());
            const currentEnd = font_end ? new Date(font_end) : new Date();

            let newStart = currentStart;
            let newEnd = currentEnd;

            if (manipulationType === 'drag') {
                newStart = addDays(currentStart, manipulationOffset);
                newEnd = addDays(currentEnd, manipulationOffset);
            } else if (manipulationType === 'resize-start') {
                newStart = addDays(currentStart, manipulationOffset);
                if (newStart > newEnd) newStart = newEnd;
            } else if (manipulationType === 'resize-end') {
                newEnd = addDays(currentEnd, manipulationOffset);
                if (newEnd < newStart) newEnd = newStart;
            }

            setOptimisticTasks(prev => prev.map(t =>
                t.id === activeTaskId
                    ? { ...t, start_date: newStart.toISOString(), due_date: newEnd.toISOString() }
                    : t
            ));

            setActiveTaskId(null);
            setManipulationType(null);
            setManipulationOffset(0);

            try {
                const { error } = await supabase.from('tasks').update({
                    start_date: newStart.toISOString(),
                    due_date: newEnd.toISOString()
                }).eq('id', activeTaskId);

                if (error) throw error;
                toast.success('Schedule updated');
                onTasksUpdated();
            } catch (err) {
                console.error(err);
                toast.error('Failed to update task');
                setOptimisticTasks(tasks);
            }
        } else {
            setActiveTaskId(null);
            setManipulationType(null);
            setManipulationOffset(0);
        }
    }, [activeTaskId, manipulationType, manipulationOffset, tasks, onTasksUpdated]);

    const handleMouseUp = useCallback(() => handleManipulationEnd(), [handleManipulationEnd]);
    const handleTouchEnd = useCallback(() => handleManipulationEnd(), [handleManipulationEnd]);

    useEffect(() => {
        if (activeTaskId) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('touchmove', handleTouchMove, { passive: false });
            window.addEventListener('touchend', handleTouchEnd);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [activeTaskId, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);


    const sections = [
        { id: 'not_started', label: 'To do' },
        { id: 'in_progress', label: 'Doing' },
        { id: 'completed', label: 'Done' },
    ];

    // Optimize section filtering for extreme speed
    const groupedTasks = useMemo(() => {
        const map: Record<string, Task[]> = {
            not_started: [],
            in_progress: [],
            completed: []
        };
        optimisticTasks.forEach(task => {
            if (map[task.status]) map[task.status].push(task);
        });
        return map;
    }, [optimisticTasks]);

    const toggleSection = (sectionId: string) => {
        setCollapsedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    // Calculate bar position
    const getTaskStyle = (task: Task) => {
        if (!task.due_date) return null;

        let taskStart = task.start_date ? parseISO(task.start_date) : parseISO(task.due_date);
        let taskEnd = parseISO(task.due_date);

        if (!isValid(taskStart) || !isValid(taskEnd)) return null;

        // Apply visual manipulation offset
        if (activeTaskId === task.id) {
            if (manipulationType === 'drag') {
                taskStart = addDays(taskStart, manipulationOffset);
                taskEnd = addDays(taskEnd, manipulationOffset);
            } else if (manipulationType === 'resize-start') {
                taskStart = addDays(taskStart, manipulationOffset);
                if (taskStart > taskEnd) taskStart = taskEnd;
            } else if (manipulationType === 'resize-end') {
                taskEnd = addDays(taskEnd, manipulationOffset);
                if (taskEnd < taskStart) taskEnd = taskStart;
            }
        }

        const startOffset = differenceInDays(taskStart, startDate);
        const duration = Math.max(1, differenceInDays(taskEnd, taskStart) + 1);

        const totalColumns = timelineRange;

        // Visibility check
        if (startOffset + duration < 0 || startOffset > totalColumns) return null;

        return {
            left: `${startOffset * COLUMN_WIDTH}px`,
            width: `${duration * COLUMN_WIDTH}px`,
            actualStart: taskStart,
            actualEnd: taskEnd
        };
    };

    return (
        <div className="h-full flex flex-col bg-[#f8f9fa] dark:bg-black font-sans text-zinc-900 dark:text-zinc-100 overflow-hidden dotted-pattern">
            {/* Toolbar */}
            <header className="px-6 h-16 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-30">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                            <CalendarIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />
                        </div>
                        <div>
                            <h2 className="text-sm font-black text-zinc-900 dark:text-white uppercase ">Timeline</h2>
                            <p className="text-[12px] font-bold text-zinc-600">Gantt View</p>
                        </div>
                    </div>

                    <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />

                    <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 border border-zinc-200 dark:border-zinc-800">
                        <button onClick={() => setViewDate(subWeeks(viewDate, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all shadow-sm group">
                            <ChevronLeft className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                        </button>
                        <button onClick={() => setViewDate(new Date())} className="px-4 text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-widest hover:text-emerald-500 transition-colors">
                            {format(viewDate, 'MMM yyyy')}
                        </button>
                        <button onClick={() => setViewDate(addWeeks(viewDate, 1))} className="w-8 h-8 flex items-center justify-center hover:bg-white dark:hover:bg-zinc-800 rounded-lg transition-all shadow-sm group">
                            <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={onAddTask} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-zinc-500/20">
                        <img src="/image copy 4.png" alt="" className="w-3.5 h-3.5 invert brightness-0 dark:brightness-200" /> Add Task
                    </button>
                </div>
            </header>

            {/* Timeline Grid */}
            <div className="flex-1 overflow-auto bg-transparent relative flex flex-col scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
                {/* Header Grid */}
                <div className="flex sticky top-0 z-20 bg-white dark:bg-black border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
                    {/* Sidebar Header - Sticky sync with rows */}
                    <div className="hidden md:flex w-72 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 px-6 py-4 items-center bg-white dark:bg-black sticky left-0 z-20">
                        <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                            <Filter className="w-3 h-3" /> Task Details
                        </span>
                    </div>

                    {/* Days Header */}
                    <div className="flex-1 flex min-w-max">
                        <div ref={gridRef} className="flex shrink-0">
                            {timelineDays.map((day, i) => {
                                const isCurrent = isToday(day);
                                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                                return (
                                    <div key={i} style={{ width: COLUMN_WIDTH }} className={`shrink-0 border-r border-zinc-100 dark:border-zinc-800/50 text-center py-2 md:py-3 ${isWeekend ? 'bg-zinc-50 dark:bg-zinc-900/40' : 'bg-white dark:bg-black'}`}>
                                        <div className={`text-[8px] md:text-[9px] font-bold uppercase mb-0.5 md:mb-1 ${isCurrent ? 'text-emerald-600 dark:text-emerald-500' : 'text-zinc-400'}`}>{format(day, 'EEE')}</div>
                                        <div className={`text-[11px] md:text-sm font-black inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-lg ${isCurrent ? 'text-white bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'text-zinc-700 dark:text-zinc-300'}`}>{format(day, 'd')}</div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Extend Button at the end */}
                        <button
                            onClick={() => setTimelineRange(prev => prev + 14)}
                            className="px-6 py-4 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 border-l border-zinc-200 dark:border-zinc-800 transition-colors group w-32 shrink-0"
                        >
                            <img src="/image copy 4.png" alt="" className="w-4 h-4 opacity-50 group-hover:opacity-100 mb-1" />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest group-hover:text-zinc-900 dark:group-hover:text-white">Extend</span>
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-max pb-32">
                    {sections.map(section => {
                        const sectionTasks = groupedTasks[section.id];
                        const isCollapsed = collapsedSections[section.id];
                        if (!sectionTasks || sectionTasks.length === 0) return null;

                        return (
                            <div key={section.id} className="mt-4 first:mt-0">
                                {/* Section Header */}
                                <div
                                    onClick={() => toggleSection(section.id)}
                                    className="sticky left-0 right-0 px-4 py-2 flex items-center gap-3 z-10 cursor-pointer group"
                                >
                                    <div className="absolute inset-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm border-y border-zinc-100 dark:border-zinc-800/50" />
                                    <div className="relative flex items-center gap-3 w-full">
                                        <div className={`p-1 rounded-lg transition-all ${isCollapsed ? '-rotate-90 bg-zinc-100 dark:bg-zinc-800 text-zinc-400' : 'rotate-0 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-500'}`}>
                                            <ChevronDown className="w-3.5 h-3.5" />
                                        </div>
                                        <h3 className="font-bold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wider">{section.label}</h3>
                                        <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-400">{sectionTasks.length}</span>
                                        <div className="h-px flex-1 bg-zinc-100 dark:bg-zinc-800 ml-4" />
                                    </div>
                                </div>

                                {/* Task Rows */}
                                {!isCollapsed && (
                                    <div className="animate-in slide-in-from-top-2 duration-300 ease-out">
                                        {sectionTasks.map(task => (
                                            <div key={task.id} className="flex group relative h-14 border-b border-zinc-100 dark:border-zinc-800/30 hover:bg-white dark:hover:bg-zinc-900/10 transition-colors">

                                                {/* Sidebar Cell - Hidden on mobile */}
                                                <div className="hidden md:flex w-72 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-800 px-6 items-center gap-4 sticky left-0 bg-[#f8f9fa] dark:bg-black group-hover:bg-white dark:group-hover:bg-zinc-900/50 transition-colors z-10">
                                                    <div className={`w-1 h-8 rounded-full ${['high', 'medium', 'low'].includes(task.priority) ? '' : 'bg-zinc-300'} 
                                                        ${task.priority === 'high' ? 'bg-rose-500' : task.priority === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                                                    />
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 truncate block">{task.title}</span>
                                                        <span className="text-[11px] text-zinc-400 font-medium truncate block mt-0.5">
                                                            {task.due_date ? format(new Date(task.due_date), 'MMM d') : 'No date'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Timeline Cell */}
                                                <div className="flex-1 flex min-w-max">
                                                    <div className="relative shrink-0" style={{ width: timelineRange * COLUMN_WIDTH }}>
                                                        {/* Background Grid Lines - Absolute sync */}
                                                        <div className="absolute inset-0 flex pointer-events-none">
                                                            {timelineDays.map((d, i) => {
                                                                const isWeekend = d.getDay() === 0 || d.getDay() === 6;
                                                                return (
                                                                    <div key={i} style={{ width: COLUMN_WIDTH }} className={`shrink-0 border-r border-zinc-100 dark:border-zinc-800/50 ${isWeekend ? 'bg-zinc-50/30 dark:bg-zinc-900/10' : ''}`} />
                                                                )
                                                            })}
                                                        </div>

                                                        {/* Date Bar */}
                                                        {task.due_date && (
                                                            <div className="absolute inset-y-0 w-full py-2.5">
                                                                {(() => {
                                                                    const style = getTaskStyle(task);
                                                                    if (!style) return null;
                                                                    const colorClass = taskColors[task.id] || 'bg-zinc-500';

                                                                    return (
                                                                        <div
                                                                            onMouseDown={(e) => handleDragStart(e, task)}
                                                                            onTouchStart={(e) => handleDragStart(e, task)}
                                                                            className={`group/bar absolute h-7 md:h-9 rounded-lg md:rounded-xl px-2 md:px-3 flex items-center gap-1.5 md:gap-2 shadow-lg cursor-grab active:cursor-grabbing border-t border-white/20 hover:brightness-105 active:scale-[0.99] transition-all z-10
                                                                            ${colorClass} ${activeTaskId === task.id ? 'z-50 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-black scale-105 opacity-90' : ''}
                                                                        `}
                                                                            style={{ left: style.left, width: style.width }}
                                                                        >
                                                                            {/* Start Resize Handle */}
                                                                            <div
                                                                                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-l-xl z-20"
                                                                                onMouseDown={(e) => { e.stopPropagation(); handleStartTaskManipulation(e, task, 'resize-start'); }}
                                                                                onTouchStart={(e) => { e.stopPropagation(); handleStartTaskManipulation(e, task, 'resize-start'); }}
                                                                            />

                                                                            {/* End Resize Handle */}
                                                                            <div
                                                                                className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-white/20 rounded-r-xl z-20"
                                                                                onMouseDown={(e) => { e.stopPropagation(); handleStartTaskManipulation(e, task, 'resize-end'); }}
                                                                                onTouchStart={(e) => { e.stopPropagation(); handleStartTaskManipulation(e, task, 'resize-end'); }}
                                                                            />

                                                                            {/* Grip Handle for visual cue */}
                                                                            <GripVertical className="w-3 h-3 text-white/50 -ml-1 group-hover/bar:text-white transition-colors" />

                                                                            {/* User Avatar */}
                                                                            {members.find(m => m.user_id === task.assigned_to) && (
                                                                                <div className="w-5 h-5 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-[8px] font-black text-white shadow-inner border border-white/10">
                                                                                    {members.find(m => m.user_id === task.assigned_to)?.users?.email?.[0]}
                                                                                </div>
                                                                            )}

                                                                            <span className="text-[10px] md:text-[11px] font-bold text-white truncate drop-shadow-md flex-1">
                                                                                {task.title}
                                                                            </span>

                                                                            {/* Manipulation Tooltip */}
                                                                            {activeTaskId === task.id && (
                                                                                <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 border border-zinc-800 text-white text-[10px] font-bold py-1 px-3 rounded-lg flex items-center gap-2 whitespace-nowrap shadow-2xl z-50">
                                                                                    <CalendarIcon className="w-3 h-3 text-emerald-500" />
                                                                                    {format(style.actualStart, 'MMM d')} - {format(style.actualEnd, 'MMM d')}
                                                                                    <span className="ml-1 text-zinc-500">[{differenceInDays(style.actualEnd, style.actualStart) + 1}d]</span>
                                                                                </div>
                                                                            )}

                                                                            {/* Time Remaining Label */}
                                                                            {!activeTaskId && (
                                                                                <span className="text-[9px] font-medium text-white/90 bg-black/20 px-1.5 py-0.5 rounded-md backdrop-blur-md">
                                                                                    {(() => {
                                                                                        const today = new Date();
                                                                                        const due = parseISO(task.due_date);
                                                                                        today.setHours(0, 0, 0, 0);
                                                                                        due.setHours(0, 0, 0, 0);
                                                                                        const daysLeft = differenceInDays(due, today);
                                                                                        if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
                                                                                        if (daysLeft === 0) return 'Due today';
                                                                                        return `${daysLeft}d left`;
                                                                                    })()}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>
                                                        )}
                                                    </div>
                                                    {/* Row Spacer to match Extend button */}
                                                    <div className="w-32 shrink-0 border-l border-zinc-100 dark:border-zinc-800/30 bg-zinc-50/10 dark:bg-zinc-900/5" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TimelineView;
