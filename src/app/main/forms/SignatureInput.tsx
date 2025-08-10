import React, { useRef, useEffect, useState } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { yupResolver } from '@hookform/resolvers/yup'
import * as Yup from 'yup'

import {
  Box,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from '@mui/material'
import { useForm } from 'react-hook-form'
import JwtService from 'src/app/auth/services/jwtService'
import { useDispatch } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'
import { fi } from 'date-fns/locale'

interface SignatureInputProps {
  value: File | string | null | { name: string; timestamp: string }
  onChange?: (
  file:
    | File
    | null
    | { name: string; timestamp: string }
    | string
) => void;
  label?: string
  required?: boolean
  error?: boolean
  helperText?: string
  disabled?: boolean
}

const schema = Yup.object().shape({
  email: Yup.string()
    .email('Enter a valid email')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
})

const SignatureInput: React.FC<SignatureInputProps> = ({
  value,
  onChange,
  label,
  required,
  helperText,
  disabled,
}) => {
  const {
    register,
    formState: { errors },
    trigger,
    getValues,
    reset,
  } = useForm({
    resolver: yupResolver(schema),
  })

  const sigRef = useRef<SignatureCanvas | null>(null)
  const dispatch: any = useDispatch()
  const [isDrawing, setIsDrawing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [roleChecked, setRoleChecked] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [signedInfo, setSignedInfo] = useState<{
    name: string
    timestamp: string
  } | null>(null)

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
        } else if (value && value?.timestamp && value?.name) {
          setRoleChecked(true)
          setSignedInfo(value)
        }
      }
    }

    loadSignature()
  }, [value])

  const handleClear = () => {
    onChange?.(null)
    setIsDrawing(true)
    sigRef.current?.clear()
    setSignedInfo(null)
    setRoleChecked(false)
  }

  const handleRoleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoleChecked(e.target.checked)
    if (e.target.checked) {
      setModalOpen(true)
    }
  }

  const onPasswordSubmit = async () => {
    const isValid = await trigger()
    if (!isValid) return

    const { email, password } = getValues()
    setIsLoading(true)
    try {
      const res = await JwtService.signInWithEmailAndPassword(
        { email, password },
        dispatch
      )

      if (res.user) {

        const signedInfo = {
          name: `${res.user.first_name} ${res.user.last_name}`,
          timestamp: new Date().toLocaleString(),
        }
        setSignedInfo(signedInfo)
        onChange?.(JSON.stringify(signedInfo))
        reset()
        setModalOpen(false)
      }
    } catch (error) {
      reset()
      setModalOpen(false)
      dispatch(
        showMessage({ message: error.response.data.message, variant: 'error' })
      )
    }
    setIsLoading(false)
  }

  return (
    <Box>
      {label && (
        <Typography variant='body2' sx={{ mb: 1, fontWeight: 500 }}>
          {label} {required && <span style={{ color: 'red' }}>*</span>}
        </Typography>
      )}
      <FormControlLabel
        control={<Checkbox checked={roleChecked} onChange={handleRoleChange} />}
        label='Signature Role'
        disabled={disabled}
        />
      {typeof value === 'string' && !isDrawing && value.startsWith('http') ? (
        <Box sx={{ mb: 1 }}>
          <Typography variant='subtitle1'>Previous Signature:</Typography>
          <Typography variant='subtitle2'>
            Clear your signature before uploading a new one, or keep the
            existing.
          </Typography>
          <img
            src={value}
            alt='Previous signature'
            style={{ width: '100%', maxWidth: 400, border: '1px solid #ccc' }}
          />
        </Box>
      ) : (
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
              // if ((disabled && !isDrawing ) || !sigRef.current) return
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
      )}

      {signedInfo && (
        <Typography variant='caption' sx={{ display: 'block', mb: 1 }}>
          Signed by <strong>{signedInfo.name}</strong> on {signedInfo.timestamp}
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
          {typeof value === 'string' && !isDrawing && value.startsWith('http')
            ? 'Clear & Draw Again'
            : 'Clear Signature'}
        </Button>
      )}

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
        <DialogTitle>Enter Signature Role Credentials</DialogTitle>
        <Box component='form'>
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {/* Email Field */}
            <TextField
              label='Email'
              type='email'
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email ? String(errors.email.message) : ''}
            />

            {/* Password Field */}
            <TextField
              label='Password'
              type='password'
              {...register('password')}
              error={!!errors.password}
              helperText={
                errors.password ? String(errors.password.message) : ''
              }
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setModalOpen(false)
                setRoleChecked(false)
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant='contained'
              onClick={() => onPasswordSubmit()}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  )
}

export default SignatureInput
