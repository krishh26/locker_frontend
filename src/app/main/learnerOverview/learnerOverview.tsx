import AccessTimeIcon from '@mui/icons-material/AccessTime'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ClearIcon from '@mui/icons-material/Clear'
import CommentIcon from '@mui/icons-material/Comment'
import DashboardIcon from '@mui/icons-material/Dashboard'
import EditIcon from '@mui/icons-material/Edit'
import PersonIcon from '@mui/icons-material/Person'
import SearchIcon from '@mui/icons-material/Search'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  alpha,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fade,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  LinearProgress,
  MenuItem,
  Pagination,
  Select,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import {
  slice as courseSlice,
  fetchAllLearnerByUserAPI,
  selectCourseManagement,
} from 'app/store/courseManagement'
import { updateLearnerAPI } from 'app/store/learnerManagement'
import { slice } from 'app/store/reloadData'
import React, { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { useCurrentUser } from 'src/app/utils/userHelpers'
import { getRandomColor } from 'src/utils/randomColor'

const Protfolio = ({ learner, handleClickData, handleClickSingleData, onCommentUpdate }) => {
  const theme = useTheme()
  const navigate = useNavigate()
  const [isEditingComment, setIsEditingComment] = useState(false)
  const [editedComment, setEditedComment] = useState('')
  const [isSavingComment, setIsSavingComment] = useState(false)
  // Convert incoming data to matrix format (same as portfolio.tsx)
  // Handler functions for comment editing
  const handleOpenCommentDialog = () => {
    setIsEditingComment(true)
    setEditedComment(learner?.comment || '')
  }

  const handleCloseCommentDialog = () => {
    setIsEditingComment(false)
    setEditedComment('')
    setIsSavingComment(false)
  }

  const handleSaveComment = async () => {
    if (onCommentUpdate) {
      setIsSavingComment(true)
      try {
        await onCommentUpdate(learner.learner_id, editedComment)
        handleCloseCommentDialog()
      } catch (error) {
        setIsSavingComment(false)
        console.error('Error saving comment:', error)
      }
    }
  }

  const convertToMatrixData = (data: any) => {
    if (!data)
      return {
        yetToComplete: 0,
        fullyCompleted: 0,
        workInProgress: 0,
        totalUnits: 0,
        duration: 0,
        totalDuration: 0,
        dayPending: 0,
      }

    // Gateway questions-based progress
    try {
      const coreType = data?.course_core_type || data?.course?.course_core_type
      const isGateway = coreType === 'Gateway'
      const questions = Array.isArray(data?.course?.questions)
        ? data.course.questions
        : Array.isArray(data?.questions)
        ? data.questions
        : []

      if (isGateway && questions.length > 0) {
        const totalUnits = questions.length
        const fullyCompleted = questions.filter((q: any) => q?.achieved === true)
          .length

        let duration = 0
        let totalDuration = 1
        let dayPending = 0
        if (data.start_date && data.end_date) {
          const startDate = new Date(data.start_date)
          const endDate = new Date(data.end_date)
          const currentDate = new Date()
          totalDuration = Math.max(
            1,
            Math.ceil(
              (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
            )
          )
          duration = Math.max(
            0,
            Math.ceil(
              (currentDate.getTime() - startDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
          dayPending = Math.max(
            0,
            Math.ceil(
              (endDate.getTime() - currentDate.getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        }

        return {
          yetToComplete: Math.max(0, totalUnits - fullyCompleted),
          fullyCompleted,
          workInProgress: 0,
          totalUnits,
          duration,
          totalDuration,
          dayPending,
        }
      }
    } catch {}

    // Calculate duration from start and end dates
    const startDate = new Date(data.start_date)
    const endDate = new Date(data.end_date)
    const currentDate = new Date()
    const totalDuration = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const duration = Math.ceil(
      (currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    const dayPending = Math.ceil(
      (endDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    )

    return {
      yetToComplete: data.unitsNotStarted || 0,
      fullyCompleted: data.unitsFullyCompleted || 0,
      workInProgress: data.unitsPartiallyCompleted || 0,
      totalUnits: data.totalUnits || 0,
      duration: Math.max(0, duration),
      totalDuration: Math.max(1, totalDuration),
      dayPending: Math.max(0, dayPending),
    }
  }

  return (
    <>
      <Fade in timeout={500}>
        <Card
          elevation={0}
          sx={{
            mb: 2,
            borderRadius: 2,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: theme.shadows[4],
              transform: 'translateY(-1px)',
            },
          }}
        >
          <CardContent sx={{ p: 0 }}>
            {/* Wireframe-style horizontal layout */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: { xs: 'stretch', md: 'center' },
                minHeight: { xs: 'auto', md: 80 },
                p: 2,
                gap: 2,
              }}
            >
              {/* Section 1: Learner Info (Left - Wide) */}
              <Box
                sx={{
                  flex: { xs: 'none', md: '2' },
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  minHeight: { xs: 'auto', md: 60 },
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: alpha(theme.palette.background.default, 0.5),
                  border: `1px solid ${theme.palette.divider}`,
                }}
              >
                {/* Avatar */}
                <Avatar
                  sx={{
                    width: { xs: 60, md: 50 },
                    height: { xs: 60, md: 50 },
                    bgcolor: getRandomColor(
                      learner?.first_name?.toLowerCase().charAt(0)
                    ),
                    flexShrink: 0,
                    fontSize: { xs: '1.8rem', md: '1.5rem' },
                  }}
                  src={
                    learner?.learner_id
                      ? learner?.avatar
                      : learner.data?.avatar?.url
                  }
                  alt={learner?.first_name?.toUpperCase()?.charAt(0)}
                />

                {/* Learner Details */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.4rem', md: '1.5rem' },
                      mb: 0.5,
                      color: theme.palette.text.primary,
                    }}
                  >
                    {learner?.first_name} {learner?.last_name}
                  </Typography>

                  {/* Inline Info */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 3 },
                      flexWrap: 'wrap',
                    }}
                  >
                    {/* Learner ID */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <PersonIcon sx={{ fontSize: 18, color: theme.palette.primary.main }} />
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          fontSize: { xs: '1rem', md: '1.1rem' },
                        }}
                      >
                        ID: {learner?.learner_id}
                      </Typography>
                    </Box>

                    {/* Next Visit */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 18, color: theme.palette.warning.main }} />
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          fontSize: { xs: '1rem', md: '1.1rem' },
                        }}
                      >
                        Next: {learner?.nextvisitdate}
                      </Typography>
                    </Box>

                    {/* Comment */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <CommentIcon sx={{ fontSize: 18, color: theme.palette.info.main }} />
                      <Typography
                        variant='body2'
                        sx={{
                          fontWeight: 600,
                          color: theme.palette.text.primary,
                          fontSize: { xs: '1rem', md: '1.1rem' },
                          maxWidth: { xs: '100%', sm: 200 },
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {learner?.comment || 'No comment'}
                      </Typography>
                      <IconButton
                        size='small'
                        onClick={handleOpenCommentDialog}
                        sx={{
                          color: theme.palette.info.main,
                          padding: '2px',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.info.main, 0.1),
                          },
                        }}
                      >
                        <EditIcon fontSize='small' />
                      </IconButton>
                    </Box>
                  </Box>
                </Box>
              </Box>

              {/* Section 2: Overall Progress (Middle - Medium) */}
              {learner?.course && learner.course.length > 0 && (() => {
                // Calculate combined progress
                let totalCompleted = 0
                let totalInProgress = 0
                let totalNotStarted = 0
                let totalUnitsAll = 0

                learner.course.forEach((course) => {
                  const progressData = convertToMatrixData(course)
                  totalCompleted += progressData.fullyCompleted
                  totalInProgress += progressData.workInProgress
                  totalNotStarted += progressData.yetToComplete
                  totalUnitsAll += progressData.totalUnits
                })

                const completionPercentage = totalUnitsAll > 0 
                  ? ((totalCompleted / totalUnitsAll) * 100) + ((totalInProgress / totalUnitsAll) * 50)
                  : 0

                return (
                  <Box
                    sx={{
                      flex: { xs: 'none', md: '1.5' },
                      minHeight: { xs: 'auto', md: 60 },
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography
                          variant='subtitle2'
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                            fontSize: { xs: '1.1rem', md: '1.2rem' },
                          }}
                        >
                          Overall Progress
                        </Typography>
                        <Chip
                          label={`${completionPercentage.toFixed(0)}%`}
                          size='small'
                          sx={{
                            backgroundColor: theme.palette.primary.main,
                            color: 'white',
                            fontWeight: 700,
                            fontSize: { xs: '0.9rem', md: '1rem' },
                          }}
                        />
                    </Box>

                    <LinearProgress
                      variant='determinate'
                      value={Math.min(completionPercentage, 100)}
                      sx={{
                        height: { xs: 10, md: 8 },
                        borderRadius: { xs: 5, md: 4 },
                        backgroundColor: alpha(theme.palette.primary.main, 0.15),
                        mb: 1,
                        '& .MuiLinearProgress-bar': {
                          borderRadius: { xs: 5, md: 4 },
                          background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                        },
                      }}
                    />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            color: theme.palette.success.main,
                            fontSize: { xs: '0.9rem', md: '0.9rem' },
                            fontWeight: 600,
                            display: 'block',
                          }}
                        >
                          ✓ {totalCompleted}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            color: theme.palette.warning.main,
                            fontSize: { xs: '0.9rem', md: '0.9rem' },
                            fontWeight: 600,
                            display: 'block',
                          }}
                        >
                          ⟳ {totalInProgress}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'center', flex: 1 }}>
                        <Typography
                          variant='caption'
                          sx={{
                            color: theme.palette.error.main,
                            fontSize: { xs: '0.9rem', md: '0.9rem' },
                            fontWeight: 600,
                            display: 'block',
                          }}
                        >
                          ○ {totalNotStarted}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )
              })()}

              {/* Section 3: View Portfolio Button (Right - Narrow) */}
              <Box
                sx={{
                  flex: { xs: 'none', md: '0.8' },
                  minHeight: { xs: 'auto', md: 60 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Button
                  variant='contained'
                  size='large'
                  onClick={() => navigate(`/learner-dashboard/${learner?.learner_id}`)}
                  startIcon={<DashboardIcon />}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    width: '100%',
                    py: { xs: 2, md: 1.5 },
                    fontSize: { xs: '1.1rem', md: '1.1rem' },
                    fontWeight: 600,
                    borderRadius: 2,
                    textTransform: 'none',
                    boxShadow: `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`,
                    '&:hover': {
                      boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.4)}`,
                      transform: 'translateY(-1px)',
                    },
                  }}
                >
                  View Portfolio
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Fade>

      {/* Edit Comment Dialog */}
      <Dialog
        open={isEditingComment}
        onClose={handleCloseCommentDialog}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 600 }}>Edit Comment</DialogTitle>
        <DialogContent>
          <TextField
            margin='dense'
            label='Comment'
            type='text'
            fullWidth
            multiline
            rows={4}
            value={editedComment}
            onChange={(e) => setEditedComment(e.target.value)}
            variant='outlined'
            sx={{ mt: 2 }}
            disabled={isSavingComment}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button 
            onClick={handleCloseCommentDialog} 
            variant='outlined'
            disabled={isSavingComment}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveComment}
            variant='contained'
            color='primary'
            disabled={isSavingComment}
            startIcon={isSavingComment ? <CircularProgress size={20} color='inherit' /> : null}
          >
            {isSavingComment ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

const LearnerOverview = () => {
  const theme = useTheme()
  const user = useCurrentUser()
  const { learnerOverView } = useSelector(selectCourseManagement)
  const dispatch: any = useDispatch()

  // Pagination and Search State
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>('')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(5)

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300) // 300ms delay

    return () => {
      clearTimeout(handler)
    }
  }, [searchQuery])

  useEffect(() => {
    if (user?.user_id && user?.role) {
      dispatch(fetchAllLearnerByUserAPI(user?.user_id, user?.role))
    }
  }, [user])

  const handleClickData = (id, user_id) => {
    dispatch(slice.setLeanerId({ id, user_id }))
  }

  const handleClickSingleData = (row) => {
    dispatch(courseSlice.setSingleData(row))
  }

  // Handle comment update
  const handleCommentUpdate = async (learnerId: string, comment: string) => {
    try {
      await dispatch(updateLearnerAPI(learnerId, { comment }) as any)
      // Refresh the learner list after update
      if (user?.user_id && user?.role) {
        dispatch(fetchAllLearnerByUserAPI(user?.user_id, user?.role))
      }
    } catch (error) {
      console.error('Failed to update comment:', error)
    }
  }

  // Filter learners based on debounced search query
  const filteredLearners = useMemo(() => {
    if (!learnerOverView) return []
    
    if (!debouncedSearchQuery.trim()) return learnerOverView

    const query = debouncedSearchQuery.toLowerCase().trim()
    
    return learnerOverView.filter((learner) => {
      const firstName = (learner?.first_name || '').toString().toLowerCase()
      const lastName = (learner?.last_name || '').toString().toLowerCase()
      const fullName = `${firstName} ${lastName}`
      const learnerId = (learner?.learner_id || '').toString().toLowerCase()
      const email = (learner?.email || '').toString().toLowerCase()
      const comment = (learner?.comment || '').toString().toLowerCase()
      
      return (
        firstName.includes(query) ||
        lastName.includes(query) ||
        fullName.includes(query) ||
        learnerId.includes(query) ||
        email.includes(query) ||
        comment.includes(query)
      )
    })
  }, [learnerOverView, debouncedSearchQuery])

  // Paginate filtered learners
  const paginatedLearners = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredLearners.slice(startIndex, endIndex)
  }, [filteredLearners, currentPage, itemsPerPage])

  // Calculate total pages
  const totalPages = Math.ceil(filteredLearners.length / itemsPerPage)

  // Reset to page 1 when debounced search query changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery])

  // Check if search is in progress
  const isSearching = searchQuery !== debouncedSearchQuery

  // Handlers
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery('')
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = (event: any) => {
    setItemsPerPage(event.target.value)
    setCurrentPage(1) // Reset to first page when changing items per page
  }

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 1, sm: 2, md: 3 },
        minHeight: '100vh',
        background:
          theme.palette.mode === 'light'
            ? `linear-gradient(135deg, ${theme.palette.grey[50]} 0%, ${theme.palette.grey[100]} 100%)`
            : `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`,
      }}
    >
      {/* Header */}
      <Card
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 3,
          background:
            theme.palette.mode === 'light'
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: theme.palette.primary.contrastText,
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(10px)',
            zIndex: 1,
          },
        }}
      >
        <CardContent sx={{ position: 'relative', zIndex: 2, p: 4 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <PersonIcon sx={{ fontSize: 40, mr: 2, opacity: 0.9 }} />
              <Box>
                <Typography
                  variant='h3'
                  fontWeight={700}
                  sx={{
                    background: `linear-gradient(45deg, ${theme.palette.primary.contrastText}, rgba(255,255,255,0.8))`,
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  Learner Overview
                </Typography>
                <Typography
                  variant='h6'
                  sx={{
                    opacity: 0.9,
                    fontWeight: 400,
                    letterSpacing: '0.5px',
                  }}
                >
                  Manage and monitor learner progress
                </Typography>
              </Box>
            </Box>
            <Chip
              icon={<TrendingUpIcon />}
              label={`${filteredLearners?.length || 0} Learner${
                filteredLearners?.length !== 1 ? 's' : ''
              }`}
              sx={{
                backgroundColor: theme.palette.primary.contrastText,
                color: theme.palette.primary.main,
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Search and Filter Controls */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Grid container spacing={2} alignItems="center">
            {/* Search Bar */}
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search by name, learner ID, email, or comment..."
                value={searchQuery}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: theme.palette.text.secondary }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {isSearching ? (
                        <CircularProgress size={20} sx={{ color: theme.palette.primary.main }} />
                      ) : searchQuery ? (
                        <ClearIcon
                          sx={{
                            cursor: 'pointer',
                            color: theme.palette.text.secondary,
                            transition: 'color 0.2s',
                            '&:hover': {
                              color: theme.palette.error.main,
                            },
                          }}
                          onClick={handleClearSearch}
                        />
                      ) : null}
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.default,
                  },
                }}
              />
            </Grid>

            {/* Items Per Page Selector */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Items per page</InputLabel>
                <Select
                  value={itemsPerPage}
                  onChange={handleItemsPerPageChange}
                  label="Items per page"
                  sx={{
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.default,
                  }}
                >
                  <MenuItem value={5}>5 per page</MenuItem>
                  <MenuItem value={10}>10 per page</MenuItem>
                  <MenuItem value={15}>15 per page</MenuItem>
                  <MenuItem value={20}>20 per page</MenuItem>
                  <MenuItem value={learnerOverView?.length || 50}>All</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Results Info */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {filteredLearners.length > 0 ? (
                    <>
                      Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                      {Math.min(currentPage * itemsPerPage, filteredLearners.length)} of{' '}
                      {filteredLearners.length} learner{filteredLearners.length !== 1 ? 's' : ''}
                    </>
                  ) : (
                    'No learners found'
                  )}
                </Typography>
                {searchQuery && (
                  <Chip
                    label={`Filtered: ${filteredLearners.length} of ${learnerOverView?.length || 0}`}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Learners List */}
      <Box>
        {paginatedLearners?.length > 0 ? (
          paginatedLearners.map((item, index) => (
            <Protfolio
              key={item.learner_id || index}
              learner={item}
              handleClickSingleData={handleClickSingleData}
              handleClickData={handleClickData}
              onCommentUpdate={handleCommentUpdate}
            />
          ))
        ) : (
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: 4, textAlign: 'center' }}>
              <PersonIcon
                sx={{
                  fontSize: 64,
                  color: theme.palette.action.disabled,
                  mb: 2,
                }}
              />
              <Typography
                variant='h6'
                sx={{ mb: 1, color: theme.palette.text.secondary }}
              >
                {searchQuery ? 'No Matching Learners Found' : 'No Learners Found'}
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: theme.palette.text.secondary }}
              >
                {searchQuery 
                  ? 'Try adjusting your search criteria'
                  : 'There are no learners assigned to your account yet'}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mt: 4,
            mb: 2,
          }}
        >
          <Card
            elevation={0}
            sx={{
              borderRadius: 2,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              p: 2,
            }}
          >
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
              size="large"
              showFirstButton
              showLastButton
              sx={{
                '& .MuiPaginationItem-root': {
                  fontSize: '1rem',
                  fontWeight: 500,
                },
              }}
            />
          </Card>
        </Box>
      )}
    </Box>
  )
}

export default LearnerOverview
