import React from 'react'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddIcon from '@mui/icons-material/Add'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import RefreshIcon from '@mui/icons-material/Refresh'
import DeleteIcon from '@mui/icons-material/Delete'
import type { ModalFormData, SampleQuestion } from '../types'
import { assessmentMethodCodes, iqaConclusionOptions, modalSampleTypes } from '../constants'

interface EditSampleModalProps {
  open: boolean
  onClose: () => void
  activeTab: number
  onTabChange: (value: number) => void
  modalFormData: ModalFormData
  onFormDataChange: (field: string, value: any) => void
  onAssessmentMethodToggle: (code: string) => void
  onIqaConclusionToggle: (option: string) => void
  sampleQuestions: SampleQuestion[]
  onQuestionChange: (id: string, question: string) => void
  onAnswerChange: (id: string, answer: 'Yes' | 'No') => void
  onAddQuestion: () => void
  onDeleteQuestion: (id: string) => void
  onSaveQuestions: () => void
}

export const EditSampleModal: React.FC<EditSampleModalProps> = ({
  open,
  onClose,
  activeTab,
  onTabChange,
  modalFormData,
  onFormDataChange,
  onAssessmentMethodToggle,
  onIqaConclusionToggle,
  sampleQuestions,
  onQuestionChange,
  onAnswerChange,
  onAddQuestion,
  onDeleteQuestion,
  onSaveQuestions,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='xl'
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
          height: '90vh',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2.5,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 600 }}>
            Edit Sample
          </Typography>
          <IconButton onClick={onClose} size='small'>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs and Create New Button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2.5,
            pt: 2,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => onTabChange(newValue)}
            sx={{
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 500,
                minHeight: 48,
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#e91e63',
              },
            }}
          >
            <Tab
              label='FS 1 - (10/11/2025)'
              sx={{
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 600,
                },
              }}
            />
            <Tab
              label='FS 2 - (11/11/2025)'
              sx={{
                '&.Mui-selected': {
                  color: '#e91e63',
                  fontWeight: 600,
                },
              }}
            />
          </Tabs>
          <Button
            variant='contained'
            startIcon={<AddIcon />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#e91e63',
              '&:hover': {
                bgcolor: '#c2185b',
              },
            }}
          >
            Create New
          </Button>
        </Box>

        {/* Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            flexWrap: 'wrap',
            gap: 1.5,
            px: 2.5,
            pt: 2,
            pb: 1,
          }}
        >
          <Button
            variant='outlined'
            onClick={onClose}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#ff9800',
              color: '#ff9800',
              '&:hover': {
                borderColor: '#f57c00',
                bgcolor: 'rgba(255, 152, 0, 0.08)',
              },
            }}
          >
            Cancel / Close
          </Button>
          <Button
            variant='outlined'
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              borderColor: '#f44336',
              color: '#f44336',
              '&:hover': {
                borderColor: '#d32f2f',
                bgcolor: 'rgba(244, 67, 54, 0.08)',
              },
            }}
          >
            Delete
          </Button>
          <Button
            variant='contained'
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#4caf50',
              '&:hover': {
                bgcolor: '#388e3c',
              },
            }}
          >
            Save
          </Button>
          <Button
            variant='contained'
            onClick={onClose}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              bgcolor: '#4caf50',
              '&:hover': {
                bgcolor: '#388e3c',
              },
            }}
          >
            Save & Close
          </Button>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 2.5 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Stack spacing={2.5}>
                <FormControl fullWidth size='small'>
                  <InputLabel>QA Name</InputLabel>
                  <Select
                    value={modalFormData.qaName}
                    label='QA Name'
                    onChange={(e) => onFormDataChange('qaName', e.target.value)}
                  >
                    <MenuItem value='Raj Bhudia'>Raj Bhudia</MenuItem>
                    <MenuItem value='Other QA'>Other QA</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2.5}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={modalFormData.type}
                    label='Type'
                    onChange={(e) => onFormDataChange('type', e.target.value)}
                  >
                    <MenuItem value='Formative'>Formative</MenuItem>
                    <MenuItem value='Summative'>Summative</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Stack spacing={2.5}>
                <FormControl fullWidth size='small'>
                  <InputLabel>Sample Type</InputLabel>
                  <Select
                    value={modalFormData.sampleType}
                    label='Sample Type'
                    onChange={(e) => onFormDataChange('sampleType', e.target.value)}
                  >
                    {modalSampleTypes.map((type) => (
                      <MenuItem key={type} value={type}>
                        {type}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size='small'
                label='Planned Date'
                type='date'
                value={modalFormData.plannedDate}
                onChange={(e) => onFormDataChange('plannedDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                size='small'
                label='Completed Date'
                type='date'
                value={modalFormData.completedDate}
                onChange={(e) => onFormDataChange('completedDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                  Assessment Methods
                </Typography>
                <Paper variant='outlined' sx={{ p: 2, borderRadius: 1 }}>
                  <Grid container spacing={1}>
                    {assessmentMethodCodes.map((code) => (
                      <Grid item xs={3} key={code}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              size='small'
                              checked={modalFormData.assessmentMethods.includes(code)}
                              onChange={() => onAssessmentMethodToggle(code)}
                            />
                          }
                          label={code}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                  IQA Conclusion
                </Typography>
                <Paper variant='outlined' sx={{ p: 2, borderRadius: 1 }}>
                  <FormGroup row>
                    {iqaConclusionOptions.map((option) => (
                      <FormControlLabel
                        key={option}
                        control={
                          <Checkbox
                            size='small'
                            checked={modalFormData.iqaConclusion.includes(option)}
                            onChange={() => onIqaConclusionToggle(option)}
                          />
                        }
                        label={option}
                      />
                    ))}
                  </FormGroup>
                </Paper>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Typography variant='subtitle2' sx={{ fontWeight: 600, mb: 1 }}>
                  Assessor Decision Correct
                </Typography>
                <FormControl component='fieldset'>
                  <RadioGroup
                    row
                    value={modalFormData.assessorDecisionCorrect}
                    onChange={(e) => onFormDataChange('assessorDecisionCorrect', e.target.value)}
                  >
                    <FormControlLabel
                      value='Yes'
                      control={<Radio size='small' />}
                      label='Yes'
                    />
                    <FormControlLabel
                      value='No'
                      control={<Radio size='small' />}
                      label='No'
                    />
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                size='small'
                label='Assessment Processes'
                value={modalFormData.assessmentProcesses}
                onChange={(e) => onFormDataChange('assessmentProcesses', e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                size='small'
                label='Feedback'
                value={modalFormData.feedback}
                onChange={(e) => onFormDataChange('feedback', e.target.value)}
                placeholder='Please type in feedback. Max 4400 characters.'
                inputProps={{ maxLength: 4400 }}
              />
            </Grid>
          </Grid>
          <Button
            variant='contained'
            sx={{
              textTransform: 'none',
              mt: 3,
              fontWeight: 600,
              bgcolor: '#e91e63',
              '&:hover': {
                bgcolor: '#c2185b',
              },
            }}
          >
            Examine Evidence
          </Button>
          <Box
            sx={{
              mt: 3,
              mb: 2,
              display: 'flex',
              justifyContent: 'space-between',
              gap: 3,
              flexWrap: 'wrap',
            }}
          >
            {/* Evidence Links Table */}
            <Box sx={{ mb: 3 }} flex={1}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                  Evidence Links for Sample
                </Typography>
                <Stack direction='row' spacing={1}>
                  <IconButton size='small'>
                    <RefreshIcon fontSize='small' />
                  </IconButton>
                </Stack>
              </Box>
              <TableContainer component={Paper} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Examined Evidence</TableCell>
                      <TableCell>Assessment Methods Used</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={3} align='center' sx={{ py: 4 }}>
                        <Typography variant='body2' color='text.secondary'>
                          There are no Evidence Links on this Sample
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Actions Table */}
            <Box flex={1}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                  Actions for Sample
                </Typography>
                <Stack direction='row' spacing={1}>
                  <Button
                    variant='contained'
                    size='small'
                    startIcon={<AddIcon />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 600,
                      bgcolor: '#4caf50',
                      '&:hover': {
                        bgcolor: '#388e3c',
                      },
                    }}
                  >
                    Add Action
                  </Button>
                </Stack>
              </Box>
              <TableContainer component={Paper} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Summary</TableCell>
                      <TableCell>Action Required</TableCell>
                      <TableCell>Action With</TableCell>
                      <TableCell>Target Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={5} align='center' sx={{ py: 4 }}>
                        <Typography variant='body2' color='text.secondary'>
                          There are no Actions on this Sample
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          {/* Allocated Forms and Documents for Sample */}
          <Box
            sx={{
              mt: 3,
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
            }}
          >
            {/* Allocated Forms Section */}
            <Box sx={{ flex: 1, minWidth: 400 }}>
              <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1.5 }}>
                Allocated Forms
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  mb: 1.5,
                  alignItems: 'center',
                }}
              >
                <TextField
                  fullWidth
                  size='small'
                  placeholder='Select form...'
                  sx={{ flex: 1 }}
                />
                <Button
                  variant='contained'
                  size='small'
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#ff9800',
                    color: '#fff',
                    '&:hover': {
                      bgcolor: '#f57c00',
                    },
                    whiteSpace: 'nowrap',
                  }}
                >
                  Allocate Form
                </Button>
              </Box>
              <TableContainer component={Paper} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell>Completed Date</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                        <Typography variant='body2' color='text.secondary'>
                          There are no Forms on this Sample
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            {/* Documents for Sample Section */}
            <Box sx={{ flex: 1, minWidth: 400 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1.5,
                }}
              >
                <Typography variant='subtitle1' sx={{ fontWeight: 600 }}>
                  Documents for Sample
                </Typography>
                <Button
                  variant='contained'
                  size='small'
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#4caf50',
                    '&:hover': {
                      bgcolor: '#388e3c',
                    },
                  }}
                >
                  Upload File
                </Button>
              </Box>
              <TableContainer component={Paper} variant='outlined'>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell>File</TableCell>
                      <TableCell>File Name</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell colSpan={3} align='center' sx={{ py: 4 }}>
                        <Typography variant='body2' color='text.secondary'>
                          There are no Files on this Sample
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>

          {/* Sample Questions Section */}
          <Box sx={{ mt: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography
                  variant='subtitle1'
                  sx={{
                    fontWeight: 600,
                    color: '#e91e63',
                  }}
                >
                  Sample Questions
                </Typography>
              </Box>
              <Button
                variant='contained'
                size='small'
                onClick={onSaveQuestions}
                sx={{
                  textTransform: 'none',
                  fontWeight: 600,
                  bgcolor: '#4caf50',
                  '&:hover': {
                    bgcolor: '#388e3c',
                  },
                }}
              >
                Save
              </Button>
            </Box>

            <Paper
              variant='outlined'
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'light'
                    ? theme.palette.grey[50]
                    : theme.palette.background.default,
              }}
            >
              <TableContainer>
                <Table size='small'>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600, width: '60%' }}>
                        Question
                      </TableCell>
                      <TableCell
                        align='center'
                        sx={{ fontWeight: 600, width: '15%' }}
                      >
                        Yes
                      </TableCell>
                      <TableCell
                        align='center'
                        sx={{ fontWeight: 600, width: '15%' }}
                      >
                        No
                      </TableCell>
                      <TableCell
                        align='center'
                        sx={{ fontWeight: 600, width: '10%' }}
                      >
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sampleQuestions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} align='center' sx={{ py: 4 }}>
                          <Typography variant='body2' color='text.secondary'>
                            No questions added yet. Click "Add Question" to get started.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ) : (
                      sampleQuestions.map((question, index) => (
                        <TableRow key={question.id} hover>
                          <TableCell>
                            <TextField
                              fullWidth
                              size='small'
                              value={question.question}
                              onChange={(e) => onQuestionChange(question.id, e.target.value)}
                              placeholder={`Question ${index + 1}`}
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  backgroundColor: 'background.paper',
                                },
                              }}
                            />
                          </TableCell>
                          <TableCell align='center'>
                            <Radio
                              size='small'
                              checked={question.answer === 'Yes'}
                              onChange={() => onAnswerChange(question.id, 'Yes')}
                              value='Yes'
                            />
                          </TableCell>
                          <TableCell align='center'>
                            <Radio
                              size='small'
                              checked={question.answer === 'No'}
                              onChange={() => onAnswerChange(question.id, 'No')}
                              value='No'
                            />
                          </TableCell>
                          <TableCell align='center'>
                            <IconButton
                              size='small'
                              onClick={() => onDeleteQuestion(question.id)}
                              sx={{
                                color: 'error.main',
                                '&:hover': {
                                  bgcolor: 'error.light',
                                  color: 'error.dark',
                                },
                              }}
                            >
                              <DeleteIcon fontSize='small' />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Add Question Button */}
              <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
                <Button
                  variant='outlined'
                  size='small'
                  startIcon={<AddIcon />}
                  onClick={onAddQuestion}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                  }}
                >
                  Add Question
                </Button>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Dialog>
  )
}

