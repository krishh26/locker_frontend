import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Select,
  MenuItem,
  TextField,
  Tooltip,
  Box,
  Typography,
  Checkbox,
  FormControl
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { v4 as uuidv4 } from 'uuid';
import styles from './CriteriaTable.module.css';
import { SecondaryButton } from '../Buttons';

// Criterion type options
const criterionTypes = [
  { value: 'to-do', label: 'To Do' },
  { value: 'to-know', label: 'To Know' },
  { value: 'req', label: 'Required' },
  { value: 'other', label: 'Other' }
];

// Assessment methods removed

const CriteriaTable = ({
  unitId,
  learningOutcomes = [],
  onChange,
  readOnly = false
}) => {
  // Function to add a new criterion
  const addCriterion = () => {
    // Check if there's at least one learning outcome
    if (learningOutcomes.length === 0) {
      // Create a new learning outcome with a default criterion
      const newLearningOutcome = {
        id: `lo_${uuidv4()}`,
        number: '1',
        description: 'Learning Outcome',
        assessment_criteria: []
      };

      // Create a criterion
      const newCriterion = {
        id: `ac_${uuidv4()}`,
        number: `${newLearningOutcome.number}.1`,
        title: '',
        description: '',
        type: 'to-do',
        showOrder: 1,
        timesMet: 0
      };

      // Add the criterion to the learning outcome
      newLearningOutcome.assessment_criteria = [newCriterion];

      // Update with the new learning outcome that already has a criterion
      onChange(unitId, 'learning_outcomes', [...learningOutcomes, newLearningOutcome]);
    } else {
      // If there's already a learning outcome, just add a criterion to the first one
      const learningOutcome = learningOutcomes[0];

      const newCriterion = {
        id: `ac_${uuidv4()}`,
        number: `${learningOutcome.number}.${learningOutcome.assessment_criteria.length + 1}`,
        title: '',
        description: '',
        type: 'to-do',
        showOrder: learningOutcome.assessment_criteria.length + 1,
        timesMet: 0
      };

      const updatedOutcomes = learningOutcomes.map(lo => {
        if (lo.id === learningOutcome.id) {
          return {
            ...lo,
            assessment_criteria: [...lo.assessment_criteria, newCriterion]
          };
        }
        return lo;
      });

      onChange(unitId, 'learning_outcomes', updatedOutcomes);
    }
  };

  // Function to update a criterion
  const updateCriterion = (loId, acId, field, value) => {
    const updatedOutcomes = learningOutcomes.map(lo => {
      if (lo.id === loId) {
        const updatedCriteria = lo.assessment_criteria.map(ac => {
          if (ac.id === acId) {
            return { ...ac, [field]: value };
          }
          return ac;
        });

        return {
          ...lo,
          assessment_criteria: updatedCriteria
        };
      }
      return lo;
    });

    onChange(unitId, 'learning_outcomes', updatedOutcomes);
  };

  // Function to delete a criterion
  const deleteCriterion = (loId, acId) => {
    const updatedOutcomes = learningOutcomes.map(lo => {
      if (lo.id === loId) {
        const filteredCriteria = lo.assessment_criteria.filter(ac => ac.id !== acId);

        // Renumber the remaining criteria
        const renumberedCriteria = filteredCriteria.map((ac, index) => ({
          ...ac,
          number: `${lo.number}.${index + 1}`
        }));

        return {
          ...lo,
          assessment_criteria: renumberedCriteria
        };
      }
      return lo;
    });

    onChange(unitId, 'learning_outcomes', updatedOutcomes);
  };

  // assessment methods removed

  // Get all criteria from all learning outcomes
  const getAllCriteria = () => {
    const allCriteria = [];
    learningOutcomes.forEach(lo => {
      lo.assessment_criteria.forEach(ac => {
        allCriteria.push({
          ...ac,
          loId: lo.id
        });
      });
    });
    return allCriteria;
  };

  const criteria = getAllCriteria();

  return (
    <Paper elevation={0} className={styles.container}>
      <Box className={styles.header}>
        {!readOnly && (
          <SecondaryButton
            name="Add New"
            startIcon={<AddIcon />}
            onClick={addCriterion}
            sx={{ fontSize: '1rem', padding: '8px 16px' }}
          />
        )}
      </Box>

      <TableContainer component={Paper} elevation={0} className={styles.tableContainer}>
        <Table size="small" aria-label="criteria table">
          <TableHead>
            <TableRow>
              <TableCell className={styles.typeColumn}>Type</TableCell>
              <TableCell className={styles.titleColumn}>Title</TableCell>
              <TableCell className={styles.codeColumn}>Code</TableCell>
              <TableCell className={styles.orderColumn}>Show Order</TableCell>
              <TableCell className={styles.descriptionColumn}>Description</TableCell>
              <TableCell className={styles.timesMetColumn}>Times Met</TableCell>
              <TableCell className={styles.actionsColumn}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {criteria.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No criteria defined. Click "Add New" to create a criterion.
                </TableCell>
              </TableRow>
            ) : (
              criteria.map((criterion) => (
                <TableRow key={criterion.id}>
                  <TableCell className={styles.typeColumn}>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={criterion.type}
                        onChange={(e) => updateCriterion(criterion.loId, criterion.id, 'type', e.target.value)}
                        disabled={readOnly}
                        size="small"
                        sx={{ minHeight: '32px' }}
                      >
                        {criterionTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell className={styles.titleColumn}>
                    <TextField
                      value={criterion.title || ''}
                      onChange={(e) => updateCriterion(criterion.loId, criterion.id, 'title', e.target.value)}
                      disabled={readOnly}
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      sx={{ minWidth: '180px' }}
                    />
                  </TableCell>
                  <TableCell className={styles.codeColumn}>
                    <TextField
                      value={criterion.number}
                      onChange={(e) => updateCriterion(criterion.loId, criterion.id, 'number', e.target.value)}
                      disabled={readOnly}
                      size="small"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className={styles.orderColumn}>
                    <TextField
                      value={criterion.showOrder || ''}
                      onChange={(e) => updateCriterion(criterion.loId, criterion.id, 'showOrder', parseInt(e.target.value) || 0)}
                      disabled={readOnly}
                      size="small"
                      type="number"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className={styles.descriptionColumn}>
                    <TextField
                      value={criterion.description}
                      onChange={(e) => updateCriterion(criterion.loId, criterion.id, 'description', e.target.value)}
                      disabled={readOnly}
                      size="small"
                      fullWidth
                      multiline
                      rows={2}
                      sx={{ minWidth: '220px' }}
                    />
                  </TableCell>
                  <TableCell className={styles.timesMetColumn}>
                    <TextField
                      value={criterion.timesMet || 0}
                      onChange={(e) => updateCriterion(criterion.loId, criterion.id, 'timesMet', parseInt(e.target.value) || 0)}
                      disabled={readOnly}
                      size="small"
                      type="number"
                      fullWidth
                    />
                  </TableCell>
                  <TableCell className={styles.actionsColumn}>
                    <Box className={styles.actionButtons}>
                      <Tooltip title="Edit">
                        <IconButton size="small">
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => deleteCriterion(criterion.loId, criterion.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Duplicate">
                        <IconButton size="small">
                          <ContentCopyIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default CriteriaTable;
