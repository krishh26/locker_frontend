import {
  Autocomplete,
  Card,
  Checkbox,
  Dialog,
  DialogContent,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Pagination,
  Select,
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
  Chip,
  useMediaQuery,
} from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import WorkIcon from '@mui/icons-material/Work'
import EventIcon from '@mui/icons-material/Event'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux'
import {
  DangerButton,
  LoadingButton,
  SecondaryButton,
  SecondaryButtonOutlined,
} from 'src/app/component/Buttons'
import NewTimeLog from './newTimeLog'
import {
  deleteTimeLogHandler,
  getTimeLogAPI,
  getTimeLogSliceData,
  getTimeLogSpendData,
  selectTimeLog,
  updateTimeLogAPI,
} from 'app/store/timeLog'
import { selectGlobalUser } from 'app/store/globalUser'
import FuseLoading from '@fuse/core/FuseLoading'
import DataNotFound from 'src/app/component/Pages/dataNotFound'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import AlertDialog from 'src/app/component/Dialogs/AlertDialog'
import CalendarComponent from './calendar'
import {
  getLearnerDetails,
  selectLearnerManagement,
} from 'app/store/learnerManagement'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import CustomPagination from 'src/app/component/Pagination/CustomPagination'
import { Link, useNavigate, useNavigationType } from 'react-router-dom'
import OffTheJobSummary from './OffTheJobSummary'

