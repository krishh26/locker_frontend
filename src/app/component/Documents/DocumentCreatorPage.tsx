import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Description as DocumentIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import CreateAndUploadDocument from './CreateAndUploadDocument';

const DocumentCreatorPage: React.FC = () => {
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
          Document Creator
        </Typography>
      </Breadcrumbs>

      {/* Page Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 4, backgroundColor: 'primary.main', color: 'white' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Document Creator & Uploader
        </Typography>
        <Typography variant="subtitle1">
          Create and upload Word documents, Excel spreadsheets, and PowerPoint presentations
        </Typography>
      </Paper>

      {/* Instructions */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom color="primary">
          How to Use
        </Typography>
        <Box component="ul" sx={{ pl: 2 }}>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Word Documents:</strong> Use the rich text editor to create formatted content. Add a title and write your content using the toolbar for formatting.
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>Excel Spreadsheets:</strong> Create tables with editable cells. Add or remove rows as needed. Customize the sheet name.
          </Typography>
          <Typography component="li" variant="body2" sx={{ mb: 1 }}>
            <strong>PowerPoint Presentations:</strong> Create multiple slides with titles and content. Add or remove slides to build your presentation.
          </Typography>
          <Typography component="li" variant="body2">
            Click "Save & Upload" to generate the document and automatically upload it to the server.
          </Typography>
        </Box>
      </Paper>

      {/* Main Component */}
      <CreateAndUploadDocument />

      {/* Footer Info */}
      <Paper elevation={1} sx={{ p: 2, mt: 4, backgroundColor: 'grey.50' }}>
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Supported formats: .docx (Word), .xlsx (Excel), .pptx (PowerPoint) • Maximum file size: 10MB
        </Typography>
      </Paper>
    </Container>
  );
};

export default DocumentCreatorPage;
