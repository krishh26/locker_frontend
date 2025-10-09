import FuseLoading from '@fuse/core/FuseLoading'
import Close from '@mui/icons-material/Close'
import EditIcon from '@mui/icons-material/Edit'
import LockIcon from '@mui/icons-material/Lock'
import LockOpenIcon from '@mui/icons-material/LockOpen'
import SearchIcon from '@mui/icons-material/Search'
import VisibilityIcon from '@mui/icons-material/Visibility'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { showMessage } from 'app/store/fuse/messageSlice'
import { selectGlobalUser } from 'app/store/globalUser'
import { selectUser } from 'app/store/userSlice'
import 'formiojs/dist/formio.full.css'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import DataNotFound from 'src/app/component/Pages/dataNotFound'
import CustomPagination from 'src/app/component/Pagination/CustomPagination'
import {
  useGetAllSubmittedFormsQuery,
  useUnlockFormMutation,
  useLockFormMutation,
} from 'src/app/store/api/form-api'
import './style.css'

const SubmittedForms = () => {
  const user =
    JSON.parse(sessionStorage.getItem('learnerToken'))?.user ||
    useSelector(selectUser)?.data

  const [searchKeyword, setSearchKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [unlockDialogOpen, setUnlockDialogOpen] = useState(false)
  const [lockDialogOpen, setLockDialogOpen] = useState(false)
  const [selectedForm, setSelectedForm] = useState<any>(null)
  const [unlockReason, setUnlockReason] = useState('')
  const [lockReason, setLockReason] = useState('')
  const { pagination } = useSelector(selectGlobalUser)
  const dispatch: any = useDispatch()
  const navigate = useNavigate()

  // Fetch submitted forms using RTK Query
  const {
    data: formsData,
    isLoading,
    refetch,
  } = useGetAllSubmittedFormsQuery({
    page,
    page_size: pagination?.page_size || 10,
    search_keyword: searchKeyword,
  })

  const [unlockForm, { isLoading: isUnlocking }] = useUnlockFormMutation()
  const [lockForm, { isLoading: isLocking }] = useLockFormMutation()

  const handleView = (row: any) => {
    navigate(`/forms/view-saved-form/${row.form.id}/user/${row.user.user_id}`)
  }

  const handleEdit = (row: any) => {
    if (row.is_locked) {
      dispatch(
        showMessage({
          message:
            'This form is locked. Please unlock it first before editing.',
          variant: 'warning',
        })
      )
      return
    }
    navigate(`/forms/view-saved-form/${row.form.id}/user/${row.user.user_id}`)
  }

  const handleUnlockClick = (row: any) => {
    setSelectedForm(row)
    setUnlockReason('')
    setUnlockDialogOpen(true)
  }

  const handleLockClick = (row: any) => {
    setSelectedForm(row)
    setLockReason('')
    setLockDialogOpen(true)
  }

  const handleLockConfirm = async () => {
    try {
      await lockForm({
        formId: selectedForm.form.id,
        userId: selectedForm.user.user_id,
        reason: lockReason,
      }).unwrap()
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Failed to lock form. Please try again.',
          variant: 'error',
        })
      )
    }

    dispatch(
      showMessage({
        message: 'Form locked successfully!',
        variant: 'success',
      })
    )
    setLockDialogOpen(false)
    setSelectedForm(null)
    setLockReason('')
    refetch()
  }
  const handleUnlockConfirm = async () => {
    try {
      await unlockForm({
        formId: selectedForm.form.id,
        userId: selectedForm.user.user_id,
        reason: unlockReason,
      }).unwrap()

      dispatch(
        showMessage({
          message: 'Form unlocked successfully!',
          variant: 'success',
        })
      )
      setUnlockDialogOpen(false)
      setSelectedForm(null)
      setUnlockReason('')
      refetch()
    } catch (error) {
      dispatch(
        showMessage({
          message: 'Failed to unlock form. Please try again.',
          variant: 'error',
        })
      )
    }
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const formatDate = (date: string) => {
    if (!date) return ''
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const searchByKeyword = (e: any) => {
    if (e.key === 'Enter') {
      setPage(1)
      refetch()
    }
  }

  const searchHandler = (e: any) => {
    setSearchKeyword(e.target.value)
  }

  const searchAPIHandler = () => {
    setPage(1)
    refetch()
  }

  const clearSearch = () => {
    setSearchKeyword('')
    setPage(1)
  }

  return (
    <>
      <Grid className='m-10' sx={{ minHeight: 600 }}>
        {/* Header Section */}
        <Box
          className='flex justify-between pb-10'
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3,
          }}
        >
          <Typography variant='h5' fontWeight={600}>
            Submitted Forms
          </Typography>

          <Grid className='search_filed' sx={{ width: 400 }}>
            <TextField
              label='Search by form name, user, or email'
              fullWidth
              size='small'
              onKeyDown={searchByKeyword}
              onChange={searchHandler}
              value={searchKeyword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position='end'>
                    {searchKeyword ? (
                      <Close
                        onClick={clearSearch}
                        sx={{
                          color: '#5B718F',
                          fontSize: 18,
                          cursor: 'pointer',
                        }}
                      />
                    ) : (
                      <IconButton
                        id='dashboard-search-events-btn'
                        disableRipple
                        sx={{ color: '#5B718F' }}
                        onClick={searchAPIHandler}
                        size='small'
                      >
                        <SearchIcon fontSize='small' />
                      </IconButton>
                    )}
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Box>

        {/* Table Section */}
        <div>
          <TableContainer
            sx={{
              minHeight: 580,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            {isLoading ? (
              <FuseLoading />
            ) : formsData?.data?.length ? (
              <Table
                sx={{ minWidth: 650, height: '100%' }}
                size='small'
                aria-label='submitted forms table'
              >
                <TableHead className='bg-[#F8F8F8]'>
                  <TableRow>
                    <TableCell>Form Name</TableCell>
                    <TableCell align='left'>Type</TableCell>
                    <TableCell align='left'>User Name</TableCell>
                    <TableCell align='left'>Email</TableCell>
                    <TableCell align='left'>Status</TableCell>
                    <TableCell align='left'>Submit Date</TableCell>
                    <TableCell align='center'>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {formsData.data.map((row: any) => (
                    <TableRow
                      key={row.id}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell
                        component='th'
                        scope='row'
                        sx={{ borderBottom: '2px solid #F8F8F8' }}
                      >
                        <Typography variant='body2' fontWeight={500}>
                          {row?.form?.form_name}
                        </Typography>
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{ borderBottom: '2px solid #F8F8F8' }}
                      >
                        <Chip
                          label={row?.form?.type}
                          size='small'
                          color='primary'
                          variant='outlined'
                        />
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{ borderBottom: '2px solid #F8F8F8' }}
                      >
                        {row?.user?.user_name}
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{ borderBottom: '2px solid #F8F8F8' }}
                      >
                        {row?.user?.email}
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{ borderBottom: '2px solid #F8F8F8' }}
                      >
                        {row?.is_locked ? (
                          <Chip
                            icon={<LockIcon />}
                            label='Locked'
                            size='small'
                            color='error'
                            sx={{ fontWeight: 500 }}
                          />
                        ) : (
                          <Chip
                            icon={<LockOpenIcon />}
                            label='Unlocked'
                            size='small'
                            color='success'
                            sx={{ fontWeight: 500 }}
                          />
                        )}
                      </TableCell>
                      <TableCell
                        align='left'
                        sx={{ borderBottom: '2px solid #F8F8F8' }}
                      >
                        {formatDate(row?.created_at)}
                      </TableCell>
                      <TableCell
                        align='center'
                        sx={{ borderBottom: '2px solid #F8F8F8' }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            gap: 0.5,
                            justifyContent: 'center',
                          }}
                        >
                          <Tooltip title='View Form'>
                            <IconButton
                              size='small'
                              sx={{ color: '#1976d2' }}
                              onClick={() => handleView(row)}
                            >
                              <VisibilityIcon fontSize='small' />
                            </IconButton>
                          </Tooltip>

                          {!row?.is_locked && (
                            <Tooltip title='Lock Form'>
                              <IconButton
                                size='small'
                                sx={{ color: '#ed6c02' }}
                                onClick={() => handleLockClick(row)}
                              >
                                <LockIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          )}

                          {row?.is_locked && (
                            <Tooltip title='Unlock Form'>
                              <IconButton
                                size='small'
                                sx={{ color: '#2e7d32' }}
                                onClick={() => handleUnlockClick(row)}
                              >
                                <LockOpenIcon fontSize='small' />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div
                className='flex flex-col justify-center items-center gap-10'
                style={{ height: '94%' }}
              >
                <DataNotFound width='25%' />
                <Typography variant='h5'>No Forms Found</Typography>
                <Typography variant='body2' className='text-center'>
                  No submitted forms available at the moment.
                  <br />
                  Forms submitted by users will appear here.
                </Typography>
              </div>
            )}
            <CustomPagination
              pages={formsData?.meta_data?.pages || 0}
              page={formsData?.meta_data?.page || 1}
              handleChangePage={handleChangePage}
              items={formsData?.meta_data?.items || 0}
            />
          </TableContainer>
        </div>
      </Grid>

      {/* Unlock Dialog */}
      <Dialog
        open={unlockDialogOpen}
        onClose={() => setUnlockDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <LockOpenIcon color='warning' />
            <Typography variant='h6'>Unlock Form</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            You are about to unlock the form:{' '}
            <strong>{selectedForm?.form?.form_name}</strong> for user{' '}
            <strong>{selectedForm?.user?.user_name}</strong>
          </Typography>
          <TextField
            label='Reason for Unlocking'
            fullWidth
            multiline
            rows={3}
            value={unlockReason}
            onChange={(e) => setUnlockReason(e.target.value)}
            placeholder='Please provide a reason for unlocking this form...'
            required
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setUnlockDialogOpen(false)}
            variant='outlined'
            disabled={isUnlocking}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUnlockConfirm}
            variant='contained'
            color='warning'
            startIcon={isUnlocking ? null : <LockOpenIcon />}
          >
            {isUnlocking ? 'Unlocking...' : 'Unlock Form'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lock Dialog */}
      <Dialog
        open={lockDialogOpen}
        onClose={() => setLockDialogOpen(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          <Box display='flex' alignItems='center' gap={1}>
            <LockIcon color='warning' />
            <Typography variant='h6'>Lock Form</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
            You are about to lock the form:{' '}
            <strong>{selectedForm?.form?.form_name}</strong> for user{' '}
            <strong>{selectedForm?.user?.user_name}</strong>
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setLockDialogOpen(false)}
            variant='outlined'
            disabled={isLocking}
          >
            Cancel
          </Button>
          <Button
            onClick={handleLockConfirm}
            variant='contained'
            color='warning'
            disabled={isLocking}
            startIcon={isLocking ? null : <LockIcon />}
          >
            {isLocking ? 'Locking...' : 'Lock Form'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default SubmittedForms
