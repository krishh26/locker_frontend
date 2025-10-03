import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Chip,
  Divider,
  Paper,
  CircularProgress,
  useTheme,
  alpha,
} from '@mui/material'
import {
  Close as CloseIcon,
  Download as DownloadIcon,
  Info as InfoIcon,
} from '@mui/icons-material'
import { useGetAcknowledgementsQuery } from 'src/app/store/api/acknowledgementApi'

interface AcknowledgementPopupProps {
  open: boolean
  onClose: () => void
  onAccept: () => void
  name: string
}

const AcknowledgementPopup: React.FC<AcknowledgementPopupProps> = ({
  open,
  onClose,
  onAccept,
  name,
}) => {
  const theme = useTheme()
  const { data: acknowledgements, isLoading } = useGetAcknowledgementsQuery({})

  // Get the latest acknowledgement
  const latestAcknowledgement =
    acknowledgements && acknowledgements?.data?.length > 0
      ? acknowledgements.data[0]
      : null

  // Check if user has already seen this acknowledgement
  useEffect(() => {
    if (latestAcknowledgement) {
      const lastSeenId = localStorage.getItem('lastSeenAcknowledgementId')
      const lastSeenDate = localStorage.getItem('lastSeenAcknowledgementDate')

      // Check if this is a new acknowledgement or if it's been more than 24 hours
      const isNewAcknowledgement =
        lastSeenId !== latestAcknowledgement.id.toString()
      const isOldAcknowledgement =
        lastSeenDate &&
        Date.now() - parseInt(lastSeenDate) > 24 * 60 * 60 * 1000 // 24 hours

      if (isNewAcknowledgement || isOldAcknowledgement) {
        // setHasShown(false)
      } else {
        // setHasShown(true)
      }
    }
  }, [latestAcknowledgement])

  const handleAccept = () => {
    if (latestAcknowledgement) {
      // Mark as seen
      // localStorage.setItem('lastSeenAcknowledgementId', latestAcknowledgement.id.toString())
      // localStorage.setItem('lastSeenAcknowledgementDate', Date.now().toString())
    }
    onAccept()
  }

  const handleDownloadFile = (fileUrl: string, fileName: string) => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Don't show popup if no acknowledgement or already shown
  if (isLoading) {
    return <CircularProgress />
  } else if (!latestAcknowledgement) {
    return null
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='md'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: theme.spacing(1),
          boxShadow: theme.shadows[8],
          background: theme.palette.background.paper,
          border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          minHeight: '400px',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          pt: 3,
          px: 4,
          background: alpha(theme.palette.primary.main, 0.05),
          color: theme.palette.text.primary,
          borderRadius: `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <InfoIcon
              sx={{ fontSize: 20, color: theme.palette.primary.contrastText }}
            />
          </Box>
          <Box>
            <Typography
              variant='h6'
              component='div'
              sx={{ fontWeight: 600, color: theme.palette.text.primary }}
            >
              Acknowledgement Message
            </Typography>
            <Typography
              variant='caption'
              sx={{ color: theme.palette.text.secondary }}
            >
              Welcome {name} to YourLocker Platform
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size='small'
          sx={{
            color: theme.palette.text.secondary,
            backgroundColor: 'transparent',
            '&:hover': {
              backgroundColor: alpha(theme.palette.action.hover, 0.1),
              color: theme.palette.text.primary,
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3, pb: 2, px: 4 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            minHeight: '300px',
            p: 2,
          }}
        >
          {/* Left Section - Message */}
          <Box sx={{ flex: 1 }}>
            <Typography
              variant='body1'
              sx={{
                lineHeight: 1.6,
                color: theme.palette.text.primary,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontSize: '1.5rem',
                fontWeight: 400,
                mb: 2,
              }}
            >
              {latestAcknowledgement.message}
            </Typography>
          </Box>

          {/* Right Section - File Preview */}
          {latestAcknowledgement.fileName && latestAcknowledgement.filePath && (
            <Box
              sx={{
                flex: 1,
                borderLeft: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography
                variant='subtitle2'
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: theme.palette.text.primary,
                  fontSize: '1.2rem',
                }}
              >
                Please Review the Attached Document
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 ,cursor: 'pointer'}} onClick={() => handleDownloadFile(latestAcknowledgement.filePath, latestAcknowledgement.fileName)}>
                <Typography
                  variant='body2'
                  sx={{ color: theme.palette.text.secondary, textDecoration: 'underline' }}
                >
                  {latestAcknowledgement.fileName}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          px: 4,
          py: 3,
          gap: 2,
          justifyContent: 'flex-end',
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <Button
          onClick={onClose}
          variant='outlined'
          sx={{
            minWidth: 100,
            borderRadius: theme.spacing(1),
            px: 3,
            py: 1.5,
            borderColor: alpha(theme.palette.primary.main, 0.3),
            color: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.05),
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAccept}
          variant='contained'
          sx={{
            minWidth: 120,
            borderRadius: theme.spacing(1),
            px: 3,
            py: 1.5,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            '&:hover': {
              backgroundColor: theme.palette.primary.dark,
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          I Accept
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AcknowledgementPopup
