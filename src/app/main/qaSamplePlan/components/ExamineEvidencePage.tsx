import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AddIcon from '@mui/icons-material/Add'

interface EvidenceRow {
  refNo: string
  evidenceDocuments: string
  evidenceName: string
  evidenceDescription: string
  assessmentMethod: string
  grade: string
  dateSet: string
  dateDue: string
  dateUploaded: string
}

interface ConfirmationRow {
  role: string
  statement: string
  completed: boolean
  signedOffBy: string
  dated: string
  comments: string
  file: string
}

const ExamineEvidencePage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const unitName = searchParams.get('unitName') || 'Unit 1'
  const moduleId = searchParams.get('module') || '2776'
  const unitId = searchParams.get('unitId') || searchParams.get('UnitID') || ''
  const sampleResultsId = searchParams.get('sampleResultsId') || searchParams.get('SampleResultsID') || ''

  // Evidence data state
  const [evidenceRows, setEvidenceRows] = useState<EvidenceRow[]>([])
  
  // Criteria sign-off state
  const [criteriaSignOff, setCriteriaSignOff] = useState<Record<string, boolean>>({
    '1 12': false,
    '1 1': false,
  })

  // Confirmation statements data
  const [confirmationRows, setConfirmationRows] = useState<ConfirmationRow[]>([
    {
      role: 'Learner',
      statement: 'I confirm that this unit is complete and the evidence provided is a result of my own work',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
    {
      role: 'Assessor',
      statement: 'I confirm that the learner has demonstrated competence by satisfying all the skills and knowledge for this unit, and has been assessed according to requirements of the qualification.',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
    {
      role: 'Lead assessor Countersignature (if required)',
      statement: 'I confirm that the learner has demonstrated competence by satisfying all the skills and knowledge for this unit, and has been assessed according to requirements of the qualification.',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
    {
      role: 'Employer',
      statement: 'I can confirm that the evidence I have checked as an employer meets the standards.',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
    {
      role: 'Internal Quality Assurer',
      statement: 'I can confirm that the evidence I have sampled as an Internal Quality Assurer meets the standards.',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
    {
      role: 'External Verifier',
      statement: 'Verified as part of External QA Visit.',
      completed: false,
      signedOffBy: '',
      dated: '',
      comments: '',
      file: '',
    },
  ])

  const [unitLocked, setUnitLocked] = useState(false)

  const handleCriteriaToggle = (key: string) => {
    setCriteriaSignOff((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleConfirmationToggle = (index: number) => {
    setConfirmationRows((prev) => {
      const updated = [...prev]
      updated[index] = {
        ...updated[index],
        completed: !updated[index].completed,
      }
      return updated
    })
  }

  const handleAddComment = (index: number) => {
    // Handle add comment logic
    console.log('Add comment for', confirmationRows[index].role)
  }

  const handleAddFile = (index: number) => {
    // Handle add file logic
    console.log('Add file for', confirmationRows[index].role)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: '#ffffff',
      }}
    >
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: 0,
          borderBottom: 1,
          borderColor: 'divider',
          backgroundColor: '#ffffff',
        }}
      >
        <Stack
          direction='row'
          alignItems='center'
          spacing={2}
        >
          <IconButton
            onClick={() => navigate(-1)}
            size='small'
            sx={{
              color: '#666666',
              '&:hover': {
                backgroundColor: '#f5f5f5',
              },
            }}
          >
            <ArrowBackIcon fontSize='small' />
          </IconButton>
          <Typography
            variant='h5'
            sx={{
              fontWeight: 500,
              color: '#333333',
            }}
          >
            {unitName}
          </Typography>
        </Stack>
      </Paper>

      {/* Content */}
      <Box sx={{ flex: 1, p: 3, backgroundColor: '#f5f5f5' }}>
        <Stack spacing={3}>
          {/* Evidence Table */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table size='small' sx={{ border: '1px solid #e0e0e0' }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Ref No
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Evidence Documents
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Evidence Name
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Evidence Description
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Assessment Method
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Grade
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Date Set
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Date Due
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0' }}>
                      Date Uploaded
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        textAlign: 'center',
                        borderRight: '1px solid #e0e0e0',
                      }}
                    >
                      Sign off all criteria
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {evidenceRows.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={10}
                        align='center'
                        sx={{ py: 4, color: '#666666' }}
                      >
                        No evidence records available
                      </TableCell>
                    </TableRow>
                  ) : (
                    evidenceRows.map((row, index) => (
                      <TableRow key={index} hover>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.refNo}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.evidenceDocuments}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.evidenceName}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.evidenceDescription}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.assessmentMethod}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.grade}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.dateSet}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.dateDue}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}>
                          {row.dateUploaded}
                        </TableCell>
                        <TableCell sx={{ borderRight: '1px solid #e0e0e0' }}></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Sign off criteria section */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Stack direction='row' spacing={1} alignItems='center'>
                {Object.entries(criteriaSignOff).map(([key, checked]) => (
                  <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Checkbox
                      size='small'
                      checked={checked}
                      onChange={() => handleCriteriaToggle(key)}
                      sx={{ p: 0.5 }}
                    />
                    <Typography variant='body2' sx={{ fontSize: '0.875rem' }}>
                      {key}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              <Typography variant='body2' sx={{ color: '#666666', ml: 'auto' }}>
                No. Req
              </Typography>
              <Button
                variant='outlined'
                size='small'
                startIcon={<AddIcon />}
                sx={{
                  textTransform: 'none',
                  borderColor: '#1976d2',
                  color: '#1976d2',
                  '&:hover': {
                    borderColor: '#1565c0',
                    backgroundColor: 'rgba(25, 118, 210, 0.04)',
                  },
                }}
              >
                Show All
              </Button>
            </Box>
          </Paper>

          {/* Confirmation Statement Table */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: 1,
              overflow: 'hidden',
            }}
          >
            <TableContainer>
              <Table size='small' sx={{ border: '1px solid #e0e0e0' }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0', width: '20%' }}>
                      Role
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0', width: '35%' }}>
                      Confirmation Statement
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 600,
                        borderRight: '1px solid #e0e0e0',
                        textAlign: 'center',
                        width: '10%',
                      }}
                    >
                      Please tick when completed
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0', width: '12%' }}>
                      Signed off by
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0', width: '10%' }}>
                      Dated
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, borderRight: '1px solid #e0e0e0', width: '13%' }}>
                      General Comments
                    </TableCell>
                    <TableCell sx={{ fontWeight: 600, width: '10%' }}>
                      File
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {confirmationRows.map((row, index) => (
                    <TableRow key={index} hover>
                      <TableCell
                        sx={{
                          borderRight: '1px solid #e0e0e0',
                          fontWeight: 500,
                          verticalAlign: 'top',
                        }}
                      >
                        {row.role}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderRight: '1px solid #e0e0e0',
                          verticalAlign: 'top',
                        }}
                      >
                        {row.statement}
                      </TableCell>
                      <TableCell
                        sx={{
                          borderRight: '1px solid #e0e0e0',
                          textAlign: 'center',
                          verticalAlign: 'top',
                        }}
                      >
                        <Stack direction='row' alignItems='center' justifyContent='center' spacing={1}>
                          <Checkbox
                            size='small'
                            checked={row.completed}
                            onChange={() => handleConfirmationToggle(index)}
                            sx={{ p: 0.5 }}
                          />
                          <IconButton
                            size='small'
                            onClick={() => handleAddComment(index)}
                            sx={{
                              p: 0.5,
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              },
                            }}
                          >
                            <AddIcon fontSize='small' />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>
                        {row.signedOffBy || '-'}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>
                        {row.dated || '-'}
                      </TableCell>
                      <TableCell sx={{ borderRight: '1px solid #e0e0e0', verticalAlign: 'top' }}>
                        {row.comments || '-'}
                      </TableCell>
                      <TableCell sx={{ verticalAlign: 'top' }}>
                        {row.file ? (
                          <Typography variant='body2' color='primary'>
                            {row.file}
                          </Typography>
                        ) : (
                          <IconButton
                            size='small'
                            onClick={() => handleAddFile(index)}
                            sx={{
                              p: 0.5,
                              color: '#1976d2',
                              '&:hover': {
                                backgroundColor: 'rgba(25, 118, 210, 0.08)',
                              },
                            }}
                          >
                            <AddIcon fontSize='small' />
                          </IconButton>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Unit Lock Section */}
            <Box
              sx={{
                p: 2,
                borderTop: '1px solid #e0e0e0',
                backgroundColor: '#fafafa',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                Assessor, IQA or EV - Lock Admin, Super Admin-Unlock
              </Typography>
              <Checkbox
                size='small'
                checked={unitLocked}
                onChange={(e) => setUnitLocked(e.target.checked)}
                sx={{ p: 0.5 }}
              />
              <Typography variant='body2' sx={{ color: '#666666' }}>
                Unit locked from change.
              </Typography>
            </Box>
          </Paper>
        </Stack>
      </Box>
    </Box>
  )
}

export default ExamineEvidencePage
