import React, { useState, memo } from 'react'
import {
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  FormHelperText,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import GapIndicator from './GapIndicator'
import EvidenceIndicator from './EvidenceIndicator'
import { UseFormSetValue, UseFormTrigger } from 'react-hook-form'
import { FormValues } from '../lib/types'

export interface QualificationHierarchyProps {
  unit: any
  unitsWatch: any[]
  courseId: string | number
  courseName: string
  isEditMode: boolean
  canEditLearnerFields: boolean
  canEditTrainerFields: boolean
  isSubmitted: boolean
  errors?: any
  // Handlers for topics
  learnerMapHandler: (topic: any, unitId: string | number, subUnitId: string | number) => void
  trainerMapHandler: (topic: any, unitId: string | number, subUnitId: string | number) => void
  signedOffHandler: (topic: any, unitId: string | number, subUnitId: string | number) => void
  commentHandler: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, topicId: string | number, unitId: string | number, subUnitId: string | number) => void
  // Evidence count
  getEvidenceCount: (courseId: string | number, unitId: string | number, topicId?: string | number) => number
  // Form methods
  setValue: UseFormSetValue<FormValues>
  trigger: UseFormTrigger<FormValues>
  unitIndex: number
}

/**
 * QualificationHierarchy Component
 * 
 * Displays hierarchical structure for Qualification courses:
 * Unit → Learning Outcomes (subUnit) → Assessment Criteria (topics)
 * Only topics are mappable (learnerMap/trainerMap/signedOff)
 */
