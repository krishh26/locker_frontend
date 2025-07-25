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

  const [who, setWho] = useState('this')
  const [fileType, setFileType] = useState('general')
  const [uploadMode, setUploadMode] = useState<'upload' | 'form'>('upload')
  const [selectedForm, setSelectedForm] = useState('')
  const [forms, setForms] = useState([])
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  const [uploadedFiles, setUploadedFiles] = useState<FileData[]>([])

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

  const handleAddUpload = () => {
    if (selectedFile) {
      const newEntry: FileData = {
        name: selectedFile.name,
        description: selectedFile.name,
        dateUploaded: new Date().toLocaleString(),
        signed: { asr: false, sasr: false, ler: false, emp: false, iqa: false },
      }
      setUploadedFiles([...uploadedFiles, newEntry])
      setSelectedFile(null)
    }
  }

  const handleAddForm = () => {
    if (selectedForm) {
      const newEntry: FileData = {
        name: selectedForm,
        description: selectedForm,
        dateUploaded: new Date().toLocaleString(),
        signed: { asr: false, sasr: false, ler: false, emp: false, iqa: false },
      }
      setUploadedFiles([...uploadedFiles, newEntry])
      setSelectedForm('')
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
              value='this'
              control={<Radio />}
              label='This Aim'
            />
            <FormControlLabel
              value='all'
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

        {/* Step 3 - Upload or Form */}
        <Box mb={2}>
          <Typography variant='subtitle1'>3. Upload Type:</Typography>
          <RadioGroup
            row
            value={uploadMode}
            onChange={(e) => setUploadMode(e.target.value as any)}
          >
            <FormControlLabel
              value='upload'
              control={<Radio />}
              label='Upload file'
            />
            <FormControlLabel
              value='form'
              control={<Radio />}
              label='Select Form'
            />
          </RadioGroup>

          {uploadMode === 'upload' ? (
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
              {[...mockFiles].map((file, idx) => {
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
                      <TableCell>General files</TableCell>
                      <TableCell>{file.name}</TableCell>
                      <TableCell>{file.description}</TableCell>
                      <TableCell>{file.dateUploaded}</TableCell>
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
