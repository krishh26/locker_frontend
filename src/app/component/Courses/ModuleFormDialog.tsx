import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  Box,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { SecondaryButton, SecondaryButtonOutlined } from '../Buttons';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { v4 as uuidv4 } from 'uuid';

interface ModuleFormData {
  id: string;
  component_ref: string;
  title: string;
  description?: string;
  moduleType: string;
  mandatory: string;
  delivery_method?: string;
  otj_hours?: string;
  delivery_lead?: string;
  sort_order?: string;
  active: string;
  subUnit: any[];
  learning_outcomes: any[];
}

interface ModuleFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (moduleData: ModuleFormData) => void;
  moduleData?: ModuleFormData | null;
  existingModules?: ModuleFormData[];
  isEdit?: boolean;
}

const defaultModuleData: ModuleFormData = {
  id: `module_${uuidv4()}`,
  component_ref: '',
  title: '',
  description: '',
  moduleType: 'behaviour',
  mandatory: 'true',
  delivery_method: '',
  otj_hours: '0',
  delivery_lead: '',
  sort_order: '0',
  active: 'true',
  subUnit: [],
  learning_outcomes: []
};

const ModuleFormDialog: React.FC<ModuleFormDialogProps> = ({
  open,
  onClose,
  onSave,
  moduleData = null,
  existingModules = [],
  isEdit = false
}) => {
  const [formData, setFormData] = useState<ModuleFormData>(defaultModuleData);
  const [activeTab, setActiveTab] = useState<string>('create');

  useEffect(() => {
    if (open) {
      if (moduleData) {
        setFormData({
          ...defaultModuleData,
          ...moduleData,
          // Ensure ID is preserved exactly as it was passed
          id: moduleData.id
        });
      } else {
        const newRefNumber = existingModules.length > 0
          ? `${existingModules.length + 1}`.padStart(3, '0')
          : '001';

        setFormData({
          ...defaultModuleData,
          id: `module_${uuidv4()}`,
          component_ref: newRefNumber,
          title: `Module ${existingModules.length + 1}`
        });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, moduleData]);

  const handleChange = (field: keyof ModuleFormData, value: any) => {
    const updatedData = {
      ...formData,
      [field]: value
    };

    setFormData(updatedData);
  };

  const handleSubmit = () => {
    // Preserve the original ID if it exists, otherwise generate a new one
    const originalId = formData.id;

    const dataToSave = {
      ...formData,
      id: originalId || `module_${uuidv4()}`,
      component_ref: formData.component_ref || '',
      title: formData.title || '',
      moduleType: formData.moduleType || 'behaviour',
      mandatory: formData.mandatory || 'true',
      active: formData.active || 'true',
      subUnit: formData.subUnit || [],
      learning_outcomes: formData.learning_outcomes || []
    };

    onSave(dataToSave);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEdit ? 'Edit Outcomes' : 'Add Outcomes'}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Accordion expanded={activeTab === 'create'} onChange={() => setActiveTab(activeTab === 'create' ? '' : 'create')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Create New Outcomes For Course</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={8}>
                  <TextField
                    label="Title"
                    value={formData.title}
                    onChange={(e) => handleChange('title', e.target.value)}
                    fullWidth
                    required
                    size="small"
                    margin="normal"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="Module Reference Number"
                    value={formData.component_ref}
                    onChange={(e) => handleChange('component_ref', e.target.value)}
                    fullWidth
                    required
                    size="small"
                    margin="normal"
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    fullWidth
                    multiline
                    rows={4}
                    size="small"
                    margin="normal"
                  />
                </Grid>

                {/* Module Type Select */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel>Module Type</InputLabel>
                    <Select
                      value={formData.moduleType}
                      onChange={(e) => handleChange('moduleType', e.target.value)}
                      label="Module Type"
                      required
                    >
                      {/* <MenuItem value="core">Core Module</MenuItem> */}
                      {/* <MenuItem value="optional">Optional Module</MenuItem> */}
                      <MenuItem value="behaviour">Behaviour</MenuItem>
                      <MenuItem value="knowledge">Knowledge</MenuItem>
                      <MenuItem value="skill">Skills</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Delivery Method/ Evidence Requirement"
                    value={formData.delivery_method || ''}
                    onChange={(e) => handleChange('delivery_method', e.target.value)}
                    fullWidth
                    size="small"
                    margin="normal"
                  />
                </Grid>

                {/* Mandatory Select */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel>Mandatory</InputLabel>
                    <Select
                      value={formData.mandatory}
                      onChange={(e) => handleChange('mandatory', e.target.value)}
                      label="Mandatory"
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="OTJ Hours"
                    type="number"
                    value={formData.otj_hours || '0'}
                    onChange={(e) => handleChange('otj_hours', e.target.value)}
                    fullWidth
                    size="small"
                    margin="normal"
                  />
                </Grid>

                {/* Delivery Lead Select */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel>Delivery Lead</InputLabel>
                    <Select
                      value={formData.delivery_lead || ''}
                      onChange={(e) => handleChange('delivery_lead', e.target.value)}
                      label="Delivery Lead"
                    >
                      <MenuItem value="">Please Select...</MenuItem>
                      <MenuItem value="provider">Provider</MenuItem>
                      <MenuItem value="employer">Employer</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    label="Sort Order"
                    type="number"
                    value={formData.sort_order || '0'}
                    onChange={(e) => handleChange('sort_order', e.target.value)}
                    fullWidth
                    size="small"
                    margin="normal"
                  />
                </Grid>

                {/* Active Select */}
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small" margin="normal">
                    <InputLabel>Active</InputLabel>
                    <Select
                      value={formData.active}
                      onChange={(e) => handleChange('active', e.target.value)}
                      label="Active"
                    >
                      <MenuItem value="true">Yes</MenuItem>
                      <MenuItem value="false">No</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          <Accordion expanded={activeTab === 'copy'} onChange={() => setActiveTab(activeTab === 'copy' ? '' : 'copy')}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Copy Modules From Existing Course</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                This feature will be implemented in a future update.
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <SecondaryButtonOutlined name="Cancel" onClick={onClose} />
        <SecondaryButton name="Save" onClick={handleSubmit} />
      </DialogActions>
    </Dialog>
  );
};

export default ModuleFormDialog;