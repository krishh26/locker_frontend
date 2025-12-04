import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
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
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import RefreshIcon from '@mui/icons-material/Refresh'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import GetAppIcon from '@mui/icons-material/GetApp'
import type { ModalFormData, SampleQuestion } from '../types'
import { assessmentMethods, formatDate, formatDateForInput, getTabColor, iqaConclusionOptions, sampleTypes } from '../constants'
import { ActionModal, type ActionFormData } from './ActionModal'
import {
  useLazyGetSampleActionsQuery,
  useCreateSampleActionMutation,
  useUpdateSampleActionMutation,
  useDeleteSampleActionMutation,
  useLazyGetSampleFormsQuery,
  useCreateSampleFormMutation,
  useDeleteSampleFormMutation,
  useCompleteSampleFormMutation,
  useLazyGetSampleDocumentsQuery,
  useUploadSampleDocumentMutation,
  useDeleteSampleDocumentMutation,
  useRemoveSampledLearnerMutation,
  type SampleAction,
  type SampleDocument,
  type SampleAllocatedForm,
} from 'app/store/api/sample-plan-api'
import { useGetAllFormsQuery } from 'app/store/api/form-api'
import { useUserId } from 'src/app/utils/userHelpers'
import { useDispatch } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'
import { useGetIQAQuestionsQuery } from 'src/app/store/api/iqa-questions-api'
import { useNavigate } from 'react-router-dom'

interface EditSampleModalProps {
  open: boolean
  onClose: () => void
  activeTab: number
  onTabChange: (value: number) => void
  modalFormData: ModalFormData
  onFormDataChange: (field: string, value: any) => void
  onAssessmentMethodToggle: (code: string) => void
  onIqaConclusionToggle: (option: string) => void
  sampleQuestions: SampleQuestion[]
  onQuestionChange: (id: string, question: string) => void
  onAnswerChange: (id: string, answer: 'Yes' | 'No') => void
  onAddQuestion: () => void
  onDeleteQuestion: (id: string) => void
  onSaveQuestions: () => void
  plannedDates?: string[]
  onSave?: () => void
  isSaving?: boolean
  planDetailId?: string | number | null
  unitCode?: string | null
  unitName?: string | null
  onCreateNew?: () => void
  isCreating?: boolean
  onDeleteSuccess?: () => void
}