const QualificationHierarchy: React.FC<QualificationHierarchyProps> = ({
  unit,
  unitsWatch,
  courseId,
  courseName,
  isEditMode,
  canEditLearnerFields,
  canEditTrainerFields,
  isSubmitted,
  errors,
  learnerMapHandler,
  trainerMapHandler,
  signedOffHandler,
  commentHandler,
  getEvidenceCount,
  setValue,
  trigger,
  unitIndex,
}) => {
  const [expandedSubUnits, setExpandedSubUnits] = useState<Set<string | number>>(new Set())

  const toggleSubUnit = (subUnitId: string | number) => {
    const newExpanded = new Set(expandedSubUnits)
    if (newExpanded.has(subUnitId)) {
      newExpanded.delete(subUnitId)
    } else {
      newExpanded.add(subUnitId)
    }
    setExpandedSubUnits(newExpanded)
  }

  // Get current unit from form state
  const currentUnit = unitsWatch.find(
    (u) => String(u.id) === String(unit.id) && u.course_id === courseId
  )

  if (!currentUnit) return null

  return (
    <Box sx={{ mb: 4 }}>
      {/* Unit Title */}
      <Typography variant='h5' sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
        {unit.title}
      </Typography>

      {/* Learning Outcomes (subUnits) */}
      {currentUnit.subUnit && currentUnit.subUnit.length > 0 && (
        <Box sx={{ ml: 2 }}>
          {currentUnit.subUnit.map((subUnit: any) => {
            const subUnitId = subUnit.id
            const isExpanded = expandedSubUnits.has(subUnitId)
            const hasTopics = subUnit.topics && Array.isArray(subUnit.topics) && subUnit.topics.length > 0

            // Get topics from current unit state
            const currentSubUnit = currentUnit.subUnit?.find(
              (s: any) => String(s.id) === String(subUnitId)
            )
            const topics = currentSubUnit?.topics || subUnit.topics || []

            // Check if at least one topic has learnerMap selected
            const hasLearnerMapSelected = topics.some(
              (topic: any) => {
                const currentTopic = currentSubUnit?.topics?.find(
                  (t: any) => String(t.id) === String(topic.id)
                )
                return currentTopic?.learnerMap === true
              }
            )

            return (
              <Box key={subUnitId} sx={{ mb: 2 }}>
                {/* Learning Outcome Header (Expandable) */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    p: 1.5,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    cursor: hasTopics ? 'pointer' : 'default',
                    '&:hover': hasTopics ? { bgcolor: 'grey.200' } : {},
                  }}
                  onClick={() => hasTopics && toggleSubUnit(subUnitId)}
                >
                  {hasTopics && (
                    <IconButton size='small' sx={{ mr: 1 }}>
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                  <Typography variant='subtitle1' sx={{ flex: 1, fontWeight: 500 }}>
                    {subUnit.title}
                  </Typography>
                  {!hasTopics && (
                    <Typography variant='caption' color='text.secondary' sx={{ ml: 2 }}>
                      No assessment criteria
                    </Typography>
                  )}
                </Box>

                {/* Assessment Criteria (Topics) Table - Collapsible */}
                {hasTopics && (
                  <Collapse in={isExpanded}>
                    <Box sx={{ mt: 1, ml: 4 }}>
                      <TableContainer>
                        <Table size='small'>
                          <TableHead>
                            <TableRow>
                              <TableCell>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={topics.every((topic: any) => {
                                        const currentTopic = currentSubUnit?.topics?.find(
                                          (t: any) => String(t.id) === String(topic.id)
                                        )
                                        return currentTopic?.learnerMap === true
                                      })}
                                      indeterminate={
                                        topics.some((topic: any) => {
                                          const currentTopic = currentSubUnit?.topics?.find(
                                            (t: any) => String(t.id) === String(topic.id)
                                          )
                                          return currentTopic?.learnerMap === true
                                        }) &&
                                        !topics.every((topic: any) => {
                                          const currentTopic = currentSubUnit?.topics?.find(
                                            (t: any) => String(t.id) === String(topic.id)
                                          )
                                          return currentTopic?.learnerMap === true
                                        })
                                      }
                                      onChange={(e) => {
                                        const updated = [...unitsWatch]
                                        const unitToUpdate = updated.find(
                                          (u) => String(u.id) === String(unit.id) && u.course_id === courseId
                                        )
                                        if (unitToUpdate && unitToUpdate.subUnit) {
                                          const subUnitToUpdate = unitToUpdate.subUnit.find(
                                            (s: any) => String(s.id) === String(subUnitId)
                                          )
                                          if (subUnitToUpdate && subUnitToUpdate.topics) {
                                            subUnitToUpdate.topics.forEach((topic: any) => {
                                              topic.learnerMap = e.target.checked
                                            })
                                            setValue('units', updated)
                                            trigger('units')
                                          }
                                        }
                                      }}
                                      disabled={isEditMode || !canEditLearnerFields}
                                    />
                                  }
                                  label='Learner Map'
                                  sx={{ margin: 0 }}
                                />
                              </TableCell>
                              <TableCell>Assessment Criteria</TableCell>
                              <TableCell>Trainer Comment</TableCell>
                              <TableCell align='center'>Gap</TableCell>
                              <TableCell align='center'>
                                {canEditTrainerFields ? (
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={
                                          topics.every((topic: any) => {
                                            const currentTopic = currentSubUnit?.topics?.find(
                                              (t: any) => String(t.id) === String(topic.id)
                                            )
                                            return (
                                              currentTopic?.learnerMap === true &&
                                              currentTopic?.trainerMap === true &&
                                              currentTopic?.signedOff === true
                                            )
                                          })
                                        }
                                        indeterminate={
                                          topics.some((topic: any) => {
                                            const currentTopic = currentSubUnit?.topics?.find(
                                              (t: any) => String(t.id) === String(topic.id)
                                            )
                                            return (
                                              currentTopic?.learnerMap === true &&
                                              currentTopic?.trainerMap === true &&
                                              currentTopic?.signedOff === true
                                            )
                                          }) &&
                                          !topics.every((topic: any) => {
                                            const currentTopic = currentSubUnit?.topics?.find(
                                              (t: any) => String(t.id) === String(topic.id)
                                            )
                                            return (
                                              currentTopic?.learnerMap === true &&
                                              currentTopic?.trainerMap === true &&
                                              currentTopic?.signedOff === true
                                            )
                                          })
                                        }
                                        onChange={(e) => {
                                          const updated = [...unitsWatch]
                                          const unitToUpdate = updated.find(
                                            (u) => String(u.id) === String(unit.id) && u.course_id === courseId
                                          )
                                          if (unitToUpdate && unitToUpdate.subUnit) {
                                            const subUnitToUpdate = unitToUpdate.subUnit.find(
                                              (s: any) => String(s.id) === String(subUnitId)
                                            )
                                            if (subUnitToUpdate && subUnitToUpdate.topics) {
                                              const eligibleTopics = subUnitToUpdate.topics.filter(
                                                (topic: any) =>
                                                  topic.learnerMap === true && topic.trainerMap === true
                                              )
                                              const allSignedOff = eligibleTopics.every(
                                                (topic: any) => topic.signedOff === true
                                              )
                                              const targetState = allSignedOff ? false : true
                                              eligibleTopics.forEach((topic: any) => {
                                                topic.signedOff = targetState
                                              })
                                              setValue('units', updated)
                                              trigger('units')
                                            }
                                          }
                                        }}
                                        disabled={isEditMode}
                                      />
                                    }
                                    label='Signed Off'
                                    sx={{ margin: 0 }}
                                  />
                                ) : (
                                  'Signed Off'
                                )}
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {topics.map((topic: any) => {
                              const currentTopic = currentSubUnit?.topics?.find(
                                (t: any) => String(t.id) === String(topic.id)
                              )
                              const learnerMap = currentTopic?.learnerMap ?? topic.learnerMap ?? false
                              const trainerMap = currentTopic?.trainerMap ?? topic.trainerMap ?? false
                              const signedOff = currentTopic?.signedOff ?? topic.signedOff ?? false
                              const comment = currentTopic?.comment ?? topic.comment ?? ''

                              return (
                                <TableRow key={topic.id}>
                                  <TableCell>
                                    <Checkbox
                                      checked={learnerMap}
                                      onChange={() => {
                                        learnerMapHandler(topic, unit.id, subUnitId)
                                      }}
                                      disabled={isEditMode || !canEditLearnerFields}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant='body2'>
                                      {topic.code && <strong>{topic.code}: </strong>}
                                      {topic.title}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    {!canEditTrainerFields ? (
                                      <span>{comment || 'No comment'}</span>
                                    ) : (
                                      <TextField
                                        size='small'
                                        value={comment}
                                        disabled={isEditMode}
                                        onChange={(e) => {
                                          commentHandler(e, topic.id, unit.id, subUnitId)
                                        }}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell align='center' className='flex flex-col items-center justify-center'>
                                    <GapIndicator
                                      learnerMap={learnerMap}
                                      trainerMap={trainerMap}
                                      signedOff={signedOff}
                                      onClick={() => {
                                        if (canEditTrainerFields && !isEditMode && learnerMap) {
                                          trainerMapHandler(topic, unit.id, subUnitId)
                                        }
                                      }}
                                      disabled={!canEditTrainerFields || isEditMode || !learnerMap}
                                    />
                                    <EvidenceIndicator
                                      evidenceCount={getEvidenceCount(courseId, unit.id, topic.id)}
                                    />
                                  </TableCell>
                                  <TableCell align='center'>
                                    <Checkbox
                                      checked={signedOff}
                                      disabled={
                                        !canEditTrainerFields ||
                                        isEditMode ||
                                        !learnerMap ||
                                        !trainerMap
                                      }
                                      onChange={() => {
                                        signedOffHandler(topic, unit.id, subUnitId)
                                      }}
                                    />
                                  </TableCell>
                                </TableRow>
                              )
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      {/* Validation message for this learning outcome */}
                      {isSubmitted && !hasLearnerMapSelected && (
                        <FormHelperText error sx={{ mt: 1 }}>
                          At least one assessment criteria must have Learner Map selected for{' '}
                          {subUnit.title}
                        </FormHelperText>
                      )}
                    </Box>
                  </Collapse>
                )}
              </Box>
            )
          })}
        </Box>
      )}

      {/* Unit-level validation message */}
      {isSubmitted && currentUnit.subUnit && currentUnit.subUnit.length > 0 && (
        <FormHelperText error sx={{ mt: 1 }}>
          {(() => {
            const allSubUnitsHaveSelection = currentUnit.subUnit.every((subUnit: any) => {
              const topics = subUnit.topics || []
              return topics.some((topic: any) => {
                const currentSubUnit = currentUnit.subUnit?.find(
                  (s: any) => String(s.id) === String(subUnit.id)
                )
                const currentTopic = currentSubUnit?.topics?.find(
                  (t: any) => String(t.id) === String(topic.id)
                )
                return currentTopic?.learnerMap === true
              })
            })
            if (!allSubUnitsHaveSelection) {
              return `At least one assessment criteria must have Learner Map selected for ${unit.title}`
            }
            return null
          })()}
        </FormHelperText>
      )}
    </Box>
  )
}

export default memo(QualificationHierarchy)

