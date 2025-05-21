import React from 'react';
import { Box, Typography, Paper, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import { SecondaryButton, SecondaryButtonOutlined } from '../Buttons';
import { v4 as uuidv4 } from 'uuid';
import styles from './style.module.css';
import TableCriteriaEditor from './TableCriteriaEditor';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { StandardTopicEditorProps } from './componentTypes';

// Define interfaces
interface AssessmentMethod {
  value: string;
  label: string;
  fullName: string;
}

interface TableTopic {
  id: string;
  number: string;
  title: string;
  description: string;
  type: 'to-do' | 'to-know' | 'req';
  criterionCategory: 'knowledge' | 'skill' | 'behavior';
  showOrder: number;
  assessmentMethods: Record<string, string>;
  timesMet: number;
  referenceNumber?: string;
}

interface Topic {
  id: string;
  number: string;
  title: string;
  description: string;
  type: string;
  criterionCategory: 'knowledge' | 'skill' | 'behavior';
  referenceNumber?: string;
  showOrder: number;
  timesMet: number;
  assessmentMethods?: Record<string, string>;
}

// No need for additional interfaces as we're using the Unit type from componentTypes.ts

// Using StandardTopicEditorProps from componentTypes.ts

const StandardTopicEditor: React.FC<StandardTopicEditorProps> = ({
  mandatoryUnit,
  courseDispatch,
  edit,
  setShowTopicEditor,
  saveCourse
}) => {
  const modules = Object.values(mandatoryUnit);
  const readOnly = edit === 'view';
  const dispatch = useDispatch();

  const assessmentMethods: AssessmentMethod[] = [
    { value: 'pe', label: 'PE', fullName: 'Professional Evaluation' },
    { value: 'do', label: 'DO', fullName: 'Direct Observation' },
    { value: 'wt', label: 'WT', fullName: 'Witness Testimony' },
    { value: 'qa', label: 'QA', fullName: 'Question & Answer' },
    { value: 'ps', label: 'PS', fullName: 'Product Sample' },
    { value: 'di', label: 'DI', fullName: 'Discussion' },
    { value: 'si', label: 'SI', fullName: 'Simulation' },
    { value: 'ee', label: 'ET', fullName: 'Expert Testimony' },
    { value: 'ba', label: 'RA', fullName: 'Reflective Account' },
    { value: 'ot', label: 'OT', fullName: 'Other' },
    { value: 'ipl', label: 'RPL', fullName: 'Recognition of Prior Learning' },
    { value: 'lo', label: 'LO', fullName: 'Learning Outcome' }
  ];

  const convertToTableTopic = (topic: Topic): TableTopic => {
    if (!topic) {
      console.warn('Received null or undefined topic in convertToTableTopic');
      return {
        id: `topic_${uuidv4()}`,
        number: '',
        title: '',
        description: '',
        type: 'to-do',
        criterionCategory: 'knowledge',
        showOrder: 0,
        assessmentMethods: {},
        timesMet: 0,
        referenceNumber: ''
      };
    }
    const methodsObj: Record<string, string> = {};
    if (topic.assessmentMethods) {
      Object.assign(methodsObj, topic.assessmentMethods);
    }
    assessmentMethods.forEach(method => {
      if (methodsObj[method.value] === undefined) {
        methodsObj[method.value] = '';
      }
    });

    return {
      id: topic.id,
      number: topic.number || '',
      title: topic.title || '',
      description: topic.description || '',
      type: (topic.type as 'to-do' | 'to-know' | 'req') || 'to-do',
      criterionCategory: topic.criterionCategory || 'knowledge',
      showOrder: topic.showOrder || 0,
      assessmentMethods: methodsObj,
      timesMet: topic.timesMet || 0,
      referenceNumber: topic.referenceNumber || ''
    };
  };

  const convertFromTableTopic = (tableTopic: TableTopic): Topic => {
    return {
      id: tableTopic.id,
      number: tableTopic.number,
      title: tableTopic.title,
      description: tableTopic.description,
      type: tableTopic.type,
      criterionCategory: tableTopic.criterionCategory,
      showOrder: tableTopic.showOrder,
      timesMet: tableTopic.timesMet,
      assessmentMethods: tableTopic.assessmentMethods,
      referenceNumber: tableTopic.referenceNumber
    };
  };

  const getTableTopics = (moduleId: string): TableTopic[] => {
    const module = modules.find(m => String(m.id) === moduleId);
    if (!module) {
      console.warn('Module not found for ID:', moduleId);
      return [];
    }
    if (!module.assessment_criteria || !Array.isArray(module.assessment_criteria)) {
      return [];
    }
    return module.assessment_criteria.map((topic: Topic) => {
      const tableTopic = convertToTableTopic(topic);
      return tableTopic;
    });
  };

  const addTopic = (moduleId: string, topicData: TableTopic) => {
    const topic = convertFromTableTopic(topicData);

    const updatedModules = modules.map(module => {
      if (String(module.id) === moduleId) {
        return {
          ...module,
          assessment_criteria: [...(module.assessment_criteria || []), topic]
        };
      }
      return module;
    });
    if (courseDispatch) {
      courseDispatch({ type: 'SET_MANDATORY_UNIT', payload: Object.fromEntries(updatedModules.map(module => [module.id, module])) });
    }
  };

  const updateTopic = (moduleId: string, topicId: string, topicData: TableTopic) => {
    const topic = convertFromTableTopic(topicData);

    const updatedModules = modules.map(module => {
      if (String(module.id) === moduleId) {
        const updatedTopics = (module.assessment_criteria || []).map((t: Topic) =>
          t.id === topicId ? topic : t
        );
        return {
          ...module,
          assessment_criteria: updatedTopics
        };
      }
      return module;
    });

    if (courseDispatch) {
      courseDispatch({ type: 'SET_MANDATORY_UNIT', payload: Object.fromEntries(updatedModules.map(module => [module.id, module])) });
    }
  };

  const deleteTopic = (moduleId: string, topicId: string) => {
    const updatedModules = modules.map(module => {
      if (String(module.id) === moduleId) {
        const updatedTopics = (module.assessment_criteria || []).filter((t: Topic) => t.id !== topicId);
        return {
          ...module,
          assessment_criteria: updatedTopics
        };
      }
      return module;
    });

    if (courseDispatch) {
      courseDispatch({ type: 'SET_MANDATORY_UNIT', payload: Object.fromEntries(updatedModules.map(module => [module.id, module])) });
    }
  };

  const duplicateTopic = (moduleId: string, topicId: string) => {
    const module = modules.find(m => String(m.id) === moduleId);
    if (!module) return;

    const topicToDuplicate = module.assessment_criteria?.find((t: Topic) => t.id === topicId);
    if (!topicToDuplicate) return;

    const newTopic: Topic = {
      ...topicToDuplicate,
      id: `topic_${uuidv4()}`,
      number: `${topicToDuplicate.number}_copy`,
      showOrder: (module.assessment_criteria?.length || 0) + 1
    };

    const updatedModules = modules.map(m => {
      if (String(m.id) === moduleId) {
        return {
          ...m,
          assessment_criteria: [...(m.assessment_criteria || []), newTopic]
        };
      }
      return m;
    });
    if (courseDispatch) {
      courseDispatch({ type: 'SET_MANDATORY_UNIT', payload: Object.fromEntries(updatedModules.map(module => [module.id, module])) });
    }
  };
  return (
    <Paper elevation={0} className={styles.container}>
      {!modules || modules.length === 0 ? (
        <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
          No modules available. Please add modules first.
        </Typography>
      ) : (
        <Box sx={{ mt: 2 }}>
          {modules.map((module) => {
            if (!module || !module.id) {
              return null;
            }

            const moduleId = String(module.id);
            const topics = getTableTopics(moduleId);

            return (
              <Accordion
                key={`module-${moduleId}`}
                sx={{ mb: 1 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.125)',
                    minHeight: 56,
                    '&.Mui-expanded': {
                      minHeight: 56,
                    }
                  }}
                >
                  <Typography>
                    <strong>{module.title || 'Untitled Module'}</strong> {module.component_ref ? `(${module.component_ref})` : ''}
                    {module.assessment_criteria && module.assessment_criteria.length > 0 && (
                      <span style={{ marginLeft: '8px', color: '#666' }}>
                        ({module.assessment_criteria.length} topic{module.assessment_criteria.length !== 1 ? 's' : ''})
                      </span>
                    )}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: 2 }}>
                  <TableCriteriaEditor
                    learningOutcomeId={moduleId}
                    learningOutcomeNumber={module.component_ref || ''}
                    criteria={topics}
                    onSave={addTopic}
                    onUpdate={updateTopic}
                    onDelete={deleteTopic}
                    onDuplicate={duplicateTopic}
                    readOnly={readOnly}
                  />
                </AccordionDetails>
              </Accordion>
            );
          })}

          {!readOnly && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
              <SecondaryButton
                name="Update Topics"
                onClick={async () => {
                  try {
                    if (saveCourse) {
                      const success = await saveCourse();
                      if (success) {
                        dispatch(showMessage({ message: 'Topics updated successfully', variant: 'success' }));
                      } else {
                        dispatch(showMessage({ message: 'Failed to update topics', variant: 'error' }));
                      }
                    } else {
                      dispatch(showMessage({ message: 'Save function not available', variant: 'warning' }));
                    }
                  } catch (error) {
                    console.error('Error saving topics:', error);
                    dispatch(showMessage({ message: `Error saving topics: ${error.message}`, variant: 'error' }));
                  }
                }}
              />
            </Box>
          )}
        </Box>
      )}
    </Paper>
  );
};

export default StandardTopicEditor;

