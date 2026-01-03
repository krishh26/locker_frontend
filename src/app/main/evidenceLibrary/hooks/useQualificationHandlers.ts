import { useCallback } from 'react'
import { Unit } from '../lib/types'

interface UseQualificationHandlersProps {
  units: Unit[]
  setValue: (name: 'units', value: Unit[], options?: any) => void
  trigger: (name?: 'units') => Promise<boolean>
}

/**
 * Custom hook for handling qualification course topic updates
 * Qualification courses have: Unit → Learning Outcomes (subUnit) → Assessment Criteria (topics)
 * Only topics are mappable (learnerMap/trainerMap/signedOff)
 */
export const useQualificationHandlers = ({
  units,
  setValue,
  trigger,
}: UseQualificationHandlersProps) => {

  /**
   * Toggle learnerMap for a topic
   */
  const toggleLearnerMap = useCallback(
    (topic: any, unitId: string | number, subUnitId: string | number) => {
      const updated = [...units]
      updated.forEach((unit) => {
        if (String(unit.id) === String(unitId)) {
          if (unit.subUnit && unit.subUnit.length > 0) {
            unit.subUnit.forEach((subUnit) => {
              if (String(subUnit.id) === String(subUnitId)) {
                if (subUnit.topics && subUnit.topics.length > 0) {
                  subUnit.topics.forEach((topicItem) => {
                    if (String(topicItem.id) === String(topic.id)) {
                      topicItem.learnerMap = !(topicItem.learnerMap ?? false)
                    }
                  })
                }
              }
            })
          }
        }
      })
      setValue('units', updated)
      trigger('units')
    },
    [units, setValue, trigger]
  )

  /**
   * Toggle trainerMap for a topic
   */
  const toggleTrainerMap = useCallback(
    (topic: any, unitId: string | number, subUnitId: string | number) => {
      const updated = [...units]
      updated.forEach((unit) => {
        if (String(unit.id) === String(unitId)) {
          if (unit.subUnit && unit.subUnit.length > 0) {
            unit.subUnit.forEach((subUnit) => {
              if (String(subUnit.id) === String(subUnitId)) {
                if (subUnit.topics && subUnit.topics.length > 0) {
                  subUnit.topics.forEach((topicItem) => {
                    if (String(topicItem.id) === String(topic.id)) {
                      topicItem.trainerMap = !(topicItem.trainerMap ?? false)
                      // Reset signedOff if trainerMap is unchecked
                      if (!topicItem.trainerMap) {
                        topicItem.signedOff = false
                      }
                    }
                  })
                }
              }
            })
          }
        }
      })
      setValue('units', updated)
    },
    [units, setValue]
  )

  /**
   * Toggle signedOff for a topic
   */
  const toggleSignedOff = useCallback(
    (topic: any, unitId: string | number, subUnitId: string | number) => {
      const updated = [...units]
      updated.forEach((unit) => {
        if (String(unit.id) === String(unitId)) {
          if (unit.subUnit && unit.subUnit.length > 0) {
            unit.subUnit.forEach((subUnit) => {
              if (String(subUnit.id) === String(subUnitId)) {
                if (subUnit.topics && subUnit.topics.length > 0) {
                  subUnit.topics.forEach((topicItem) => {
                    if (String(topicItem.id) === String(topic.id)) {
                      topicItem.signedOff = !(topicItem.signedOff ?? false)
                    }
                  })
                }
              }
            })
          }
        }
      })
      setValue('units', updated)
      trigger('units')
    },
    [units, setValue, trigger]
  )

  /**
   * Update comment for a topic
   */
  const updateComment = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      topicId: string | number,
      unitId: string | number,
      subUnitId: string | number
    ) => {
      const updated = [...units]
      updated.forEach((unit) => {
        if (String(unit.id) === String(unitId)) {
          if (unit.subUnit && unit.subUnit.length > 0) {
            unit.subUnit.forEach((subUnit) => {
              if (String(subUnit.id) === String(subUnitId)) {
                if (subUnit.topics && subUnit.topics.length > 0) {
                  subUnit.topics.forEach((topicItem) => {
                    if (String(topicItem.id) === String(topicId)) {
                      topicItem.comment = e.target.value
                    }
                  })
                }
              }
            })
          }
        }
      })
      setValue('units', updated)
    },
    [units, setValue]
  )

  return {
    learnerMapHandler: toggleLearnerMap,
    trainerMapHandler: toggleTrainerMap,
    signedOffHandler: toggleSignedOff,
    commentHandler: updateComment,
  }
}

