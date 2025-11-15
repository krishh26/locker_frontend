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
          .filter((unit) => {
            if (!unit) return false
            // Check both the original is_selected flag and the selectedUnitsMap
            const unitKey = unit.unit_code || unit.unit_name || ''
            return (
              unit.is_selected === true ||
              (unitKey && selectedUnitsSet.has(unitKey))
            )
          })
          .map((unit, unitIndex) => {
            const unitIdRaw = unit?.unit_code ?? `${rowIndex}-${unitIndex}`
            const unitRefRaw = unit?.unit_name ?? unitIdRaw

            const unitId = String(unitIdRaw).trim() || `${rowIndex}-${unitIndex}`
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
      if (selectedPlan) {
        triggerSamplePlanLearners(selectedPlan, true)
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

  const learnersData: SamplePlanLearner[] = useMemo(() => {
    if (!learnersResponse) {
      return []
    }

    const responseData = (learnersResponse as any)?.data ?? learnersResponse

    if (Array.isArray(responseData?.learners)) {
      return (responseData.learners as SamplePlanLearner[]).filter(Boolean)
    }

    if (Array.isArray(responseData)) {
      return (responseData as SamplePlanLearner[]).filter(Boolean)
    }

    return []
  }, [learnersResponse])

  // Check if planned_date exists in any learner
  const hasPlannedDate = useMemo(() => {
    return learnersData.some((learner) => learner.planned_date != null)
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

  // Get unique planned dates from learners
  const plannedDates = useMemo(() => {
    const dates = new Set<string>()
    learnersData.forEach((learner) => {
      if (learner.planned_date) {
        dates.add(learner.planned_date)
      }
    })
    return Array.from(dates).sort((a, b) => {
      const dateA = new Date(a).getTime()
      const dateB = new Date(b).getTime()
      return dateA - dateB
    })
  }, [learnersData])

  // Initialize selectedUnitsMap from API response
  useEffect(() => {
    if (!learnersData.length) {
      return
    }

    const newMap: Record<string, Set<string>> = {}
    learnersData.forEach((learner, index) => {
      const learnerKey = `${learner.learner_name ?? ''}-${index}`
      const selectedSet = new Set<string>()

      if (Array.isArray(learner.units)) {
        learner.units.forEach((unit) => {
          if (unit?.is_selected) {
            const unitKey = unit.unit_code || unit.unit_name || ''
            if (unitKey) {
              selectedSet.add(unitKey)
            }
          }
        })
      }

      if (selectedSet.size > 0) {
        newMap[learnerKey] = selectedSet
      }
    })

    setSelectedUnitsMap((prev) => {
      // Merge with existing selections to preserve user changes
      const merged = { ...prev }
      Object.keys(newMap).forEach((key) => {
        if (!merged[key]) {
          merged[key] = newMap[key]
        }
      })
      return merged
    })
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
    const existingSelections = selectedUnitsMap[learnerKey] || new Set<string>()

    // Initialize with current selections from the learner's units
    if (Array.isArray(learner.units)) {
      learner.units.forEach((unit) => {
        if (unit?.is_selected) {
          const unitKey = unit.unit_code || unit.unit_name || ''
          if (unitKey) {
            existingSelections.add(unitKey)
          }
        }
      })
    }

    setSelectedUnitsMap((prev) => ({
      ...prev,
      [learnerKey]: existingSelections,
    }))
    setUnitSelectionDialogOpen(true)
  }

  const handleCloseUnitSelectionDialog = () => {
    setUnitSelectionDialogOpen(false)
    setSelectedLearnerForUnits(null)
  }

  const handleUnitToggle = (unitKey: string) => {
    if (!selectedLearnerForUnits) return

    const learnerKey = `${selectedLearnerForUnits.learner.learner_name ?? ''}-${selectedLearnerForUnits.learnerIndex
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
    const newId = String(Date.now())
    setSampleQuestions((prev) => [
      ...prev,
      { id: newId, question: '', answer: '' },
    ])
  }

  const handleDeleteQuestion = (id: string) => {
    setSampleQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  const handleSaveQuestions = () => {
    dispatch(
      showMessage({
        message: 'Sample questions saved successfully.',
        variant: 'success',
      })
    )
  }

  const handleOpenLearnerDetailsDialog = (learner: SamplePlanLearner, learnerIndex: number) => {
    // Use learner.id as plan_detail_id (this might need adjustment based on actual API response)
    setPlanDetailId(selectedPlan)
    setModalFormData({
      qaName: learner.assessor_name as string ?? '',
      plannedDate: learner.planned_date ?? '',
      assessmentMethods: learner.assessment_methods as string[] ?? [],
      assessmentProcesses: learner.assessment_processes as string ?? '',
      feedback: learner.feedback as string ?? '',
      type: learner.type as string ?? '',
      completedDate: learner.completed_date as string ?? '',
      sampleType: learner.sample_type as string ?? '',
      iqaConclusion: learner.iqa_conclusion as string[] ?? [],
      assessorDecisionCorrect: learner.assessor_decision_correct as 'Yes' | 'No' | '' || '',
    })
    setModalOpen(true)
  }

  const handleSaveSampleDetail = async () => {
    if (!selectedPlan) {
      dispatch(
        showMessage({
          message: 'Please select a plan before saving.',
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
        iqaConclusionObj[conclusion] = modalFormData.iqaConclusion.includes(conclusion)
      })

      // Convert assessorDecisionCorrect string to boolean
      const assessorDecisionCorrect = modalFormData.assessorDecisionCorrect === 'Yes'

      const payload = {
        plan_id: selectedPlan,
        completedDate: modalFormData.completedDate || undefined,
        feedback: modalFormData.feedback || undefined,
        status: modalFormData.type || undefined,
        assessment_methods: Object.keys(assessmentMethodsObj).length > 0 ? assessmentMethodsObj : undefined,
        iqa_conclusion: Object.keys(iqaConclusionObj).length > 0 ? iqaConclusionObj : undefined,
        assessor_decision_correct: assessorDecisionCorrect,
        sample_type: modalFormData.sampleType || undefined,
        plannedDate: modalFormData.plannedDate || undefined,
        type: modalFormData.type || undefined
      }

      const response = await updateSamplePlanDetail(payload).unwrap()
      const successMessage = response?.message || 'Sample plan detail saved successfully.'

      dispatch(
        showMessage({
          message: successMessage,
          variant: 'success',
        })
      )

      if (selectedPlan) {
        triggerSamplePlanLearners(selectedPlan, true)
      }

      setModalOpen(false)
    } catch (error: any) {
      const message =
        error?.data?.message || error?.error || 'Failed to save sample plan detail.'
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
        onTabChange={setActiveTab}
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
      />
    </Box>
  )
}

export default Index
