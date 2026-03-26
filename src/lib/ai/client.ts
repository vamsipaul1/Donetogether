import { supabase } from '@/lib/supabase';
import type { AIContext, AIMode } from './context';

export interface AIResponse {
    success: boolean;
    response?: any;
    error?: string;
    mode?: AIMode;
}

/**
 * Calls the Supabase Edge Function for AI processing
 * NEVER call AI APIs directly - always use Edge Functions for security
 */
export async function callAI(
    mode: AIMode,
    context: AIContext,
    prompt?: string
): Promise<AIResponse> {
    try {
        // Get current session for authentication
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return {
                success: false,
                error: 'Please sign in to use AI features'
            };
        }

        // Call Supabase Edge Function
        const { data, error } = await supabase.functions.invoke('ai-assistant', {
            body: {
                mode,
                context,
                prompt
            }
        });

        if (error) {
            console.error('AI Edge Function Error:', error);
            return {
                success: false,
                error: 'AI service temporarily unavailable'
            };
        }

        // Parse AI response
        const parsed = typeof data.response === 'string'
            ? tryParseJSON(data.response)
            : data.response;

        return {
            success: true,
            response: parsed,
            mode: data.mode
        };

    } catch (error) {
        console.error('AI Call Error:', error);
        return {
            success: false,
            error: 'Failed to connect to AI service'
        };
    }
}

/**
 * Try to parse JSON response, fallback to string
 */
function tryParseJSON(text: string): any {
    try {
        // Remove markdown code blocks if present
        const cleaned = text.replace(/```json\n?|\n?```/g, '');
        return JSON.parse(cleaned);
    } catch {
        return { text };
    }
}

/**
 * Client-side rate limiting
 * Prevents excessive API calls
 */
const AI_RATE_LIMIT = 10; // requests per hour
const aiCallLog: number[] = [];

export function checkRateLimit(): boolean {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    // Remove old entries
    while (aiCallLog.length > 0 && aiCallLog[0] < oneHourAgo) {
        aiCallLog.shift();
    }

    // Check limit
    if (aiCallLog.length >= AI_RATE_LIMIT) {
        return false;
    }

    // Log this call
    aiCallLog.push(now);
    return true;
}

/**
 * Mock AI for development/testing
 * Remove in production
 */
export async function mockAI(mode: AIMode, context: AIContext): Promise<AIResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));

    switch (mode) {
        case 'task_assistant':
            return {
                success: true,
                response: {
                    tasks: [
                        {
                            title: 'Setup Project Infrastructure',
                            description: 'Initialize database, authentication, and hosting',
                            priority: 'high',
                            estimated_days: 3
                        },
                        {
                            title: 'Build Core Features',
                            description: 'Implement task management and team collaboration',
                            priority: 'high',
                            estimated_days: 14
                        },
                        {
                            title: 'Design UI/UX',
                            description: 'Create wireframes and implement responsive design',
                            priority: 'medium',
                            estimated_days: 7
                        },
                        {
                            title: 'Testing & Deployment',
                            description: 'QA testing, bug fixes, and production deploy',
                            priority: 'medium',
                            estimated_days: 5
                        }
                    ],
                    insights: [
                        `Based on your ${context.timeline.days_remaining}-day timeline, this is achievable`,
                        `Your team of ${context.project.team_size} should distribute tasks evenly`,
                        'Focus on high-priority items first for MVP'
                    ]
                },
                mode
            };

        case 'progress_analyst':
            const healthScore = Math.round(
                (context.tasks.done / context.tasks.total) * 100 *
                (context.timeline.days_remaining / (context.timeline.days_elapsed + context.timeline.days_remaining))
            ) || 0;

            return {
                success: true,
                response: {
                    score: Math.min(100, Math.max(0, healthScore)),
                    status: healthScore > 70 ? 'On Track' : healthScore > 40 ? 'At Risk' : 'Behind Schedule',
                    insights: [
                        `${context.tasks.done}/${context.tasks.total} tasks completed (${context.timeline.completion_percentage}%)`,
                        `${context.tasks.overdue} tasks are overdue and need attention`,
                        `${context.timeline.days_remaining} days remaining until deadline`,
                        context.tasks.in_progress > 0
                            ? `${context.tasks.in_progress} tasks in active development`
                            : 'No tasks currently in progress - assign work to team'
                    ],
                    recommendations: [
                        context.tasks.overdue > 0
                            ? 'Focus on completing overdue high-priority tasks immediately'
                            : 'Maintain current pace to stay on schedule',
                        context.tasks.in_progress === 0
                            ? 'Assign tasks to team members to maintain momentum'
                            : 'Support team with any blockers on in-progress tasks',
                        `With ${context.timeline.days_remaining} days left, ${context.tasks.todo} tasks need to be started soon`
                    ]
                },
                mode
            };

        case 'team_mentor':
            const avgTasksPerMember = context.tasks.total / context.project.team_size;
            const workloadImbalance = context.team.members.some(m =>
                m.tasks_assigned > avgTasksPerMember * 1.5 || m.tasks_assigned < avgTasksPerMember * 0.5
            );

            return {
                success: true,
                response: {
                    insights: [
                        `Team size: ${context.project.team_size} members`,
                        workloadImbalance
                            ? 'Workload distribution is uneven - some members have significantly more tasks'
                            : 'Workload is relatively balanced across the team',
                        `Average: ${avgTasksPerMember.toFixed(1)} tasks per member`,
                        context.team.members.filter(m => m.tasks_completed === 0).length > 0
                            ? 'Some team members have not completed any tasks yet'
                            : 'All team members are contributing to progress'
                    ],
                    actions: context.team.members.map(m => {
                        if (m.tasks_assigned > avgTasksPerMember * 1.5) {
                            return {
                                type: 'redistribute',
                                label: `Consider redistributing tasks from ${m.name}`,
                                member: m.name,
                                reason: 'Overloaded'
                            };
                        }
                        if (m.tasks_assigned < avgTasksPerMember * 0.5 && context.tasks.todo > 0) {
                            return {
                                type: 'assign',
                                label: `Assign more tasks to ${m.name}`,
                                member: m.name,
                                reason: 'Underutilized'
                            };
                        }
                        return null;
                    }).filter(Boolean)
                },
                mode
            };

        case 'reflection_coach':
            return {
                success: true,
                response: {
                    questions: [
                        'What went well this week?',
                        'What challenges did you face?',
                        'What would you do differently next time?',
                        'How can the team improve collaboration?',
                        'What did you learn from this project?'
                    ],
                    insights: [
                        `Completed ${context.tasks.done} tasks so far - great progress!`,
                        `Team has ${context.timeline.days_remaining} days to finish remaining work`,
                        'Regular reflections lead to better team performance'
                    ],
                    improvements: [
                        'Document what you learned for future projects',
                        'Share reflections with team for group learning',
                        'Use insights to plan the next sprint better'
                    ]
                },
                mode
            };

        default:
            return {
                success: false,
                error: 'Unknown AI mode'
            };
    }
}
