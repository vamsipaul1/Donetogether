import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  MessageSquare,
  Sparkles,
  BarChart3,
  Settings,
  Calendar,
  GraduationCap,
  TrendingUp,
  MoreVertical,
  CheckCircle2,
  FolderGit2,
  ListTodo
} from "lucide-react";

interface TabData {
  id: string;
  label: string;
  summary: string;
  buttonText: string;
  path: string;
}

const TABS: TabData[] = [
  {
    id: "overview",
    label: "Overview",
    summary: "Get a quick summary of your activities, projects, and updates.",
    buttonText: "View Overview",
    path: "/project-room",
  },
  {
    id: "projects",
    label: "Projects",
    summary: "Track and organize all your team deliverables and project milestones.",
    buttonText: "View Projects",
    path: "/project-room",
  },
  {
    id: "tasks",
    label: "Tasks",
    summary: "Manage agile sprints, assign tasks, and monitor completion rates.",
    buttonText: "View Tasks",
    path: "/project-room",
  },
  {
    id: "team",
    label: "Team",
    summary: "Discover team skills, roles, lead assignments, and peer collaboration.",
    buttonText: "View Team",
    path: "/project-room",
  },
  {
    id: "chat",
    label: "Chat",
    summary: "Contextual discussions, channels, and real-time team messaging.",
    buttonText: "View Chat",
    path: "/messages",
  },
  {
    id: "ai-help",
    label: "AI Help",
    summary: "Automated project planning, smart breakdowns, and instant AI insights.",
    buttonText: "View AI Help",
    path: "/project-room",
  },
  {
    id: "reports",
    label: "Reports",
    summary: "Comprehensive productivity analytics, burndown charts, and progress metrics.",
    buttonText: "View Reports",
    path: "/project-room",
  },
];

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [animKey, setAnimKey] = useState<number>(0);

  const activeIndex = TABS.findIndex((t) => t.id === activeTab);

  // Auto cycle every 8 seconds if idle
  useEffect(() => {
    setAnimKey((k) => k + 1);
    const timer = setTimeout(() => {
      const nextIndex = (activeIndex + 1) % TABS.length;
      setActiveTab(TABS[nextIndex].id);
    }, 8000);
    return () => clearTimeout(timer);
  }, [activeTab]);

  return (
    <section className="relative w-full py-16 sm:py-24 bg-[#fde8ea] font-body antialiased flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">

      {/* ======================================================== */}
      {/* TOP HEADER BLOCK BEFORE THE CARD                         */}
      {/* ======================================================== */}
      <div className="w-full max-w-[1240px] flex flex-col items-start text-left mb-10 sm:mb-14 font-body">

        {/* Pill Badge */}
        <div className="bg-[#0052ff]/10 text-[#0052ff] font-body font-semibold text-[13.5px] px-3.5 py-1.5 rounded-full mb-6 inline-flex items-center gap-2 shadow-xs border border-[#0052ff]/15">
          <img
            src="/featurelogo.png"
            alt="WeMakeIt logo"
            className="h-4 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
          <span>Ask WeMakeIt. What are the benefits of WeMakeIt?</span>
        </div>

        {/* Big Heading */}
        <h2 className="text-[30px] sm:text-[42px] md:text-[48px] font-body font-[400] text-[#0052ff] leading-[1.14] tracking-[-0.03em] max-w-[940px]">
          Manage every student project without the chaos. Give your team the clarity they need to execute perfectly.
        </h2>
      </div>

      {/* ======================================================== */}
      {/* MAIN CONTAINER WIREFRAME CARD                            */}
      {/* ======================================================== */}
      <div className="w-full max-w-[1240px] bg-white rounded-[32px] sm:rounded-[36px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.04)] border border-gray-100 p-6 sm:p-10 lg:p-12 font-body">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

          {/* ======================================================== */}
          {/* LEFT SIDEBAR NAVIGATION ACCORDION                        */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 flex flex-col justify-start lg:border-r lg:border-gray-100 lg:pr-8 font-body">
            <div className="flex flex-col space-y-1">
              {TABS.map((tab) => {
                const isActive = activeTab === tab.id;

                return (
                  <div
                    key={tab.id}
                    className="border-b border-gray-100/90 py-2.5 first:pt-0 last:border-b-0 font-body"
                  >
                    {/* Header button */}
                    <button
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full text-left flex items-center justify-between text-[18px] transition-colors py-1 font-body ${isActive
                        ? "font-bold text-gray-900"
                        : "font-semibold text-gray-900 hover:text-[#0052ff]"
                        }`}
                    >
                      <span className="font-body">{tab.label}</span>
                    </button>

                    {/* Active Expanded Drawer Content */}
                    <AnimatePresence initial={false}>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                          className="overflow-hidden font-body"
                        >
                          <div className="pt-2 pb-3 flex flex-col items-start font-body">
                            <p className="text-[13px] text-gray-500 font-normal leading-[1.45] max-w-[240px] mb-4 font-body">
                              {tab.summary}
                            </p>

                            <Link to={tab.path}>
                              <button className="bg-[#0052ff] hover:bg-[#0042d4] text-white text-[13px] font-medium font-body px-4 py-2.5 rounded-lg flex items-center gap-1.5 transition-all shadow-sm group">
                                <span>{tab.buttonText}</span>
                                <span className="text-sm transition-transform group-hover:translate-x-0.5">→</span>
                              </button>
                            </Link>

                            {/* Animated Solid Black Loading / Progress Line */}
                            <div className="w-full h-[2.5px] bg-gray-200 rounded-full overflow-hidden mt-6 mb-1 relative">
                              <motion.div
                                key={animKey}
                                initial={{ width: "0%" }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 8, ease: "linear" }}
                                className="h-full bg-[#18181b] rounded-full"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT PREVIEW / WIREFRAME CONTENT                        */}
          {/* ======================================================== */}
          <div className="lg:col-span-8 flex flex-col justify-start font-body">
            <AnimatePresence mode="wait">

              {/* TAB 1: OVERVIEW (EXACT WIREFRAME REFERENCE 1) */}
              {activeTab === "overview" && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="flex flex-col font-body"
                >
                  {/* Top Header */}
                  <div className="mb-6">
                    <h3 className="text-[26px] font-bold text-gray-900 tracking-tight leading-tight font-body">
                      Overview
                    </h3>
                    <p className="text-[13.5px] text-gray-600 leading-relaxed mt-1.5 max-w-[500px] font-body">
                      Get a quick summary of your activities, projects, and updates all in one place.
                    </p>
                  </div>

                  {/* Middle Info + Hierarchy Row */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start mb-6 font-body">

                    {/* Left Info Column */}
                    <div className="md:col-span-6 flex flex-col text-left font-body">
                      <h4 className="text-[14px] font-bold text-gray-900 mb-1 font-body">
                        What is Overview?
                      </h4>
                      <p className="text-[12px] text-gray-500 leading-relaxed max-w-[270px] mb-4 font-body">
                        Your central hub to see what's happening across your projects, tasks, and teams—at a glance.
                      </p>

                      <h4 className="text-[14px] font-bold text-gray-900 mb-1.5 font-body">
                        Why it helps?
                      </h4>
                      <ul className="text-[12px] text-gray-700 space-y-1 font-body">
                        <li className="flex items-center gap-1.5">
                          <span className="text-gray-900 font-bold">•</span>
                          <span>Stay organized and focused</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-gray-900 font-bold">•</span>
                          <span>Track progress in real-time</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-gray-900 font-bold">•</span>
                          <span>Never miss important updates</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="text-gray-900 font-bold">•</span>
                          <span>Collaborate better as a team</span>
                        </li>
                      </ul>
                    </div>

                    {/* Right Team Hierarchy Diagram */}
                    <div className="md:col-span-6 flex flex-col items-center relative pt-1 font-body">
                      <div className="flex items-end justify-center gap-3 sm:gap-4 w-full">

                        {/* Member 1 (Left) */}
                        <div className="flex flex-col items-center">
                          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-xs">
                            <img
                              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
                              alt="Team Member"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="w-3.5 h-3.5 rounded-[3px] bg-[#9333ea] flex items-center justify-center text-white text-[8px] leading-none font-bold">
                              ✿
                            </span>
                            <span className="text-[11px] font-medium text-gray-700 whitespace-nowrap font-body">
                              Team Member
                            </span>
                          </div>
                        </div>

                        {/* Leader 2 (Middle - Elevated in soft blue card) */}
                        <div className="flex flex-col items-center">
                          <div className="bg-[#eef4ff] border border-blue-100 rounded-2xl p-2.5 px-3 flex flex-col items-center shadow-xs">
                            <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-xs">
                              <img
                                src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80"
                                alt="Team Leader"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex items-center gap-1 mt-1.5">
                              <span className="w-3.5 h-3.5 rounded-[3px] bg-[#059669] flex items-center justify-center text-white text-[8px] leading-none font-bold">
                                ✱
                              </span>
                              <span className="text-[11px] font-semibold text-gray-900 whitespace-nowrap font-body">
                                Team Leader
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Member 3 (Right) */}
                        <div className="flex flex-col items-center">
                          <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white shadow-xs">
                            <img
                              src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80"
                              alt="Team Member"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex items-center gap-1 mt-1.5">
                            <span className="w-3.5 h-3.5 rounded-[3px] bg-[#2563eb] flex items-center justify-center text-white text-[8px] leading-none font-bold">
                              ■
                            </span>
                            <span className="text-[11px] font-medium text-gray-700 whitespace-nowrap font-body">
                              Team Member
                            </span>
                          </div>
                        </div>

                      </div>

                      {/* Dashed Connecting Line Down to the Cards */}
                      <div className="w-[1.5px] h-9 border-l-2 border-dashed border-blue-400 mx-auto my-1"></div>
                    </div>
                  </div>

                  {/* 2x2 Metric Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 font-body">

                    {/* Card 1: Active Projects */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-gray-200 transition-all font-body">
                      <div>
                        <div className="flex items-center justify-between font-body">
                          <span className="font-semibold text-[13px] text-gray-900 font-body">
                            Active Projects
                          </span>
                          <span className="font-bold text-[20px] text-gray-900 font-body">
                            8
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 font-body">
                          Projects currently in progress
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3.5">
                        <div className="w-28 sm:w-32 h-[5px] bg-gray-100 rounded-full overflow-hidden">
                          <div className="w-[65%] h-full bg-gradient-to-r from-pink-500 via-rose-400 to-pink-200 rounded-full"></div>
                        </div>
                        <button className="bg-gray-100/90 hover:bg-gray-200 text-[10.5px] font-medium font-body text-gray-700 px-2.5 py-1 rounded-md transition-colors">
                          View all
                        </button>
                      </div>
                    </div>

                    {/* Card 2: Tasks Overview */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-gray-200 transition-all font-body">
                      <div>
                        <div className="flex items-center justify-between font-body">
                          <span className="font-semibold text-[13px] text-gray-900 font-body">
                            Tasks Overview
                          </span>
                          <span className="font-bold text-[20px] text-gray-900 font-body">
                            24
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 font-body">
                          Tasks assigned to you
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3.5">
                        <div className="w-28 sm:w-32 h-[5px] bg-gray-100 rounded-full overflow-hidden">
                          <div className="w-[70%] h-full bg-gradient-to-r from-blue-600 via-blue-400 to-blue-200 rounded-full"></div>
                        </div>
                        <button className="bg-gray-100/90 hover:bg-gray-200 text-[10.5px] font-medium font-body text-gray-700 px-2.5 py-1 rounded-md transition-colors">
                          View all
                        </button>
                      </div>
                    </div>

                    {/* Card 3: Team Members */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-gray-200 transition-all font-body">
                      <div>
                        <div className="flex items-center justify-between font-body">
                          <span className="font-semibold text-[13px] text-gray-900 font-body">
                            Team Members
                          </span>
                          <span className="font-bold text-[20px] text-gray-900 font-body">
                            12
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 font-body">
                          Members collaborating
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3.5">
                        <div className="flex -space-x-1.5 items-center">
                          <img
                            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80"
                            alt="avatar"
                            className="w-5 h-5 rounded-full border-2 border-white object-cover shadow-2xs"
                          />
                          <img
                            src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=60&auto=format&fit=crop&q=80"
                            alt="avatar"
                            className="w-5 h-5 rounded-full border-2 border-white object-cover shadow-2xs"
                          />
                          <img
                            src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=60&auto=format&fit=crop&q=80"
                            alt="avatar"
                            className="w-5 h-5 rounded-full border-2 border-white object-cover shadow-2xs"
                          />
                        </div>
                        <button className="bg-gray-100/90 hover:bg-gray-200 text-[10.5px] font-medium font-body text-gray-700 px-2.5 py-1 rounded-md transition-colors">
                          View team
                        </button>
                      </div>
                    </div>

                    {/* Card 4: Upcoming Deadlines */}
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-gray-200 transition-all font-body">
                      <div>
                        <div className="flex items-center justify-between font-body">
                          <span className="font-semibold text-[13px] text-gray-900 font-body">
                            Upcoming Deadlines
                          </span>
                          <span className="font-bold text-[20px] text-gray-900 font-body">
                            5
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5 font-body">
                          Deadlines in the next 7 days
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-3.5">
                        <div className="w-28 sm:w-32 h-[5px] bg-gray-100 rounded-full overflow-hidden">
                          <div className="w-[50%] h-full bg-gradient-to-r from-amber-500 via-orange-400 to-amber-200 rounded-full"></div>
                        </div>
                        <button className="bg-gray-100/90 hover:bg-gray-200 text-[10.5px] font-medium font-body text-gray-700 px-2.5 py-1 rounded-md transition-colors">
                          View all
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Full Width Bottom Card: Recent Activity */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-3.5 px-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between mt-3.5 hover:border-gray-200 transition-all font-body">
                    <div>
                      <h4 className="font-semibold text-[13px] text-gray-900 font-body">
                        Recent Activity
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 font-body">
                        See what your team has been working on recently.
                      </p>
                    </div>

                    <button className="bg-gray-100/90 hover:bg-gray-200 text-[10.5px] font-medium font-body text-gray-700 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap">
                      View activity
                    </button>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: PROJECTS (EXACT LAPTOP WIREFRAME REFERENCE 2) */}
              {activeTab === "projects" && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="flex flex-col font-body"
                >
                  {/* Laptop Mockup Wrapper */}
                  <div className="w-full bg-[#1e2229] rounded-t-2xl p-2 pt-2 shadow-2xl border-t border-x border-gray-700/50 flex flex-col">

                    {/* Top camera / bezel notch */}
                    <div className="w-full flex justify-center items-center py-0.5 mb-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-800 border border-gray-600"></div>
                    </div>

                    {/* Laptop Screen Content */}
                    <div className="w-full bg-white rounded-lg overflow-hidden flex border border-gray-200/80 shadow-inner min-h-[460px]">

                      {/* Left Mini App Navigation */}
                      <div className="w-[125px] sm:w-[155px] bg-[#fafafa] border-r border-gray-100 p-3 sm:p-4 flex flex-col justify-between shrink-0 font-body">
                        <div className="flex flex-col">
                          {/* App Logo */}
                          <div className="w-6 h-6 rounded-md bg-[#0052ff] flex items-center justify-center text-white mb-5 shadow-xs">
                            <span className="text-[10px] font-bold">wm</span>
                          </div>

                          {/* Mini Menu Items */}
                          <div className="flex flex-col space-y-1 text-[11px] sm:text-[12px]">
                            <button onClick={() => setActiveTab("overview")} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 text-left transition">
                              <LayoutDashboard size={13} />
                              <span>Overview</span>
                            </button>
                            <button className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-blue-50/80 text-[#0052ff] font-semibold text-left">
                              <FolderKanban size={13} />
                              <span>Projects</span>
                            </button>
                            <button onClick={() => setActiveTab("tasks")} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 text-left transition">
                              <CheckSquare size={13} />
                              <span>Tasks</span>
                            </button>
                            <button onClick={() => setActiveTab("team")} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 text-left transition">
                              <Users size={13} />
                              <span>Team</span>
                            </button>
                            <button onClick={() => setActiveTab("chat")} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 text-left transition">
                              <MessageSquare size={13} />
                              <span>Chat</span>
                            </button>
                            <button onClick={() => setActiveTab("ai-help")} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 text-left transition">
                              <Sparkles size={13} />
                              <span>AI Help</span>
                            </button>
                            <button onClick={() => setActiveTab("reports")} className="flex items-center gap-2 px-2 py-1.5 rounded-md text-gray-600 hover:bg-gray-100 text-left transition">
                              <BarChart3 size={13} />
                              <span>Reports</span>
                            </button>
                          </div>
                        </div>

                        {/* Bottom Settings */}
                        <div className="flex items-center gap-2 px-2 py-1 text-[11px] sm:text-[12px] text-gray-500 hover:text-gray-900 cursor-pointer pt-4 border-t border-gray-100">
                          <Settings size={13} />
                          <span>Settings</span>
                        </div>
                      </div>

                      {/* Right Main Screen Dashboard */}
                      <div className="flex-1 p-4 sm:p-5 flex flex-col justify-start overflow-y-auto font-body bg-white">

                        {/* Header */}
                        <div className="mb-4">
                          <h4 className="text-[17px] sm:text-[19px] font-bold text-gray-900 tracking-tight leading-none font-body">
                            Projects
                          </h4>
                          <p className="text-[11px] sm:text-[11.5px] text-gray-500 mt-1 font-body">
                            Track, manage and organize all your team deliverables with milestone roadmaps.
                          </p>
                        </div>

                        {/* Top 2 Project Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                          {/* Card 1 */}
                          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[9.5px] font-semibold bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded">
                                In Progress
                              </span>
                              <span className="text-[9.5px] text-gray-400">
                                Due in 3d
                              </span>
                            </div>
                            <h5 className="font-bold text-[12px] text-gray-900">
                              AI Study Buddy
                            </h5>
                            <p className="text-[10px] text-gray-500 leading-snug mt-0.5 mb-2.5">
                              Built an AI-powered assistant to help students learn and collaborate better.
                            </p>
                            <div className="w-full bg-gray-100 h-[3.5px] rounded-full overflow-hidden">
                              <div className="w-[68%] h-full bg-emerald-500 rounded-full"></div>
                            </div>
                          </div>

                          {/* Card 2 */}
                          <div className="bg-white border border-gray-100 rounded-xl p-3 shadow-xs">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[9.5px] font-semibold bg-blue-50 text-[#0052ff] px-1.5 py-0.5 rounded">
                                Review
                              </span>
                              <span className="text-[9.5px] text-gray-400">
                                Due in 5d
                              </span>
                            </div>
                            <h5 className="font-bold text-[12px] text-gray-900">
                              Campus Connect Portal
                            </h5>
                            <p className="text-[10px] text-gray-500 leading-snug mt-0.5 mb-2.5">
                              A centralized portal for student announcements and club updates.
                            </p>
                            <div className="w-full bg-gray-100 h-[3.5px] rounded-full overflow-hidden">
                              <div className="w-[84%] h-full bg-[#0052ff] rounded-full"></div>
                            </div>
                          </div>
                        </div>

                        {/* GitHub Repository Sync Active Bar */}
                        <div className="bg-white border border-gray-100 rounded-xl p-2.5 px-3 shadow-xs flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-6 h-6 rounded-md bg-blue-50 text-[#0052ff] flex items-center justify-center">
                              <CheckCircle2 size={13} />
                            </div>
                            <div>
                              <div className="text-[11px] font-semibold text-gray-900 leading-none">
                                GitHub Repository Sync Active
                              </div>
                              <div className="text-[9.5px] text-gray-400 mt-0.5">
                                6 open pull requests linked to active milestones
                              </div>
                            </div>
                          </div>
                          <button className="bg-white border border-gray-200 text-gray-700 text-[9.5px] font-medium px-2 py-1 rounded-md hover:bg-gray-50 transition shadow-2xs">
                            Manage Repo
                          </button>
                        </div>

                        {/* Recent Projects Section */}
                        <div>
                          <h5 className="font-bold text-[12px] text-gray-900 mb-2">
                            Recent Projects
                          </h5>

                          <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 bg-white">
                            {/* Row 1 */}
                            <div className="p-2.5 px-3 flex items-center justify-between hover:bg-gray-50/50 transition">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                                  <Calendar size={13} />
                                </div>
                                <div>
                                  <div className="text-[11.5px] font-semibold text-gray-900">
                                    Event Management System
                                  </div>
                                  <div className="text-[9.5px] text-gray-400">
                                    Manage college events and registrations
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[9.5px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                                  On Track
                                </span>
                                <span className="text-[9.5px] text-gray-400 hidden sm:inline">
                                  Due in 7d
                                </span>
                                <MoreVertical size={13} className="text-gray-400" />
                              </div>
                            </div>

                            {/* Row 2 */}
                            <div className="p-2.5 px-3 flex items-center justify-between hover:bg-gray-50/50 transition">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                  <TrendingUp size={13} />
                                </div>
                                <div>
                                  <div className="text-[11.5px] font-semibold text-gray-900">
                                    Team Collaboration App
                                  </div>
                                  <div className="text-[9.5px] text-gray-400">
                                    Real-time collaboration and file sharing
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[9.5px] text-blue-600 font-semibold bg-blue-50 px-2 py-0.5 rounded">
                                  In Review
                                </span>
                                <span className="text-[9.5px] text-gray-400 hidden sm:inline">
                                  Due in 10d
                                </span>
                                <MoreVertical size={13} className="text-gray-400" />
                              </div>
                            </div>

                            {/* Row 3 */}
                            <div className="p-2.5 px-3 flex items-center justify-between hover:bg-gray-50/50 transition">
                              <div className="flex items-center gap-2.5">
                                <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                                  <GraduationCap size={13} />
                                </div>
                                <div>
                                  <div className="text-[11.5px] font-semibold text-gray-900">
                                    Placement Tracker
                                  </div>
                                  <div className="text-[9.5px] text-gray-400">
                                    Track placement drives and student progress
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-[9.5px] text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded">
                                  Planning
                                </span>
                                <span className="text-[9.5px] text-gray-400 hidden sm:inline">
                                  Due in 2w
                                </span>
                                <MoreVertical size={13} className="text-gray-400" />
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  {/* Laptop Base Stand */}
                  <div className="w-[104%] -ml-[2%] h-3 bg-gradient-to-b from-[#2d323d] to-[#1e2229] rounded-b-xl shadow-lg border-t border-gray-700 flex justify-center">
                    <div className="w-16 h-1 bg-gray-600/50 rounded-b"></div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: TASKS */}
              {activeTab === "tasks" && (
                <motion.div
                  key="tasks"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="flex flex-col font-body"
                >
                  <div className="mb-6">
                    <h3 className="text-[26px] font-bold text-gray-900 tracking-tight font-body">Tasks Board</h3>
                    <p className="text-[13.5px] text-gray-600 mt-1.5 font-body">Agile sprint boards, task priority tags, and automated assignee updates.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                      <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-3 uppercase tracking-wider">
                        <span>To Do</span>
                        <span className="bg-gray-200 text-gray-700 px-1.5 py-0.5 rounded-full text-[10px]">3</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs mb-2">
                        <span className="text-[9px] font-bold bg-pink-100 text-pink-700 px-1.5 py-0.5 rounded">High Priority</span>
                        <h5 className="font-semibold text-xs text-gray-800 mt-1.5">Design System Tokens</h5>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs">
                        <span className="text-[9px] font-bold bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">Database</span>
                        <h5 className="font-semibold text-xs text-gray-800 mt-1.5">Schema Migration</h5>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                      <div className="flex items-center justify-between text-xs font-bold text-[#0052ff] mb-3 uppercase tracking-wider">
                        <span>In Progress</span>
                        <span className="bg-blue-100 text-[#0052ff] px-1.5 py-0.5 rounded-full text-[10px]">2</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-xs border-l-4 border-l-[#0052ff]">
                        <span className="text-[9px] font-bold bg-blue-100 text-[#0052ff] px-1.5 py-0.5 rounded">Frontend</span>
                        <h5 className="font-semibold text-xs text-gray-800 mt-1.5">Auth Flow UI & OTP</h5>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-600 mb-3 uppercase tracking-wider">
                        <span>Done</span>
                        <span className="bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-[10px]">8</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs opacity-80">
                        <span className="text-[9px] font-bold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Ready</span>
                        <h5 className="font-semibold text-xs text-gray-500 line-through mt-1.5">Project Wireframes</h5>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: TEAM */}
              {activeTab === "team" && (
                <motion.div
                  key="team"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="flex flex-col font-body"
                >
                  <div className="mb-6">
                    <h3 className="text-[26px] font-bold text-gray-900 tracking-tight font-body">Team Roster</h3>
                    <p className="text-[13.5px] text-gray-600 mt-1.5 font-body">Democratized governance, automated task assignment, and role management.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&auto=format&fit=crop&q=80" alt="Lead" className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-gray-900">Marcus Chen</h4>
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">Team Leader</span>
                        </div>
                        <p className="text-[11px] text-gray-500">Full-Stack & System Architecture</p>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-100 rounded-2xl p-3.5 shadow-sm flex items-center gap-3">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80" alt="Member" className="w-10 h-10 rounded-full object-cover" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-xs text-gray-900">Elena Rostova</h4>
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-semibold px-2 py-0.5 rounded-full">UI/UX Designer</span>
                        </div>
                        <p className="text-[11px] text-gray-500">Figma, Design Systems, Prototypes</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: CHAT */}
              {activeTab === "chat" && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="flex flex-col font-body"
                >
                  <div className="mb-6">
                    <h3 className="text-[26px] font-bold text-gray-900 tracking-tight font-body">Contextual Chat</h3>
                    <p className="text-[13.5px] text-gray-600 mt-1.5 font-body">Stay aligned with real-time conversations connected directly to tasks.</p>
                  </div>

                  <div className="bg-gray-50/70 border border-gray-100 rounded-2xl p-4 flex flex-col gap-3">
                    <div className="flex items-start gap-2.5">
                      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80" alt="" className="w-7 h-7 rounded-full object-cover" />
                      <div className="bg-white border border-gray-200 p-2.5 rounded-xl rounded-tl-none text-xs text-gray-700 shadow-xs">
                        Hey team! The database schema is ready and merged into main. 🚀
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 flex-row-reverse self-end">
                      <div className="bg-[#0052ff] text-white p-2.5 rounded-xl rounded-tr-none text-xs shadow-xs">
                        Awesome, starting the API integration right now!
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 6: AI HELP */}
              {activeTab === "ai-help" && (
                <motion.div
                  key="ai-help"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="flex flex-col font-body"
                >
                  <div className="mb-6">
                    <h3 className="text-[26px] font-bold text-gray-900 tracking-tight font-body">AI Assistant</h3>
                    <p className="text-[13.5px] text-gray-600 mt-1.5 font-body">Automate planning, split complex milestones, and debug blockers instantly.</p>
                  </div>

                  <div className="bg-white border border-blue-100 rounded-2xl p-4 shadow-sm relative">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="text-[#0052ff]" size={16} />
                      <span className="font-bold text-xs text-gray-900">WeMakeIt AI Plan Suggestion</span>
                    </div>
                    <p className="text-xs text-gray-600 bg-blue-50/50 p-3 rounded-xl border border-blue-100/50 leading-relaxed mb-3">
                      I analyzed your upcoming project deadline and recommend prioritizing the Auth API integration today. Should I create and assign subtasks to the backend team?
                    </p>
                    <div className="flex justify-end gap-2">
                      <button className="text-xs bg-[#0052ff] text-white px-3 py-1.5 rounded-lg font-medium shadow-xs hover:bg-[#0042d4]">
                        Auto-Assign Tasks
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 7: REPORTS */}
              {activeTab === "reports" && (
                <motion.div
                  key="reports"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="flex flex-col font-body"
                >
                  <div className="mb-6">
                    <h3 className="text-[26px] font-bold text-gray-900 tracking-tight font-body">Productivity & Reports</h3>
                    <p className="text-[13.5px] text-gray-600 mt-1.5 font-body">Burndown charts, sprint velocities, and deadline predictions.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="text-xs text-gray-500 font-medium">Sprint Velocity</div>
                      <div className="text-xl font-bold text-gray-900 mt-1">94.2%</div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-1">↑ +8% faster than last sprint</div>
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                      <div className="text-xs text-gray-500 font-medium">Milestone On-Time Rate</div>
                      <div className="text-xl font-bold text-gray-900 mt-1">98.5%</div>
                      <div className="text-[10px] text-blue-600 font-semibold mt-1">On track for final submission</div>
                    </div>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

        </div>
      </div>
    </section>
  );
}