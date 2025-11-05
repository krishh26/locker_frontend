import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tab,
  Tabs,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Checkbox
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { useDispatch } from 'react-redux'
import { submitGatewayAnswers, reviewGatewayResponse, uploadGatewayEvidence } from 'src/app/store/courseManagement'
import { useForm, Controller } from 'react-hook-form'

export interface GatewayQuestionItem {
  id: string
  question: string
  evidenceRequired: boolean
  isDropdown: boolean
  dropdownOptions: string
  // Optional prefilled answers from backend
  Answer?: string
  learner_answer?: string
  achieved?: boolean
  achieved_at?: string
  Achieved_at?: string
  learner_files?: { url: string; uploaded_at: string }[]
}

interface LearnerAnswer {
  answer: string
  achieved: boolean
  dateAchieved?: string
}

interface GatewayChecklistProps {
  questions: GatewayQuestionItem[]
  // Learners can edit their answers; others may not
  canEditAnswer?: boolean
  // Only admins/trainers can mark achieved
  canSetAchieved?: boolean
  courseId: number | string
  user_course_id: number | string
  learnerId: number | string
  onSubmit?: (answers: Record<string, LearnerAnswer>) => Promise<void> | void
  // Optional evidence datasets per question id
  evidenceLibrary?: Record<string, { id: string; name: string }[]>
  initialUploaded?: Record<string, { id: string; name: string; dateUploaded: string }[]>
  onLinkEvidenceIds?: (questionId: string, ids: string[]) => void
  onUploadFiles?: (questionId: string, files: File[]) => Promise<void> | void
  onDeleteUploaded?: (questionId: string, uploadId: string) => Promise<void> | void
}

