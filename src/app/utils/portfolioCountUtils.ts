/**
 * Utility functions for fetching and calculating portfolio card count data
 * This file contains helper functions to get dynamic counts for portfolio cards
 */

export interface PortfolioCountData {
  evidenceTotal: number;
  evidenceUploaded: number;
  unitsTotal: number;
  unitsCompleted: number;
  progressPercentage: number;
  gapsTotal: number;
  gapsResolved: number;
  availableUnits: number;
  selectedUnits: number;
  sessionsTotal: number;
  sessionsCompleted: number;
  resourcesTotal: number;
  resourcesAccessed: number;
}

/**
 * Calculate evidence library counts
 * @param learnerId - The learner's ID
 * @param courseId - The course ID
 * @returns Promise with evidence counts
 */
export const getEvidenceCounts = async (learnerId: string, courseId: string): Promise<{total: number, uploaded: number}> => {
  try {
    // TODO: Replace with actual API calls
    // const response = await fetch(`/api/evidence/counts?learnerId=${learnerId}&courseId=${courseId}`)
    // const data = await response.json()
    
    // Mock data for now
    return {
      total: 12, // Total evidence required for the course
      uploaded: 8, // Evidence uploaded by the learner
    }
  } catch (error) {
    console.error('Error fetching evidence counts:', error)
    return { total: 0, uploaded: 0 }
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
export const getGapAnalysisCounts = async (learnerId: string, courseId: string): Promise<{total: number, resolved: number}> => {
  try {
    // TODO: Replace with actual API calls
    // const response = await fetch(`/api/gap-analysis/counts?learnerId=${learnerId}&courseId=${courseId}`)
    // const data = await response.json()
    
    // Mock data for now
    return {
      total: 5, // Total gaps identified
      resolved: 3, // Gaps that have been resolved
    }
  } catch (error) {
    console.error('Error fetching gap analysis counts:', error)
    return { total: 0, resolved: 0 }
  }
}

/**
 * Calculate learning plan session counts
 * @param learnerId - The learner's ID
 * @param courseId - The course ID
 * @returns Promise with session counts
 */
export const getSessionCounts = async (learnerId: string, courseId: string): Promise<{total: number, completed: number}> => {
  try {
    // TODO: Replace with actual API calls
    // const response = await fetch(`/api/sessions/counts?learnerId=${learnerId}&courseId=${courseId}`)
    // const data = await response.json()
    
    // Mock data for now
    return {
      total: 20, // Total planned sessions
      completed: 12, // Completed sessions
    }
  } catch (error) {
    console.error('Error fetching session counts:', error)
    return { total: 0, completed: 0 }
  }
}

/**
 * Calculate resource counts
 * @param learnerId - The learner's ID
 * @param courseId - The course ID
 * @returns Promise with resource counts
 */
export const getResourceCounts = async (learnerId: string, courseId: string): Promise<{total: number, accessed: number}> => {
  try {
    // TODO: Replace with actual API calls
    // const response = await fetch(`/api/resources/counts?learnerId=${learnerId}&courseId=${courseId}`)
    // const data = await response.json()
    
    // Mock data for now
    return {
      total: 25, // Total resources available
      accessed: 18, // Resources accessed by the learner
    }
  } catch (error) {
    console.error('Error fetching resource counts:', error)
    return { total: 0, accessed: 0 }
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
      evidenceUploaded: evidenceCounts.uploaded,
      unitsTotal: unitProgressCounts.total,
      unitsCompleted: unitProgressCounts.completed,
      progressPercentage: unitProgressCounts.progressPercentage,
      gapsTotal: gapCounts.total,
      gapsResolved: gapCounts.resolved,
      availableUnits: courseData?.available_units || 15, // Mock: Available units to choose from
      selectedUnits: unitProgressCounts.total, // Units selected by learner
      sessionsTotal: sessionCounts.total,
      sessionsCompleted: sessionCounts.completed,
      resourcesTotal: resourceCounts.total,
      resourcesAccessed: resourceCounts.accessed,
    }
  } catch (error) {
    console.error('Error fetching portfolio counts:', error)
    // Return default values on error
    return {
      evidenceTotal: 0,
      evidenceUploaded: 0,
      unitsTotal: 0,
      unitsCompleted: 0,
      progressPercentage: 0,
      gapsTotal: 0,
      gapsResolved: 0,
      availableUnits: 0,
      selectedUnits: 0,
      sessionsTotal: 0,
      sessionsCompleted: 0,
      resourcesTotal: 0,
      resourcesAccessed: 0,
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
      uploaded: countData.evidenceUploaded,
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
      resolved: countData.gapsResolved,
      label: 'Gaps'
    },
    chooseUnits: {
      total: countData.availableUnits,
      selected: countData.selectedUnits,
      label: 'Units'
    },
    learningPlan: {
      total: countData.sessionsTotal,
      completed: countData.sessionsCompleted,
      label: 'Sessions'
    },
    resources: {
      total: countData.resourcesTotal,
      accessed: countData.resourcesAccessed,
      label: 'Resources'
    }
  }
}
