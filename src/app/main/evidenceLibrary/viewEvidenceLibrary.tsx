import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  TextField,
  Typography,
  useTheme,
  alpha,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import {
  useGetEvidenceDetailsQuery,
  useUpdateEvidenceIdMutation,
  useUpsertAssignmentMappingMutation,
} from 'app/store/api/evidence-api'
import { selectLearnerManagement } from 'app/store/learnerManagement'
import { showMessage } from 'app/store/fuse/messageSlice'
import { useDispatch } from 'react-redux'
import { useUserRole } from 'src/app/utils/userHelpers'
import UnitsTable from './components/UnitsTable'
import QualificationHierarchy from './components/QualificationHierarchy'
import QualificationMinimal from './components/QualificationMinimal'
import StandardCourseMinimal from './components/StandardCourseMinimal'
import { useEvidenceCount } from './hooks/useEvidenceCount'
import { useUnitHandlers } from './hooks/useUnitHandlers'
import { useQualificationHandlers } from './hooks/useQualificationHandlers'
import { COURSE_TYPES } from './constants'
import { FormValues } from './lib/types'

// Helper function to reconstruct form state from mappings (similar to new project)
const reconstructFormStateFromMappings = (
  mappings: any[],
  courses: any[]
): {
  selectedCourses: any[]
  courseSelectedTypes: Record<string | number, string[]>
  units: any[]
} => {
  if (!mappings || mappings.length === 0 || !courses || courses.length === 0) {
    return { selectedCourses: [], courseSelectedTypes: {}, units: [] }
  }

  const mappingsByCourse = new Map<number, any[]>()
  mappings.forEach((mapping) => {
    const courseId = mapping.course_id || mapping.course?.course_id
    if (!courseId) return
    if (!mappingsByCourse.has(courseId)) {
      mappingsByCourse.set(courseId, [])
    }
    mappingsByCourse.get(courseId)!.push(mapping)
  })

  const selectedCoursesArray: any[] = []
  const courseSelectedTypesObj: Record<string | number, string[]> = {}
  const unitsArray: any[] = []

  mappingsByCourse.forEach((courseMappings, courseId) => {
    const learnerCourse = courses.find(
      (lc) => lc.course?.course_id === courseId || lc.course_id === courseId
    )
    const course = learnerCourse?.course || learnerCourse

    if (!course) return

    selectedCoursesArray.push({
      course_id: course.course_id,
      course_name: course.course_name,
      course_code: course.course_code,
      course_core_type: course.course_core_type,
      units: course.units || [],
    })

    if (course.course_core_type === COURSE_TYPES.QUALIFICATION) {
      const courseUnits = course.units || []
      const unitsWithMappings = new Set<string | number>()

      courseMappings.forEach((mapping) => {
        const taskOrTopicId = mapping.unit_code

        if (courseUnits.length > 0) {
          for (const unit of courseUnits) {
            let foundInUnit = false
            if (unit.subUnit && Array.isArray(unit.subUnit)) {
              for (const subUnit of unit.subUnit) {
                if (subUnit.topics && Array.isArray(subUnit.topics)) {
                  const topic = subUnit.topics.find(
                    (t: any) => String(t.id) === String(taskOrTopicId) || t.code === taskOrTopicId
                  )
                  if (topic) {
                    unitsWithMappings.add(unit.id)
                    foundInUnit = true
                    break
                  }
                }
              }
            }
            if (foundInUnit) {
              break
            }
          }
        }
      })

      if (courseUnits.length === 0) {
        return
      }

      const unitsMap = new Map<string | number, any>()

      if (courseUnits.length > 0) {
        courseUnits.forEach((unit: any) => {
          if (unitsWithMappings.has(unit.id)) {
            const unitKey = unit.id
            if (!unitsMap.has(unitKey)) {
              const unitData: any = {
                ...unit,
                course_id: courseId,
                subUnit: [],
              }

              if (unit.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0) {
                unitData.subUnit = unit.subUnit.map((subUnit: any) => {
                  const subUnitData: any = {
                    ...subUnit,
                    topics: [],
                  }

                  if (subUnit.topics && Array.isArray(subUnit.topics) && subUnit.topics.length > 0) {
                    subUnitData.topics = subUnit.topics.map((topic: any) => {
                      const mapping = courseMappings.find(
                        (m) => String(m.unit_code) === String(topic.id)
                      )

                      if (mapping) {
                        const learnerMap = mapping.learnerMap ?? mapping.learner_map ?? false
                        const trainerMap = mapping.trainerMap ?? mapping.trainer_map ?? false
                        const signedOff = mapping.signedOff ?? mapping.signed_off ?? false
                        const comment = mapping.comment ?? ''

                        return {
                          ...topic,
                          learnerMap,
                          trainerMap,
                          signedOff,
                          comment,
                          mapping_id: mapping.mapping_id,
                        }
                      } else {
                        return {
                          ...topic,
                          learnerMap: false,
                          trainerMap: false,
                          signedOff: false,
                          comment: '',
                        }
                      }
                    })
                  }
                  return subUnitData
                })
              }
              unitsMap.set(unitKey, unitData)
            }
          }
        })
      }
      unitsArray.push(...Array.from(unitsMap.values()))
      return
    }

    if (course.course_core_type === COURSE_TYPES.STANDARD) {
      const courseUnits = course.units || []
      const unitsMap = new Map<string, any>()

      // Collect all types that have mappings (not just the first one)
      const selectedTypesSet = new Set<string>()
      if (courseMappings.length > 0 && courseUnits.length > 0) {
        courseMappings.forEach((mapping) => {
          const unitIdOrRef = mapping.unit_code
          if (unitIdOrRef) {
            const matchedUnit = courseUnits.find(
              (u: any) => String(u.id) === String(unitIdOrRef) || u.code === unitIdOrRef || u.unit_ref === unitIdOrRef
            )
            if (matchedUnit?.type) {
              selectedTypesSet.add(matchedUnit.type)
            }
          }
        })
      }

      // Set selected types as array
      if (selectedTypesSet.size > 0) {
        courseSelectedTypesObj[courseId] = Array.from(selectedTypesSet)
      }

      // Initialize ALL units from all selected types
      if (selectedTypesSet.size > 0) {
        const filteredUnits = courseUnits.filter((u: any) => selectedTypesSet.has(u.type))
        filteredUnits.forEach((unit: any) => {
          const unitKey = `${courseId}-${unit.id || unit.code}`
          if (!unitsMap.has(unitKey)) {
            const hasSubUnit = unit.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0
            unitsMap.set(unitKey, {
              ...unit,
              course_id: courseId,
              type: unit.type,
              code: unit.code || unit.unit_ref,
              subUnit: hasSubUnit
                ? unit.subUnit.map((sub: any) => ({
                    ...sub,
                    learnerMap: false,
                    trainerMap: false,
                    signedOff: false,
                    comment: '',
                  }))
                : [],
              learnerMap: hasSubUnit ? undefined : false,
              trainerMap: hasSubUnit ? undefined : false,
              signedOff: hasSubUnit ? undefined : false,
              comment: hasSubUnit ? undefined : '',
            })
          }
        })
      }

      courseMappings.forEach((mapping) => {
        const unitIdOrRef = mapping.unit_code
        const subUnitRef = mapping.sub_unit_id

        const unit = courseUnits.find(
          (u: any) => String(u.id) === String(unitIdOrRef) || u.code === unitIdOrRef || u.unit_ref === unitIdOrRef
        )
        if (!unit) return

        const unitKey = `${courseId}-${unit.id || unit.code}`
        let unitData = unitsMap.get(unitKey)

        if (!unitData) {
          const hasSubUnit = unit.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0
          const newUnitData: any = {
            ...unit,
            course_id: courseId,
            type: unit.type,
            code: unit.code || unit.unit_ref,
            subUnit: hasSubUnit
              ? unit.subUnit.map((sub: any) => ({
                  ...sub,
                  learnerMap: false,
                  trainerMap: false,
                  signedOff: false,
                  comment: '',
                }))
              : [],
            learnerMap: hasSubUnit ? undefined : false,
            trainerMap: hasSubUnit ? undefined : false,
            signedOff: hasSubUnit ? undefined : false,
            comment: hasSubUnit ? undefined : '',
          }
          unitsMap.set(unitKey, newUnitData)
          unitData = newUnitData
        }

        if (!unitData) return

        if (subUnitRef !== null && subUnitRef !== undefined) {
          const subunit = unit.subUnit?.find(
            (s: any) => String(s.id) === String(subUnitRef) || s.code === subUnitRef
          )
          if (subunit) {
            const existingSubUnit = unitData.subUnit.find(
              (s: any) => String(s.id) === String(subUnitRef) || s.code === subUnitRef
            )
            if (existingSubUnit) {
              const learnerMap = mapping.learnerMap ?? mapping.learner_map ?? false
              const trainerMap = mapping.trainerMap ?? mapping.trainer_map ?? false
              const signedOff = mapping.signedOff ?? mapping.signed_off ?? false
              const comment = mapping.comment ?? ''

              existingSubUnit.learnerMap = learnerMap
              existingSubUnit.trainerMap = trainerMap
              existingSubUnit.signedOff = signedOff
              existingSubUnit.comment = comment
              existingSubUnit.mapping_id = mapping.mapping_id
            } else {
              const learnerMap = mapping.learnerMap ?? mapping.learner_map ?? false
              const trainerMap = mapping.trainerMap ?? mapping.trainer_map ?? false
              const signedOff = mapping.signedOff ?? mapping.signed_off ?? false
              const comment = mapping.comment ?? ''

              unitData.subUnit.push({
                ...subunit,
                learnerMap,
                trainerMap,
                signedOff,
                comment,
                mapping_id: mapping.mapping_id,
              })
            }
          }
        } else {
          const learnerMap = mapping.learnerMap ?? mapping.learner_map ?? false
          const trainerMap = mapping.trainerMap ?? mapping.trainer_map ?? false
          const signedOff = mapping.signedOff ?? mapping.signed_off ?? false
          const comment = mapping.comment ?? ''

          unitData.learnerMap = learnerMap
          unitData.trainerMap = trainerMap
          unitData.signedOff = signedOff
          unitData.comment = comment
          unitData.mapping_id = mapping.mapping_id
        }
      })
      unitsArray.push(...Array.from(unitsMap.values()))
    }
  })

  return {
    selectedCourses: selectedCoursesArray,
    courseSelectedTypes: courseSelectedTypesObj,
    units: unitsArray,
  }
}

