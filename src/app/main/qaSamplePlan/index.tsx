import {
  Box,
  Button,
  Card,
  Checkbox,
  Chip,
  Dialog,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import type { ChipProps } from '@mui/material/Chip'
import Autocomplete from '@mui/material/Autocomplete'
import CircularProgress from '@mui/material/CircularProgress'
import CloseIcon from '@mui/icons-material/Close'
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined'
import FolderSharedOutlinedIcon from '@mui/icons-material/FolderSharedOutlined'
import FilterListOutlinedIcon from '@mui/icons-material/FilterListOutlined'
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import RefreshIcon from '@mui/icons-material/Refresh'
import AddIcon from '@mui/icons-material/Add'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import DeleteIcon from '@mui/icons-material/Delete'
import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { skipToken } from '@reduxjs/toolkit/query'
import jsonData from 'src/url.json'
import {
  useGetSamplePlansQuery,
  useLazyGetSamplePlanLearnersQuery,
  SamplePlanLearner,
  SamplePlanLearnerUnit,
  useApplySamplePlanLearnersMutation,
} from 'app/store/api/sample-plan-api'
import { useUserId } from 'src/app/utils/userHelpers'
import { useDispatch } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'

type AssessmentMethod = {
  code: string
  title: string
}

const assessmentMethods: AssessmentMethod[] = [
  { code: 'DO', title: 'Direct Observation' },
  { code: 'WT', title: 'Witness Testimony' },
  { code: 'PE', title: 'Product Evidence' },
  { code: 'QA', title: 'Questioning and Answers' },
  { code: 'PS', title: 'Personal Statement' },
]

const additionalAssessmentMethodCodes = [
  'PD',
  'OT',
  'RA',
  'ET',
  'DI',
  'SI',
  'APL_RPL',
]

const assessmentMethodCodesForPayload = Array.from(
  new Set([
    ...assessmentMethods.map((method) => method.code),
    ...additionalAssessmentMethodCodes,
  ])
)

const qaStatuses = ['All', 'QA Approved']

const sampleTypes = [
  'Planned Sample',
  'Random Sample',
  'Targeted Sample',
  'Learner Risk Sample',
]

const modalSampleTypes = [
  'Learner interview',
  'Observation',
  'Portfolio review',
  'Assessment review',
]

const assessmentMethodCodes = [
  'WO',
  'WP',
  'PW',
  'VI',
  'LB',
  'PD',
  'PT',
  'TE',
  'RJ',
  'OT',
  'RPL',
]

const iqaConclusionOptions = [
  'Valid',
  'Authentic',
  'Sufficient',
  'Relevant',
  'Current',
]

const URL_BASE_LINK = jsonData.API_LOCAL_URL

const sanitizeText = (value?: string | null) => {
  if (value === null || value === undefined) {
    return '-'
  }
  const trimmed = String(value).trim()
  return trimmed.length ? trimmed : '-'
}

const formatDisplayDate = (value?: string | null) => {
  if (!value) {
    return '-'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const getRiskChipColor = (riskLevel?: string): ChipProps['color'] => {
  if (!riskLevel) {
    return 'default'
  }
  const normalized = riskLevel.toLowerCase()
  if (normalized.includes('high')) {
    return 'error'
  }
  if (normalized.includes('medium')) {
    return 'warning'
  }
  if (normalized.includes('low')) {
    return 'success'
  }
  if (normalized.includes('not') || normalized.includes('unset')) {
    return 'default'
  }
  return 'info'
}

const countSelectedUnits = (units?: SamplePlanLearnerUnit[]) => {
  if (!Array.isArray(units)) {
    return 0
  }
  return units.filter((unit) => unit?.is_selected).length
}

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
  const [planSummary, setPlanSummary] = useState<{
    planId?: string
    courseName?: string
  }>()
  const [unitSelectionDialogOpen, setUnitSelectionDialogOpen] = useState<boolean>(false)
  const [selectedLearnerForUnits, setSelectedLearnerForUnits] = useState<{
    learner: SamplePlanLearner
    learnerIndex: number
  } | null>(null)
  const [selectedUnitsMap, setSelectedUnitsMap] = useState<Record<string, Set<string>>>({})
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [selectedUnit, setSelectedUnit] = useState<{
    unit: SamplePlanLearnerUnit
    learner: SamplePlanLearner
  } | null>(null)
  const [activeTab, setActiveTab] = useState<number>(0)
  const [modalFormData, setModalFormData] = useState({
    qaName: '',
    plannedDate: '',
    assessmentMethods: ['TE'],
    assessmentProcesses: '',
    feedback: '',
    type: 'Formative',
    completedDate: '',
    sampleType: 'Learner interview',
    iqaConclusion: [] as string[],
    assessorDecisionCorrect: 'No',
  })
  const [sampleQuestions, setSampleQuestions] = useState<
    Array<{ id: string; question: string; answer: 'Yes' | 'No' | '' }>
  >([{ id: '1', question: 'Test', answer: 'Yes' }])

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

        const selectedUnits = units
          .filter((unit) => {
            if (!unit) return false
            return unit.is_selected === true
          })
          .map((unit, unitIndex) => {
            const unitIdRaw =
              unit?.id ??
              unit?.unit_id ??
              unit?.unitId ??
              unit?.unit_code ??
              unit?.unit_name ??
              `${rowIndex}-${unitIndex}`
            const unitRefRaw =
              unit?.unit_ref ??
              unit?.unitRef ??
              unit?.unit_name ??
              unit?.unit_code ??
              unitIdRaw

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
          plannedDate: row?.planned_date ?? row?.plannedDate ?? null,
          units: selectedUnits,
        }
      })
      .filter(Boolean) as Array<{
      learner_id: string | number
      plannedDate: string | null
      units: Array<{ id: string | number; unit_ref: string }>
    }>

     console.log('learnersPayload',learnersData)

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
    
    const learnerKey = `${selectedLearnerForUnits.learner.learner_name ?? ''}-${selectedLearnerForUnits.learnerIndex}`
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
    
    const learnerKey = `${selectedLearnerForUnits.learner.learner_name ?? ''}-${selectedLearnerForUnits.learnerIndex}`
    const selectedUnits = selectedUnitsMap[learnerKey] || new Set<string>()
    
    // Update the learner's units in the data
    if (Array.isArray(selectedLearnerForUnits.learner.units)) {
      selectedLearnerForUnits.learner.units = selectedLearnerForUnits.learner.units.map((unit) => {
        const unitKey = unit.unit_code || unit.unit_name || ''
        return {
          ...unit,
          is_selected: unitKey ? selectedUnits.has(unitKey) : false,
        }
      })
    }
    
    handleCloseUnitSelectionDialog()
  }

  const getSelectedUnitsForLearner = (learner: SamplePlanLearner, learnerIndex: number): Set<string> => {
    const learnerKey = `${learner.learner_name ?? ''}-${learnerIndex}`
    return selectedUnitsMap[learnerKey] || new Set<string>()
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setSelectedUnit(null)
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
    // Handle save logic here
    dispatch(
      showMessage({
        message: 'Sample questions saved successfully.',
        variant: 'success',
      })
    )
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
          <Card
            sx={{
              p: 3,
              borderRadius: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 3,
              position: 'sticky',
              top: { xs: 0, md: 88 },
            }}
          >
            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                Assessment Methods
              </Typography>
              <Paper
                variant='outlined'
                sx={{ p: 2, maxHeight: 220, overflow: 'auto', borderRadius: 2 }}
              >
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={
                          selectedMethods.length === assessmentMethods.length
                        }
                        indeterminate={
                          selectedMethods.length > 0 &&
                          selectedMethods.length < assessmentMethods.length
                        }
                        onChange={() => {
                          if (
                            selectedMethods.length === assessmentMethods.length
                          ) {
                            setSelectedMethods([])
                          } else {
                            setSelectedMethods(
                              assessmentMethods.map((method) => method.code)
                            )
                          }
                        }}
                      />
                    }
                    label='Select All'
                    sx={{ mb: 1, fontWeight: 600 }}
                  />
                  <Divider sx={{ mb: 1 }} />
                  {assessmentMethods.map((method) => (
                    <FormControlLabel
                      key={method.code}
                      control={
                        <Checkbox
                          checked={selectedMethods.includes(method.code)}
                          onChange={() => toggleMethod(method.code)}
                        />
                      }
                      label={`${method.code} - ${method.title}`}
                      sx={{ alignItems: 'flex-start' }}
                    />
                  ))}
                </FormGroup>
              </Paper>
            </Box>

            <Box>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                Assessment Processes
              </Typography>
              <Paper
                variant='outlined'
                sx={{
                  p: 3,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'text.secondary',
                  textAlign: 'center',
                }}
              >
                There are no assessment processes available to select.
              </Paper>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='sample-type-label'>Sample Type</InputLabel>
                  <Select
                    labelId='sample-type-label'
                    label='Sample Type'
                    value={sampleType}
                    onChange={(event) => setSampleType(event.target.value)}
                  >
                    <MenuItem value=''>Select a sample type</MenuItem>
                    {sampleTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='Planned Sample Date'
                  type='date'
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  size='small'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label='QA Completion Date'
                  type='date'
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  size='small'
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Stack spacing={2}>
              <Button
                variant='contained'
                size='large'
                sx={{ textTransform: 'none', fontWeight: 600 }}
                onClick={handleApplySamples}
                disabled={isApplySamplesDisabled}
              >
                {isApplySamplesLoading ? 'Applying...' : 'Apply Samples'}
              </Button>
              <Button
                variant='outlined'
                size='large'
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Apply Random Samples
              </Button>
              <Button
                variant='outlined'
                size='large'
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  borderStyle: 'dashed',
                }}
              >
                Plan Management
              </Button>
            </Stack>
          </Card>
        </Grid>

        <Grid item xs={12} lg={8}>
          <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <Autocomplete
                  options={courses}
                  getOptionLabel={(option) => option.name || ''}
                  value={
                    courses.find((course) => course.id === selectedCourse) ||
                    null
                  }
                  onChange={(_, newValue) => {
                    setSelectedCourse(newValue?.id || '')
                    setPlans([])
                    setSelectedPlan('')
                    setFilterApplied(false)
                    setFilterError('')
                    setPlanSummary(undefined)
                  }}
                  loading={coursesLoading}
                  fullWidth
                  disabled={!courses.length && !coursesLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label='Select Course'
                      size='small'
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {coursesLoading ? (
                              <CircularProgress color='inherit' size={16} />
                            ) : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  noOptionsText={
                    coursesLoading ? 'Loading courses…' : 'No courses'
                  }
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='plan-select-label'>Select Plan</InputLabel>
                  <Select
                    labelId='plan-select-label'
                    label='Select Plan'
                    value={selectedPlan}
                    renderValue={(value) => {
                      if (!value) {
                        return planPlaceholderText
                      }
                      const matchedPlan = plans.find(
                        (plan) => plan.id === value
                      )
                      return matchedPlan?.label || value
                    }}
                    onChange={(event) => {
                      setSelectedPlan(event.target.value as string)
                      setFilterApplied(false)
                      setFilterError('')
                      setPlanSummary(undefined)
                    }}
                    disabled={!selectedCourse || isPlanListLoading}
                  >
                    <MenuItem value='' disabled>
                      {planPlaceholderText}
                    </MenuItem>
                    {plans.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {isPlansError && selectedCourse && (
                  <Typography
                    variant='caption'
                    color='error'
                    sx={{ mt: 1, display: 'block' }}
                  >
                    Unable to load plans for the selected course. Please try
                    again.
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth size='small'>
                  <InputLabel id='qa-status-label'>Select QA Status</InputLabel>
                  <Select
                    labelId='qa-status-label'
                    label='Select QA Status'
                    value={selectedStatus}
                    onChange={(event) => setSelectedStatus(event.target.value)}
                  >
                    {qaStatuses.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={onlyIncomplete}
                      onChange={(event) =>
                        setOnlyIncomplete(event.target.checked)
                      }
                    />
                  }
                  label='Do not show learners with completed course status'
                />
              </Grid>
            </Grid>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems='center'
              justifyContent='space-between'
              sx={{ flexWrap: 'wrap', mb: 2 }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                <TextField
                  label='Date From'
                  type='date'
                  value={dateFrom}
                  onChange={(event) => setDateFrom(event.target.value)}
                  size='small'
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 160 }}
                />
                <TextField
                  label='Date To'
                  type='date'
                  value={dateTo}
                  onChange={(event) => setDateTo(event.target.value)}
                  size='small'
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: 160 }}
                />
              </Stack>

              <Stack direction='row' spacing={1}>
                <Button
                  variant='contained'
                  color='secondary'
                  startIcon={<DownloadOutlinedIcon />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                  disabled={
                    !filterApplied || !visibleRows.length || isLearnersInFlight
                  }
                >
                  Export
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<FilterListOutlinedIcon />}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                  onClick={handleApplyFilter}
                  disabled={
                    !selectedCourse ||
                    !selectedPlan ||
                    isPlanListLoading ||
                    !plans.length ||
                    isLearnersInFlight ||
                    isApplySamplesLoading
                  }
                >
                  Filter
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<RestartAltOutlinedIcon />}
                  onClick={resetFilters}
                  sx={{ textTransform: 'none', fontWeight: 600 }}
                  disabled={isLearnersInFlight || isApplySamplesLoading}
                >
                  Clear
                </Button>
              </Stack>
            </Stack>

            {filterError && (
              <Typography
                variant='body2'
                color='error'
                sx={{ mt: 1, fontWeight: 500 }}
              >
                {filterError}
              </Typography>
            )}

            {filterApplied && !filterError && planSummary && (
              <Typography variant='body2' color='text.secondary' sx={{ mt: 2 }}>
                Viewing plan{' '}
                <strong>
                  {planSummary.planId ? `#${planSummary.planId}` : 'N/A'}
                </strong>
                {planSummary.courseName ? ` • ${planSummary.courseName}` : ''}
              </Typography>
            )}

            <Paper
              variant='outlined'
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                borderColor: (theme) => theme.palette.divider,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  alignItems: { xs: 'stretch', md: 'center' },
                  justifyContent: 'space-between',
                  gap: 2,
                  p: 2,
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[50]
                      : theme.palette.background.default,
                }}
              >
                <Stack direction='row' spacing={1} alignItems='center'>
                  <Typography variant='body2' color='text.secondary'>
                    Show
                  </Typography>
                  <TextField
                    select
                    size='small'
                    defaultValue={10}
                    sx={{ width: 80 }}
                  >
                    {[10, 25, 50].map((size) => (
                      <MenuItem key={size} value={size}>
                        {size}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Typography variant='body2' color='text.secondary'>
                    entries
                  </Typography>
                </Stack>

                <TextField
                  size='small'
                  placeholder='Search learners...'
                  value={searchText}
                  onChange={(event) => setSearchText(event.target.value)}
                  sx={{ width: { xs: '100%', sm: 260 } }}
                  disabled={!filterApplied || isLearnersInFlight}
                />
              </Box>

              <TableContainer sx={{ maxHeight: 520 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Assessor</TableCell>
                      <TableCell>Risk Level</TableCell>
                      <TableCell>QA Approved</TableCell>
                      <TableCell>Learner</TableCell>
                      <TableCell>Sample Type / Status</TableCell>
                      <TableCell>Planned Date</TableCell>
                      <TableCell align='center'>Actions</TableCell>
                      <TableCell>Units</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!filterApplied ? (
                      <TableRow>
                        <TableCell colSpan={8} align='center' sx={{ py: 6 }}>
                          <Typography variant='body2' color='text.secondary'>
                            Select a course and plan, then choose Filter to load
                            learners.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : isLearnersInFlight ? (
                      <TableRow>
                        <TableCell colSpan={8} align='center' sx={{ py: 6 }}>
                          <Stack
                            direction='row'
                            spacing={1}
                            alignItems='center'
                            justifyContent='center'
                          >
                            <CircularProgress size={20} />
                            <Typography variant='body2' color='text.secondary'>
                              Loading learners...
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ) : isLearnersError ? (
                      <TableRow>
                        <TableCell colSpan={8} align='center' sx={{ py: 6 }}>
                          <Typography variant='body2' color='error'>
                            {filterError ||
                              'Something went wrong while fetching learners for this plan.'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : visibleRows.length ? (
                      visibleRows.map((row, index) => {
                        const units = Array.isArray(row.units) ? row.units : []
                        const selectedUnitsSet = getSelectedUnitsForLearner(row, index)
                        const selectedUnits = selectedUnitsSet.size || countSelectedUnits(units)
                        const totalUnits = units.length

                        return (
                          <TableRow
                            key={`${row.assessor_name ?? 'assessor'}-${
                              row.learner_name ?? index
                            }`}
                            hover
                            sx={{
                              '&:last-child td, &:last-child th': { border: 0 },
                            }}
                          >
                            <TableCell sx={{ minWidth: 160 }}>
                              <Stack spacing={0.5}>
                                <Typography variant='body2' fontWeight={600}>
                                  {sanitizeText(row.assessor_name)}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                size='small'
                                label={sanitizeText(row.risk_level)}
                                color={getRiskChipColor(row.risk_level)}
                                variant='outlined'
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <Checkbox
                                color='primary'
                                checked={Boolean(row.qa_approved)}
                                disabled
                              />
                            </TableCell>
                            <TableCell sx={{ minWidth: 180 }}>
                              <Typography variant='body2'>
                                {sanitizeText(row.learner_name)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ minWidth: 180 }}>
                              <Typography variant='body2'>
                                {sanitizeText(row.sample_type)}
                              </Typography>
                              <Typography
                                variant='caption'
                                color='text.secondary'
                              >
                                Status: {sanitizeText(row.status)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ minWidth: 140 }}>
                              <Typography variant='body2'>
                                {formatDisplayDate(row.planned_date)}
                              </Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <Stack
                                direction='row'
                                spacing={1}
                                justifyContent='center'
                              >
                                <IconButton size='small' color='primary'>
                                  <InsertDriveFileOutlinedIcon fontSize='small' />
                                </IconButton>
                                <IconButton size='small' color='primary'>
                                  <FolderSharedOutlinedIcon fontSize='small' />
                                </IconButton>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ minWidth: 300 }}>
                              <Paper
                                variant='outlined'
                                onClick={() => handleOpenUnitSelectionDialog(row, index)}
                                sx={{
                                  p: 2,
                                  borderRadius: 2,
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease-in-out',
                                  backgroundColor: (theme) =>
                                    theme.palette.mode === 'light'
                                      ? theme.palette.grey[50]
                                      : theme.palette.background.paper,
                                  '&:hover': {
                                    backgroundColor: (theme) =>
                                      theme.palette.mode === 'light'
                                        ? 'rgba(25, 118, 210, 0.08)'
                                        : 'rgba(25, 118, 210, 0.16)',
                                    borderColor: (theme) => theme.palette.primary.main,
                                    boxShadow: (theme) => theme.shadows[2],
                                  },
                                }}
                              >
                                <Stack spacing={1.5}>
                                  <Stack
                                    direction='row'
                                    alignItems='center'
                                    justifyContent='space-between'
                                  >
                                    <Typography
                                      variant='body2'
                                      fontWeight={600}
                                      color='primary'
                                    >
                                      Click to Select Units
                                    </Typography>
                                    <Chip
                                      size='small'
                                      label={`${selectedUnits}/${totalUnits} selected`}
                                      color={selectedUnits > 0 ? 'primary' : 'default'}
                                      variant='outlined'
                                    />
                                  </Stack>
                                  {selectedUnits > 0 && (
                                    <Stack spacing={0.5}>
                                      <Typography
                                        variant='caption'
                                        color='text.secondary'
                                        sx={{ fontWeight: 600 }}
                                      >
                                        Selected Units:
                                      </Typography>
                                      <Stack spacing={0.5}>
                                        {units
                                          .filter((unit) => {
                                            const unitKey = unit.unit_code || unit.unit_name || ''
                                            const selectedSet = getSelectedUnitsForLearner(row, index)
                                            return unitKey && selectedSet.has(unitKey)
                                          })
                                          .slice(0, 3)
                                          .map((unit, unitIndex) => (
                                            <Chip
                                              key={`selected-${unit.unit_code || unit.unit_name || unitIndex}`}
                                              label={sanitizeText(unit.unit_name || unit.unit_code || 'Unit')}
                                              size='small'
                                              color='success'
                                              variant='outlined'
                                              sx={{ fontSize: '0.7rem' }}
                                            />
                                          ))}
                                        {selectedUnits > 3 && (
                                          <Typography
                                            variant='caption'
                                            color='text.secondary'
                                            sx={{ fontStyle: 'italic' }}
                                          >
                                            +{selectedUnits - 3} more...
                                          </Typography>
                                        )}
                                      </Stack>
                                    </Stack>
                                  )}
                                  {selectedUnits === 0 && (
                                    <Typography
                                      variant='caption'
                                      color='text.secondary'
                                      sx={{ fontStyle: 'italic' }}
                                    >
                                      No units selected. Click to choose units.
                                    </Typography>
                                  )}
                                </Stack>
                              </Paper>
                            </TableCell>
                          </TableRow>
                        )
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={8} align='center' sx={{ py: 6 }}>
                          <Typography variant='body2' color='text.secondary'>
                            No learners match the current filters.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Card>
        </Grid>
      </Grid>

      {/* Unit Selection Dialog */}
      <Dialog
        open={unitSelectionDialogOpen}
        onClose={handleCloseUnitSelectionDialog}
        maxWidth='md'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '80vh',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Stack
              direction='row'
              alignItems='center'
              justifyContent='space-between'
            >
              <Typography variant='h6' fontWeight={600}>
                Select Units
              </Typography>
              <IconButton
                size='small'
                onClick={handleCloseUnitSelectionDialog}
                sx={{ color: 'text.secondary' }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>

            {selectedLearnerForUnits && (
              <>
                <Paper
                  variant='outlined'
                  sx={{
                    p: 2,
                    backgroundColor: (theme) =>
                      theme.palette.mode === 'light'
                        ? theme.palette.grey[50]
                        : theme.palette.background.default,
                  }}
                >
                  <Stack spacing={1}>
                    <Typography variant='subtitle2' fontWeight={600}>
                      Learner: {sanitizeText(selectedLearnerForUnits.learner.learner_name)}
                    </Typography>
                    <Typography variant='body2' color='text.secondary'>
                      Assessor: {sanitizeText(selectedLearnerForUnits.learner.assessor_name)}
                    </Typography>
                  </Stack>
                </Paper>

                <Box
                  sx={{
                    maxHeight: '50vh',
                    overflowY: 'auto',
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    p: 2,
                  }}
                >
                  <Stack spacing={2}>
                    {Array.isArray(selectedLearnerForUnits.learner.units) &&
                    selectedLearnerForUnits.learner.units.length > 0 ? (
                      selectedLearnerForUnits.learner.units.map((unit, unitIndex) => {
                        const unitKey = unit.unit_code || unit.unit_name || ''
                        const learnerKey = `${selectedLearnerForUnits.learner.learner_name ?? ''}-${selectedLearnerForUnits.learnerIndex}`
                        const selectedUnits = selectedUnitsMap[learnerKey] || new Set<string>()
                        const isSelected = unitKey ? selectedUnits.has(unitKey) : false

                        return (
                          <Paper
                            key={`unit-${unitKey || unitIndex}`}
                            variant='outlined'
                            sx={{
                              p: 2,
                              transition: 'all 0.2s ease-in-out',
                              backgroundColor: (theme) =>
                                isSelected
                                  ? theme.palette.mode === 'light'
                                    ? 'rgba(46, 125, 50, 0.08)'
                                    : 'rgba(76, 175, 80, 0.16)'
                                  : theme.palette.mode === 'light'
                                  ? theme.palette.background.paper
                                  : theme.palette.background.default,
                              borderColor: (theme) =>
                                isSelected
                                  ? theme.palette.success.main
                                  : theme.palette.divider,
                              '&:hover': {
                                borderColor: (theme) => theme.palette.primary.main,
                                boxShadow: (theme) => theme.shadows[2],
                              },
                            }}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => handleUnitToggle(unitKey)}
                                  color='primary'
                                />
                              }
                              label={
                                <Stack spacing={0.5}>
                                  <Typography variant='body2' fontWeight={600}>
                                    {sanitizeText(unit.unit_name || 'Unit')}
                                  </Typography>
                                  {unit.unit_code && (
                                    <Typography variant='caption' color='text.secondary'>
                                      Code: {sanitizeText(unit.unit_code)}
                                    </Typography>
                                  )}
                                </Stack>
                              }
                              sx={{ alignItems: 'flex-start', m: 0 }}
                            />
                          </Paper>
                        )
                      })
                    ) : (
                      <Typography variant='body2' color='text.secondary' align='center' sx={{ py: 4 }}>
                        No units available for this learner.
                      </Typography>
                    )}
                  </Stack>
                </Box>

                <Stack direction='row' spacing={2} justifyContent='flex-end'>
                  <Button
                    variant='outlined'
                    onClick={handleCloseUnitSelectionDialog}
                    sx={{ textTransform: 'none' }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant='contained'
                    onClick={handleSaveUnitSelection}
                    sx={{ textTransform: 'none' }}
                  >
                    Save Selection
                  </Button>
                </Stack>
              </>
            )}
          </Stack>
        </Box>
      </Dialog>

      {/* Edit Sample Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth='xl'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            maxHeight: '90vh',
            height: '90vh',
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 2.5,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant='h6' sx={{ fontWeight: 600 }}>
              Edit Sample
            </Typography>
            <IconButton onClick={handleCloseModal} size='small'>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Tabs and Create New Button */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2.5,
              pt: 2,
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              sx={{
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontWeight: 500,
                  minHeight: 48,
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#e91e63',
                },
              }}
            >
              <Tab
                label='FS 1 - (10/11/2025)'
                sx={{
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                }}
              />
              <Tab
                label='FS 2 - (11/11/2025)'
                sx={{
                  '&.Mui-selected': {
                    color: '#e91e63',
                    fontWeight: 600,
                  },
                }}
              />
            </Tabs>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: '#e91e63',
                '&:hover': {
                  bgcolor: '#c2185b',
                },
              }}
            >
              Create New
            </Button>
          </Box>

          {/* Action Buttons */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              flexWrap: 'wrap',
              gap: 1.5,
              px: 2.5,
              pt: 2,
              pb: 1,
            }}
          >
            <Button
              variant='outlined'
              onClick={handleCloseModal}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#ff9800',
                color: '#ff9800',
                '&:hover': {
                  borderColor: '#f57c00',
                  bgcolor: 'rgba(255, 152, 0, 0.08)',
                },
              }}
            >
              Cancel / Close
            </Button>
            <Button
              variant='outlined'
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                borderColor: '#f44336',
                color: '#f44336',
                '&:hover': {
                  borderColor: '#d32f2f',
                  bgcolor: 'rgba(244, 67, 54, 0.08)',
                },
              }}
            >
              Delete
            </Button>
            <Button
              variant='contained'
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: '#4caf50',
                '&:hover': {
                  bgcolor: '#388e3c',
                },
              }}
            >
              Save
            </Button>
            <Button
              variant='contained'
              onClick={handleCloseModal}
              sx={{
                textTransform: 'none',
                fontWeight: 600,
                bgcolor: '#4caf50',
                '&:hover': {
                  bgcolor: '#388e3c',
                },
              }}
            >
              Save & Close
            </Button>
          </Box>

          {/* Content */}
          <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
            <Grid container spacing={3}>
              {/* Left Column */}
              <Grid item xs={12} md={4}>
                <Stack spacing={2.5}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>QA Name</InputLabel>
                    <Select
                      value={modalFormData.qaName}
                      label='QA Name'
                      onChange={(e) =>
                        handleModalFormChange('qaName', e.target.value)
                      }
                    >
                      <MenuItem value='Raj Bhudia'>Raj Bhudia</MenuItem>
                      <MenuItem value='Other QA'>Other QA</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
              <Grid item xs={12} md={4}>
                <Stack spacing={2.5}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={modalFormData.type}
                      label='Type'
                      onChange={(e) =>
                        handleModalFormChange('type', e.target.value)
                      }
                    >
                      <MenuItem value='Formative'>Formative</MenuItem>
                      <MenuItem value='Summative'>Summative</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>
              {/* Right Column */}
              <Grid item xs={12} md={4}>
                <Stack spacing={2.5}>
                  <FormControl fullWidth size='small'>
                    <InputLabel>Sample Type</InputLabel>
                    <Select
                      value={modalFormData.sampleType}
                      label='Sample Type'
                      onChange={(e) =>
                        handleModalFormChange('sampleType', e.target.value)
                      }
                    >
                      {modalSampleTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size='small'
                  label='Planned Date'
                  type='date'
                  value={modalFormData.plannedDate}
                  onChange={(e) =>
                    handleModalFormChange('plannedDate', e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  size='small'
                  label='Completed Date'
                  type='date'
                  value={modalFormData.completedDate}
                  onChange={(e) =>
                    handleModalFormChange('completedDate', e.target.value)
                  }
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography
                    variant='subtitle2'
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Assessment Methods
                  </Typography>
                  <Paper variant='outlined' sx={{ p: 2, borderRadius: 1 }}>
                    <Grid container spacing={1}>
                      {assessmentMethodCodes.map((code) => (
                        <Grid item xs={3} key={code}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                size='small'
                                checked={modalFormData.assessmentMethods.includes(
                                  code
                                )}
                                onChange={() =>
                                  handleAssessmentMethodToggle(code)
                                }
                              />
                            }
                            label={code}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography
                    variant='subtitle2'
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    IQA Conclusion
                  </Typography>
                  <Paper variant='outlined' sx={{ p: 2, borderRadius: 1 }}>
                    <FormGroup row>
                      {iqaConclusionOptions.map((option) => (
                        <FormControlLabel
                          key={option}
                          control={
                            <Checkbox
                              size='small'
                              checked={modalFormData.iqaConclusion.includes(
                                option
                              )}
                              onChange={() => handleIqaConclusionToggle(option)}
                            />
                          }
                          label={option}
                        />
                      ))}
                    </FormGroup>
                  </Paper>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box>
                  <Typography
                    variant='subtitle2'
                    sx={{ fontWeight: 600, mb: 1 }}
                  >
                    Assessor Decision Correct
                  </Typography>
                  <FormControl component='fieldset'>
                    <RadioGroup
                      row
                      value={modalFormData.assessorDecisionCorrect}
                      onChange={(e) =>
                        handleModalFormChange(
                          'assessorDecisionCorrect',
                          e.target.value
                        )
                      }
                    >
                      <FormControlLabel
                        value='Yes'
                        control={<Radio size='small' />}
                        label='Yes'
                      />
                      <FormControlLabel
                        value='No'
                        control={<Radio size='small' />}
                        label='No'
                      />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  size='small'
                  label='Assessment Processes'
                  value={modalFormData.assessmentProcesses}
                  onChange={(e) =>
                    handleModalFormChange('assessmentProcesses', e.target.value)
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  size='small'
                  label='Feedback'
                  value={modalFormData.feedback}
                  onChange={(e) =>
                    handleModalFormChange('feedback', e.target.value)
                  }
                  placeholder='Please type in feedback. Max 4400 characters.'
                  inputProps={{ maxLength: 4400 }}
                />
              </Grid>
            </Grid>
            <Button
              variant='contained'
              sx={{
                textTransform: 'none',
                mt: 3,
                fontWeight: 600,
                bgcolor: '#e91e63',
                '&:hover': {
                  bgcolor: '#c2185b',
                },
              }}
            >
              Examine Evidence
            </Button>
            <Box
              sx={{
                mt: 3,
                mb: 2,
                display: 'flex',
                justifyContent: 'space-between',
                gap: 3,
                flexWrap: 'wrap',
              }}
            >
              {/* Evidence Links Table */}
              <Box sx={{ mb: 3 }} flex={1}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                    Evidence Links for Sample
                  </Typography>
                  <Stack direction='row' spacing={1}>
                    <IconButton size='small'>
                      <RefreshIcon fontSize='small' />
                    </IconButton>
                  </Stack>
                </Box>
                <TableContainer component={Paper} variant='outlined'>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Examined Evidence</TableCell>
                        <TableCell>Assessment Methods Used</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={3} align='center' sx={{ py: 4 }}>
                          <Typography variant='body2' color='text.secondary'>
                            There are no Evidence Links on this Sample
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Actions Table */}
              <Box flex={1}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                    Actions for Sample
                  </Typography>
                  <Stack direction='row' spacing={1}>
                    <Button
                      variant='contained'
                      size='small'
                      startIcon={<AddIcon />}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: '#4caf50',
                        '&:hover': {
                          bgcolor: '#388e3c',
                        },
                      }}
                    >
                      Add Action
                    </Button>
                  </Stack>
                </Box>
                <TableContainer component={Paper} variant='outlined'>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Summary</TableCell>
                        <TableCell>Action Required</TableCell>
                        <TableCell>Action With</TableCell>
                        <TableCell>Target Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                          <Typography variant='body2' color='text.secondary'>
                            There are no Actions on this Sample
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>

            {/* Allocated Forms and Documents for Sample */}
            <Box
              sx={{
                mt: 3,
                display: 'flex',
                gap: 3,
                flexWrap: 'wrap',
              }}
            >
              {/* Allocated Forms Section */}
              <Box sx={{ flex: 1, minWidth: 400 }}>
                <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1.5 }}>
                  Allocated Forms
                </Typography>
                <Box
                  sx={{
                    display: 'flex',
                    gap: 1.5,
                    mb: 1.5,
                    alignItems: 'center',
                  }}
                >
                  <TextField
                    fullWidth
                    size='small'
                    placeholder='Select form...'
                    sx={{ flex: 1 }}
                  />
                  <Button
                    variant='contained'
                    size='small'
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#ff9800',
                      color: '#fff',
                      '&:hover': {
                        bgcolor: '#f57c00',
                      },
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Allocate Form
                  </Button>
                </Box>
                <TableContainer component={Paper} variant='outlined'>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Completed Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                          <Typography variant='body2' color='text.secondary'>
                            There are no Forms on this Sample
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              {/* Documents for Sample Section */}
              <Box sx={{ flex: 1, minWidth: 400 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 1.5,
                  }}
                >
                  <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                    Documents for Sample
                  </Typography>
                  <Button
                    variant='contained'
                    size='small'
                    startIcon={<CloudUploadIcon />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#4caf50',
                      '&:hover': {
                        bgcolor: '#388e3c',
                      },
                    }}
                  >
                    Upload File
                  </Button>
                </Box>
                <TableContainer component={Paper} variant='outlined'>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell>File</TableCell>
                        <TableCell>File Name</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={3} align='center' sx={{ py: 4 }}>
                          <Typography variant='body2' color='text.secondary'>
                            There are no Files on this Sample
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </Box>

            {/* Sample Questions Section */}
            <Box sx={{ mt: 3 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 2,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant='subtitle1'
                    sx={{
                      fontWeight: 600,
                      color: '#e91e63',
                    }}
                  >
                    Sample Questions
                  </Typography>
                </Box>
                <Button
                  variant='contained'
                  size='small'
                  onClick={handleSaveQuestions}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#4caf50',
                    '&:hover': {
                      bgcolor: '#388e3c',
                    },
                  }}
                >
                  Save
                </Button>
              </Box>

              <Paper
                variant='outlined'
                sx={{
                  backgroundColor: (theme) =>
                    theme.palette.mode === 'light'
                      ? theme.palette.grey[50]
                      : theme.palette.background.default,
                }}
              >
                <TableContainer>
                  <Table size='small'>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: '60%' }}>
                          Question
                        </TableCell>
                        <TableCell
                          align='center'
                          sx={{ fontWeight: 600, width: '15%' }}
                        >
                          Yes
                        </TableCell>
                        <TableCell
                          align='center'
                          sx={{ fontWeight: 600, width: '15%' }}
                        >
                          No
                        </TableCell>
                        <TableCell
                          align='center'
                          sx={{ fontWeight: 600, width: '10%' }}
                        >
                          Actions
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sampleQuestions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                            <Typography variant='body2' color='text.secondary'>
                              No questions added yet. Click "Add Question" to get
                              started.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        sampleQuestions.map((question, index) => (
                          <TableRow key={question.id} hover>
                            <TableCell>
                              <TextField
                                fullWidth
                                size='small'
                                value={question.question}
                                onChange={(e) =>
                                  handleQuestionChange(question.id, e.target.value)
                                }
                                placeholder={`Question ${index + 1}`}
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'background.paper',
                                  },
                                }}
                              />
                            </TableCell>
                            <TableCell align='center'>
                              <Radio
                                size='small'
                                checked={question.answer === 'Yes'}
                                onChange={() =>
                                  handleAnswerChange(question.id, 'Yes')
                                }
                                value='Yes'
                              />
                            </TableCell>
                            <TableCell align='center'>
                              <Radio
                                size='small'
                                checked={question.answer === 'No'}
                                onChange={() =>
                                  handleAnswerChange(question.id, 'No')
                                }
                                value='No'
                              />
                            </TableCell>
                            <TableCell align='center'>
                              <IconButton
                                size='small'
                                onClick={() => handleDeleteQuestion(question.id)}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': {
                                    bgcolor: 'error.light',
                                    color: 'error.dark',
                                  },
                                }}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Add Question Button */}
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant='outlined'
                    size='small'
                    startIcon={<AddIcon />}
                    onClick={handleAddQuestion}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Add Question
                  </Button>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Dialog>
    </Box>
  )
}

export default Index
