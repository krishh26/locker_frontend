import FuseLoading from '@fuse/core/FuseLoading';
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import {
  Autocomplete,
  Box,
  Button,
  ButtonGroup,
  Card,
  Chip,
  Dialog,
  DialogContent,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { selectGlobalUser } from 'app/store/globalUser';
import {
  getRoleAPI,
  selectLearnerManagement,
} from 'app/store/learnerManagement';
import {
  deleteSessionHandler,
  getSessionAPI,
  selectSession,
  slice,
  updateSessionAPI,
} from 'app/store/session';
import { selectUser } from 'app/store/userSlice';
import moment from 'moment';
import { useEffect, useState } from 'react';
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  DangerButton,
  LoadingButton,
  SecondaryButtonOutlined
} from 'src/app/component/Buttons';
import AlertDialog from 'src/app/component/Dialogs/AlertDialog';
import DataNotFound from 'src/app/component/Pages/dataNotFound';
import CustomPagination from 'src/app/component/Pagination/CustomPagination';
import { themeHelpers, useThemeColors } from '../../utils/themeUtils';
import { exportSessionsToCSV, downloadCSV, generateFilename } from '../../../utils/csvExport';
import NewSession from '../portfolio/newsession';
import './calendar.css';
import SortByVisitDateDropdown from './SortByVisitDateDropdown';

// Setup moment localizer for react-big-calendar
const localizer = momentLocalizer(moment)

// Styled components for theme integration
const ThemedCard = styled(Card)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 1),
  transition: 'all 0.3s ease',
  
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 3),
    transform: 'translateY(-2px)',
  },
}));

const ThemedPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 1),
}));

const ThemedButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  padding: '8px 16px',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    transform: 'translateY(-1px)',
    boxShadow: themeHelpers.getShadow(theme, 2),
  },
}));

const ThemedIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.1),
    transform: 'scale(1.1)',
  },
}));

const ThemedChip = styled(Chip)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 2,
  fontWeight: 600,
  fontSize: '12px',
  height: '24px',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    transform: 'scale(1.05)',
    boxShadow: themeHelpers.getShadow(theme, 1),
  },
  
  '& .MuiChip-label': {
    px: 1.5,
    py: 0.5,
  },
}));

const ThemedTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: themeHelpers.getShadow(theme, 1),
  overflow: 'hidden',
}));

const ThemedTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  fontWeight: 500,
}));

const ThemedTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  '& .MuiTableCell-root': {
    color: theme.palette.text.secondary,
    fontWeight: 700,
    fontSize: '14px',
  },
}));