const ViewEvidenceLibrary = () => {
  const navigate = useNavigate()
  const { id } = useParams()
  const theme = useTheme()
  const dispatch = useDispatch()
  const userRole = useUserRole()
  const { learner } = useSelector(selectLearnerManagement)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    data: evidenceDetails,
    isLoading: isLoadingDetails,
  } = useGetEvidenceDetailsQuery(
    {
      id,
    },
    {
      skip: !id,
      refetchOnMountOrArgChange: true,
    }
  )

  const [updateEvidence] = useUpdateEvidenceIdMutation()
  const [upsertMapping] = useUpsertAssignmentMappingMutation()

  const { control, setValue, watch, getValues, trigger } = useForm<FormValues>({
    defaultValues: {
      trainer_feedback: '',
      units: [],
    },
  })

  const unitsWatch = watch('units')
  const [selectedCourses, setSelectedCourses] = useState<any[]>([])

  // Get learner courses
  const learnerCoursesData = useMemo(() => {
    if (!learner?.course) return []
    return learner.course
      .map((courseItem: any) => {
        const course = courseItem.course || courseItem
        return {
          ...course,
          units: course.units || courseItem.units || [],
          course_core_type: course.course_core_type || courseItem.course_core_type,
        }
      })
      .filter((course: any) => course.course_core_type !== 'Gateway')
  }, [learner?.course])

  // Reconstruct form state from mappings
  useEffect(() => {
    if (evidenceDetails?.data && learnerCoursesData.length > 0) {
      const evidence = evidenceDetails.data
      setValue('trainer_feedback', evidence.trainer_feedback || '')
      if (evidence.mappings && evidence.mappings.length > 0) {
        const reconstructed = reconstructFormStateFromMappings(
          evidence.mappings,
          learnerCoursesData
        )
        setSelectedCourses(reconstructed.selectedCourses)
        setValue('units', reconstructed.units)
      } else {
        setSelectedCourses([])
        setValue('units', [])
      }
    }
  }, [evidenceDetails, learnerCoursesData, setValue])

  // Evidence count hook
  const { getEvidenceCount } = useEvidenceCount({ learner, selectedCourses })

  // Unit handlers
  const {
    learnerMapHandler,
    trainerMapHandler,
    signedOffHandler,
    commentHandler,
    selectAllLearnerMapHandler,
    selectAllSignedOffHandler,
    selectAllSignedOffForCombinedHandler,
  } = useUnitHandlers({
    units: unitsWatch || [],
    setValue,
    trigger,
  })

  // Qualification handlers
  const {
    learnerMapHandler: qualLearnerMapHandler,
    trainerMapHandler: qualTrainerMapHandler,
    signedOffHandler: qualSignedOffHandler,
    commentHandler: qualCommentHandler,
  } = useQualificationHandlers({
    units: unitsWatch || [],
    setValue,
    trigger,
  })

  const canEditLearnerFields = userRole === 'Learner'
  const canEditTrainerFields = ['Trainer', 'Admin', 'IQA'].includes(userRole || '')

  const handleSave = async () => {
    if (!evidenceDetails?.data) return

    setIsSubmitting(true)
    try {
      // Update trainer feedback
      await updateEvidence({
        id: Number(id),
        data: {
          trainer_feedback: getValues('trainer_feedback'),
        },
      }).unwrap()

      // Update mappings
      const units = getValues('units')
      for (const unit of units) {
        if (unit.course_id) {
          const course = learnerCoursesData.find(
            (c) => c.course_id === unit.course_id
          )
          if (!course) continue

          if (course.course_core_type === COURSE_TYPES.QUALIFICATION) {
            // Handle Qualification courses
            if (unit.subUnit && Array.isArray(unit.subUnit)) {
              for (const subUnit of unit.subUnit) {
                if (subUnit.topics && Array.isArray(subUnit.topics)) {
                  for (const topic of subUnit.topics) {
                    // Type assertion for mapping_id (not in Topic type but exists in runtime)
                    const topicWithMapping = topic as any
                    // Always update if mapping_id exists (to update trainerMap, signedOff, comment)
                    if (topicWithMapping.mapping_id) {
                      await upsertMapping({
                        assignment_id: Number(id),
                        unit_code: topic.id,
                        sub_unit_id: null,
                        course_id: unit.course_id,
                        learnerMap: topic.learnerMap || false,
                        trainerMap: topic.trainerMap || false,
                        signedOff: topic.signedOff || false,
                        comment: topic.comment || '',
                        mapping_id: topicWithMapping.mapping_id,
                      }).unwrap()
                    } else if (topic.learnerMap === true) {
                      // Only create new mapping if learnerMap is true (following create page pattern)
                      await upsertMapping({
                        assignment_id: Number(id),
                        unit_code: topic.id,
                        sub_unit_id: null,
                        course_id: unit.course_id,
                        learnerMap: true,
                        trainerMap: topic.trainerMap || false,
                        signedOff: topic.signedOff || false,
                        comment: topic.comment || '',
                      }).unwrap()
                    }
                  }
                }
              }
            }
          } else {
            // Handle Standard courses
            if (unit.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0) {
              for (const subUnit of unit.subUnit) {
                // Type assertion for mapping_id (not in SubUnit type but exists in runtime)
                const subUnitWithMapping = subUnit as any
                // Always update if mapping_id exists (to update trainerMap, signedOff, comment)
                if (subUnitWithMapping.mapping_id) {
                  await upsertMapping({
                    assignment_id: Number(id),
                    unit_code: unit.id,
                    sub_unit_id: subUnit.id,
                    course_id: unit.course_id,
                    learnerMap: subUnit.learnerMap || false,
                    trainerMap: subUnit.trainerMap || false,
                    signedOff: subUnit.signedOff || false,
                    comment: subUnit.comment || '',
                    mapping_id: subUnitWithMapping.mapping_id,
                  }).unwrap()
                } else if (subUnit.learnerMap === true) {
                  // Only create new mapping if learnerMap is true (following create page pattern)
                  await upsertMapping({
                    assignment_id: Number(id),
                    unit_code: unit.id,
                    sub_unit_id: subUnit.id,
                    course_id: unit.course_id,
                    learnerMap: true,
                    trainerMap: subUnit.trainerMap || false,
                    signedOff: subUnit.signedOff || false,
                    comment: subUnit.comment || '',
                  }).unwrap()
                }
              }
            } else {
              // Unit-level mapping (no subUnit)
              // Type assertion for mapping_id (not in Unit type but exists in runtime)
              const unitWithMapping = unit as any
              if (unitWithMapping.mapping_id) {
                // Always update if mapping_id exists
                await upsertMapping({
                  assignment_id: Number(id),
                  unit_code: unit.id,
                  sub_unit_id: null,
                  course_id: unit.course_id,
                  learnerMap: unit.learnerMap || false,
                  trainerMap: unit.trainerMap || false,
                  signedOff: unit.signedOff || false,
                  comment: unit.comment || '',
                  mapping_id: unitWithMapping.mapping_id,
                }).unwrap()
              } else if (unit.learnerMap === true) {
                // Only create new mapping if learnerMap is true
                await upsertMapping({
                  assignment_id: Number(id),
                  unit_code: unit.id,
                  sub_unit_id: null,
                  course_id: unit.course_id,
                  learnerMap: true,
                  trainerMap: unit.trainerMap || false,
                  signedOff: unit.signedOff || false,
                  comment: unit.comment || '',
                }).unwrap()
              }
            }
          }
        }
      }

      dispatch(
        showMessage({
          message: 'Evidence updated successfully',
          variant: 'success',
        })
      )
      navigate('/evidenceLibrary')
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Failed to update evidence. Please try again.',
          variant: 'error',
        })
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const evidenceData = evidenceDetails?.data

  // Group units by course
  const unitsByCourse = useMemo(() => {
    if (!unitsWatch || unitsWatch.length === 0) return []
    
    const courseMap = new Map<number, { course: any; units: any[] }>()
    
    unitsWatch.forEach((unit: any) => {
      if (unit.course_id) {
        const course = learnerCoursesData.find((c) => c.course_id === unit.course_id)
        if (course) {
          if (!courseMap.has(course.course_id)) {
            courseMap.set(course.course_id, { course, units: [] })
          }
          courseMap.get(course.course_id)!.units.push(unit)
        }
      }
    })
    
    return Array.from(courseMap.values())
  }, [unitsWatch, learnerCoursesData])

  if (isLoadingDetails) {
    return (
      <Container sx={{ mt: 8, pb: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    )
  }

  if (!evidenceData) {
    return (
      <Container sx={{ mt: 8, pb: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Evidence not found
        </Typography>
      </Container>
    )
  }

  return (
    <Container sx={{ mt: 8, pb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/evidenceLibrary')}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          }}
        >
          Back
        </Button>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {evidenceData.title || 'Evidence Details'}
        </Typography>
      </Box>

      {/* Evidence Information Card */}
      <Card sx={{ p: 3, mb: 4, boxShadow: theme.shadows[1] }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Evidence Information
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Controller
            name="trainer_feedback"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Trainer Feedback"
                multiline
                rows={4}
                fullWidth
                disabled={!canEditTrainerFields}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                  },
                }}
              />
            )}
          />
        </Box>

        {/* Unit Mappings */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
            Unit Mappings
          </Typography>

          {unitsByCourse.map(({ course, units }) => {
            if (course.course_core_type === COURSE_TYPES.QUALIFICATION) {
              return (
                <Box key={course.course_id} sx={{ mb: 4 }}>
                  {units.map((unit: any, unitIndex: number) => {
                    // Transform unit data to match QualificationMinimal format
                    // Group topics by subUnit (Learning Outcomes)
                    const subUnitsWithTopics: any[] = []
                    
                    if (unit.subUnit && Array.isArray(unit.subUnit)) {
                      unit.subUnit.forEach((subUnit: any) => {
                        if (subUnit.topics && Array.isArray(subUnit.topics)) {
                          const topics: any[] = []
                          
                          subUnit.topics.forEach((topic: any) => {
                            const currentTopic = subUnit.topics?.find(
                              (t: any) => String(t.id) === String(topic.id)
                            )
                            const learnerMap = currentTopic?.learnerMap ?? topic.learnerMap ?? false
                            const trainerMap = currentTopic?.trainerMap ?? topic.trainerMap ?? false
                            const signedOff = currentTopic?.signedOff ?? topic.signedOff ?? false
                            const comment = currentTopic?.comment ?? topic.comment ?? ''
                            
                            // Determine gap status based on mapping states
                            let gapStatus: 'none' | 'minor' | 'major' | undefined = undefined
                            if (learnerMap && trainerMap && signedOff) {
                              gapStatus = 'none' // Green - all mapped
                            } else if (learnerMap && trainerMap) {
                              gapStatus = 'minor' // Yellow - learner and trainer mapped but not signed off
                            } else if (learnerMap) {
                              gapStatus = 'major' // Red - only learner mapped
                            }
                            
                            topics.push({
                              id: topic.id,
                              code: topic.code || '',
                              description: topic.title || topic.description || '',
                              gapStatus,
                              comment,
                              signedOff,
                              mapped: learnerMap,
                              topic, // Keep original topic for handlers
                              subUnitId: subUnit.id,
                              unitId: unit.id,
                            })
                          })
                          
                          if (topics.length > 0) {
                            subUnitsWithTopics.push({
                              id: subUnit.id,
                              title: subUnit.title || subUnit.description || '',
                              topics,
                            })
                          }
                        }
                      })
                    }
                    
                    return (
                      <QualificationMinimal
                        key={unit.id}
                        unit={{
                          id: unit.id,
                          code: unit.code || unit.unit_ref || '',
                          title: unit.title,
                          subUnitsWithTopics,
                        }}
                        unitsWatch={unitsWatch || []}
                        courseId={course.course_id}
                        canEditLearnerFields={canEditLearnerFields}
                        canEditTrainerFields={canEditTrainerFields}
                        learnerMapHandler={qualLearnerMapHandler}
                        trainerMapHandler={qualTrainerMapHandler}
                        signedOffHandler={qualSignedOffHandler}
                        commentHandler={qualCommentHandler}
                        getEvidenceCount={getEvidenceCount}
                        setValue={setValue}
                        trigger={trigger}
                      />
                    )
                  })}
                </Box>
              )
            } else {
              // Standard courses - group units by type and show one table per type
              // Group units by type
              const unitsByType = new Map<string, typeof units>()
              units.forEach((unit: any) => {
                const unitType = unit.type || ''
                if (!unitsByType.has(unitType)) {
                  unitsByType.set(unitType, [])
                }
                unitsByType.get(unitType)!.push(unit)
              })

              return (
                <Box key={course.course_id} sx={{ mb: 3 }}>
                  {Array.from(unitsByType.entries()).map(([unitType, unitsOfType]) => {
                    // Combine all subUnits from all units of this type (same as createViewEvidenceLibrary)
                    const combinedSubUnits: any[] = []
                    unitsOfType.forEach((unit: any) => {
                      const hasSubUnit = unit.subUnit && Array.isArray(unit.subUnit) && unit.subUnit.length > 0
                      if (hasSubUnit) {
                        unit.subUnit.forEach((sub: any) => {
                          combinedSubUnits.push({
                            ...sub,
                            unitId: unit.id,
                            unitTitle: unit.title,
                            courseId: course.course_id,
                          })
                        })
                      } else {
                        // If unit doesn't have subUnit, add the unit itself
                        combinedSubUnits.push({
                          id: unit.id,
                          title: unit.title,
                          learnerMap: unit.learnerMap ?? false,
                          trainerMap: unit.trainerMap ?? false,
                          signedOff: unit.signedOff ?? false,
                          comment: unit.comment ?? '',
                          unitId: unit.id,
                          unitTitle: unit.title,
                          courseId: course.course_id,
                        })
                      }
                    })

                    if (combinedSubUnits.length === 0) return null

                    return (
                      <StandardCourseMinimal
                        key={unitType}
                        title={unitType}
                        rows={combinedSubUnits}
                        unitsWatch={unitsWatch || []}
                        courseId={course.course_id}
                        canEditLearnerFields={canEditLearnerFields}
                        canEditTrainerFields={canEditTrainerFields}
                        learnerMapHandler={learnerMapHandler}
                        trainerMapHandler={trainerMapHandler}
                        signedOffHandler={signedOffHandler}
                        commentHandler={commentHandler}
                        selectAllSignedOffForCombinedHandler={selectAllSignedOffForCombinedHandler}
                        getEvidenceCount={getEvidenceCount}
                        setValue={setValue}
                        trigger={trigger}
                        combinedSubUnits={combinedSubUnits}
                      />
                    )
                  })}
                </Box>
              )
            }
          })}
        </Box>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={() => navigate('/evidenceLibrary')}
          disabled={isSubmitting}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={isSubmitting}
          sx={{
            borderRadius: 2,
            px: 3,
            textTransform: 'none',
            boxShadow: theme.shadows[2],
            '&:hover': {
              boxShadow: theme.shadows[4],
            },
          }}
        >
          {isSubmitting ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              Saving...
            </Box>
          ) : (
            'Save Changes'
          )}
        </Button>
      </Box>
    </Container>
  )
}

export default ViewEvidenceLibrary