export const EditSampleModal: React.FC<EditSampleModalProps> = ({
  open,
  onClose,
  activeTab,
  onTabChange,
  modalFormData,
  onFormDataChange,
  onAssessmentMethodToggle,
  onIqaConclusionToggle,
  sampleQuestions,
  onQuestionChange,
  onAnswerChange,
  onAddQuestion,
  onDeleteQuestion,
  onSaveQuestions,
  plannedDates = [],
  onSave,
  isSaving = false,
  planDetailId = null,
  unitCode = null,
  unitName = null,
  onCreateNew,
  isCreating = false,
  onDeleteSuccess,
}) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const iqaId = useUserId()
  const [actionModalOpen, setActionModalOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<SampleAction | null>(null)
  const [actions, setActions] = useState<SampleAction[]>([])
  const [deleteActionId, setDeleteActionId] = useState<number | null>(null)
  const [allocatedForms, setAllocatedForms] = useState<SampleAllocatedForm[]>([])
  const [selectedFormId, setSelectedFormId] = useState<string>('') // from dropdown
  const [formDescription, setFormDescription] = useState<string>('')
  const [deleteFormId, setDeleteFormId] = useState<number | null>(null)
  const [documents, setDocuments] = useState<SampleDocument[]>([])
  const [deleteDocumentId, setDeleteDocumentId] = useState<number | null>(null)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [pendingQuestionUpdate, setPendingQuestionUpdate] = useState<{
    questionText: string
    answer: 'Yes' | 'No'
  } | null>(null)

  const [triggerGetActions, { isLoading: isLoadingActions }] = useLazyGetSampleActionsQuery()
  const [createAction, { isLoading: isCreatingAction }] = useCreateSampleActionMutation()
  const [updateAction, { isLoading: isUpdatingAction }] = useUpdateSampleActionMutation()
  const [deleteAction, { isLoading: isDeletingAction }] = useDeleteSampleActionMutation()
  const [triggerGetForms, { isLoading: isLoadingForms }] = useLazyGetSampleFormsQuery()
  const [createSampleForm, { isLoading: isAllocatingForm }] = useCreateSampleFormMutation()
  const [deleteSampleForm, { isLoading: isUnlinkingForm }] = useDeleteSampleFormMutation()
  const [completeSampleForm, { isLoading: isCompletingForm }] = useCompleteSampleFormMutation()
  const [triggerGetDocuments, { isLoading: isLoadingDocuments }] = useLazyGetSampleDocumentsQuery()
  const [uploadDocument, { isLoading: isUploadingDocument }] = useUploadSampleDocumentMutation()
  const [deleteDocument, { isLoading: isDeletingDocument }] = useDeleteSampleDocumentMutation()
  const [removeSampledLearner, { isLoading: isDeletingLearner }] = useRemoveSampledLearnerMutation()
  const { data: allFormsResponse } = useGetAllFormsQuery({ page: 1, page_size: 500 }, { refetchOnMountOrArgChange: false })

  // Map sampleType to IQA question type
  const getIQAQuestionType = (sampleType: string): string => {
    const typeMap: Record<string, string> = {
      'ObserveAssessor': 'Observe Assessor',
      'LearnerInterview': 'Learner Interview',
      'EmployerInterview': 'Employer Interview',
      'Final': 'Final Check',
      'Observation': 'Observe Assessor',
      'Learner interview': 'Learner Interview',
      'Employer interview': 'Employer Interview',
      'Final Check': 'Final Check',
    }
    return typeMap[sampleType] || ''
  }

  const iqaQuestionType = getIQAQuestionType(modalFormData.sampleType)
  
  // Fetch IQA questions based on sample type
  const { data: iqaQuestionsData, isLoading: isLoadingIQAQuestions } = useGetIQAQuestionsQuery(
    { questionType: iqaQuestionType },
    { skip: !iqaQuestionType || !open }
  )

  const iqaQuestions = iqaQuestionsData?.data || []

  useEffect(() => {
    if (open && planDetailId) {
      fetchActions()
      fetchAllocatedForms()
      fetchDocuments()
    }
  }, [open, planDetailId])

  const fetchActions = async () => {
    if (!planDetailId) return
    try {
      const response = await triggerGetActions(planDetailId).unwrap()
      setActions(response?.data || [])
    } catch (error) {
      console.error('Error fetching actions:', error)
      setActions([])
    }
  }

  const handleOpenActionModal = () => {
    setEditingAction(null)
    setActionModalOpen(true)
  }

  const handleCloseActionModal = () => {
    setActionModalOpen(false)
    setEditingAction(null)
  }

  // Handle pending question updates after a new question is added
  useEffect(() => {
    if (pendingQuestionUpdate && sampleQuestions.length > 0) {
      // Find the most recently added question (should be the last one with empty question)
      // Look for questions that start with 'new-' and have empty question text
      const emptyQuestions = sampleQuestions.filter(
        (q) => String(q.id).startsWith('new-') && !q.question && q.answer === ''
      )
      if (emptyQuestions.length > 0) {
        // Update the most recent empty question
        const questionToUpdate = emptyQuestions[emptyQuestions.length - 1]
        onQuestionChange(questionToUpdate.id, pendingQuestionUpdate.questionText)
        onAnswerChange(questionToUpdate.id, pendingQuestionUpdate.answer)
        setPendingQuestionUpdate(null)
      }
    }
  }, [sampleQuestions, pendingQuestionUpdate, onQuestionChange, onAnswerChange])

  const handleEditAction = (action: SampleAction) => {
    setEditingAction(action)
    setActionModalOpen(true)
  }

  const handleSaveAction = async (formData: ActionFormData) => {
    if (!planDetailId || !iqaId) {
      dispatch(
        showMessage({
          message: 'Missing required information',
          variant: 'error',
        })
      )
      return
    }

    try {
      if (editingAction) {
        // Update existing action
        await updateAction({
          actionId: editingAction.id,
          action_required: formData.action_required,
          target_date: formData.target_date,
          status: formData.status,
          assessor_feedback: formData.assessor_feedback || undefined,
          action_with_id: formData.action_with_id,
        }).unwrap()

        dispatch(
          showMessage({
            message: 'Action updated successfully',
            variant: 'success',
          })
        )
      } else {
        // Create new action
        try {
          const result = await createAction({
            plan_detail_id: planDetailId,
            action_with_id: formData.action_with_id,
            action_required: formData.action_required,
            target_date: formData.target_date,
            status: formData.status,
            created_by_id: iqaId,
            assessor_feedback: formData.assessor_feedback || undefined,
          }).unwrap()

          dispatch(
            showMessage({
              message: result?.message || 'Action created successfully',
              variant: 'success',
            })
          )
        } catch (createError: any) {
          // Check if it's actually a success response with 201 status
          // RTK Query sometimes treats 201 as error if response structure doesn't match exactly
          if (createError?.status === 201 || (createError?.data?.status === true)) {
            dispatch(
              showMessage({
                message: createError?.data?.message || 'Action created successfully',
                variant: 'success',
              })
            )
            handleCloseActionModal()
            fetchActions()
            return
          }
          // Re-throw if it's a real error
          throw createError
        }
      }

      handleCloseActionModal()
      fetchActions()
    } catch (error: any) {
      // Check if it's actually a success response with 201 status
      // Sometimes RTK Query treats 201 as error if response structure doesn't match
      if (error?.status === 201 || (error?.data?.status === true && error?.data?.message)) {
        // It's actually a success, just handle it
        dispatch(
          showMessage({
            message: error?.data?.message || 'Action saved successfully',
            variant: 'success',
          })
        )
        handleCloseActionModal()
        fetchActions()
        return
      }

      const message = error?.data?.message || error?.error || 'Failed to save action'
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
    }
  }

  const handleDeleteAction = async (actionId: number) => {
    try {
      await deleteAction(actionId).unwrap()
      dispatch(
        showMessage({
          message: 'Action deleted successfully',
          variant: 'success',
        })
      )
      fetchActions()
      setDeleteActionId(null)
    } catch (error: any) {
      const message = error?.data?.message || error?.error || 'Failed to delete action'
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
      setDeleteActionId(null)
    }
  }

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }

  const getActionSummary = (action: SampleAction) => {
    return action.action_required.length > 50
      ? `${action.action_required.substring(0, 50)}...`
      : action.action_required
  }

  // Allocated Forms handlers
  const fetchAllocatedForms = async () => {
    if (!planDetailId) return
    try {
      const res = await triggerGetForms(planDetailId).unwrap()
      setAllocatedForms(res?.data || [])
    } catch (e) {
      setAllocatedForms([])
    }
  }

  const handleAllocateForm = async () => {
    if (!planDetailId || !iqaId || !selectedFormId) {
      dispatch(showMessage({ message: 'Select a form to allocate.', variant: 'error' }))
      return
    }
    createSampleForm({
      plan_detail_id: planDetailId,
      form_id: selectedFormId,
      allocated_by_id: iqaId,
      description: formDescription || undefined,
    }).then((result) => {
      dispatch(showMessage({ message: 'Form allocated successfully', variant: 'success' }))
      setFormDescription('')
      setSelectedFormId('')
      fetchAllocatedForms()
    }).catch((error: any) => {
      dispatch(showMessage({ message: error?.data?.message || 'Failed to allocate form', variant: 'error' }))
    })
  }

  const handleDeleteAllocatedForm = async (id: number) => {
    deleteSampleForm(id).then((result) => {
      dispatch(showMessage({ message: 'Form unlinked successfully', variant: 'success' }))
      fetchAllocatedForms()
      setDeleteFormId(null)
    }).catch((error: any) => {
      dispatch(showMessage({ message: error?.data?.message || 'Failed to unlink form', variant: 'error' }))
      setDeleteFormId(null)
    })
  }

  const handleCompleteForm = async (id: number) => {
    completeSampleForm(id).then((result) => {
      dispatch(showMessage({ message: 'Form marked as completed', variant: 'success' }))
      fetchAllocatedForms()
    }).catch((error: any) => {
      dispatch(showMessage({ message: error?.data?.message || 'Failed to mark as completed', variant: 'error' }))
    })
  }

  const fetchDocuments = async () => {
    if (!planDetailId) return
    try {
      const response = await triggerGetDocuments(planDetailId).unwrap()
      setDocuments(response?.data || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
      setDocuments([])
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !planDetailId) return


    const formData = new FormData()
    formData.append('plan_detail_id', String(planDetailId))
    formData.append('file', file)


    uploadDocument(formData).then((result) => {
      dispatch(
        showMessage({
          message: 'Document uploaded successfully',
          variant: 'success',
        })
      )
      fetchDocuments()
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }


    }).catch((error) => {
      console.log('error', error)
      dispatch(
        showMessage({
          message: error?.data?.message || error?.error || 'Failed to upload document',
          variant: 'error',
        })
      )
    })
  }

  const handleDeleteDocument = async (docId: number) => {
    deleteDocument(docId).then((result) => {
      dispatch(
        showMessage({
          message: 'Document deleted successfully',
          variant: 'success',
        })
      )
      fetchDocuments()
      setDeleteDocumentId(null)
    }).catch((error) => {
      console.log('error', error)
      dispatch(
        showMessage({
          message: 'Failed to delete document',
          variant: 'error',
        })
      )
    })
  }

  const handleDownloadDocument = (document: SampleDocument) => {
    const url = document.file_url || document.file_path
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handleDeleteLearner = async () => {
    if (!planDetailId) {
      dispatch(
        showMessage({
          message: 'Missing plan detail ID',
          variant: 'error',
        })
      )
      return
    }

      removeSampledLearner(planDetailId).then((result) => {
        dispatch(
          showMessage({
            message: 'Sampled learner removed successfully',
            variant: 'success',
          })
        )
        setShowDeleteConfirmation(false)
        onClose()
        // Trigger refetch after successful deletion
        if (onDeleteSuccess) {
          onDeleteSuccess()
        }
      }).catch((error: any) => {
        dispatch(showMessage({ message: error?.data?.message || 'Failed to remove sampled learner', variant: 'error' }))
        setShowDeleteConfirmation(false)
      })
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
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
          <IconButton onClick={onClose} size='small'>
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
            onChange={(_, newValue) => onTabChange(newValue)}
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
            {plannedDates.length > 0 ? (
              plannedDates.map((date, index) => (
                <Tab
                  key={`planned-date-${index}-${date || 'no-date'}`}
                  label={`FS ${index + 1} - (${date ? formatDate(date) : 'No Date'})`}
                  sx={{
                    '&.Mui-selected': {
                      color: getTabColor(index),
                      fontWeight: 600,
                    },
                  }}
                />
              ))
            ) : (
              <Tab
                label='No Planned Dates'
                sx={{
                  '&.Mui-selected': {
                    color: 'primary.main',
                    fontWeight: 600,
                  },
                }}
                disabled
              />
            )}
          </Tabs>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            onClick={onCreateNew}
            disabled={isCreating || !onCreateNew}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#e91e63',
              '&:hover': {
                bgcolor: '#c2185b',
              },
            }}
          >
            {isCreating ? 'Creating...' : 'Create New'}
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
            onClick={onClose}
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
            onClick={() => setShowDeleteConfirmation(true)}
            disabled={!planDetailId || isDeletingLearner}
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
            onClick={onSave}
            disabled={isSaving}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#4caf50',
              '&:hover': {
                bgcolor: '#388e3c',
              },
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
          <Button
            variant='contained'
            onClick={() => {
              onSave()
              onClose()
            }}
            disabled={isSaving}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#4caf50',
              '&:hover': {
                bgcolor: '#388e3c',
              },
            }}
          >
            {isSaving ? 'Saving...' : 'Save & Close'}
          </Button>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  size='small'
                  label='QA Name'
                  value={modalFormData.qaName || ''}
                  disabled
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2.5}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={modalFormData.type}
                    label='Type'
                    onChange={(e) => onFormDataChange('type', e.target.value)}
                  >
                    <MenuItem value='Formative'>Formative</MenuItem>
                    <MenuItem value='Summative'>Summative</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2.5}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Sample Type</InputLabel>
                  <Select
                    value={modalFormData.sampleType}
                    label='Sample Type'
                    onChange={(e) => onFormDataChange('sampleType', e.target.value)}
                  >
                    {sampleTypes.map((type) => (
                      <MenuItem key={type.value} value={type.value}>
                        {type.label}
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
                value={formatDateForInput(modalFormData.plannedDate)}
                onChange={(e) => onFormDataChange('plannedDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size='small'
                label='Completed Date'
                type='date'
                value={formatDateForInput(modalFormData.completedDate)}
                onChange={(e) => onFormDataChange('completedDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                  Assessment Methods
                </Typography>
                <Paper variant='outlined' sx={{ p: 2, borderRadius: 1 }}>
                  <Grid container spacing={1}>
                    {assessmentMethods.map((method) => (
                      <Grid item xs={3} key={method.code}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size='small'
                              checked={modalFormData.assessmentMethods.includes(method.code)}
                              onChange={() => onAssessmentMethodToggle(method.code)}
                            />
                          }
                          label={`${method.code}`}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
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
                            checked={modalFormData.iqaConclusion.includes(option)}
                            onChange={() => onIqaConclusionToggle(option)}
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
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                  Assessor Decision Correct
                </Typography>
                <FormControl component='fieldset'>
                  <RadioGroup
                    row
                    value={modalFormData.assessorDecisionCorrect}
                    onChange={(e) => onFormDataChange('assessorDecisionCorrect', e.target.value)}
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
                onChange={(e) => onFormDataChange('assessmentProcesses', e.target.value)}
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
                onChange={(e) => onFormDataChange('feedback', e.target.value)}
                placeholder='Please type in feedback. Max 4400 characters.'
                inputProps={{ maxLength: 4400 }}
              />
            </Grid>
          </Grid>
          <Button
            variant='contained'
            onClick={() => {
              // Navigate to examine evidence page with new URL format
              if (planDetailId) {
                const params = new URLSearchParams()
                if (unitCode) {
                  params.append('unit_code', unitCode)
                }
                if (unitName) {
                  params.append('unitName', unitName)
                }
                navigate(`/sample-plan/${planDetailId}/evidence${params.toString() ? `?${params.toString()}` : ''}`)
              }
            }}
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
                  <IconButton size='small' onClick={fetchActions} disabled={isLoadingActions}>
                    <RefreshIcon fontSize='small' />
                  </IconButton>
                  <Button
                    variant='contained'
                    size='small'
                    startIcon={<AddIcon />}
                    onClick={handleOpenActionModal}
                    disabled={!planDetailId}
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
                    {isLoadingActions ? (
                      <TableRow>
                        <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                          <Typography variant='body2' color='text.secondary'>
                            Loading actions...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : actions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                          <Typography variant='body2' color='text.secondary'>
                            There are no Actions on this Sample
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      actions.map((action) => (
                        <TableRow key={action.id} hover>
                          <TableCell>{getActionSummary(action)}</TableCell>
                          <TableCell>{action.action_required}</TableCell>
                          <TableCell>
                            {`${action.action_with?.first_name || ''} ${action.action_with?.last_name || ''}`.trim() ||
                              'N/A'}
                          </TableCell>
                          <TableCell>{formatDateForDisplay(action.target_date)}</TableCell>
                          <TableCell>
                            <Stack direction='row' spacing={1}>
                              <IconButton
                                size='small'
                                onClick={() => handleEditAction(action)}
                                sx={{
                                  color: 'primary.main',
                                  '&:hover': {
                                    bgcolor: 'primary.light',
                                  },
                                }}
                              >
                                <EditIcon fontSize='small' />
                              </IconButton>
                              <IconButton
                                size='small'
                                onClick={() => setDeleteActionId(action.id)}
                                disabled={isDeletingAction && deleteActionId === action.id}
                                sx={{
                                  color: 'error.main',
                                  '&:hover': {
                                    bgcolor: 'error.light',
                                  },
                                }}
                              >
                                <DeleteIcon fontSize='small' />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          {/* IQA Questions Section */}
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
                  IQA Questions
                </Typography>
              </Box>
              <Button
                variant='contained'
                size='small'
                onClick={onSaveQuestions}
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
                    {isLoadingIQAQuestions ? (
                      <TableRow>
                        <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                          <Typography variant='body2' color='text.secondary'>
                            Loading questions...
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : iqaQuestions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                          <Typography variant='body2' color='text.secondary'>
                            No IQA questions available for this sample type.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      iqaQuestions.map((iqaQuestion, index) => {
                        // Find corresponding sample question answer if exists
                        const sampleQuestion = sampleQuestions.find(
                          (sq) => sq.question === iqaQuestion.question || sq.id === `iqa-${iqaQuestion.id}`
                        )
                        const answer = sampleQuestion?.answer || ''
                        
                        const handleAnswerSelect = (selectedAnswer: 'Yes' | 'No') => {
                          if (sampleQuestion) {
                            // Update existing question answer
                            onAnswerChange(sampleQuestion.id, selectedAnswer)
                          } else {
                            // Set pending update and add question
                            // The useEffect will handle updating it once it's added
                            setPendingQuestionUpdate({
                              questionText: iqaQuestion.question,
                              answer: selectedAnswer,
                            })
                            onAddQuestion()
                          }
                        }
                        
                        return (
                          <TableRow key={iqaQuestion.id} hover>
                            <TableCell>
                              <Typography variant='body2' sx={{ py: 1 }}>
                                {iqaQuestion.question}
                              </Typography>
                            </TableCell>
                            <TableCell align='center'>
                              <Radio
                                size='small'
                                checked={answer === 'Yes'}
                                onChange={() => handleAnswerSelect('Yes')}
                                value='Yes'
                              />
                            </TableCell>
                            <TableCell align='center'>
                              <Radio
                                size='small'
                                checked={answer === 'No'}
                                onChange={() => handleAnswerSelect('No')}
                                value='No'
                              />
                            </TableCell>
                            <TableCell align='center'>
                              {/* No delete action for IQA questions */}
                            </TableCell>
                          </TableRow>
                        )
                      })
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        </Box>
      </Box>

      {/* Action Modal */}
      <ActionModal
        open={actionModalOpen}
        onClose={handleCloseActionModal}
        onSave={handleSaveAction}
        planDetailId={planDetailId}
        editingAction={editingAction}
        isSaving={isCreatingAction || isUpdatingAction}
      />

      {/* Delete Action Confirmation Dialog */}
      <Dialog
        open={deleteActionId !== null}
        onClose={() => setDeleteActionId(null)}
        maxWidth='xs'
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
            Delete Action?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Are you sure you want to delete this action? This action cannot be undone.
          </Typography>
          <Stack direction='row' spacing={2} justifyContent='flex-end'>
            <Button
              variant='outlined'
              onClick={() => setDeleteActionId(null)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={() => deleteActionId && handleDeleteAction(deleteActionId)}
              disabled={isDeletingAction}
              sx={{ textTransform: 'none' }}
            >
              {isDeletingAction ? 'Deleting...' : 'Delete'}
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* Delete Document Confirmation Dialog */}
      <Dialog
        open={deleteDocumentId !== null}
        onClose={() => setDeleteDocumentId(null)}
        maxWidth='xs'
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
            Delete Document?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Are you sure you want to delete this document? This action cannot be undone.
          </Typography>
          <Stack direction='row' spacing={2} justifyContent='flex-end'>
            <Button
              variant='outlined'
              onClick={() => setDeleteDocumentId(null)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={() => deleteDocumentId && handleDeleteDocument(deleteDocumentId)}
              disabled={isDeletingDocument}
              sx={{ textTransform: 'none' }}
            >
              {isDeletingDocument ? 'Deleting...' : 'Delete'}
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* Delete Allocated Form Confirmation Dialog */}
      <Dialog
        open={deleteFormId !== null}
        onClose={() => setDeleteFormId(null)}
        maxWidth='xs'
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
            Remove Allocated Form?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Are you sure you want to unlink this form from the sample?
          </Typography>
          <Stack direction='row' spacing={2} justifyContent='flex-end'>
            <Button
              variant='outlined'
              onClick={() => setDeleteFormId(null)}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={() => deleteFormId && handleDeleteAllocatedForm(deleteFormId)}
              disabled={isUnlinkingForm}
              sx={{ textTransform: 'none' }}
            >
              {isUnlinkingForm ? 'Removing...' : 'Remove'}
            </Button>
          </Stack>
        </Box>
      </Dialog>

      {/* Delete Sampled Learner Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirmation}
        onClose={() => !isDeletingLearner && setShowDeleteConfirmation(false)}
        maxWidth='xs'
        fullWidth
      >
        <Box sx={{ p: 3 }}>
          <Typography variant='h6' sx={{ mb: 2, fontWeight: 600 }}>
            Delete Sampled Learner?
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
            Are you sure you want to remove this sampled learner? This action cannot be undone.
          </Typography>
          <Stack direction='row' spacing={2} justifyContent='flex-end'>
            <Button
              variant='outlined'
              onClick={() => setShowDeleteConfirmation(false)}
              disabled={isDeletingLearner}
              sx={{ textTransform: 'none' }}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              color='error'
              onClick={handleDeleteLearner}
              disabled={isDeletingLearner}
              sx={{ textTransform: 'none' }}
            >
              {isDeletingLearner ? 'Deleting...' : 'Delete'}
            </Button>
          </Stack>
        </Box>
      </Dialog>
    </Dialog>
  )
}

