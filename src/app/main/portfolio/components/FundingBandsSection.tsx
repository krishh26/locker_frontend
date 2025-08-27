import React, { useState, useMemo } from 'react'
import {
  Box,
  Card,
  Grid,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Cancel'

interface FundingBandsSectionProps {
  fundingBands: any[]
  isLoading: boolean
  isUpdating: boolean
  onUpdateBand: (bandId: number, newAmount: number) => Promise<void>
}

const FundingBandsSection: React.FC<FundingBandsSectionProps> = ({
  fundingBands,
  isLoading,
  isUpdating,
  onUpdateBand,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editedAmount, setEditedAmount] = useState<string>('')

  const handleEditClick = (band: any) => {
    setEditingId(band.id)
    setEditedAmount(band.amount.toString())
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditedAmount('')
  }

  const handleSave = async (band: any) => {
    const newAmount = Number(editedAmount)
    await onUpdateBand(band.id, newAmount)
    setEditingId(null)
    setEditedAmount('')
  }

  // Total Funding (live updates)
  const totalFunding = useMemo(() => {
    return fundingBands.reduce((sum: number, band: any) => {
      if (editingId === band.id) {
        // while typing, use editedAmount
        return sum + Number(editedAmount || 0)
      }
      return sum + Number(band.amount || 0)
    }, 0)
  }, [fundingBands, editedAmount, editingId])

  return (
    <Card className='rounded-6 items-center' variant='outlined'>
      <Grid className='h-full flex flex-col'>
        {/* Header */}
        <Grid
          xs={12}
          className='p-10 border-b-2 bg-[#007E84] flex justify-between items-center'
        >
          <Typography className='font-600 text-white'>
            Funding Bands
          </Typography>
        </Grid>

        {/* Content */}
        <Box className='m-12 flex flex-col gap-12'>
          {isLoading ? (
            <Box display='flex' justifyContent='center' mt={2}>
              <CircularProgress />
            </Box>
          ) : (
            fundingBands.map((band: any) => (
              <Box
                key={band.id}
                className='flex justify-between items-center p-4 border rounded-lg shadow-sm'
              >
                <Box>
                  <Typography className='font-500'>
                    {band.course.course_name} (Level {band.course.level})
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    Code: {band.course.course_code}
                  </Typography>
                </Box>

                {/* Inline Amount Editing */}
                <Box className='flex items-center gap-2'>
                  {editingId === band.id ? (
                    <>
                      <TextField
                        size='small'
                        type='number'
                        value={editedAmount}
                        onChange={(e) => setEditedAmount(e.target.value)}
                      />
                      <IconButton
                        color='primary'
                        onClick={() => handleSave(band)}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <CircularProgress size={20} />
                        ) : (
                          <SaveIcon />
                        )}
                      </IconButton>
                      <IconButton color='error' onClick={handleCancel}>
                        <CancelIcon />
                      </IconButton>
                    </>
                  ) : (
                    <>
                      <Typography className='font-600 text-lg'>
                        £{band.amount}
                      </Typography>
                      <IconButton
                        color='primary'
                        onClick={() => handleEditClick(band)}
                      >
                        <EditIcon />
                      </IconButton>
                    </>
                  )}
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Total Funding Footer (updates live while typing) */}
        <Box className='p-6 border-t-2 bg-gray-50 flex justify-between items-center'>
          <Typography className='font-600'>Total Funding</Typography>
          <Typography className='font-700 text-lg text-[#007E84]'>
            £{totalFunding}
          </Typography>
        </Box>
      </Grid>
    </Card>
  )
}

export default FundingBandsSection
