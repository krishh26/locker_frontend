import { FC, useState } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import {
  Button,
  CircularProgress,
  Divider,
  FormHelperText,
  Grid,
  MenuItem,
  Select,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Card,
  CardContent,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon,
  Description as DocumentIcon,
  TableChart as ExcelIcon,
  Slideshow as PowerPointIcon,
  FileUpload as FileUploadIcon,
  CreateNewFolder as CreateIcon,
  CheckCircleOutline as CheckIcon,
  InfoOutlined as InfoIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { FileUploader } from 'react-drag-drop-files'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import * as yup from 'yup'

import { useUploadEvidenceFileMutation } from 'app/store/api/evidence-api'
import { showMessage } from 'app/store/fuse/messageSlice'
import { selectLearnerManagement } from 'app/store/learnerManagement'
import { useDispatch } from 'react-redux'
import { useTheme } from '@mui/material/styles'

// Import the new realistic editors
import WordEditor from '../Documents/WordEditor'
import ExcelEditor from '../Documents/ExcelEditor'
import PowerPointEditor from '../Documents/PowerPointEditor'
import { useNavigate } from 'react-router-dom'

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface ExcelRow {
  [key: string]: string;
}

interface Slide {
  id: string;
  title: string;
  content: string;
}

type FormValues = {
  courseId: string
  file: File | null
}

type EvidenceUploadWithCreationProps = {
  handleClose: () => void
}

const fileTypes = [
  'JPG',
  'PNG',
  'GIF',
  'PDF',
  'DOCX',
  'XLSX',
  'PPTX',
  'TXT',
  'ZIP',
  'MP4',
]

const schema = yup.object().shape({
  courseId: yup.string().required('Course is required'),
  file: yup
    .mixed<File>()
    .required('A file is required')
    .test('fileSize', 'File is too large', (value): value is File => {
      return value instanceof File && value.size <= 10 * 1024 * 1024 // 10MB
    })
    .test('fileType', 'Unsupported file format', (value): value is File => {
      const extension = value?.name?.split('.').pop()?.toUpperCase()
      return (
        value instanceof File && !!extension && fileTypes.includes(extension)
      )
    }),
})

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`evidence-tabpanel-${index}`}
      aria-labelledby={`evidence-tab-${index}`}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      {...other}
    >
      {value === index && children}
    </div>
  );
};

