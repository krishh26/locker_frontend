import React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  TextField,
} from '@mui/material';
import GapIndicator from './GapIndicator';
import EvidenceIndicator from './EvidenceIndicator';

export interface QualificationMinimalProps {
  unit: {
    id: string | number;
    code?: string;
    title: string;
    // subUnits with topics grouped
    subUnitsWithTopics?: Array<{
      id: string | number;
      title: string;
      topics: Array<{
        id: string | number;
        code: string;
        description: string;
        topic: any; // Original topic object for handlers
        subUnitId: string | number;
        unitId: string | number;
      }>;
    }>;
  };
  unitsWatch: any[];
  courseId: string | number;
  canEditLearnerFields: boolean;
  canEditTrainerFields: boolean;
  // Handlers - matching useQualificationHandlers signatures
  learnerMapHandler: (topic: any, unitId: string | number, subUnitId: string | number) => void;
  trainerMapHandler: (topic: any, unitId: string | number, subUnitId: string | number) => void;
  signedOffHandler: (topic: any, unitId: string | number, subUnitId: string | number) => void;
  commentHandler: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, topicId: string | number, unitId: string | number, subUnitId: string | number) => void;
  // Evidence count
  getEvidenceCount: (courseId: string | number, unitId: string | number, topicId?: string | number) => number;
  // Form methods
  setValue: (name: string, value: any) => void;
  trigger: (name?: any) => Promise<any>;
}

const QualificationMinimal: React.FC<QualificationMinimalProps> = ({
  unit,
  unitsWatch,
  courseId,
  canEditLearnerFields,
  canEditTrainerFields,
  learnerMapHandler,
  trainerMapHandler,
  signedOffHandler,
  commentHandler,
  getEvidenceCount,
  setValue,
  trigger,
}) => {
  const subUnitsWithTopics = unit.subUnitsWithTopics || [];

  // Get current topic values from unitsWatch for real-time updates (same as StandardCourseMinimal)
  const getCurrentTopicValues = (topic: any, unitId: string | number, subUnitId: string | number) => {
    const currentUnit = unitsWatch.find((u: any) => String(u.id) === String(unitId));
    if (!currentUnit) {
      return {
        learnerMap: false,
        trainerMap: false,
        signedOff: false,
        comment: '',
      };
    }

    const currentSubUnit = currentUnit?.subUnit?.find(
      (s: any) => String(s.id) === String(subUnitId)
    );
    if (!currentSubUnit) {
      return {
        learnerMap: false,
        trainerMap: false,
        signedOff: false,
        comment: '',
      };
    }

    const currentTopic = currentSubUnit?.topics?.find(
      (t: any) => String(t.id) === String(topic.id)
    );

    return {
      learnerMap: currentTopic?.learnerMap ?? false,
      trainerMap: currentTopic?.trainerMap ?? false,
      signedOff: currentTopic?.signedOff ?? false,
      comment: currentTopic?.comment ?? '',
    };
  };

  // Calculate evidence count for a topic
  const getTopicEvidenceCount = (topic: any, unitId: string | number) => {
    return getEvidenceCount(courseId, unitId, topic.id);
  };

  // Get all topics for select all calculation
  const allTopics = subUnitsWithTopics.flatMap((subUnit) => subUnit.topics || []);
  const allMapped = allTopics.every((pc) => {
    const values = getCurrentTopicValues(pc.topic, pc.unitId, pc.subUnitId);
    return values.learnerMap;
  });

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    const checked = event.target.checked;
    const updated = [...unitsWatch];
    
    allTopics.forEach((pc) => {
      const unit = updated.find((u: any) => String(u.id) === String(pc.unitId));
      if (unit && unit.subUnit) {
        const subUnit = unit.subUnit.find((s: any) => String(s.id) === String(pc.subUnitId));
        if (subUnit && subUnit.topics) {
          const topic = subUnit.topics.find((t: any) => String(t.id) === String(pc.topic.id));
          if (topic) {
            topic.learnerMap = checked;
          }
        }
      }
    });
    
    setValue('units', updated);
    trigger('units');
  };

  return (
    <Box sx={{ mb: 3 }}>
      {/* Unit Header with Code */}
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        {unit.code && (
          <Typography component="span" variant="h6" sx={{ color: 'text.secondary', mr: 1, fontWeight: 600 }}>
            {unit.code} - 
          </Typography>
        )}
        {unit.title}
      </Typography>

      {/* Performance Criteria Section */}
      <Box>
        {/* Select All Checkbox */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={allMapped}
                onChange={handleSelectAll}
                disabled={!canEditLearnerFields}
              />
            }
            label="Select All PC's"
            sx={{ m: 0 }}
          />
        </Box>

        {/* SubUnits with Topics */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {subUnitsWithTopics.map((subUnit) => (
            <Box key={subUnit.id}>
              {/* SubUnit Header (Learning Outcome) - only show if title exists */}
              {subUnit.title && (
                <Typography variant="body1" sx={{ fontWeight: 500, mb: 1.5, color: 'text.primary' }}>
                  {subUnit.title}
                </Typography>
              )}

              {/* Performance Criteria Table for this SubUnit */}
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Performance Criteria</TableCell>
                      <TableCell>Trainer Comment</TableCell>
                      <TableCell align="center">Gap</TableCell>
                      <TableCell align="center">Sign Off</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {subUnit.topics?.map((pc) => {
                      const currentValues = getCurrentTopicValues(pc.topic, pc.unitId, pc.subUnitId);
                      
                      return (
                        <TableRow key={pc.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                              <Checkbox
                                checked={currentValues.learnerMap}
                                onChange={() => {
                                  learnerMapHandler(pc.topic, pc.unitId, pc.subUnitId);
                                }}
                                disabled={!canEditLearnerFields}
                                size="small"
                                sx={{ p: 0.5, mt: -0.5 }}
                              />
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {pc.code && (
                                  <Typography component="span" variant="body2" sx={{ fontWeight: 500, mr: 0.5 }}>
                                    {pc.code}- 
                                  </Typography>
                                )}
                                {pc.description}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            {!canEditTrainerFields ? (
                              <span>{currentValues.comment || 'No comment'}</span>
                            ) : (
                              <TextField
                                size="small"
                                value={currentValues.comment}
                                onChange={(e) => {
                                  commentHandler(e, pc.topic.id, pc.unitId, pc.subUnitId);
                                }}
                              />
                            )}
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                              <GapIndicator
                                learnerMap={currentValues.learnerMap}
                                trainerMap={currentValues.trainerMap}
                                signedOff={currentValues.signedOff}
                                onClick={() => {
                                  if (canEditTrainerFields && currentValues.learnerMap) {
                                    trainerMapHandler(pc.topic, pc.unitId, pc.subUnitId);
                                  }
                                }}
                                disabled={!canEditTrainerFields || !currentValues.learnerMap}
                              />
                              <EvidenceIndicator evidenceCount={getTopicEvidenceCount(pc.topic, pc.unitId)} />
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Checkbox
                              checked={currentValues.signedOff}
                              disabled={
                                !canEditTrainerFields ||
                                !currentValues.learnerMap ||
                                !currentValues.trainerMap
                              }
                              onChange={() => {
                                signedOffHandler(pc.topic, pc.unitId, pc.subUnitId);
                              }}
                              size="small"
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default QualificationMinimal;

