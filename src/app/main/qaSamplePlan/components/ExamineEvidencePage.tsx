import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'

// Material-UI Components
import {
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'

// Material-UI Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import VisibilityIcon from '@mui/icons-material/Visibility'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import DeleteIcon from '@mui/icons-material/Delete'

// API Hooks
import {
  useGetEvidenceListQuery,
  useAddAssignmentReviewMutation,
  useDeleteAssignmentReviewFileMutation,
  useUpdateMappedSubUnitSignOffMutation,
  useGetUnitMappingByTypeQuery,
} from 'app/store/api/sample-plan-api'

// Utils & Components
import FuseLoading from '@fuse/core/FuseLoading'
import { useCurrentUser } from 'src/app/utils/userHelpers'
import { showMessage } from 'app/store/fuse/messageSlice'
import UnitSignOffModal from './UnitSignOffModal'

// ============================================================================
// Types & Interfaces
// ============================================================================

interface EvidenceRow {
  refNo: string
  evidenceDocuments: string
  evidenceName: string
  evidenceDescription: string
  assessmentMethod: string
  dateUploaded: string
}

interface EvidenceData {
  assignment_id: number
  title: string
  description: string | null
  file: {
    name: string
    size: number
    key: string
    url: string
  }
  assessment_method: string[]
  created_at: string
  unit: {
    unit_ref: string
    title: string
    code?: string
    unit_code?: string | number
  }
  mappedSubUnits: Array<{
    id: string | number
    subTitle: string
    learnerMapped?: boolean
    trainerMapped?: boolean
    review?: {
      signed_off: boolean
      signed_at?: string
      signed_by?: {
        user_id: number
        name: string
      }
    } | null
  }>
  reviews:
    | {
        [role: string]: {
          id?: number
          completed: boolean
          comment: string
          signed_off_at: string | null
          signed_off_by: string | null
          file?: {
            name: string
            size: number
            url: string
            key: string
          } | null
        }
      }
    | Record<string, unknown>
}

interface ConfirmationRow {
  role: string
  statement: string
  completed: boolean
  signedOffBy: string
  dated: string
  comments: string
  file: string
  assignment_review_id?: number
}


// ============================================================================
// Constants
// ============================================================================

const INITIAL_CONFIRMATION_ROWS: ConfirmationRow[] = [
  {
    role: 'Learner',
    statement:
      'I confirm that this unit is complete and the evidence provided is a result of my own work',
    completed: false,
    signedOffBy: '',
    dated: '',
    comments: '',
    file: '',
  },
  {
    role: 'Trainer',
    statement:
      'I confirm that the learner has demonstrated competence by satisfying all the skills and knowledge for this unit, and has been assessed according to requirements of the qualification.',
    completed: false,
    signedOffBy: '',
    dated: '',
    comments: '',
    file: '',
  },
  {
    role: 'Lead assessor Countersignature (if required)',
    statement:
      'I confirm that the learner has demonstrated competence by satisfying all the skills and knowledge for this unit, and has been assessed according to requirements of the qualification.',
    completed: false,
    signedOffBy: '',
    dated: '',
    comments: '',
    file: '',
  },
  {
    role: 'Employer',
    statement:
      'I can confirm that the evidence I have checked as an employer meets the standards.',
    completed: false,
    signedOffBy: '',
    dated: '',
    comments: '',
    file: '',
  },
  {
    role: 'IQA',
    statement:
      'I can confirm that the evidence I have sampled as an Internal Quality Assurer meets the standards.',
    completed: false,
    signedOffBy: '',
    dated: '',
    comments: '',
    file: '',
  },
  {
    role: 'EQA',
    statement: 'Verified as part of External QA Visit.',
    completed: false,
    signedOffBy: '',
    dated: '',
    comments: '',
    file: '',
  },
]

const ROLE_PRIORITY: Record<string, number> = {
  IQA: 1,
  LIQA: 2,
  EQA: 3,
  Admin: 4,
  Trainer: 5,
  Employer: 6,
  Learner: 7,
}

// ============================================================================
// Main Component
// ============================================================================

const ExamineEvidencePage: React.FC = () => {
  // ==========================================================================
  // Hooks & Navigation
  // ==========================================================================
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const params = useParams<{ planDetailId: string }>()
  const currentUser = useCurrentUser()

  // ==========================================================================
  // URL Parameters & State Extraction
  // ==========================================================================
  const planDetailId =
    params.planDetailId ||
    searchParams.get('sampleResultsId') ||
    searchParams.get('SampleResultsID') ||
    ''

  const unitCode = searchParams.get('unit_code') || ''
  const unitName = searchParams.get('unitName') || 'Unit 1'
  const unitType = searchParams.get('unitType') || ''

  // ==========================================================================
  // API Queries & Mutations
  // ==========================================================================
  const {
    data: evidenceResponse,
    isLoading: isLoadingEvidence,
    isError: isErrorEvidence,
    refetch: refetchEvidence,
  } = useGetEvidenceListQuery(
    { planDetailId: planDetailId as string | number, unitCode },
    { skip: !planDetailId || !unitCode }
  )

  const [addAssignmentReview, { isLoading: isSubmittingReview }] =
    useAddAssignmentReviewMutation()

  const [deleteAssignmentReviewFile, { isLoading: isDeletingFile }] =
    useDeleteAssignmentReviewFileMutation()

  const [updateMappedSubUnitSignOff, { isLoading: isUpdatingSubUnit }] =
    useUpdateMappedSubUnitSignOffMutation()

  const {
    data: unitMappingResponse,
    isLoading: isLoadingUnitMapping,
  } = useGetUnitMappingByTypeQuery(
    {
      planDetailId: planDetailId as string | number,
    },
    {
      skip: !planDetailId,
    }
  )

  // ==========================================================================
  // State Management
  // ==========================================================================
  const [evidenceRows, setEvidenceRows] = useState<EvidenceRow[]>([])
  const [evidenceData, setEvidenceData] = useState<EvidenceData[]>([])
  const [displayUnitName, setDisplayUnitName] = useState<string>(unitName)
  const [unitLocked, setUnitLocked] = useState(false)

  // Modal States
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceData | null>(null)
  const [comment, setComment] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [deleteFileDialogOpen, setDeleteFileDialogOpen] = useState(false)
  const [fileToDeleteIndex, setFileToDeleteIndex] = useState<number | null>(null)

  // Checkbox States
  const [criteriaSignOff, setCriteriaSignOff] = useState<Record<string, boolean>>({})
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({})
  const [mappedSubUnitsChecked, setMappedSubUnitsChecked] = useState<
    Record<string, boolean>
  >({})
  // Track locked checkboxes (can't be toggled once set)
  const [lockedCheckboxes, setLockedCheckboxes] = useState<Set<string>>(new Set())
  // Track IQA-checked checkboxes (to show green mark)
  const [iqaCheckedCheckboxes, setIqaCheckedCheckboxes] = useState<Set<string>>(
    new Set()
  )
  const [expandedUnits, setExpandedUnits] = useState<Set<string | number>>(new Set())

  // Confirmation Rows
  const [confirmationRows, setConfirmationRows] =
    useState<ConfirmationRow[]>(INITIAL_CONFIRMATION_ROWS)

  // ==========================================================================
  // Computed Values
  // ==========================================================================
  // Calculate unit progress statistics
  const unitProgress = useMemo(() => {
    if (!evidenceData || evidenceData.length === 0) {
      return { pendingTrainerMap: 0, iqaChecked: 0, total: 0 }
    }

    let pendingTrainerMap = 0
    let iqaChecked = 0
    let total = 0

    evidenceData.forEach((evidence) => {
      if (evidence.mappedSubUnits && evidence.mappedSubUnits.length > 0) {
        evidence.mappedSubUnits.forEach((subUnit) => {
          total++
          // Check if IQA checked (signed_off: true)
          if (subUnit.review?.signed_off === true) {
            iqaChecked++
          }
          // Check if trainer mapped but not IQA checked
          else if (subUnit.trainerMapped === true) {
            pendingTrainerMap++
          }
        })
      }
    })

    return { pendingTrainerMap, iqaChecked, total }
  }, [evidenceData])

  const getAllMappedSubUnits = useMemo(() => {
    const allSubUnits: Array<{
      id: string | number
      subTitle: string
      learnerMapped?: boolean
      trainerMapped?: boolean
      review?: {
        signed_off: boolean
        signed_at?: string
        signed_by?: {
          user_id: number
          name: string
        }
      } | null
    }> = []
    const seenIds = new Set<string | number>()

    evidenceData.forEach((evidence) => {
      if (evidence?.mappedSubUnits && Array.isArray(evidence.mappedSubUnits)) {
        evidence.mappedSubUnits.forEach((subUnit) => {
          const subUnitId = String(subUnit.id)
          if (!seenIds.has(subUnitId)) {
            seenIds.add(subUnitId)
            allSubUnits.push({
              id: subUnit.id,
              subTitle: subUnit.subTitle || '',
              learnerMapped: subUnit.learnerMapped || false,
              trainerMapped: subUnit.trainerMapped || false,
              review: subUnit.review || null,
            })
          }
        })
      }
    })

    return allSubUnits
  }, [evidenceData])

  const allMappedSubUnits = getAllMappedSubUnits
  const hasExpandedRows = Object.values(expandedRows).some((expanded) => expanded)

  // ==========================================================================
  // Helper Functions
  // ==========================================================================
  const getReviewsForEvidence = (evidence: EvidenceData) => {
    if (
      !evidence.reviews ||
      typeof evidence.reviews !== 'object' ||
      Array.isArray(evidence.reviews)
    ) {
      return null
    }
    return evidence.reviews as {
      [role: string]: {
        completed: boolean
        comment: string
        signed_off_at: string | null
        signed_off_by: string | null
      }
    }
  }

  const getRoleColor = (
    role: string,
    completed: boolean
  ): 'default' | 'primary' | 'success' | 'warning' | 'info' | 'error' => {
    if (completed) return 'success'
    switch (role) {
      case 'IQA':
      case 'LIQA':
        return 'primary'
      case 'Admin':
        return 'info'
      case 'Trainer':
      case 'Employer':
        return 'warning'
      case 'EQA':
        return 'error'
      default:
        return 'default'
    }
  }

  const createStateKey = (assignmentId: number | undefined, subUnitId: string | number) => {
    return assignmentId ? `${assignmentId}_${subUnitId}` : String(subUnitId)
  }

  // ==========================================================================
  // Event Handlers - Modal
  // ==========================================================================
  const handleOpenCommentModal = (evidence: EvidenceData) => {
    setSelectedEvidence(evidence)
    const userRole = currentUser?.role || 'IQA'
    const existingReview =
      evidence.reviews &&
      typeof evidence.reviews === 'object' &&
      !Array.isArray(evidence.reviews)
        ? (evidence.reviews as { [role: string]: { comment: string } })[userRole]
        : null
    setComment(existingReview?.comment || '')
    setCommentModalOpen(true)
  }

  const handleCloseCommentModal = () => {
    setCommentModalOpen(false)
    setSelectedEvidence(null)
    setComment('')
  }

  const handleSubmitComment = async () => {
    if (!selectedEvidence || !comment.trim() || !planDetailId || !unitCode) {
      dispatch(
        showMessage({
          message: 'Please fill in all required fields.',
          variant: 'error',
        })
      )
      return
    }

    try {
      const userRole = currentUser?.role || 'IQA'
      await addAssignmentReview({
        assignment_id: selectedEvidence.assignment_id,
        sampling_plan_detail_id: Number(planDetailId),
        role: userRole,
        comment: comment.trim(),
        unit_code: unitCode,
      }).unwrap()

      dispatch(
        showMessage({
          message: 'Comment added successfully.',
          variant: 'success',
        })
      )

      handleCloseCommentModal()
      refetchEvidence()
    } catch (error: any) {
      const message =
        error?.data?.message || error?.error || 'Failed to add comment.'
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
    }
  }

  // ==========================================================================
  // Event Handlers - Checkboxes & Toggles
  // ==========================================================================
  const handleCriteriaToggle = async (key: string) => {
    const isIQA = currentUser?.role === 'IQA'
    
    // Only IQA can use this shortcut
    if (!isIQA) {
      dispatch(
        showMessage({
          message: 'Only IQA can sign off all criteria.',
          variant: 'error',
        })
      )
      return
    }

    // Find the evidence by assignment_id (key is refNo which is assignment_id)
    const evidence = evidenceData.find((e) => String(e.assignment_id) === key)
    
    if (!evidence) {
      dispatch(
        showMessage({
          message: 'Evidence not found.',
          variant: 'error',
        })
      )
      return
    }

    // Check if already checked
    const isCurrentlyChecked = criteriaSignOff[key] || false
    const newCheckedState = !isCurrentlyChecked

    // If unchecking, don't allow (one-way operation)
    if (!newCheckedState) {
      dispatch(
        showMessage({
          message: 'Cannot uncheck. Sign-off is permanent once applied.',
          variant: 'error',
        })
      )
      return
    }

    // Get all mappedSubUnits that have trainerMapped === true
    const subUnitsToSignOff = evidence.mappedSubUnits?.filter(
      (subUnit) => subUnit.trainerMapped === true
    ) || []

    if (subUnitsToSignOff.length === 0) {
      dispatch(
        showMessage({
          message: 'No units are ready for sign-off. Trainer must map units first.',
          variant: 'error',
        })
      )
      return
    }

    // Update local state optimistically
    setCriteriaSignOff((prev) => ({
      ...prev,
      [key]: newCheckedState,
    }))

    // Update all subUnits states
    const stateKeysToUpdate: string[] = []
    subUnitsToSignOff.forEach((subUnit) => {
      const stateKey = createStateKey(evidence.assignment_id, subUnit.id)
      stateKeysToUpdate.push(stateKey)
      
      // Mark as checked, locked, and IQA checked
      setMappedSubUnitsChecked((prev) => ({
        ...prev,
        [stateKey]: true,
      }))
      setLockedCheckboxes((prev) => new Set(prev).add(stateKey))
      setIqaCheckedCheckboxes((prev) => new Set(prev).add(stateKey))
    })

    // Call API for each subUnit
    try {
      const updatePromises = subUnitsToSignOff.map((subUnit) =>
        updateMappedSubUnitSignOff({
          assignment_id: evidence.assignment_id,
          unit_code: unitCode,
          pc_id: subUnit.id,
          signed_off: true,
        }).unwrap()
      )

      await Promise.all(updatePromises)

      dispatch(
        showMessage({
          message: `Successfully signed off ${subUnitsToSignOff.length} unit(s).`,
          variant: 'success',
        })
      )

      // Refetch evidence to get updated data
      refetchEvidence()
    } catch (error: any) {
      // Revert state changes on error
      setCriteriaSignOff((prev) => ({
        ...prev,
        [key]: !newCheckedState,
      }))
      
      stateKeysToUpdate.forEach((stateKey) => {
        setMappedSubUnitsChecked((prev) => ({
          ...prev,
          [stateKey]: false,
        }))
        setLockedCheckboxes((prev) => {
          const newSet = new Set(prev)
          newSet.delete(stateKey)
          return newSet
        })
        setIqaCheckedCheckboxes((prev) => {
          const newSet = new Set(prev)
          newSet.delete(stateKey)
          return newSet
        })
      })

      const message =
        error?.data?.message || error?.error || 'Failed to sign off units.'
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
    }
  }

  const handleToggleAllRows = () => {
    setExpandedRows((prev) => {
      const next: Record<string, boolean> = {}
      evidenceRows.forEach((row) => {
        next[row.refNo] = !hasExpandedRows
      })
      return next
    })
  }

  const handleToggleUnitExpansion = (unitCode: string | number) => {
    setExpandedUnits((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(unitCode)) {
        newSet.delete(unitCode)
      } else {
        newSet.add(unitCode)
      }
      return newSet
    })
  }

  const handleMappedSubUnitToggle = async (
    subUnitId: string | number,
    assignmentId?: number
  ) => {
    const stateKey = createStateKey(assignmentId, subUnitId)
    const currentChecked = mappedSubUnitsChecked[stateKey] || false
    
    // Prevent toggling if already locked
    if (lockedCheckboxes.has(stateKey)) {
      return
    }

    // Find the target evidence to check trainerMapped status
    let targetEvidence: EvidenceData | undefined
    if (assignmentId) {
      targetEvidence = evidenceData.find((e) => e.assignment_id === assignmentId)
    } else {
      const idString = String(subUnitId)
      targetEvidence = evidenceData.find((evidence) =>
        evidence.mappedSubUnits?.some((su) => String(su.id) === idString)
      )
    }

    if (!targetEvidence) {
      dispatch(
        showMessage({
          message: 'Evidence not found. Cannot update sign-off status.',
          variant: 'error',
        })
      )
      return
    }

    // Find the specific subUnit
    const evidenceSubUnit = targetEvidence.mappedSubUnits?.find(
      (su) => String(su.id) === String(subUnitId)
    )

    if (!evidenceSubUnit) {
      dispatch(
        showMessage({
          message: 'SubUnit not found. Cannot update sign-off status.',
          variant: 'error',
        })
      )
      return
    }

    const isIQA = currentUser?.role === 'IQA'
    
    // IQA can only check if trainerMapped is true
    if (isIQA && !evidenceSubUnit.trainerMapped) {
      dispatch(
        showMessage({
          message: 'IQA can only sign off when Trainer has mapped this unit.',
          variant: 'error',
        })
      )
      return
    }

    // Determine new state based on current state
    // If unchecked, can only check. If checked, can only uncheck (but we'll lock it)
    const newSignedOffState = !currentChecked

    // Lock the checkbox once it's set
    setLockedCheckboxes((prev) => new Set(prev).add(stateKey))

    // Track if IQA checked it
    if (isIQA && newSignedOffState) {
      setIqaCheckedCheckboxes((prev) => new Set(prev).add(stateKey))
    }

    setMappedSubUnitsChecked((prev) => ({
      ...prev,
      [stateKey]: newSignedOffState,
    }))

    try {
      // targetEvidence is already found above
      if (!targetEvidence) {
        dispatch(
          showMessage({
            message: 'Evidence not found. Cannot update sign-off status.',
            variant: 'error',
          })
        )
        // Revert state changes on error
        setMappedSubUnitsChecked((prev) => ({
          ...prev,
          [stateKey]: !newSignedOffState,
        }))
        setLockedCheckboxes((prev) => {
          const newSet = new Set(prev)
          newSet.delete(stateKey)
          return newSet
        })
        setIqaCheckedCheckboxes((prev) => {
          const newSet = new Set(prev)
          newSet.delete(stateKey)
          return newSet
        })
        return
      }

      if (!unitCode) {
        dispatch(
          showMessage({
            message: 'Unit code is required.',
            variant: 'error',
          })
        )
        // Revert state changes on error
        setMappedSubUnitsChecked((prev) => ({
          ...prev,
          [stateKey]: !newSignedOffState,
        }))
        setLockedCheckboxes((prev) => {
          const newSet = new Set(prev)
          newSet.delete(stateKey)
          return newSet
        })
        setIqaCheckedCheckboxes((prev) => {
          const newSet = new Set(prev)
          newSet.delete(stateKey)
          return newSet
        })
        return
      }

      await updateMappedSubUnitSignOff({
        assignment_id: targetEvidence.assignment_id,
        unit_code: unitCode,
        pc_id: subUnitId,
        signed_off: newSignedOffState,
      }).unwrap()

      dispatch(
        showMessage({
          message: 'Sign-off status updated successfully.',
          variant: 'success',
        })
      )

      refetchEvidence()
    } catch (error: any) {
      // Revert state changes on error
      setMappedSubUnitsChecked((prev) => ({
        ...prev,
        [stateKey]: !newSignedOffState,
      }))
      setLockedCheckboxes((prev) => {
        const newSet = new Set(prev)
        newSet.delete(stateKey)
        return newSet
      })
      setIqaCheckedCheckboxes((prev) => {
        const newSet = new Set(prev)
        newSet.delete(stateKey)
        return newSet
      })

      const message =
        error?.data?.message ||
        error?.error ||
        'Failed to update sign-off status.'
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
    }
  }

  // ==========================================================================
  // Event Handlers - Confirmation
  // ==========================================================================
  const handleConfirmationToggle = async (index: number) => {
    const confirmationRow = confirmationRows[index]
    if (!confirmationRow || !planDetailId || !unitCode) return

    const newCompletedState = !confirmationRow.completed

    setConfirmationRows((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        completed: newCompletedState,
      }
      return updated
    })

    try {
      const firstEvidence = evidenceData.length > 0 ? evidenceData[0] : null

      if (!firstEvidence) {
        dispatch(
          showMessage({
            message: 'No evidence found. Cannot update status.',
            variant: 'error',
          })
        )
        setConfirmationRows((prev) => {
          const updated = [...prev]
          updated[index] = {
            ...updated[index],
            completed: !newCompletedState,
          }
          return updated
        })
        return
      }

      await addAssignmentReview({
        assignment_id: firstEvidence.assignment_id,
        sampling_plan_detail_id: Number(planDetailId),
        role: confirmationRow.role,
        comment: confirmationRow.comments || '',
        unit_code: unitCode,
        completed: newCompletedState,
      }).unwrap()

      dispatch(
        showMessage({
          message: 'Status updated successfully.',
          variant: 'success',
        })
      )

      refetchEvidence()
    } catch (error: any) {
      setConfirmationRows((prev) => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          completed: !newCompletedState,
        }
        return updated
      })

      const message =
        error?.data?.message || error?.error || 'Failed to update status.'
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
    }
  }

  const handleAddComment = (index: number) => {
    setSelectedIndex(index)
    setOpenModal(true)
  }

  const handleModalSubmit = async (comment: string, file?: File) => {
    if (!comment.trim() || selectedIndex === null || !planDetailId || !unitCode) {
      dispatch(
        showMessage({
          message: 'Please fill in comment.',
          variant: 'error',
        })
      )
      return
    }

    try {
      const firstEvidence = evidenceData.length > 0 ? evidenceData[0] : null

      if (!firstEvidence) {
        dispatch(
          showMessage({
            message: 'No evidence found. Cannot add comment.',
            variant: 'error',
          })
        )
        return
      }

      const confirmationRow = confirmationRows[selectedIndex]
      const role = confirmationRow?.role || currentUser?.role || 'IQA'

      const response = await addAssignmentReview({
        assignment_id: firstEvidence.assignment_id,
        sampling_plan_detail_id: Number(planDetailId),
        role: role,
        comment: comment.trim() || '',
        unit_code: unitCode,
        file: file,
      }).unwrap()

      // Extract assignment_review_id from response if available
      // The API response may include id or assignment_review_id in the data field
      const assignmentReviewId = (response as any)?.data?.id || (response as any)?.data?.assignment_review_id

      setConfirmationRows((prev) => {
        const updated = [...prev]
        updated[selectedIndex] = {
          ...updated[selectedIndex],
          comments: comment.trim(),
          file: file ? file.name : updated[selectedIndex].file,
          assignment_review_id: assignmentReviewId || updated[selectedIndex].assignment_review_id,
        }
        return updated
      })

      dispatch(
        showMessage({
          message: file 
            ? 'Comment and file uploaded successfully.' 
            : 'Comment added successfully.',
          variant: 'success',
        })
      )

      setOpenModal(false)
      setSelectedIndex(null)
      refetchEvidence()
    } catch (error: any) {
      const message =
        error?.data?.message || error?.error || 'Failed to add comment.'
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
    }
  }

  const handleDeleteFileClick = (index: number) => {
    setFileToDeleteIndex(index)
    setDeleteFileDialogOpen(true)
  }

  const handleDeleteFileConfirm = async () => {
    if (fileToDeleteIndex === null) {
      setDeleteFileDialogOpen(false)
      return
    }

    const index = fileToDeleteIndex
    const confirmationRow = confirmationRows[index]
    
    if (!confirmationRow?.assignment_review_id) {
      dispatch(
        showMessage({
          message: 'Unable to delete file: Review ID not found.',
          variant: 'error',
        })
      )
      setDeleteFileDialogOpen(false)
      setFileToDeleteIndex(null)
      return
    }

    try {
      await deleteAssignmentReviewFile({
        assignment_review_id: confirmationRow.assignment_review_id,
      }).unwrap()

      setConfirmationRows((prev) => {
        const updated = [...prev]
        updated[index] = {
          ...updated[index],
          file: '',
        }
        return updated
      })

      dispatch(
        showMessage({
          message: 'File deleted successfully.',
          variant: 'success',
        })
      )

      setDeleteFileDialogOpen(false)
      setFileToDeleteIndex(null)
      refetchEvidence()
    } catch (error: any) {
      const message =
        error?.data?.message || error?.error || 'Failed to delete file.'
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
    }
  }

  const handleDeleteFileCancel = () => {
    setDeleteFileDialogOpen(false)
    setFileToDeleteIndex(null)
  }

  // ==========================================================================
  // Effects
  // ==========================================================================
  useEffect(() => {
    if (evidenceResponse?.data && Array.isArray(evidenceResponse.data)) {
      setEvidenceData(evidenceResponse.data)
      const mappedRows: EvidenceRow[] = evidenceResponse.data.map(
        (evidence: EvidenceData) => ({
          refNo: String(evidence.assignment_id),
          evidenceDocuments: evidence.file?.name || '-',
          evidenceName: evidence.title || '-',
          evidenceDescription: evidence.description || '-',
          assessmentMethod: evidence.assessment_method?.join(', ') || '-',
          dateUploaded: evidence.created_at
            ? new Date(evidence.created_at).toLocaleDateString()
            : '-',
        })
      )
      setEvidenceRows(mappedRows)

      if (
        evidenceResponse.data.length > 0 &&
        evidenceResponse.data[0].unit?.title
      ) {
        setDisplayUnitName(evidenceResponse.data[0].unit.title)
      }

      const initialCheckedState: Record<string, boolean> = {}
      const initialLockedCheckboxes = new Set<string>()
      const initialIqaChecked = new Set<string>()

      evidenceResponse.data.forEach((evidence: EvidenceData) => {
        if (evidence.mappedSubUnits) {
          evidence.mappedSubUnits.forEach((subUnit) => {
            const key = createStateKey(evidence.assignment_id, subUnit.id)
            if (subUnit.review && subUnit.review.signed_off === true) {
              initialCheckedState[key] = true
              initialLockedCheckboxes.add(key)
              // Check if signed by IQA
              if (subUnit.review.signed_by?.name) {
                initialIqaChecked.add(key)
              }
            } else if (subUnit.trainerMapped === true) {
              // trainerMapped is true but not signed off yet - checkbox should be toggleable
              initialCheckedState[key] = false // Start as unchecked, can be checked by IQA
              // Don't lock it - allow IQA to check it
            } else {
              initialCheckedState[key] = false
            }
          })
        }
      })
      setMappedSubUnitsChecked(initialCheckedState)
      setLockedCheckboxes(initialLockedCheckboxes)
      setIqaCheckedCheckboxes(initialIqaChecked)

      // Initialize criteriaSignOff based on whether all units are signed off
      const initialCriteriaSignOff: Record<string, boolean> = {}
      evidenceResponse.data.forEach((evidence: EvidenceData) => {
        if (evidence.mappedSubUnits && evidence.mappedSubUnits.length > 0) {
          const trainerMappedSubUnits = evidence.mappedSubUnits.filter(
            (sub) => sub.trainerMapped === true
          )
          // Only mark as checked if there are trainer-mapped units AND all are signed off
          // If no trainer-mapped units exist, mark as unchecked (false)
          if (trainerMappedSubUnits.length > 0) {
            const allSignedOff = trainerMappedSubUnits.every(
              (sub) => sub.review?.signed_off === true
            )
            initialCriteriaSignOff[String(evidence.assignment_id)] = allSignedOff
          } else {
            // No trainer-mapped units, so checkbox should be unchecked
            initialCriteriaSignOff[String(evidence.assignment_id)] = false
          }
        } else {
          // No mappedSubUnits at all, checkbox should be unchecked
          initialCriteriaSignOff[String(evidence.assignment_id)] = false
        }
      })
      setCriteriaSignOff(initialCriteriaSignOff)

      setConfirmationRows((prevRows) => {
        const updatedRows = prevRows.map((row) => {
          let reviewData = null

          for (const evidence of evidenceResponse.data) {
            if (
              evidence.reviews &&
              typeof evidence.reviews === 'object' &&
              !Array.isArray(evidence.reviews)
            ) {
              const reviews = evidence.reviews as {
                [role: string]: {
                  id?: number
                  completed: boolean
                  comment: string
                  signed_off_at: string | null
                  signed_off_by: string | null
                  file?: {
                    name: string
                    size: number
                    url: string
                    key: string
                  } | null
                }
              }

              if (reviews[row.role]) {
                reviewData = reviews[row.role]
                break
              }
            }
          }

          if (reviewData) {
            const fileName = reviewData.file?.name || ''
            return {
              ...row,
              completed: reviewData.completed || false,
              comments: reviewData.comment || '',
              signedOffBy: reviewData.signed_off_by || '',
              dated: reviewData.signed_off_at
                ? new Date(reviewData.signed_off_at).toLocaleDateString()
                : '',
              file: fileName || row.file || '',
              assignment_review_id: reviewData.id || row.assignment_review_id,
            }
          }

          return row
        })

        return updatedRows
      })
    } else if (evidenceResponse?.data && evidenceResponse.data.length === 0) {
      setEvidenceRows([])
      setEvidenceData([])
    }
  }, [evidenceResponse])

  // ==========================================================================
  // Loading & Error States
  // ==========================================================================
  if (isLoadingEvidence) {
    return <FuseLoading />
  }

  if (isErrorEvidence) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color='error'>
          Failed to load evidence list. Please try again.
        </Typography>
      </Box>
    )
  }

  // ==========================================================================
  // Render Functions
  // ==========================================================================
  const renderEvidenceTable = () => (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table size='small' sx={{ border: '1px solid #e0e0e0' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell
                sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}
              >
                Ref No
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}
              >
                Evidence Documents
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}
              >
                Evidence Name
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}
              >
                Evidence Description
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}
              >
                Assessment Method
              </TableCell>
              <TableCell
                sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}
              >
                Date Uploaded
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  textAlign: 'center',
                  borderRight: '1px solid #e0e0e0',
                }}
              >
                Sign off all criteria
              </TableCell>
              {hasExpandedRows &&
                allMappedSubUnits.map((subUnit) => {
                  const evidenceWithSubUnit = evidenceData.find((evidence) =>
                    evidence.mappedSubUnits?.some(
                      (su) => String(su.id) === String(subUnit.id)
                    )
                  )
                  const code = evidenceWithSubUnit?.unit?.code || subUnit.id

                  return (
                    <TableCell
                      key={subUnit.id}
                      sx={{
                        fontWeight: 600,
                        borderRight: '1px solid #e0e0e0',
                        textAlign: 'center',
                        minWidth: 100,
                      }}
                    >
                      <Tooltip title={subUnit.subTitle || ''} arrow>
                        <span>{code}</span>
                      </Tooltip>
                    </TableCell>
                  )
                })}
              <TableCell
                sx={{
                  fontWeight: 600,
                  textAlign: 'center',
                  borderRight: hasExpandedRows ? '1px solid #e0e0e0' : 'none',
                  cursor: 'pointer',
                }}
                onClick={handleToggleAllRows}
              >
                {hasExpandedRows ? 'Show Less' : 'Show All'}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {evidenceRows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8 + (hasExpandedRows ? allMappedSubUnits.length : 0)}
                  align='center'
                  sx={{ py: 4, color: '#666666' }}
                >
                  No evidence records available
                </TableCell>
              </TableRow>
            ) : (
              evidenceRows.map((row, index) => {
                const evidence = evidenceData[index]
                const fileUrl = evidence?.file?.url
                const isExpanded = expandedRows[row.refNo] || false
                const mappedSubUnits = evidence?.mappedSubUnits || []
                const canEdit = currentUser?.role === 'IQA' || currentUser?.role === 'EV'

                return (
                  <React.Fragment key={index}>
                    <TableRow hover>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                          }}
                        >
                          {row.refNo}
                          <IconButton
                            size='small'
                            onClick={() => navigate(`/evidenceLibrary/${row.refNo}`)}
                            sx={{ ml: 1 }}
                            color='primary'
                          >
                            {canEdit ? (
                              <EditIcon fontSize='small' />
                            ) : (
                              <VisibilityIcon fontSize='small' />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                        {fileUrl ? (
                          <a
                            href={fileUrl}
                            target='_blank'
                            rel='noopener noreferrer'
                            style={{
                              color: '#1976d2',
                              textDecoration: 'none',
                            }}
                          >
                            {row.evidenceDocuments}
                          </a>
                        ) : (
                          row.evidenceDocuments
                        )}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                        {row.evidenceName}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                        {row.evidenceDescription}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                        {row.assessmentMethod}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                        {row.dateUploaded}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderRight: '1px solid #e0e0e0',
                          textAlign: 'center',
                        }}
                      >
                        <Checkbox
                          checked={(() => {
                            if (criteriaSignOff[row.refNo]) return true
                            if (!evidence?.mappedSubUnits) return false
                            const trainerMappedSubUnits = evidence.mappedSubUnits.filter(
                              (sub) => sub.trainerMapped === true
                            )
                            // Only check if there are trainer-mapped units AND all are signed off
                            return (
                              trainerMappedSubUnits.length > 0 &&
                              trainerMappedSubUnits.every(
                                (sub) => sub.review?.signed_off === true
                              )
                            )
                          })()}
                          onChange={() => handleCriteriaToggle(row.refNo)}
                          disabled={(() => {
                            if (currentUser?.role !== 'IQA') return true
                            if (!evidence?.mappedSubUnits) return true
                            const trainerMappedSubUnits = evidence.mappedSubUnits.filter(
                              (sub) => sub.trainerMapped === true
                            )
                            // Disable if no trainer-mapped units OR all are already signed off
                            return (
                              trainerMappedSubUnits.length === 0 ||
                              trainerMappedSubUnits.every(
                                (sub) => sub.review?.signed_off === true
                              )
                            )
                          })()}
                          size='small'
                          sx={{
                            '&.Mui-checked': {
                              color: currentUser?.role === 'IQA' ? '#4caf50' : undefined,
                            },
                            '&.Mui-disabled': {
                              color: (() => {
                                if (criteriaSignOff[row.refNo]) return '#4caf50'
                                if (!evidence?.mappedSubUnits) return 'inherit'
                                const trainerMappedSubUnits = evidence.mappedSubUnits.filter(
                                  (sub) => sub.trainerMapped === true
                                )
                                return trainerMappedSubUnits.length > 0 &&
                                  trainerMappedSubUnits.every(
                                    (sub) => sub.review?.signed_off === true
                                  )
                                  ? '#4caf50'
                                  : 'inherit'
                              })(),
                            },
                          }}
                        />
                      </TableCell>
                      {hasExpandedRows &&
                        allMappedSubUnits.map((subUnit) => {
                          const evidenceSubUnit = isExpanded
                            ? mappedSubUnits.find((su) => su.id === subUnit.id)
                            : null

                          const stateKey = createStateKey(
                            evidence?.assignment_id,
                            evidenceSubUnit?.id || subUnit.id
                          )

                          const isChecked = evidenceSubUnit
                            ? (evidenceSubUnit.review?.signed_off === true) ||
                              (evidenceSubUnit.trainerMapped === true) ||
                              (mappedSubUnitsChecked[stateKey] === true)
                            : false

                          const isLocked = lockedCheckboxes.has(stateKey)
                          const isIqaChecked = iqaCheckedCheckboxes.has(stateKey)
                          const isIQA = currentUser?.role === 'IQA'
                          // IQA can only check if trainerMapped is true
                          const canIqaCheck = isIQA && evidenceSubUnit?.trainerMapped === true
                          // Disable if locked, or if trainerMapped is false, or if user is not IQA
                          const isDisabled =
                            isLocked || !evidenceSubUnit?.trainerMapped || !isIQA
                          // Check if it's trainer mapped but not IQA signed off (show blue)
                          const isTrainerMappedOnly = evidenceSubUnit?.trainerMapped === true && 
                            !evidenceSubUnit?.review?.signed_off && 
                            !isIqaChecked

                          return (
                            <TableCell
                              key={subUnit.id}
                              sx={{
                                borderRight: '1px solid #e0e0e0',
                                textAlign: 'center',
                                position: 'relative',
                              }}
                            >
                              {isExpanded && evidenceSubUnit ? (
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 0.5,
                                  }}
                                >
                                  <Checkbox
                                    checked={isChecked}
                                    onChange={() =>
                                      handleMappedSubUnitToggle(
                                        evidenceSubUnit.id,
                                        evidence?.assignment_id
                                      )
                                    }
                                    disabled={isDisabled}
                                    size='small'
                                    sx={{
                                      color: isTrainerMappedOnly ? '#2196f3' : undefined,
                                      '&.Mui-checked': {
                                        color: isTrainerMappedOnly ? '#2196f3' : isIqaChecked ? '#4caf50' : '#2196f3',
                                      },
                                      '&.Mui-disabled': {
                                        color: isChecked 
                                          ? (isIqaChecked ? '#4caf50' : '#2196f3') 
                                          : 'inherit',
                                      },
                                    }}
                                  />
                                </Box>
                              ) : null}
                            </TableCell>
                          )
                        })}
                      <TableCell
                        sx={{
                          borderRight: hasExpandedRows
                            ? '1px solid #e0e0e0'
                            : 'none',
                          textAlign: 'center',
                        }}
                      ></TableCell>
                    </TableRow>
                  </React.Fragment>
                )
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )

  const renderConfirmationTable = () => (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: '#ffffff',
        borderRadius: 1,
        overflow: 'hidden',
      }}
    >
      <TableContainer>
        <Table size='small' sx={{ border: '1px solid #e0e0e0' }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell
                sx={{
                  fontWeight: 600,
                  borderRight: '1px solid #e0e0e0',
                  width: '20%',
                }}
              >
                Role
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  borderRight: '1px solid #e0e0e0',
                  width: '35%',
                }}
              >
                Confirmation Statement
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  borderRight: '1px solid #e0e0e0',
                  textAlign: 'center',
                  width: '10%',
                }}
              >
                Please tick when completed
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  borderRight: '1px solid #e0e0e0',
                  width: '12%',
                }}
              >
                Signed off by
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  borderRight: '1px solid #e0e0e0',
                  width: '10%',
                }}
              >
                Dated
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  borderRight: '1px solid #e0e0e0',
                  width: '13%',
                }}
              >
                General Comments
              </TableCell>
              <TableCell sx={{ fontWeight: 600, width: '10%' }}>File</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {confirmationRows.map((row, index) => {
              const canAccess = currentUser?.role === row.role

              return (
                <TableRow key={index} hover>
                  <TableCell
                    sx={{
                      borderRight: '1px solid #e0e0e0',
                      fontWeight: 500,
                      verticalAlign: 'top',
                    }}
                  >
                    {row.role}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px solid #e0e0e0',
                      verticalAlign: 'top',
                    }}
                  >
                    {row.statement}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px solid #e0e0e0',
                      textAlign: 'center',
                      verticalAlign: 'top',
                    }}
                  >
                    <Stack
                      direction='row'
                      alignItems='center'
                      justifyContent='center'
                      spacing={1}
                    >
                      <Checkbox
                        size='small'
                        checked={row.completed}
                        onChange={() => canAccess && handleConfirmationToggle(index)}
                        disabled={!canAccess}
                        sx={{ p: 0.5 }}
                      />
                      <IconButton
                        size='small'
                        onClick={() => canAccess && handleAddComment(index)}
                        disabled={!canAccess}
                        sx={{
                          p: 0.5,
                          color: canAccess ? '#1976d2' : '#9e9e9e',
                          cursor: canAccess ? 'pointer' : 'not-allowed',
                          '&:hover': canAccess
                            ? { backgroundColor: 'rgba(25,118,210,0.08)' }
                            : {},
                        }}
                      >
                        <AddIcon fontSize='small' />
                      </IconButton>
                    </Stack>
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px solid #e0e0e0',
                      verticalAlign: 'top',
                    }}
                  >
                    {row.signedOffBy || '-'}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px solid #e0e0e0',
                      verticalAlign: 'top',
                    }}
                  >
                    {row.dated || '-'}
                  </TableCell>
                  <TableCell
                    sx={{
                      borderRight: '1px solid #e0e0e0',
                      verticalAlign: 'top',
                    }}
                  >
                    {row.comments || '-'}
                  </TableCell>
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    {row.file && (
                      <Stack direction='row' spacing={1} alignItems='center'>
                        <Typography variant='body2' color='primary' sx={{ flex: 1 }}>
                          {row.file}
                        </Typography>
                        {canAccess && row.assignment_review_id && (
                          <IconButton
                            size='small'
                            onClick={() => handleDeleteFileClick(index)}
                            disabled={isDeletingFile}
                            sx={{
                              p: 0.5,
                              color: '#d32f2f',
                              '&:hover': { backgroundColor: 'rgba(211,47,47,0.08)' },
                            }}
                          >
                            <DeleteIcon fontSize='small' />
                          </IconButton>
                        )}
                      </Stack>
                    )}
                    {!row.file && '-'}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  )

  const renderUnitMappingTable = () => {
    if (!unitMappingResponse?.data || unitMappingResponse.data.length === 0) {
      return null
    }

    return (
      <Paper
        elevation={0}
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Unit Mapping
          </Typography>
        </Box>
        <TableContainer>
          <Table size='small' sx={{ border: '1px solid #e0e0e0' }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    borderRight: '1px solid #e0e0e0',
                    width: '50px',
                  }}
                ></TableCell>
                <TableCell
                  sx={{
                    fontWeight: 600,
                    borderRight: '1px solid #e0e0e0',
                  }}
                >
                  Code
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Unit Title</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {unitMappingResponse.data.map((unit) => {
                const hasSubUnits = unit.subUnits && unit.subUnits.length > 0
                const isExpanded = expandedUnits.has(unit.unit_code)

                return (
                  <React.Fragment key={unit.unit_code}>
                    <TableRow hover>
                      <TableCell
                        sx={{
                          borderRight: '1px solid #e0e0e0',
                          width: '50px',
                        }}
                      >
                        {hasSubUnits && (
                          <IconButton
                            size='small'
                            onClick={() => handleToggleUnitExpansion(unit.unit_code)}
                          >
                            {isExpanded ? (
                              <KeyboardArrowUpIcon fontSize='small' />
                            ) : (
                              <KeyboardArrowDownIcon fontSize='small' />
                            )}
                          </IconButton>
                        )}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                        {unit.code}
                      </TableCell>
                      <TableCell>{unit.unit_title}</TableCell>
                    </TableRow>
                    {hasSubUnits &&
                      isExpanded &&
                      unit.subUnits?.map((subUnit) => (
                        <TableRow
                          key={subUnit.id}
                          sx={{
                            backgroundColor: '#fafafa',
                          }}
                        >
                          <TableCell
                            sx={{
                              borderRight: '1px solid #e0e0e0',
                              pl: 4,
                            }}
                          ></TableCell>
                          <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                            {subUnit.code}
                          </TableCell>
                          <TableCell>{subUnit.title}</TableCell>
                        </TableRow>
                      ))}
                  </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    )
  }

  const renderCommentModal = () => {
    const reviews = selectedEvidence ? getReviewsForEvidence(selectedEvidence) : null

    return (
      <Dialog
        open={commentModalOpen}
        onClose={handleCloseCommentModal}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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
            <Typography variant='h6' sx={{ fontWeight: 600, color: '#1976d2' }}>
              Add Comment
            </Typography>
            <IconButton onClick={handleCloseCommentModal} size='small'>
              <CloseIcon />
            </IconButton>
          </Box>

          <DialogContent sx={{ p: 2.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {selectedEvidence && (
                <>
                  <Box>
                    <Typography variant='body2' sx={{ color: '#666666', mb: 1 }}>
                      Evidence: <strong>{selectedEvidence.title}</strong>
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#666666' }}>
                      Assignment ID: {selectedEvidence.assignment_id}
                    </Typography>
                  </Box>

                  {reviews && Object.keys(reviews).length > 0 && (
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: '#f5f5f5',
                        borderRadius: 1,
                        border: '1px solid #e0e0e0',
                      }}
                    >
                      <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1.5 }}>
                        Existing Reviews:
                      </Typography>
                      <Stack spacing={1.5}>
                        {Object.entries(reviews)
                          .sort(([roleA], [roleB]) => {
                            const priorityA = ROLE_PRIORITY[roleA] || 99
                            const priorityB = ROLE_PRIORITY[roleB] || 99
                            return priorityA - priorityB
                          })
                          .map(([role, reviewData]) => (
                            <Box
                              key={role}
                              sx={{
                                p: 1.5,
                                backgroundColor: '#ffffff',
                                borderRadius: 1,
                                border: '1px solid #e0e0e0',
                              }}
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  mb: 1,
                                }}
                              >
                                <Chip
                                  label={role}
                                  size='small'
                                  color={getRoleColor(role, reviewData.completed)}
                                  variant={reviewData.completed ? 'filled' : 'outlined'}
                                  sx={{
                                    fontSize: '0.75rem',
                                    fontWeight: reviewData.completed ? 600 : 500,
                                  }}
                                />
                                <Typography
                                  variant='caption'
                                  sx={{
                                    color: reviewData.completed ? '#4caf50' : '#666666',
                                    fontWeight: reviewData.completed ? 600 : 400,
                                  }}
                                >
                                  {reviewData.completed ? 'Completed' : 'Pending'}
                                </Typography>
                              </Box>
                              <Typography
                                variant='body2'
                                sx={{ color: '#333333', mb: 0.5 }}
                              >
                                {reviewData.comment || 'No comment'}
                              </Typography>
                              {reviewData.signed_off_at && (
                                <Typography
                                  variant='caption'
                                  sx={{
                                    color: '#666666',
                                    display: 'block',
                                  }}
                                >
                                  Signed off:{' '}
                                  {new Date(reviewData.signed_off_at).toLocaleString()}
                                  {reviewData.signed_off_by &&
                                    ` by ${reviewData.signed_off_by}`}
                                </Typography>
                              )}
                            </Box>
                          ))}
                      </Stack>
                    </Box>
                  )}
                </>
              )}

              <TextField
                label={`Comment (${currentUser?.role || 'IQA'})`}
                fullWidth
                multiline
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder='Enter your comment here...'
                required
                sx={{ mt: 1 }}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, borderTop: 1, borderColor: 'divider' }}>
            <Button
              onClick={handleCloseCommentModal}
              variant='outlined'
              disabled={isSubmittingReview}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitComment}
              variant='contained'
              disabled={isSubmittingReview || !comment.trim()}
              sx={{
                bgcolor: '#1976d2',
                '&:hover': {
                  bgcolor: '#1565c0',
                },
              }}
            >
              {isSubmittingReview ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    )
  }

  // ==========================================================================
  // Main Render
  // ==========================================================================
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: '#ffffff',
        }}
      >
        <Stack direction='row' alignItems='center' spacing={2}>
          <IconButton
            onClick={() => navigate(-1)}
            size='small'
            sx={{
              color: '#666666',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <ArrowBackIcon fontSize='small' />
          </IconButton>
          <Typography
            variant='h5'
            sx={{
              fontWeight: 500,
              color: '#333333',
            }}
          >
            {displayUnitName}
          </Typography>
        </Stack>
      </Paper>

      {/* Unit Progress Section */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: '#ffffff',
        }}
      >
        <Typography
          variant='h6'
          sx={{
            fontWeight: 600,
            mb: 2,
            color: '#333333',
          }}
        >
          Unit Progress
        </Typography>
        <Stack direction='row' spacing={3} flexWrap='wrap'>
          {/* Pending Trainer Map */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0',
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#2196f3',
              }}
            />
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              Pending Trainer Map:
            </Typography>
            <Typography
              variant='body2'
              sx={{ fontWeight: 600, color: '#2196f3' }}
            >
              {unitProgress.pendingTrainerMap}
            </Typography>
          </Box>

          {/* IQA Checked */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0',
            }}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#4caf50',
              }}
            />
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              IQA Checked:
            </Typography>
            <Typography
              variant='body2'
              sx={{ fontWeight: 600, color: '#4caf50' }}
            >
              {unitProgress.iqaChecked}
            </Typography>
          </Box>

          {/* Total Evidence */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.5,
              borderRadius: 1,
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              Total Evidence:
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {unitProgress.total}
            </Typography>
          </Box>
        </Stack>
      </Paper>

      {/* Content */}
      <Box sx={{ flex: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        <Stack spacing={3}>
          {renderEvidenceTable()}
          {renderConfirmationTable()}
          {renderUnitMappingTable()}
        </Stack>
      </Box>

      {/* Modals */}
      {renderCommentModal()}

      <UnitSignOffModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleModalSubmit}
        defaultValue={
          selectedIndex !== null ? confirmationRows[selectedIndex]?.comments || '' : ''
        }
      />

      {/* Delete File Confirmation Dialog */}
      <Dialog
        open={deleteFileDialogOpen}
        onClose={handleDeleteFileCancel}
        maxWidth='xs'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          <DialogTitle sx={{ p: 0, mb: 2, fontWeight: 600 }}>
            Delete File?
          </DialogTitle>
          <DialogContent sx={{ p: 0, mb: 3 }}>
            <Typography variant='body2' color='text.secondary'>
              Are you sure you want to delete this file? This action cannot be undone.
            </Typography>
            {fileToDeleteIndex !== null && confirmationRows[fileToDeleteIndex]?.file && (
              <Typography variant='body2' sx={{ mt: 1, fontWeight: 500 }}>
                File: {confirmationRows[fileToDeleteIndex].file}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 0, justifyContent: 'flex-end' }}>
            <Stack direction='row' spacing={2}>
              <Button
                variant='outlined'
                onClick={handleDeleteFileCancel}
                disabled={isDeletingFile}
                sx={{ textTransform: 'none' }}
              >
                Cancel
              </Button>
              <Button
                variant='contained'
                color='error'
                onClick={handleDeleteFileConfirm}
                disabled={isDeletingFile}
                sx={{ textTransform: 'none' }}
              >
                {isDeletingFile ? 'Deleting...' : 'Delete'}
              </Button>
            </Stack>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}

export default ExamineEvidencePage
