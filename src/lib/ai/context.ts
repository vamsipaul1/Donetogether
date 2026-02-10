import type { Project, Task, ProjectMember } from '@/types/database';

export type AIMode = 'task_assistant' | 'progress_analyst' | 'team_mentor' | 'reflection_coach';

export interface AIContext {
    mode: AIMode;
    project: {
        name: string;
        goal: string;
        duration: string;
        team_size: number;
        start_date: string;
        end_date: string;
    };
    tasks: {
        total: number;
        done: number;
        in_progress: number;
        todo: number;
        overdue: number;
        blocked: number;
    };
    team: {
        leader: string;
        members: {
            name: string;
            role: string;
            tasks_assigned: number;
            tasks_completed: number;
            last_activity?: string;
        }[];
    };
    timeline: {
        days_elapsed: number;
        days_remaining: number;
        completion_percentage: number;
    };
}

/**
 * Builds a comprehensive context payload for AI processing
 * THIS IS THE MAGIC - Context is everything
 */
export function buildAIContext(
    mode: AIMode,
    project: Project,
    tasks: Task[],
    members: ProjectMember[]
): AIContext {
    // Task statistics
    const completedTasks = tasks.filter(t => t.status === 'completed');
    const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
    const todoTasks = tasks.filter(t => t.status === 'todo');
    const overdueTasks = tasks.filter(t =>
        t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    );

    // Timeline calculations
    const startDate = new Date(project.start_date);
    const endDate = new Date(project.end_date);
    const now = new Date();
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const completionPercentage = Math.round((completedTasks.length / tasks.length) * 100) || 0;

    // Team analysis
    const leader = members.find(m => m.role === 'owner')?.users?.full_name || 'Unknown';
    const teamMembers = members.map(m => {
        const userTasks = tasks.filter(t => t.assigned_to === m.user_id);
        const userCompleted = userTasks.filter(t => t.status === 'completed');

        return {
            name: m.users?.full_name || 'Anonymous',
            role: m.role,
            tasks_assigned: userTasks.length,
            tasks_completed: userCompleted.length,
            // last_activity could be pulled from activity logs
        };
    });

    return {
        mode,
        project: {
            name: project.title,
            goal: project.description || 'No description provided',
            duration: `${project.start_date} to ${project.end_date}`,
            team_size: members.length,
            start_date: project.start_date,
            end_date: project.end_date
        },
        tasks: {
            total: tasks.length,
            done: completedTasks.length,
            in_progress: inProgressTasks.length,
            todo: todoTasks.length,
            overdue: overdueTasks.length,
            blocked: 0 // Add blocked status if you have it
        },
        team: {
            leader,
            members: teamMembers
        },
        timeline: {
            days_elapsed: Math.max(0, daysElapsed),
            days_remaining: Math.max(0, daysRemaining),
            completion_percentage: completionPercentage
        }
    };
}

/**
 * AI Mode Definitions
 * Each mode has specific prompts and response formats
 */
export const AI_MODES = {
    task_assistant: {
        name: 'Task Assistant',
        description: 'Break down goals into actionable tasks',
        icon: 'Target',
        systemPrompt: `You are a project planning assistant for student teams.
Your job is to help break down project goals into clear, realistic tasks.
- Suggest 3-6 major tasks based on the project goal
- Consider the timeline and team size
- Prioritize tasks (high/medium/low)
- Identify dependencies
- Be specific and actionable
- Do NOT suggest coding solutions, only task structure
Output format: JSON with "tasks" array containing {title, description, priority, estimatedDays}`,
    },
    progress_analyst: {
        name: 'Progress Analyst',
        description: 'Analyze project health and identify risks',
        icon: 'TrendingUp',
        systemPrompt: `You are a project health analyst for student teams.
Your job is to evaluate progress and identify risks.
- Calculate a health score (0-100)
- Identify specific bottlenecks
- Highlight overdue tasks
- Compare progress to timeline
- Suggest concrete next steps
- Be encouraging but honest
Output format: JSON with {score, status, insights[], recommendations[]}`,
    },
    team_mentor: {
        name: 'Team Mentor',
        description: 'Balance workload and improve collaboration',
        icon: 'Users',
        systemPrompt: `You are a team dynamics advisor for student teams.
Your job is to analyze workload distribution and collaboration.
- Identify workload imbalances
- Suggest task reassignments
- Highlight inactive members (tactfully)
- Recommend collaboration improvements
- Be supportive, never blaming
Output format: JSON with {insights[], actions[]}`,
    },
    reflection_coach: {
        name: 'Reflection Coach',
        description: 'Facilitate retrospectives and learning',
        icon: 'Lightbulb',
        systemPrompt: `You are a reflection facilitator for student teams.
Your job is to guide meaningful project retrospectives.
- Ask 3-5 reflection questions
- Analyze past performance
- Identify learning opportunities
- Suggest improvements for next iteration
- Focus on growth mindset
Output format: JSON with {questions[], insights[], improvements[]}`,
    }
};

/**
 * Generates the final prompt combining system + context
 */
export function generatePrompt(mode: AIMode, context: AIContext, userPrompt?: string): string {
    const modeConfig = AI_MODES[mode];

    const contextString = `
PROJECT CONTEXT:
- Name: ${context.project.name}
- Goal: ${context.project.goal}
- Duration: ${context.project.duration}
- Team Size: ${context.project.team_size}

PROGRESS:
- Tasks Completed: ${context.tasks.done}/${context.tasks.total} (${context.timeline.completion_percentage}%)
- In Progress: ${context.tasks.in_progress}
- Overdue: ${context.tasks.overdue}
- Days Remaining: ${context.timeline.days_remaining}

TEAM:
- Leader: ${context.team.leader}
${context.team.members.map(m => `- ${m.name} (${m.role}): ${m.tasks_completed}/${m.tasks_assigned} tasks done`).join('\n')}
`;

    const finalPrompt = userPrompt
        ? `${modeConfig.systemPrompt}\n\n${contextString}\n\nUSER REQUEST: ${userPrompt}`
        : `${modeConfig.systemPrompt}\n\n${contextString}`;

    return finalPrompt;
}

/**
 * Token counter (approximate)
 * Keep context under 1000 tokens for cost control
 */
export function estimateTokens(text: string): number {
    // Rough estimate: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
}