const TimeLog = (props) => {
  const dispatch: any = useDispatch()
  const navigate = useNavigate()
  const theme = useTheme()
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'))

  const { currentUser, selectedUser, selected } = useSelector(selectGlobalUser)
  const timeLog = useSelector(selectTimeLog)
  const { learner } = useSelector(selectLearnerManagement)
  const { pagination } = useSelector(selectGlobalUser)

  const [edit, setEdit] = useState('save')
  const [timeLogData, setTimeLogData] = useState({
    user_id: selected ? selectedUser?.user_id : currentUser?.user_id,
    course_id: null,
    activity_date: '',
    activity_type: '',
    unit: [],
    trainer_id: null,
    type: '',
    spend_time: '0:0',
    start_time: '0:0',
    end_time: '0:0',
    impact_on_learner: '',
    evidence_link: '',
  })

  const handleDataUpdate = (e) => {
    const { name, value } = e.target
    setTimeLogData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleCheckboxChange = async (e, row) => {
    const { checked } = e.target
    console.log(checked)
    await dispatch(updateTimeLogAPI({ id: row.id, verified: checked }))
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const [deleteId, setDeleteId] = useState('')
  const [selectedRow, setSelectedRow] = useState<any>(null)

  const handleClick = (event, row) => {
    setSelectedRow(row)
    setAnchorEl(event.currentTarget)
  }

  const handleEdit = (edit) => {
    setEdit(edit)
    // Handle unit as string (old data) or array (new data)
    const unitValue = selectedRow.unit
      ? Array.isArray(selectedRow.unit)
        ? selectedRow.unit
        : [selectedRow.unit]
      : []
    setTimeLogData({
      ...selectedRow,
      course_id: selectedRow.course_id.course_id,
      trainer_id: selectedRow.trainer_id.user_id,
      unit: unitValue,
    })
    handleClickOpen()
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const deleteIcon = (id) => {
    setDeleteId(selectedRow?.id)
    setSelectedRow(null)
  }

  const [filterData, setFilterData] = useState({
    courseId: '',
    jobType: '',
  })
  const [approvedFilter, setAprovedFilter] = useState('')

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    console.log(name, value)
    setFilterData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const deleteConfromation = async () => {
    await dispatch(deleteTimeLogHandler(deleteId))
    dispatch(
      getTimeLogAPI(
        { page: 1, page_size: pagination?.page_size },
        selected ? selectedUser?.user_id : currentUser?.user_id,
        filterData?.courseId,
        filterData?.jobType,
        approvedFilter
      )
    )
    setDeleteId('')
  }

  useEffect(() => {
    if (selected) {
      dispatch(
        getLearnerDetails(
          selected ? selectedUser?.learner_id : currentUser?.learner_id
        )
      )
    }
  }, [dispatch, selected])

  useEffect(() => {
    if (selectedUser?.user_id || currentUser?.user_id) {
      dispatch(
        getTimeLogAPI(
          { page: 1, page_size: pagination?.page_size },
          selected ? selectedUser?.user_id : currentUser?.user_id,
          filterData?.courseId,
          filterData?.jobType
        )
      )
    }
  }, [pagination])

  useEffect(() => {
    if (selectedUser?.user_id || currentUser?.user_id) {
      dispatch(
        getTimeLogAPI(
          { page: 1, page_size: pagination?.page_size },
          selected ? selectedUser?.user_id : currentUser?.user_id,
          filterData?.courseId,
          filterData?.jobType
        )
      )
      dispatch(
        getTimeLogSliceData(
          selected ? selectedUser?.user_id : currentUser?.user_id,
          filterData?.courseId,
          filterData?.jobType
        )
      )
      dispatch(
        getTimeLogSpendData(
          selected ? selectedUser?.user_id : currentUser?.user_id,
          filterData?.courseId,
          filterData?.jobType
        )
      )
    }
  }, [dispatch, filterData, selectedUser, selected])

  useEffect(() => {
    if (approvedFilter !== '') {
      dispatch(
        getTimeLogAPI(
          { page: 1, page_size: pagination?.page_size },
          selected ? selectedUser?.user_id : currentUser?.user_id,
          filterData?.courseId,
          filterData?.jobType,
          approvedFilter
        )
      )
    }
  }, [dispatch, approvedFilter])

  const [dialogType, setDialogType] = useState(false)

  const handleClickOpen = () => {
    setDialogType(true)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    dispatch(
      getTimeLogAPI(
        { page: newPage, page_size: pagination?.page_size },
        selected ? selectedUser?.user_id : currentUser?.user_id,
        filterData?.courseId,
        filterData?.jobType,
        approvedFilter
      )
    )
  }

  const handleCloseDialog = () => {
    setDialogType(false)
    setTimeLogData((prevState) => ({
      ...prevState,
      user_id: selected ? selectedUser?.user_id : currentUser?.user_id,
      course_id: null,
      activity_date: '',
      activity_type: '',
      unit: [],
      trainer_id: null,
      type: '',
      spend_time: '0:0',
      start_time: '0:0',
      end_time: '0:0',
      impact_on_learner: '',
      evidence_link: '',
    }))
  }

  const formatDate = (date) => {
    if (!date) return ''
    const formattedDate = date.substr(0, 10)
    return formattedDate
  }

  const [isCalendarView, setIsCalendarView] = useState(false)

  const handleToggleView = () => {
    setIsCalendarView(!isCalendarView)
  }
  const navigationType = useNavigationType()

  const handleBack = () => {
    navigate(-1)
  }

  return (
    <Box
      className='flex flex-col gap-20'
      sx={{
        minHeight: 600,
        width: '100%',
        px: { xs: 1.5, md: 3, lg: 5 },
        py: { xs: 1.5, md: 3 },
        gap: { xs: 3, md: 6 },
      }}
    >
      <Grid
        className='flex justify-between items-center'
        sx={{ flexDirection: { xs: 'column', md: 'row' }, gap: { xs: 1.5, md: 0 } }}
      >
        <Typography className='h3 font-500 '>
          Welcome, {selected ? selectedUser?.user_name : currentUser?.user_name}
        </Typography>
        <button
          onClick={handleBack}
          className='text-[#5b718f]'
          style={{ alignSelf: 'flex-end' }}
        >
          <KeyboardBackspaceIcon /> Back
        </button>
      </Grid>

      <hr style={{ borderBottom: '1px solid #ddd' }} />

      <Grid sx={{ width: '100%' }}>
        <Typography className='h2 font-500 '>
          Viewing E-Timelog for All Courses and General Activities
        </Typography>
      </Grid>

      <hr style={{ borderBottom: '1px solid #ddd' }} />

      <Box
        className='w-full pb-10'
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 5 },
          alignItems: { xs: 'flex-start', md: 'center' },
        }}
      >
        <Autocomplete
          disablePortal
          options={learner?.course}
          getOptionLabel={(option: any) => option.course?.course_name}
          size='small'
          fullWidth
          sx={{
            flex: 1,
            '.muiltr-hgpioi-MuiSvgIcon-root': {
              color: 'black',
            },
          }}
          renderInput={(params) => (
            <TextField {...params} label='Select Course' size='small' />
          )}
          onChange={(e, value) =>
            setFilterData((prevData) => ({
              ...prevData,
              courseId: value?.course?.course_id,
            }))
          }
        />
        <Typography className='font-600 mb-2 flex items-center  '>
          {' '}
          &lt; Change View by Course
        </Typography>
      </Box>
      <Box
        className='w-full pb-10'
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: 2, md: 5 },
          alignItems: { xs: 'flex-start', md: 'center' },
        }}
      >
        <TextField
          name='jobType'
          select
          label='Select Job Training'
          value={filterData?.jobType}
          size='small'
          fullWidth
          sx={{
            '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
              color: 'black',
            },
          }}
          onChange={handleFilterChange}
        >
          <MenuItem value={'All'}>All</MenuItem>
          <MenuItem value={'Not Applicable'}>Not Applicable</MenuItem>
          <MenuItem value={'On the job'}>On the job</MenuItem>
          <MenuItem value={'Off the job'}>Off the job</MenuItem>
        </TextField>
        <Typography className='font-600 mb-2 flex items-center  '>
          {' '}
          &lt; Change View by On/Off the Job Training
        </Typography>
      </Box>

      <Box className='flex' sx={{ width: '100%' }}>
        <Box
          className='flex gap-40'
          sx={{
            width: '100%',
            display: 'flex',
            flexWrap: 'wrap',
            gap: { xs: 2, md: 4 },
            justifyContent: 'space-between',
          }}
        >
          <Box
            className='rounded-4'
            sx={{ border: '1px solid #ddd', flex: '1 1 220px', minWidth: 220 }}
          >
            <Card
              className='rounded-4 p-10 bg-grey-200'
              sx={{ borderBottom: '1px solid #ddd' }}
            >
              <Typography className='h4 font-300'>This Week:</Typography>
            </Card>
            <Card className='rounded-4 p-20'>
              <Grid className='flex items-baseline gap-5'>
                <span className='h1 font-600'>
                  {timeLog?.timeLogspendData?.thisWeek?.split(':')[0]}
                </span>
                <span className='h5 font-600'>
                  : {timeLog?.timeLogspendData?.thisWeek?.split(':')[1]}
                </span>
              </Grid>
            </Card>
          </Box>
          <Box
            className='rounded-4'
            sx={{ border: '1px solid #ddd', flex: '1 1 220px', minWidth: 220 }}
          >
            <Card
              className='rounded-4 p-10 bg-grey-200'
              sx={{ borderBottom: '1px solid #ddd' }}
            >
              <Typography className='h4 font-300'>This Month:</Typography>
            </Card>
            <Card className='rounded-4 p-20'>
              <Grid className='flex items-baseline gap-5'>
                <span className='h1 font-600'>
                  {timeLog?.timeLogspendData?.thisMonth?.split(':')[0]}
                </span>
                <span className='h5 font-600'>
                  : {timeLog?.timeLogspendData?.thisMonth?.split(':')[1]}
                </span>
              </Grid>
            </Card>
          </Box>
          <Box
            className='rounded-4'
            sx={{ border: '1px solid #ddd', flex: '1 1 220px', minWidth: 220 }}
          >
            <Card
              className='rounded-4 p-10 bg-grey-200'
              sx={{ borderBottom: '1px solid #ddd' }}
            >
              <Typography className='h4 font-300'>Total:</Typography>
            </Card>
            <Card className='rounded-4 p-20'>
              <Grid className='flex items-baseline gap-5'>
                <span className='h1 font-600'>
                  {timeLog?.timeLogspendData?.total?.split(':')[0]}
                </span>
                <span className='h5 font-600'>
                  : {timeLog?.timeLogspendData?.total?.split(':')[1]}
                </span>
              </Grid>
            </Card>
          </Box>
        </Box>
      </Box>
      {/* Off the Job Summary Section */}
      <OffTheJobSummary courseId={filterData?.courseId || null} />
      
      {/* Recent Activity Section */}
      <Box className="w-full mb-20">
        {/* Header Card */}
        <Card 
          sx={{ 
            borderRadius: '8px 8px 0 0',
            border: '1px solid #ddd',
            borderBottom: 'none',
            background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.primary.light, 0.04)} 100%)`,
          }}
        >
          <Box sx={{ p: 2.5, display: 'flex', alignItems: 'center' }}>
            <EventIcon sx={{ color: theme.palette.primary.main, mr: 1.5, fontSize: '24px' }} />
            <Typography className="h4 font-600" sx={{ color: theme.palette.text.primary, fontSize: '1.333rem' }}>
              Recent Activity
            </Typography>
          </Box>
        </Card>

        {/* Table Card */}
        <Card sx={{ borderRadius: '0 0 8px 8px', border: '1px solid #ddd', borderTop: 'none' }}>
          <Box sx={{ p: 3 }}>
            <TableContainer 
              component={Box}
              sx={{ 
                borderRadius: 2,
                overflow: 'hidden',
                maxHeight: '600px',
                '&::-webkit-scrollbar': {
                  width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                  background: alpha(theme.palette.primary.main, 0.05),
                },
                '&::-webkit-scrollbar-thumb': {
                  background: alpha(theme.palette.primary.main, 0.2),
                  borderRadius: '4px',
                  '&:hover': {
                    background: alpha(theme.palette.primary.main, 0.3),
                  },
                },
              }}
            >
              <Table
                size="medium"
                sx={{
                  '& .MuiTableCell-root': {
                    fontSize: '15.33px',
                  },
                }}
              >
                <TableHead sx={{ backgroundColor: alpha(theme.palette.primary.main, 0.08) }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, py: 2, fontSize: '15.33px' }}>
                      Activity Type
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2, fontSize: '15.33px' }}>
                      On/Off the Job Training
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2, fontSize: '15.33px' }}>
                      Time Taken
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, py: 2, fontSize: '15.33px' }}>
                      Date
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {timeLog?.sliceData?.length > 0 ? (
                    timeLog.sliceData.map((row, index) => (
                      <TableRow
                        key={row.activityType || index}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.04),
                          },
                          transition: 'background-color 0.2s ease',
                        }}
                      >
                        <TableCell
                          sx={{
                            py: 2,
                            fontSize: '15.33px',
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <WorkIcon sx={{ fontSize: '18px', color: theme.palette.primary.main }} />
                            <Typography sx={{ fontSize: '15.33px' }}>
                              {row?.activity_type || '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2, fontSize: '15.33px' }}>
                          {row?.type ? (
                            <Chip
                              label={row.type}
                              size="small"
                              color={
                                row.type.toLowerCase().includes('off')
                                  ? 'warning'
                                  : row.type.toLowerCase().includes('on')
                                  ? 'success'
                                  : 'default'
                              }
                              sx={{
                                fontSize: '13.33px',
                                fontWeight: 500,
                                height: '28px',
                              }}
                            />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell sx={{ py: 2, fontSize: '15.33px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <AccessTimeIcon
                              sx={{
                                fontSize: '18px',
                                color: theme.palette.text.secondary,
                              }}
                            />
                            <Typography sx={{ fontSize: '15.33px', fontWeight: 500 }}>
                              {row?.spend_time || '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 2, fontSize: '15.33px' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarTodayIcon
                              sx={{
                                fontSize: '18px',
                                color: theme.palette.text.secondary,
                              }}
                            />
                            <Typography sx={{ fontSize: '15.33px' }}>
                              {formatDate(row?.activity_date) || '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                        <Typography sx={{ color: theme.palette.text.secondary, fontSize: '15.33px' }}>
                          No recent activity found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Card>
      </Box>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          gap: 2,
          m: { xs: 0, md: 2 },
          width: '100%',
        }}
      >
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <SecondaryButton
            name={
              isCalendarView ? 'Switch to List View' : 'Switch to Calendar View'
            }
            onClick={handleToggleView}
          />
        </Box>
        <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <SecondaryButton
            name='Add New Timelog Entry'
            onClick={() => handleClickOpen()}
          />
        </Box>
      </Box>

      {isCalendarView ? (
        <CalendarComponent />
      ) : (
        <>
          <Box
            className='w-full flex justify-end'
            sx={{ justifyContent: { xs: 'flex-start', md: 'flex-end' } }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: 600,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                ml: { xs: 0, md: 5 },
              }}
            >
              <Typography className='font-600 flex items-center'>
                Assessor Approved:
              </Typography>
              <TextField
                name='approved'
                select
                label='Select Assessor Approved'
                value={approvedFilter}
                size='small'
                fullWidth
                sx={{
                  '.muiltr-156t61m-MuiSvgIcon-root-MuiSelect-icon': {
                    color: 'black',
                  },
                }}
                onChange={(e) => setAprovedFilter(e.target.value)}
              >
                <MenuItem value={'All'}>All</MenuItem>
                <MenuItem value={'true'}>Approved</MenuItem>
                <MenuItem value={'false'}>Not Approved</MenuItem>
              </TextField>
            </Box>
          </Box>
          <Box sx={{ width: '100%', mt: { xs: 2, md: 4 } }}>
            <TableContainer
              sx={{
                maxHeight: '100%',
                marginBottom: '2rem',
                overflowX: 'auto',
                borderRadius: 2,
                border: '1px solid #eee',
              }}
            >
              {timeLog?.dataFetchLoading ? (
                <FuseLoading />
              ) : timeLog?.data?.length ? (
                <Table
                  sx={{
                    minWidth: isSmallScreen ? 900 : 650,
                    height: '100%',
                  }}
                  size='small'
                  aria-label='simple table'
                >
                  <TableHead
                    className='bg-[#F8F8F8]'
                    sx={{ borderBottom: '3px solid #ddd' }}
                  >
                    <TableRow>
                      <TableCell
                        align='left'
                        sx={{
                          maxWidth: '9rem',
                          overflow: 'hidden',
                          textOverflow: 'inherit',
                          // whiteSpace: "nowrap",
                        }}
                      >
                        Activity Type
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{
                          maxWidth: '9rem',
                          overflow: 'hidden',
                          textOverflow: 'inherit',
                          // textOverflow: "ellipsis",
                          // whiteSpace: "nowrap",
                        }}
                      >
                        Course / Unit
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{
                          maxWidth: '9rem',
                          overflow: 'hidden',
                          textOverflow: 'inherit',
                          // textOverflow: "ellipsis",
                          // whiteSpace: "nowrap",
                        }}
                      >
                        Trainer
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{
                          maxWidth: '9rem',
                          overflow: 'hidden',
                          textOverflow: 'inherit',
                          // textOverflow: "ellipsis",
                          // whiteSpace: "nowrap",
                        }}
                      >
                        Time Spent
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{
                          maxWidth: '9rem',
                          overflow: 'hidden',
                          textOverflow: 'inherit',
                          // textOverflow: "ellipsis",
                          // whiteSpace: "nowrap",
                        }}
                      >
                        Activity Start Time
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{
                          maxWidth: '9rem',
                          overflow: 'hidden',
                          textOverflow: 'inherit',
                          // textOverflow: "ellipsis",
                          // whiteSpace: "nowrap",
                        }}
                      >
                        On/Off the Job Training
                      </TableCell>
                      <TableCell align='left' sx={{ width: '20rem' }}>
                        Approved
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{
                          maxWidth: '9rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        Comment
                      </TableCell>
                      <TableCell align='left' sx={{ width: '15rem' }}>
                        Date
                      </TableCell>
                      <TableCell align='left' sx={{ width: '5rem' }}>
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {timeLog?.data?.map((row) => (
                      <TableRow
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          borderBottom: '1px solid #ddd',
                        }}
                      >
                        <TableCell
                          component='th'
                          scope='row'
                          sx={{
                            borderBottom: '1px solid #ddd',
                            maxWidth: '9rem',
                            overflow: 'hidden',
                            textOverflow: 'inherit',
                            // textOverflow: "ellipsis",
                            // whiteSpace: "nowrap",
                          }}
                        >
                          {row?.activity_type}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '1px solid #ddd',
                            maxWidth: '9rem',
                            overflow: 'hidden',
                            textOverflow: 'inherit',
                            // textOverflow: "ellipsis",
                            // whiteSpace: "nowrap",
                          }}
                        >
                          {row?.course_id?.course_name}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            width: '15rem',
                            overflow: 'hidden',
                            textOverflow: 'inherit',
                            borderBottom: '1px solid #ddd',
                            // textOverflow: "ellipsis",
                            // whiteSpace: "nowrap"
                          }}
                        >
                          {row?.trainer_id?.user_name}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '1px solid #ddd',
                            width: '15rem',
                          }}
                        >
                          {row?.spend_time}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '1px solid #ddd',
                            width: '15rem',
                          }}
                        >
                          {row?.start_time}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '1px solid #ddd',
                            width: '15rem',
                          }}
                        >
                          {row?.type}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '1px solid #ddd',
                            width: '20rem',
                          }}
                        >
                          {row?.trainer_id?.user_id === currentUser?.user_id &&
                          currentUser?.role === 'Trainer' ? (
                            <>
                              <Checkbox
                                checked={row?.verified}
                                onChange={(e) => handleCheckboxChange(e, row)}
                                name='declaration'
                                // color="primary"
                                sx={{
                                  color: row?.verified ? 'green' : 'default', // Change color when checked
                                  '&.Mui-checked': {
                                    color: 'green',
                                  },
                                }}
                              />{' '}
                              Assessor
                            </>
                          ) : row?.verified ? (
                            'Approved'
                          ) : (
                            'Not Approved'
                          )}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '1px solid #ddd',
                            width: '15rem',
                          }}
                        >
                          {row?.impact_on_learner}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{
                            borderBottom: '1px solid #ddd',
                            width: '15rem',
                          }}
                        >
                          {formatDate(row?.activity_date)}
                        </TableCell>
                        <TableCell
                          align='left'
                          sx={{ borderBottom: '1px solid #ddd', width: '5rem' }}
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
                pages={timeLog?.meta_data?.pages}
                page={timeLog?.meta_data?.page}
                handleChangePage={handleChangePage}
                items={timeLog?.meta_data?.items}
              />
            </TableContainer>
          </Box>
        </>
      )}

      <AlertDialog
        open={Boolean(deleteId)}
        close={() => deleteIcon('')}
        title='Delete Time Log?'
        content='Deleting this time log will also remove all associated data and relationships. Proceed with deletion?'
        className='-224 '
        actionButton={
          timeLog?.dataUpdatingLoadding ? (
            <LoadingButton />
          ) : (
            <DangerButton onClick={deleteConfromation} name='Delete Time Log' />
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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleEdit('edit')
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
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '4px',
            width: '100%',
          },
        }}
      >
        <NewTimeLog
          edit={edit}
          handleCloseDialog={handleCloseDialog}
          timeLogData={timeLogData}
          setTimeLogData={setTimeLogData}
          handleDataUpdate={handleDataUpdate}
          filterData={filterData}
        />
      </Dialog>
    </Box>
  )
}
export default TimeLog
