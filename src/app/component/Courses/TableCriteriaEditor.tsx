import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Typography,
  Checkbox
} from '@mui/material';
import { SecondaryButton } from '../Buttons';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import { v4 as uuidv4 } from 'uuid';

// Define the assessment method type
interface AssessmentMethod {
  value: string;
  label: string;
  fullName: string;
}

// Define the interface for the criterion data
interface TableCriterion {
  id: string;
  number: string;
  title: string;
  description: string;
  type: 'to-do' | 'to-know' | 'req';
  showOrder: number;
  assessmentMethods: Record<string, string>;
  timesMet: number;
}

// Assessment methods for qualification criteria
const assessmentMethods: AssessmentMethod[] = [
  { value: 'pe', label: 'PE', fullName: 'Professional Discussion' },
  { value: 'do', label: 'DO', fullName: 'Direct Observation' },
  { value: 'wt', label: 'WT', fullName: 'Witness Testimony' },
  { value: 'qa', label: 'QA', fullName: 'Question and Answer' },
  { value: 'ps', label: 'PS', fullName: 'Product Sample' },
  { value: 'di', label: 'DI', fullName: 'Discussion' },
  { value: 'si', label: 'SI', fullName: 'Simulation' },
  { value: 'ee', label: 'ET', fullName: 'Expert Evidence' },
  { value: 'ba', label: 'RA', fullName: 'Basic Assessment' },
  { value: 'ot', label: 'OT', fullName: 'Other' },
  { value: 'ipl', label: 'RPL', fullName: 'Individual Personal Log' },
  { value: 'lo', label: 'LO', fullName: 'Learning Outcome' }
];

// Define the props interface
interface TableCriteriaEditorProps {
  learningOutcomeId: string;
  learningOutcomeNumber: string;
  criteria: TableCriterion[];
  onSave: (learningOutcomeId: string, formData: TableCriterion) => void;
  onUpdate: (learningOutcomeId: string, criterionId: string, formData: TableCriterion) => void;
  onDelete: (learningOutcomeId: string, criterionId: string) => void;
  onDuplicate: (learningOutcomeId: string, criterionId: string) => void;
  readOnly?: boolean;
}

