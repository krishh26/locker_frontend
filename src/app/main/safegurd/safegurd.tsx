import EditIcon from '@mui/icons-material/Edit'
import EmailIcon from '@mui/icons-material/Email'
import InfoIcon from '@mui/icons-material/Info'
import PhoneIcon from '@mui/icons-material/Phone'
import SaveIcon from '@mui/icons-material/Save'
import SecurityIcon from '@mui/icons-material/Security'
import {
  Alert,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  Snackbar,
  TextField,
  Typography,
  useTheme
} from '@mui/material'
import {
  SafeguardingContact,
  useGetSafeguardingContactsQuery,
  useSaveSafeguardingContactMutation,
} from 'app/store/api/safeguarding-api'
import React, { useEffect, useState } from 'react'

const Safeguarding = () => {
  const theme = useTheme()
  // API hooks
  const {
    data: contactsData,
    isLoading: isLoadingContacts,
    error: contactsError,
    refetch: refetchContacts,
  } = useGetSafeguardingContactsQuery()

  const [saveContact, { isLoading: isSaving }] =
    useSaveSafeguardingContactMutation()

  // Local state
  const [formData, setFormData] = useState({
    telNumber: '',
    mobileNumber: '',
    emailAddress: '',
    additionalInfo: '',
  })

  const [editingContact, setEditingContact] =
    useState<SafeguardingContact | null>(null)
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'warning' | 'info',
  })

  // Load existing contact data when available
  useEffect(() => {
    if (contactsData?.data && contactsData.data.length > 0) {
      const contact = contactsData.data[0] // Use first contact if multiple exist
      setFormData({
        telNumber: contact.telNumber || '',
        mobileNumber: contact.mobileNumber || '',
        emailAddress: contact.emailAddress || '',
        additionalInfo: contact.additionalInfo || '',
      })
      setEditingContact(contact)
    }
  }, [contactsData])

  const handleInputChange =
    (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [field]: event.target.value,
      })
    }

  const handleSave = async () => {
    try {
      // Use the same API endpoint for both create and update
      await saveContact(formData).unwrap()
      setSnackbar({
        open: true,
        message: 'Safeguarding contact saved successfully!',
        severity: 'success',
      })
      refetchContacts()
    } catch (error: any) {
      console.error('Error saving data:', error)
      setSnackbar({
        open: true,
        message: error?.data?.message || 'Error saving data. Please try again.',
        severity: 'error',
      })
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const isLoading = isSaving

  // Show loading state
  // if (isLoadingContacts) {
  //   return (
  //     <Box sx={{
  //       display: 'flex',
  //       justifyContent: 'center',
  //       alignItems: 'center',
  //       minHeight: '400px',
  //       flexDirection: 'column',
  //       gap: 2
  //     }}>
  //       <CircularProgress size={40} />
  //       <Typography variant="body1" color="text.secondary">
  //         Loading safeguarding contacts...
  //       </Typography>
  //     </Box>
  //   );
  // }

  // // Show error state
  // if (contactsError) {
  //   return (
  //     <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
  //       <Alert severity="error" sx={{ mb: 3 }}>
  //         Failed to load safeguarding contacts. Please try again.
  //       </Alert>
  //       <Button
  //         variant="outlined"
  //         onClick={() => refetchContacts()}
  //         sx={{ mt: 2 }}
  //       >
  //         Retry
  //       </Button>
  //     </Box>
  //   );
  // }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3 },
        maxWidth: 1200,
        margin: '0 auto',
        background: `linear-gradient(135deg, ${alpha(
          theme.palette.primary.main,
          0.05
        )} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        minHeight: '100vh',
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2,
          }}
        >
          <SecurityIcon
            sx={{
              fontSize: 40,
              color: theme.palette.primary.main,
              background: alpha(theme.palette.primary.main, 0.1),
              borderRadius: '50%',
              p: 1,
            }}
          />
          <Box>
            <Typography
              variant='h4'
              sx={{
                fontWeight: 'bold',
                color: theme.palette.text.primary,
                mb: 0.5,
              }}
            >
              Safeguarding Contact Management
            </Typography>
            <Typography variant='body1' color='text.secondary'>
              Manage safeguarding officer contact information and additional
              details
            </Typography>
          </Box>
        </Box>

        {editingContact && (
          <Chip
            icon={<EditIcon />}
            label='Editing existing contact'
            color='primary'
            variant='outlined'
            sx={{ mb: 2 }}
          />
        )}
      </Box>

      {/* Main Content */}
      <Grid container spacing={4}>
        {/* Contact Information Card */}
        <Grid item xs={12} lg={8}>
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              overflow: 'hidden',
              background: theme.palette.background.paper,
              boxShadow: `0 4px 20px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                }}
              >
                <PhoneIcon color='primary' />
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Contact Information
                </Typography>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Telephone Number'
                    placeholder='+44 20 1234 5678'
                    value={formData.telNumber}
                    onChange={handleInputChange('telNumber')}
                    variant='outlined'
                    InputProps={{
                      startAdornment: (
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label='Mobile Number'
                    placeholder='+44 7700 900123'
                    value={formData.mobileNumber}
                    onChange={handleInputChange('mobileNumber')}
                    variant='outlined'
                    InputProps={{
                      startAdornment: (
                        <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label='Email Address'
                    placeholder='safeguarding@example.com'
                    value={formData.emailAddress}
                    onChange={handleInputChange('emailAddress')}
                    variant='outlined'
                    type='email'
                    InputProps={{
                      startAdornment: (
                        <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />
                      ),
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        '&:hover fieldset': {
                          borderColor: theme.palette.primary.main,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Additional Information Card */}
        <Grid item xs={12} lg={4}>
          <Card
            elevation={0}
            sx={{
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              overflow: 'hidden',
              background: theme.palette.background.paper,
              boxShadow: `0 4px 20px ${alpha(
                theme.palette.common.black,
                0.08
              )}`,
              height: 'fit-content',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                }}
              >
                <InfoIcon color='primary' />
                <Typography variant='h6' sx={{ fontWeight: 600 }}>
                  Additional Information
                </Typography>
              </Box>

              <TextField
                fullWidth
                multiline
                rows={8}
                label='Additional Details'
                placeholder='Available 24/7 for urgent safeguarding concerns'
                value={formData.additionalInfo}
                onChange={handleInputChange('additionalInfo')}
                variant='outlined'
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: theme.palette.primary.main,
                      borderWidth: 2,
                    },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 4,
          p: 3,
          background: theme.palette.background.paper,
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: `0 2px 10px ${alpha(theme.palette.common.black, 0.05)}`,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* Delete functionality removed as per requirements */}
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant='outlined'
            onClick={() => {
              setFormData({
                telNumber: '',
                mobileNumber: '',
                emailAddress: '',
                additionalInfo: '',
              })
              setEditingContact(null)
            }}
            disabled={isLoading}
          >
            Reset
          </Button>

          <Button
            variant='contained'
            startIcon={
              isLoading ? (
                <CircularProgress size={20} color='inherit' />
              ) : (
                <SaveIcon />
              )
            }
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Contact'}
          </Button>
        </Box>
      </Box>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            borderRadius: 2,
            boxShadow: `0 4px 20px ${alpha(theme.palette.common.black, 0.15)}`,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Safeguarding
