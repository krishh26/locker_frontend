import FuseLoading from '@fuse/core/FuseLoading'
import {
  Autocomplete,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Box,
  Button,
  ButtonGroup,
  Chip,
  Card,
  CardContent,
  Tooltip,
} from '@mui/material'
import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import {
  Calendar as BigCalendar,
  momentLocalizer,
  Views,
} from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import './calendar.css'
import React, { useEffect, useState } from 'react'
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import AlertDialog from 'src/app/component/Dialogs/AlertDialog'
import DataNotFound from 'src/app/component/Pages/dataNotFound'
import NewSession from '../portfolio/newsession'
import {
  deleteSessionHandler,
  getSessionAPI,
  selectSession,
  slice,
  updateSessionAPI,
} from 'app/store/session'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import { Link } from 'react-router-dom'
import { selectUser } from 'app/store/userSlice'
import { selectGlobalUser } from 'app/store/globalUser'
import CustomPagination from 'src/app/component/Pagination/CustomPagination'
import {
  getRoleAPI,
  selectLearnerManagement,
} from 'app/store/learnerManagement'
import SortByVisitDateDropdown from './SortByVisitDateDropdown'

// Setup moment localizer for react-big-calendar
const localizer = momentLocalizer(moment)

const Calendar = () => {
  const dispatch: any = useDispatch()

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
    console.log(row)
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

  useEffect(() => {
    fetchSessionData()
  }, [dispatch, pagination, filter])

  useEffect(() => {
    dispatch(getRoleAPI('Trainer'))
  }, [])

  // useEffect(() => {
  //   console.log('Session data updated:', session?.data)
  //   console.log('Current calendar view:', calendarView)

  //   if (!session?.data || session.data.length === 0) {
  //     console.log('No session data available for calendar')
  //   } else {
  //     console.log('Sessions available:', session.data.length)
  //     session.data.forEach((s, index) => {
  //       console.log(`Session ${index + 1}:`, {
  //         title: s.title,
  //         startDate: s.startDate,
  //         trainer: s.trainer_id?.user_name,
  //         location: s.location,
  //       })
  //     })
  //   }
  // }, [session?.data, calendarView])

  const formatDate = (date) => {
    if (!date) return ''
    const formattedDate = date.substr(0, 10)
    return formattedDate
  }

  // Transform session data into calendar events
  const transformSessionsToEvents = (sessions) => {
    if (!sessions || sessions.length === 0) {
      console.log('No sessions to transform')
      return []
    }

    const events = sessions
      .map((session) => {
        const startDate = new Date(session.startDate)

        // Ensure we have a valid date
        if (isNaN(startDate.getTime())) {
          console.warn('Invalid start date for session:', session)
          return null
        }

        const endDate = new Date(session.endDate || session.startDate)

        // If no end date, add duration to start date
        if (!session.endDate && session.Duration) {
          const durationHours = parseFloat(session.Duration) || 1
          endDate.setHours(startDate.getHours() + durationHours)
        } else if (!session.endDate) {
          // Default to 1 hour if no duration specified
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

        console.log('Created event:', event)
        return event
      })
      .filter((event) => event !== null)

    console.log('Total transformed events for calendar:', events.length, events)
    return events
  }

  // Get color based on attendance status
  const getEventColor = (attended) => {
    switch (attended) {
      case 'Attended':
        return '#4caf50'
      case 'Cancelled':
      case 'Cancelled by Assessor':
      case 'Cancelled by Learner':
      case 'Cancelled by Employer':
        return '#f44336'
      case 'Learner Late':
      case 'Assessor Late':
        return '#ff9800'
      case 'Learner not Attended':
        return '#e91e63'
      default:
        return '#2196f3'
    }
  }

  // Simple event component for calendar
  const EventComponent = ({ event }: { event: any }) => {
    return (
      <Chip
        label={event.title}
        size='small'
        sx={{
          backgroundColor: getEventColor(event.resource?.Attended),
          color: '#fff',
          borderRadius: '6px',
          fontSize: '0.75rem',
          fontWeight: 500,
          height: '22px',
          '& .MuiChip-label': {
            px: 1.5,
            py: 0.5,
          },
        }}
      />
    )
  }

  const CustomToolbar = ({ label, onNavigate }) => {
    return (
      <div className='rbc-toolbar flex justify-between items-center p-2'>
        <div className='flex gap-2'>
          <IconButton onClick={() => onNavigate('PREV')} color='primary'>
            <ArrowBackIos />
          </IconButton>
          <IconButton onClick={() => onNavigate('NEXT')} color='primary'>
            <ArrowForwardIos />
          </IconButton>
        </div>
        <span className='font-semibold text-lg'>{label}</span>
        <IconButton onClick={() => onNavigate('TODAY')} color='secondary'>
          Today
        </IconButton>
      </div>
    )
  }

  return (
    <>
      {user?.role !== 'Learner' && (
        <div className='m-10 mb-0 flex justify-between'>
          <div className='w-1/3 flex gap-14'>
            <Autocomplete
              fullWidth
              size='small'
              options={trainer}
              getOptionLabel={(option: any) => option.user_name}
              renderInput={(params) => (
                <TextField
                  {...params}
                  placeholder='Search by Trainer'
                  name='role'
                  value={filter?.trainer_id}
                />
              )}
              onChange={(e, value: any) =>
                handleFilterChange('trainer_id', value?.user_id)
              }
              sx={{
                '.MuiAutocomplete-clearIndicator': {
                  color: '#5B718F',
                },
              }}
              PaperComponent={({ children }) => (
                <Paper style={{ borderRadius: '4px' }}>{children}</Paper>
              )}
            />
            <Autocomplete
              fullWidth
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
                />
              )}
              onChange={(e, value) => {
                handleFilterChange('Attended', value)
              }}
              sx={{
                '.MuiAutocomplete-clearIndicator': {
                  color: '#5B718F',
                },
              }}
              PaperComponent={({ children }) => (
                <Paper style={{ borderRadius: '4px' }}>{children}</Paper>
              )}
            />
            <SortByVisitDateDropdown
              onChange={(order) => {
                setfilter({ ...filter, sortBy: order })
              }}
            />
          </div>
          <div className='items-end flex gap-2'>
            <ButtonGroup variant='outlined' size='small'>
              <Button
                variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'contained' : 'outlined'}
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
            </ButtonGroup>
            {/* <div className='items-end'>
              <Link to='/newsession'>
                <SecondaryButton name='New Session' />
              </Link>
            </div> */}
          </div>
        </div>
      )}

      {/* View Toggle for Learners */}
      {user?.role === 'Learner' && (
        <div className='m-10 mb-0 flex justify-end'>
          <ButtonGroup variant='outlined' size='small'>
            <Button
              variant={viewMode === 'calendar' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('calendar')}
            >
              Calendar
            </Button>
            <Button
              variant={viewMode === 'list' ? 'contained' : 'outlined'}
              onClick={() => setViewMode('list')}
            >
              List
            </Button>
          </ButtonGroup>
        </div>
      )}

      <Grid className='m-10'>
        {viewMode === 'calendar' ? (
          // Calendar View
          <Box>
            {/* Calendar Legend */}
            <Box
              sx={{ mb: 2, p: 2, backgroundColor: '#f8f9fa', borderRadius: 2 }}
            >
              <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
                Status Legend:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Chip
                  size='small'
                  label='Attended'
                  sx={{ backgroundColor: '#4caf50', color: 'white' }}
                />
                <Chip
                  size='small'
                  label='Cancelled'
                  sx={{ backgroundColor: '#f44336', color: 'white' }}
                />
                <Chip
                  size='small'
                  label='Late'
                  sx={{ backgroundColor: '#ff9800', color: 'white' }}
                />
                <Chip
                  size='small'
                  label='Not Attended'
                  sx={{ backgroundColor: '#e91e63', color: 'white' }}
                />
                <Chip
                  size='small'
                  label='Not Set'
                  sx={{ backgroundColor: '#2196f3', color: 'white' }}
                />
              </Box>
            </Box>

            <Box
              sx={{
                height: 600,
                backgroundColor: 'white',
                borderRadius: 2,
                p: 2,
              }}
            >
              <BigCalendar
                localizer={localizer}
                events={(() => {
                  const realEvents =
                    session?.data && session.data.length > 0
                      ? transformSessionsToEvents(session.data)
                      : []

                  const allEvents = [...realEvents]
                  console.log('Events being passed to calendar:', allEvents)
                  console.log('Current view:', calendarView)
                  console.log('Real events:', realEvents)
                  return allEvents
                })()}
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
                }}
                onSelectEvent={(event) => {
                  console.log('Event selected:', event)
                  setSelectedRow(event.resource)
                  setDialogType(true)
                }}
                // Remove eventPropGetter to avoid conflicts with custom EventComponent
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
              {/* <BigCalendar
                localizer={localizer}
                events={staticEvents}
                defaultView={Views.MONTH}
                defaultDate={new Date(2025, 7, 1)}
                startAccessor='start'
                endAccessor='end'
                style={{ height: '100%' }}
                components={{
                  event: EventComponent, // custom pill-style renderer
                }}
                views={['month', 'week', 'day', 'agenda']}
              /> */}
            </Box>
          </Box>
        ) : (
          // List View (existing table)
          <div>
            <TableContainer
              sx={{
                minHeight: 575,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {session?.dataFetchLoading ? (
                <FuseLoading />
              ) : session?.data?.length ? (
                <Table
                  sx={{ minWidth: 650, height: '100%' }}
                  size='small'
                  aria-label='simple table'
                >
                  <TableHead className='bg-[#F8F8F8]'>
                    <TableRow>
                      <TableCell
                        align='left'
                        sx={{
                          width: '15rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Title
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{
                          width: '15rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Learners
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{
                          width: '15rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Trainer
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{
                          width: '15rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Location
                      </TableCell>
                      <TableCell align='left' sx={{ width: '15rem' }}>
                        Visit Date
                      </TableCell>
                      <TableCell align='left' sx={{ width: '10rem' }}>
                        Duration
                      </TableCell>
                      <TableCell align='center' sx={{ width: '20rem' }}>
                        Attended
                      </TableCell>
                      {/* <TableCell align="left" sx={{ width: "15rem" }}>
                      Type
                    </TableCell> */}
                      <TableCell align='left' sx={{ width: '15rem' }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {session?.data?.map((row) => (
                      <TableRow
                        key={row.title}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                        }}
                      >
                        <TableCell
                          component='th'
                          scope='row'
                          sx={{
                            borderBottom: '2px solid #F8F8F8',
                            width: '15rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row?.title}
                        </TableCell>
                        <TableCell
                          component='th'
                          scope='row'
                          sx={{
                            borderBottom: '2px solid #F8F8F8',
                            width: '15rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row?.learners
                            .map((learner) => learner.user_name)
                            .join(', ')}
                        </TableCell>
                        <TableCell
                          component='th'
                          scope='row'
                          sx={{
                            borderBottom: '2px solid #F8F8F8',
                            width: '15rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row?.trainer_id?.user_name}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '2px solid #F8F8F8',
                            width: '15rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row?.location}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '2px solid #F8F8F8',
                            width: '15rem',
                          }}
                        >
                          {formatDate(row?.startDate)}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '2px solid #F8F8F8',
                            width: '10rem',
                          }}
                        >
                          {row?.Duration}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '2px solid #F8F8F8',
                            width: '20rem',
                          }}
                        >
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
                                placeholder='Select funding body'
                                name='funding_body'
                                // error={true || userDataError?.funding_body}
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
                            sx={{
                              '.MuiAutocomplete-clearIndicator': {
                                color: '#5B718F',
                              },
                            }}
                            PaperComponent={({ children }) => (
                              <Paper style={{ borderRadius: '4px' }}>
                                {children}
                              </Paper>
                            )}
                          />
                        </TableCell>
                        {/* <TableCell
                        align="left"
                        sx={{
                          borderBottom: "2px solid #F8F8F8",
                          width: "15rem",
                        }}
                      >
                        {row?.type}
                      </TableCell> */}
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '2px solid #F8F8F8',
                            width: '15rem',
                          }}
                        >
                          <IconButton
                            size='small'
                            sx={{ color: '#5B718F', marginRight: '4px' }}
                            onClick={(e) => handleClick(e, row)}
                          >
                            <MoreHorizIcon fontSize='small' />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div
                  className='flex flex-col justify-center items-center gap-10 '
                  style={{ height: '94%' }}
                >
                  <DataNotFound width='25%' />
                  <Typography variant='h5'>No data found</Typography>
                  <Typography variant='body2' className='text-center'>
                    It is a long established fact that a reader will be <br />
                    distracted by the readable content.
                  </Typography>
                </div>
              )}
              <CustomPagination
                pages={session?.meta_data?.pages}
                page={session?.meta_data?.page}
                handleChangePage={handleChangePage}
                items={session?.meta_data?.items}
              />
            </TableContainer>
          </div>
        )}
        <AlertDialog
          open={Boolean(deleteId)}
          close={() => deleteIcon('')}
          title='Delete Session?'
          content='Deleting this ession will also remove all associated data and relationships. Proceed with deletion?'
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
            // disabled={data.role !== "Admin" && session?.singleData.status === "Closed"}
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
              borderRadius: '4px',
              width: '100%',
            },
          }}
        >
          <DialogContent className='p-0'>
            <NewSession edit={true} handleCloseDialog={handleCloseDialog} />
          </DialogContent>
          {/* <DialogActions>
          {session?.dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <>
              <SecondaryButtonOutlined
                onClick={handleCloseDialog}
                name="Cancel"
              />
              <SecondaryButton
                name={Object.keys(session?.singleData)?.length !== 0 ? "Edit" : "Save"}
              // onClick={
              //   Object.keys(session?.singleData)?.length !== 0
              //     ? handleUpdate
              //     : handleSubmit
              // }
              // disable={!isSupport}
              />
            </>
          )}
        </DialogActions> */}
        </Dialog>
      </Grid>
    </>
  )
}

export default Calendar
