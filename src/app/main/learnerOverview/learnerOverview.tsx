import {
  Avatar,
  Tooltip,
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Chip,
  Divider,
  Fade,
  Grid,
  Paper,
  LinearProgress,
  alpha,
  TextField,
  InputAdornment,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material'
import {
  fetchAllLearnerByUserAPI,
  selectCourseManagement,
} from 'app/store/courseManagement'
import { updateLearnerAPI } from 'app/store/learnerManagement'
import { selectUser } from 'app/store/userSlice'
import React, { useEffect, useState, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { selectstoreDataSlice, slice } from 'app/store/reloadData'
import { slice as courseSlice } from 'app/store/courseManagement'
import { portfolioCard } from 'src/app/contanst'
import LearnerPortfolioCard from 'src/app/component/Cards/LearnerPortfolioCard'
import { getRandomColor } from 'src/utils/randomColor'
import PersonIcon from '@mui/icons-material/Person'
import SchoolIcon from '@mui/icons-material/School'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import AssessmentIcon from '@mui/icons-material/Assessment'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CommentIcon from '@mui/icons-material/Comment'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import EditIcon from '@mui/icons-material/Edit'

const Protfolio = ({ learner, handleClickData, handleClickSingleData, onCommentUpdate }) => {
  const theme = useTheme()
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
            mb: 4,
            borderRadius: 3,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: theme.shadows[8],
              transform: 'translateY(-2px)',
            },
          }}
        >
        {/* Header Section */}
        <CardContent sx={{ p: 0 }} className='!pb-0'>
          <Box
            sx={{
              p: 3,
              color: 'black',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backdropFilter: 'blur(10px)',
                zIndex: 1,
              },
            }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 3,
                position: 'relative',
                zIndex: 2,
                width: '100%',
              }}
            >
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: getRandomColor(
                    learner?.first_name?.toLowerCase().charAt(0)
                  ),
                  border: `3px solid ${theme.palette.primary.contrastText}`,
                  boxShadow: theme.shadows[4],
                  flexShrink: 0,
                }}
                src={
                  learner?.learner_id
                    ? learner?.avatar
                    : learner.data?.avatar?.url
                }
                alt={learner?.first_name?.toUpperCase()?.charAt(0)}
              />
              <Box sx={{ color: 'black', flex: 1, minWidth: 0 }}>
                <Typography
                  variant='h4'
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  {learner?.first_name} {learner?.last_name}
                </Typography>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}
                >
                  <PersonIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                  <Typography variant='body2' sx={{ opacity: 0.9 }}>
                    Learner ID: {learner?.learner_id}
                  </Typography>
                </Box>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}
                >
                  <AccessTimeIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                  <Typography variant='body2' sx={{ opacity: 0.9 }}>
                    Next Visit: {learner?.next_session_date_type}
                  </Typography>
                </Box>

                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}
                >
                  <CommentIcon sx={{ fontSize: 16, opacity: 0.8 }} />
                  <Typography
                    variant='body2'
                    sx={{
                      opacity: 0.9,
                      maxWidth: 300,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Comment: {learner?.comment || 'No comment'}
                  </Typography>
                  <IconButton
                    size='small'
                    onClick={handleOpenCommentDialog}
                    sx={{
                      color: theme.palette.primary.main,
                      padding: '4px',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                      },
                    }}
                  >
                    <EditIcon fontSize='small' />
                  </IconButton>
                </Box>
              </Box>

              {/* Overall Progress Box on Right Side */}
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
                      minWidth: 280,
                      maxWidth: 320,
                      flexShrink: 0,
                      display: { xs: 'none', md: 'block' },
                    }}
                  >
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography
                          variant='subtitle2'
                          sx={{
                            fontWeight: 700,
                            color: theme.palette.primary.main,
                            fontSize: '1.4rem',
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
                            fontSize: '1.2rem',
                          }}
                        />
                      </Box>

                      <LinearProgress
                        variant='determinate'
                        value={Math.min(completionPercentage, 100)}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: alpha(theme.palette.primary.main, 0.2),
                          mb: 1.5,
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 6,
                            background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                          },
                        }}
                      />

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant='caption'
                            sx={{
                              color: theme.palette.success.main,
                              fontSize: '1rem',
                              fontWeight: 600,
                            }}
                          >
                            ✓ Done
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 700,
                              fontSize: '1.5rem',
                            }}
                          >
                            {totalCompleted}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant='caption'
                            sx={{
                              color: theme.palette.warning.main,
                              fontSize: '1rem',
                              fontWeight: 600,
                            }}
                          >
                            ⟳ Active
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 700,
                              fontSize: '1.5rem',
                            }}
                          >
                            {totalInProgress}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant='caption'
                            sx={{
                              color: theme.palette.error.main,
                              fontSize: '1rem',
                              fontWeight: 600,
                            }}
                          >
                            ○ Todo
                          </Typography>
                          <Typography
                            variant='body2'
                            sx={{
                              color: theme.palette.text.primary,
                              fontWeight: 700,
                              fontSize: '1.5rem',
                            }}
                          >
                            {totalNotStarted}
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{
                          mt: 1.5,
                          pt: 1.5,
                          borderTop: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                        }}
                      >
                        <Typography
                          variant='caption'
                          sx={{
                            color: theme.palette.text.secondary,
                            fontSize: '1.4rem',
                          }}
                        >
                          {totalUnitsAll} total units • {learner.course.length} course{learner.course.length !== 1 ? 's' : ''}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )
              })()}
            </Box>
          </Box>

          {/* Progress Section */}
          {/* {learner?.course && learner.course.length > 0 && (() => {
            let totalCompleted = 0
            let totalInProgress = 0
            let totalNotStarted = 0
            let totalUnitsAll = 0
            let minDaysPending = Infinity

            learner.course.forEach((course) => {
              const progressData = convertToMatrixData(course)
              totalCompleted += progressData.fullyCompleted
              totalInProgress += progressData.workInProgress
              totalNotStarted += progressData.yetToComplete
              totalUnitsAll += progressData.totalUnits
              if (progressData.dayPending > 0 && progressData.dayPending < minDaysPending) {
                minDaysPending = progressData.dayPending
              }
            })

            const completedPercentage = totalUnitsAll > 0 ? ((totalCompleted / totalUnitsAll) * 100).toFixed(1) : '0.0'
            const inProgressPercentage = totalUnitsAll > 0 ? ((totalInProgress / totalUnitsAll) * 100).toFixed(1) : '0.0'
            const notStartedPercentage = totalUnitsAll > 0 ? ((totalNotStarted / totalUnitsAll) * 100).toFixed(1) : '0.0'
            const overallProgress = parseFloat(completedPercentage) + (parseFloat(inProgressPercentage) * 0.5)

            return (
              <Box sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                  <TrendingUpIcon sx={{ color: theme.palette.primary.main }} />
                  <Typography variant='h6' sx={{ fontWeight: 600 }}>
                    Overall Progress
                  </Typography>
                  <Chip
                    label={`${learner.course.length} Course${learner.course.length > 1 ? 's' : ''}`}
                    size='small'
                    sx={{
                      ml: 1,
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.dark,
                      fontWeight: 600,
                    }}
                  />
                </Box>

                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    border: `2px solid ${theme.palette.divider}`,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
                  }}
                >
                  <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                      <Typography variant='h6' sx={{ fontWeight: 600 }}>
                        Total Progress
                      </Typography>
                      <Chip
                        label={`${overallProgress.toFixed(0)}% Complete`}
                        sx={{
                          backgroundColor: theme.palette.success.main,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.95rem',
                          height: 32,
                        }}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant='body2' sx={{ fontWeight: 500, color: theme.palette.text.secondary }}>
                        Across all courses
                      </Typography>
                      <Typography variant='body1' sx={{ fontWeight: 600 }}>
                        {totalCompleted + totalInProgress} / {totalUnitsAll} Units
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant='determinate'
                      value={overallProgress}
                      sx={{
                        height: 14,
                        borderRadius: 7,
                        backgroundColor: theme.palette.grey[200],
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 7,
                          background: `linear-gradient(90deg, ${theme.palette.success.light} 0%, ${theme.palette.success.main} 100%)`,
                        },
                      }}
                    />
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.secondary }}>
                    Progress Breakdown
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.success.light, 0.3),
                          border: `1px solid ${theme.palette.success.light}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant='body2' sx={{ fontWeight: 600, color: theme.palette.success.dark }}>
                            ✓ Completed
                          </Typography>
                          <Typography variant='h6' sx={{ fontWeight: 700, color: theme.palette.success.dark }}>
                            {totalCompleted}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant='determinate'
                          value={parseFloat(completedPercentage)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: theme.palette.success.main,
                            },
                          }}
                        />
                        <Typography variant='caption' sx={{ mt: 0.5, display: 'block', color: theme.palette.success.dark, fontWeight: 600 }}>
                          {completedPercentage}% of total
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.warning.light, 0.3),
                          border: `1px solid ${theme.palette.warning.light}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant='body2' sx={{ fontWeight: 600, color: theme.palette.warning.dark }}>
                            ⟳ In Progress
                          </Typography>
                          <Typography variant='h6' sx={{ fontWeight: 700, color: theme.palette.warning.dark }}>
                            {totalInProgress}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant='determinate'
                          value={parseFloat(inProgressPercentage)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: theme.palette.warning.main,
                            },
                          }}
                        />
                        <Typography variant='caption' sx={{ mt: 0.5, display: 'block', color: theme.palette.warning.dark, fontWeight: 600 }}>
                          {inProgressPercentage}% of total
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={4}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          backgroundColor: alpha(theme.palette.error.light, 0.3),
                          border: `1px solid ${theme.palette.error.light}`,
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant='body2' sx={{ fontWeight: 600, color: theme.palette.error.dark }}>
                            ○ Not Started
                          </Typography>
                          <Typography variant='h6' sx={{ fontWeight: 700, color: theme.palette.error.dark }}>
                            {totalNotStarted}
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant='determinate'
                          value={parseFloat(notStartedPercentage)}
                          sx={{
                            height: 8,
                            borderRadius: 4,
                            backgroundColor: 'rgba(255,255,255,0.5)',
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 4,
                              backgroundColor: theme.palette.error.main,
                            },
                          }}
                        />
                        <Typography variant='caption' sx={{ mt: 0.5, display: 'block', color: theme.palette.error.dark, fontWeight: 600 }}>
                          {notStartedPercentage}% of total
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  {minDaysPending !== Infinity && minDaysPending > 0 && (
                    <Box sx={{ mt: 3, p: 2, borderRadius: 2, backgroundColor: alpha(theme.palette.info.light, 0.2), border: `1px solid ${theme.palette.info.light}` }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AccessTimeIcon sx={{ fontSize: 20, color: theme.palette.info.main }} />
                        <Typography variant='body2' sx={{ color: theme.palette.info.dark, fontWeight: 600 }}>
                          Next deadline in {minDaysPending} days
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ mt: 3, pt: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 2, color: theme.palette.text.secondary }}>
                      Enrolled Courses ({learner.course.length})
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {learner.course.map((course, index) => (
                        <Link
                          key={index}
                          to='/portfolio/courseData'
                          style={{
                            color: 'inherit',
                            textDecoration: 'none',
                          }}
                          onClick={(e) => {
                            handleClickSingleData(course)
                            handleClickData(learner?.learner_id, learner?.user_id)
                          }}
                        >
                          <Chip
                            icon={<SchoolIcon />}
                            label={course?.course?.course_name || 'Course'}
                            variant='outlined'
                            sx={{
                              borderColor: theme.palette.primary.main,
                              color: theme.palette.primary.main,
                              fontWeight: 500,
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                backgroundColor: theme.palette.primary.main,
                                color: 'white',
                                '& .MuiChip-icon': {
                                  color: 'white',
                                },
                              },
                            }}
                          />
                        </Link>
                      ))}
                    </Box>
                  </Box>
                </Paper>
              </Box>
            )
          })()} */}
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
  const user =
    JSON.parse(sessionStorage.getItem('learnerToken'))?.user ||
    useSelector(selectUser)?.data
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
