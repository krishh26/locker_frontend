import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import AssessmentIcon from '@mui/icons-material/Assessment'
import SchoolIcon from '@mui/icons-material/School'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import {
  Autocomplete,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useTheme
} from '@mui/material'
import {
  getLearnerCourseDetails,
  selectLearnerManagement,
  slice,
} from 'app/store/learnerManagement'
import { selectSkillsScan, skillsScanAction } from 'app/store/skillsScan'
import { useDispatch, useSelector } from 'react-redux'
import { SecondaryButton } from 'src/app/component/Buttons'
import { useCurrentUser } from 'src/app/utils/userHelpers'

const getQuarterlyProgress = (start, end) => {
  const result = [];
  const current = new Date(start);
  const now = new Date();
  const currentMonth = now.getMonth(); // 0–11
  const currentYear = now.getFullYear();

  while (current <= end) {
    const month = current.getMonth();
    const year = current.getFullYear();
    const monthName = current.toLocaleString('default', { month: 'long' });

    // If the current iteration is in the future, disable it
    const isFuture = year > currentYear || (year === currentYear && month > currentMonth);

    result.push({
      date: `${monthName}-${year}`,
      isDisabled: isFuture, 
    });

    current.setMonth(current.getMonth() + 3);
  }

  return result;
};

