import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  Paper,
  Card,
  CardContent,
  IconButton,
  Chip,
  Divider,
  alpha,
  useTheme,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
} from '@mui/material'
import { styled } from '@mui/material/styles'
import React, { useEffect, useState } from 'react'
import {
  useGetIQAQuestionsQuery,
  useCreateIQAQuestionMutation,
  useUpdateIQAQuestionMutation,
  useDeleteIQAQuestionMutation,
} from 'src/app/store/api/iqa-questions-api'
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import AlertDialog from 'src/app/component/Dialogs/AlertDialog'

// Styled Components
const StyledContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  background: `linear-gradient(135deg, ${alpha(
    theme.palette.primary.main,
    0.03
  )} 0%, ${alpha(theme.palette.secondary.main, 0.03)} 100%)`,
  minHeight: 'calc(100vh - 100px)',
}))

const StyledHeaderCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
  color: theme.palette.primary.contrastText,
}))

const StyledContentCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: theme.shadows[2],
  overflow: 'hidden',
}))

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  '& .MuiTableHead-root': {
    backgroundColor: alpha(theme.palette.primary.main, 0.08),
  },
  '& .MuiTableRow-root': {
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      transform: 'translateX(4px)',
    },
  },
}))

const StyledActionButton = styled(IconButton)(({ theme }) => ({
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'scale(1.1)',
  },
}))

const StyledQuestionCell = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  padding: theme.spacing(1, 0),
  '& .question-number': {
    minWidth: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 600,
    fontSize: '0.875rem',
  },
}))

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(8),
  textAlign: 'center',
  '& .empty-icon': {
    fontSize: 64,
    color: alpha(theme.palette.text.secondary, 0.3),
    marginBottom: theme.spacing(2),
  },
}))

