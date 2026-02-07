/**
 * Formats a timestamp into a human-readable time string.
 *
 * @param {string | number | Date} timestamp - The timestamp to format
 * @returns {string} Formatted time string (e.g., "02:30 PM")
 */
export const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Formats a timestamp into a relative time string (e.g., "2 minutes ago").
 *
 * @param {string | number | Date} timestamp - The timestamp to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} ${mins === 1 ? "minute" : "minutes"} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  }

  const days = Math.floor(diffInSeconds / 86400);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

/**
 * Truncates a string to a given max length, appending "..." if truncated.
 *
 * @param {string} str - The string to truncate
 * @param {number} maxLength - Maximum character length
 * @returns {string} Truncated string
 */
export const truncateText = (str, maxLength = 30) => {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength).trimEnd() + "...";
};

/**
 * Generates initials from a username or display name.
 *
 * @param {string} name - The name to extract initials from
 * @returns {string} Uppercase initials (1-2 characters)
 */
export const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};
