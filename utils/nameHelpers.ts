
export const getFirstLetter = (s: string): string => { return s.charAt(0); }

export const getInitials = (s: string): string => {
    return s.split(/\s+/).map(word => word[0].toUpperCase()).join('');
}