const IQAQuestions = () => {
  const theme = useTheme()
  const [questionDialog, setQuestionDialog] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editQuestionIndex, setEditQuestionIndex] = useState<number | null>(
    null
  )
  const [deleteQuestionIndex, setDeleteQuestionIndex] = useState<number | null>(
    null
  )
  const [deleteQuestionId, setDeleteQuestionId] = useState<number | null>(null)
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('')
  const [questions, setQuestions] = useState<
    Array<{
      id: number
      question: string
      questionType: string
      isActive?: boolean
      createdAt?: string
      updatedAt?: string
    }>
  >([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Question type options
  const questionTypeOptions = [
    'All',
    'Observe Assessor',
    'Learner Interview',
    'Employer Interview',
    'Final Check',
  ]

  const { data: questionsData, refetch } = useGetIQAQuestionsQuery({
    questionType:
      selectedQuestionType === 'All' || !selectedQuestionType
        ? ''
        : selectedQuestionType,
  })
  const [createIQAQuestion, { isLoading: isCreating }] =
    useCreateIQAQuestionMutation()
  const [updateIQAQuestion, { isLoading: isUpdating }] =
    useUpdateIQAQuestionMutation()
  const [deleteIQAQuestion, { isLoading: isDeleting }] =
    useDeleteIQAQuestionMutation()

  useEffect(() => {
    if (questionsData?.data && Array.isArray(questionsData.data)) {
      if (selectedQuestionType === 'All' || !selectedQuestionType) {
        // If "All" is selected, show all questions
        setQuestions(questionsData.data)
      } else {
        // Filter questions by selected question type
        const filteredQuestions = questionsData.data.filter(
          (item) => item.questionType === selectedQuestionType
        )
        setQuestions(filteredQuestions)
      }
    } else {
      setQuestions([])
    }
  }, [questionsData, selectedQuestionType])

  const handleQuestionTypeChange = (event: any) => {
    const value = event.target.value
    if (value) {
      setSelectedQuestionType(value)
      setQuestions([])
    } else {
      setSelectedQuestionType('')
      setQuestions([])
    }
  }

  const openAddDialog = () => {
    setCurrentQuestion('')
    setIsEditMode(false)
    setEditQuestionIndex(null)
    setQuestionDialog(true)
  }

  const openEditDialog = (index: number) => {
    const question = questions[index]
    setCurrentQuestion(question.question)
    setIsEditMode(true)
    setEditQuestionIndex(index)
    setQuestionDialog(true)
  }

  const closeQuestionDialog = () => {
    setQuestionDialog(false)
    setIsEditMode(false)
    setEditQuestionIndex(null)
    setCurrentQuestion('')
    setErrorMessage('')
  }

  const handleAddOrUpdateQuestion = async () => {
    // Reset error message
    setErrorMessage('')

    // Validate question text
    if (!currentQuestion.trim()) {
      setErrorMessage('Question text is required')
      return
    }

    // Validate question type
    if (!selectedQuestionType || selectedQuestionType === 'All') {
      setErrorMessage('Please select a valid question type')
      return
    }

    if (isEditMode && editQuestionIndex !== null) {
      // Editing existing question
      const questionToUpdate = questions[editQuestionIndex]
      
      // If question has an ID (already saved), use PATCH API
      if (questionToUpdate.id && questionToUpdate.id > 0) {
        try {
          setLoading(true)
          await updateIQAQuestion({
            id: questionToUpdate.id,
            payload: {
              question: currentQuestion.trim(),
            },
          }).unwrap()
          
          refetch()
          closeQuestionDialog()
        } catch (error) {
          console.error('Error updating question:', error)
        } finally {
          setLoading(false)
        }
      }
    } else {
      // Adding new question - use POST API to create single question
      try {
        setLoading(true)
        await createIQAQuestion({
          questionType: selectedQuestionType,
          question: currentQuestion.trim(),
        }).unwrap()
        
        refetch()
        closeQuestionDialog()
      } catch (error) {
        console.error('Error creating question:', error)
      } finally {
        setLoading(false)
      }
    }
  }


  const handleDeleteQuestion = async () => {
    if (deleteQuestionId !== null) {
      try {
        await deleteIQAQuestion(deleteQuestionId).unwrap()
        refetch()
        setDeleteQuestionIndex(null)
        setDeleteQuestionId(null)
      } catch (error) {
        console.error('Error deleting question:', error)
      }
    } else if (deleteQuestionIndex !== null) {
      // If question doesn't have an ID yet (not saved), just remove from local state
      const newQuestions = questions.filter(
        (_, index) => index !== deleteQuestionIndex
      )
      setQuestions(newQuestions)
      setDeleteQuestionIndex(null)
    }
  }

  return (
    <StyledContainer>
      {/* Header Section */}
      <StyledHeaderCard>
        <CardContent>
          <Box display='flex' alignItems='center' gap={2}>
            <QuestionAnswerIcon sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant='h4' fontWeight={600} gutterBottom>
                IQA Maintain Questions
              </Typography>
              <Typography variant='body2' sx={{ opacity: 0.9 }}>
                Manage and organize IQA assessment questions by type
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </StyledHeaderCard>

      {/* Question Type Selection */}
      <StyledContentCard>
        <CardContent>
          <Box mb={3}>
            <Typography
              variant='subtitle1'
              fontWeight={600}
              gutterBottom
              sx={{ mb: 1.5 }}
            >
              Question Type{' '}
              <Chip
                label='Required'
                size='small'
                color='primary'
                sx={{ ml: 1, height: 20 }}
              />
            </Typography>
            <FormControl fullWidth>
              <Select
                value={selectedQuestionType}
                onChange={handleQuestionTypeChange}
                displayEmpty
                size='medium'
                sx={{
                  borderRadius: 2,
                }}
              >
                <MenuItem value='' disabled>
                  Select a question type to manage questions
                </MenuItem>
                {questionTypeOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </StyledContentCard>

      {/* Questions Table Section */}
      <StyledContentCard>
        <CardContent>
          <Box
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            mb={3}
          >
            <Box>
              {selectedQuestionType && selectedQuestionType !== 'All' && (
                <Typography variant='h6' fontWeight={600} gutterBottom>
                  Questions for "{selectedQuestionType}"
                </Typography>
              )}
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mt: 0.5 }}
              >
                {questions.length}{' '}
                {questions.length === 1 ? 'question' : 'questions'}
                {selectedQuestionType === 'All' && ' (all types)'}
              </Typography>
            </Box>

            <SecondaryButton
              name='Add Question'
              startIcon={<AddIcon />}
              onClick={openAddDialog}
              sx={{ borderRadius: 2 }}
            />
          </Box>

          <Divider sx={{ mb: 2 }} />

          {questions.length > 0 ? (
            <>
              <StyledTableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        #
                      </TableCell>
                      {selectedQuestionType === 'All' && (
                        <TableCell
                          sx={{ fontWeight: 600, fontSize: '0.95rem' }}
                        >
                          Type
                        </TableCell>
                      )}
                      <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        Question
                      </TableCell>
                      <TableCell
                        align='right'
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.95rem',
                          width: 120,
                        }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {questions.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell sx={{ width: 60 }}>
                          <Box className='question-number'>{index + 1}</Box>
                        </TableCell>
                        {selectedQuestionType === 'All' && (
                          <TableCell>
                            <Chip
                              label={row.questionType || 'Unknown'}
                              size='small'
                              color='primary'
                              variant='outlined'
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <StyledQuestionCell>
                            <Tooltip title={row.question} arrow placement='top'>
                              <Typography
                                variant='body1'
                                sx={{
                                  flex: 1,
                                  wordBreak: 'break-word',
                                  lineHeight: 1.6,
                                }}
                              >
                                {row.question}
                              </Typography>
                            </Tooltip>
                          </StyledQuestionCell>
                        </TableCell>
                        <TableCell align='right'>
                          <Box display='flex' gap={1} justifyContent='flex-end'>
                            <StyledActionButton
                              size='small'
                              onClick={() => openEditDialog(index)}
                              sx={{
                                color: theme.palette.warning.main,
                                '&:hover': {
                                  backgroundColor: alpha(
                                    theme.palette.warning.main,
                                    0.1
                                  ),
                                },
                              }}
                            >
                              <EditIcon fontSize='small' />
                            </StyledActionButton>
                            <StyledActionButton
                              size='small'
                              onClick={() => {
                                setDeleteQuestionIndex(index)
                                if (row.id) {
                                  setDeleteQuestionId(row.id)
                                } else {
                                  setDeleteQuestionId(null)
                                }
                              }}
                              sx={{
                                color: theme.palette.error.main,
                                '&:hover': {
                                  backgroundColor: alpha(
                                    theme.palette.error.main,
                                    0.1
                                  ),
                                },
                              }}
                            >
                              <DeleteIcon fontSize='small' />
                            </StyledActionButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </StyledTableContainer>
            </>
          ) : (
            <EmptyStateContainer>
              <QuestionAnswerIcon className='empty-icon' />
              <Typography variant='h6' color='text.secondary' gutterBottom>
                No questions yet
              </Typography>
              <Typography
                variant='body2'
                color='text.secondary'
                sx={{ mb: 3, maxWidth: 400 }}
              >
                Get started by adding your first question for this question
                type. Click the "Add Question" button above to begin.
              </Typography>
              <SecondaryButton
                name='Add First Question'
                startIcon={<AddIcon />}
                onClick={openAddDialog}
                sx={{ borderRadius: 2 }}
              />
            </EmptyStateContainer>
          )}
        </CardContent>
      </StyledContentCard>

      <AlertDialog
        open={deleteQuestionIndex !== null}
        close={() => {
          setDeleteQuestionIndex(null)
          setDeleteQuestionId(null)
        }}
        title='Delete Question?'
        content='Are you sure you want to delete this question? This action cannot be undone.'
        className='-224'
        actionButton={
          isDeleting ? (
            <LoadingButton />
          ) : (
            <DangerButton
              onClick={handleDeleteQuestion}
              name='Delete Question'
            />
          )
        }
        cancelButton={
          <SecondaryButtonOutlined
            className='px-24'
            onClick={() => {
              setDeleteQuestionIndex(null)
              setDeleteQuestionId(null)
            }}
            name='Cancel'
          />
        }
      />

      <Dialog
        open={questionDialog}
        onClose={closeQuestionDialog}
        fullWidth
        maxWidth='md'
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={2}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <QuestionAnswerIcon sx={{ color: theme.palette.primary.main }} />
            </Box>
            <Box>
              <Typography variant='h5' fontWeight={600}>
                {isEditMode ? 'Edit Question' : 'Add New Question'}
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                {selectedQuestionType &&
                  `Question Type: ${selectedQuestionType}`}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <Divider />
        <DialogContent sx={{ pt: 3 }}>
          {errorMessage && (
            <Alert severity='error' sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
              {errorMessage}
            </Alert>
          )}
          <Box>
            <Typography
              variant='subtitle2'
              fontWeight={600}
              gutterBottom
              sx={{ mb: 1.5 }}
            >
              Question Text{' '}
              <Chip
                label='Required'
                size='small'
                color='error'
                sx={{ ml: 1, height: 20 }}
              />
            </Typography>
            <TextField
              value={currentQuestion}
              fullWidth
              required
              multiline
              rows={5}
              placeholder='Enter your question here...'
              onChange={(e) => setCurrentQuestion(e.target.value)}
              variant='outlined'
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                },
              }}
              autoFocus
            />
            <Typography
              variant='caption'
              color='text.secondary'
              sx={{ mt: 1, display: 'block' }}
            >
              {currentQuestion.length} characters
            </Typography>
          </Box>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ p: 2.5 }}>
          <SecondaryButtonOutlined
            name='Cancel'
            onClick={closeQuestionDialog}
            sx={{ minWidth: 100, borderRadius: 2 }}
          />
          {loading || isUpdating || isCreating ? (
            <LoadingButton style={{ minWidth: 150 }} />
          ) : (
            <SecondaryButton
              name={isEditMode ? 'Update Question' : 'Add Question'}
              onClick={handleAddOrUpdateQuestion}
              disabled={!currentQuestion.trim()}
              startIcon={isEditMode ? <EditIcon /> : <AddIcon />}
              sx={{ minWidth: 150, borderRadius: 2 }}
            />
          )}
        </DialogActions>
      </Dialog>
    </StyledContainer>
  )
}

export default IQAQuestions
