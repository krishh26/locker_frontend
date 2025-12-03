import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useParams } from 'react-router-dom'
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import { useGetEvidenceListQuery, useAddAssignmentReviewMutation } from 'app/store/api/sample-plan-api'
import FuseLoading from '@fuse/core/FuseLoading'
import { useCurrentUser } from 'src/app/utils/userHelpers'
import { useDispatch } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'

interface EvidenceRow {
  refNo: string
  evidenceDocuments: string
  evidenceName: string
  evidenceDescription: string
  assessmentMethod: string
  grade: string
  dateSet: string
  dateDue: string
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
  grade: string | null
  assessment_method: string[]
  created_at: string
  unit: {
    unit_ref: string
    title: string
  }
  mappedSubUnits: Array<{
    id: number
    subTitle: string
  }>
  reviews: {
    [role: string]: {
      completed: boolean
      comment: string
      signed_off_at: string | null
      signed_off_by: string | null
    }
  } | Record<string, unknown>
}

interface ConfirmationRow {
  role: string
  statement: string
  completed: boolean
  signedOffBy: string
  dated: string
  comments: string
  file: string
}

const ExamineEvidencePage: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()
  const params = useParams<{ planDetailId: string }>()
  const currentUser = useCurrentUser()
  
  // Get planDetailId from URL params (new route) or search params (old route)
  const planDetailId = params.planDetailId || searchParams.get('sampleResultsId') || searchParams.get('SampleResultsID') || ''
  const unitCode = searchParams.get('unit_code') || ''
  
  // Get unit name from search params or default
  const unitName = searchParams.get('unitName') || 'Unit 1'
  const moduleId = searchParams.get('module') || '2776'
  const unitId = searchParams.get('unitId') || searchParams.get('UnitID') || ''

  // Call API to fetch evidence list
  const { data: evidenceResponse, isLoading: isLoadingEvidence, isError: isErrorEvidence, refetch: refetchEvidence } = useGetEvidenceListQuery(
    { planDetailId: planDetailId as string | number, unitCode },
    { skip: !planDetailId || !unitCode }
  )

  // Add assignment review mutation
  const [addAssignmentReview, { isLoading: isSubmittingReview }] = useAddAssignmentReviewMutation()

  // Evidence data state
  const [evidenceRows, setEvidenceRows] = useState<EvidenceRow[]>([])
  const [evidenceData, setEvidenceData] = useState<EvidenceData[]>([])
  const [displayUnitName, setDisplayUnitName] = useState<string>(unitName)
  
  // Comment modal state
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceData | null>(null)
  const [comment, setComment] = useState('')
  
  // Criteria sign-off state
  const [criteriaSignOff, setCriteriaSignOff] = useState<Record<string, boolean>>({
    '1 12': false,
    '1 1': false,
  })

  // Confirmation statements data
  const [confirmationRows, setConfirmationRows] = useState<ConfirmationRow[]>([
    {
      role: 'Learner',
      statement: 'I confirm that this unit is complete and the evidence provided is a result of my own work',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
    {
      role: 'Assessor',
      statement: 'I confirm that the learner has demonstrated competence by satisfying all the skills and knowledge for this unit, and has been assessed according to requirements of the qualification.',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
    {
      role: 'Lead assessor Countersignature (if required)',
      statement: 'I confirm that the learner has demonstrated competence by satisfying all the skills and knowledge for this unit, and has been assessed according to requirements of the qualification.',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
    {
      role: 'Employer',
      statement: 'I can confirm that the evidence I have checked as an employer meets the standards.',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
    {
      role: 'Internal Quality Assurer',
      statement: 'I can confirm that the evidence I have sampled as an Internal Quality Assurer meets the standards.',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
    {
      role: 'External Verifier',
      statement: 'Verified as part of External QA Visit.',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
  ])

  const [unitLocked, setUnitLocked] = useState(false)

  // Handle opening comment modal
  const handleOpenCommentModal = (evidence: EvidenceData) => {
    setSelectedEvidence(evidence)
    // Pre-fill comment if there's already a review for current user's role
    const userRole = currentUser?.role || 'IQA'
    const existingReview = evidence.reviews && typeof evidence.reviews === 'object' && !Array.isArray(evidence.reviews)
      ? (evidence.reviews as { [role: string]: { comment: string } })[userRole]
      : null
    setComment(existingReview?.comment || '')
    setCommentModalOpen(true)
  }

  // Get reviews for display
  const getReviewsForEvidence = (evidence: EvidenceData) => {
    if (!evidence.reviews || typeof evidence.reviews !== 'object' || Array.isArray(evidence.reviews)) {
      return null
    }
    return evidence.reviews as { [role: string]: { completed: boolean; comment: string; signed_off_at: string | null; signed_off_by: string | null } }
  }

  // Get color for role chip
  const getRoleColor = (role: string, completed: boolean): 'default' | 'primary' | 'success' | 'warning' | 'info' | 'error' => {
    if (completed) {
      return 'success'
    }
    switch (role) {
      case 'IQA':
        return 'primary'
      case 'Admin':
        return 'info'
      case 'Trainer':
        return 'warning'
      case 'EQA':
        return 'error'
      case 'LIQA':
        return 'primary'
      case 'Employer':
        return 'warning'
      case 'Learner':
        return 'default'
      default:
        return 'default'
    }
  }

  // Handle closing comment modal
  const handleCloseCommentModal = () => {
    setCommentModalOpen(false)
    setSelectedEvidence(null)
    setComment('')
  }

  // Handle submitting comment
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
      // Refetch evidence list to get updated data
      refetchEvidence()
    } catch (error: any) {
      const message = error?.data?.message || error?.error || 'Failed to add comment.'
      dispatch(
        showMessage({
          message,
          variant: 'error',
        })
      )
    }
  }

  // Update evidence rows when API response is received
  useEffect(() => {
    if (evidenceResponse?.data && Array.isArray(evidenceResponse.data)) {
      setEvidenceData(evidenceResponse.data)
      const mappedRows: EvidenceRow[] = evidenceResponse.data.map((evidence: EvidenceData) => ({
        refNo: String(evidence.assignment_id),
        evidenceDocuments: evidence.file?.name || '-',
        evidenceName: evidence.title || '-',
        evidenceDescription: evidence.description || '-',
        assessmentMethod: evidence.assessment_method?.join(', ') || '-',
        grade: evidence.grade || '-',
        dateSet: '-', // Not available in API response
        dateDue: '-', // Not available in API response
        dateUploaded: evidence.created_at ? new Date(evidence.created_at).toLocaleDateString() : '-',
      }))
      setEvidenceRows(mappedRows)
      
      // Update unit name from API response if available
      if (evidenceResponse.data.length > 0 && evidenceResponse.data[0].unit?.title) {
        setDisplayUnitName(evidenceResponse.data[0].unit.title)
      }
    } else if (evidenceResponse?.data && evidenceResponse.data.length === 0) {
      setEvidenceRows([])
      setEvidenceData([])
    }
  }, [evidenceResponse])

  const handleCriteriaToggle = (key: string) => {
    setCriteriaSignOff((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleConfirmationToggle = (index: number) => {
    setConfirmationRows((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        completed: !updated[index].completed,
      }
      return updated
    })
  }

  const handleAddComment = (index: number) => {
    // Handle add comment logic
    console.log('Add comment for', confirmationRows[index].role)
  }

  const handleAddFile = (index: number) => {
    // Handle add file logic
    console.log('Add file for', confirmationRows[index].role)
  }

  // Show loading state
  if (isLoadingEvidence) {
    return <FuseLoading />
  }

  // Show error state
  if (isErrorEvidence) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Failed to load evidence list. Please try again.</Typography>
      </Box>
    )
  }

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
        <Stack
          direction='row'
          alignItems='center'
          spacing={2}
        >
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

      {/* Content */}
      <Box sx={{ flex: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        <Stack spacing={3}>
          {/* Evidence Table */}
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
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Ref No
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Evidence Documents
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Evidence Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Evidence Description
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Assessment Method
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Grade
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Date Set
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Date Due
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
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
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        textAlign: 'center',
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evidenceRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={11}
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
                      return (
                      <TableRow key={index} hover>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.refNo}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {fileUrl ? (
                            <a
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: '#1976d2', textDecoration: 'none' }}
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
                          {row.grade}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.dateSet}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.dateDue}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.dateUploaded}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}></TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                            {(() => {
                              const reviews = getReviewsForEvidence(evidence)
                              if (reviews && Object.keys(reviews).length > 0) {
                                // Sort reviews by role priority for consistent display
                                const rolePriority: { [key: string]: number } = {
                                  'IQA': 1,
                                  'LIQA': 2,
                                  'EQA': 3,
                                  'Admin': 4,
                                  'Trainer': 5,
                                  'Employer': 6,
                                  'Learner': 7,
                                }
                                const sortedReviews = Object.entries(reviews).sort(([roleA], [roleB]) => {
                                  const priorityA = rolePriority[roleA] || 99
                                  const priorityB = rolePriority[roleB] || 99
                                  return priorityA - priorityB
                                })
                                
                                return sortedReviews.map(([role, reviewData]) => (
                                  <Tooltip
                                    key={role}
                                    title={
                                      <Box>
                                        <Typography variant='body2' sx={{ fontWeight: 600, mb: 0.5 }}>
                                          {role} Review:
                                        </Typography>
                                        <Typography variant='body2' sx={{ mb: 0.5 }}>
                                          {reviewData.comment || 'No comment'}
                                        </Typography>
                                        <Typography variant='caption' sx={{ display: 'block', color: reviewData.completed ? '#4caf50' : '#666666' }}>
                                          Status: {reviewData.completed ? 'Completed' : 'Pending'}
                                        </Typography>
                                        {reviewData.signed_off_at && (
                                          <Typography variant='caption' sx={{ display: 'block', mt: 0.5 }}>
                                            Signed off: {new Date(reviewData.signed_off_at).toLocaleDateString()}
                                            {reviewData.signed_off_by && ` by ${reviewData.signed_off_by}`}
                                          </Typography>
                                        )}
                                      </Box>
                                    }
                                    arrow
                                  >
                                    <Chip
                                      label={role}
                                      size='small'
                                      color={getRoleColor(role, reviewData.completed)}
                                      variant={reviewData.completed ? 'filled' : 'outlined'}
                                      sx={{
                                        fontSize: '0.7rem',
                                        height: 22,
                                        fontWeight: reviewData.completed ? 600 : 500,
                                        '& .MuiChip-label': {
                                          px: 0.75,
                                        },
                                      }}
                                    />
                                  </Tooltip>
                                ))
                              }
                              return null
                            })()}
                            <IconButton
                              size='small'
                              onClick={() => handleOpenCommentModal(evidence)}
                              sx={{
                                color: '#1976d2',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                                },
                              }}
                            >
                              <AddIcon fontSize='small' />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Sign off criteria section */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Stack direction='row' spacing={1} alignItems='center'>
                {Object.entries(criteriaSignOff).map(([key, checked]) => (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Checkbox
                      size='small'
                      checked={checked}
                      onChange={() => handleCriteriaToggle(key)}
                      sx={{ p: 0.5 }}
                    />
                    <Typography variant='body2' sx={{ fontSize: '0.875rem' }}>
                      {key}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Typography variant='body2' sx={{ color: '#666666', ml: 'auto' }}>
                No. Req
              </Typography>
              <Button
                variant='outlined'
                size='small'
                startIcon={<AddIcon />}
                sx={{
                  textTransform: 'none',
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                }}
              >
                Show All
              </Button>
            </Box>
          </Paper>

          {/* Confirmation Statement Table */}
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
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0', width: '20%' }}>
                      Role
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0', width: '35%' }}>
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
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0', width: '12%' }}>
                      Signed off by
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0', width: '10%' }}>
                      Dated
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0', width: '13%' }}>
                      General Comments
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '10%' }}>
                      File
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {confirmationRows.map((row, index) => (
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
                        <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
                          <Checkbox
                            size='small'
                            checked={row.completed}
                            onChange={() => handleConfirmationToggle(index)}
                            sx={{ p: 0.5 }}
                          />
                          <IconButton
                            size='small'
                            onClick={() => handleAddComment(index)}
                            sx={{
                              p: 0.5,
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              },
                            }}
                          >
                            <AddIcon fontSize='small' />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>
                        {row.signedOffBy || '-'}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>
                        {row.dated || '-'}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>
                        {row.comments || '-'}
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        {row.file ? (
                          <Typography variant='body2' color='primary'>
                            {row.file}
                          </Typography>
                        ) : (
                          <IconButton
                            size='small'
                            onClick={() => handleAddFile(index)}
                            sx={{
                              p: 0.5,
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              },
                            }}
                          >
                            <AddIcon fontSize='small' />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Unit Lock Section */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                Assessor, IQA or EV - Lock Admin, Super Admin-Unlock
              </Typography>
              <Checkbox
                size='small'
                checked={unitLocked}
                onChange={(e) => setUnitLocked(e.target.checked)}
                sx={{ p: 0.5 }}
              />
              <Typography variant='body2' sx={{ color: '#666666' }}>
                Unit locked from change.
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Box>

      {/* Comment Modal */}
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
            <Typography variant='h6' sx={{ fontWeight: 600, color: '#1976d2' }}>
              Add Comment
            </Typography>
            <IconButton onClick={handleCloseCommentModal} size='small'>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Content */}
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
                  
                  {/* Existing Reviews */}
                  {(() => {
                    const reviews = getReviewsForEvidence(selectedEvidence)
                    if (reviews && Object.keys(reviews).length > 0) {
                      return (
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
                            {(() => {
                              // Sort reviews by role priority for consistent display
                              const rolePriority: { [key: string]: number } = {
                                'IQA': 1,
                                'LIQA': 2,
                                'EQA': 3,
                                'Admin': 4,
                                'Trainer': 5,
                                'Employer': 6,
                                'Learner': 7,
                              }
                              const sortedReviews = Object.entries(reviews).sort(([roleA], [roleB]) => {
                                const priorityA = rolePriority[roleA] || 99
                                const priorityB = rolePriority[roleB] || 99
                                return priorityA - priorityB
                              })
                              
                              return sortedReviews.map(([role, reviewData]) => (
                                <Box
                                  key={role}
                                  sx={{
                                    p: 1.5,
                                    backgroundColor: '#ffffff',
                                    borderRadius: 1,
                                    border: '1px solid #e0e0e0',
                                  }}
                                >
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
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
                                  <Typography variant='body2' sx={{ color: '#333333', mb: 0.5 }}>
                                    {reviewData.comment || 'No comment'}
                                  </Typography>
                                  {reviewData.signed_off_at && (
                                    <Typography variant='caption' sx={{ color: '#666666', display: 'block' }}>
                                      Signed off: {new Date(reviewData.signed_off_at).toLocaleString()}
                                      {reviewData.signed_off_by && ` by ${reviewData.signed_off_by}`}
                                    </Typography>
                                  )}
                                </Box>
                              ))
                            })()}
                          </Stack>
                        </Box>
                      )
                    }
                    return null
                  })()}
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

          {/* Actions */}
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
    </Box>
  )
}

export default ExamineEvidencePage
