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
  CircularProgress,
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
  getLearnerPlanList,
}: {
  open: boolean
  onClose: () => void,
  getLearnerPlanList: () => void
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
  const [addFormToLearner , {
    isLoading: isAddFormToLearnerLoading
  }] = useAddFormToLearnerMutation()

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
        getLearnerPlanList()
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
        getLearnerPlanList()
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
                  accept='application/pdf'
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
                disabled={!selectedFile || isAddFormToLearnerLoading}
              >
                {
                  isAddFormToLearnerLoading && <CircularProgress size={20} />
                }
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
                disabled={!selectedForm || isAddFormToLearnerLoading}
              >
                {
                  isAddFormToLearnerLoading && <CircularProgress size={20} />
                }
                Add Form
              </Button>
            </Box>
          )}
        </Box>

        <Box mt={4}>
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell style={{ width: 200 }}>Date Uploaded</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {FormList.map((file, idx) => {
                return (
                  <>
                    <TableRow key={idx}>
                      <TableCell>{file.name}</TableCell>
                      <TableCell>{file.file_type}</TableCell>
                      <TableCell>{file.description}</TableCell>
                      <TableCell style={{ width: 200 }}>{format(new Date(file.created_at), 'MM-dd-yyyy')}</TableCell>
                    </TableRow>
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
