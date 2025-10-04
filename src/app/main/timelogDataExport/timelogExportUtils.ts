import * as XLSX from 'xlsx';

export interface TimelogExportData {
  id: number;
  activity_type: string;
  course_id?: {
    course_id: string;
    course_name: string;
  };
  trainer_id?: {
    user_id: string;
    user_name: string;
  };
  spend_time: string;
  start_time: string;
  end_time: string;
  type: string;
  impact_on_learner: string;
  activity_date: string;
  verified: boolean;
  unit?: string;
  evidence_link?: string;
}

export interface ExportFilters {
  primaryAssessor?: string;
  employer?: string;
  course?: string;
  curriculumManager?: string;
  dateFrom?: string;
  dateTo?: string;
  showOnlyOffTheJob?: boolean;
}

/**
 * Formats date for Excel export
 * @param dateString - ISO date string
 * @returns Formatted date string
 */
const formatDateForExcel = (dateString: string): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Formats time for Excel export
 * @param timeString - Time string in HH:MM format
 * @returns Formatted time string
 */
const formatTimeForExcel = (timeString: string): string => {
  if (!timeString) return '';
  return timeString;
};

/**
 * Converts duration from "H:MM" format to total minutes
 * @param duration - Duration string in "H:MM" format
 * @returns Total minutes as number
 */
const convertDurationToMinutes = (duration: string): number => {
  if (!duration) return 0;
  
  const parts = duration.split(':');
  if (parts.length !== 2) return 0;
  
  const hours = parseInt(parts[0], 10) || 0;
  const minutes = parseInt(parts[1], 10) || 0;
  
  return (hours * 60) + minutes;
};

/**
 * Filters timelog data based on export criteria
 * @param data - Array of timelog data
 * @param filters - Filter criteria
 * @returns Filtered array of timelog data
 */
const filterTimelogData = (data: TimelogExportData[], filters: ExportFilters): TimelogExportData[] => {
  return data.filter(entry => {
    // Filter by date range
    if (filters.dateFrom || filters.dateTo) {
      const entryDate = new Date(entry.activity_date);
      
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (entryDate < fromDate) return false;
      }
      
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // End of day
        if (entryDate > toDate) return false;
      }
    }

    // Filter by course
    if (filters.course && entry.course_id?.course_id !== filters.course) {
      return false;
    }

    // Filter by off-the-job records only
    if (filters.showOnlyOffTheJob && entry.type !== 'Off the job') {
      return false;
    }

    // Note: Primary Assessor, Employer, and Curriculum Manager filters would need
    // additional data relationships that aren't available in the current timelog structure
    // These would typically require additional API calls or data joins

    return true;
  });
};

/**
 * Converts timelog data to Excel format
 * @param data - Array of timelog data
 * @param filters - Applied filters for reference
 * @returns Array of objects suitable for Excel export
 */
const convertToExcelFormat = (data: TimelogExportData[], filters: ExportFilters): any[] => {
  return data.map((entry, index) => ({
    'Row Number': index + 1,
    'Activity Type': entry.activity_type || '',
    'Course Name': entry.course_id?.course_name || '',
    'Unit': entry.unit || '',
    'Trainer Name': entry.trainer_id?.user_name || '',
    'Time Spent (Hours:Minutes)': entry.spend_time || '',
    'Time Spent (Total Minutes)': convertDurationToMinutes(entry.spend_time),
    'Start Time': formatTimeForExcel(entry.start_time),
    'End Time': formatTimeForExcel(entry.end_time),
    'On/Off the Job Training': entry.type || '',
    'Activity Date': formatDateForExcel(entry.activity_date),
    'Impact on Learner': entry.impact_on_learner || '',
    'Evidence Link': entry.evidence_link || '',
    'Verified': entry.verified ? 'Yes' : 'No',
    'Verification Status': entry.verified ? 'Approved' : 'Pending',
  }));
};

/**
 * Creates Excel workbook with timelog data
 * @param data - Array of timelog data
 * @param filters - Applied filters
 * @returns Excel workbook
 */
