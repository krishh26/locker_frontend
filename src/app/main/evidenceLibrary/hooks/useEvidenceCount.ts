import { useCallback } from 'react'
import { Unit } from '../lib/types'

interface UseEvidenceCountProps {
  learner: any
  selectedCourses: any[]
}

/**
 * Custom hook to get evidence count for units/subunits from learner data
 * 
 * @param learner - Learner data from Redux store containing course and unit information
 * @param selectedCourses - Array of selected courses from the form
 * @returns Function to get evidence count for a specific unit/subunit
 */
export const useEvidenceCount = ({ learner, selectedCourses }: UseEvidenceCountProps) => {
  const getEvidenceCount = useCallback(
    (
      courseId: number | string,
      unitId: number | string,
      subunitId?: number | string
    ): number => {
      if (!learner?.course || !selectedCourses || selectedCourses.length === 0) {
        return 0
      }

      // Find the selected course in learner data - match the same structure as learnerCoursesData
      const selectedCourseIds = selectedCourses.map((c: any) => c.course_id)
      const learnerCourseItem = learner.course.find((courseItem: any) => {
        // Handle nested course structure (same as learnerCoursesData processing)
        const course = courseItem.course || courseItem
        return (
          selectedCourseIds.includes(course.course_id) &&
          String(course.course_id) === String(courseId)
        )
      })

      if (!learnerCourseItem) {
        return 0
      }

      // Handle nested course structure
      const course = learnerCourseItem.course || learnerCourseItem
      // Ensure units are included from either course or courseItem (same as learnerCoursesData)
      const units = course.units || learnerCourseItem.units || []

      // Find the unit - match by id, code, or unit_ref
      const unit = units.find(
        (u: any) =>
          String(u.id) === String(unitId) ||
          String(u.code) === String(unitId) ||
          String(u.unit_ref) === String(unitId)
      )
      if (!unit) {
        return 0
      }

      // If subunitId is provided, find the subunit and return its evidenceBoxes count
      if (subunitId !== undefined && subunitId !== null) {
        const subUnits = unit.subUnit || []
        const subUnit = subUnits.find(
          (s: any) =>
            String(s.id) === String(subunitId) || String(s.code) === String(subunitId)
        )
        if (subUnit && subUnit.evidenceBoxes && Array.isArray(subUnit.evidenceBoxes)) {
          return subUnit.evidenceBoxes.length
        }
        return 0
      }

      // For unit-level (no subunit), return unit's evidenceBoxes count
      if (unit.evidenceBoxes && Array.isArray(unit.evidenceBoxes)) {
        return unit.evidenceBoxes.length
      }

      return 0
    },
    [learner, selectedCourses]
  )

  return { getEvidenceCount }
}