const EvidenceUploadWithCreation: FC<EvidenceUploadWithCreationProps> = ({ handleClose }) => {
  const navigate = useNavigate()
  const dispatch: any = useDispatch()
  const theme = useTheme()
  const [uploadEvidenceFile, { isLoading }] = useUploadEvidenceFileMutation()
  const [mainTab, setMainTab] = useState(0) // 0 = Upload File, 1 = Create Document
  const [docTab, setDocTab] = useState(0) // 0 = Word, 1 = Excel, 2 = PowerPoint
  const [loading, setLoading] = useState(false)

  // Document creation states
  const [selectedCourse, setSelectedCourse] = useState('')
  const [wordContent, setWordContent] = useState('')
  const [documentTitle, setDocumentTitle] = useState('')
  const [excelData, setExcelData] = useState<ExcelRow[]>([
    { A: 'Header 1', B: 'Header 2', C: 'Header 3' },
    { A: '', B: '', C: '' }
  ])
  const [sheetName, setSheetName] = useState('Evidence_Sheet')
  const [slides, setSlides] = useState<Slide[]>([
    { id: '1', title: 'Evidence Slide 1', content: 'Enter your evidence content here...' }
  ])
  const [presentationTitle, setPresentationTitle] = useState('')

  const data =
    useSelector(selectLearnerManagement)?.learner?.course?.map(
      (item) => item?.course
    ) || []

  // Debug course data
  console.log('Available courses:', data);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      courseId: '',
      file: null,
    },
  })

  const onSubmit = async (values: FormValues) => {
    const fromData = new FormData()
    fromData.append('file', values.file as File)
    fromData.append('course_id', values.courseId)

    try {
      const response = await uploadEvidenceFile(fromData).unwrap()

      if (response.status) {
        const { assignment_id } = response.data
        dispatch(
          showMessage({
            message: 'File uploaded successfully',
            variant: 'success',
          })
        )
        navigate(`/evidenceLibrary/${assignment_id}`)
        handleClose()
      }
    } catch {
      console.error('Error uploading file:', 'File upload failed')
      dispatch(showMessage({ message: 'File upload failed', variant: 'error' }))
      return
    }
  }

  // Excel functions
  const addExcelRow = () => {
    const newRow: ExcelRow = {};
    Object.keys(excelData[0] || {}).forEach(key => {
      newRow[key] = '';
    });
    setExcelData([...excelData, newRow]);
  };

  const updateExcelCell = (rowIndex: number, column: string, value: string) => {
    const newData = [...excelData];
    newData[rowIndex][column] = value;
    setExcelData(newData);
  };

  const deleteExcelRow = (rowIndex: number) => {
    if (excelData.length > 1) {
      const newData = excelData.filter((_, index) => index !== rowIndex);
      setExcelData(newData);
    }
  };

  // PowerPoint functions
  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Evidence Slide ${slides.length + 1}`,
      content: 'Enter your evidence content here...'
    };
    setSlides([...slides, newSlide]);
  };

  const updateSlide = (id: string, field: 'title' | 'content', value: string) => {
    setSlides(slides.map(slide => 
      slide.id === id ? { ...slide, [field]: value } : slide
    ));
  };

  const deleteSlide = (id: string) => {
    if (slides.length > 1) {
      setSlides(slides.filter(slide => slide.id !== id));
    }
  };

  // Document generation functions
  const generateWordDocument = (): Blob => {
    // Convert HTML content to plain text while preserving some formatting
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = wordContent;

    // Convert HTML formatting to text equivalents
    const processNode = (node: Node): string => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent || '';
      }

      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        let text = '';

        // Process child nodes first
        for (let child of Array.from(element.childNodes)) {
          text += processNode(child);
        }

        // Apply formatting based on tag
        switch (element.tagName?.toLowerCase()) {
          case 'b':
          case 'strong':
            return `**${text}**`; // Bold in markdown style
          case 'i':
          case 'em':
            return `*${text}*`; // Italic in markdown style
          case 'u':
            return `_${text}_`; // Underline as underscore
          case 'ul':
            return `\n${text}\n`;
          case 'ol':
            return `\n${text}\n`;
          case 'li':
            return `• ${text}\n`;
          case 'br':
            return '\n';
          case 'p':
          case 'div':
            return `${text}\n`;
          default:
            return text;
        }
      }

      return '';
    };

    const plainText = processNode(tempDiv);
    const content = `${documentTitle}\n\n${plainText}`;
    return new Blob([content], { type: 'application/pdf' });
  };

  const generateExcelDocument = (): Blob => {
    const csvContent = excelData.map(row => 
      Object.values(row).join(',')
    ).join('\n');
    return new Blob([csvContent], { type: 'text/csv' });
  };

  const generatePowerPointDocument = (): Blob => {
    // Create an HTML presentation that looks like PowerPoint
    let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${presentationTitle}</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        .presentation-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            overflow: hidden;
        }
        .presentation-header {
            background: #d83b01;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .presentation-title {
            font-size: 2.5em;
            margin: 0;
            font-weight: bold;
        }
        .presentation-info {
            margin-top: 10px;
            opacity: 0.9;
            font-size: 1.1em;
        }
        .slide {
            padding: 40px;
            border-bottom: 3px solid #f0f0f0;
            min-height: 400px;
            display: flex;
            flex-direction: column;
        }
        .slide:last-child {
            border-bottom: none;
        }
        .slide-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 30px;
        }
        .slide-number {
            background: #d83b01;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            font-size: 0.9em;
        }
        .slide-title {
            color: #d83b01;
            font-size: 2em;
            font-weight: bold;
            margin: 0;
            flex: 1;
            margin-left: 20px;
        }
        .slide-content {
            font-size: 1.2em;
            line-height: 1.6;
            color: #333;
            white-space: pre-wrap;
            flex: 1;
        }
        .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        @media print {
            body { background: white; }
            .slide { page-break-after: always; }
            .slide:last-child { page-break-after: auto; }
        }
        @media (max-width: 768px) {
            .slide-header { flex-direction: column; align-items: flex-start; }
            .slide-title { margin-left: 0; margin-top: 10px; }
            .slide { padding: 20px; }
        }
    </style>
</head>
<body>
    <div class="presentation-container">
        <div class="presentation-header">
            <h1 class="presentation-title">${presentationTitle}</h1>
            <div class="presentation-info">
                Created: ${new Date().toLocaleDateString()} | ${slides.length} Slides | Evidence Presentation
            </div>
        </div>
`;

    slides.forEach((slide, index) => {
      // Convert HTML content to plain text for slide content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = slide.content;
      const plainContent = tempDiv.textContent || tempDiv.innerText || '';

      htmlContent += `
        <div class="slide">
            <div class="slide-header">
                <h2 class="slide-title">${slide.title}</h2>
            </div>
            <div class="slide-content">${plainContent}</div>
        </div>`;
    });

    htmlContent += `
        <div class="footer">
            <p>${new Date().toLocaleString()}</p>
        </div>
    </div>
</body>
</html>`;

    return new Blob([htmlContent], { type: 'text/html' });
  };

  // Upload created document as evidence
  const uploadCreatedDocument = async (file: Blob, filename: string) => {
    if (!selectedCourse) {
      dispatch(showMessage({
        message: 'Please select a course',
        variant: 'error'
      }));
      return;
    }

    try {
      setLoading(true);

      console.log('Starting upload process...', {
        filename,
        fileSize: file.size,
        fileType: file.type,
        selectedCourse
      });

      const formData = new FormData();
      formData.append('file', file, filename);
      formData.append('course_id', selectedCourse);

      console.log('FormData created, calling API...');
      const response = await uploadEvidenceFile(formData).unwrap();
      console.log('API Response:', response);

      if (response.status) {
        const { assignment_id } = response.data;
        dispatch(showMessage({
          message: 'Document created and uploaded successfully as evidence!',
          variant: 'success',
        }));
        navigate(`/evidenceLibrary/${assignment_id}`);
        handleClose();
      } else {
        throw new Error(response.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);

      let errorMessage = 'Failed to upload document. Please try again.';
      if (error && typeof error === 'object') {
        if ('data' in error && error.data && typeof error.data === 'object' && 'message' in error.data) {
          errorMessage = error.data.message as string;
        } else if ('message' in error) {
          errorMessage = error.message as string;
        }
      }

      dispatch(showMessage({
        message: errorMessage,
        variant: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Document creation handlers
  const handleWordCreate = async () => {
    console.log('handleWordCreate called', {
      documentTitle,
      wordContentLength: wordContent.length,
      selectedCourse,
      loading
    });

    try {
      if (!selectedCourse) {
        throw new Error('Please select a course first');
      }
      if (!documentTitle.trim()) {
        throw new Error('Document title is required');
      }
      if (!wordContent.trim()) {
        throw new Error('Document content cannot be empty');
      }

      const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head><meta charset='utf-8'><title>${documentTitle}</title></head><body>`
      const footer = '</body></html>'
      const html = `${header}<h2>${documentTitle}</h2>${wordContent}${footer}`

      const blob = new Blob([html], {
        type: 'application/msword;charset=utf-8',
      })

      const filename = `${documentTitle || 'document'}.doc`;
      await uploadCreatedDocument(blob, filename);
    } catch (error) {
      console.error('Word creation error:', error);
      dispatch(showMessage({
        message: error instanceof Error ? error.message : 'Failed to create document.',
        variant: 'error'
      }));
    }
  };

  const handleExcelCreate = async () => {
    console.log('handleExcelCreate called', {
      sheetName,
      excelDataRows: excelData.length,
      selectedCourse,
      loading
    });

    try {
      if (!selectedCourse) {
        throw new Error('Please select a course first');
      }
      if (!sheetName.trim()) {
        throw new Error('Sheet name is required');
      }

      const hasData = excelData.some(row =>
        Object.values(row).some(cell => cell.trim() !== '')
      );

      if (!hasData) {
        throw new Error('Please add some data to the spreadsheet');
      }

      const blob = generateExcelDocument();
      const filename = `${sheetName}.csv`;
      await uploadCreatedDocument(blob, filename);
    } catch (error) {
      console.error('Excel creation error:', error);
      dispatch(showMessage({
        message: error instanceof Error ? error.message : 'Failed to create spreadsheet.',
        variant: 'error'
      }));
    }
  };

  const handlePowerPointCreate = async () => {
    console.log('handlePowerPointCreate called', {
      presentationTitle,
      slidesCount: slides.length,
      selectedCourse,
      loading
    });

    try {
      if (!selectedCourse) {
        throw new Error('Please select a course first');
      }
      if (!presentationTitle.trim()) {
        throw new Error('Presentation title is required');
      }

      const invalidSlides = slides.filter(slide =>
        !slide.title.trim() || !slide.content.trim()
      );

      if (invalidSlides.length > 0) {
        throw new Error('All slides must have both title and content');
      }

      const blob = generatePowerPointDocument();
      const filename = `${presentationTitle}.html`;
      await uploadCreatedDocument(blob, filename);
    } catch (error) {
      console.error('PowerPoint creation error:', error);
      dispatch(showMessage({
        message: error instanceof Error ? error.message : 'Failed to create presentation.',
        variant: 'error'
      }));
    }
  };

  return (
    <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ 
        p: 3, 
        borderBottom: 1, 
        borderColor: 'divider',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        color: theme.palette.primary.contrastText,
        position: 'relative'
      }}>
        <IconButton
          onClick={handleClose}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: theme.palette.primary.contrastText,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
            }
          }}
          size="small"
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
          📁 Add Evidence
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          Upload files or create new documents as evidence
        </Typography>
      </Box>

      {/* Main Tabs */}
      <Tabs 
        value={mainTab} 
        onChange={(e, newValue) => setMainTab(newValue)} 
        variant="fullWidth"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTab-root': {
            minHeight: 64,
            fontSize: '1rem',
            fontWeight: 500,
            textTransform: 'none'
          }
        }}
      >
        <Tab 
          icon={<FileUploadIcon sx={{ fontSize: 24 }} />} 
          label="Upload File" 
          iconPosition="start"
        />
        <Tab 
          icon={<CreateIcon sx={{ fontSize: 24 }} />} 
          label="Create Document" 
          iconPosition="start"
        />
      </Tabs>

      {/* Upload File Tab */}
      <TabPanel value={mainTab} index={0}>
        <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <form onSubmit={handleSubmit(onSubmit)} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Grid container spacing={3} sx={{ flex: 1 }}>
              {/* Course Selection Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 3, 
                  height: '100%',
                  border: '2px solid',
                  borderColor: errors.courseId ? theme.palette.error.main : theme.palette.primary.light,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: theme.palette.primary.main
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      📚 Select Course
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Choose the course this evidence belongs to
                  </Typography>
                  <Controller
                    name="courseId"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.courseId}>
                        <Select
                          {...field}
                          displayEmpty
                          sx={{ 
                            '& .MuiSelect-select': {
                              py: 1.5
                            }
                          }}
                        >
                          <MenuItem value="" disabled>
                            <em>Select a course...</em>
                          </MenuItem>
                          {data.map((course) => (
                            <MenuItem key={course.course_id} value={course.course_id}>
                              {course.course_name}
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.courseId && (
                          <FormHelperText>{errors.courseId.message}</FormHelperText>
                        )}
                      </FormControl>
                    )}
                  />
                </Card>
              </Grid>

              {/* File Upload Card */}
              <Grid item xs={12} md={6}>
                <Card sx={{ 
                  p: 3, 
                  height: '100%',
                  border: '2px solid',
                  borderColor: errors.file ? theme.palette.error.main : theme.palette.primary.light,
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: 4,
                    borderColor: theme.palette.primary.main
                  }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      📄 Upload File
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Drag and drop your evidence file or click to browse
                  </Typography>
                  
                  <Controller
                    name="file"
                    control={control}
                    render={({ field }) => (
                      <FileUploader
                        handleChange={(file: File) => {
                          field.onChange(file)
                          setValue('file', file)
                        }}
                        name="file"
                        types={fileTypes}
                        multiple={false}
                        maxSize={10}
                      >
                        <Box
                          sx={{
                            border: '3px dashed',
                            borderColor: errors.file ? theme.palette.error.main : field.value ? theme.palette.success?.main || '#4caf50' : theme.palette.primary.light,
                            borderRadius: 2,
                            p: 3,
                            cursor: 'pointer',
                            bgcolor: field.value ? theme.palette.success?.light || '#e8f5e8' : theme.palette.background.paper,
                            transition: 'all 0.3s',
                            minHeight: 200,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': {
                              borderColor: theme.palette.primary.main,
                              bgcolor: theme.palette.action.hover,
                              transform: 'scale(1.02)'
                            }
                          }}
                        >
                          {field.value ? (
                            <>
                              <CheckIcon sx={{ fontSize: 64, color: theme.palette.success?.main || '#4caf50', mb: 2 }} />
                              <Typography variant="h6" sx={{ color: theme.palette.success?.main || '#4caf50', fontWeight: 600, mb: 1 }}>
                                File Selected!
                              </Typography>
                              <Typography variant="body1" color="text.primary" sx={{ fontWeight: 500, mb: 0.5 }}>
                                {field.value.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ({(field.value.size / 1024 / 1024).toFixed(2)} MB)
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                Click or drop to change file
                              </Typography>
                            </>
                          ) : (
                            <>
                              <UploadIcon sx={{ fontSize: 64, color: theme.palette.action.active, mb: 2 }} />
                              <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
                                Drop your file here
                              </Typography>
                              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                                or <span style={{ color: theme.palette.primary.main, fontWeight: 600 }}>browse</span> to upload
                              </Typography>
                              <Box sx={{ 
                                p: 2, 
                                bgcolor: theme.palette.info?.light || theme.palette.action.hover, 
                                borderRadius: 1,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1
                              }}>
                                <InfoIcon sx={{ fontSize: 18, color: theme.palette.info?.main || theme.palette.primary.main }} />
                                <Typography variant="caption" color="text.secondary">
                                  Max 10MB • JPG, PNG, PDF, DOCX, XLSX, PPTX, TXT, ZIP, MP4
                                </Typography>
                              </Box>
                            </>
                          )}
                        </Box>
                      </FileUploader>
                    )}
                  />
                  {errors.file && (
                    <FormHelperText error sx={{ mt: 1 }}>
                      {errors.file.message}
                    </FormHelperText>
                  )}
                </Card>
              </Grid>
            </Grid>

            {/* Action Buttons */}
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 4,
              pt: 3,
              borderTop: 1,
              borderColor: 'divider'
            }}>
              <Typography variant="body2" color="text.secondary">
                * All fields are required
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={isLoading}
                  size="large"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  size="large"
                  startIcon={isLoading ? <CircularProgress size={20} /> : <UploadIcon />}
                  sx={{ 
                    minWidth: 160,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    '&:hover': {
                      background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                    }
                  }}
                >
                  {isLoading ? 'Uploading...' : 'Upload Evidence'}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </TabPanel>

      {/* Create Document Tab */}
      <TabPanel value={mainTab} index={1}>
        <Box sx={{ p: 4, flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Course Selection Card */}
          <Card sx={{ 
            p: 3, 
            mb: 3,
            border: '2px solid', 
            transition: 'all 0.3s'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                {selectedCourse ? '✅' : '⚠️'} Select Course for Evidence
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which course this document will be associated with
            </Typography>
            <FormControl fullWidth>
              <Select
                value={selectedCourse}
                displayEmpty
                onChange={(e) => {
                  console.log('Course selected:', e.target.value);
                  setSelectedCourse(e.target.value);
                }}
                sx={{
                  '& .MuiSelect-select': {
                    py: 1.5
                  }
                }}
              >
                <MenuItem value="" disabled>
                  <em>Select a course...</em>
                </MenuItem>
                {data.map((course) => (
                  <MenuItem key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Card>

          {/* Document Type Selection */}
          <Card sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ 
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              p: 2,
              color: theme.palette.primary.contrastText
            }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                ✏️ Choose Document Type
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
                Select the type of document you want to create
              </Typography>
            </Box>
            
            <Tabs 
              value={docTab} 
              onChange={(e, newValue) => setDocTab(newValue)} 
              variant="fullWidth"
              sx={{ 
                borderBottom: 1, 
                borderColor: 'divider',
                '& .MuiTab-root': {
                  minHeight: 64,
                  fontSize: '1rem',
                  fontWeight: 500,
                  textTransform: 'none'
                }
              }}
            >
              <Tab 
                icon={<DocumentIcon sx={{ fontSize: 24 }} />} 
                label="Word Document" 
                iconPosition="start"
              />
              <Tab 
                icon={<ExcelIcon sx={{ fontSize: 24 }} />} 
                label="Excel Spreadsheet" 
                iconPosition="start"
              />
              <Tab 
                icon={<PowerPointIcon sx={{ fontSize: 24 }} />} 
                label="PowerPoint" 
                iconPosition="start"
              />
            </Tabs>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Word Document Creation */}
              <TabPanel value={docTab} index={0}>
                <Box sx={{ flex: 1 }}>
                  <WordEditor
                    documentTitle={documentTitle}
                    setDocumentTitle={setDocumentTitle}
                    wordContent={wordContent}
                    setWordContent={setWordContent}
                    onSaveUpload={handleWordCreate}
                    loading={loading}
                    disabled={!selectedCourse}
                  />
                </Box>
              </TabPanel>

              {/* Excel Spreadsheet Creation */}
              <TabPanel value={docTab} index={1}>
                <Box sx={{ flex: 1 }}>
                  <ExcelEditor
                    sheetName={sheetName}
                    setSheetName={setSheetName}
                    excelData={excelData}
                    setExcelData={setExcelData}
                    onSaveUpload={handleExcelCreate}
                    loading={loading}
                    disabled={!selectedCourse}
                  />
                </Box>
              </TabPanel>

              {/* PowerPoint Presentation Creation */}
              <TabPanel value={docTab} index={2}>
                <Box sx={{ flex: 1 }}>
                  <PowerPointEditor
                    presentationTitle={presentationTitle}
                    setPresentationTitle={setPresentationTitle}
                    slides={slides}
                    setSlides={setSlides}
                    onSaveUpload={handlePowerPointCreate}
                    loading={loading}
                    disabled={!selectedCourse}
                  />
                </Box>
              </TabPanel>
            </Box>

            <Box sx={{ 
              p: 3,
              borderTop: 1,
              borderColor: 'divider',
              display: 'flex', 
              justifyContent: 'flex-end' 
            }}>
              <Button 
                variant="outlined" 
                onClick={handleClose} 
                disabled={loading}
                size="large"
              >
                Cancel
              </Button>
            </Box>
          </Card>
        </Box>
      </TabPanel>
    </Box>
  )
}

export default EvidenceUploadWithCreation
