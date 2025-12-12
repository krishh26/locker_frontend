import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
} from '@mui/material'
import { useState, useEffect } from 'react'

export default function UnitSignOffModal({
  open,
  onClose,
  onSubmit,
  defaultValue = '',
}) {
  const [comment, setComment] = useState(defaultValue)

  // Update comment when defaultValue changes
  useEffect(() => {
    if (open) {
      setComment(defaultValue)
    }
  }, [defaultValue, open])

  const handleSubmit = () => {
    if (!comment.trim()) {
      return
    }
    onSubmit(comment)
    setComment('')
  }

  const handleClose = () => {
    setComment('')
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
        />
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
