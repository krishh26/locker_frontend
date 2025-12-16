import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material'
import { useState, useEffect, useRef } from 'react'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import DeleteIcon from '@mui/icons-material/Delete'
import AttachFileIcon from '@mui/icons-material/AttachFile'

interface UnitSignOffModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (comment: string, file?: File) => void
  defaultValue?: string
}

export default function UnitSignOffModal({
  open,
  onClose,
  onSubmit,
  defaultValue = '',
}: UnitSignOffModalProps) {
  const [comment, setComment] = useState(defaultValue)
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Update comment when defaultValue changes
  useEffect(() => {
    if (open) {
      setComment(defaultValue)
      setFile(null)
    }
  }, [defaultValue, open])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileRemove = () => {
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleSubmit = () => {
    if (!comment.trim() && !file) {
      return
    }
    onSubmit(comment, file || undefined)
    setComment('')
    setFile(null)
  }

  const handleClose = () => {
    setComment('')
    setFile(null)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='sm' fullWidth>
      <DialogTitle>Unit sign off</DialogTitle>

      <DialogContent sx={{ mt: 1 }}>
        <Typography variant='body2' sx={{ mb: 1 }}>
          General comment for this Unit (Max 500 Characters).
        </Typography>

        <TextField
          fullWidth
          multiline
          rows={8}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder='Enter your comments here...'
          sx={{ mb: 2 }}
        />

        {/* File Upload Section */}
        <Box sx={{ mb: 2 }}>
          <Typography variant='body2' sx={{ mb: 1 }}>
            Attach File (Optional)
          </Typography>
          
          <input
            ref={fileInputRef}
            type='file'
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />

          <Button
            variant='outlined'
            startIcon={<CloudUploadIcon />}
            onClick={handleFileUploadClick}
            sx={{ mb: 2 }}
          >
            Upload File
          </Button>

          {/* Display uploaded file */}
          {file && (
            <Box sx={{ mt: 2 }}>
              <Chip
                icon={<AttachFileIcon />}
                label={file.name}
                onDelete={handleFileRemove}
                deleteIcon={<DeleteIcon />}
                variant='outlined'
                sx={{ justifyContent: 'flex-start' }}
              />
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ pb: 2, pr: 3 }}>
        <Button variant='outlined' color='warning' onClick={handleClose}>
          Cancel / Close
        </Button>

        <Button 
          variant='contained' 
          color='primary' 
          onClick={handleSubmit}
          disabled={!comment.trim()}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}
