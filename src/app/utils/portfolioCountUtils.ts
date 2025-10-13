/**
 * Utility functions for fetching and calculating portfolio card count data
 * This file contains helper functions to get dynamic counts for portfolio cards
 */

import axios from "axios";
import jsonData from "src/url.json";


const URL_BASE_LINK = jsonData.API_LOCAL_URL;
export interface PortfolioCountData {
  evidenceTotal?: number;
  unitsTotal?: number;
  unitsCompleted?: number;
  progressPercentage?: number;
  gapsTotal?: number;
  availableUnits?: number;
  selectedUnits?: number;
  sessionsTotal?: number;
  resourcesTotal?: number;
  newDocTotal?: number;
}

/**
 * Calculate evidence library counts
 * @param learnerId - The learner's ID
 * @param courseId - The course ID
 * @returns Promise with evidence counts
 */
export const getEvidenceCounts = async (learnerId: string, courseId: string): Promise<{total: number}> => {
  try {

    let url = `${URL_BASE_LINK}/assignment/list?user_id=${learnerId}`

    const response = await axios.get(url);
    
    // Mock data for now
    return {
      total: response.data.data.length, // Total evidence required for the course
    }
  } catch (error) {
    console.error('Error fetching evidence counts:', error)
    return { total: 0 }
  }
}

/**
 * Calculate unit progress counts
 * @param courseData - Course data containing units
 * @returns Unit progress counts and percentage
 */
export const getUnitProgressCounts = (courseData: any): {total: number, completed: number, progressPercentage: number} => {
  try {
    if (!courseData?.units) {
      return { total: 0, completed: 0, progressPercentage: 0 }
    }

    const totalUnits = courseData.units.length
    const completedUnits = courseData.units.filter((unit: any) => 
      unit.status === 'completed' || unit.completion_percentage === 100
    ).length
    
    const progressPercentage = totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0

    return {
      total: totalUnits,
      completed: completedUnits,
      progressPercentage: Math.round(progressPercentage)
    }
  } catch (error) {
    console.error('Error calculating unit progress:', error)
    return { total: 0, completed: 0, progressPercentage: 0 }
  }
}

/**
 * Calculate gap analysis counts
 * @param learnerId - The learner's ID
 * @param courseId - The course ID
 * @returns Promise with gap analysis counts
 */
export const getGapAnalysisCounts = async (learnerId: string, courseId: string): Promise<{total: number}> => {
  try {

    const response = await axios.get(`${URL_BASE_LINK}/cpd/learner/list?user_id=${learnerId}`);
    
    // Mock data for now
    return {
      total: response.data.data.length, // Total gaps identified
    }
  } catch (error) {
    console.error('Error fetching gap analysis counts:', error)
    return { total: 0 }
  }
}

/**
 * Calculate learning plan session counts
 * @param learnerId - The learner's ID
 * @param courseId - The course ID
 * @returns Promise with session counts
 */
export const getSessionCounts = async (learnerId: string, courseId: string): Promise<{total: number}> => {
  try {
     const url = `${URL_BASE_LINK}/learner-plan/list?user_id=${learnerId}`

     const response = await axios.get(url);
    
    // Mock data for now
    return {
      total: response.data.data.length, // Total planned sessions
    }
  } catch (error) {
    console.error('Error fetching session counts:', error)
    return { total: 0 }
  }
}

/**
 * Calculate resource counts
 * @param learnerId - The learner's ID
 * @param courseId - The course ID
 * @returns Promise with resource counts
 */
export const getResourceCounts = async (learnerId: string, courseId: string): Promise<{total: number}> => {
  try {
    let url = `${URL_BASE_LINK}/resource/list-by-course?course_id=${courseId}&user_id=${learnerId}`;
    const response = await axios.get(url);
    
    // Mock data for now
    return {
      total: response.data.data.length, // Total resources available
    }
  } catch (error) {
    console.error('Error fetching resource counts:', error)
    return { total: 0 }
  }
}

/**
 * Get comprehensive count data for all portfolio cards
 * @param learnerId - The learner's ID
 * @param courseData - Course data
 * @returns Promise with all count data
 */
export const getAllPortfolioCounts = async (learnerId: string, courseData: any): Promise<PortfolioCountData> => {
  try {
    const courseId = courseData?.course_id || courseData?.id

    // Fetch all counts in parallel for better performance
    const [
      evidenceCounts,
      gapCounts,
      sessionCounts,
      resourceCounts
    ] = await Promise.all([
      getEvidenceCounts(learnerId, courseId),
      getGapAnalysisCounts(learnerId, courseId),
      getSessionCounts(learnerId, courseId),
      getResourceCounts(learnerId, courseId)
    ])

    const unitProgressCounts = getUnitProgressCounts(courseData)

    return {
      evidenceTotal: evidenceCounts.total,
      unitsTotal: unitProgressCounts.total,
      unitsCompleted: unitProgressCounts.completed,
      progressPercentage: unitProgressCounts.progressPercentage,
      gapsTotal: gapCounts.total,
      availableUnits: courseData?.available_units || 0, // Mock: Available units to choose from
      selectedUnits: unitProgressCounts.total, // Units selected by learner
      sessionsTotal: sessionCounts.total,
      resourcesTotal: resourceCounts.total,
      newDocTotal: 0,
    }
  } catch (error) {
    console.error('Error fetching portfolio counts:', error)
    // Return default values on error
    return {
      evidenceTotal: 0,
      unitsTotal: 0,
      unitsCompleted: 0,
      progressPercentage: 0,
      gapsTotal: 0,
      availableUnits: 0,
      selectedUnits: 0,
      sessionsTotal: 0,
      resourcesTotal: 0,
      newDocTotal: 0,
    }
  }
}

/**
 * Format count data for display
 * @param countData - The count data to format
 * @returns Formatted count data with proper labels
 */
export const formatCountDataForDisplay = (countData: PortfolioCountData) => {
  return {
    evidenceLibrary: {
      total: countData.evidenceTotal,
      label: 'Evidence Files'
    },
    unitProgress: {
      total: countData.unitsTotal,
      completed: countData.unitsCompleted,
      progress: countData.progressPercentage,
      label: 'Units'
    },
    gapAnalysis: {
      total: countData.gapsTotal,
      label: 'Gaps'
    },
    chooseUnits: {
      total: countData.availableUnits,
      selected: countData.selectedUnits,
      label: 'Units'
    },
    learningPlan: {
      total: countData.sessionsTotal,
      label: 'Sessions'
    },
    resources: {
      total: countData.resourcesTotal,
      label: 'Resources'
    }
  }
}
