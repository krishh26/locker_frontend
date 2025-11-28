import { Box, Grid, Typography } from '@mui/material'
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { skipToken } from '@reduxjs/toolkit/query'
import jsonData from 'src/url.json'
import {
  useGetSamplePlansQuery,
  useLazyGetSamplePlanLearnersQuery,
  SamplePlanLearner,
  useApplySamplePlanLearnersMutation,
  useUpdateSamplePlanDetailMutation,
  useLazyGetPlanDetailsQuery,
} from 'app/store/api/sample-plan-api'
import { useUserId } from 'src/app/utils/userHelpers'
import { useDispatch } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'
import { FilterPanel } from './components/FilterPanel'
import { LearnersTable } from './components/LearnersTable'
import { UnitSelectionDialog } from './components/UnitSelectionDialog'
import { EditSampleModal } from './components/EditSampleModal'
import {
  assessmentMethods,
  assessmentMethodCodesForPayload,
  qaStatuses,
  iqaConclusionOptions,
  getAssessmentMethodByCode,
} from './constants'
import {
  useLazyGetSampleQuestionsQuery,
  useCreateSampleQuestionsMutation,
  useUpdateSampleQuestionMutation,
  useDeleteSampleQuestionMutation,
} from 'app/store/api/sample-plan-api'
import { countSelectedUnits } from './utils'
import type {
  PlanSummary,
  SelectedLearnerForUnits,
  ModalFormData,
  SampleQuestion,
} from './types'

const URL_BASE_LINK = jsonData.API_LOCAL_URL

