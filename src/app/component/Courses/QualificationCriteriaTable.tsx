import React, { useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { SecondaryButton } from '../Buttons';
import { v4 as uuidv4 } from 'uuid';
import styles from './style.module.css';
import TableCriteriaEditor from './TableCriteriaEditor';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';

interface TableCriterion {
  id: string;
  number: string;
  title: string;
  description: string;
  type: 'to-do' | 'to-know' | 'req';
  showOrder: number;
  timesMet: number;
}

interface AssessmentCriterion {
  id: string;
  number: string;
  title: string;
  description: string;
  type: string;
  showOrder: number;
  timesMet?: number;
  [key: string]: any;
}

// Removed assessment methods handling


// Helper function to convert AssessmentCriterion to TableCriterion
const convertToTableCriterion = (criterion: AssessmentCriterion): TableCriterion => {


  // Map the type to one of the allowed values
  let criterionType: 'to-do' | 'to-know' | 'req' = 'to-do';
  if (criterion.type === 'to-know') {
    criterionType = 'to-know';
  } else if (criterion.type === 'req') {
    criterionType = 'req';
  }

  return {
    id: criterion.id,
    number: criterion.number,
    title: criterion.title || '',
    description: criterion.description || '',
    type: criterionType,
    showOrder: criterion.showOrder || 0,
    timesMet: criterion.timesMet || 0
  };
};

interface LearningOutcome {
  id: string;
  number: string;
  description: string;
  assessment_criteria: AssessmentCriterion[];
  [key: string]: any;
}

interface QualificationCriteriaTableProps {
  unitId: string | number;
  learningOutcomes: LearningOutcome[];
  onChange: (unitId: string | number, field: string, value: any) => void;
  readOnly?: boolean;
  saveCourse?: () => Promise<boolean>;
  renderUpdateButton?: boolean;
  onUpdateCriteria?: () => Promise<void>;
}

const QualificationCriteriaTable: React.FC<QualificationCriteriaTableProps> = ({
  unitId,
  learningOutcomes = [],
  onChange,
  readOnly = false,
  saveCourse,
  renderUpdateButton = true,
  onUpdateCriteria
}) => {
  const dispatch = useDispatch();

  // Function to handle updating criteria
  const handleUpdateCriteria = async () => {
    onChange(unitId, 'learning_outcomes', learningOutcomes);

    if (saveCourse) {
      try {
        const result = await saveCourse();
        if (result) {
          dispatch(showMessage({
            message: "Criteria updated and saved successfully.",
            variant: "success"
          }));
        } else {
          dispatch(showMessage({
            message: "Failed to save criteria to the server. Please try again.",
            variant: "error"
          }));
        }
      } catch (error) {
        dispatch(showMessage({
          message: "An error occurred while saving criteria.",
          variant: "error"
        }));
      }
    } else {
      dispatch(showMessage({
        message: "Criteria updated successfully.",
        variant: "success"
      }));
    }
  };

  // Use the provided onUpdateCriteria function or the local handleUpdateCriteria function
  const updateCriteriaHandler = onUpdateCriteria || handleUpdateCriteria;

  // Create a default learning outcome if none exists
  useEffect(() => {
    if (learningOutcomes.length === 0 && !readOnly) {
      const defaultLearningOutcome: LearningOutcome = {
        id: `lo_${uuidv4()}`,
        number: '1',
        description: 'Default Learning Outcome',
        assessment_criteria: []
      };

      onChange(unitId, 'learning_outcomes', [defaultLearningOutcome]);
    }
  }, [unitId, learningOutcomes.length, onChange, readOnly]);

  // Function to convert TableCriterion back to AssessmentCriterion
  const convertFromTableCriterion = (tableCriterion: TableCriterion): AssessmentCriterion => {
    return {
      id: tableCriterion.id,
      number: tableCriterion.number,
      title: tableCriterion.title,
      description: tableCriterion.description,
      type: tableCriterion.type,
      showOrder: tableCriterion.showOrder,
      timesMet: tableCriterion.timesMet
    };
  };

  // Function to add a new assessment criterion
  const addAssessmentCriterion = (loId: string, criterionData: TableCriterion) => {
    // Convert TableCriterion to AssessmentCriterion
    const assessmentCriterion = convertFromTableCriterion(criterionData);

    const updatedOutcomes = learningOutcomes.map(lo => {
      if (lo.id === loId) {
        return {
          ...lo,
          assessment_criteria: [...lo.assessment_criteria, assessmentCriterion]
        };
      }
      return lo;
    });

    onChange(unitId, 'learning_outcomes', updatedOutcomes);
  };

  // Function to update an assessment criterion
  const updateAssessmentCriterion = (loId: string, acId: string, updatedData: TableCriterion) => {
    // Convert TableCriterion to AssessmentCriterion
    const assessmentCriterion = convertFromTableCriterion(updatedData);

    const updatedOutcomes = learningOutcomes.map(lo => {
      if (lo.id === loId) {
        const updatedCriteria = lo.assessment_criteria.map(ac => {
          if (ac.id === acId) {
            return { ...assessmentCriterion };
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
  const deleteAssessmentCriterion = (loId: string, acId: string) => {
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

  const duplicateAssessmentCriterion = (loId: string, acId: string) => {
    const learningOutcome = learningOutcomes.find(lo => lo.id === loId);
    if (!learningOutcome) return;

    const criterionToDuplicate = learningOutcome.assessment_criteria.find(ac => ac.id === acId);
    if (!criterionToDuplicate) return;

    const newCriterion: AssessmentCriterion = {
      ...criterionToDuplicate,
      id: `ac_${uuidv4()}`,
      number: `${learningOutcome.number}.${learningOutcome.assessment_criteria.length + 1}`,
      showOrder: learningOutcome.assessment_criteria.length + 1,
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

  const getTableCriteria = (): TableCriterion[] => {
    if (learningOutcomes.length === 0 || !learningOutcomes[0].assessment_criteria) {
      return [];
    }

    return learningOutcomes[0].assessment_criteria.map(criterion =>
      convertToTableCriterion(criterion)
    );
  };

  return (
    <Paper elevation={0} className={styles.container}>
      {learningOutcomes.length === 0 ? (
        <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
          Loading criteria...
        </Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          {learningOutcomes.length > 0 && (
            <>
              <TableCriteriaEditor
                learningOutcomeId={learningOutcomes[0].id}
                learningOutcomeNumber={learningOutcomes[0].number}
                criteria={getTableCriteria()}
                onSave={addAssessmentCriterion}
                onUpdate={updateAssessmentCriterion}
                onDelete={deleteAssessmentCriterion}
                onDuplicate={duplicateAssessmentCriterion}
                readOnly={readOnly}
              />
              {!readOnly && renderUpdateButton && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <SecondaryButton
                    name="Update Criteria"
                    onClick={updateCriteriaHandler}
                    sx={{ backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}
                  />
                </Box>
              )}
            </>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default QualificationCriteriaTable;
