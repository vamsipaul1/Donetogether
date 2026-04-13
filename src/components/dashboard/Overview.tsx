import { motion } from "framer-motion"
import {
    Users,
    ChevronRight,
    Clock,
    Activity,
} from "lucide-react"

import type {
    Project,
    ProjectMember,
    Task,
    User,
} from "@/types/database"

import { useState, useMemo } from "react"

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

import { formatDistanceToNow } from "date-fns"

interface OverviewProps {
    project: Project
    members: (ProjectMember & { users?: User })[]
    tasks: Task[]
    onProjectUpdated?: () => Promise<void>;
    islead?: boolean;
}

const Overview = ({
    project,
    members,
    tasks,
    onProjectUpdated,
    islead,
}: OverviewProps) => {
    /* ---------------- MEMBER FILTER ---------------- */

    const [selectedMemberId, setSelectedMemberId] =
        useState<string>("all")

    const selectedMember =
        selectedMemberId === "all"
            ? null
            : members.find(
                (m) => m.user_id === selectedMemberId
            )

    /* ---------------- FILTERED MEMBERS ---------------- */

    const visibleMembers = useMemo(() => {
        if (selectedMemberId === "all")
            return members

        return members.filter(
            (m) => m.user_id === selectedMemberId
        )
    }, [members, selectedMemberId])

    /* ---------------- ACTIVITIES ---------------- */

    const activities = [
        {
            id: "created",
            action: "Project created",
            time: project.created_at,
        },

        ...members.map((m) => ({
            id: m.id,
            action: "joined",
            time: m.joined_at,
            user: m.users,
        })),
    ]

    const filteredActivities =
        selectedMemberId === "all"
            ? activities
            : activities.filter(
                (a: any) =>
                    a.user?.id === selectedMemberId
            )

    /* ===================================================== */

    return (
        <div className="flex flex-col lg:flex-row min-h-full bg-[#fafafa] dark:bg-[#0b0c10] text-zinc-900 dark:text-zinc-100 relative overflow-hidden font-body">
            {/* LEFT CONTENT AREA */}
            <div className="flex-1 p-8 space-y-12 relative z-10 font-body">
                {/* MEMBER DROPDOWN - Linear Style */}
                <MemberDropdown
                    members={members}
                    selectedMemberId={selectedMemberId}
                    setSelectedMemberId={setSelectedMemberId}
                    selectedMember={selectedMember}
                />

                {/* WORKLOAD SECTION */}
                <section className="space-y-6">
                    <h2 className="text-sm font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest px-1">
                        Team Workload
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleMembers.map((member) => {
                            const active =
                                tasks.filter(
                                    (t) =>
                                        t.assigned_to ===
                                        member.user_id &&
                                        t.status !== "completed"
                                ).length

                            const done =
                                tasks.filter(
                                    (t) =>
                                        t.assigned_to ===
                                        member.user_id &&
                                        t.status === "completed"
                                ).length

                            return (
                                <WorkloadCard
                                    key={member.user_id}
                                    member={member}
                                    active={active}
                                    done={done}
                                />
                            )
                        })}
                    </div>
                </section>
            </div>

            {/* RIGHT SIDEBAR - Solid State */}
            <aside className="w-full lg:w-80 border-l border-zinc-200 dark:border-zinc-800 p-8 space-y-8 relative z-10 bg-white dark:bg-zinc-900 transition-colors">
                <div className="flex items-center justify-between">
                    <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 flex items-center gap-2.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                        Live Activity
                    </h2>
                </div>

                <div className="space-y-0 relative">
                    {filteredActivities.map(
                        (a: any, i: number) => (
                            <ActivityItem
                                key={a.id}
                                action={a.action}
                                user={a.user}
                                time={a.time}
                                index={i}
                                isLast={i === filteredActivities.length - 1}
                            />
                        )
                    )}
                </div>
            </aside>
        </div>
    )
}

export default Overview

/* ===================================================== */
/* DROPDOWN - Standard Product UI */
/* ===================================================== */