const createExcelWorkbook = (data: TimelogExportData[], filters: ExportFilters): XLSX.WorkBook => {
  const workbook = XLSX.utils.book_new();
  
  // Convert data to Excel format
  const excelData = convertToExcelFormat(data, filters);
  
  // Create worksheet
  const worksheet = XLSX.utils.json_to_sheet(excelData);
  
  // Set column widths
  const columnWidths = [
    { wch: 12 }, // Row Number
    { wch: 25 }, // Activity Type
    { wch: 30 }, // Course Name
    { wch: 20 }, // Unit
    { wch: 20 }, // Trainer Name
    { wch: 20 }, // Time Spent (Hours:Minutes)
    { wch: 20 }, // Time Spent (Total Minutes)
    { wch: 15 }, // Start Time
    { wch: 15 }, // End Time
    { wch: 20 }, // On/Off the Job Training
    { wch: 15 }, // Activity Date
    { wch: 30 }, // Impact on Learner
    { wch: 30 }, // Evidence Link
    { wch: 10 }, // Verified
    { wch: 18 }, // Verification Status
  ];
  
  worksheet['!cols'] = columnWidths;
  
  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Timelog Data');
  
  // Create summary sheet
  const summaryData = [
    ['Export Summary', ''],
    ['Export Date', new Date().toLocaleDateString('en-GB')],
    ['Total Records', data.length],
    ['', ''],
    ['Applied Filters', ''],
    ['Primary Assessor', filters.primaryAssessor || 'All'],
    ['Employer', filters.employer || 'All'],
    ['Course', filters.course || 'All'],
    ['Curriculum Manager', filters.curriculumManager || 'All'],
    ['Date From', filters.dateFrom ? new Date(filters.dateFrom).toLocaleDateString('en-GB') : 'All'],
    ['Date To', filters.dateTo ? new Date(filters.dateTo).toLocaleDateString('en-GB') : 'All'],
    ['Off the Job Only', filters.showOnlyOffTheJob ? 'Yes' : 'No'],
  ];
  
  const summaryWorksheet = (XLSX.utils as any).aoa_to_sheet(summaryData);
  summaryWorksheet['!cols'] = [{ wch: 20 }, { wch: 30 }];
  
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, 'Export Summary');
  
  return workbook;
};

/**
 * Generates filename for export
 * @param filters - Applied filters
 * @returns Filename string
 */
const generateFilename = (filters: ExportFilters): string => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD format
  const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-'); // HH-MM-SS format
  
  let filename = `timelog_export_${dateStr}_${timeStr}`;
  
  // Add filter indicators to filename
  if (filters.dateFrom || filters.dateTo) {
    filename += '_filtered';
  }
  
  if (filters.showOnlyOffTheJob) {
    filename += '_offjob';
  }
  
  return `${filename}.xlsx`;
};

/**
 * Downloads Excel file
 * @param workbook - Excel workbook
 * @param filename - Filename for download
 */
const downloadExcelFile = (workbook: XLSX.WorkBook, filename: string): void => {
  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { 
    bookType: 'xlsx', 
    type: 'array' 
  });
  
  // Create blob
  const blob = new Blob([excelBuffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  
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
 * Main export function for timelog data to Excel
 * @param data - Array of timelog data
 * @param filters - Filter criteria
 * @returns Promise<boolean> - Success status
 */
export const exportTimelogToExcel = async (
  data: TimelogExportData[], 
  filters: ExportFilters
): Promise<boolean> => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No data available to export');
    }

    // Filter data based on criteria
    const filteredData = filterTimelogData(data, filters);
    
    if (filteredData.length === 0) {
      throw new Error('No data matches the selected filter criteria');
    }

    // Create Excel workbook
    const workbook = createExcelWorkbook(filteredData, filters);
    
    // Generate filename
    const filename = generateFilename(filters);
    
    // Download file
    downloadExcelFile(workbook, filename);
    
    return true;
  } catch (error) {
    console.error('Error exporting timelog data:', error);
    return false;
  }
};

/**
 * Validates export data and filters
 * @param data - Array of timelog data
 * @param filters - Filter criteria
 * @returns Validation result with error message if invalid
 */
export const validateExportData = (
  data: TimelogExportData[], 
  filters: ExportFilters
): { isValid: boolean; error?: string } => {
  if (!data || data.length === 0) {
    return { isValid: false, error: 'No timelog data available to export' };
  }

  if (filters.dateFrom && filters.dateTo) {
    const fromDate = new Date(filters.dateFrom);
    const toDate = new Date(filters.dateTo);
    
    if (fromDate > toDate) {
      return { isValid: false, error: 'Start date cannot be later than end date' };
    }
  }

  return { isValid: true };
};
