import EditIcon from '@mui/icons-material/Edit'
import {
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography
} from '@mui/material'
import dayjs from 'dayjs'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { useGetEvidenceListQuery } from 'src/app/store/api/evidence-api'
import {
  reviewGatewayResponse,
  submitGatewayAnswers,
  uploadGatewayEvidence,
} from 'src/app/store/courseManagement'
import { useUserId } from 'src/app/utils/userHelpers'

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
  assignmentIds?: number[] | string[]
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
  onUploadFiles?: (questionId: string, files: File[]) => Promise<void> | void
}

const GatewayChecklist = ({
  questions = [],
  canEditAnswer = true,
  canSetAchieved = false,
  courseId,
  user_course_id,
  learnerId,
  onSubmit,
  onUploadFiles,
}: GatewayChecklistProps) => {
  const [openForQuestionId, setOpenForQuestionId] = useState<string | null>(
    null
  )
  const [answers, setAnswers] = useState<Record<string, LearnerAnswer>>({})
  const [activeTab, setActiveTab] = useState(0)
  const [linkedIds, setLinkedIds] = useState<Record<string, Set<string>>>({})
  const [uploadedMeta, setUploadedMeta] = useState<
    Record<string, { key: string; url: string } | undefined>
  >({})
  const [learnerFiles, setLearnerFiles] = useState<
    Record<string, { key: string; url: string }[]>
  >({})
  const [uploadedDates, setUploadedDates] = useState<
    Record<string, Record<string, string>>
  >({})
  const [pendingChosenNames, setPendingChosenNames] = useState<
    Record<string, string>
  >({})
  const [evidencePage, setEvidencePage] = useState(1)
  const [evidenceLimit, setEvidenceLimit] = useState(10)
  const [evidenceSearch, setEvidenceSearch] = useState('')
  const userId = useUserId()
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<{ answer: string; achieved: boolean }>({
    mode: 'onChange',
    defaultValues: { answer: '', achieved: false },
  })
  const dispatch: any = useDispatch()

  // Fetch evidence list when tab 0 is active and question is open
  const { data: evidenceResponse, isLoading: evidenceLoading } =
    useGetEvidenceListQuery(
      {
        user_id: userId || '',
        page: evidencePage,
        limit: evidenceLimit,
        meta: true,
        ...(evidenceSearch && { search: evidenceSearch }),
      },
      {
        skip: !userId || activeTab !== 0 || !openForQuestionId,
      }
    )

  // Extract data and meta_data from response
  const evidenceData = evidenceResponse?.data || []
  const evidenceMeta = evidenceResponse?.meta_data || {
    page: 1,
    items: 0,
    pages: 1,
    page_size: 10,
  }

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
          const dateAchieved =
            achieved && rawDate
              ? dayjs(rawDate).format('DD/MM/YYYY')
              : undefined
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
    // seed linked assignment IDs from backend
    setLinkedIds((prev) => {
      const next = { ...prev }
      questions.forEach((q) => {
        if (q.assignmentIds && q.assignmentIds.length > 0) {
          // Convert assignment IDs to strings and create a Set
          next[q.id] = new Set(q.assignmentIds.map((id) => String(id)))
        } else if (!next[q.id]) {
          next[q.id] = new Set()
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
      const existing = prev[activeQuestion.id] || {
        answer: '',
        achieved: false,
        dateAchieved: undefined,
      }
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
      const fallback =
        activeQuestion.learner_answer ?? (activeQuestion as any).Answer ?? ''
      reset({
        answer: existing?.answer || String(fallback || ''),
        achieved: existing?.achieved ?? activeQuestion.achieved === true,
      })
    }
  }, [activeQuestion])

  const handleSave = async (formValues?: {
    answer: string
    achieved: boolean
  }) => {
    if (!activeQuestion) return
    if (formValues) {
      // sync current question's form values into answers map
      setAnswers((prev) => ({
        ...prev,
        [activeQuestion.id]: {
          answer: formValues.answer,
          achieved: formValues.achieved,
          dateAchieved: formValues.achieved
            ? dayjs().format('DD/MM/YYYY')
            : undefined,
        },
      }))
    }
    const answersToSend = formValues
      ? {
          ...answers,
          [activeQuestion.id]: { ...answers[activeQuestion.id], ...formValues },
        }
      : answers
    
    // Get linked assignment IDs for the current question
    const currentLinkedIds = Array.from(linkedIds[activeQuestion.id] || new Set<string>()) as string[]
    
    const responses = Object.entries(answersToSend).map(([questionId, v]) => {
      const response: any = {
        questionId,
        answer: (v as any).answer,
      }
      
      // Add assignmentIds if this is the active question and has linked IDs
      if (questionId === activeQuestion.id && currentLinkedIds.length > 0) {
        response.assignmentIds = currentLinkedIds.map((id) => Number(id) || id)
      }
      
      return response
    })
    
    try {
      await dispatch(submitGatewayAnswers(courseId, learnerId, responses))
      await onSubmit?.(answersToSend)
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
      if (e.currentTarget) {
        e.currentTarget.value = ''
      }
    }
  }

  return (
    <Box>
      <Typography variant='h6' sx={{ mb: 2 }}>
        Gateway Checklist
      </Typography>

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
                  q.achieved === true &&
                  (q.achieved_at || (q as any).Achieved_at)
                    ? dayjs(q.achieved_at || (q as any).Achieved_at).format(
                        'DD/MM/YYYY'
                      )
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
                <TableCell colSpan={5} align='center'>
                  No questions configured.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={!!openForQuestionId}
        onClose={handleClose}
        fullWidth
        maxWidth='md'
      >
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
                  disabled={
                    !canEditAnswer ||
                    watch('achieved') === true ||
                    activeQuestion?.achieved === true
                  }
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
                        reviewGatewayResponse(
                          user_course_id,
                          activeQuestion.id,
                          value
                        )
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
                  {/* Search and Limit Controls */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      mb: 2,
                      gap: 2,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body2'>Show</Typography>
                      <FormControl size='small' sx={{ minWidth: 80 }}>
                        <Select
                          value={evidenceLimit}
                          onChange={(e) => {
                            setEvidenceLimit(Number(e.target.value))
                            setEvidencePage(1)
                          }}
                        >
                          <MenuItem value={10}>10</MenuItem>
                          <MenuItem value={25}>25</MenuItem>
                          <MenuItem value={50}>50</MenuItem>
                          <MenuItem value={100}>100</MenuItem>
                        </Select>
                      </FormControl>
                      <Typography variant='body2'>entries</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant='body2'>Search:</Typography>
                      <TextField
                        size='small'
                        value={evidenceSearch}
                        onChange={(e) => {
                          setEvidenceSearch(e.target.value)
                          setEvidencePage(1)
                        }}
                        placeholder='Search evidence...'
                        sx={{ width: 200 }}
                      />
                    </Box>
                  </Box>

                  <TableContainer component={Paper}>
                    <Table size='small'>
                      <TableHead>
                        <TableRow>
                          <TableCell>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                              }}
                            >
                              Link Evidence
                              <Box
                                component='span'
                                sx={{ fontSize: '0.75rem' }}
                              >
                                ▲
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>Evidence Name</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {evidenceLoading ? (
                          <TableRow>
                            <TableCell colSpan={2} align='center'>
                              Loading...
                            </TableCell>
                          </TableRow>
                        ) : evidenceData?.length > 0 ? (
                          evidenceData.map((ev: any) => {
                            const evidenceId = String(ev.assignment_id)
                            const evidenceTitle =
                              ev.title || ev.file?.name || 'Untitled'
                            return (
                              <TableRow key={ev.assignment_id}>
                                <TableCell>
                                  <Checkbox
                                    checked={(
                                      linkedIds[activeQuestion?.id || ''] ||
                                      new Set()
                                    ).has(evidenceId)}
                                    onChange={() =>
                                      toggleLinked(
                                        activeQuestion?.id || '',
                                        evidenceId
                                      )
                                    }
                                  />
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    component='span'
                                    onClick={async () => {
                                      if (ev.file?.url) {
                                        try {
                                          // Try to download the file
                                          const response = await fetch(ev.file.url)
                                          const blob = await response.blob()
                                          const blobUrl = window.URL.createObjectURL(blob)
                                          const link = document.createElement('a')
                                          link.href = blobUrl
                                          link.download = ev.file.name || evidenceTitle
                                          document.body.appendChild(link)
                                          link.click()
                                          document.body.removeChild(link)
                                          window.URL.revokeObjectURL(blobUrl)
                                        } catch (error) {
                                          // Fallback: open in new tab if download fails (e.g., CORS issues)
                                          window.open(ev.file.url, '_blank')
                                        }
                                      }
                                    }}
                                    sx={{
                                      cursor: 'pointer',
                                      color: 'primary.main',
                                      '&:hover': {
                                        textDecoration: 'underline',
                                      },
                                    }}
                                  >
                                    {evidenceTitle}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            )
                          })
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} align='center'>
                              No evidence available
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  {evidenceMeta && (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mt: 2,
                      }}
                    >
                      <Typography variant='body2' color='text.secondary'>
                        Showing{' '}
                        {evidenceData?.length > 0
                          ? (evidencePage - 1) * evidenceLimit + 1
                          : 0}{' '}
                        to{' '}
                        {Math.min(
                          evidencePage * evidenceLimit,
                          evidenceMeta.items || 0
                        )}{' '}
                        of {evidenceMeta.items || 0} entries
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={() =>
                            setEvidencePage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={evidencePage === 1 || evidenceLoading}
                        >
                          Previous
                        </Button>
                        {Array.from(
                          { length: Math.min(evidenceMeta.pages || 1, 5) },
                          (_, i) => {
                            const pageNum = i + 1
                            return (
                              <Button
                                key={pageNum}
                                size='small'
                                variant={
                                  evidencePage === pageNum
                                    ? 'contained'
                                    : 'outlined'
                                }
                                onClick={() => setEvidencePage(pageNum)}
                                disabled={evidenceLoading}
                              >
                                {pageNum}
                              </Button>
                            )
                          }
                        )}
                        <Button
                          size='small'
                          variant='outlined'
                          onClick={() => setEvidencePage((prev) => prev + 1)}
                          disabled={
                            evidencePage >= (evidenceMeta.pages || 1) ||
                            evidenceLoading
                          }
                        >
                          Next
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {activeTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2,
                    }}
                  >
                    <Button variant='outlined' component='label'>
                      Choose File
                      <input
                        hidden
                        type='file'
                        multiple
                        onChange={handleUpload}
                      />
                    </Button>
                    {activeQuestion &&
                      pendingChosenNames[activeQuestion.id] && (
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
                        const currentAnswer =
                          watch('answer') ||
                          answers[activeQuestion.id]?.answer ||
                          ''

                        // Format only the newly uploaded file with url and uploaded_at in ISO format
                        const files = [
                          {
                            url: meta.url,
                            uploaded_at: dayjs().toISOString(),
                          },
                        ]

                        const responses = [
                          {
                            questionId: activeQuestion.id,
                            answer: currentAnswer,
                            files: files,
                          },
                        ]
                        await dispatch(
                          submitGatewayAnswers(courseId, learnerId, responses)
                        )
                        setPendingChosenNames((prev) => ({
                          ...prev,
                          [activeQuestion.id]: '',
                        }))
                        setUploadedMeta((prev) => ({
                          ...prev,
                          [activeQuestion.id]: undefined,
                        }))
                      }}
                      disabled={
                        !activeQuestion || !uploadedMeta[activeQuestion.id]
                      }
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
                        {(learnerFiles[activeQuestion?.id || ''] || []).map(
                          (f) => (
                            <TableRow key={f.key}>
                              <TableCell>
                                <a
                                  href={f.url}
                                  target='_blank'
                                  rel='noreferrer'
                                >
                                  {f.key?.split('/').pop()}
                                </a>
                              </TableCell>
                              <TableCell>
                                {uploadedDates[activeQuestion?.id || '']?.[
                                  f.key
                                ] || ''}
                              </TableCell>
                              <TableCell>
                                <Button
                                  color='error'
                                  size='small'
                                  onClick={async () => {
                                    if (!activeQuestion) return

                                    // Get the answer from form or answers state
                                    const currentAnswer =
                                      watch('answer') ||
                                      answers[activeQuestion.id]?.answer ||
                                      ''

                                    // Get all existing files except the one being deleted
                                    const remainingFiles = (
                                      learnerFiles[activeQuestion.id] || []
                                    ).filter((x) => x.key !== f.key)

                                    // Format remaining files array with url and uploaded_at in ISO format
                                    const files = remainingFiles.map((file) => {
                                      let uploadedDate: string

                                      // Check if date exists in uploadedDates (for newly uploaded files)
                                      const storedDate =
                                        uploadedDates[activeQuestion.id]?.[
                                          file.key
                                        ]
                                      if (storedDate) {
                                        // Try to parse the stored date (could be in DD/MM/YYYY HH:mm format)
                                        const parsedDate = dayjs(
                                          storedDate,
                                          'DD/MM/YYYY HH:mm',
                                          true
                                        )
                                        if (parsedDate.isValid()) {
                                          uploadedDate =
                                            parsedDate.toISOString()
                                        } else {
                                          // If parsing fails, try parsing as ISO format
                                          const isoDate = dayjs(storedDate)
                                          uploadedDate = isoDate.isValid()
                                            ? isoDate.toISOString()
                                            : dayjs().toISOString()
                                        }
                                      } else {
                                        // Check if this file came from backend (should have uploaded_at in question data)
                                        const questionData = questions.find(
                                          (q) => q.id === activeQuestion.id
                                        )
                                        const backendFile =
                                          questionData?.learner_files?.find(
                                            (bf) => {
                                              const urlWithoutParams =
                                                bf.url.split('?')[0]
                                              const urlParts =
                                                urlWithoutParams.split('/')
                                              const key =
                                                urlParts[urlParts.length - 1] ||
                                                bf.url
                                              return key === file.key
                                            }
                                          )

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
                                        uploaded_at: uploadedDate,
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
                                    await dispatch(
                                      submitGatewayAnswers(
                                        courseId,
                                        learnerId,
                                        responses
                                      )
                                    )

                                  }}
                                >
                                  Delete
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        )}
                        {(learnerFiles[activeQuestion?.id || ''] || [])
                          .length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} align='center'>
                              No files uploaded
                            </TableCell>
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
          <Button
            variant='contained'
            onClick={handleSubmit(handleSave)}
            disabled={!activeQuestion || !isValid || canSetAchieved}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default GatewayChecklist
