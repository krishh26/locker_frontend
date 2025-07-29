import React, { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Box, Button, Typography } from '@mui/material'

interface SignatureInputProps {
  value?: string
  onChange?: (val: string) => void
  label?: string
  required?: boolean
  error?: boolean
  helperText?: string
}

const SignatureInput: React.FC<SignatureInputProps> = ({
  value,
  onChange,
  label,
  required,
  helperText
}) => {
  const sigRef = useRef<SignatureCanvas | null>(null)

  useEffect(() => {
    if (value && sigRef.current) {
      sigRef.current.fromDataURL(value)
    }
  }, [value])

  const handleClear = () => {
    sigRef.current?.clear()
    onChange?.('')
  }

  const handleEnd = () => {
    const dataURL = sigRef.current?.toDataURL() || ''
    onChange?.(dataURL)
  }

  return (
    <Box>
      {label && (
        <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Typography>
      )}
      <Box
        sx={{
          border: '1px solid #ccc',
          borderRadius: 1,
          height: 150,
          width: '100%',
          mb: 1,
        }}
      >
        <SignatureCanvas
          ref={sigRef}
          penColor='black'
          onEnd={handleEnd}
          canvasProps={{
            className: 'sigCanvas',
            style: { width: '100%', height: '100%' },
          }}
        />
      </Box>
      {helperText && (
        <Typography
          variant='caption'
          color='error'
          sx={{ mb: 1, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
      <Button variant='outlined' size='small' onClick={handleClear}>
        Clear Signature
      </Button>
    </Box>
  )
}

export default SignatureInput