const TableCriteriaEditor: React.FC<TableCriteriaEditorProps> = ({
  learningOutcomeId,
  learningOutcomeNumber,
  criteria = [],
  onSave,
  onUpdate,
  onDelete,
  onDuplicate,
  readOnly = false
}) => {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [newRow, setNewRow] = useState<string | null>(null);
  const initialAssessmentMethods: Record<string, string> = {};
  assessmentMethods.forEach(method => {
    initialAssessmentMethods[method.value] = '';
  });

  const [formData, setFormData] = useState<TableCriterion>({
    id: '',
    number: '',
    title: '',
    description: '',
    type: 'to-do',
    showOrder: 0,
    assessmentMethods: initialAssessmentMethods,
    timesMet: 0
  });

  const startEditing = (criterion: TableCriterion) => {
    if (editingRow || newRow) return;

    const editAssessmentMethods = { ...criterion.assessmentMethods };

    assessmentMethods.forEach(method => {
      if (editAssessmentMethods[method.value] === undefined) {
        editAssessmentMethods[method.value] = '';
      }
    });

    setEditingRow(criterion.id);
    setFormData({
      ...criterion,
      assessmentMethods: editAssessmentMethods
    });
  };

  const cancelEditing = () => {
    setEditingRow(null);
    setNewRow(null);

    // Reset form data with properly initialized assessment methods
    const resetAssessmentMethods: Record<string, string> = {};
    assessmentMethods.forEach(method => {
      resetAssessmentMethods[method.value] = '';
    });

    setFormData({
      id: '',
      number: '',
      title: '',
      description: '',
      type: 'to-do',
      showOrder: 0,
      assessmentMethods: resetAssessmentMethods,
      timesMet: 0
    });
  };

  const saveEditing = () => {
    if (editingRow) {
      onUpdate(learningOutcomeId, editingRow, formData);
    } else if (newRow) {
      onSave(learningOutcomeId, formData);
    }

    setEditingRow(null);
    setNewRow(null);

    const resetAssessmentMethods: Record<string, string> = {};
    assessmentMethods.forEach(method => {
      resetAssessmentMethods[method.value] = '';
    });

    setFormData({
      id: '',
      number: '',
      title: '',
      description: '',
      type: 'to-do',
      showOrder: 0,
      assessmentMethods: resetAssessmentMethods,
      timesMet: 0
    });
  };

  const startAddingNew = () => {
    if (editingRow || newRow) return;

    const assessmentMethodsObj: Record<string, string> = {};
    assessmentMethods.forEach(method => {
      assessmentMethodsObj[method.value] = '';
    });

    const newCriterion: TableCriterion = {
      id: `ac_${uuidv4()}`,
      number: `${learningOutcomeNumber}.${criteria.length + 1}`,
      title: '',
      description: '',
      type: 'to-do',
      showOrder: criteria.length + 1,
      assessmentMethods: assessmentMethodsObj,
      timesMet: 0
    };

    setNewRow(newCriterion.id);
    setFormData(newCriterion);
  };

  const handleChange = (field: keyof TableCriterion, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Function to handle assessment method text input changes
  const handleAssessmentMethodChange = (method: string, value: string) => {
    setFormData(prev => {
      const currentMethods = prev.assessmentMethods || {};

      return {
        ...prev,
        assessmentMethods: {
          ...currentMethods,
          [method]: value
        }
      };
    });
  };

  return (
    <Box sx={{ width: '100%', padding: 0 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
        {!readOnly && !editingRow && !newRow && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <SecondaryButton
              name="Add New"
              startIcon={<AddIcon />}
              onClick={startAddingNew}
              sx={{ backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}
            />
          </Box>
        )}
      </Box>

      <TableContainer component={Paper} sx={{ mb: 2, overflowX: 'auto', borderRadius: 0, padding: 0 }}>
        <Table size="small" sx={{ minWidth: 1200, tableLayout: 'fixed' }}>
          <colgroup>
            <col style={{ width: '120px' }} /> {/* Type - increased width */}
            <col style={{ width: '200px' }} /> {/* Title */}
            <col style={{ width: '80px' }} /> {/* Code */}
            <col style={{ width: '80px' }} /> {/* Show Order */}
            <col style={{ width: '250px' }} /> {/* Description */}
            <col style={{ width: '40px' }} /> {/* PE - further decreased width */}
            <col style={{ width: '40px' }} /> {/* DO - further decreased width */}
            <col style={{ width: '40px' }} /> {/* WT - further decreased width */}
            <col style={{ width: '40px' }} /> {/* QA - further decreased width */}
            <col style={{ width: '40px' }} /> {/* PS - further decreased width */}
            <col style={{ width: '40px' }} /> {/* DI - further decreased width */}
            <col style={{ width: '40px' }} /> {/* SI - further decreased width */}
            <col style={{ width: '40px' }} /> {/* ET - further decreased width */}
            <col style={{ width: '40px' }} /> {/* RA - further decreased width */}
            <col style={{ width: '40px' }} /> {/* OT - further decreased width */}
            <col style={{ width: '40px' }} /> {/* RPL - further decreased width */}
            <col style={{ width: '40px' }} /> {/* LO - further decreased width */}
            <col style={{ width: '100px' }} /> {/* No. of Times Met */}
            <col style={{ width: '40px' }} /> {/* Edit */}
            <col style={{ width: '40px' }} /> {/* Delete */}
            <col style={{ width: '40px' }} /> {/* Duplicate */}
          </colgroup>
          <TableHead>
            <TableRow>
              <TableCell sx={{ padding: '8px 4px' }}>Type</TableCell>
              <TableCell sx={{ padding: '8px 4px', wordWrap: 'break-word', whiteSpace: 'normal' }}>Title</TableCell>
              <TableCell sx={{ padding: '8px 4px' }}>Code</TableCell>
              <TableCell sx={{ padding: '8px 4px' }}>Show Order</TableCell>
              <TableCell sx={{ padding: '8px 4px', wordWrap: 'break-word', whiteSpace: 'normal' }}>Description</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>PE</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>DO</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>WT</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>QA</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>PS</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>DI</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>SI</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>ET</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>RA</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>OT</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>RPL</TableCell>
              <TableCell align="center" sx={{ padding: '4px 1px' }}>LO</TableCell>
              <TableCell align="center" sx={{ padding: '8px 4px' }}>No. of Times Met</TableCell>
              <TableCell align="center" sx={{ padding: '8px 2px' }}></TableCell>
              <TableCell align="center" sx={{ padding: '8px 2px' }}></TableCell>
              <TableCell align="center" sx={{ padding: '8px 2px' }}></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {criteria.map((criterion) => (
              <TableRow key={criterion.id}>
                {editingRow === criterion.id ? (
                  // Editing mode
                  <>
                    <TableCell>
                      <FormControl fullWidth size="small">
                        <Select
                          value={formData.type || 'to-do'}
                          onChange={(e) => handleChange('type', e.target.value)}
                        >
                          <MenuItem value="to-do">To Do</MenuItem>
                          <MenuItem value="to-know">To Know</MenuItem>
                          <MenuItem value="req">Required</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={4}
                        value={formData.title || ''}
                        onChange={(e) => handleChange('title', e.target.value)}
                        sx={{
                          '& .MuiInputBase-root': {
                            wordWrap: 'break-word',
                            whiteSpace: 'normal'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.number || ''}
                        onChange={(e) => handleChange('number', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        value={formData.showOrder || ''}
                        onChange={(e) => handleChange('showOrder', e.target.value)}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '8px 4px', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                      <TextField
                        fullWidth
                        size="small"
                        multiline
                        rows={4}
                        value={formData.description || ''}
                        onChange={(e) => handleChange('description', e.target.value)}
                        sx={{
                          '& .MuiInputBase-root': {
                            wordWrap: 'break-word',
                            whiteSpace: 'normal'
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.pe || ''}
                        onChange={(e) => handleAssessmentMethodChange('pe', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.do || ''}
                        onChange={(e) => handleAssessmentMethodChange('do', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.wt || ''}
                        onChange={(e) => handleAssessmentMethodChange('wt', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.qa || ''}
                        onChange={(e) => handleAssessmentMethodChange('qa', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.ps || ''}
                        onChange={(e) => handleAssessmentMethodChange('ps', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.di || ''}
                        onChange={(e) => handleAssessmentMethodChange('di', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.si || ''}
                        onChange={(e) => handleAssessmentMethodChange('si', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.ee || ''}
                        onChange={(e) => handleAssessmentMethodChange('ee', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.ba || ''}
                        onChange={(e) => handleAssessmentMethodChange('ba', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.ot || ''}
                        onChange={(e) => handleAssessmentMethodChange('ot', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.ipl || ''}
                        onChange={(e) => handleAssessmentMethodChange('ipl', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell sx={{ padding: '4px 1px' }}>
                      <TextField
                        fullWidth
                        size="small"
                        value={formData.assessmentMethods?.lo || ''}
                        onChange={(e) => handleAssessmentMethodChange('lo', e.target.value)}
                        inputProps={{ maxLength: 50 }}
                        sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <TextField
                        size="small"
                        type="number"
                        value={formData.timesMet || 0}
                        onChange={(e) => handleChange('timesMet', parseInt(e.target.value))}
                        InputProps={{ inputProps: { min: 0 } }}
                      />
                    </TableCell>
                    <TableCell align="center" colSpan={3}>
                      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                        <IconButton color="primary" onClick={saveEditing} size="small">
                          <SaveIcon fontSize="small" />
                        </IconButton>
                        <IconButton color="error" onClick={cancelEditing} size="small">
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </>
                ) : (
                  // View mode
                  <>
                    <TableCell>{criterion.type === 'to-do' ? 'To Do' : criterion.type === 'to-know' ? 'To Know' : 'Required'}</TableCell>
                    <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal', maxWidth: '200px', overflow: 'hidden' }}>{criterion.title}</TableCell>
                    <TableCell>{criterion.number}</TableCell>
                    <TableCell>{criterion.showOrder}</TableCell>
                    <TableCell sx={{ wordWrap: 'break-word', whiteSpace: 'normal', maxWidth: '250px', overflow: 'hidden' }}>{criterion.description}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.pe || ''}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.do || ''}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.wt || ''}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.qa || ''}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.ps || ''}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.di || ''}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.si || ''}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.ee || ''}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.ba || ''}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.ot || ''}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.ipl || ''}</TableCell>
                    <TableCell>{criterion.assessmentMethods?.lo || ''}</TableCell>
                    <TableCell align="center">{criterion.timesMet || 0}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => startEditing(criterion)}
                        size="small"
                        disabled={readOnly || editingRow !== null || newRow !== null}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="error"
                        onClick={() => onDelete(learningOutcomeId, criterion.id)}
                        size="small"
                        disabled={readOnly || editingRow !== null || newRow !== null}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="default"
                        onClick={() => onDuplicate(learningOutcomeId, criterion.id)}
                        size="small"
                        disabled={readOnly || editingRow !== null || newRow !== null}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}

            {/* New row being added */}
            {newRow && (
              <TableRow>
                <TableCell>
                  <FormControl fullWidth size="small">
                    <Select
                      value={formData.type || 'to-do'}
                      onChange={(e) => handleChange('type', e.target.value)}
                    >
                      <MenuItem value="to-do">To Do</MenuItem>
                      <MenuItem value="to-know">To Know</MenuItem>
                      <MenuItem value="req">Required</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell sx={{ padding: '8px 4px', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={4}
                    value={formData.title || ''}
                    onChange={(e) => handleChange('title', e.target.value)}
                    sx={{
                      '& .MuiInputBase-root': {
                        wordWrap: 'break-word',
                        whiteSpace: 'normal'
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.number || ''}
                    onChange={(e) => handleChange('number', e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={formData.showOrder || ''}
                    onChange={(e) => handleChange('showOrder', e.target.value)}
                  />
                </TableCell>
                <TableCell sx={{ padding: '8px 4px', wordWrap: 'break-word', whiteSpace: 'normal' }}>
                  <TextField
                    fullWidth
                    size="small"
                    multiline
                    rows={4}
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    sx={{
                      '& .MuiInputBase-root': {
                        wordWrap: 'break-word',
                        whiteSpace: 'normal'
                      }
                    }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.pe || ''}
                    onChange={(e) => handleAssessmentMethodChange('pe', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.do || ''}
                    onChange={(e) => handleAssessmentMethodChange('do', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.wt || ''}
                    onChange={(e) => handleAssessmentMethodChange('wt', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.qa || ''}
                    onChange={(e) => handleAssessmentMethodChange('qa', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.ps || ''}
                    onChange={(e) => handleAssessmentMethodChange('ps', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.di || ''}
                    onChange={(e) => handleAssessmentMethodChange('di', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.si || ''}
                    onChange={(e) => handleAssessmentMethodChange('si', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.ee || ''}
                    onChange={(e) => handleAssessmentMethodChange('ee', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.ba || ''}
                    onChange={(e) => handleAssessmentMethodChange('ba', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.ot || ''}
                    onChange={(e) => handleAssessmentMethodChange('ot', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.ipl || ''}
                    onChange={(e) => handleAssessmentMethodChange('ipl', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell sx={{ padding: '4px 1px' }}>
                  <TextField
                    fullWidth
                    size="small"
                    value={formData.assessmentMethods?.lo || ''}
                    onChange={(e) => handleAssessmentMethodChange('lo', e.target.value)}
                    inputProps={{ maxLength: 50 }}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 2px' } }}
                  />
                </TableCell>
                <TableCell align="center">
                  <TextField
                    size="small"
                    type="number"
                    value={formData.timesMet || 0}
                    onChange={(e) => handleChange('timesMet', parseInt(e.target.value))}
                    InputProps={{ inputProps: { min: 0 } }}
                  />
                </TableCell>
                <TableCell align="center" colSpan={3}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                    <IconButton color="primary" onClick={saveEditing} size="small">
                      <SaveIcon fontSize="small" />
                    </IconButton>
                    <IconButton color="error" onClick={cancelEditing} size="small">
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

    </Box>
  );
};

export default TableCriteriaEditor;
