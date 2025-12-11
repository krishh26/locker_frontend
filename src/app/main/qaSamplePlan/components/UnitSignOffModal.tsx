import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button,
} from '@mui/material'
import { useState } from 'react'

export default function UnitSignOffModal({
  open,
  onClose,
  onSubmit,
  defaultValue = '',
}) {
  const [comment, setComment] = useState(defaultValue)

  const handleSubmit = () => {
    onSubmit(comment)
    setComment('')
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
        <Button variant='outlined' color='warning' onClick={onClose}>
          Cancel / Close
        </Button>

        <Button variant='contained' color='primary' onClick={handleSubmit}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  )
}
