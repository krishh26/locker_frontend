import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TextField,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Collapse,
  Divider,
} from '@mui/material'
import {
  ExpandMore,
  ExpandLess,
  Close,
  Search,
  Add,
  CheckCircle,
  RadioButtonUnchecked,
} from '@mui/icons-material'
import { Snackbar, Alert } from '@mui/material'
import { useThemeColors, themeHelpers } from '../../utils/themeUtils'
import { useTheme } from '@mui/material/styles'
import FuseLoading from '@fuse/core/FuseLoading'
import {
  useCurrentUser,
  useUserRole,
  useLearnerUserId,
} from '../../utils/userHelpers'
import {
  usePendingSignatureListQuery,
  useSaveSignatureMutation,
} from 'app/store/api/evidence-api'

// API Integration for DocsToSign

interface SignatureModalProps {
  open: boolean
  onClose: () => void
  document: any
  onSave: (signatures: any) => void
}

const SignatureModal: React.FC<SignatureModalProps> = ({
  open,
  onClose,
  document,
  onSave,
}) => {
  const colors = useThemeColors()
  const theme = useTheme()
  const userRole = useUserRole()
  const [signatures, setSignatures] = useState(document?.signatures || {})
  const [saveSignature, { isLoading: isSaving }] = useSaveSignatureMutation()

  useEffect(() => {
    if (document) {
      setSignatures(document.signatures || {})
    }
  }, [document])

  const handleSignatureChange = (role: string, field: string, value: any) => {
    setSignatures((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [field]: value,
      },
    }))
  }

  const handleSave = async () => {
    try {
      // Find all signatures that were just signed by the current user
      const signedRoles = Object.keys(signatures).filter((roleKey) => {
        const signature = signatures[roleKey]
        return signature.signed && canSignForRole(roleKey)
      })

      if (signedRoles.length > 0 && document?.id) {
        // Save each signature
        for (const roleKey of signedRoles) {
          await saveSignature({
            id: document.id,
            data: { role: roleKey.charAt(0).toUpperCase() + roleKey.slice(1) },
          }).unwrap()
        }

        onSave(signatures)
        onClose()
      } else {
        // No valid signatures to save
        onClose()
      }
    } catch (error) {
      console.error('Error saving signature:', error)
      // You might want to show an error message to the user here
    }
  }

  // Check if current user can sign for a specific role
  const canSignForRole = (roleKey: string) => {
    switch (roleKey) {
      case 'employer':
        return ['Employer'].includes(userRole)
      case 'iqa':
        return ['IQA', 'LIQA'].includes(userRole)
      case 'trainer':
        return ['Trainer'].includes(userRole)
      case 'learner':
        return ['Learner'].includes(userRole)
      default:
        return false
    }
  }

  // Check if the field should be disabled
  const isFieldDisabled = (roleKey: string, field: string) => {
    if (!canSignForRole(roleKey)) {
      return true
    }

    // If it's already signed, disable editing

    return false
  }

  // Get signature roles that are requested for this document
  const getSignatureRoles = () => {
    if (!document?.requestedSignatures) return []

    return document.requestedSignatures.map((reqSig: any) => ({
      key: reqSig.role.toLowerCase(),
      label: reqSig.role,
      isRequested: reqSig.is_requested,
    }))
  }

  const signatureRoles = getSignatureRoles()

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '12px',
          backgroundColor: colors.background.paper,
          color: colors.text.primary,
          boxShadow: themeHelpers.getShadow(theme, 4),
        },
      }}
    >
      <DialogTitle
        sx={{
          backgroundColor: colors.primary.main,
          color: colors.primary.contrastText,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 24px',
          borderRadius: '12px 12px 0 0',
        }}
      >
        <Typography variant='h6' sx={{ fontWeight: 600 }}>
          Document Signature Agreement
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{ color: colors.primary.contrastText }}
        >
          <Close />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ padding: '24px' }}>
        {/* User Role Information */}
        {document && (
          <Box sx={{ mb: 3, mt: 3 }}>
            <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
              Document: {document.documentName}
            </Typography>
            <Typography variant='body2' color='text.secondary'>
              Course: {document.courseName}
            </Typography>
          </Box>
        )}

        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '8px',
            border: `1px solid ${colors.divider}`,
            boxShadow: 'none',
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: colors.primary.main }}>
                <TableCell
                  sx={{ fontWeight: 600, color: colors.primary.contrastText }}
                >
                  Signed in Agreement
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, color: colors.primary.contrastText }}
                >
                  Name
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, color: colors.primary.contrastText }}
                >
                  Signed
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 600, color: colors.primary.contrastText }}
                >
                  Date
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {signatureRoles.map((role) => {
                const signature = signatures[role.key] || {}

                const isSigned = document?.signatures[role.key]?.signed

                return (
                  <TableRow
                    key={role.key}
                    sx={{
                      '&:hover': { backgroundColor: colors.background.default },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {role.label}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {signature.name}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={signature.signed || false}
                              onChange={(e) =>
                                handleSignatureChange(
                                  role.key,
                                  'signed',
                                  e.target.checked
                                )
                              }
                              disabled={
                                isFieldDisabled(role.key, 'signed') || isSigned
                              }
                            />
                          }
                          label=''
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant='body2' color='text.secondary'>
                        {signature.date || ''}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ padding: '16px 24px', gap: 2 }}>
        <Button
          onClick={onClose}
          variant='outlined'
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          Cancel/Close
        </Button>
        <Button
          onClick={handleSave}
          variant='contained'
          disabled={isSaving}
          sx={{
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 3,
            py: 1,
          }}
        >
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const DocsToSign: React.FC = () => {
  const colors = useThemeColors()
  const theme = useTheme()
  const currentUser = useCurrentUser()
  const learnerUserId = useLearnerUserId()
  const [searchKeyword, setSearchKeyword] = useState('')
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [signatureModalOpen, setSignatureModalOpen] = useState(false)
  const [notification, setNotification] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error' | 'warning' | 'info'
  }>({ open: false, message: '', severity: 'success' })

  // API call for pending signatures
  const {
    data: pendingSignatureData,
    isLoading,
    isError,
    error,
    refetch,
  } = usePendingSignatureListQuery({ id: learnerUserId })

  // Transform API data to component format
  const transformApiData = (apiData: any) => {
    if (!apiData?.data) return []

    return apiData.data.map((item: any) => ({
      id: item.assignment_id,
      courseName: item.course_name,
      type: item.type || 'Evidence',
      dateUploaded: item.assignment_created_at,
      documentName: item.assignment_name,
      uploadedBy:
        currentUser?.displayName ||
        `${currentUser?.first_name} ${currentUser?.last_name}`,
      signatures: {
        employer: {
          signed:
            item.signatures?.find((s: any) => s.role === 'Employer')
              ?.is_signed || false,
          name:
            item.signatures?.find((s: any) => s.role === 'Employer')?.name ||
            '',
          date:
            item.signatures?.find((s: any) => s.role === 'Employer')
              ?.signed_at || '',
        },
        iqa: {
          signed:
            item.signatures?.find((s: any) => s.role === 'IQA')?.is_signed ||
            false,
          name: item.signatures?.find((s: any) => s.role === 'IQA')?.name || '',
          date:
            item.signatures?.find((s: any) => s.role === 'IQA')?.signed_at ||
            '',
        },
        trainer: {
          signed:
            item.signatures?.find((s: any) => s.role === 'Trainer')
              ?.is_signed || false,
          name:
            item.signatures?.find((s: any) => s.role === 'Trainer')?.name || '',
          date:
            item.signatures?.find((s: any) => s.role === 'Trainer')
              ?.signed_at || '',
        },
        learner: {
          signed:
            item.signatures?.find((s: any) => s.role === 'Learner')
              ?.is_signed || false,
          name:
            item.signatures?.find((s: any) => s.role === 'Learner')?.name || '',
          date:
            item.signatures?.find((s: any) => s.role === 'Learner')
              ?.signed_at || '',
        },
      },
      // Store the requested signatures for filtering
      requestedSignatures:
        item.signatures?.filter((s: any) => s.is_requested) || [],
      sessionDateTime: 'N/A',
    }))
  }

  const handleSignDocument = (document: any) => {
    setSelectedDocument(document)
    setSignatureModalOpen(true)
  }

  const handleSaveSignatures = async (signatures: any) => {
    // Refresh the data after saving
    try {
      await refetch()
      setNotification({
        open: true,
        message: 'Signature saved successfully!',
        severity: 'success',
      })
    } catch (error) {
      console.error('Error refreshing data:', error)
      setNotification({
        open: true,
        message: 'Error saving signature',
        severity: 'error',
      })
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'N/A') return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getSignatureStatus = (signatures: any, requestedSignatures: any) => {
    const signedRoles = []

    // Only show signatures that are requested and signed
    requestedSignatures?.forEach((reqSig: any) => {
      const signature = signatures[reqSig.role.toLowerCase()]
      if (signature?.signed) {
        signedRoles.push(reqSig.role)
      }
    })

    return signedRoles
  }

  if (isLoading) {
    return <FuseLoading />
  }

  const documents = transformApiData(pendingSignatureData)
  console.log("🚀 ~ DocsToSign ~ documents:", documents)

  return (
    <Grid>
      <Card
        className='m-12 rounded-6'
        sx={{
          backgroundColor: colors.background.paper,
          color: colors.text.primary,
          boxShadow: themeHelpers.getShadow(theme, 2),
        }}
      >
        <div className='w-full h-full'>
          <div className='p-24'>
            {/* Header Section */}
            <Typography
              variant='h4'
              className='font-600 mb-12'
              sx={{ color: colors.text.primary }}
            >
              Learners Documents to sign
            </Typography>

            {/* Search Section */}
            {/* <Box sx={{ mb: 3 }}>
              <TextField
                label='Search documents'
                fullWidth
                size='small'
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position='end'>
                      <Search sx={{ color: colors.text.secondary }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />
            </Box> */}

            {/* Documents Table */}
            <TableContainer
              component={Paper}
              sx={{
                borderRadius: '8px',
                boxShadow: themeHelpers.getShadow(theme, 1),
                border: `1px solid ${colors.divider}`,
              }}
            >
              <Table sx={{ minWidth: 650 }} aria-label='documents table'>
                <TableHead>
                  <TableRow sx={{ backgroundColor: colors.primary.main }}>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: colors.primary.contrastText,
                      }}
                    >
                      Course Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: colors.primary.contrastText,
                      }}
                    >
                      Type
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: colors.primary.contrastText,
                      }}
                    >
                      Date Uploaded
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: colors.primary.contrastText,
                      }}
                    >
                      Document Name
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: colors.primary.contrastText,
                      }}
                    >
                      Uploaded By
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: colors.primary.contrastText,
                      }}
                    >
                      Signed in Agreement
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: colors.primary.contrastText,
                      }}
                    >
                      Session Date/Time
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        color: colors.primary.contrastText,
                      }}
                    >
                      Action
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {documents
                    .filter(
                      (doc) =>
                        searchKeyword === '' ||
                        doc.documentName
                          .toLowerCase()
                          .includes(searchKeyword.toLowerCase()) ||
                        doc.courseName
                          .toLowerCase()
                          .includes(searchKeyword.toLowerCase())
                    )
                    .map((document, index) => (
                      <TableRow
                        key={document.id}
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          '&:hover': {
                            backgroundColor: colors.background.default,
                          },
                          backgroundColor:
                            index % 2 === 0
                              ? 'inherit'
                              : colors.background.default,
                        }}
                      >
                        <TableCell
                          sx={{
                            fontWeight: 500,
                            maxWidth: '300px',
                            wordWrap: 'break-word',
                          }}
                        >
                          {document.courseName}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={document.type}
                            size='small'
                            color={
                              document.type === 'Evidence'
                                ? 'primary'
                                : 'secondary'
                            }
                            variant='outlined'
                            sx={{
                              fontWeight: 500,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {formatDate(document.dateUploaded)}
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 500,
                            maxWidth: '200px',
                            wordWrap: 'break-word',
                          }}
                        >
                          {document.documentName}
                        </TableCell>
                        <TableCell>{document.uploadedBy}</TableCell>
                        <TableCell>
                          <Box
                            sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}
                          >
                            {document.requestedSignatures?.length > 0 ? (
                              <>
                                {/* Show success chips for signed roles */}
                                {getSignatureStatus(
                                  document.signatures,
                                  document.requestedSignatures
                                ).map((role, index) => (
                                  <Chip
                                    key={`signed-${index}`}
                                    label={role}
                                    size='small'
                                    color='success'
                                    variant='filled'
                                    sx={{
                                      fontSize: '10px',
                                      height: '20px',
                                      fontWeight: 500,
                                    }}
                                  />
                                ))}
                                {/* Show pending chips for unsigned roles */}
                                {document.requestedSignatures
                                  ?.filter((reqSig: any) => {
                                    const signature =
                                      document.signatures[
                                        reqSig.role.toLowerCase()
                                      ]
                                    return !signature?.signed
                                  })
                                  .map((reqSig: any, index: number) => (
                                    <Chip
                                      key={`pending-${index}`}
                                      label={`${reqSig.role} (Pending)`}
                                      size='small'
                                      color='warning'
                                      variant='outlined'
                                      sx={{
                                        fontSize: '9px',
                                        height: '18px',
                                        fontWeight: 500,
                                      }}
                                    />
                                  ))}
                              </>
                            ) : (
                              <Typography
                                variant='body2'
                                color='text.secondary'
                                sx={{ fontStyle: 'italic' }}
                              >
                                No signatures requested
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>{document.sessionDateTime}</TableCell>
                        <TableCell>
                          <Button
                            variant='text'
                            onClick={() => handleSignDocument(document)}
                            sx={{
                              color: colors.primary.main,
                              fontWeight: 600,
                              textTransform: 'none',
                              '&:hover': {
                                backgroundColor: colors.primary.light + '20',
                              },
                            }}
                          >
                            Sign
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Summary Section */}
            <Box
              sx={{
                mt: 3,
                p: 2,
                backgroundColor: colors.background.default,
                borderRadius: '8px',
              }}
            >
              <Typography variant='body2' color='text.secondary'>
                Total documents: <strong>{documents.length}</strong>
              </Typography>
              <Typography variant='body2' color='text.secondary'>
                Documents requiring signatures:{' '}
                <strong>
                  {
                    documents.filter((doc) => {
                      // Check if any requested signature is not signed
                      return doc.requestedSignatures?.some((reqSig: any) => {
                        const signature =
                          doc.signatures[reqSig.role.toLowerCase()]
                        return !signature?.signed
                      })
                    }).length
                  }
                </strong>
              </Typography>
            </Box>
          </div>
        </div>
      </Card>

      {/* Signature Modal */}
      <SignatureModal
        open={signatureModalOpen}
        onClose={() => setSignatureModalOpen(false)}
        document={selectedDocument}
        onSave={handleSaveSignatures}
      />

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Grid>
  )
}

export default DocsToSign
