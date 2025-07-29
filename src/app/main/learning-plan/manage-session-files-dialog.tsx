'use client'

import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  TextField,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import RemoveIcon from '@mui/icons-material/Remove'
import { selectFormData } from 'app/store/formData'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { format } from 'date-fns';
import {
  useAddFormToLearnerMutation,
  useGetFormListOfLearnerQuery,
} from 'app/store/api/learner-plan-api'
import { useDispatch } from 'react-redux'
import { showMessage } from 'app/store/fuse/messageSlice'

interface FileData {
  name: string
  description: string
  dateUploaded: string
  signed: {
    asr: boolean
    sasr: boolean
    ler: boolean
    emp: boolean
    iqa: boolean
  }
}

const mockFiles: FileData[] = [
  {
    name: '3476_Apprenticeship Progress Review - V1.7',
    description: '3476_Apprenticeship Progress Review - V1.7',
    dateUploaded: '21/07/2025 15:03:41',
    signed: { asr: false, sasr: false, ler: false, emp: false, iqa: false },
  },
  {
    name: '3477_Plagiarism Statement',
    description: '3477_Plagiarism Statement',
    dateUploaded: '21/07/2025 15:03:50',
    signed: { asr: false, sasr: false, ler: false, emp: false, iqa: false },
  },
]

const forms = [
  'Additional Support Declaration - V1.2',
  'Apprenticeship Progress Review - V1.7',
  'Break in Learning Request Form - V1.4',
  'Plagiarism Statement',
  'Gateway Declaration - V1.1',
  'Exit Review - V1.2',
]

