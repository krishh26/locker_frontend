import {
  Card,
  CardContent,
  Checkbox,
  FormControl,
  Grid,
  MenuItem,
  Radio,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  useTheme,
  Chip,
  Divider,
  Fade,
  Skeleton,
  Tooltip,
  IconButton,
  FormControlLabel,
  Paper
} from '@mui/material'
import { selectLearnerManagement } from 'app/store/learnerManagement'
import {
  selectSkillsScan,
  skillsScanAction,
  updateCourseUnitSkillAPI,
} from 'app/store/skillsScan'
import { slice as courseSlice } from 'app/store/learnerManagement'
import { SyntheticEvent, useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import { SecondaryButton } from 'src/app/component/Buttons'
import QuizIcon from '@mui/icons-material/Quiz'
import AssessmentIcon from '@mui/icons-material/Assessment'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import HighlightIcon from '@mui/icons-material/Highlight'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'

const ratingOptions = [
  { value: 1, label: '😖 - Never' },
  { value: 2, label: '☹️ - Not sure' },
  { value: 3, label: '🙂 - Sometimes' },
  { value: 4, label: '😁 - Always' },
]

const TNAQuestionaire = (props) => {
  const { handleTabChange } = props
  const theme = useTheme()
  const { singleData, selectedCourse } = useSelector(selectSkillsScan)
  const { courseData, learner } = useSelector(selectLearnerManagement)
  const [expanded, setExpanded] = useState<string | false>(() => {
    return selectedCourse?.progressByDate?.[0]?.date || false
  })

  const dispatch: any = useDispatch()

  const [sampleData, setSampleData] = useState(courseData?.units || [])
  const [highlightBlanks, setHighlightBlanks] = useState(false)

  const handleClick = (event, row) => {
    dispatch(skillsScanAction.setSingleData(row))
  }

  useEffect(() => {
    if (courseData && courseData?.units) {
      const firstRow = courseData.units[0]
      dispatch(skillsScanAction.setSingleData(firstRow))
    }
  }, [])

  const radioHandler = (id, value) => {
    const data = JSON.parse(JSON.stringify(singleData))
    const updatedSubUnit = data?.subUnit?.find((item) => item?.id === id)

    // Update current rating (legacy field)
    updatedSubUnit.rating = value

    // Update or add to progressByDate
    const progressDate = expanded // assuming `expanded` holds the current date string like "June-2025"
    if (!updatedSubUnit.progressByDate) {
      updatedSubUnit.progressByDate = []
    }

    const existingProgress = updatedSubUnit.progressByDate.find(
      (p) => p.date === progressDate
    )
    if (existingProgress) {
      existingProgress.rating = value
    } else {
      updatedSubUnit.progressByDate.push({
        date: progressDate,
        rating: value,
      })
    }

    // Update Redux singleData
    dispatch(skillsScanAction.setSingleData(data))

    // Update courseData in global state
    const updatedCourse = JSON.parse(JSON.stringify(courseData))
    const unitUpdate = updatedCourse.units.find(
      (item) => item.id === singleData.id
    )

    unitUpdate.subUnit = unitUpdate.subUnit.map((item) =>
      item.id === id ? updatedSubUnit : item
    )

    dispatch(courseSlice.setCourseData({ course: updatedCourse }))
    setSampleData(updatedCourse?.units)
  }
  
  const saveData = () => {
    dispatch(updateCourseUnitSkillAPI(courseData))
    const updatedCourseData = {
      ...selectedCourse,
      course: {
        ...courseData,
      },
    }
    dispatch(skillsScanAction.setSelectedCourse(updatedCourseData))
  }

  const handleHighlightBlanksChange = (event) => {
    setHighlightBlanks(event.target.checked)
  }

  const handleSelectChange = (rowId, reviewKey, value) => {
    const updatedData = JSON.parse(JSON.stringify(singleData))
    const subUnit = updatedData.subUnit.find((item) => item.id === rowId)

    if (subUnit) {
      subUnit.quarter_review = {
        ...(subUnit.quarter_review || {}),
        [reviewKey]: value,
      }
    }

    dispatch(skillsScanAction.setSingleData(updatedData))

    // Update courseData in global state
    const updatedCourse = JSON.parse(JSON.stringify(courseData))
    const unitUpdate = updatedCourse.units.find(
      (item) => item.id === singleData.id
    )

    unitUpdate.subUnit = unitUpdate.subUnit.map((item) =>
      item.id === rowId ? subUnit : item
    )

    dispatch(courseSlice.setCourseData({ course: updatedCourse }))
    setSampleData(updatedCourse?.units)
  }

  const currentIndex = sampleData?.findIndex((item) => item.id === singleData?.id)
  const totalTopics = sampleData?.length || 0
  const completedTopics = sampleData?.filter(unit => 
    unit.subUnit?.every(sub => 
      sub.quarter_review?.induction && 
      sub.quarter_review?.first && 
      sub.quarter_review?.second && 
      sub.quarter_review?.third
    )
  ).length || 0

  return (
    <Box>
      {/* Header Controls */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden"
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <QuizIcon sx={{ 
                fontSize: 28, 
                color: theme.palette.primary.main,
                mr: 2,
                opacity: 0.8
              }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Skills Assessment Questionnaire
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Chip
                icon={<TrendingUpIcon />}
                label={`${completedTopics}/${totalTopics} Topics Completed`}
                size="small"
                sx={{
                  backgroundColor: theme.palette.success.light,
                  color: theme.palette.success.contrastText,
                  fontWeight: 600
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={highlightBlanks}
                    onChange={handleHighlightBlanksChange}
                    name='highlightBlanks'
                    sx={{
                      color: theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main,
                      }
                    }}
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <HighlightIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      Highlight Blanks
                    </Typography>
                  </Box>
                }
              />
            </Box>
          </Box>
          <Divider />
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 3, minHeight: '600px' }}>
        {/* Topics Sidebar */}
        <Card
          elevation={0}
          sx={{
            width: '300px',
            borderRadius: 2,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            overflow: "hidden",
            height: 'fit-content',
            position: 'sticky',
            top: 20
          }}
        >
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ 
              p: 2, 
              background: theme.palette.mode === 'light' 
                ? theme.palette.grey[50] 
                : theme.palette.background.default,
              borderBottom: `1px solid ${theme.palette.divider}`
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                Assessment Topics
              </Typography>
            </Box>
            <Box sx={{ maxHeight: '500px', overflowY: 'auto' }}>
              {sampleData?.map((row, index) => (
                <Box
                  key={row.id}
                  onClick={(e) => handleClick(e, row)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    backgroundColor: singleData?.id === row.id 
                      ? theme.palette.primary.light + '20'
                      : 'transparent',
                    borderLeft: singleData?.id === row.id 
                      ? `4px solid ${theme.palette.primary.main}`
                      : '4px solid transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.action.hover,
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={index + 1}
                      size="small"
                      sx={{
                        backgroundColor: singleData?.id === row.id 
                          ? theme.palette.primary.main
                          : theme.palette.grey[400],
                        color: singleData?.id === row.id 
                          ? theme.palette.primary.contrastText
                          : theme.palette.grey[100],
                        fontWeight: 600,
                        minWidth: '24px',
                        height: '24px'
                      }}
                    />
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: singleData?.id === row.id ? 600 : 400,
                        color: singleData?.id === row.id 
                          ? theme.palette.primary.main
                          : theme.palette.text.primary,
                        lineHeight: 1.3
                      }}
                    >
                      {row.title}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Main Assessment Area */}
        <Box sx={{ flexGrow: 1 }}>
          {singleData ? (
            <Fade in timeout={300}>
              <Card
                elevation={0}
                sx={{
                  borderRadius: 2,
                  background: theme.palette.background.paper,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: "hidden"
                }}
              >
                <CardContent sx={{ p: 0 }}>
                  {/* Assessment Header */}
                  <Box sx={{ 
                    p: 3, 
                    background: theme.palette.mode === 'light' 
                      ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                    color: theme.palette.primary.contrastText
                  }}>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                      {singleData?.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      Rate your skills for each competency area
                    </Typography>
                  </Box>

                  {/* Assessment Table */}
                  <TableContainer sx={{ maxHeight: 400 }}>
                    <Table size='small' aria-label='skills assessment table'>
                      <TableHead>
                        <TableRow>
                          <TableCell 
                            sx={{
                              background: theme.palette.mode === 'light'
                                ? theme.palette.grey[100]
                                : theme.palette.background.default,
                              fontWeight: 600,
                              fontSize: '0.875rem',
                              borderRight: `1px solid ${theme.palette.divider}`,
                              minWidth: '250px'
                            }}
                          >
                            Skill To Be Demonstrated
                          </TableCell>
                          {['Induction', 'First Review', 'Second Review', 'Third Review'].map((review) => (
                            <TableCell 
                              key={review}
                              align='center'
                              sx={{
                                background: theme.palette.mode === 'light'
                                  ? theme.palette.grey[100]
                                  : theme.palette.background.default,
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                borderRight: `1px solid ${theme.palette.divider}`,
                                '&:last-child': { borderRight: 'none' }
                              }}
                            >
                              {review}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {singleData?.subUnit?.map((row, index) => (
                          <TableRow
                            key={row.id}
                            sx={{
                              '&:nth-of-type(odd)': {
                                backgroundColor: theme.palette.mode === 'light'
                                  ? theme.palette.grey[50]
                                  : theme.palette.background.default + '80'
                              },
                              '&:hover': {
                                backgroundColor: theme.palette.mode === 'light'
                                  ? theme.palette.primary.light + '10'
                                  : theme.palette.primary.dark + '10',
                                transition: 'all 0.2s ease'
                              },
                              '& td': { 
                                borderRight: `1px solid ${theme.palette.divider}`,
                                padding: '12px 16px'
                              },
                              '& td:last-child': { borderRight: 'none' }
                            }}
                          >
                            <TableCell sx={{ fontWeight: 500 }}>
                              {row.subTitle}
                            </TableCell>
                            {['induction', 'first', 'second', 'third'].map((reviewKey) => (
                              <TableCell
                                key={reviewKey}
                                align='center'
                                sx={{
                                  backgroundColor: highlightBlanks && !row.quarter_review?.[reviewKey]
                                    ? theme.palette.warning.light + '30'
                                    : 'inherit',
                                  border: highlightBlanks && !row.quarter_review?.[reviewKey]
                                    ? `2px solid ${theme.palette.warning.main}`
                                    : 'none'
                                }}
                              >
                                <FormControl fullWidth size='small'>
                                  <Select
                                    displayEmpty
                                    value={row.quarter_review?.[reviewKey] || ''}
                                    fullWidth
                                    size='small'
                                    onChange={(e) =>
                                      handleSelectChange(
                                        row.id,
                                        reviewKey,
                                        e.target.value
                                      )
                                    }
                                    sx={{
                                      '& .MuiOutlinedInput-root': {
                                        borderRadius: 2,
                                        backgroundColor: theme.palette.background.paper,
                                        '& fieldset': {
                                          borderColor: theme.palette.divider,
                                        },
                                        '&:hover fieldset': {
                                          borderColor: theme.palette.primary.light,
                                        },
                                        '&.Mui-focused fieldset': {
                                          borderColor: theme.palette.primary.main,
                                        },
                                      }
                                    }}
                                  >
                                    <MenuItem value='' disabled>
                                      <em>Select rating</em>
                                    </MenuItem>
                                    {ratingOptions.map((opt) => (
                                      <MenuItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                      </MenuItem>
                                    ))}
                                  </Select>
                                </FormControl>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Fade>
          ) : (
            <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <AssessmentIcon sx={{ 
                  fontSize: 64, 
                  color: theme.palette.action.disabled,
                  mb: 2
                }} />
                <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.secondary }}>
                  No Topic Selected
                </Typography>
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
                  Please select a topic from the sidebar to begin assessment
                </Typography>
              </CardContent>
            </Card>
          )}

          {/* Navigation Controls */}
          <Card
            elevation={0}
            sx={{
              mt: 3,
              borderRadius: 2,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              overflow: 'hidden'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Previous topic">
                    <SecondaryButton
                      name='Previous'
                      startIcon={<NavigateBeforeIcon />}
                      disabled={currentIndex === 0}
                      onClick={() => {
                        if (currentIndex === -1 || currentIndex === 0) return
                        const previousData = sampleData[currentIndex - 1]
                        dispatch(skillsScanAction.setSingleData(previousData))
                      }}
                      sx={{
                        backgroundColor: theme.palette.grey[500],
                        color: theme.palette.grey[100],
                        '&:hover': {
                          backgroundColor: theme.palette.grey[600],
                        },
                        '&:disabled': {
                          backgroundColor: theme.palette.action.disabledBackground,
                          color: theme.palette.action.disabled
                        }
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="Next topic">
                    <SecondaryButton
                      name='Next'
                      endIcon={<NavigateNextIcon />}
                      disabled={currentIndex === totalTopics - 1}
                      onClick={() => {
                        if (currentIndex === -1 || currentIndex === totalTopics - 1) return
                        const nextTopic = sampleData[currentIndex + 1]
                        dispatch(skillsScanAction.setSingleData(nextTopic))
                      }}
                      sx={{
                        backgroundColor: theme.palette.grey[500],
                        color: theme.palette.grey[100],
                        '&:hover': {
                          backgroundColor: theme.palette.grey[600],
                        },
                        '&:disabled': {
                          backgroundColor: theme.palette.action.disabledBackground,
                          color: theme.palette.action.disabled
                        }
                      }}
                    />
                  </Tooltip>
                </Box>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Tooltip title="Save current progress">
                    <SecondaryButton
                      name='Save Progress'
                      startIcon={<SaveIcon />}
                      onClick={saveData}
                      sx={{
                        backgroundColor: theme.palette.success.main,
                        color: theme.palette.success.contrastText,
                        '&:hover': {
                          backgroundColor: theme.palette.success.dark,
                        }
                      }}
                    />
                  </Tooltip>
                  <Tooltip title="View results">
                    <SecondaryButton
                      name='View Results'
                      startIcon={<CheckCircleIcon />}
                      onClick={() => handleTabChange('', 2)}
                      sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
                          backgroundColor: theme.palette.primary.dark,
                        }
                      }}
                    />
                  </Tooltip>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  )
}

export default TNAQuestionaire
