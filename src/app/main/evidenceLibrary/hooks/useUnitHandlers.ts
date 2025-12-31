import { useCallback } from 'react'
import { Unit } from '../lib/types'

interface UseUnitHandlersProps {
  units: Unit[]
  setValue: (name: 'units', value: Unit[], options?: any) => void
  trigger: (name?: 'units') => Promise<boolean>
}

/**
 * Custom hook for handling unit/subunit field updates
 * Consolidates all unit-related handlers to reduce code duplication
 */
export const useUnitHandlers = ({
  units,
  setValue,
  trigger,
}: UseUnitHandlersProps) => {

  /**
   * Toggle learnerMap for a unit/subunit (row-based handler)
   */
  const toggleLearnerMap = useCallback(
    (row: any) => {
      const updated = [...units]
      updated.forEach((unit) => {
        // Handle units with subUnit
        if (unit.subUnit && unit.subUnit.length > 0) {
          unit.subUnit.forEach((sub) => {
            if (sub.id === row.id) {
              sub.learnerMap = !(sub.learnerMap ?? false)
            }
          })
        } else {
          // Handle units without subUnit (unit-level)
          if (unit.id === row.id) {
            unit.learnerMap = !(unit.learnerMap ?? false)
          }
        }
      })
      setValue('units', updated)
      trigger('units')
    },
    [units, setValue, trigger]
  )

  /**
   * Toggle trainerMap for a unit/subunit (row-based handler)
   */
  const toggleTrainerMap = useCallback(
    (row: any) => {
      const updated = [...units]
      updated.forEach((unit) => {
        // Handle units with subUnit
        if (unit.subUnit && unit.subUnit.length > 0) {
          unit.subUnit.forEach((sub) => {
            if (sub.id === row.id) {
              sub.trainerMap = !(sub.trainerMap ?? false)
              // Reset signedOff if trainerMap is unchecked
              if (!sub.trainerMap) {
                sub.signedOff = false
              }
            }
          })
        } else {
          // Handle units without subUnit (unit-level)
          if (unit.id === row.id) {
            unit.trainerMap = !(unit.trainerMap ?? false)
            // Reset signedOff if trainerMap is unchecked
            if (!unit.trainerMap) {
              unit.signedOff = false
            }
          }
        }
      })
      setValue('units', updated)
    },
    [units, setValue]
  )

  /**
   * Toggle signedOff for a unit/subunit (row-based handler)
   */
  const toggleSignedOff = useCallback(
    (row: any) => {
      const updated = [...units]
      updated.forEach((unit) => {
        // Handle units with subUnit
        if (unit.subUnit && unit.subUnit.length > 0) {
          unit.subUnit.forEach((sub) => {
            if (sub.id === row.id) {
              sub.signedOff = !(sub.signedOff ?? false)
            }
          })
        } else {
          // Handle units without subUnit (unit-level)
          if (unit.id === row.id) {
            unit.signedOff = !(unit.signedOff ?? false)
          }
        }
      })
      setValue('units', updated)
      trigger('units')
    },
    [units, setValue, trigger]
  )

  /**
   * Update comment for a unit/subunit (event-based handler)
   */
  const updateComment = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, id: number | string) => {
      const updated = [...units]
      updated.forEach((unit) => {
        // Handle units with subUnit
        if (unit.subUnit && unit.subUnit.length > 0) {
          unit.subUnit.forEach((sub) => {
            if (sub.id === id) {
              sub.comment = e.target.value
            }
          })
        } else {
          // Handle units without subUnit (unit-level)
          if (unit.id === id) {
            unit.comment = e.target.value
          }
        }
      })
      setValue('units', updated)
    },
    [units, setValue]
  )

  /**
   * Select all learnerMap for a unit's subunits
   */
  const selectAllLearnerMap = useCallback(
    (unitIndex: number, checked: boolean) => {
      const updated = [...units]
      const unit = updated[unitIndex]
      if (unit) {
        if (unit.subUnit && unit.subUnit.length > 0) {
          unit.subUnit.forEach((sub) => {
            sub.learnerMap = checked
          })
        } else {
          unit.learnerMap = checked
        }
      }
      setValue('units', updated)
      trigger('units')
    },
    [units, setValue, trigger]
  )

  /**
   * Select all signedOff for a unit's eligible items (both learnerMap and trainerMap must be true)
   */
  const selectAllSignedOff = useCallback(
    (unitIndex: number, checked: boolean) => {
      const updated = [...units]
      const unit = updated[unitIndex]
      if (!unit) return

      // First, determine current state from units to handle toggle correctly
      let allCurrentlySignedOff = false

      if (unit.subUnit && unit.subUnit.length > 0) {
        const eligibleItems = unit.subUnit.filter(
          (sub) => (sub.learnerMap ?? false) && (sub.trainerMap ?? false)
        )
        allCurrentlySignedOff =
          eligibleItems.length > 0 &&
          eligibleItems.every((sub) => sub.signedOff ?? false)
      } else {
        if ((unit.learnerMap ?? false) && (unit.trainerMap ?? false)) {
          allCurrentlySignedOff = unit.signedOff ?? false
        }
      }

      // Determine target state: if all are signed off, uncheck; otherwise, check
      const targetState = allCurrentlySignedOff ? false : true

      // Apply the target state
      if (unit.subUnit && unit.subUnit.length > 0) {
        unit.subUnit.forEach((sub) => {
          // Only process items that have both learnerMap and trainerMap checked
          if ((sub.learnerMap ?? false) && (sub.trainerMap ?? false)) {
            sub.signedOff = targetState
          }
        })
      } else {
        // Handle units without subUnit (unit-level)
        if ((unit.learnerMap ?? false) && (unit.trainerMap ?? false)) {
          unit.signedOff = targetState
        }
      }
      setValue('units', updated)
      trigger('units')
    },
    [units, setValue, trigger]
  )

  /**
   * Select all signedOff for combined subunits (used in combined table view)
   */
  const selectAllSignedOffForCombined = useCallback(
    (combinedSubUnits: any[], checked: boolean) => {
      const updated = [...units]

      // Get all eligible items from the current state
      const eligibleItems: Array<{ unit: Unit; usub?: any; isSubUnit: boolean }> = []

      combinedSubUnits.forEach((sub) => {
        const unit = updated.find((u) => u.id === sub.unitId)
        if (!unit) return

        if (unit.subUnit && unit.subUnit.length > 0) {
          const usub = unit.subUnit.find((u) => u.id === sub.id)
          if (usub && (usub.learnerMap ?? false) && (usub.trainerMap ?? false)) {
            eligibleItems.push({ unit, usub, isSubUnit: true })
          }
        } else {
          if ((unit.learnerMap ?? false) && (unit.trainerMap ?? false)) {
            eligibleItems.push({ unit, isSubUnit: false })
          }
        }
      })

      // Check current state: are all eligible items signed off?
      const allCurrentlySignedOff =
        eligibleItems.length > 0 &&
        eligibleItems.every((item) => {
          if (item.isSubUnit) {
            return item.usub?.signedOff ?? false
          } else {
            return item.unit.signedOff ?? false
          }
        })

      // Determine the target state: if all are signed off, uncheck; otherwise, check
      const targetState = allCurrentlySignedOff ? false : true

      // Apply the target state to all eligible items
      eligibleItems.forEach((item) => {
        if (item.isSubUnit) {
          item.usub!.signedOff = targetState
        } else {
          item.unit.signedOff = targetState
        }
      })

      setValue('units', updated)
      trigger('units')
    },
    [units, setValue, trigger]
  )

  return {
    learnerMapHandler: toggleLearnerMap,
    trainerMapHandler: toggleTrainerMap,
    signedOffHandler: toggleSignedOff,
    commentHandler: updateComment,
    selectAllLearnerMapHandler: selectAllLearnerMap,
    selectAllSignedOffHandler: selectAllSignedOff,
    selectAllSignedOffForCombinedHandler: selectAllSignedOffForCombined,
  }
}