function MemberDropdown({
    members,
    selectedMemberId,
    setSelectedMemberId,
    selectedMember,
}: any) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <button className="flex items-center font-body gap-3 px-5 py-3.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98] outline-none min-w-[240px]">
                    <div className="flex flex-col items-start min-w-0 font-body">
                        <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">Member Filter</span>
                        <span className="text-[15px] font-bold font-body text-zinc-900 dark:text-white truncate max-w-[200px]">
                            {selectedMemberId === "all"
                                ? "All members"
                                : selectedMember?.users
                                    ?.full_name}
                        </span>
                    </div>
                    <ChevronRight className="w-4 h-4 ml-auto text-zinc-400" />
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-72 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl">
                <button
                    onClick={() =>
                        setSelectedMemberId("all")
                    }
                    className="w-full text-left px-3 py-2.5 text-sm font-bold font-body hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                >
                    All members
                </button>

                {members.map((m: any) => (
                    <button
                        key={m.user_id}
                        onClick={() =>
                            setSelectedMemberId(
                                m.user_id
                            )
                        }
                        className="w-full text-left px-3 py-2.5 text-sm font-bold font-body hover:bg-zinc-50 dark:hover:bg-zinc-800 rounded-lg transition-colors border-t border-zinc-100 dark:border-zinc-800 mt-1"
                    >
                        {m.users?.full_name}
                    </button>
                ))}
            </PopoverContent>
        </Popover>
    )
}

/* ===================================================== */
/* WORKLOAD CARD - Standard Card System */
/* ===================================================== */

function WorkloadCard({
    member,
    active,
    done,
}: any) {
    return (
        <motion.div
            whileHover={{ y: -2 }}
            className="p-5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm hover:shadow-md transition-all group cursor-default"
        >
            <div className="flex items-center gap-4 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-zinc-900 to-zinc-700 text-white flex items-center justify-center rounded-full text-sm font-medium shadow-sm shrink-0 border border-white/10">
                    {member.users?.email?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                    <p className="text-[15px] font-bold font-body text-zinc-900 dark:text-white truncate">
                        {member.users?.full_name}
                    </p>
                    <p className="text-[12px] font-medium text-zinc-400 capitalize">
                        {member.role || "Innovator"}
                    </p>
                </div>
            </div>

            <div className="flex gap-6 border-t border-zinc-100 dark:border-zinc-800/50 pt-4">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider mb-0.5">Active</span>
                    <span className="text-sm font-medium text-red-500">{active} tasks</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider mb-0.5">Completed</span>
                    <span className="text-sm font-medium text-emerald-500">{done} done</span>
                </div>
            </div>
        </motion.div>
    )
}

/* ===================================================== */
/* ACTIVITY ITEM - Premium Micro-UI */
/* ===================================================== */

function ActivityItem({
    action,
    user,
    time,
    index = 0,
    isLast = false
}: any) {
    return (
        <motion.div
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-4 pr-2 group"
        >
            {/* Minimal Timeline Line */}
            {!isLast && (
                <div className="absolute left-[15px] top-8 bottom-[-8px] w-[1px] bg-zinc-200 dark:bg-zinc-800 opacity-50" />
            )}

            {/* Dot Container */}
            <div className="relative shrink-0 pt-1.5">
                <div className="relative w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center z-10 group-hover:border-zinc-400 dark:group-hover:border-zinc-600 transition-colors duration-300">
                    <Activity size={12} className="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors" />
                </div>
            </div>

            {/* Action Content */}
            <div className="flex-1 pb-8 pt-1">
                <div className="flex flex-col gap-1.5">
                    <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                        {user ? (
                            <span className="font-semibold text-zinc-900 dark:text-white mr-1.5">
                                {user.full_name || 'Member'}
                            </span>
                        ) : (
                            <span className="font-semibold text-zinc-900 dark:text-white mr-1.5">System</span>
                        )}
                        <span className="opacity-70">{action}</span>
                    </p>

                    <span className="text-[11px] font-medium text-zinc-400 dark:text-zinc-500">
                        {formatDistanceToNow(new Date(time), { addSuffix: true })}
                    </span>
                </div>
            </div>
        </motion.div>
    )
}