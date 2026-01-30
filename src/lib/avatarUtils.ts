// Utility to generate vibrant avatar colors based on user ID
export const getAvatarColor = (userId: string): string => {
    const colors = [
        'bg-gradient-to-br from-emerald-400 to-teal-600',      // Emerald/Teal
        'bg-gradient-to-br from-blue-400 to-indigo-600',       // Blue/Indigo
        'bg-gradient-to-br from-purple-400 to-pink-600',       // Purple/Pink
        'bg-gradient-to-br from-orange-400 to-red-600',        // Orange/Red
        'bg-gradient-to-br from-amber-400 to-orange-600',      // Amber/Orange
        'bg-gradient-to-br from-cyan-400 to-blue-600',         // Cyan/Blue
        'bg-gradient-to-br from-fuchsia-400 to-purple-600',    // Fuchsia/Purple
        'bg-gradient-to-br from-rose-400 to-pink-600',         // Rose/Pink
        'bg-gradient-to-br from-lime-400 to-green-600',        // Lime/Green
        'bg-gradient-to-br from-violet-400 to-purple-600',     // Violet/Purple
    ];

    // Hash the userId to get consistent color
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        hash = userId.charCodeAt(i) + ((hash << 5) - hash);
    }

    return colors[Math.abs(hash) % colors.length];
};

// Get initials from display name
export const getInitials = (name: string): string => {
    if (!name) return '??';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
};