export default function ManageSessionFilesDialog({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { data } = useSelector(selectFormData)

  const [who, setWho] = useState('This Aim')
  const [fileType, setFileType] = useState('General Files')
  const [uploadMode, setUploadMode] = useState<
    'File Upload' | 'Form Selection'
  >('File Upload')
  const [selectedForm, setSelectedForm] = useState('')
  const [forms, setForms] = useState([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([])
  const [FormList, setFormList] = useState([])

  const dispatch: any = useDispatch()
  const [addFormToLearner] = useAddFormToLearnerMutation()

  const {
    data: formList,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetFormListOfLearnerQuery(
    {
      id: open,
    },
    { skip: !open }
  )

  useEffect(() => {
    if (isError) {
      dispatch(
        showMessage({ message: 'Failed to get form list', variant: 'error' })
      )
    }

    if (formList) {
      const { data } = formList

      setFormList(data)
    }
  }, [formList, isLoading, isError, error])

  useEffect(() => {
    if (data) {
      const updatedData = data.map((item) => {
        return {
          label: item.form_name,
          value: item.id,
        }
      })
      setForms(updatedData)
    }
  }, [data])

  const handleAddUpload = async () => {
    if (selectedFile) {
      const newEntry = {
        name: selectedFile.name,
        description: selectedFile.name,
        who,
        learner_plan_id: open,
        upload_type: uploadMode,
        file_type: fileType,
        signature_roles: [
          'Primary Assessor',
          'Secondary Assessor',
          'Learner',
          'Employer',
          // 'IQA',
        ],
      }

      const formData = new FormData()
      Object.entries(newEntry).forEach(([key, value]) => {
        if (key === 'signature_roles' && Array.isArray(value)) {
          value.forEach((role) => {
            formData.append('signature_roles[]', role)
          })
        } else {
          formData.append(key, String(value))
        }
      })

      formData.append('files', selectedFile)

      try {
        await addFormToLearner(formData).unwrap()
        refetch()
        setSelectedFile(null)
        dispatch(
          showMessage({
            message: 'File uploaded successfully',
            variant: 'success',
          })
        )
      } catch (error) {
        console.log(error)
        dispatch(
          showMessage({ message: 'Failed to upload file', variant: 'error' })
        )
      }
    }
  }

  const handleAddForm = async () => {
    if (selectedForm) {
      const form = forms.find((form) => form.value === selectedForm)
      const newEntry = {
        name: form.label,
        description: form.label,
        who,
        form_id: form.value,
        learner_plan_id: open,
        upload_type: uploadMode,
        file_type: fileType,
        signature_roles: [
          'Primary Assessor',
          'Secondary Assessor',
          'Learner',
          'Employer',
        ],
      }

      const formData = new FormData()
      Object.entries(newEntry).forEach(([key, value]) => {
        if (key === 'signature_roles' && Array.isArray(value)) {
          value.forEach((role) => {
            formData.append('signature_roles[]', role)
          })
        } else {
          formData.append(key, String(value))
        }
      })

      try {
        const res = await addFormToLearner(formData).unwrap()
        dispatch(
          showMessage({
            message: 'File uploaded successfully',
            variant: 'success',
          })
        )
        refetch()
        setSelectedForm('')
        console.log('🚀 ~ handleAddUpload ~ res:', res)
      } catch (error) {
        console.log(error)
        dispatch(
          showMessage({ message: 'Failed to upload file', variant: 'error' })
        )
      }
    }
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='lg' fullWidth>
      <DialogTitle>Manage Session Files</DialogTitle>
      <DialogContent dividers sx={{ maxHeight: 600 }}>
        <Box mb={2}>
          <Typography variant='subtitle1'>1. Who:</Typography>
          <RadioGroup row value={who} onChange={(e) => setWho(e.target.value)}>
            <FormControlLabel
              value='This Aim'
              control={<Radio />}
              label='This Aim'
            />
            <FormControlLabel
              value='All Aim'
              control={<Radio />}
              label='All Aims'
            />
          </RadioGroup>
        </Box>

        <Box mb={2}>
          <Typography variant='subtitle1'>2. File Type:</Typography>
          <RadioGroup
            row
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
          >
            <FormControlLabel
              value='ILP File'
              control={<Radio />}
              label='ILP files'
            />
            <FormControlLabel
              value='Review Files'
              control={<Radio />}
              label='Review files'
            />
            <FormControlLabel
              value='Assessment Files'
              control={<Radio />}
              label='Assessment files'
            />
            <FormControlLabel
              value='General Files'
              control={<Radio />}
              label='General files'
            />
          </RadioGroup>
        </Box>

        {/* Step 3 - Upload or Form */}
        <Box mb={2}>
          <Typography variant='subtitle1'>3. Upload Type:</Typography>
          <RadioGroup
            row
            value={uploadMode}
            onChange={(e) => setUploadMode(e.target.value as any)}
          >
            <FormControlLabel
              value='File Upload'
              control={<Radio />}
              label='Upload file'
            />
            <FormControlLabel
              value='Form Selection'
              control={<Radio />}
              label='Select Form'
            />
          </RadioGroup>

          {uploadMode === 'File Upload' ? (
            <Box mt={2} display='flex' alignItems='center' gap={2}>
              <Button variant='contained' component='label'>
                Choose File
                <input
                  type='file'
                  hidden
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setSelectedFile(e.target.files[0])
                    }
                  }}
                />
              </Button>
              {selectedFile && <Typography>{selectedFile.name}</Typography>}
              <Button
                variant='outlined'
                onClick={handleAddUpload}
                disabled={!selectedFile}
              >
                Upload
              </Button>
            </Box>
          ) : (
            <Box mt={2} display='flex' alignItems='center' gap={2}>
              <FormControl sx={{ minWidth: 300 }}>
                <InputLabel id='select-form-label'>Select Form</InputLabel>
                <Select
                  labelId='select-form-label'
                  value={selectedForm}
                  label='Select Form'
                  onChange={(e) => setSelectedForm(e.target.value)}
                  renderValue={(selected) => {
                    const selectedOption = forms.find(
                      (form) => form.value === selected
                    )
                    return selectedOption ? selectedOption.label : ''
                  }}
                >
                  {forms.map((form) => (
                    <MenuItem key={form.value} value={form.value}>
                      {form.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant='outlined'
                onClick={handleAddForm}
                disabled={!selectedForm}
              >
                Add Form
              </Button>
            </Box>
          )}
        </Box>

        <Box mt={4}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>File</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date Uploaded</TableCell>
                <TableCell colSpan={5}>Signed in Agreement</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {FormList.map((file, idx) => {
                const isExpanded = expandedRow === idx

                return (
                  <>
                    <TableRow key={idx}>
                      <TableCell>
                        <IconButton
                          onClick={() =>
                            setExpandedRow(isExpanded ? null : idx)
                          }
                        >
                          {isExpanded ? <RemoveIcon /> : <AddIcon />}
                        </IconButton>
                      </TableCell>
                      <TableCell>{file.file_type}</TableCell>
                      <TableCell>{file.name}</TableCell>
                      <TableCell>{file.description}</TableCell>
                      <TableCell>{format(new Date(file.created_at), 'MM-dd-yyyy')}</TableCell>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                      <TableCell>
                        <Checkbox />
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          sx={{ backgroundColor: '#f9f9f9' }}
                        >
                          <Box p={2}>
                            <TextField
                              label='Name'
                              fullWidth
                              margin='normal'
                              defaultValue={file.name}
                            />
                            <TextField
                              label='Description'
                              fullWidth
                              margin='normal'
                              defaultValue={file.description}
                            />

                            <Box mt={2}>
                              <Typography variant='subtitle1'>Type</Typography>
                              <RadioGroup row defaultValue='general'>
                                <FormControlLabel
                                  value='ilp'
                                  control={<Radio />}
                                  label='ILP files'
                                />
                                <FormControlLabel
                                  value='review'
                                  control={<Radio />}
                                  label='Review files'
                                />
                                <FormControlLabel
                                  value='assessment'
                                  control={<Radio />}
                                  label='Assessment files'
                                />
                                <FormControlLabel
                                  value='general'
                                  control={<Radio />}
                                  label='General files'
                                />
                              </RadioGroup>
                            </Box>

                            <Box mt={2}>
                              <Table size='small'>
                                <TableHead>
                                  <TableRow>
                                    <TableCell>Signed in Agreement</TableCell>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Signed</TableCell>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Signature req</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {[
                                    'Primary Assessor',
                                    'Secondary Assessor',
                                    'Learner',
                                    'Employer',
                                    'IQA',
                                  ].map((role, rIdx) => (
                                    <TableRow key={rIdx}>
                                      <TableCell>{role}</TableCell>
                                      <TableCell>{role}</TableCell>
                                      <TableCell>
                                        <Checkbox />
                                      </TableCell>
                                      <TableCell>—</TableCell>
                                      <TableCell>
                                        <Checkbox />
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </Box>

                            <Box
                              display='flex'
                              justifyContent='flex-end'
                              mt={2}
                              gap={2}
                            >
                              <Button
                                variant='contained'
                                color='error'
                                onClick={() => setExpandedRow(null)}
                              >
                                Cancel/Close
                              </Button>
                              <Button variant='contained' color='success'>
                                Save
                              </Button>
                            </Box>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant='contained' color='error'>
          Cancel/Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}
