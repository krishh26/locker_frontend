import React, { useState } from 'react';
import { Box, Typography, Paper, TextField, MenuItem, Select, FormControl, InputLabel, Grid, Card, CardContent, Accordion, AccordionSummary, AccordionDetails, IconButton, Checkbox, FormControlLabel } from '@mui/material';
import { SecondaryButton } from '../Buttons';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { v4 as uuidv4 } from 'uuid';
import styles from './style.module.css';

const GatewayCriteriaTable = ({
  unitId,
  learningOutcomes = [],
  onChange,
  readOnly = false
}) => {
  const [expandedAccordion, setExpandedAccordion] = useState(null);

  // Function to add a new learning outcome (checkpoint)
  const addLearningOutcome = () => {
    const newLearningOutcome = {
      id: `lo_${uuidv4()}`,
      number: `${learningOutcomes.length + 1}`,
      description: '',
      checkpointCategory: '',
      assessment_criteria: []
    };

    onChange(unitId, 'learning_outcomes', [...learningOutcomes, newLearningOutcome]);
  };

  // Function to update a learning outcome
  const updateLearningOutcome = (loId, field, value) => {
    const updatedOutcomes = learningOutcomes.map(lo => {
      if (lo.id === loId) {
        return { ...lo, [field]: value };
      }
      return lo;
    });

    onChange(unitId, 'learning_outcomes', updatedOutcomes);
  };

  // Function to delete a learning outcome
  const deleteLearningOutcome = (loId) => {
    const updatedOutcomes = learningOutcomes.filter(lo => lo.id !== loId);
    onChange(unitId, 'learning_outcomes', updatedOutcomes);
  };

  // Function to add a new assessment criterion (checkpoint item)
  const addAssessmentCriterion = (loId) => {
    const learningOutcome = learningOutcomes.find(lo => lo.id === loId);

    if (!learningOutcome) return;

    const newCriterion = {
      id: `ac_${uuidv4()}`,
      number: `${learningOutcome.number}.${learningOutcome.assessment_criteria.length + 1}`,
      title: '',
      description: '',
      type: 'req',
      showOrder: learningOutcome.assessment_criteria.length + 1,
      isCompleted: false,
      evidenceRequired: true,
      timesMet: 0
    };

    const updatedOutcomes = learningOutcomes.map(lo => {
      if (lo.id === loId) {
        return {
          ...lo,
          assessment_criteria: [...lo.assessment_criteria, newCriterion]
        };
      }
      return lo;
    });

    onChange(unitId, 'learning_outcomes', updatedOutcomes);
  };

  // Function to update an assessment criterion
  const updateAssessmentCriterion = (loId, acId, field, value) => {
    const updatedOutcomes = learningOutcomes.map(lo => {
      if (lo.id === loId) {
        const updatedCriteria = lo.assessment_criteria.map(ac => {
          if (ac.id === acId) {
            return { ...ac, [field]: value };
          }
          return ac;
        });
        return { ...lo, assessment_criteria: updatedCriteria };
      }
      return lo;
    });

    onChange(unitId, 'learning_outcomes', updatedOutcomes);
  };

  // Function to delete an assessment criterion
  const deleteAssessmentCriterion = (loId, acId) => {
    const updatedOutcomes = learningOutcomes.map(lo => {
      if (lo.id === loId) {
        return {
          ...lo,
          assessment_criteria: lo.assessment_criteria.filter(ac => ac.id !== acId)
        };
      }
      return lo;
    });

    onChange(unitId, 'learning_outcomes', updatedOutcomes);
  };

  return (
    <Paper elevation={0} className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
          Checkpoints & Requirements
        </Typography>
        {!readOnly && (
          <SecondaryButton
            name="Add Checkpoint"
            startIcon={<AddIcon />}
            onClick={addLearningOutcome}
            sx={{ fontSize: '1rem', padding: '8px 16px' }}
          />
        )}
      </Box>

      {learningOutcomes.length === 0 ? (
        <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
          No checkpoints yet. Click the button above to add one.
        </Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          {learningOutcomes.map((lo) => (
            <Accordion 
              key={lo.id}
              expanded={expandedAccordion === lo.id}
              onChange={() => setExpandedAccordion(expandedAccordion === lo.id ? null : lo.id)}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Typography variant="subtitle1">
                    <strong>Checkpoint {lo.number}:</strong> {lo.description || 'No description'} 
                    {lo.checkpointCategory && <span className="ml-2 text-sm text-gray-500">({lo.checkpointCategory})</span>}
                  </Typography>
                  {!readOnly && (
                    <IconButton 
                      size="small" 
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteLearningOutcome(lo.id);
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                  <TextField
                    label="Checkpoint Description"
                    value={lo.description}
                    onChange={(e) => updateLearningOutcome(lo.id, 'description', e.target.value)}
                    fullWidth
                    multiline
                    rows={2}
                    disabled={readOnly}
                  />
                  <TextField
                    label="Category"
                    value={lo.checkpointCategory || ''}
                    onChange={(e) => updateLearningOutcome(lo.id, 'checkpointCategory', e.target.value)}
                    disabled={readOnly}
                    sx={{ minWidth: 150 }}
                  />
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="subtitle2">Requirements</Typography>
                  {!readOnly && (
                    <SecondaryButton
                      name="Add Requirement"
                      startIcon={<AddIcon />}
                      onClick={() => addAssessmentCriterion(lo.id)}
                      size="small"
                    />
                  )}
                </Box>

                {lo.assessment_criteria.length === 0 ? (
                  <Typography align="center" color="textSecondary" sx={{ py: 2 }}>
                    No requirements yet. Click the button above to add one.
                  </Typography>
                ) : (
                  <Grid container spacing={2}>
                    {lo.assessment_criteria.map((ac) => (
                      <Grid item xs={12} key={ac.id}>
                        <Card variant="outlined">
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, gap: 2 }}>
                              <TextField
                                label="Number"
                                value={ac.number}
                                onChange={(e) => updateAssessmentCriterion(lo.id, ac.id, 'number', e.target.value)}
                                disabled={readOnly}
                                size="small"
                                sx={{ width: '100px' }}
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={ac.evidenceRequired}
                                    onChange={(e) => updateAssessmentCriterion(lo.id, ac.id, 'evidenceRequired', e.target.checked)}
                                    disabled={readOnly}
                                  />
                                }
                                label="Evidence Required"
                              />
                              <FormControlLabel
                                control={
                                  <Checkbox
                                    checked={ac.isCompleted}
                                    onChange={(e) => updateAssessmentCriterion(lo.id, ac.id, 'isCompleted', e.target.checked)}
                                    disabled={readOnly}
                                  />
                                }
                                label="Completed"
                              />
                              {!readOnly && (
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => deleteAssessmentCriterion(lo.id, ac.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Box>
                            <TextField
                              label="Title"
                              value={ac.title}
                              onChange={(e) => updateAssessmentCriterion(lo.id, ac.id, 'title', e.target.value)}
                              fullWidth
                              disabled={readOnly}
                              size="small"
                              sx={{ mb: 1 }}
                            />
                            <TextField
                              label="Description"
                              value={ac.description}
                              onChange={(e) => updateAssessmentCriterion(lo.id, ac.id, 'description', e.target.value)}
                              fullWidth
                              multiline
                              rows={2}
                              disabled={readOnly}
                              sx={{ mb: 1 }}
                            />
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Paper>
  );
};

export default GatewayCriteriaTable;