const GatewayChecklist = ({
  questions = [],
  canEditAnswer = true,
  canSetAchieved = false,
  courseId,
  user_course_id,
  learnerId,
  onSubmit,
  evidenceLibrary = {},
  initialUploaded = {},
  onLinkEvidenceIds,
  onUploadFiles,
  onDeleteUploaded,
}: GatewayChecklistProps) => {
  const [openForQuestionId, setOpenForQuestionId] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, LearnerAnswer>>({})
  const [activeTab, setActiveTab] = useState(0)
  const [linkedIds, setLinkedIds] = useState<Record<string, Set<string>>>({})
  const [uploaded, setUploaded] = useState<Record<string, { id: string; name: string; dateUploaded: string }[]>>(initialUploaded)
  const [uploadedMeta, setUploadedMeta] = useState<Record<string, { key: string; url: string } | undefined>>({})
  const [learnerFiles, setLearnerFiles] = useState<Record<string, { key: string; url: string }[]>>({})
  const [uploadedDates, setUploadedDates] = useState<Record<string, Record<string, string>>>({})
  const [pendingChosenNames, setPendingChosenNames] = useState<Record<string, string>>({})
  const { control, handleSubmit, reset, watch, formState: { errors, isValid } } = useForm<{ answer: string; achieved: boolean }>({
    mode: 'onChange',
    defaultValues: { answer: '', achieved: false }
  })
  const dispatch: any = useDispatch()

  const activeQuestion = useMemo(
    () => questions.find((q) => q.id === openForQuestionId) || null,
    [openForQuestionId, questions]
  )
  // Prefill answers map from incoming questions (Answer or learner_answer)
  useEffect(() => {
    setAnswers((prev) => {
      const next: Record<string, LearnerAnswer> = { ...prev }
      questions.forEach((q) => {
        if (!next[q.id]) {
          const initial = q.learner_answer ?? (q as any).Answer ?? ''
          const achieved = q.achieved === true
          const rawDate = q.achieved_at || (q as any).Achieved_at
          const dateAchieved = achieved && rawDate ? dayjs(rawDate).format('DD/MM/YYYY') : undefined
          next[q.id] = {
            answer: String(initial || ''),
            achieved,
            dateAchieved,
          }
        }
      })
      return next
    })
    // seed learner files from backend
    setLearnerFiles((prev) => {
      const next = { ...prev }
      questions.forEach((q) => {
        if (q.learner_files && q.learner_files.length) {
          // Convert backend format { url, uploaded_at } to internal format { key, url }
          next[q.id] = q.learner_files.map((file) => {
            // Extract key from URL (filename part, remove query params if any)
            const urlWithoutParams = file.url.split('?')[0]
            const urlParts = urlWithoutParams.split('/')
            const key = urlParts[urlParts.length - 1] || file.url
            return { key, url: file.url }
          })
        } else if (!next[q.id]) {
          next[q.id] = []
        }
      })
      return next
    })
    // seed uploaded dates from backend
    setUploadedDates((prev) => {
      const next = { ...prev }
      questions.forEach((q) => {
        if (q.learner_files && q.learner_files.length) {
          const dates: Record<string, string> = {}
          q.learner_files.forEach((file) => {
            // Extract key from URL (filename part, remove query params if any)
            const urlWithoutParams = file.url.split('?')[0]
            const urlParts = urlWithoutParams.split('/')
            const key = urlParts[urlParts.length - 1] || file.url
            // Convert ISO format to display format
            if (file.uploaded_at) {
              dates[key] = dayjs(file.uploaded_at).format('DD/MM/YYYY HH:mm')
            }
          })
          next[q.id] = dates
        }
      })
      return next
    })
  }, [questions])


  const optionsForActive = useMemo(() => {
    if (!activeQuestion?.isDropdown) return []
    return (activeQuestion.dropdownOptions || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  }, [activeQuestion])

  const handleOpen = (id: string) => {
    setOpenForQuestionId(id)
    setActiveTab(0)
  }

  const handleClose = () => {
    setOpenForQuestionId(null)
  }

  const setActiveAnswer = (update: Partial<LearnerAnswer>) => {
    if (!activeQuestion) return
    setAnswers((prev) => {
      const existing = prev[activeQuestion.id] || { answer: '', achieved: false, dateAchieved: undefined }
      const merged = { ...existing, ...update }
      if (merged.achieved && !merged.dateAchieved) {
        merged.dateAchieved = dayjs().format('DD/MM/YYYY')
      }
      if (!merged.achieved) {
        merged.dateAchieved = undefined
      }
      return { ...prev, [activeQuestion.id]: merged }
    })
  }

  useEffect(() => {
    if (activeQuestion) {
      const existing = answers[activeQuestion.id]
      const fallback = activeQuestion.learner_answer ?? (activeQuestion as any).Answer ?? ''
      reset({
        answer: existing?.answer || String(fallback || ''),
        achieved: existing?.achieved ?? (activeQuestion.achieved === true),
      })
    }
  }, [activeQuestion])

  const handleSave = async (formValues?: { answer: string; achieved: boolean }) => {
    if (!activeQuestion) return
    if (formValues) {
      // sync current question's form values into answers map
      setAnswers((prev) => ({
        ...prev,
        [activeQuestion.id]: {
          answer: formValues.answer,
          achieved: formValues.achieved,
          dateAchieved: formValues.achieved ? dayjs().format('DD/MM/YYYY') : undefined,
        },
      }))
    }
    const answersToSend = formValues
      ? { ...answers, [activeQuestion.id]: { ...answers[activeQuestion.id], ...formValues } }
      : answers
    const responses = Object.entries(answersToSend).map(([questionId, v]) => ({
      questionId,
      answer: (v as any).answer
    }))
    try {
      await dispatch(submitGatewayAnswers(courseId, learnerId, responses))
      await onSubmit?.(answersToSend)
      if (openForQuestionId) {
        onLinkEvidenceIds?.(openForQuestionId, Array.from(linkedIds[openForQuestionId] || new Set()))
      }
    } finally {
      handleClose()
    }
  }

  const toggleLinked = (qid: string, id: string) => {
    setLinkedIds((prev) => {
      const current = new Set(prev[qid] || [])
      if (current.has(id)) current.delete(id)
      else current.add(id)
      return { ...prev, [qid]: current }
    })
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeQuestion) return
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return
    try {
      setPendingChosenNames((prev) => ({
        ...prev,
        [activeQuestion.id]: files.map((f) => f.name).join(', '),
      }))
      if (onUploadFiles) {
        await onUploadFiles(activeQuestion.id, files)
      } else {
        const resp: any = await dispatch(uploadGatewayEvidence(files))
        const list = resp?.data || resp?.files || resp || []
        const first = Array.isArray(list) ? list[0] : undefined
        if (first && (first.key || first.url || first.Location)) {
          setUploadedMeta((prev) => ({
            ...prev,
            [activeQuestion.id]: {
              key: first.key || '',
              url: first.url || first.Location || '',
            },
          }))
        }
      }
    } finally {
      setUploaded((prev) => {
        const existing = prev[activeQuestion.id] || []
        const newOnes = files.map((f, idx) => ({
          id: `${Date.now()}_${idx}`,
          name: f.name,
          dateUploaded: dayjs().format('DD/MM/YYYY HH:mm'),
        }))
        return { ...prev, [activeQuestion.id]: [...existing, ...newOnes] }
      })
      if(e.currentTarget) {
        e.currentTarget.value = ''
      }
    }
  }

  return (
    <Box>
      <Typography variant='h6' sx={{ mb: 2 }}>Gateway Checklist</Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Answer</TableCell>
              <TableCell>Achieved</TableCell>
              <TableCell>Date Achieved</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.map((q) => {
              const ans: LearnerAnswer = (answers[q.id] as LearnerAnswer) ?? {
                answer: String(q.learner_answer ?? (q as any).Answer ?? ''),
                achieved: q.achieved === true,
                dateAchieved:
                  q.achieved === true && (q.achieved_at || (q as any).Achieved_at)
                    ? dayjs(q.achieved_at || (q as any).Achieved_at).format('DD/MM/YYYY')
                    : undefined,
              }
              return (
                <TableRow key={q.id}>
                  <TableCell>{q.question}</TableCell>
                  <TableCell>{ans?.answer || ''}</TableCell>
                  <TableCell>
                    <Checkbox checked={!!ans?.achieved} disabled />
                  </TableCell>
                  <TableCell>{ans?.dateAchieved || ''}</TableCell>
                  <TableCell>
                    <IconButton size='small' onClick={() => handleOpen(q.id)}>
                      <EditIcon fontSize='small' />
                    </IconButton>
                  </TableCell>
                </TableRow>
              )
            })}
            {questions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align='center'>No questions configured.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={!!openForQuestionId} onClose={handleClose} fullWidth maxWidth='md'>
        <DialogTitle>Answer Question</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>{activeQuestion?.question}</Typography>
          {activeQuestion?.isDropdown && (
            <Controller
              control={control}
              name='answer'
              rules={{ required: 'Please select an option' }}
              render={({ field }) => (
                <Autocomplete
                  options={optionsForActive}
                  value={field.value || ''}
                  onChange={(_, v) => field.onChange(v || '')}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder='Select an option'
                      error={!!errors.answer}
                      helperText={errors.answer?.message}
                    />
                  )}
                  disabled={!canEditAnswer || watch('achieved') === true || activeQuestion?.achieved === true}
                />
              )}
            />
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
            <Controller
              control={control}
              name='achieved'
              render={({ field }) => (
                <Checkbox
                  checked={!!field.value}
                  onChange={async (e) => {
                    const value = e.target.checked
                    field.onChange(value)
                    if (activeQuestion && canSetAchieved) {
                      // update local state for date
                      setActiveAnswer({ achieved: value })
                      await dispatch(
                        reviewGatewayResponse(user_course_id, activeQuestion.id, value)
                      )
                    }
                  }}
                  disabled={
                    !canSetAchieved ||
                    !(String(watch('answer') || '').trim().length > 0)
                  }
                />
              )}
            />
            <Typography>Mark as achieved</Typography>
          </Box>

          {activeQuestion?.evidenceRequired && (
            <Box sx={{ mt: 3 }}>
              <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
                <Tab label='Linked Evidence' />
                <Tab label='Uploaded Files' />
              </Tabs>

              {activeTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  <TableContainer component={Paper}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>Link Evidence</TableCell>
                          <TableCell>Evidence Name</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(evidenceLibrary[activeQuestion?.id] || []).map((ev) => (
                          <TableRow key={ev?.id}>
                            <TableCell>
                              <Checkbox
                                checked={(linkedIds[activeQuestion?.id || ''] || new Set()).has(ev.id)}
                                onChange={() => toggleLinked(activeQuestion?.id || '', ev?.id)}
                              />
                            </TableCell>
                            <TableCell>{ev.name}</TableCell>
                          </TableRow>
                        ))}
                        {(evidenceLibrary[activeQuestion?.id || ''] || []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={2} align='center'>No evidence available</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}

              {activeTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Button variant='outlined' component='label'>
                      Choose File
                      <input hidden type='file' multiple onChange={handleUpload} />
                    </Button>
                    {activeQuestion && pendingChosenNames[activeQuestion.id] && (
                      <Typography variant='body2'>
                        Selected: {pendingChosenNames[activeQuestion.id]}
                      </Typography>
                    )}
                    <Button
                      variant='contained'
                      onClick={async () => {
                        if (!activeQuestion) return
                        const meta = uploadedMeta[activeQuestion.id]
                        if (!meta) return
                        
                        // Get the answer from form or answers state
                        const currentAnswer = watch('answer') || answers[activeQuestion.id]?.answer || ''
                        
                        // Format only the newly uploaded file with url and uploaded_at in ISO format
                        const files = [
                          {
                            url: meta.url,
                            uploaded_at: dayjs().toISOString()
                          }
                        ]
                        
                        const responses = [
                          {
                            questionId: activeQuestion.id,
                            answer: currentAnswer,
                            files: files,
                          },
                        ]
                        await dispatch(submitGatewayAnswers(courseId, learnerId, responses))
                        setPendingChosenNames((prev) => ({ ...prev, [activeQuestion.id]: '' }))
                        setUploadedMeta((prev) => ({ ...prev, [activeQuestion.id]: undefined }))
                      }}
                      disabled={!activeQuestion || !uploadedMeta[activeQuestion.id]}
                    >
                      Upload Evidence
                    </Button>
                  </Box>
                  <TableContainer component={Paper}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>File Name</TableCell>
                          <TableCell>Date uploaded</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(learnerFiles[activeQuestion?.id || ''] || []).map((f) => (
                          <TableRow key={f.key}>
                            <TableCell>
                              <a href={f.url} target='_blank' rel='noreferrer'>
                                {f.key?.split('/').pop()}
                              </a>
                            </TableCell>
                            <TableCell>{uploadedDates[activeQuestion?.id || '']?.[f.key] || ''}</TableCell>
                            <TableCell>
                              <Button
                                color='error'
                                size='small'
                                onClick={async () => {
                                  if (!activeQuestion) return
                                  
                                  // Get the answer from form or answers state
                                  const currentAnswer = watch('answer') || answers[activeQuestion.id]?.answer || ''
                                  
                                  // Get all existing files except the one being deleted
                                  const remainingFiles = (learnerFiles[activeQuestion.id] || []).filter((x) => x.key !== f.key)
                                  
                                  // Format remaining files array with url and uploaded_at in ISO format
                                  const files = remainingFiles.map((file) => {
                                    let uploadedDate: string
                                    
                                    // Check if date exists in uploadedDates (for newly uploaded files)
                                    const storedDate = uploadedDates[activeQuestion.id]?.[file.key]
                                    if (storedDate) {
                                      // Try to parse the stored date (could be in DD/MM/YYYY HH:mm format)
                                      const parsedDate = dayjs(storedDate, 'DD/MM/YYYY HH:mm', true)
                                      if (parsedDate.isValid()) {
                                        uploadedDate = parsedDate.toISOString()
                                      } else {
                                        // If parsing fails, try parsing as ISO format
                                        const isoDate = dayjs(storedDate)
                                        uploadedDate = isoDate.isValid() ? isoDate.toISOString() : dayjs().toISOString()
                                      }
                                    } else {
                                      // Check if this file came from backend (should have uploaded_at in question data)
                                      const questionData = questions.find(q => q.id === activeQuestion.id)
                                      const backendFile = questionData?.learner_files?.find(bf => {
                                        const urlWithoutParams = bf.url.split('?')[0]
                                        const urlParts = urlWithoutParams.split('/')
                                        const key = urlParts[urlParts.length - 1] || bf.url
                                        return key === file.key
                                      })
                                      
                                      if (backendFile?.uploaded_at) {
                                        // Use the uploaded_at from backend (already in ISO format)
                                        uploadedDate = backendFile.uploaded_at
                                      } else {
                                        // Default to current time
                                        uploadedDate = dayjs().toISOString()
                                      }
                                    }
                                    
                                    return {
                                      url: file.url,
                                      uploaded_at: uploadedDate
                                    }
                                  })
                                  
                                  const responses = [
                                    {
                                      questionId: activeQuestion.id,
                                      answer: currentAnswer,
                                      // files: files,
                                      deleteFiles: [f.url],
                                    },
                                  ]
                                  await dispatch(submitGatewayAnswers(courseId, learnerId, responses))
                                  
                                  
                                  // Also call optional callback if provided
                                  await onDeleteUploaded?.(activeQuestion.id, f.key)
                                }}
                              >
                                Delete
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {(learnerFiles[activeQuestion?.id || ''] || []).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} align='center'>No files uploaded</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button variant='contained' onClick={handleSubmit(handleSave)} disabled={!activeQuestion || !isValid || canSetAchieved}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GatewayChecklist


