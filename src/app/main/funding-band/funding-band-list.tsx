'use client'

import { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  IconButton,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import {
  useAddFundingBandMutation,
  useGetFundingBandsQuery,
  useUpdateFundingBandMutation,
} from 'app/store/api/funding-band-api'
import {
  fetchCourseAPI,
  selectCourseManagement,
} from 'app/store/courseManagement'
import { useDispatch } from 'react-redux'
import { useSelector } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'

const FundingBandList = () => {
  const dispatch: any = useDispatch()
  const { data, isLoading } = useGetFundingBandsQuery({},{
    refetchOnMountOrArgChange: true
  })
  const { data: coursesData, dataFetchLoading } = useSelector(
    selectCourseManagement
  )
  const [addFundingBand, { isLoading: isSaving }] = useAddFundingBandMutation()
  const [updateFundingBand, { isLoading: isUpdating }] =
    useUpdateFundingBandMutation()

  const fundingBands = data?.data || []

  const [openDialog, setOpenDialog] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [formValues, setFormValues] = useState({
    id: '',
    course_id: '',
    band_name: '',
    amount: '',
  })

  const fetchCourse = (a = '', page = 1, coreType = '') => {
    dispatch(fetchCourseAPI({ page, page_size: 100 }, a, '', coreType))
  }

  useEffect(() => {
    fetchCourse()
  }, [dispatch])

  const handleAddOrUpdate = async () => {
    if (!formValues.course_id || !formValues.amount) {
      dispatch(
        showMessage({
          message: 'Please fill all the required fields',
          variant: 'error',
        })
      )
      return
    }
    try {
      if (isEditMode) {
        await updateFundingBand({
          id: formValues.id,
          amount: Number(formValues.amount),
        }).unwrap()
        dispatch(
          showMessage({
            message: 'Funding band updated successfully',
            variant: 'success',
          })
        )
      } else {
        await addFundingBand({
          course_id: Number(formValues.course_id),
          band_name: formValues.band_name,
          amount: Number(formValues.amount),
        }).unwrap()
        dispatch(
          showMessage({
            message: 'Funding band added successfully',
            variant: 'success',
          })
        )
      }
      setOpenDialog(false)
      setIsEditMode(false)
      setFormValues({ id: '', course_id: '', band_name: '', amount: '' })
    } catch (err) {
      console.error('Error saving funding band', err)
      dispatch(
        showMessage({
          message: 'Error saving funding band',
          variant: 'error',
        })
      )
    }
  }

  const openEditDialog = (band: any) => {
    setIsEditMode(true)
    setFormValues({
      id: band.id,
      course_id: band.course.course_id,
      band_name: band.course.course_name,
      amount: band.amount,
    })
    setOpenDialog(true)
  }

  return (
    <Box p={3}>
      <Box display='flex' justifyContent='space-between' alignItems='center'>
        <Typography variant='h4' gutterBottom>
          Funding Bands
        </Typography>
        <Button
          variant='contained'
          color='primary'
          onClick={() => {
            setIsEditMode(false)
            setFormValues({ id: '', course_id: '', band_name: '', amount: '' })
            setOpenDialog(true)
          }}
        >
          Add Funding Band
        </Button>
      </Box>

      {isLoading ? (
        <Box display='flex' justifyContent='center' mt={3}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course Name</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Credits</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell align='center'>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fundingBands.map((band: any) => (
                <TableRow key={band.id}>
                  <TableCell>{band.course.course_name}</TableCell>
                  <TableCell>{band.course.level}</TableCell>
                  <TableCell>{band.course.total_credits}</TableCell>
                  <TableCell>{band.amount}</TableCell>
                  <TableCell align='center'>
                    <Tooltip title='Edit Funding Band'>
                      <IconButton
                        color='primary'
                        onClick={() => openEditDialog(band)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Funding Band Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle>
          {isEditMode ? 'Edit Funding Band' : 'Add Funding Band'}
        </DialogTitle>
        <DialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}
        >
          <FormControl
            fullWidth
            sx={{
              mt: 2,
            }}
          >
            <InputLabel>Select Course</InputLabel>
            <Select
              value={formValues.course_id}
              label='Select Course'
              onChange={(e) => {
                const course = coursesData.find(
                  (c: any) => c.course_id === e.target.value
                )
                setFormValues({
                  ...formValues,
                  course_id: e.target.value,
                  band_name: course?.course_name,
                })
              }}
              disabled={isEditMode}
            >
              {dataFetchLoading ? (
                <MenuItem disabled>Loading...</MenuItem>
              ) : (
                coursesData.map((course: any) => (
                  <MenuItem key={course.course_id} value={course.course_id}>
                    {course.course_name} (Code: {course.course_code})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>

          <TextField
            label='Amount'
            type='number'
            value={formValues.amount}
            onChange={(e) =>
              setFormValues({ ...formValues, amount: e.target.value })
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant='contained'
            onClick={handleAddOrUpdate}
            disabled={isSaving || isUpdating}
          >
            {isSaving || isUpdating ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default FundingBandList
