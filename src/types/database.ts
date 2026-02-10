// ============================================
// DoneTogether Database Types
// ============================================

export interface User {
    id: string;
    email: string;
    full_name?: string;
    avatar_url?: string;
    has_seen_welcome?: boolean;
    role?: 'LEADER' | 'MEMBER';
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    title: string;
    team_name?: string;
    description?: string;
    domain: string;
    goal?: string;
    duration?: string;
    start_date?: string;
    end_date?: string;
    join_code: string;
    created_by?: string;
    is_active: boolean;
    expected_team_size?: number;
    is_team_complete: boolean;
    avatar_url?: string;
    created_at: string;
    updated_at: string;
}

export interface ProjectMember {
    id: string;
    project_id: string;
    user_id: string;
    role: 'owner' | 'member';
    joined_at: string;
    can_manage_tasks: boolean;
    can_invite_members: boolean;
    can_view_analytics: boolean;
    can_edit_project_details: boolean;
    can_manage_timeline: boolean;
    can_restore_tasks: boolean;
    can_manage_resources: boolean;
    can_post_messages: boolean;
}

export interface AILog {
    id: string;
    user_id: string;
    project_id?: string;
    mode: 'task_assistant' | 'progress_analyst' | 'team_mentor' | 'reflection_coach';
    prompt: string;
    response: any; // JSONB - structured AI response
    tokens_used: number;
    created_at: string;
}

export type TaskStatus = 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'deleted';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    id: string;
    project_id: string;
    title: string;
    description?: string;
    assigned_to?: string;
    assigned_by: string;
    status: TaskStatus;
    priority: TaskPriority;
    start_date?: string;
    due_date: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
}

// Extended types with relations
export interface TaskWithUser extends Task {
    assignedUser?: User;
    assignedByUser?: User;
}

export interface ProjectOverview extends Project {
    current_member_count: number;
    project_status: 'active' | 'waiting' | 'unknown';
}

// Task suggestions by domain
export const TASK_SUGGESTIONS: Record<string, string[]> = {
    'Web Development': [
        'Setup repository & environment',
        'Design landing page mockups',
        'Implement authentication system',
        'Build main dashboard',
        'Integrate backend APIs',
        'Testing & bug fixes',
        'Deployment & documentation',
    ],
    'Mobile Apps': [
        'Setup project structure',
        'Design UI/UX screens',
        'Implement navigation flow',
        'Build core features',
        'Backend integration',
        'Testing on devices',
        'App store preparation',
    ],
    'Machine Learning': [
        'Dataset collection & research',
        'Data preprocessing & cleaning',
        'Feature engineering',
        'Model architecture design',
        'Training & optimization',
        'Model evaluation & testing',
        'Report writing & presentation',
    ],
    'UI/UX Design': [
        'User research & personas',
        'Information architecture',
        'Wireframing & prototyping',
        'High-fidelity mockups',
        'Design system creation',
        'Usability testing',
        'Final handoff & documentation',
    ],
    'Data Science': [
        'Data collection & acquisition',
        'Exploratory data analysis',
        'Data cleaning & transformation',
        'Statistical analysis',
        'Visualization dashboard',
        'Insights documentation',
        'Presentation preparation',
    ],
    'Game Development': [
        'Game design document',
        'Asset creation & gathering',
        'Core gameplay mechanics',
        'Level design',
        'Sound & music integration',
        'Testing & balancing',
        'Build & publishing',
    ],
    'Blockchain': [
        'Smart contract design',
        'Contract development',
        'Security audit',
        'Frontend integration',
        'Testing on testnet',
        'Deployment to mainnet',
        'Documentation & guides',
    ],
    'IoT': [
        'Hardware component selection',
        'Circuit design & testing',
        'Firmware development',
        'Sensor integration',
        'Cloud connectivity',
        'Mobile app development',
        'Testing & documentation',
    ],
    'Other': [
        'Research & planning',
        'Design & architecture',
        'Implementation',
        'Testing & validation',
        'Documentation',
        'Presentation preparation',
    ],
};

// ============================================
// CHAT SYSTEM TYPES
// ============================================

export interface Profile {
    id: string;
    username?: string;
    display_name: string;
    avatar_url?: string;
    bio?: string;
    status: 'online' | 'offline' | 'away' | 'busy';
    last_seen?: string;
    created_at: string;
    updated_at: string;
}

export interface ChatRoom {
    id: string;
    project_id: string;
    created_at: string;
    // Computed/Joined fields
    last_message?: Message;
    unread_count?: number;
}

export interface Message {
    id: string;
    room_id: string;
    sender_id: string;
    content: string;
    media_url?: string;
    is_edited: boolean;
    is_deleted: boolean;
    reply_to_id?: string;
    created_at: string;
    // Joined fields
    sender?: Profile;
    reply_to_message?: Message;
    reactions?: any[]; // Simplified for now
    reads?: MessageRead[];
}

export interface MessageRead {
    id: string;
    message_id: string;
    user_id: string;
    read_at: string;
}

// Extended types with relations
export interface MessageWithSender extends Message {
    sender: Profile;
}

export interface ChatRoomWithDetails extends ChatRoom {
    messages?: MessageWithSender[];
}
