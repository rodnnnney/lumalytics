export function formatDateTime(isoString: string): string {
    const date = new Date(isoString);

    // Options for formatting
    const options: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short', // e.g., Apr
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true, // Optional: AM/PM
    };

    return date.toLocaleString(undefined, options);
}
