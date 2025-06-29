import React, { useState } from 'react';
import {
  Box,
  Tabs,
  Tab,
  Paper,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';

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

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const SimpleCreateAndUploadDocument: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  // Word Editor State
  const [wordContent, setWordContent] = useState('');
  const [documentTitle, setDocumentTitle] = useState('');

  // Excel Editor State
  const [excelData, setExcelData] = useState<ExcelRow[]>([
    { A: 'Header 1', B: 'Header 2', C: 'Header 3' },
    { A: '', B: '', C: '' }
  ]);
  const [sheetName, setSheetName] = useState('Sheet1');

  // PowerPoint Editor State
  const [slides, setSlides] = useState<Slide[]>([
    { id: '1', title: 'Slide 1', content: 'Enter your content here...' }
  ]);
  const [presentationTitle, setPresentationTitle] = useState('');

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Excel Editor Functions
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

  // PowerPoint Editor Functions
  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${slides.length + 1}`,
      content: 'Enter your content here...'
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

  // Simple file generation functions that create basic text files
  const generateSimpleWordDocument = (): Blob => {
    const content = `${documentTitle}\n\n${wordContent}`;
    return new Blob([content], { type: 'text/plain' });
  };

  const generateSimpleExcelDocument = (): Blob => {
    const csvContent = excelData.map(row => 
      Object.values(row).join(',')
    ).join('\n');
    return new Blob([csvContent], { type: 'text/csv' });
  };

  const generateSimplePowerPointDocument = (): Blob => {
    const content = `${presentationTitle}\n\n` + 
      slides.map((slide, index) => 
        `Slide ${index + 1}: ${slide.title}\n${slide.content}\n\n`
      ).join('');
    return new Blob([content], { type: 'text/plain' });
  };

  // Upload Function
  const uploadDocument = async (file: Blob, filename: string) => {
    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('file', file, filename);

      const token = localStorage.getItem('jwt_access_token') || 
                   localStorage.getItem('authToken') || 
                   sessionStorage.getItem('token');
      
      if (!token) {
        throw new Error('Authentication token not found. Please login again.');
      }
      
      const response = await fetch('/api/v1/assignment/create', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        dispatch(showMessage({
          message: `${filename} uploaded successfully!`,
          variant: 'success'
        }));
        
        // Reset form data after successful upload
        resetFormData();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      dispatch(showMessage({
        message: error instanceof Error ? error.message : 'Failed to upload document. Please try again.',
        variant: 'error'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Reset form data after successful upload
  const resetFormData = () => {
    switch (activeTab) {
      case 0: // Word
        setWordContent('');
        setDocumentTitle('');
        break;
      case 1: // Excel
        setExcelData([
          { A: 'Header 1', B: 'Header 2', C: 'Header 3' },
          { A: '', B: '', C: '' }
        ]);
        setSheetName('Sheet1');
        break;
      case 2: // PowerPoint
        setSlides([{ id: '1', title: 'Slide 1', content: 'Enter your content here...' }]);
        setPresentationTitle('');
        break;
    }
  };

  // Save & Upload Handlers
  const handleWordSaveUpload = async () => {
    try {
      if (!documentTitle.trim()) {
        throw new Error('Document title is required');
      }
      if (!wordContent.trim()) {
        throw new Error('Document content cannot be empty');
      }
      
      const blob = generateSimpleWordDocument();
      const filename = `${documentTitle}.txt`;
      await uploadDocument(blob, filename);
    } catch (error) {
      console.error('Word generation error:', error);
      dispatch(showMessage({
        message: error instanceof Error ? error.message : 'Failed to generate Word document.',
        variant: 'error'
      }));
    }
  };

  const handleExcelSaveUpload = async () => {
    try {
      if (!sheetName.trim()) {
        throw new Error('Sheet name is required');
      }
      
      const hasData = excelData.some(row => 
        Object.values(row).some(cell => cell.trim() !== '')
      );
      
      if (!hasData) {
        throw new Error('Please add some data to the spreadsheet');
      }

      const blob = generateSimpleExcelDocument();
      const filename = `${sheetName}.csv`;
      await uploadDocument(blob, filename);
    } catch (error) {
      console.error('Excel generation error:', error);
      dispatch(showMessage({
        message: error instanceof Error ? error.message : 'Failed to generate Excel document.',
        variant: 'error'
      }));
    }
  };

  const handlePowerPointSaveUpload = async () => {
    try {
      if (!presentationTitle.trim()) {
        throw new Error('Presentation title is required');
      }
      
      const invalidSlides = slides.filter(slide => 
        !slide.title.trim() || !slide.content.trim()
      );
      
      if (invalidSlides.length > 0) {
        throw new Error('All slides must have both title and content');
      }

      const blob = generateSimplePowerPointDocument();
      const filename = `${presentationTitle}.html`;
      await uploadDocument(blob, filename);
    } catch (error) {
      console.error('PowerPoint generation error:', error);
      dispatch(showMessage({
        message: error instanceof Error ? error.message : 'Failed to generate PowerPoint document.',
        variant: 'error'
      }));
    }
  };

  return (
    <Paper elevation={3} sx={{ width: '100%', maxWidth: 1200, margin: 'auto' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="document creation tabs">
          <Tab label="Word Document" />
          <Tab label="Excel Spreadsheet" />
          <Tab label="PowerPoint Presentation" />
        </Tabs>
      </Box>

      {/* Word Editor Tab */}
      <TabPanel value={activeTab} index={0}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Document Title"
            value={documentTitle}
            onChange={(e) => setDocumentTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={10}
            label="Document Content"
            value={wordContent}
            onChange={(e) => setWordContent(e.target.value)}
            placeholder="Start writing your document content here..."
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleWordSaveUpload}
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Save & Upload Word Document'}
          </Button>
        </Box>
      </TabPanel>

      {/* Excel Editor Tab */}
      <TabPanel value={activeTab} index={1}>
        <Box sx={{ mb: 3 }}>
          <TextField
            label="Sheet Name"
            value={sheetName}
            onChange={(e) => setSheetName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Spreadsheet Data
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addExcelRow}
            >
              Add Row
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {Object.keys(excelData[0] || {}).map((column) => (
                    <TableCell key={column}>{column}</TableCell>
                  ))}
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {excelData.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Object.keys(row).map((column) => (
                      <TableCell key={column}>
                        <TextField
                          size="small"
                          value={row[column]}
                          onChange={(e) => updateExcelCell(rowIndex, column, e.target.value)}
                          variant="outlined"
                        />
                      </TableCell>
                    ))}
                    <TableCell>
                      <IconButton
                        onClick={() => deleteExcelRow(rowIndex)}
                        disabled={excelData.length <= 1}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleExcelSaveUpload}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Uploading...' : 'Save & Upload Excel Spreadsheet'}
          </Button>
        </Box>
      </TabPanel>

      {/* PowerPoint Editor Tab */}
      <TabPanel value={activeTab} index={2}>
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            label="Presentation Title"
            value={presentationTitle}
            onChange={(e) => setPresentationTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Slides
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addSlide}
            >
              Add Slide
            </Button>
          </Box>
          <Grid container spacing={2}>
            {slides.map((slide, index) => (
              <Grid item xs={12} md={6} key={slide.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1">
                        Slide {index + 1}
                      </Typography>
                      <IconButton
                        onClick={() => deleteSlide(slide.id)}
                        disabled={slides.length <= 1}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    <TextField
                      fullWidth
                      label="Slide Title"
                      value={slide.title}
                      onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Slide Content"
                      value={slide.content}
                      onChange={(e) => updateSlide(slide.id, 'content', e.target.value)}
                    />
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handlePowerPointSaveUpload}
            disabled={loading}
            sx={{ mt: 2 }}
          >
            {loading ? 'Uploading...' : 'Save & Upload PowerPoint Presentation'}
          </Button>
        </Box>
      </TabPanel>
    </Paper>
  );
};

export default SimpleCreateAndUploadDocument;
