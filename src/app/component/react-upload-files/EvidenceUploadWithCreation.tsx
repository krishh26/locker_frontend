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
  Slideshow as PowerPointIcon
} from '@mui/icons-material'
import { FileUploader } from 'react-drag-drop-files'
import { Controller, useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import * as yup from 'yup'

import { useUploadEvidenceFileMutation } from 'app/store/api/evidence-api'
import { showMessage } from 'app/store/fuse/messageSlice'
import { selectLearnerManagement } from 'app/store/learnerManagement'
import { useDispatch } from 'react-redux'

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
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const EvidenceUploadWithCreation: FC<EvidenceUploadWithCreationProps> = ({ handleClose }) => {
  const navigate = useNavigate()
  const dispatch: any = useDispatch()
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

      const blob = generateWordDocument();
      const filename = `${documentTitle}.pdf`;
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
    <Box sx={{ width: '100%', maxWidth: 800 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Add Evidence
      </Typography>
      
      <Tabs 
        value={mainTab} 
        onChange={(e, newValue) => setMainTab(newValue)} 
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
      >
        <Tab label="Upload File" />
        <Tab label="Create Document" />
      </Tabs>

      {/* Upload File Tab */}
      <TabPanel value={mainTab} index={0}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Select Course
              </Typography>
              <Controller
                name="courseId"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    fullWidth
                    displayEmpty
                    error={!!errors.courseId}
                  >
                    <MenuItem value="">
                      <em>Select a course</em>
                    </MenuItem>
                    {data.map((course) => (
                      <MenuItem key={course.course_id} value={course.course_id}>
                        {course.course_name}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              />
              {errors.courseId && (
                <FormHelperText error>{errors.courseId.message}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Upload Evidence File
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
                    <div
                      className={`relative border border-dashed border-gray-300 p-20 cursor-pointer rounded-md hover:shadow-md transition-all h-[200px] flex flex-col items-center justify-center ${
                        errors.file ? 'border-red-500' : ''
                      }`}
                    >
                      <div className='flex justify-center mb-4'>
                        <img
                          src='assets/images/svgImage/uploadimage.svg'
                          alt='Upload'
                          className='w-36 h-36 object-contain mx-auto'
                        />
                      </div>
                      {field.value ? (
                        <div className='text-center text-gray-700 font-medium'>
                          <p>{field.value.name}</p>
                        </div>
                      ) : (
                        <>
                          <p className='text-center mb-2 text-gray-600'>
                            Drag and drop your files here or{' '}
                            <span className='text-blue-500 underline'>Browse</span>
                          </p>
                          <p className='text-center text-sm text-gray-500'>
                            Supported formats: JPG, PNG, PDF, DOCX, XLSX, PPTX, etc.
                          </p>
                        </>
                      )}
                    </div>
                  </FileUploader>
                )}
              />
              {errors.file && (
                <FormHelperText error>{errors.file.message}</FormHelperText>
              )}
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outlined"
                  onClick={handleClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isLoading}
                  startIcon={isLoading ? <CircularProgress size={20} /> : <UploadIcon />}
                >
                  {isLoading ? 'Uploading...' : 'Upload Evidence'}
                </Button>
              </div>
            </Grid>
          </Grid>
        </form>
      </TabPanel>

      {/* Create Document Tab */}
      <TabPanel value={mainTab} index={1}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Select Course for Evidence
          </Typography>
          <FormControl fullWidth>
            <InputLabel id="course-select-label">Select a course</InputLabel>
            <Select
              labelId="course-select-label"
              value={selectedCourse}
              label="Select a course"
              onChange={(e) => {
                console.log('Course selected:', e.target.value);
                setSelectedCourse(e.target.value);
              }}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {data.map((course) => (
                <MenuItem key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {!selectedCourse && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Please select a course to enable document creation and upload.
            </Typography>
          )}
        </Box>

        <Tabs 
          value={docTab} 
          onChange={(e, newValue) => setDocTab(newValue)} 
          sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
        >
          <Tab icon={<DocumentIcon />} label="Word Document" />
          <Tab icon={<ExcelIcon />} label="Excel Spreadsheet" />
          <Tab icon={<PowerPointIcon />} label="PowerPoint" />
        </Tabs>

        {/* Word Document Creation */}
        <TabPanel value={docTab} index={0}>
          <WordEditor
            documentTitle={documentTitle}
            setDocumentTitle={setDocumentTitle}
            wordContent={wordContent}
            setWordContent={setWordContent}
            onSaveUpload={handleWordCreate}
            loading={loading}
            disabled={!selectedCourse}
          />
        </TabPanel>

        {/* Excel Spreadsheet Creation */}
        <TabPanel value={docTab} index={1}>
          <ExcelEditor
            sheetName={sheetName}
            setSheetName={setSheetName}
            excelData={excelData}
            setExcelData={setExcelData}
            onSaveUpload={handleExcelCreate}
            loading={loading}
            disabled={!selectedCourse}
          />
        </TabPanel>

        {/* PowerPoint Presentation Creation */}
        <TabPanel value={docTab} index={2}>
          <PowerPointEditor
            presentationTitle={presentationTitle}
            setPresentationTitle={setPresentationTitle}
            slides={slides}
            setSlides={setSlides}
            onSaveUpload={handlePowerPointCreate}
            loading={loading}
            disabled={!selectedCourse}
          />
        </TabPanel>

        <Divider sx={{ my: 2 }} />
        <div className="flex justify-end">
          <Button variant="outlined" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
        </div>
      </TabPanel>
    </Box>
  )
}

export default EvidenceUploadWithCreation
