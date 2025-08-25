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
import { useTheme } from '@mui/material/styles'
import { styled } from '@mui/material/styles'
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
import { useThemeColors, themeHelpers } from '../../utils/themeUtils'

// Styled Components
const ThemedPaper = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: themeHelpers.getShadow(theme, 2),
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 4),
  },
}))

const ThemedTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
}))

const ThemedTableHead = styled(TableHead)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  '& .MuiTableCell-head': {
    color: theme.palette.primary.contrastText,
    fontWeight: 600,
  },
}))

const ThemedTableCell = styled(TableCell)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.divider}`,
  color: theme.palette.text.primary,
  '&:hover': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.04),
  },
}))

const ThemedTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
}))

const ThemedFormControl = styled(FormControl)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    '& fieldset': {
      borderColor: theme.palette.divider,
    },
    '&:hover fieldset': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused fieldset': {
      borderColor: theme.palette.primary.main,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
    '&.Mui-focused': {
      color: theme.palette.primary.main,
    },
  },
  '& .MuiSelect-icon': {
    color: theme.palette.text.secondary,
  },
}))

const ThemedIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.08),
  },
  '&:active': {
    backgroundColor: themeHelpers.withOpacity(theme.palette.primary.main, 0.12),
  },
}))

const ThemedDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    borderRadius: theme.shape.borderRadius * 2,
    boxShadow: themeHelpers.getShadow(theme, 8),
  },
}))

const ThemedDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontWeight: 600,
}))

const ThemedDialogContent = styled(DialogContent)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}))

const ThemedDialogActions = styled(DialogActions)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  borderTop: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}))

const ThemedButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius * 1.5,
  textTransform: 'none',
  fontWeight: 600,
  boxShadow: themeHelpers.getShadow(theme, 1),
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 3),
  },
}))

const ThemedPrimaryButton = styled(ThemedButton)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}))

const ThemedSecondaryButton = styled(ThemedButton)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: theme.palette.secondary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.secondary.dark,
  },
}))

const ThemedTypography = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.primary,
}))

const ThemedBox = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
}))

const FundingBandList = () => {
  const theme = useTheme()
  const colors = useThemeColors()
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
    <ThemedBox p={3}>
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={3}>
        <ThemedTypography variant='h4' gutterBottom>
          Funding Bands
        </ThemedTypography>
        <ThemedPrimaryButton
          variant='contained'
          onClick={() => {
            setIsEditMode(false)
            setFormValues({ id: '', course_id: '', band_name: '', amount: '' })
            setOpenDialog(true)
          }}
        >
          Add Funding Band
        </ThemedPrimaryButton>
      </Box>

      {isLoading ? (
        <Box display='flex' justifyContent='center' mt={3}>
          <CircularProgress sx={{ color: colors.primary.main }} />
        </Box>  
      ) : (
          <ThemedTableContainer>
            <Table>
              <ThemedTableHead>
                <TableRow>
                  <ThemedTableCell>Course Name</ThemedTableCell>
                  <ThemedTableCell>Level</ThemedTableCell>
                  <ThemedTableCell>Amount (£)</ThemedTableCell>
                  <ThemedTableCell align='center'>Action</ThemedTableCell>
                </TableRow>
              </ThemedTableHead>
              <TableBody>
                {fundingBands.map((band: any) => (
                  <TableRow key={band.id}>
                    <ThemedTableCell>{band.course.course_name}</ThemedTableCell>
                    <ThemedTableCell>{band.course.level}</ThemedTableCell>
                    <ThemedTableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                        }}
                      >
                        £{band.amount}
                      </Typography>
                    </ThemedTableCell>
                    <ThemedTableCell align='center'>
                      <Tooltip title='Edit Funding Band'>
                        <ThemedIconButton
                          onClick={() => openEditDialog(band)}
                        >
                          <EditIcon />
                        </ThemedIconButton>
                      </Tooltip>
                    </ThemedTableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ThemedTableContainer>
      )}

      {/* Add Funding Band Dialog */}
      <ThemedDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth='sm'
        fullWidth
      >
        <ThemedDialogTitle>
          {isEditMode ? 'Edit Funding Band' : 'Add Funding Band'}
        </ThemedDialogTitle>
        <ThemedDialogContent
          sx={{ display: 'flex', flexDirection: 'column', gap: 3,}}
        >
          <ThemedFormControl
            fullWidth
            sx={{
              marginTop: 3,
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
          </ThemedFormControl>

          <ThemedTextField
            label='Amount (£)'
            type='number'
            value={formValues.amount}
            onChange={(e) =>
              setFormValues({ ...formValues, amount: e.target.value })
            }
            InputProps={{
              startAdornment: <Typography variant="body2" sx={{ mr: 1, color: colors.text.secondary }}>£</Typography>,
            }}
          />
        </ThemedDialogContent>
        <ThemedDialogActions>
          <ThemedSecondaryButton onClick={() => setOpenDialog(false)}>
            Cancel
          </ThemedSecondaryButton>
          <ThemedPrimaryButton
            onClick={handleAddOrUpdate}
            disabled={isSaving || isUpdating}
          >
            {isSaving || isUpdating ? <CircularProgress size={20} /> : 'Save'}
          </ThemedPrimaryButton>
        </ThemedDialogActions>
      </ThemedDialog>
    </ThemedBox>
  )
}

export default FundingBandList
