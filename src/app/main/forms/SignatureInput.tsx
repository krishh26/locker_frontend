import React, { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Box, Button, Typography } from '@mui/material'

interface SignatureInputProps {
  value: File | string | null
  onChange?: (file: File | null) => void
  label?: string
  required?: boolean
  error?: boolean
  helperText?: string
  disabled?: boolean
}

const SignatureInput: React.FC<SignatureInputProps> = ({
  value,
  onChange,
  label,
  required,
  helperText,
  disabled,
}) => {
  const sigRef = useRef<SignatureCanvas | null>(null)

  useEffect(() => {
    const loadSignature = async () => {
      if (value && sigRef.current) {
        if (typeof value === 'string') {
          // If it's a URL (e.g., S3), load it directly
          sigRef.current.fromDataURL(value)
        } else if (value instanceof File) {
          // If it's a File, read and load as data URL
          const reader = new FileReader()
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              sigRef.current!.fromDataURL(reader.result)
            }
          }
          reader.readAsDataURL(value)
        }
      }
    }

    loadSignature()
  }, [value])

  const handleClear = () => {
    sigRef.current?.clear()
    onChange?.(null)
  }

  const handleEnd = () => {
    if (!sigRef.current) return
    const dataUrl = sigRef.current.toDataURL()

    fetch(dataUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const file = new File([blob], 'signature.png', { type: 'image/png' })
        onChange?.(file)
      })
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
          position: 'relative',
          mb: 1,
        }}
      >
        <SignatureCanvas
          ref={sigRef}
          penColor='black'
          onEnd={() => {
            if (disabled || !sigRef.current) return
            const dataUrl = sigRef.current.toDataURL()
            fetch(dataUrl)
              .then((res) => res.blob())
              .then((blob) => {
                const file = new File([blob], `${Date.now()}_signature.png`, {
                  type: 'image/png',
                })
                onChange(file)
              })
          }}
          canvasProps={{
            className: 'sigCanvas',
            style: {
              width: '100%',
              height: '100%',
              cursor: disabled ? 'not-allowed' : 'crosshair',
              backgroundColor: disabled ? '#f5f5f5' : '#fff',
            },
          }}
        />
        {disabled && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: 150,
              backgroundColor: 'transparent',
              zIndex: 10,
              cursor: 'not-allowed',
            }}
          />
        )}
      </Box>
      {disabled && (
        <Typography variant='caption' color='text.secondary'>
          Signature cannot be edited in view mode.
        </Typography>
      )}
      {helperText && (
        <Typography
          variant='caption'
          color='error'
          sx={{ mb: 1, display: 'block' }}
        >
          {helperText}
        </Typography>
      )}
      {!disabled && (
        <Button variant='outlined' size='small' onClick={handleClear}>
          Clear Signature
        </Button>
      )}
    </Box>
  )
}

export default SignatureInput
