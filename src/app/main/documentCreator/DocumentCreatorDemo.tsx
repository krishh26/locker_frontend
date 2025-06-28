import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Breadcrumbs,
  Link,
  Button,
  Dialog
} from '@mui/material';
import {
  Description as DocumentIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import EvidenceUploadWithCreation from 'src/app/component/react-upload-files/EvidenceUploadWithCreation';

const DocumentCreatorDemo: React.FC = () => {
  const [open, setOpen] = useState(false);

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
        <Link
          underline="hover"
          sx={{ display: 'flex', alignItems: 'center' }}
          color="inherit"
          href="/"
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Typography
          sx={{ display: 'flex', alignItems: 'center' }}
          color="text.primary"
        >
          <DocumentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Document Creator Demo
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          🎉 Enhanced Evidence Library with Realistic Document Creators
        </Typography>
        <Typography variant="subtitle1">
          Create professional-looking Word documents, Excel spreadsheets, and PowerPoint presentations with realistic Microsoft Office-style interfaces
        </Typography>
      </Paper>

      {/* Instructions */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom color="primary">
          How to Use the Enhanced Evidence Library
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>📁 Upload Existing Files:</strong> Use the "Upload File" tab to upload existing documents, images, or other evidence files with drag-and-drop support.
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>📄 Create Word Documents:</strong> Use the realistic Word editor with toolbar, formatting options, ruler, and page layout - just like Microsoft Word!
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>📊 Create Excel Spreadsheets:</strong> Use the Excel-style editor with formula bar, cell references, and professional green theme - just like Microsoft Excel!
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>📽️ Create PowerPoint Presentations:</strong> Use the PowerPoint editor with slide thumbnails, speaker notes, and orange theme - just like Microsoft PowerPoint!
          </Typography>
          <Typography component="li" variant="body2">
            <strong>🚀 All created documents are automatically uploaded to your selected course as evidence.</strong>
          </Typography>
        </Box>
      </Paper>

      {/* Demo Button */}
      <Paper elevation={2} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" gutterBottom>
          🎯 Try the Enhanced Evidence Upload with Realistic Document Creators
        </Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Click the button below to open the enhanced evidence upload dialog featuring realistic Microsoft Office-style document creation interfaces!
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => setOpen(true)}
          startIcon={<DocumentIcon />}
        >
          🚀 Open Enhanced Evidence Upload with Realistic Editors
        </Button>
      </Paper>

      {/* Demo Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        sx={{
          '.MuiDialog-paper': {
            borderRadius: '4px',
            padding: '1rem',
          },
        }}
      >
        <EvidenceUploadWithCreation handleClose={handleClose} />
      </Dialog>

      {/* Features List */}
      <Paper elevation={1} sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom color="primary">
          🎨 Realistic Microsoft Office-Style Features
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2 }}>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#0078d4' }}>
              📄 Word Document Editor
            </Typography>
            <Typography variant="body2">
              • Microsoft Word-style interface<br/>
              • Realistic toolbar with formatting options<br/>
              • Font family and size selection<br/>
              • Ruler and page layout<br/>
              • Word count and status bar<br/>
              • Professional document appearance
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#217346' }}>
              📊 Excel Spreadsheet Editor
            </Typography>
            <Typography variant="body2">
              • Microsoft Excel-style interface<br/>
              • Formula bar with cell references<br/>
              • Column headers (A, B, C...)<br/>
              • Row numbers and cell selection<br/>
              • Professional green theme<br/>
              • Add/remove rows and columns
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#d83b01' }}>
              📽️ PowerPoint Presentation Editor
            </Typography>
            <Typography variant="body2">
              • Microsoft PowerPoint-style interface<br/>
              • Slide thumbnail panel<br/>
              • Professional orange theme<br/>
              • Speaker notes section<br/>
              • Slide navigation and management<br/>
              • Real presentation layout
            </Typography>
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1, color: '#6264a7' }}>
              📁 Enhanced File Upload
            </Typography>
            <Typography variant="body2">
              • Drag and drop interface<br/>
              • Multiple file format support<br/>
              • 10MB file size limit<br/>
              • Course assignment integration<br/>
              • Progress indicators<br/>
              • Error handling and validation
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Status Update */}
      <Paper elevation={2} sx={{ p: 3, mt: 4, backgroundColor: '#e8f5e8' }}>
        <Typography variant="h6" gutterBottom color="success.main">
          ✅ All Issues Fixed!
        </Typography>
        <Box component="ul" sx={{ pl: 2, mb: 0 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>✅ Course Selection:</strong> Fixed dropdown with proper FormControl - now working correctly
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>✅ Text Selection Formatting:</strong> Bold, italic, underline now apply only to selected text
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>✅ Bullet & Numbered Lists:</strong> Working properly with text selection
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>✅ Excel Add Row:</strong> Now creates rows with correct number of columns
          </Typography>
          <Typography component="li" variant="body2">
            <strong>✅ Upload Buttons:</strong> Enabled after course selection with comprehensive debugging
          </Typography>
        </Box>
      </Paper>

      {/* Footer Info */}
      <Paper elevation={1} sx={{ p: 2, mt: 4, backgroundColor: 'grey.50' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Enhanced Evidence Library with Document Creation • Supported formats: TXT, CSV, PDF, DOCX, XLSX, PPTX, Images, Videos • Maximum file size: 10MB
        </Typography>
      </Paper>
    </Container>
  );
};

export default DocumentCreatorDemo;
