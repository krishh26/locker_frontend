/**
 * Utility functions for CSV export functionality
 */

export interface FeedbackData {
  id: number;
  feedback: string | null;
  learner: {
    id: number;
    first_name: string;
    last_name: string;
    user_name: string;
  };
}

export interface ResourceWithFeedbacks {
  id: string;
  location: string;
  resource_name: string;
  isActive: boolean;
  createdAt: string;
  createdByName: string;
  feedbacks?: FeedbackData[];
}

/**
 * Converts feedback data to CSV format
 * @param resources - Array of resources with feedback data
 * @returns CSV string
 */
export const exportFeedbacksToCSV = (resources: ResourceWithFeedbacks[]): string => {
  // CSV headers
  const headers = ['Resource Name', 'First Name', 'Last Name', 'Feedback'];
  
  // Extract all feedbacks from all resources
  const allFeedbacks: Array<{
    resourceName: string;
    firstName: string;
    lastName: string;
    feedback: string;
  }> = [];

  resources.forEach(resource => {
    if (resource.feedbacks && resource.feedbacks.length > 0) {
      resource.feedbacks.forEach(feedback => {
        allFeedbacks.push({
          resourceName: resource.resource_name,
          firstName: feedback.learner.first_name,
          lastName: feedback.learner.last_name,
          feedback: feedback.feedback || '', // Handle null feedback
        });
      });
    }
  });

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...allFeedbacks.map(feedback => [
      `"${feedback.resourceName}"`,
      `"${feedback.firstName}"`,
      `"${feedback.lastName}"`,
      `"${feedback.feedback}"`
    ].join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Downloads CSV content as a file
 * @param csvContent - CSV string content
 * @param filename - Name of the file to download
 */
export const downloadCSV = (csvContent: string, filename: string = 'wellbeing_feedbacks.csv'): void => {
  // Create blob with CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create download link
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Trigger download
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Generates filename with current date
 * @param prefix - Prefix for the filename
 * @returns Formatted filename
 */
export const generateFilename = (prefix: string = 'wellbeing_feedbacks'): string => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
  
  return `${prefix}_${dateStr}_${timeStr}.csv`;
};
