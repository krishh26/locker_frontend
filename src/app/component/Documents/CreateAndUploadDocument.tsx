import React, { useState, useRef } from 'react';
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
  CardContent,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  CloudUpload as UploadIcon
} from '@mui/icons-material';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { quillModules, quillFormats, quillStyles } from './quillConfig';

// Import libraries for file generation
import * as XLSX from 'xlsx';
import PptxGenJS from 'pptxgenjs';
import { Document, Packer, Paragraph, TextRun } from 'docx';

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

const CreateAndUploadDocument: React.FC = () => {
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

  // Word Editor Functions
  const generateWordDocument = async (): Promise<Blob> => {
    if (!documentTitle.trim()) {
      throw new Error('Document title is required');
    }

    if (!wordContent.trim()) {
      throw new Error('Document content cannot be empty');
    }

    // Convert HTML content to plain text with basic formatting
    const cleanContent = wordContent
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .trim();

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: documentTitle,
                bold: true,
                size: 32,
                color: '2E74B5',
              }),
            ],
            spacing: {
              after: 400,
            },
          }),
          ...cleanContent.split('\n').map(line =>
            new Paragraph({
              children: [
                new TextRun({
                  text: line || ' ', // Ensure empty lines are preserved
                  size: 24,
                }),
              ],
              spacing: {
                after: 200,
              },
            })
          ),
        ],
      }],
    });

    return await Packer.toBlob(doc);
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

  const generateExcelDocument = (): Blob => {
    if (!sheetName.trim()) {
      throw new Error('Sheet name is required');
    }

    // Validate that there's at least some data
    const hasData = excelData.some(row =>
      Object.values(row).some(cell => cell.trim() !== '')
    );

    if (!hasData) {
      throw new Error('Please add some data to the spreadsheet');
    }

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
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

  const generatePowerPointDocument = async (): Promise<Blob> => {
    if (!presentationTitle.trim()) {
      throw new Error('Presentation title is required');
    }

    // Validate that all slides have content
    const invalidSlides = slides.filter(slide =>
      !slide.title.trim() || !slide.content.trim()
    );

    if (invalidSlides.length > 0) {
      throw new Error('All slides must have both title and content');
    }

    const pptx = new PptxGenJS();

    // Set presentation properties
    pptx.title = presentationTitle;
    pptx.author = 'Document Creator';
    pptx.company = 'Your Company';

    slides.forEach((slide, index) => {
      const pptxSlide = pptx.addSlide();

      // Add slide number
      pptxSlide.addText(`${index + 1}`, {
        x: 9.5,
        y: 7,
        w: 0.5,
        h: 0.3,
        fontSize: 12,
        color: '666666',
        align: 'right'
      });

      // Add title with better styling
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: 9,
        h: 1.2,
        fontSize: 28,
        bold: true,
        color: '2E74B5',
        align: 'left'
      });

      // Add content with better formatting
      pptxSlide.addText(slide.content, {
        x: 0.5,
        y: 2.2,
        w: 9,
        h: 4.5,
        fontSize: 18,
        color: '363636',
        align: 'left',
        valign: 'top'
      });
    });

    return await pptx.writeFile();
  };

  // Upload Function
  const uploadDocument = async (file: Blob, filename: string) => {
    try {
      setLoading(true);

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size exceeds 10MB limit');
      }

      const formData = new FormData();
      formData.append('file', file, filename);

      // Get token from localStorage or your auth store
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
        const result = await response.json();
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
      const blob = await generateWordDocument();
      const filename = `${documentTitle || 'document'}.docx`;
      await uploadDocument(blob, filename);
    } catch (error) {
      console.error('Word generation error:', error);
      dispatch(showMessage({
        message: 'Failed to generate Word document.',
        variant: 'error'
      }));
    }
  };

  const handleExcelSaveUpload = async () => {
    try {
      const blob = generateExcelDocument();
      const filename = `${sheetName || 'spreadsheet'}.xlsx`;
      await uploadDocument(blob, filename);
    } catch (error) {
      console.error('Excel generation error:', error);
      dispatch(showMessage({
        message: 'Failed to generate Excel document.',
        variant: 'error'
      }));
    }
  };

  const handlePowerPointSaveUpload = async () => {
    try {
      const blob = await generatePowerPointDocument();
      const filename = `${presentationTitle || 'presentation'}.pdf`;
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
          <Typography variant="h6" gutterBottom>
            Document Content
          </Typography>
          <ReactQuill
            theme="snow"
            value={wordContent}
            onChange={setWordContent}
            modules={quillModules}
            formats={quillFormats}
            style={quillStyles}
            placeholder="Start writing your document content here..."
          />
          <Button
            variant="contained"
            startIcon={<UploadIcon />}
            onClick={handleWordSaveUpload}
            disabled={loading}
            sx={{ mt: 2 }}
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

export default CreateAndUploadDocument;
