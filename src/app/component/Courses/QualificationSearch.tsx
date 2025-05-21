import React, { useState, useEffect } from 'react';
import jsonData from 'src/url.json';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface QualificationSearchProps {
  onSelectQualification?: (qualification: any) => void;
  onImportQualification?: (qualification: any) => void;
}

const QualificationSearch: React.FC<QualificationSearchProps> = ({
  onSelectQualification,
  onImportQualification
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [source, setSource] = useState<'all' | 'IfA' | 'Ofqual'>('all');
  const [qualifications, setQualifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);
  const [importLoading, setImportLoading] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedQualification, setSelectedQualification] = useState<any>(null);
  
  const navigate = useNavigate();
  const URL_BASE_LINK = jsonData.API_LOCAL_URL;
  // Function to search qualifications
  const searchQualifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { query: searchTerm };
      if (source !== 'all') {
        params.source = source;
      }
      
      const response = await axios.get(`${URL_BASE_LINK}/qualifications/search`, { params });
      setQualifications(response.data);
    } catch (err) {
      setError('Failed to search qualifications. Please try again.');
      setQualifications([]);
    } finally {
      setLoading(false);
    }
  };

  // Function to import a qualification
  const importQualification = async (qualification: any) => {
    try {
      setImportLoading(true);
      
      const response = await axios.post(`${URL_BASE_LINK}/qualifications/import`, {
        externalId: qualification.external_id,
        source: qualification.source
      });
      
      if (onImportQualification) {
        onImportQualification(response.data);
      }
      
      setSnackbarMessage('Qualification imported successfully!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Failed to import qualification. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setImportLoading(false);
    }
  };

  // Function to convert a qualification to a course
  const convertToCourse = async (qualification: any) => {
    try {
      setImportLoading(true);
      
      const response = await axios.get(`${URL_BASE_LINK}/qualifications/${qualification.id}/convert`);
      
      // Navigate to course creation page with the converted data
      navigate('/courses/create', { state: { courseData: response.data } });
      
      setSnackbarMessage('Qualification converted to course!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Failed to convert qualification to course. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setImportLoading(false);
    }
  };

  // Function to sync qualifications
  
  const syncQualifications = async () => {
    try {
      setLoading(true);
      
      await axios.post(`${URL_BASE_LINK}/qualifications/sync`);
      
      setSnackbarMessage('Qualification sync process started!');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      setSnackbarMessage('Failed to start qualification sync. Please try again.');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Function to view qualification details
  const viewQualificationDetails = (qualification: any) => {
    setSelectedQualification(qualification);
    setDetailsDialogOpen(true);
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
    setSource(newValue === 0 ? 'all' : newValue === 1 ? 'IfA' : 'Ofqual');
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Handle search form submit
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    searchQualifications();
  };

  // Close snackbar
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Close details dialog
  const handleDetailsDialogClose = () => {
    setDetailsDialogOpen(false);
  };

  return (
    <Paper elevation={2} style={{ padding: '20px', marginBottom: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Qualification Search
      </Typography>
      
      <Tabs value={currentTab} onChange={handleTabChange} aria-label="qualification source tabs">
        <Tab label="All Sources" />
        <Tab label="IfA Standards" />
        <Tab label="Ofqual Qualifications" />
      </Tabs>
      
      <Box component="form" onSubmit={handleSearchSubmit} sx={{ mt: 2, mb: 3, display: 'flex', gap: 2 }}>
        <TextField
          label="Search qualifications"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Enter qualification title, code, or description"
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          startIcon={<SearchIcon />}
          disabled={loading}
        >
          Search
        </Button>
        <Tooltip title="Sync qualifications from IfA and Ofqual">
          <Button
            variant="outlined"
            color="secondary"
            startIcon={<RefreshIcon />}
            onClick={syncQualifications}
            disabled={loading}
          >
            Sync
          </Button>
        </Tooltip>
      </Box>
      
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {!loading && !error && qualifications.length > 0 && (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Code</TableCell>
                <TableCell>Level</TableCell>
                <TableCell>Source</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {qualifications.map((qualification) => (
                <TableRow key={qualification.id}>
                  <TableCell>{qualification.title}</TableCell>
                  <TableCell>{qualification.code}</TableCell>
                  <TableCell>{qualification.level}</TableCell>
                  <TableCell>{qualification.source}</TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => viewQualificationDetails(qualification)}
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Import Qualification">
                      <IconButton
                        size="small"
                        onClick={() => importQualification(qualification)}
                        disabled={importLoading}
                      >
                        <ImportExportIcon />
                      </IconButton>
                    </Tooltip>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => convertToCourse(qualification)}
                      disabled={importLoading}
                    >
                      Create Course
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {!loading && !error && qualifications.length === 0 && (
        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
          No qualifications found. Try a different search term.
        </Typography>
      )}
      
      {/* Qualification Details Dialog */}
      <Dialog open={detailsDialogOpen} onClose={handleDetailsDialogClose} maxWidth="md" fullWidth>
        {selectedQualification && (
          <>
            <DialogTitle>
              {selectedQualification.title}
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Code:</strong> {selectedQualification.code}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Level:</strong> {selectedQualification.level}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Source:</strong> {selectedQualification.source}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Sector:</strong> {selectedQualification.sector || 'N/A'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Version:</strong> {selectedQualification.version || '1'}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Last Updated:</strong> {new Date(selectedQualification.last_updated).toLocaleDateString()}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Description:</strong>
              </Typography>
              <Typography variant="body2" paragraph>
                {selectedQualification.description || 'No description available.'}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleDetailsDialogClose}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={() => {
                  handleDetailsDialogClose();
                  convertToCourse(selectedQualification);
                }}
              >
                Create Course
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleSnackbarClose}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default QualificationSearch;