const TNAUnits = (props) => {
  const { handleTabChange } = props
  const theme = useTheme()
  const { learner, courseData, dataFetchLoading } = useSelector(
    selectLearnerManagement
  )

  const { selectedCourse } = useSelector(selectSkillsScan)

  const selectedUser = useCurrentUser()

  const dispatch: any = useDispatch()

  const getCouseDetails = (value) => {
    if (!value) {
      dispatch(slice.setCourseData([]))
      dispatch(skillsScanAction.setSelectedCourse(null))
      return
    }

    const { course_id } = value.course
    const learner_id = selectedUser?.learner_id

    const progressByDate = getQuarterlyProgress(
      new Date(value.start_date),
      new Date(value.end_date)
    )

    const data = {
      ...value,
      progressByDate,
    }

    dispatch(skillsScanAction.setSelectedCourse(data))
    dispatch(getLearnerCourseDetails({ course_id, learner_id }))
  }

  return (
    <Box>
      {/* Course Selection Card */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <SchoolIcon sx={{ 
              fontSize: 28, 
              color: theme.palette.primary.main,
              mr: 2,
              opacity: 0.8
            }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Choose Training Course
            </Typography>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Typography variant="body1" sx={{ fontWeight: 500, minWidth: 'fit-content' }}>
              Select Course:
            </Typography>
            <Autocomplete
              disablePortal
              options={learner?.course || []}
              value={selectedCourse}
              getOptionLabel={(option: any) => option.course?.course_name || ''}
              sx={{ 
                minWidth: 300,
                flexGrow: 1,
                maxWidth: 500
              }}
              renderInput={(params) => (
                <TextField 
                  {...params} 
                  placeholder='Select a course to begin...' 
                  size='small'
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
                />
              )}
              onChange={(event, value) => getCouseDetails(value)}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Course Units Table */}
      {dataFetchLoading ? (
        <Card elevation={0} sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <CardContent sx={{ p: 3 }}>
            <Skeleton variant="rectangular" height={300} sx={{ borderRadius: 1 }} />
          </CardContent>
        </Card>
      ) : selectedCourse && courseData?.units?.length ? (
        <Fade in timeout={500}>
          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 2,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: theme.shadows[4]
              }
            }}
          >
            <CardContent sx={{ p: 0 }}>
              {/* Table Header */}
              <Box sx={{ 
                p: 3, 
                pb: 2,
                background: theme.palette.mode === 'light' 
                  ? theme.palette.grey[50] 
                  : theme.palette.background.default,
                borderBottom: `1px solid ${theme.palette.divider}`
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AssessmentIcon sx={{ 
                    fontSize: 24, 
                    color: theme.palette.primary.main,
                    mr: 1
                  }} />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Course Units
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Chip
                    icon={<TrendingUpIcon />}
                    label={`${courseData?.units?.length} Units Available`}
                    size="small"
                    sx={{
                      backgroundColor: theme.palette.success.light,
                      color: theme.palette.success.contrastText,
                      fontWeight: 600
                    }}
                  />
                </Box>
              </Box>

              {/* Table */}
              <TableContainer sx={{ maxHeight: 400 }}>
                <Table size='small' aria-label='course units table'>
                  <TableHead>
                    <TableRow>
                      <TableCell 
                        sx={{
                          background: theme.palette.mode === 'light'
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                            : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                          color: theme.palette.primary.contrastText,
                          fontWeight: 600,
                          fontSize: '1rem',
                          borderRight: `1px solid ${theme.palette.primary.contrastText}20`
                        }}
                      >
                        Standard Units
                      </TableCell>
                      <TableCell 
                        sx={{
                          background: theme.palette.mode === 'light'
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                            : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                          color: theme.palette.primary.contrastText,
                          fontWeight: 600,
                          fontSize: '1rem',
                          borderRight: `1px solid ${theme.palette.primary.contrastText}20`
                        }}
                      >
                        Hours
                      </TableCell>
                      <TableCell 
                        sx={{
                          background: theme.palette.mode === 'light'
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                            : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                          color: theme.palette.primary.contrastText,
                          fontWeight: 600,
                          fontSize: '1rem',
                          borderRight: `1px solid ${theme.palette.primary.contrastText}20`
                        }}
                      >
                        Credits
                      </TableCell>
                      <TableCell 
                        sx={{
                          background: theme.palette.mode === 'light'
                            ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                            : `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                          color: theme.palette.primary.contrastText,
                          fontWeight: 600,
                          fontSize: '1rem'
                        }}
                      >
                        Level
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courseData?.units?.map((row, index) => (
                      <TableRow
                        key={row.group}
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
                            transform: 'scale(1.001)',
                            transition: 'all 0.2s ease'
                          },
                          '& td': { 
                            borderRight: `1px solid ${theme.palette.divider}`,
                            padding: '12px 16px'
                          },
                          '& td:last-child': { borderRight: 'none' }
                        }}
                      >
                        <TableCell sx={{ fontWeight: 500, width: '50%' }}>
                          {row.title}
                        </TableCell>
                        <TableCell sx={{ width: '15%' }}>
                          <Chip
                            label={row?.glh || 0}
                            size="small"
                            sx={{
                              backgroundColor: theme.palette.info.light,
                              color: theme.palette.info.contrastText,
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: '15%' }}>
                          <Chip
                            label={row.credit_value || 0}
                            size="small"
                            sx={{
                              backgroundColor: theme.palette.success.light,
                              color: theme.palette.success.contrastText,
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ width: '20%' }}>
                          <Chip
                            label={`Level ${row.level}`}
                            size="small"
                            sx={{
                              backgroundColor: theme.palette.warning.light,
                              color: theme.palette.warning.contrastText,
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
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
            <SchoolIcon sx={{ 
              fontSize: 64, 
              color: theme.palette.action.disabled,
              mb: 2
            }} />
            <Typography variant="h6" sx={{ mb: 1, color: theme.palette.text.secondary }}>
              No Units Found
            </Typography>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Please select a course to view available units
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Next Button */}
      {selectedCourse && courseData?.units?.length && (
        <Card
          elevation={0}
          sx={{
            borderRadius: 2,
            background: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
              <Tooltip title="Proceed to questionnaire">
                <SecondaryButton
                  name='Continue to Questionnaire'
                  startIcon={<ArrowForwardIcon />}
                  onClick={() => handleTabChange('', 1)}
                  sx={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.dark,
                      transform: 'translateY(-2px)',
                      boxShadow: theme.shadows[6]
                    }
                  }}
                />
              </Tooltip>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}

export default TNAUnits
