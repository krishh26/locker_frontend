import React, { useEffect, useState } from 'react'
import {
  Box,
  Button,
  Dialog,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import axios from 'axios'
import jsonData from 'src/url.json'
import { useUserId } from 'src/app/utils/userHelpers'
import type { SampleAction } from 'app/store/api/sample-plan-api'

const URL_BASE_LINK = jsonData.API_LOCAL_URL

export interface ActionFormData {
  action_with_id: string | number | ''
  action_required: string
  target_date: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Closed'
  assessor_feedback: string
}

interface ActionModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: ActionFormData) => Promise<void>
  planDetailId: string | number | null
  editingAction?: SampleAction | null
  isSaving?: boolean
}

const statusOptions: Array<'Pending' | 'In Progress' | 'Completed' | 'Closed'> = [
  'Pending',
  'In Progress',
  'Completed',
  'Closed',
]

export const ActionModal: React.FC<ActionModalProps> = ({
  open,
  onClose,
  onSave,
  planDetailId,
  editingAction,
  isSaving = false,
}) => {
  const iqaId = useUserId()
  const [formData, setFormData] = useState<ActionFormData>({
    action_with_id: '',
    action_required: '',
    target_date: '',
    status: 'Pending',
    assessor_feedback: '',
  })
  const [users, setUsers] = useState<Array<{ user_id: number; user_name: string; first_name: string; last_name: string }>>([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof ActionFormData, string>>>({})

  useEffect(() => {
    if (open) {
      fetchUsers()
      if (editingAction) {
        setFormData({
          action_with_id: editingAction.action_with.user_id,
          action_required: editingAction.action_required,
          target_date: editingAction.target_date ? formatDateForInput(editingAction.target_date) : '',
          status: editingAction.status,
          assessor_feedback: editingAction.assessor_feedback || '',
        })
      } else {
        setFormData({
          action_with_id: '',
          action_required: '',
          target_date: '',
          status: 'Pending',
          assessor_feedback: '',
        })
      }
      setErrors({})
    }
  }, [open, editingAction])

  const fetchUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await axios.get(`${URL_BASE_LINK}/user/list?page=1&limit=500&meta=true`)
      const userList = Array.isArray(response.data?.data)
        ? response.data.data.map((user: any) => ({
            user_id: user.user_id,
            user_name: user.user_name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            first_name: user.first_name || '',
            last_name: user.last_name || '',
          }))
        : []
      setUsers(userList)
    } catch (error) {
      console.error('Error fetching users:', error)
      setUsers([])
    } finally {
      setLoadingUsers(false)
    }
  }

  const formatDateForInput = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleChange = (field: keyof ActionFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ActionFormData, string>> = {}
    
    if (!formData.action_with_id) {
      newErrors.action_with_id = 'Please select an action with user'
    }
    if (!formData.action_required.trim()) {
      newErrors.action_required = 'Action required is required'
    } else if (formData.action_required.length > 1000) {
      newErrors.action_required = 'Action required must be 1000 characters or less'
    }
    if (!formData.target_date) {
      newErrors.target_date = 'Target date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) {
      return
    }

    try {
      await onSave(formData)
    } catch (error) {
      console.error('Error saving action:', error)
    }
  }

  const handleClose = () => {
    setFormData({
      action_with_id: '',
      action_required: '',
      target_date: '',
      status: 'Pending',
      assessor_feedback: '',
    })
    setErrors({})
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 600, color: '#1976d2' }}>
            Actions from sampling
          </Typography>
          <IconButton onClick={handleClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth size='small' error={!!errors.action_with_id}>
                <InputLabel>Action With Name</InputLabel>
                <Select
                  value={formData.action_with_id}
                  label='Action With Name'
                  onChange={(e) => handleChange('action_with_id', e.target.value)}
                  disabled={loadingUsers}
                >
                  {users.map((user) => (
                    <MenuItem key={user.user_id} value={user.user_id}>
                      {user.first_name} {user.last_name}
                    </MenuItem>
                  ))}
                </Select>
                {errors.action_with_id && (
                  <Typography variant='caption' color='error' sx={{ mt: 0.5, ml: 1.75 }}>
                    {errors.action_with_id}
                  </Typography>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant='body2' sx={{ mb: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>
                max 1000 characters
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                size='small'
                label='Action Required'
                value={formData.action_required}
                onChange={(e) => handleChange('action_required', e.target.value)}
                error={!!errors.action_required}
                helperText={errors.action_required}
                inputProps={{ maxLength: 1000 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                size='small'
                label='Action Target Date'
                type='date'
                value={formData.target_date}
                onChange={(e) => handleChange('target_date', e.target.value)}
                InputLabelProps={{ shrink: true }}
                error={!!errors.target_date}
                helperText={errors.target_date}
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth size='small'>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label='Status'
                  onChange={(e) => handleChange('status', e.target.value as ActionFormData['status'])}
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                size='small'
                label='Assessor Feedback'
                value={formData.assessor_feedback}
                onChange={(e) => handleChange('assessor_feedback', e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 1.5,
            p: 2.5,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Button
            variant='contained'
            onClick={handleClose}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#f44336',
              '&:hover': {
                bgcolor: '#d32f2f',
              },
            }}
          >
            Cancel / Close
          </Button>
          <Button
            variant='contained'
            onClick={handleSave}
            disabled={isSaving}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#4caf50',
              '&:hover': {
                bgcolor: '#388e3c',
              },
            }}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </Box>
      </Box>
    </Dialog>
  )
}

