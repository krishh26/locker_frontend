import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Divider,
  Paper,
  Badge,
  Card,
  CardContent,
  Grid,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SortIcon from '@mui/icons-material/Sort';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { v4 as uuidv4 } from 'uuid';
import styles from './LearningOutcomes.module.css';

// Criterion type options
const criterionTypes = [
  { value: 'to-do', label: 'To Do' },
  { value: 'to-know', label: 'To Know' },
  { value: 'req', label: 'Required' },
  { value: 'other', label: 'Other' }
];

// Assessment methods removed

// Styles are imported from the CSS module

const LearningOutcomes = ({
  unitId,
  learningOutcomes = [],
  onChange,
  readOnly = false,
  courseType = 'Standard'
}) => {
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  const addLearningOutcome = () => {
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

      // Expand the accordion to show the new criterion
      setTimeout(() => {
        setExpandedAccordion(newLearningOutcome.id);
      }, 0);
    } else {
      // If there's already a learning outcome, just add a criterion to the first one
      addAssessmentCriterion(learningOutcomes[0].id);

      // Expand the accordion to show the new criterion
      setTimeout(() => {
        setExpandedAccordion(learningOutcomes[0].id);
      }, 0);
    }
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

    // Renumber the remaining learning outcomes
    const renumberedOutcomes = updatedOutcomes.map((lo, index) => ({
      ...lo,
      number: `${index + 1}`
    }));

    onChange(unitId, 'learning_outcomes', renumberedOutcomes);
  };

  // Function to add a new assessment criterion
  const addAssessmentCriterion = (loId) => {
    const learningOutcome = learningOutcomes.find(lo => lo.id === loId);

    if (!learningOutcome) return;

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

        return {
          ...lo,
          assessment_criteria: updatedCriteria
        };
      }
      return lo;
    });

    onChange(unitId, 'learning_outcomes', updatedOutcomes);
  };

  // Function to delete an assessment criterion
  const deleteAssessmentCriterion = (loId, acId) => {
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

  // Handle accordion expansion
  const handleAccordionChange = (loId) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? loId : null);
  };

  // Get all learning outcomes without filtering
  const filteredLearningOutcomes = useMemo(() => {
    return learningOutcomes;
  }, [learningOutcomes]);

  // Return all criteria without filtering
  const getFilteredCriteria = (criteria) => {
    return criteria;
  };

  // assessment methods removed

  // Function to update times met
  const updateTimesMet = (loId, acId, value) => {
    const numValue = parseInt(value) || 0;
    updateAssessmentCriterion(loId, acId, 'timesMet', numValue);
  };



  return (
    <Paper elevation={0} className={styles.container}>
      <Box className={styles.header}>
        <Typography variant="h6">
          {courseType === 'Qualification' ? 'Units' : 'Learning Outcomes'}
          <Badge
            badgeContent={learningOutcomes.length}
            color="primary"
            className={styles.badge}
          />
        </Typography>
        {!readOnly && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={addLearningOutcome}
          >
            Add New
          </Button>
        )}
      </Box>

      <Divider className={styles.divider} />

      {/* Learning outcomes list */}
      <Box className={styles.tabPanel}>
        {filteredLearningOutcomes.length === 0 ? (
          <Typography className={styles.emptyState}>
            No learning outcomes defined for this unit.
          </Typography>
        ) : (
          filteredLearningOutcomes.map((lo) => (
            <Accordion
              key={lo.id}
              className={styles.accordion}
              expanded={expandedAccordion === lo.id}
              onChange={handleAccordionChange(lo.id)}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                className={styles.accordionSummary}
              >
                <Box style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                  <Typography>
                    <strong>{lo.number}.</strong> {lo.description || 'No description'}
                  </Typography>
                  <Badge
                    badgeContent={lo.assessment_criteria.length}
                    color="primary"
                    style={{ marginRight: '24px' }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box style={{ marginBottom: '16px' }}>
                  <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <TextField
                      label="Number"
                      value={lo.number}
                      onChange={(e) => updateLearningOutcome(lo.id, 'number', e.target.value)}
                      disabled={readOnly}
                      size="small"
                      className={`${styles.inputField} ${styles.numberField}`}
                    />
                    <TextField
                      label="Description"
                      value={lo.description}
                      onChange={(e) => updateLearningOutcome(lo.id, 'description', e.target.value)}
                      disabled={readOnly}
                      size="small"
                      fullWidth
                      className={`${styles.inputField} ${styles.descriptionField}`}
                    />
                    {!readOnly && (
                      <IconButton
                        color="error"
                        onClick={() => deleteLearningOutcome(lo.id)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>

                  <Box className={styles.criteriaContainer}>
                    <Box className={styles.criteriaHeader}>
                      <Typography variant="subtitle1" style={{ display: 'flex', alignItems: 'center' }}>
                        Assessment Criteria
                        <Badge
                          badgeContent={lo.assessment_criteria.length}
                          color="primary"
                          className={styles.badge}
                          sx={{right:'-10px'}}
                        />
                      </Typography>
                      {!readOnly && (
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          startIcon={<AddIcon />}
                          onClick={() => addAssessmentCriterion(lo.id)}
                        >
                          Add New
                        </Button>
                      )}
                    </Box>

                    {lo.assessment_criteria.length === 0 ? (
                      <Typography className={styles.emptyState}>
                        No assessment criteria defined for this learning outcome.
                      </Typography>
                    ) : (
                      <Grid container spacing={2}>
                        {(() => {
                          const criteria = getFilteredCriteria(lo.assessment_criteria);

                          // Group criteria by their main number (before the decimal point)
                          const groupedCriteria: { [key: string]: any[] } = {};
                          criteria.forEach(ac => {
                            const mainNumber = ac.number.split('.')[0];
                            if (!groupedCriteria[mainNumber]) {
                              groupedCriteria[mainNumber] = [];
                            }
                            groupedCriteria[mainNumber].push(ac);
                          });

                          return Object.entries(groupedCriteria).map(([mainNumber, criteriaGroup]) => (
                            <Grid item xs={12} key={mainNumber}>
                              <Accordion defaultExpanded>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                  <Typography variant="subtitle2">
                                    Criteria Group {mainNumber} ({criteriaGroup.length} items)
                                  </Typography>
                                </AccordionSummary>
                                <AccordionDetails>
                                  <Grid container spacing={2}>
                                    {criteriaGroup.map((ac) => (
                                      <Grid item xs={12} key={ac.id}>
                                        <Card className={styles.criteriaItem} variant="outlined">
                                          <CardContent style={{ padding: '12px' }}>
                                            <Box className={styles.criterionHeader}>
                                              <Box style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <TextField
                                                  label="Number"
                                                  value={ac.number}
                                                  onChange={(e) => updateAssessmentCriterion(lo.id, ac.id, 'number', e.target.value)}
                                                  disabled={readOnly}
                                                  size="small"
                                                  className={`${styles.inputField} ${styles.numberField}`}
                                                />
                                                <TextField
                                                  label="Show Order"
                                                  value={ac.showOrder || ''}
                                                  onChange={(e) => updateAssessmentCriterion(lo.id, ac.id, 'showOrder', parseInt(e.target.value) || 0)}
                                                  disabled={readOnly}
                                                  size="small"
                                                  type="number"
                                                  className={`${styles.inputField} ${styles.orderField}`}
                                                />
                                                <TextField
                                                  label="Times Met"
                                                  value={ac.timesMet || 0}
                                                  onChange={(e) => updateTimesMet(lo.id, ac.id, e.target.value)}
                                                  disabled={readOnly}
                                                  size="small"
                                                  type="number"
                                                  className={`${styles.inputField} ${styles.timesMetField}`}
                                                />
                                              </Box>

                                              <Box className={styles.criterionActions}>
                                                {!readOnly && (
                                                  <>
                                                    <IconButton
                                                      color="primary"
                                                      size="small"
                                                      title="Duplicate"
                                                    >
                                                      <ContentCopyIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton
                                                      color="error"
                                                      onClick={() => deleteAssessmentCriterion(lo.id, ac.id)}
                                                      size="small"
                                                      title="Delete"
                                                    >
                                                      <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                  </>
                                                )}
                                              </Box>
                                            </Box>

                                            <Box style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                                              <TextField
                                                label="Title"
                                                value={ac.title || ''}
                                                onChange={(e) => updateAssessmentCriterion(lo.id, ac.id, 'title', e.target.value)}
                                                disabled={readOnly}
                                                size="small"
                                                className={`${styles.inputField} ${styles.titleField}`}
                                              />
                                              <FormControl
                                                size="small"
                                                className={`${styles.inputField} ${styles.typeField}`}
                                              >
                                                <Select
                                                  value={ac.type}
                                                  onChange={(e) => updateAssessmentCriterion(lo.id, ac.id, 'type', e.target.value)}
                                                  disabled={readOnly}
                                                >
                                                  {criterionTypes.map((type) => (
                                                    <MenuItem key={type.value} value={type.value}>
                                                      {type.label}
                                                    </MenuItem>
                                                  ))}
                                                </Select>
                                              </FormControl>
                                            </Box>

                                            <TextField
                                              label="Description"
                                              value={ac.description}
                                              onChange={(e) => updateAssessmentCriterion(lo.id, ac.id, 'description', e.target.value)}
                                              disabled={readOnly}
                                              size="small"
                                              fullWidth
                                              multiline
                                              rows={2}
                                              className={`${styles.inputField} ${styles.descriptionField}`}
                                            />

                                            <div className={styles.criterionActions}>
                                              <span
                                                className={`${styles.criterionTypeLabel} ${
                                                  ac.type === 'to-do'
                                                    ? styles.chipToDo
                                                    : ac.type === 'to-know'
                                                      ? styles.chipToKnow
                                                      : ac.type === 'req'
                                                        ? styles.chipRequired
                                                        : styles.chipOther
                                                }`}
                                              >
                                                {criterionTypes.find(t => t.value === ac.type)?.label || 'Other'}
                                              </span>
                                            </div>
                                          </CardContent>
                                        </Card>
                                      </Grid>
                                    ))}
                                  </Grid>
                                </AccordionDetails>
                              </Accordion>
                            </Grid>
                          ));
                        })()}
                      </Grid>
                    )}
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>
    </Paper>
  );
};

export default LearningOutcomes;
