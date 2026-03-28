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
    isOwner?: boolean;
}

const Overview = ({
    project,
    members,
    tasks,
    onProjectUpdated,
    isOwner,
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
        <div className="font-inter flex flex-col lg:flex-row min-h-full text-zinc-900 dark:text-zinc-100 relative overflow-hidden">
            {/* Background Video/Gradient Element */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-30 dark:opacity-20 mix-blend-overlay">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/gradients/bg-1.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/50 to-transparent dark:from-black/80 dark:via-black/50" />
            </div>

            {/* LEFT */}

            <div className="flex-1 p-8 space-y-8 relative z-10">

                {/* MEMBER DROPDOWN */}

                <MemberDropdown
                    members={members}
                    selectedMemberId={selectedMemberId}
                    setSelectedMemberId={setSelectedMemberId}
                    selectedMember={selectedMember}
                />

                {/* WORKLOAD */}

                <section className="space-y-4">

                    <h2 className="font-satoshi text-xl font-black text-black dark:text-white">
                        Team Workload
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

            {/* RIGHT SIDEBAR */}

            <div className="w-full lg:w-80 border-l border-zinc-200/50 dark:border-zinc-800/50 p-6 space-y-6 relative z-10 bg-white/40 dark:bg-black/40 backdrop-blur-xl">

                <h2 className="font-body text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400 dark:text-zinc-500 mb-8 flex items-center gap-2.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                    Live Activity
                </h2>

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
            </div>
        </div>
    )
}

export default Overview

/* ===================================================== */
/* DROPDOWN */
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
                <button className="w-full max-w-md flex justify-between px-4 py-3 border rounded-2xl">
                    <div>
                        <p className="text-xs text-zinc-400">
                            Member
                        </p>
                        <p className="font-satoshi font-black text-black dark:text-white">
                            {selectedMemberId === "all"
                                ? "All members"
                                : selectedMember?.users
                                    ?.full_name}
                        </p>
                    </div>
                    <ChevronRight />
                </button>
            </PopoverTrigger>

            <PopoverContent className="w-72">
                <button
                    onClick={() =>
                        setSelectedMemberId("all")
                    }
                    className="w-full text-left p-2"
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
                        className="w-full text-left p-2"
                    >
                        {m.users?.full_name}
                    </button>
                ))}
            </PopoverContent>
        </Popover>
    )
}

/* ===================================================== */
/* WORKLOAD CARD */
/* ===================================================== */

function WorkloadCard({
    member,
    active,
    done,
}: any) {
    return (
        <motion.div
            whileHover={{ y: -3 }}
            className="p-4 border rounded-2xl space-y-3"
        >
            <div className="flex gap-3">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg">
                    {member.users?.email?.[0]}
                </div>
                <div>
                    <p className="font-satoshi font-black text-black dark:text-white">
                        {member.users?.full_name}
                    </p>
                    <p className="text-xs text-zinc-500">
                        {member.role}
                    </p>
                </div>
            </div>

            <div className="flex gap-4 text-sm font-black">
                <span className="text-red-600 dark:text-red-500">Active {active}</span>
                <span className="text-green-600 dark:text-green-500">Done {done}</span>
            </div>
        </motion.div>
    )
}

/* ===================================================== */
/* ACTIVITY */
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
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="relative flex gap-4 pr-2 group"
        >
            {/* Minimal Timeline Line */}
            {!isLast && (
                <div className="absolute left-[15px] top-8 bottom-[-8px] w-[1px] bg-gradient-to-b from-zinc-200 to-transparent dark:from-zinc-800 dark:to-transparent" />
            )}

            {/* Slim Icon Container */}
            <div className="relative shrink-0 flex flex-col items-center">
                <div className="w-[30px] h-[30px] rounded-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center shadow-sm group-hover:scale-110 transition-all duration-500 bg-white dark:bg-black z-10">
                    <Activity size={12} className="text-zinc-500 group-hover:text-violet-500 transition-colors" />
                </div>
            </div>

            {/* Action Content */}
            <div className="flex-1 pb-6 pt-1">
                <div className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-2">
                        <p className="text-[13px] text-zinc-600 dark:text-zinc-300 font-body">
                            {user ? (
                                <span className="font-bold text-zinc-900 dark:text-white">
                                    {user.full_name || 'Member'}
                                </span>
                            ) : (
                                <span className="font-bold text-zinc-900 dark:text-white">System</span>
                            )}
                            <span className="ml-1 opacity-80">{action}</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-violet-500/60 transition-colors">
                            {formatDistanceToNow(new Date(time), { addSuffix: true })}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}