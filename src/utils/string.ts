import { rankItem } from '@tanstack/match-sorter-utils'
export const ensurePrefix = (str, prefix) => (str.startsWith(prefix) ? str : `${prefix}${str}`)
export const withoutSuffix = (str, suffix) => (str.endsWith(suffix) ? str.slice(0, -suffix.length) : str)
export const withoutPrefix = (str, prefix) => (str.startsWith(prefix) ? str.slice(prefix.length) : str)
export function maskEmail(email) {
 if (!email || !email.includes('@')) {
  return email
 }
 const [local, domain] = email.split('@')
 if (local.length <= 2) {
  return '*'.repeat(local.length) + '@' + domain
 }
 const start = local.slice(0, 2)
 const end = local.slice(-2)
 const masked = local.length > 15 ? '*****' : '*'.repeat(Math.max(local.length - 4, 1)) // Fallback for short local parts
 return `${start}${masked}${end}@${domain}`
}
export function getErrorMessage(error) {
 if (error instanceof Error) {
  return error.message
 }
 if (error && typeof error === 'object' && 'message' in error) {
  return String(error.message)
 }
 if (typeof error === 'string') {
  return error
 }
 return 'Something went wrong'
}
export function capitalizeFirstLetter(string) {
 if (typeof string === 'string' && string.length > 0) {
  return string.charAt(0).toUpperCase() + string.slice(1)
 }
 return '' // Or return a default value if the string is invalid
}
export const fuzzyFilter = (row, columnId, value, addMeta) => {
 // Rank the item
 const itemRank = rankItem(row.getValue(columnId), value)
 // Store the itemRank info
 addMeta({
  itemRank
 })
 // Return if the item should be filtered in/out
 return itemRank.passed
}
export const getInitials = (first_name, last_name) => {
 const firstInitial = first_name ? first_name[0] : ''
 if (last_name) {
  return `${firstInitial}${last_name[0]}`.toUpperCase()
 }
 return firstInitial.toUpperCase()
}

export function formatSessionTime(startDate: string, duration: string): string {
  const start = new Date(startDate);

  // Convert duration string to number of minutes
  const durationInMinutes = parseInt(duration, 10);
  const end = new Date(start.getTime() + durationInMinutes * 60000);

  const formatOptions: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  };
  const dateString = start.toLocaleDateString('en-GB', formatOptions);

  const formatTime = (date: Date): string => {
    let hrs = date.getHours();
    const mins = date.getMinutes().toString().padStart(2, '0');
    const ampm = hrs >= 12 ? 'PM' : 'AM';
    hrs = hrs % 12 || 12;
    return `${hrs}:${mins} ${ampm}`;
  };

  return `${dateString}, ${formatTime(start)} - ${formatTime(end)}`;
}