const Index: React.FC = () => {
  const dispatch = useDispatch()
  const [courses, setCourses] = useState<Array<{ id: string; name: string }>>(
    []
  )
  const [plans, setPlans] = useState<Array<{ id: string; label: string }>>([])
  const [selectedMethods, setSelectedMethods] = useState<string[]>(
    assessmentMethods.map((method) => method.code)
  )
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  const [coursesLoading, setCoursesLoading] = useState<boolean>(false)
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState(qaStatuses[0])
  const [sampleType, setSampleType] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>('')
  const [dateTo, setDateTo] = useState<string>('')
  const [searchText, setSearchText] = useState<string>('')
  const [onlyIncomplete, setOnlyIncomplete] = useState<boolean>(false)
  const [filterApplied, setFilterApplied] = useState<boolean>(false)
  const [filterError, setFilterError] = useState<string>('')
  const [planSummary, setPlanSummary] = useState<PlanSummary>()
  const [unitSelectionDialogOpen, setUnitSelectionDialogOpen] =
    useState<boolean>(false)
  const [selectedLearnerForUnits, setSelectedLearnerForUnits] =
    useState<SelectedLearnerForUnits | null>(null)
  const [selectedUnitsMap, setSelectedUnitsMap] = useState<
    Record<string, Set<string>>
  >({})
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<number>(0)
  const [planDetailId, setPlanDetailId] = useState<string | number | null>(null)
  const [currentModalLearner, setCurrentModalLearner] =
    useState<SamplePlanLearner | null>(null)
  const [currentModalUnitKey, setCurrentModalUnitKey] = useState<string | null>(
    null
  )
  const [plannedDates, setPlannedDates] = useState<string[]>([])
  const [sampledLearners, setSampledLearners] = useState<
    Array<{
      detail_id: number
      learner_id: number
      learner_name: string
      sample_type: string
      status: string
      outcome: string | null
      feedback: string | null
      planned_date: string
      completed_date: string | null
      assessment_methods: Record<string, boolean>
      iqa_conclusion: Record<string, boolean> | null
      assessor_decision_correct: string | null
    }>
  >([])
  const [modalFormData, setModalFormData] = useState<ModalFormData>({
    qaName: '',
    plannedDate: '',
    assessmentMethods: ['TE'],
    assessmentProcesses: '',
    feedback: '',
    type: 'Formative',
    completedDate: '',
    sampleType: 'Learner interview',
    iqaConclusion: [],
    assessorDecisionCorrect: 'No',
  })
  const [sampleQuestions, setSampleQuestions] = useState<SampleQuestion[]>([
    { id: '1', question: 'Test', answer: 'Yes' },
  ])
  // Baseline snapshot to detect edits on Save
  const [originalQuestionsMap, setOriginalQuestionsMap] = useState<
    Record<string, { question: string; answer: 'Yes' | 'No' | '' }>
  >({})

  const [
    triggerSamplePlanLearners,
    {
      data: learnersResponse,
      isFetching: isLearnersFetching,
      isLoading: isLearnersLoading,
      isError: isLearnersError,
      error: learnersError,
    },
  ] = useLazyGetSamplePlanLearnersQuery()
  const [applySamplePlanLearners, { isLoading: isApplySamplesLoading }] =
    useApplySamplePlanLearnersMutation()
  const [updateSamplePlanDetail, { isLoading: isUpdatingSampleDetail }] =
    useUpdateSamplePlanDetailMutation()
  const [triggerGetSampleQuestions] = useLazyGetSampleQuestionsQuery()
  const [triggerGetPlanDetails] = useLazyGetPlanDetailsQuery()
  const [createSampleQuestions] = useCreateSampleQuestionsMutation()
  const [updateSampleQuestion] = useUpdateSampleQuestionMutation()
  const [deleteSampleQuestion] = useDeleteSampleQuestionMutation()

  const isLearnersInFlight = isLearnersFetching || isLearnersLoading

  const iqaId = useUserId()

  const samplePlanQueryArgs =
    selectedCourse && iqaId
      ? { course_id: selectedCourse, iqa_id: iqaId }
      : skipToken

  const {
    data: samplePlanResponse,
    isFetching: isPlansFetching,
    isLoading: isPlansLoading,
    isError: isPlansError,
  } = useGetSamplePlansQuery(samplePlanQueryArgs)

  const isPlanListLoading = isPlansFetching || isPlansLoading

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setCoursesLoading(true)
        const response = await axios.get(
          `${URL_BASE_LINK}/course/list?page=1&limit=500&meta=true`
        )
        const courseList = Array.isArray(response.data?.data)
          ? response.data.data
              .map((course: any) => ({
                id: course?.course_id ? course.course_id.toString() : '',
                name: course?.course_name || 'Untitled Course',
              }))
              .filter((course: { id: string }) => course.id)
          : []
        setCourses(courseList)
        setSelectedCourse((prev) => {
          const isValid =
            prev && courseList.some((course) => course.id === prev)
          if (!isValid) {
            setFilterApplied(false)
            return ''
          }
          return prev
        })
      } catch (error) {
        console.error('Failed to fetch courses:', error)
        setCourses([])
        setSelectedCourse('')
        setFilterApplied(false)
      } finally {
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [])

  useEffect(() => {
    if (!selectedCourse) {
      setPlans([])
      setSelectedPlan('')
      setFilterApplied(false)
      return
    }

    if (isPlanListLoading) {
      return
    }

    if (isPlansError) {
      setPlans([])
      setSelectedPlan('')
      setFilterApplied(false)
      return
    }

    const rawPlanDataSource =
      (samplePlanResponse as any)?.data ?? samplePlanResponse ?? null

    let rawPlans: Array<Record<string, any>> = []

    if (Array.isArray(rawPlanDataSource)) {
      rawPlans = rawPlanDataSource as Array<Record<string, any>>
    } else if (
      rawPlanDataSource &&
      typeof rawPlanDataSource === 'object' &&
      Object.keys(rawPlanDataSource).length > 0
    ) {
      rawPlans = [rawPlanDataSource as Record<string, any>]
    } else if (Array.isArray((samplePlanResponse as any)?.data?.data)) {
      rawPlans = ((samplePlanResponse as any).data.data ?? []) as Array<
        Record<string, any>
      >
    } else {
      const fallbackCandidate = samplePlanResponse as unknown
      if (Array.isArray(fallbackCandidate)) {
        rawPlans = fallbackCandidate as Array<Record<string, any>>
      }
    }

    if (rawPlans.length) {
      const normalizedPlans: Array<{ id: string; label: string }> = rawPlans
        .map((plan: Record<string, any>) => {
          const idCandidate =
            plan?.plan_id ??
            plan?.planId ??
            plan?.id ??
            plan?.sample_plan_id ??
            ''
          const nameCandidate =
            plan?.plan_name ??
            plan?.planName ??
            plan?.sample_plan_name ??
            plan?.title ??
            plan?.name ??
            ''

          const id =
            idCandidate !== null && idCandidate !== undefined
              ? String(idCandidate)
              : ''
          const label = nameCandidate
            ? String(nameCandidate)
            : id
            ? `Plan ${id}`
            : ''

          return {
            id,
            label,
          }
        })
        .filter((plan) => plan.id)

      const uniquePlans: Array<{ id: string; label: string }> = Array.from(
        new Map(normalizedPlans.map((plan) => [plan.id, plan])).values()
      )

      setPlans(uniquePlans)

      if (!uniquePlans.some((plan) => plan.id === selectedPlan)) {
        setSelectedPlan('')
        setFilterApplied(false)
      }
      return
    }

    setPlans([])
    setSelectedPlan('')
    setFilterApplied(false)
  }, [
    isPlanListLoading,
    isPlansError,
    samplePlanResponse,
    selectedCourse,
    selectedPlan,
  ])

  useEffect(() => {
    if (!learnersResponse || isLearnersInFlight) {
      return
    }

    // API response structure: { message, status, data: { plan_id, course_name, learners: [...] } }
    const responseData = (learnersResponse as any)?.data ?? learnersResponse

    if (
      responseData &&
      typeof responseData === 'object' &&
      !Array.isArray(responseData)
    ) {
      setPlanSummary((previous) => {
        const planIdValue =
          responseData?.plan_id ??
          responseData?.planId ??
          responseData?.id ??
          selectedPlan
        const courseNameValue =
          responseData?.course_name ??
          responseData?.courseName ??
          responseData?.name ??
          ''

        return {
          planId:
            planIdValue !== undefined && planIdValue !== null
              ? String(planIdValue)
              : selectedPlan || previous?.planId,
          courseName: courseNameValue
            ? String(courseNameValue)
            : previous?.courseName || '',
        }
      })
    } else if (filterApplied) {
      setPlanSummary((previous) => ({
        planId: selectedPlan || previous?.planId,
        courseName: previous?.courseName || '',
      }))
    }

    setFilterError('')
  }, [learnersResponse, isLearnersInFlight, filterApplied, selectedPlan])

  useEffect(() => {
    if (!isLearnersError) {
      return
    }

    const apiError = learnersError as any
    const message =
      apiError?.data?.message ||
      apiError?.error ||
      'Failed to fetch learners for the selected plan.'
    setFilterError(message)
    setFilterApplied(false)
    setPlanSummary(undefined)
  }, [isLearnersError, learnersError])

  const handleApplySamples = async () => {
    if (!selectedPlan) {
      setFilterError('Please select a plan before applying samples.')
      return
    }

    if (!sampleType) {
      setFilterError('Please select a sample type before applying samples.')
      return
    }

    if (!iqaId) {
      setFilterError(
        'Unable to determine current user. Please re-login and try again.'
      )
      return
    }

    if (isApplySamplesDisabled) {
      return
    }

    const learnersPayload = learnersData
      .map((row, rowIndex) => {
        const learnerId = row?.learner_id ?? row?.learnerId ?? row?.id ?? null
        const units = Array.isArray(row.units) ? row.units : []

        // Get selected units from selectedUnitsMap (source of truth)
        const learnerKey = `${row.learner_name ?? ''}-${rowIndex}`
        const selectedUnitsSet =
          selectedUnitsMap[learnerKey] || new Set<string>()

        const selectedUnits = units
          .filter((unit: any) => {
            if (!unit) return false
            // Only include units that are explicitly selected via checkbox
            // User must select units via checkboxes in the expanded table
            const unitKey = unit.unit_code || unit.unit_name || ''
            return unitKey && selectedUnitsSet.has(unitKey)
          })
          .map((unit, unitIndex) => {
            const unitIdRaw = unit?.unit_code ?? `${rowIndex}-${unitIndex}`
            const unitRefRaw = unit?.unit_name ?? unitIdRaw

            const unitId =
              String(unitIdRaw).trim() || `${rowIndex}-${unitIndex}`
            const unitRef = String(unitRefRaw).trim() || unitId

            return {
              id: unitId,
              unit_ref: unitRef,
            }
          })
          .filter((unit) => unit.unit_ref)

        if (!learnerId || !selectedUnits.length) {
          return null
        }

        const numericLearnerId = Number(learnerId)
        const learnerIdForRequest = Number.isFinite(numericLearnerId)
          ? numericLearnerId
          : learnerId

        return {
          learner_id: learnerIdForRequest,
          plannedDate: dateFrom ?? null,
          units: selectedUnits,
        }
      })
      .filter(Boolean) as Array<{
      learner_id: string | number
      plannedDate: string | null
      units: Array<{ id: string | number; unit_ref: string }>
    }>

    if (!learnersPayload.length) {
      setFilterError(
        'Select at least one learner with sampled units before applying.'
      )
      return
    }

    const assessmentMethodsPayload = assessmentMethodCodesForPayload.reduce(
      (accumulator, code) => {
        accumulator[code] = selectedMethods.includes(code)
        return accumulator
      },
      {} as Record<string, boolean>
    )

    const numericPlanId = Number(selectedPlan)
    const planIdForRequest = Number.isFinite(numericPlanId)
      ? numericPlanId
      : selectedPlan

    const payload = {
      plan_id: planIdForRequest,
      sample_type: sampleType,
      created_by: Number.isFinite(Number(iqaId)) ? Number(iqaId) : iqaId,
      assessment_methods: assessmentMethodsPayload,
      learners: learnersPayload,
    }

    try {
      const response = await applySamplePlanLearners(payload).unwrap()
      const successMessage =
        response?.message || 'Sampled learners added successfully.'

      dispatch(
        showMessage({
          message: successMessage,
          variant: 'success',
        })
      )

      setFilterError('')

      // Refresh the learners table data
      if (selectedPlan) {
        triggerSamplePlanLearners(selectedPlan)
      }
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.error ||
        'Failed to apply sampled learners.'
      setFilterError(message)
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
    }
  }

  const handleApplyRandomSamples = async () => {
    if (!selectedPlan) {
      setFilterError('Please select a plan before applying samples.')
      return
    }

    if (!sampleType) {
      setFilterError('Please select a sample type before applying samples.')
      return
    }

    if (!iqaId) {
      setFilterError(
        'Unable to determine current user. Please re-login and try again.'
      )
      return
    }

    if (isApplySamplesDisabled) {
      return
    }

    if (!dateFrom.trim()) {
      setFilterError('Planned Sample Date is required')
      return
    }

    if (!learnersData.length) {
      setFilterError('No learners available to apply random samples.')
      return
    }

    // Randomly select units for all learners based on risk_percentage
    const updatedSelectedUnitsMap: Record<string, Set<string>> = {}

    learnersData.forEach((row, rowIndex) => {
      const units = Array.isArray(row.units) ? row.units : []
      if (units.length === 0) {
        return
      }

      // Get risk_percentage (e.g., "50.00" or 50)
      const riskPercentageRaw = (row as any).risk_percentage
      const riskPercentage = riskPercentageRaw
        ? parseFloat(String(riskPercentageRaw))
        : 0

      // Calculate number of units to select based on risk percentage
      // If risk_percentage is 50, select 50% of units
      const totalUnits = units.length
      const unitsToSelect = Math.max(
        1,
        Math.round((riskPercentage / 100) * totalUnits)
      )

      // Get all unit keys
      const unitKeys = units
        .map((unit: any) => {
          const unitKey = unit.unit_code || unit.unit_name || ''
          return unitKey
        })
        .filter((key: string) => key)

      // Randomly shuffle and select the required number
      const shuffled = [...unitKeys].sort(() => Math.random() - 0.5)
      const selectedUnitKeys = shuffled.slice(0, unitsToSelect)

      // Store in the map
      const learnerKey = `${row.learner_name ?? ''}-${rowIndex}`
      updatedSelectedUnitsMap[learnerKey] = new Set(selectedUnitKeys)
    })

    // Update the selectedUnitsMap state
    setSelectedUnitsMap(updatedSelectedUnitsMap)

    // Now apply samples using the same logic as handleApplySamples
    const learnersPayload = learnersData
      .map((row, rowIndex) => {
        const learnerId = row?.learner_id ?? row?.learnerId ?? row?.id ?? null
        const units = Array.isArray(row.units) ? row.units : []

        // Get selected units from updated map
        const learnerKey = `${row.learner_name ?? ''}-${rowIndex}`
        const selectedUnitsSet =
          updatedSelectedUnitsMap[learnerKey] || new Set<string>()

        const selectedUnits = units
          .filter((unit: any) => {
            if (!unit) return false
            const unitKey = unit.unit_code || unit.unit_name || ''
            return unitKey && selectedUnitsSet.has(unitKey)
          })
          .map((unit, unitIndex) => {
            const unitIdRaw = unit?.unit_code ?? `${rowIndex}-${unitIndex}`
            const unitRefRaw = unit?.unit_name ?? unitIdRaw

            const unitId =
              String(unitIdRaw).trim() || `${rowIndex}-${unitIndex}`
            const unitRef = String(unitRefRaw).trim() || unitId

            return {
              id: unitId,
              unit_ref: unitRef,
            }
          })
          .filter((unit) => unit.unit_ref)

        if (!learnerId || !selectedUnits.length) {
          return null
        }

        const numericLearnerId = Number(learnerId)
        const learnerIdForRequest = Number.isFinite(numericLearnerId)
          ? numericLearnerId
          : learnerId

        return {
          learner_id: learnerIdForRequest,
          plannedDate: dateFrom ?? null,
          units: selectedUnits,
        }
      })
      .filter(Boolean) as Array<{
      learner_id: string | number
      plannedDate: string | null
      units: Array<{ id: string | number; unit_ref: string }>
    }>

    if (!learnersPayload.length) {
      setFilterError(
        'No learners with units available to apply random samples.'
      )
      return
    }

    const assessmentMethodsPayload = assessmentMethodCodesForPayload.reduce(
      (accumulator, code) => {
        accumulator[code] = selectedMethods.includes(code)
        return accumulator
      },
      {} as Record<string, boolean>
    )

    const numericPlanId = Number(selectedPlan)
    const planIdForRequest = Number.isFinite(numericPlanId)
      ? numericPlanId
      : selectedPlan

    const payload = {
      plan_id: planIdForRequest,
      sample_type: sampleType,
      created_by: Number.isFinite(Number(iqaId)) ? Number(iqaId) : iqaId,
      assessment_methods: assessmentMethodsPayload,
      learners: learnersPayload,
    }

    try {
      const response = await applySamplePlanLearners(payload).unwrap()
      const successMessage =
        response?.message || 'Random sampled learners added successfully.'

      dispatch(
        showMessage({
          message: successMessage,
          variant: 'success',
        })
      )

      setFilterError('')

      // Refresh the learners table data
      if (selectedPlan) {
        triggerSamplePlanLearners(selectedPlan)
      }
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.error ||
        'Failed to apply random sampled learners.'
      setFilterError(message)
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
    }
  }

  const learnersData: SamplePlanLearner[] = useMemo(() => {
    if (!learnersResponse) {
      return []
    }

    // API response structure: { message, status, data: { plan_id, course_name, units: [...], learners: [...] } }
    const responseData = (learnersResponse as any)?.data ?? learnersResponse

    // Extract all units from data.units (master list of all available units)
    // Remove duplicates based on unit_code
    const rawUnits = Array.isArray(responseData?.units)
      ? responseData.units
      : []
    
    const allUnitsMap = new Map<string, any>()
    rawUnits.forEach((unit: any) => {
      const unitCode = unit?.unit_code || ''
      if (unitCode && !allUnitsMap.has(unitCode)) {
        allUnitsMap.set(unitCode, unit)
      }
    })
    const allUnits = Array.from(allUnitsMap.values())

    // Extract learners array
    let learners: SamplePlanLearner[] = []
    if (Array.isArray(responseData?.learners)) {
      learners = responseData.learners as SamplePlanLearner[]
    } else if (Array.isArray(responseData)) {
      learners = responseData as SamplePlanLearner[]
    }

    if (!learners.length || !allUnits.length) {
      return learners.filter(Boolean)
    }

    // For each learner, merge all units from master list with their existing units
    return learners
      .filter(Boolean)
      .map((learner) => {
        const learnerUnits = Array.isArray(learner.units) ? learner.units : []
        
        // Create a map of learner's existing units by unit_code for quick lookup
        // Remove duplicates based on unit_code
        const learnerUnitsMap = new Map<string, any>()
        learnerUnits.forEach((unit: any) => {
          const unitCode = unit?.unit_code || ''
          if (unitCode && !learnerUnitsMap.has(unitCode)) {
            learnerUnitsMap.set(unitCode, unit)
          }
        })

        // Merge: use all units from master list, and if learner has that unit, use learner's data
        const mergedUnitsMap = new Map<string, any>()
        allUnits.forEach((masterUnit: any) => {
          const unitCode = masterUnit?.unit_code || ''
          if (!unitCode) return

          const learnerUnit = learnerUnitsMap.get(unitCode)

          if (learnerUnit) {
            // Learner has this unit - keep their data (including sample_history if it exists)
            mergedUnitsMap.set(unitCode, learnerUnit)
          } else {
            // Learner doesn't have this unit - add it with empty sample_history
            mergedUnitsMap.set(unitCode, {
              unit_code: masterUnit?.unit_code || '',
              unit_name: masterUnit?.unit_name || '',
              sample_history: [],
              ...masterUnit,
            })
          }
        })

        // Convert map back to array to maintain order and remove duplicates
        const mergedUnits = Array.from(mergedUnitsMap.values())

        return {
          ...learner,
          units: mergedUnits,
        }
      })
  }, [learnersResponse])

  // Check if planned_date exists in any learner's sample_history
  const hasPlannedDate = useMemo(() => {
    return learnersData.some((learner) => {
      // Check if learner has planned_date directly
      if (learner.planned_date != null) {
        return true
      }
      // Check if any unit has sample_history with planned_date
      if (Array.isArray(learner.units)) {
        return learner.units.some((unit: any) => {
          if (Array.isArray(unit?.sample_history)) {
            return unit.sample_history.some(
              (history: any) => history?.planned_date != null
            )
          }
          return false
        })
      }
      return false
    })
  }, [learnersData])

  // Get course name from planSummary or courses array
  const courseName = useMemo(() => {
    if (planSummary?.courseName) {
      return planSummary.courseName
    }
    if (selectedCourse) {
      const course = courses.find((c) => c.id === selectedCourse)
      return course?.name || ''
    }
    return ''
  }, [planSummary, selectedCourse, courses])

  // Update planned dates when sampledLearners changes
  useEffect(() => {
    if (sampledLearners.length > 0) {
      // Handle both planned_date and plannedDate property names
      // Keep all dates, including duplicates
      const dates = sampledLearners
        .map((entry: any) => entry.planned_date || entry.plannedDate)
        .filter(Boolean)

      // Update planned dates (keep duplicates, no sorting needed)
      setPlannedDates(dates)
    } else {
      // Fallback: Get unique planned dates from learners' sample_history
      const dates = new Set<string>()
      learnersData.forEach((learner) => {
        // Check learner's direct planned_date
        if (learner.planned_date) {
          dates.add(learner.planned_date)
        }
        // Check all units' sample_history for planned dates
        if (Array.isArray(learner.units)) {
          learner.units.forEach((unit: any) => {
            if (Array.isArray(unit?.sample_history)) {
              unit.sample_history.forEach((history: any) => {
                if (history?.planned_date) {
                  dates.add(history.planned_date)
                }
              })
            }
          })
        }
      })
      setPlannedDates(Array.from(dates))
    }
  }, [sampledLearners, learnersData])

  // Initialize selectedUnitsMap - start with empty selections
  // Units will only be selected when user explicitly checks them
  useEffect(() => {
    if (!learnersData.length) {
      return
    }

    // Reset selectedUnitsMap when learners data changes
    // This ensures checkboxes start unchecked
    setSelectedUnitsMap({})
  }, [learnersData])

  const visibleRows: SamplePlanLearner[] = useMemo(() => {
    if (!filterApplied) {
      return []
    }

    if (!searchText.trim()) {
      return learnersData
    }

    const lowered = searchText.toLowerCase()

    return learnersData.filter((row) => {
      const assessor = row?.assessor_name?.toLowerCase() ?? ''
      const learner = row?.learner_name?.toLowerCase() ?? ''
      const sampleType = row?.sample_type?.toLowerCase() ?? ''
      const status = row?.status?.toLowerCase() ?? ''

      return (
        assessor.includes(lowered) ||
        learner.includes(lowered) ||
        sampleType.includes(lowered) ||
        status.includes(lowered)
      )
    })
  }, [filterApplied, learnersData, searchText])

  const isApplySamplesDisabled =
    !filterApplied ||
    !selectedPlan ||
    !sampleType ||
    !learnersData.length ||
    isPlanListLoading ||
    isLearnersInFlight ||
    isApplySamplesLoading

  const planPlaceholderText = useMemo(() => {
    if (!selectedCourse) {
      return 'Select a course first'
    }
    if (isPlanListLoading) {
      return 'Loading plans...'
    }
    if (isPlansError) {
      return 'Unable to load plans'
    }
    if (!plans.length) {
      return 'No plans available'
    }
    return 'Select a plan'
  }, [isPlanListLoading, isPlansError, plans.length, selectedCourse])

  const toggleMethod = (code: string) => {
    setSelectedMethods((prev) =>
      prev.includes(code)
        ? prev.filter((item) => item !== code)
        : [...prev, code]
    )
  }

  const resetFilters = () => {
    setSelectedMethods(assessmentMethods.map((method) => method.code))
    setSelectedCourse('')
    setPlans([])
    setSelectedPlan('')
    setSelectedStatus(qaStatuses[0])
    setSampleType('')
    setDateFrom('')
    setDateTo('')
    setSearchText('')
    setOnlyIncomplete(false)
    setFilterApplied(false)
    setFilterError('')
    setPlanSummary(undefined)
  }

  const handleApplyFilter = () => {
    if (!selectedCourse) {
      setFilterError('Please select a course before filtering.')
      setFilterApplied(false)
      return
    }

    if (!plans.length) {
      setFilterError('No QA plans are available for the selected course.')
      setFilterApplied(false)
      return
    }

    if (!selectedPlan || !plans.some((plan) => plan.id === selectedPlan)) {
      setFilterError('Please select both a course and a plan before filtering.')
      setFilterApplied(false)
      return
    }
    setFilterError('')
    setPlanSummary(undefined)
    setFilterApplied(true)
    triggerSamplePlanLearners(selectedPlan)
  }

  const handleOpenUnitSelectionDialog = (
    learner: SamplePlanLearner,
    learnerIndex: number
  ) => {
    setSelectedLearnerForUnits({ learner, learnerIndex })
    const learnerKey = `${learner.learner_name ?? ''}-${learnerIndex}`

    // Initialize with empty selections if they don't exist
    // Checkboxes will start unchecked and only be checked when user toggles them
    if (!selectedUnitsMap[learnerKey]) {
      setSelectedUnitsMap((prev) => ({
        ...prev,
        [learnerKey]: new Set<string>(),
      }))
    }

    setUnitSelectionDialogOpen(true)
  }

  const handleCloseUnitSelectionDialog = () => {
    setUnitSelectionDialogOpen(false)
    setSelectedLearnerForUnits(null)
  }

  const handleUnitToggle = (unitKey: string) => {
    if (!selectedLearnerForUnits) return

    const learnerKey = `${selectedLearnerForUnits.learner.learner_name ?? ''}-${
      selectedLearnerForUnits.learnerIndex
    }`
    setSelectedUnitsMap((prev) => {
      const current = prev[learnerKey] || new Set<string>()
      const updated = new Set(current)

      if (updated.has(unitKey)) {
        updated.delete(unitKey)
      } else {
        updated.add(unitKey)
      }

      return {
        ...prev,
        [learnerKey]: updated,
      }
    })
  }

  // Handle unit toggle from expanded table (without opening dialog)
  const handleUnitToggleFromTable = (
    learner: SamplePlanLearner,
    learnerIndex: number,
    unitKey: string
  ) => {
    const learnerKey = `${learner.learner_name ?? ''}-${learnerIndex}`
    setSelectedUnitsMap((prev) => {
      const current = prev[learnerKey] || new Set<string>()
      const updated = new Set(current)

      if (updated.has(unitKey)) {
        updated.delete(unitKey)
      } else {
        updated.add(unitKey)
      }

      return {
        ...prev,
        [learnerKey]: updated,
      }
    })
  }

  const handleSaveUnitSelection = () => {
    if (!selectedLearnerForUnits) return

    // The selectedUnitsMap already contains the updated selections
    // No need to mutate the read-only learner object
    handleCloseUnitSelectionDialog()
  }

  const getSelectedUnitsForLearner = (
    learner: SamplePlanLearner,
    learnerIndex: number
  ): Set<string> => {
    const learnerKey = `${learner.learner_name ?? ''}-${learnerIndex}`
    return selectedUnitsMap[learnerKey] || new Set<string>()
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setCurrentModalLearner(null)
    setCurrentModalUnitKey(null)
  }

  const handleCreateNew = async () => {
    if (!selectedPlan) {
      dispatch(
        showMessage({
          message: 'Please select a plan before creating a new entry.',
          variant: 'error',
        })
      )
      return
    }

    if (!iqaId) {
      dispatch(
        showMessage({
          message:
            'Unable to determine current user. Please re-login and try again.',
          variant: 'error',
        })
      )
      return
    }

    if (!currentModalLearner) {
      dispatch(
        showMessage({
          message: 'No learner selected.',
          variant: 'error',
        })
      )
      return
    }

    if (!currentModalUnitKey) {
      dispatch(
        showMessage({
          message: 'No unit selected. Please select a unit first.',
          variant: 'error',
        })
      )
      return
    }

    // Get the unit from the learner's units
    const units = Array.isArray(currentModalLearner.units)
      ? currentModalLearner.units
      : []
    const selectedUnit = units.find(
      (u: any) => (u.unit_code || u.unit_name) === currentModalUnitKey
    )

    if (!selectedUnit) {
      dispatch(
        showMessage({
          message: 'Selected unit not found.',
          variant: 'error',
        })
      )
      return
    }

    // Build unit payload
    const unitIdRaw = selectedUnit?.unit_code ?? selectedUnit?.unit_name ?? ''
    const unitRefRaw = selectedUnit?.unit_name ?? unitIdRaw
    const unitId = String(unitIdRaw).trim() || ''
    const unitRef = String(unitRefRaw).trim() || unitId

    if (!unitRef) {
      dispatch(
        showMessage({
          message: 'Invalid unit information.',
          variant: 'error',
        })
      )
      return
    }

    // Get learner ID
    const learnerId =
      currentModalLearner?.learner_id ??
      currentModalLearner?.learnerId ??
      currentModalLearner?.id ??
      null
    if (!learnerId) {
      dispatch(
        showMessage({
          message: 'Learner ID not found.',
          variant: 'error',
        })
      )
      return
    }

    const numericLearnerId = Number(learnerId)
    const learnerIdForRequest = Number.isFinite(numericLearnerId)
      ? numericLearnerId
      : learnerId

    // Get planned date from active tab or form data
    const plannedDate = new Date().toISOString()

    // Get sample type from form data or use default
    const sampleTypeForRequest = modalFormData.sampleType || 'Learner interview'


    const assessmentMethodsPayload = assessmentMethodCodesForPayload.reduce(
      (accumulator, code) => {
        accumulator[code] = false
        return accumulator
      },
      {} as Record<string, boolean>
    )

    // Build learners payload
    const learnersPayload = [
      {
        learner_id: learnerIdForRequest,
        plannedDate: plannedDate,
        units: [
          {
            id: unitId,
            unit_ref: unitRef,
          },
        ],
      },
    ]

    const numericPlanId = Number(selectedPlan)
    const planIdForRequest = Number.isFinite(numericPlanId)
      ? numericPlanId
      : selectedPlan

    const payload = {
      plan_id: planIdForRequest,
      sample_type: sampleTypeForRequest,
      created_by: Number.isFinite(Number(iqaId)) ? Number(iqaId) : iqaId,
      assessment_methods: assessmentMethodsPayload,
      learners: learnersPayload,
    }

    applySamplePlanLearners(payload).then((result) => {
      dispatch(showMessage({ message: 'New entry created successfully.', variant: 'success' }))
      if (selectedPlan) {
        // First refresh learners to get updated unit sample_history
        triggerSamplePlanLearners(selectedPlan)
        handleCloseModal()
          
      }
    }).catch((error: any) => {
      dispatch(showMessage({ message: error?.data?.message || error?.error || 'Failed to create new entry.', variant: 'error' }))
    })
  }

  const handleModalFormChange = (field: string, value: any) => {
    setModalFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAssessmentMethodToggle = (code: string) => {
    setModalFormData((prev) => {
      const methods = prev.assessmentMethods.includes(code)
        ? prev.assessmentMethods.filter((m) => m !== code)
        : [...prev.assessmentMethods, code]
      return { ...prev, assessmentMethods: methods }
    })
  }

  const handleIqaConclusionToggle = (option: string) => {
    setModalFormData((prev) => {
      const conclusions = prev.iqaConclusion.includes(option)
        ? prev.iqaConclusion.filter((c) => c !== option)
        : [...prev.iqaConclusion, option]
      return { ...prev, iqaConclusion: conclusions }
    })
  }

  const handleQuestionChange = (id: string, question: string) => {
    setSampleQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, question } : q))
    )
  }

  const handleAnswerChange = (id: string, answer: 'Yes' | 'No') => {
    setSampleQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, answer } : q))
    )
  }

  const handleAddQuestion = () => {
    const newId = `new-${Date.now()}`
    setSampleQuestions((prev) => [
      ...prev,
      { id: newId, question: '', answer: '' },
    ])
  }

  const handleDeleteQuestion = async (id: string) => {
    const isNew = String(id).startsWith('new-')
    if (!isNew) {
      try {
        await deleteSampleQuestion(id).unwrap()
        dispatch(
          showMessage({
            message: 'Question deleted successfully.',
            variant: 'success',
          })
        )
      } catch (error: any) {
        const message = error?.data?.message || 'Failed to delete question.'
        dispatch(showMessage({ message, variant: 'error' }))
        return
      }
    }
    setSampleQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const handleSaveQuestions = async () => {
    if (!planDetailId || !iqaId) {
      dispatch(
        showMessage({
          message: 'Missing plan or user info to save questions.',
          variant: 'error',
        })
      )
      return
    }

    try {
      // Filter out questions without answers (empty answers)
      const questionsWithAnswers = sampleQuestions.filter(
        (q) => q.answer && (q.answer === 'Yes' || q.answer === 'No')
      )

      if (questionsWithAnswers.length === 0) {
        dispatch(
          showMessage({
            message: 'Please answer at least one question before saving.',
            variant: 'warning',
          })
        )
        return
      }

      // Separate new questions (those starting with 'new-') from existing ones
      const newQuestions = questionsWithAnswers.filter((q) =>
        String(q.id).startsWith('new-')
      )

      const existingQuestions = questionsWithAnswers.filter(
        (q) => !String(q.id).startsWith('new-')
      )

      // Create new questions (including IQA-based questions that were added)
      if (newQuestions.length > 0) {
        await createSampleQuestions({
          plan_detail_id: planDetailId,
          answered_by_id: iqaId,
          questions: newQuestions.map((q) => ({
            question_text: q.question,
            answer: q.answer || '',
          })),
        }).unwrap()
      }

      // Update existing questions (only if they changed)
      if (existingQuestions.length > 0) {
        const changed = existingQuestions.filter((q) => {
          const baseline = originalQuestionsMap[String(q.id)]
          if (!baseline) return true
          const currAns = (q.answer || '') as 'Yes' | 'No' | ''
          return baseline.question !== q.question || baseline.answer !== currAns
        })
        if (changed.length > 0) {
          await Promise.all(
            changed.map((q) =>
              updateSampleQuestion({
                id: q.id,
                question_text: q.question,
                answer: q.answer || '',
              }).unwrap()
            )
          )
        }
      }

      // Refresh questions from server to get updated IDs
      if (planDetailId) {
        const res = await triggerGetSampleQuestions(planDetailId).unwrap()
        const list = Array.isArray(res?.data) ? res.data : []
        const mapped = list.map((q: any) => ({
          id: String(q.id),
          question: q.question_text ?? '',
          answer: (q.answer as 'Yes' | 'No' | '') ?? '',
        }))
        setSampleQuestions(mapped)
        // Reset baseline
        const baseline: Record<
          string,
          { question: string; answer: 'Yes' | 'No' | '' }
        > = {}
        mapped.forEach((q) => {
          baseline[String(q.id)] = {
            question: q.question,
            answer: (q.answer || '') as any,
          }
        })
        setOriginalQuestionsMap(baseline)
      }

      dispatch(
        showMessage({
          message: 'Sample questions saved successfully.',
          variant: 'success',
        })
      )
    } catch (error: any) {
      const message =
        error?.data?.message || error?.error || 'Failed to save questions.'
      dispatch(showMessage({ message, variant: 'error' }))
    }
  }

  // Helper function to populate form data from sampled_learners entry
  const populateFormDataFromSampledLearner = (sampledLearner: any) => {
    // Convert assessment_methods object to array of codes
    const assessmentMethodsArray: string[] = []
    if (
      sampledLearner.assessment_methods &&
      typeof sampledLearner.assessment_methods === 'object'
    ) {
      Object.entries(sampledLearner.assessment_methods).forEach(
        ([code, value]) => {
          if (value === true) {
            assessmentMethodsArray.push(code)
          }
        }
      )
    }

    // Convert iqa_conclusion object to array
    const iqaConclusionArray: string[] = []
    if (
      sampledLearner.iqa_conclusion &&
      typeof sampledLearner.iqa_conclusion === 'object'
    ) {
      Object.entries(sampledLearner.iqa_conclusion).forEach(([key, value]) => {
        if (value === true) {
          iqaConclusionArray.push(key)
        }
      })
    }

    setModalFormData({
      qaName: sampledLearner.learner_name || '',
      plannedDate: sampledLearner.planned_date || '',
      assessmentMethods: assessmentMethodsArray,
      assessmentProcesses: '',
      feedback: sampledLearner.feedback || '',
      type: '',
      completedDate: sampledLearner.completed_date || '',
      sampleType: sampledLearner.sample_type || '',
      iqaConclusion: iqaConclusionArray,
      assessorDecisionCorrect: sampledLearner.assessor_decision_correct || 'No',
    })

    // Set planDetailId to detail_id for this entry
    setPlanDetailId(sampledLearner.detail_id)
  }

  const handleOpenLearnerDetailsDialog = (
    learner: SamplePlanLearner,
    learnerIndex: number,
    detailId?: string | number,
    unitKey?: string
  ) => {
    // Store current learner and unit for Create New functionality
    setCurrentModalLearner(learner)
    setCurrentModalUnitKey(unitKey || null)

    // Call API to get plan details - always use selectedPlan
    if (selectedPlan) {
      triggerGetPlanDetails(selectedPlan)
        .unwrap()
        .then((res: any) => {
          const data = res?.data || {}

          // Store sampled_learners array
          let learners = Array.isArray(data.sampled_learners)
            ? data.sampled_learners
            : []

          // If unitKey is provided, filter to only show entries for that unit
          if (unitKey && learner.units) {
            const unit = Array.isArray(learner.units)
              ? learner.units.find(
                  (u: any) => (u.unit_code || u.unit_name) === unitKey
                )
              : null

            if (unit && Array.isArray(unit.sample_history)) {
              // Get all detail_ids from this unit's sample_history
              const unitDetailIds = new Set(
                unit.sample_history
                  .map((h: any) => h.detail_id)
                  .filter((id: any) => id != null)
              )

              // Filter sampled_learners to only include entries with detail_ids from this unit
              learners = learners.filter((entry: any) =>
                unitDetailIds.has(Number(entry.detail_id))
              )
            }
          }

          setSampledLearners(learners)

          // Find the specific entry by detail_id if provided, otherwise use first entry
          let selectedEntry = null
          if (detailId) {
            selectedEntry = learners.find(
              (entry: any) => entry.detail_id === Number(detailId)
            )
          }

          // If no match found or no detailId provided, use first entry
          if (!selectedEntry && learners.length > 0) {
            selectedEntry = learners[0]
            setActiveTab(0)
          } else if (selectedEntry) {
            // Find the index of the selected entry for tab
            const tabIndex = learners.findIndex(
              (entry: any) => entry.detail_id === selectedEntry.detail_id
            )
            setActiveTab(tabIndex >= 0 ? tabIndex : 0)
          }

          // Populate form data from selected entry
          if (selectedEntry) {
            populateFormDataFromSampledLearner(selectedEntry)
          } else {
            // Fallback if no entries
            setModalFormData({
              qaName: learner.assessor_name || '',
              plannedDate: '',
              assessmentMethods: [],
              assessmentProcesses: '',
              feedback: '',
              type: '',
              completedDate: '',
              sampleType: '',
              iqaConclusion: [],
              assessorDecisionCorrect: 'No',
            })
          }

          setModalOpen(true)
        })
        .catch((error: any) => {
          const message =
            error?.data?.message ||
            error?.error ||
            'Failed to load plan details.'
          dispatch(showMessage({ message, variant: 'error' }))
          // Fallback to learner data if API fails
          setModalFormData({
            qaName: learner.assessor_name || '',
            plannedDate: '',
            assessmentMethods: [],
            assessmentProcesses: '',
            feedback: '',
            type: '',
            completedDate: '',
            sampleType: '',
            iqaConclusion: [],
            assessorDecisionCorrect: 'No',
          })
          setModalOpen(true)
        })
    }

    // Load existing questions for this plan detail - always use selectedPlan
    if (selectedPlan) {
      triggerGetSampleQuestions(selectedPlan)
        .unwrap()
        .then((res: any) => {
          const list = Array.isArray(res?.data) ? res.data : []
          const mapped = list.map((q: any) => ({
            id: String(q.id),
            question: q.question_text ?? '',
            answer: (q.answer as 'Yes' | 'No' | '') ?? '',
          }))
          setSampleQuestions(mapped)
          // Capture baseline for change detection
          const baseline: Record<
            string,
            { question: string; answer: 'Yes' | 'No' | '' }
          > = {}
          mapped.forEach((q) => {
            baseline[String(q.id)] = {
              question: q.question,
              answer: (q.answer || '') as any,
            }
          })
          setOriginalQuestionsMap(baseline)
        })
        .catch(() => {
          setSampleQuestions([])
          setOriginalQuestionsMap({})
        })
    }
  }

  // Handle tab change - update form data based on selected tab
  const handleTabChange = (newTabIndex: number) => {
    setActiveTab(newTabIndex)

    if (sampledLearners.length > 0 && sampledLearners[newTabIndex]) {
      const selectedEntry = sampledLearners[newTabIndex]
      populateFormDataFromSampledLearner(selectedEntry)

      // Load questions - always use selectedPlan for API call
      if (selectedPlan) {
        triggerGetSampleQuestions(selectedPlan)
          .unwrap()
          .then((res: any) => {
            const list = Array.isArray(res?.data) ? res.data : []
            const mapped = list.map((q: any) => ({
              id: String(q.id),
              question: q.question_text ?? '',
              answer: (q.answer as 'Yes' | 'No' | '') ?? '',
            }))
            setSampleQuestions(mapped)
            // Capture baseline for change detection
            const baseline: Record<
              string,
              { question: string; answer: 'Yes' | 'No' | '' }
            > = {}
            mapped.forEach((q) => {
              baseline[String(q.id)] = {
                question: q.question,
                answer: (q.answer || '') as any,
              }
            })
            setOriginalQuestionsMap(baseline)
          })
          .catch(() => {
            setSampleQuestions([])
            setOriginalQuestionsMap({})
          })
      }
    }
  }

  const handleSaveSampleDetail = async () => {
    if (!selectedPlan || !planDetailId) {
      dispatch(
        showMessage({
          message: 'Please select a plan and detail before saving.',
          variant: 'error',
        })
      )
      return
    }

    try {
      // Convert assessmentMethods array to object format
      // Map display codes (WO, WP, etc.) to assessment method IDs (DO, WT, etc.)
      const assessmentMethodsObj: Record<string, boolean> = {}
      modalFormData.assessmentMethods.forEach((code) => {
        const method = getAssessmentMethodByCode(code)
        const methodId = method?.assessmentMethodId || code
        assessmentMethodsObj[methodId] = true
      })

      // Also include all other assessment method IDs as false if not selected
      assessmentMethodCodesForPayload.forEach((methodId) => {
        if (!(methodId in assessmentMethodsObj)) {
          assessmentMethodsObj[methodId] = false
        }
      })

      // Convert iqaConclusion array to object format
      const iqaConclusionObj: Record<string, any> = {}
      iqaConclusionOptions.forEach((conclusion) => {
        iqaConclusionObj[conclusion] =
          modalFormData.iqaConclusion.includes(conclusion)
      })

      // Convert assessorDecisionCorrect string to boolean
      const assessorDecisionCorrect =
        modalFormData.assessorDecisionCorrect === 'Yes'
      const payload = {
        plan_id: planDetailId,
        completedDate: modalFormData.completedDate || undefined,
        feedback: modalFormData.feedback || undefined,
        status: modalFormData.type || undefined,
        assessment_methods:
          Object.keys(assessmentMethodsObj).length > 0
            ? assessmentMethodsObj
            : undefined,
        iqa_conclusion:
          Object.keys(iqaConclusionObj).length > 0
            ? iqaConclusionObj
            : undefined,
        assessor_decision_correct: assessorDecisionCorrect,
        sample_type: modalFormData.sampleType || undefined,
        plannedDate: modalFormData.plannedDate || undefined,
        type: modalFormData.type || undefined,
      }

      const response = await updateSamplePlanDetail(payload).unwrap()
      const successMessage =
        response?.message || 'Sample plan detail saved successfully.'

      dispatch(
        showMessage({
          message: successMessage,
          variant: 'success',
        })
      )

      // Refresh the plan details to get updated sampled_learners
      if (selectedPlan) {
        triggerGetPlanDetails(selectedPlan)
          .unwrap()
          .then((res: any) => {
            const data = res?.data || {}
            const learners = Array.isArray(data.sampled_learners)
              ? data.sampled_learners
              : []
            setSampledLearners(learners)

            // Update current tab's data
            if (learners[activeTab]) {
              populateFormDataFromSampledLearner(learners[activeTab])
            }
          })
          .catch(() => {
            // Silently fail refresh
          })

        triggerSamplePlanLearners(selectedPlan, true)
      }

      // Don't close modal, just refresh data
    } catch (error: any) {
      const message =
        error?.data?.message ||
        error?.error ||
        'Failed to save sample plan detail.'
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
    }
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: '100%', margin: '0 auto' }}>
      <Typography variant='h4' sx={{ fontWeight: 600, mb: 2 }}>
        QA Sample Plan
      </Typography>
      <Typography variant='body1' color='text.secondary' sx={{ mb: 3 }}>
        Manage sampling plans, monitor assessor activity and keep QA
        stakeholders aligned. Configure the parameters on the left, filter the
        learner plan list on the right, and export your selections in one click.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={4}>
          <FilterPanel
            selectedMethods={selectedMethods}
            onToggleMethod={toggleMethod}
            onSelectAllMethods={() =>
              setSelectedMethods(assessmentMethods.map((method) => method.code))
            }
            onDeselectAllMethods={() => setSelectedMethods([])}
            sampleType={sampleType}
            onSampleTypeChange={setSampleType}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            onApplySamples={handleApplySamples}
            isApplySamplesDisabled={isApplySamplesDisabled}
            isApplySamplesLoading={isApplySamplesLoading}
            onApplyRandomSamples={handleApplyRandomSamples}
            isApplyRandomSamplesLoading={isApplySamplesLoading}
          />
        </Grid>

        <Grid item xs={12} lg={8}>
          <LearnersTable
            courses={courses}
            selectedCourse={selectedCourse}
            onCourseChange={(courseId) => {
              setSelectedCourse(courseId)
              setPlans([])
              setSelectedPlan('')
              setFilterApplied(false)
              setFilterError('')
              setPlanSummary(undefined)
            }}
            coursesLoading={coursesLoading}
            plans={plans}
            selectedPlan={selectedPlan}
            onPlanChange={(planId) => {
              setSelectedPlan(planId)
              setFilterApplied(false)
              setFilterError('')
              setPlanSummary(undefined)
            }}
            planPlaceholderText={planPlaceholderText}
            isPlanListLoading={isPlanListLoading}
            isPlansError={isPlansError}
            selectedStatus={selectedStatus}
            onStatusChange={setSelectedStatus}
            onlyIncomplete={onlyIncomplete}
            onOnlyIncompleteChange={setOnlyIncomplete}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            searchText={searchText}
            onSearchTextChange={setSearchText}
            filterApplied={filterApplied}
            isLearnersInFlight={isLearnersInFlight}
            isLearnersError={isLearnersError}
            filterError={filterError}
            planSummary={planSummary}
            visibleRows={visibleRows}
            onApplyFilter={handleApplyFilter}
            onResetFilters={resetFilters}
            onOpenUnitSelectionDialog={handleOpenUnitSelectionDialog}
            getSelectedUnitsForLearner={getSelectedUnitsForLearner}
            countSelectedUnits={countSelectedUnits}
            hasPlannedDate={hasPlannedDate}
            courseName={courseName}
            onOpenLearnerDetailsDialog={handleOpenLearnerDetailsDialog}
            onUnitToggle={handleUnitToggleFromTable}
          />
        </Grid>
      </Grid>

      <UnitSelectionDialog
        open={unitSelectionDialogOpen}
        onClose={handleCloseUnitSelectionDialog}
        selectedLearnerForUnits={selectedLearnerForUnits}
        selectedUnitsMap={selectedUnitsMap}
        onUnitToggle={handleUnitToggle}
        onSave={handleSaveUnitSelection}
      />

      <EditSampleModal
        open={modalOpen}
        onClose={handleCloseModal}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        modalFormData={modalFormData}
        onFormDataChange={handleModalFormChange}
        onAssessmentMethodToggle={handleAssessmentMethodToggle}
        onIqaConclusionToggle={handleIqaConclusionToggle}
        sampleQuestions={sampleQuestions}
        onQuestionChange={handleQuestionChange}
        onAnswerChange={handleAnswerChange}
        onAddQuestion={handleAddQuestion}
        onDeleteQuestion={handleDeleteQuestion}
        onSaveQuestions={handleSaveQuestions}
        plannedDates={plannedDates}
        onSave={handleSaveSampleDetail}
        isSaving={isUpdatingSampleDetail}
        planDetailId={planDetailId}
        onCreateNew={handleCreateNew}
        isCreating={isApplySamplesLoading}
        onDeleteSuccess={() => {
          if (selectedPlan) {
            triggerSamplePlanLearners(selectedPlan)
          }
        }}
      />
    </Box>
  )
}

export default Index