const ThemedCalendar = () => {
  const dispatch: any = useDispatch()
  const theme = useTheme()
  const colors = useThemeColors()

  const session = useSelector(selectSession)
  const user =
    JSON.parse(sessionStorage.getItem('learnerToken'))?.user ||
    useSelector(selectUser)?.data
  const { trainer } = useSelector(selectLearnerManagement)
  const { pagination } = useSelector(selectGlobalUser)

  const [anchorEl, setAnchorEl] = useState(null)
  const [selectedRow, setSelectedRow] = useState<any>(null)
  const [dialogType, setDialogType] = useState(false)
  const [deleteId, setDeleteId] = useState('')
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [calendarView, setCalendarView] = useState(Views.MONTH)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filter, setfilter] = useState({
    Attended: '',
    trainer_id: '',
    sortBy: '',
  })

  const fetchSessionData = (page = 1) => {
    dispatch(getSessionAPI({ page, page_size: pagination?.page_size }, filter))
  }

  const handleClick = (event, row) => {
    dispatch(slice.setSingledata(row))
    setSelectedRow(row)
    setAnchorEl(event.currentTarget)
  }

  const handleCloseDialog = () => {
    setDialogType(null)
  }

  const handleClose = () => {
    setAnchorEl(null)
    setSelectedRow(null)
  }

  const handleEdit = () => {
    handleClickOpen()
  }

  const handleClickOpen = () => {
    setDialogType(true)
  }

  const deleteIcon = (id) => {
    setDeleteId(selectedRow?.session_id)
  }

  const deleteConfromation = async () => {
    await dispatch(deleteSessionHandler(deleteId))
    fetchSessionData()
    setDeleteId('')
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    fetchSessionData(newPage)
  }
  
  const handleFilterChange = (event: string, value: string) => {
    setfilter({ ...filter, [event]: value })
  }

  const handleExportCSV = () => {
    if (!session?.data || session.data.length === 0) {
      return
    }
    
    const csvContent = exportSessionsToCSV(session.data)
    const filename = generateFilename('sessions_export')
    downloadCSV(csvContent, filename)
  }

  useEffect(() => {
    fetchSessionData()
  }, [dispatch, pagination, filter])

  useEffect(() => {
    dispatch(getRoleAPI('Trainer'))
  }, [])

  const formatDate = (date) => {
    if (!date) return ''
    const formattedDate = date.substr(0, 10)
    return formattedDate
  }

  // Transform session data into calendar events
  const transformSessionsToEvents = (sessions) => {
    if (!sessions || sessions.length === 0) {
      return []
    }

    const events = sessions
      .map((session) => {
        const startDate = new Date(session.startDate)

        if (isNaN(startDate.getTime())) {
          return null
        }

        const endDate = new Date(session.endDate || session.startDate)

        if (!session.endDate && session.Duration) {
          const durationHours = parseFloat(session.Duration) || 1
          endDate.setHours(startDate.getHours() + durationHours)
        } else if (!session.endDate) {
          endDate.setHours(startDate.getHours() + 1)
        }

        const event = {
          id: session.session_id,
          title: session.title || 'Untitled Session',
          start: startDate,
          end: endDate,
          resource: session,
          allDay: false,
        }

        return event
      })
      .filter((event) => event !== null)

    return events
  }

  // Get color based on attendance status with theme integration
  const getEventColor = (attended) => {
    switch (attended) {
      case 'Attended':
        return colors.primary.main
      case 'Cancelled':
      case 'Cancelled by Assessor':
      case 'Cancelled by Learner':
      case 'Cancelled by Employer':
        return colors.error.main
      case 'Learner Late':
      case 'Assessor Late':
        return colors.status.danger
      case 'Learner not Attended':
        return colors.secondary.main
      default:
        return colors.primary.light
    }
  }

  // Get status chip color with theme integration
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Attended':
        return { bg: colors.primary.main, text: colors.primary.contrastText }
      case 'Cancelled':
      case 'Cancelled by Assessor':
      case 'Cancelled by Learner':
      case 'Cancelled by Employer':
        return { bg: colors.error.main, text: colors.error.contrastText }
      case 'Learner Late':
      case 'Assessor Late':
        return { bg: colors.status.danger, text: '#ffffff' }
      case 'Learner not Attended':
        return { bg: colors.secondary.main, text: colors.secondary.contrastText }
      default:
        return { bg: colors.primary.light, text: colors.text.primary }
    }
  }

  // Simple event component for calendar with theme integration
  const EventComponent = ({ event }: { event: any }) => {
    const statusColor = getEventColor(event.resource?.Attended)
    
    return (
      <ThemedChip
        label={event.title}
        size='small'
        sx={{
          backgroundColor: statusColor,
          color: theme.palette.getContrastText(statusColor),
          fontSize: '11px',
          fontWeight: 600,
          height: '20px',
          maxWidth: '100%',
          '& .MuiChip-label': {
            px: 1,
            py: 0.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        }}
      />
    )
  }

  const CustomToolbar = ({ label, onNavigate }) => {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          p: 2,
          backgroundColor: colors.background.paper,
          borderBottom: `1px solid ${colors.divider}`,
          borderRadius: `${theme.shape.borderRadius * 2}px ${theme.shape.borderRadius * 2}px 0 0`,
        }}
      >
        <Box sx={{ display: 'flex', gap: 1 }}>
          <ThemedIconButton onClick={() => onNavigate('PREV')} size="small">
            <ArrowBackIos fontSize="small" />
          </ThemedIconButton>
          <ThemedIconButton onClick={() => onNavigate('NEXT')} size="small">
            <ArrowForwardIos fontSize="small" />
          </ThemedIconButton>
        </Box>
        <Typography 
          variant="h6" 
          sx={{ 
            fontWeight: 700,
            color: colors.text.primary,
            fontSize: '18px',
          }}
        >
          {label}
        </Typography>
        <ThemedButton
          variant="outlined"
          onClick={() => onNavigate('TODAY')}
          sx={{
            backgroundColor: colors.primary.main,
            color: colors.primary.contrastText,
            '&:hover': {
              backgroundColor: colors.primary.dark,
            },
          }}
        >
          Today
        </ThemedButton>
      </Box>
    )
  }

  return (
    <>
      {user?.role !== 'Learner' && (
        <Box sx={{ m: 5, mb: 0 }}>
          <ThemedCard sx={{ p: 3, mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, flex: 1, flexWrap: 'wrap' }}>
                <Autocomplete
                  sx={{ minWidth: 200, flex: 1 }}
                  size='small'
                  options={trainer}
                  getOptionLabel={(option: any) => option.user_name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder='Search by Trainer'
                      name='role'
                      value={filter?.trainer_id}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: colors.background.paper,
                          borderRadius: theme.shape.borderRadius * 1.5,
                        },
                      }}
                    />
                  )}
                  onChange={(e, value: any) =>
                    handleFilterChange('trainer_id', value?.user_id)
                  }
                  PaperComponent={({ children }) => (
                    <ThemedPaper>{children}</ThemedPaper>
                  )}
                />
                <Autocomplete
                  sx={{ minWidth: 200, flex: 1 }}
                  size='small'
                  value={filter.Attended}
                  options={[
                    'Not Set',
                    'Attended',
                    'Cancelled',
                    'Cancelled by Assessor',
                    'Cancelled by Learner',
                    'Cancelled by Employer',
                    'Learner Late',
                    'Assessor Late',
                    'Learner not Attended',
                  ].map((option) => option)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder='Search by Attended'
                      name='Attended'
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          backgroundColor: colors.background.paper,
                          borderRadius: theme.shape.borderRadius * 1.5,
                        },
                      }}
                    />
                  )}
                  onChange={(e, value) => {
                    handleFilterChange('Attended', value)
                  }}
                  PaperComponent={({ children }) => (
                    <ThemedPaper>{children}</ThemedPaper>
                  )}
                />
                <SortByVisitDateDropdown
                  onChange={(order) => {
                    setfilter({ ...filter, sortBy: order })
                  }}
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <ButtonGroup variant='outlined' size='small'>
                  <ThemedButton
                    variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('calendar')}
                    sx={{
                      backgroundColor: viewMode === 'calendar' ? colors.primary.main : 'transparent',
                      color: viewMode === 'calendar' ? colors.primary.contrastText : colors.primary.main,
                      '&:hover': {
                        backgroundColor: viewMode === 'calendar' ? colors.primary.dark : themeHelpers.withOpacity(colors.primary.main, 0.1),
                      },
                    }}
                  >
                    Calendar
                  </ThemedButton>
                  <ThemedButton
                    variant={viewMode === 'list' ? 'contained' : 'outlined'}
                    onClick={() => setViewMode('list')}
                    sx={{
                      backgroundColor: viewMode === 'list' ? colors.primary.main : 'transparent',
                      color: viewMode === 'list' ? colors.primary.contrastText : colors.primary.main,
                      '&:hover': {
                        backgroundColor: viewMode === 'list' ? colors.primary.dark : themeHelpers.withOpacity(colors.primary.main, 0.1),
                      },
                    }}
                  >
                    List
                  </ThemedButton>
                </ButtonGroup>
                <ThemedButton
                  variant='outlined'
                  onClick={handleExportCSV}
                  disabled={!session?.data || session.data.length === 0}
                  sx={{
                    backgroundColor: 'transparent',
                    color: colors.primary.main,
                    borderColor: colors.primary.main,
                    '&:hover': {
                      backgroundColor: themeHelpers.withOpacity(colors.primary.main, 0.1),
                    },
                    '&:disabled': {
                      color: colors.text.disabled,
                      borderColor: colors.divider,
                    },
                  }}
                >
                  Export CSV
                </ThemedButton>
              </Box>
            </Box>
          </ThemedCard>
        </Box>
      )}

      {/* View Toggle for Learners */}
      {user?.role === 'Learner' && (
        <Box sx={{ m: 5, mb: 0, display: 'flex', justifyContent: 'flex-end' }}>
          <ThemedCard sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <ButtonGroup variant='outlined' size='small'>
                <ThemedButton
                  variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('calendar')}
                  sx={{
                    backgroundColor: viewMode === 'calendar' ? colors.primary.main : 'transparent',
                    color: viewMode === 'calendar' ? colors.primary.contrastText : colors.primary.main,
                    '&:hover': {
                      backgroundColor: viewMode === 'calendar' ? colors.primary.dark : themeHelpers.withOpacity(colors.primary.main, 0.1),
                    },
                  }}
                >
                  Calendar
                </ThemedButton>
                <ThemedButton
                  variant={viewMode === 'list' ? 'contained' : 'outlined'}
                  onClick={() => setViewMode('list')}
                  sx={{
                    backgroundColor: viewMode === 'list' ? colors.primary.main : 'transparent',
                    color: viewMode === 'list' ? colors.primary.contrastText : colors.primary.main,
                    '&:hover': {
                      backgroundColor: viewMode === 'list' ? colors.primary.dark : themeHelpers.withOpacity(colors.primary.main, 0.1),
                    },
                  }}
                >
                  List
                </ThemedButton>
              </ButtonGroup>
              <ThemedButton
                variant='outlined'
                onClick={handleExportCSV}
                disabled={!session?.data || session.data.length === 0}
                sx={{
                  backgroundColor: 'transparent',
                  color: colors.primary.main,
                  borderColor: colors.primary.main,
                  '&:hover': {
                    backgroundColor: themeHelpers.withOpacity(colors.primary.main, 0.1),
                  },
                  '&:disabled': {
                    color: colors.text.disabled,
                    borderColor: colors.divider,
                  },
                }}
              >
                Export CSV
              </ThemedButton>
            </Box>
          </ThemedCard>
        </Box>
      )}

      <Box sx={{ m: 5 }}>
        {viewMode === 'calendar' ? (
          // Calendar View
          <Box>
            {/* Calendar Legend */}
            <ThemedCard sx={{ mb: 3, p: 3 }}>
              <Typography 
                variant='h6' 
                sx={{ 
                  mb: 2, 
                  fontWeight: 700,
                  color: colors.text.primary,
                }}
              >
                Status Legend
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {[
                  { label: 'Attended', status: 'Attended' },
                  { label: 'Cancelled', status: 'Cancelled' },
                  { label: 'Late', status: 'Learner Late' },
                  { label: 'Not Attended', status: 'Learner not Attended' },
                  { label: 'Not Set', status: 'Not Set' },
                ].map((item) => {
                  const chipColors = getStatusChipColor(item.status)
                  return (
                    <ThemedChip
                      key={item.label}
                      size='small'
                      label={item.label}
                      sx={{
                        backgroundColor: chipColors.bg,
                        color: chipColors.text,
                        fontWeight: 600,
                      }}
                    />
                  )
                })}
              </Box>
            </ThemedCard>

            <ThemedCard sx={{ p: 3 }}>
              <Box
                sx={{
                  height: 600,
                  backgroundColor: colors.background.paper,
                  borderRadius: theme.shape.borderRadius * 2,
                  overflow: 'hidden',
                }}
              >
                <BigCalendar
                  localizer={localizer}
                  events={transformSessionsToEvents(session?.data || [])}
                  defaultView={Views.MONTH}
                  defaultDate={new Date(2025, 7, 1)}
                  startAccessor='start'
                  endAccessor='end'
                  view={calendarView}
                  onView={setCalendarView}
                  date={currentDate}
                  onNavigate={setCurrentDate}
                  style={{ height: '100%' }}
                  components={{
                    event: EventComponent,
                    toolbar: CustomToolbar,
                  }}
                  onSelectEvent={(event) => {
                    setSelectedRow(event.resource)
                    dispatch(slice.setSingledata(event.resource))
                    setDialogType(true)
                  }}
                  views={['month', 'week', 'day', 'agenda']}
                  popup={true}
                  showMultiDayTimes={true}
                  step={30}
                  timeslots={2}
                  length={30}
                  messages={{
                    agenda: 'Sessions Schedule',
                    date: 'Date',
                    time: 'Time',
                    event: 'Session Details',
                    noEventsInRange: 'No sessions scheduled for this period.',
                    showMore: (total) => `+${total} more sessions`,
                    month: 'Month',
                    week: 'Week',
                    day: 'Day',
                    today: 'Today',
                    previous: 'Previous',
                    next: 'Next',
                  }}
                />
              </Box>
            </ThemedCard>
          </Box>
        ) : (
          // List View
          <div>
            <ThemedTableContainer>
              {session?.dataFetchLoading ? (
                <FuseLoading />
              ) : session?.data?.length ? (
                <Table
                  sx={{ minWidth: 650, height: '100%' }}
                  size='small'
                  aria-label='simple table'
                >
                  <ThemedTableHead>
                    <TableRow>
                      <ThemedTableCell>Title</ThemedTableCell>
                      <ThemedTableCell>Learners</ThemedTableCell>
                      <ThemedTableCell>Trainer</ThemedTableCell>
                      <ThemedTableCell>Location</ThemedTableCell>
                      <ThemedTableCell>Visit Date</ThemedTableCell>
                      <ThemedTableCell>Duration</ThemedTableCell>
                      <ThemedTableCell align='center'>Attended</ThemedTableCell>
                      <ThemedTableCell>Action</ThemedTableCell>
                    </TableRow>
                  </ThemedTableHead>
                  <TableBody>
                    {session?.data?.map((row) => (
                      <TableRow
                        key={row.title}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': {
                            backgroundColor: themeHelpers.withOpacity(colors.primary.main, 0.05),
                          },
                        }}
                      >
                        <ThemedTableCell>{row?.title}</ThemedTableCell>
                        <ThemedTableCell>
                          {row?.learners
                            .map((learner) => learner.user_name)
                            .join(', ')}
                        </ThemedTableCell>
                        <ThemedTableCell>{row?.trainer_id?.user_name}</ThemedTableCell>
                        <ThemedTableCell>{row?.location}</ThemedTableCell>
                        <ThemedTableCell>{formatDate(row?.startDate)}</ThemedTableCell>
                        <ThemedTableCell>{row?.Duration}</ThemedTableCell>
                        <ThemedTableCell align='center'>
                          <Autocomplete
                            disableClearable
                            fullWidth
                            size='small'
                            value={row?.Attended}
                            options={[
                              'Not Set',
                              'Attended',
                              'Cancelled',
                              'Cancelled by Assessor',
                              'Cancelled by Learner',
                              'Cancelled by Employer',
                              'Learner Late',
                              'Assessor Late',
                              'Learner not Attended',
                            ].map((option) => option)}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                placeholder='Select status'
                                name='status'
                                sx={{
                                  '& .MuiOutlinedInput-root': {
                                    backgroundColor: colors.background.paper,
                                    borderRadius: theme.shape.borderRadius,
                                  },
                                }}
                              />
                            )}
                            onChange={async (e, value) => {
                              await dispatch(
                                updateSessionAPI(row?.session_id, {
                                  Attended: value,
                                })
                              )
                              fetchSessionData()
                            }}
                            PaperComponent={({ children }) => (
                              <ThemedPaper>{children}</ThemedPaper>
                            )}
                          />
                        </ThemedTableCell>
                        <ThemedTableCell>
                          <ThemedIconButton
                            size='small'
                            onClick={(e) => handleClick(e, row)}
                          >
                            <MoreHorizIcon fontSize='small' />
                          </ThemedIconButton>
                        </ThemedTableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: 3,
                    height: '400px',
                    color: colors.text.secondary,
                  }}
                >
                  <DataNotFound width='25%' />
                  <Typography variant='h5' sx={{ color: colors.text.primary }}>
                    No data found
                  </Typography>
                  <Typography variant='body2' sx={{ textAlign: 'center' }}>
                    It is a long established fact that a reader will be <br />
                    distracted by the readable content.
                  </Typography>
                </Box>
              )}
              <CustomPagination
                pages={session?.meta_data?.pages}
                page={session?.meta_data?.page}
                handleChangePage={handleChangePage}
                items={session?.meta_data?.items}
              />
            </ThemedTableContainer>
          </div>
        )}
        
        <AlertDialog
          open={Boolean(deleteId)}
          close={() => deleteIcon('')}
          title='Delete Session?'
          content='Deleting this session will also remove all associated data and relationships. Proceed with deletion?'
          className='-224 '
          actionButton={
            session?.dataUpdatingLoadding ? (
              <LoadingButton />
            ) : (
              <DangerButton
                onClick={deleteConfromation}
                name='Delete Session'
              />
            )
          }
          cancelButton={
            <SecondaryButtonOutlined
              className='px-24'
              onClick={() => deleteIcon('')}
              name='Cancel'
            />
          }
        />

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <MenuItem
            onClick={() => {
              handleEdit()
              handleClose()
            }}
          >
            Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              handleClose()
              deleteIcon(selectedRow)
            }}
          >
            Delete
          </MenuItem>
        </Menu>

        <Dialog
          open={dialogType}
          onClose={handleCloseDialog}
          fullScreen
          fullWidth
          sx={{
            '.MuiDialog-paper': {
              borderRadius: theme.shape.borderRadius * 2,
              width: '100%',
              backgroundColor: colors.background.paper,
            },
          }}
        >
          <DialogContent className='p-0'>
            <NewSession edit={true} handleCloseDialog={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </Box>
    </>
  )
}

export default ThemedCalendar
