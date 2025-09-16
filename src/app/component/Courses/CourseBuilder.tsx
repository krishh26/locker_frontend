import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useDispatch } from 'react-redux';
import { showMessage } from 'app/store/fuse/messageSlice';

// Custom hooks and components
import { useCourseBuilder } from './useCourseBuilder';
import StepperComponent from './StepperComponent';
import { SecondaryButton } from '../Buttons';
import QualificationForm from './QualificationForm';
import StandardForm from './StandardForm';
import GatewayForm from './GatewayForm';
import UnitRenderer from './UnitRenderer';
import ModuleEditor from './ModuleEditor';
import StandardTopicEditor from './StandardTopicEditor';
import QualificationCriteriaTable from './QualificationCriteriaTable';
import { fetchActiveGatewayCourses } from '../../store/courseManagement';
// Define the props interface directly to avoid import issues
interface CourseBuilderProps {
  edit?: 'create' | 'edit' | 'view';
  handleClose?: () => void;
}

const CourseBuilder: React.FC<CourseBuilderProps> = (props) => {
  const { edit = 'create' } = props;
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeGateways, setActiveGateways] = useState<any[]>([]);

  // Store previous location to detect navigation to listing page
  const prevLocationRef = useRef<string | null>(null);

  const {
    state,
    courseDispatch,
    courseSaved,
    setCourseSaved,
    showModuleEditor,
    setShowModuleEditor,
    showTopicEditor,
    setShowTopicEditor,
    activeStep,
    completedSteps,
    validationErrors,
    courseHandler,
    saveCourse,
    handleNext,
    handleBack,
    handleStepClick,
    clearStepData
  } = useCourseBuilder(edit);

  // Destructure state for easier access
  const { courseData, mandatoryUnit, savedUnits, loading } = state;

  useEffect(() => {
    // Store current path
    prevLocationRef.current = location.pathname;

    return () => {
      // If navigating to course listing page, clear the step data
      if (location.pathname === '/courses' ||
        location.pathname === '/courseBuilder' ||
        (location.pathname.includes('/courseBuilder/course/') &&
          prevLocationRef.current &&
          prevLocationRef.current.includes('/courseBuilder/course/') &&
          !location.pathname.includes(prevLocationRef.current))) {
        clearStepData();
      }
    };
  }, [location, clearStepData]);

  // Function to handle learning outcomes changes
  const handleLearningOutcomesChange = (unitId: string | number, field: string, value: any) => {
    if (edit === "view") {
      return;
    }

    courseDispatch({
      type: 'UPDATE_MANDATORY_UNIT',
      unitId,
      field,
      value
    });
  };

  // Fetch active gateway courses when component mounts
  useEffect(() => {
    const getActiveGateways = async () => {
      try {
        const gateways = await fetchActiveGatewayCourses();
        setActiveGateways(gateways);
      } catch (error) {
        console.error('Error fetching active gateways:', error);
      }
    };

    getActiveGateways();
  }, []);

  // Get steps based on course type
  const steps = useMemo(() => {
    if (courseData.course_core_type === 'Gateway') {
      return ['Course Details'];
    } else if (courseData.course_core_type === 'Standard') {
      return ['Course Details', 'Learning Outcome', 'Assessment Criteria'];
    } else {
      return ['Course Details', 'Learning Outcome', 'Assessment Criteria'];
    }
  }, [courseData.course_core_type]);

  // Determine if a step is clickable
  const isStepClickable = (index: number) => {
    // Step 0 (Course Details) is always clickable
    if (index === 0) {
      return true;
    }
    // Step 1 (Units/Modules) is clickable if course is saved
    else if (index === 1 && courseSaved) {
      return true;
    }
    // Step 2 (Criteria/Topics) is clickable if units are saved
    else if (index === 2 && Object.values(savedUnits).some(saved => saved)) {
      return true;
    }
    return false;
  };

  // Get tooltip title for a step
  const getTooltipTitle = (index: number) => {
    if (index === 2 && !Object.values(savedUnits).some(saved => saved) && courseData.course_core_type !== 'Gateway') {
      return "Please save your units before accessing criteria";
    } else if (index === 1 && !courseSaved) {
      return "Please save your course details first";
    }
    return "";
  };

  // Render the appropriate form based on course type
  const renderCourseForm = () => {
    // Create a mock handleAutocompleteChange function for the forms
    const handleAutocompleteChange = (field: string, value: string | null) => {
      if (value !== null) {
        courseDispatch({
          type: 'UPDATE_COURSE_FIELD',
          field,
          value
        });
      }
    };

    // Define course types and levels for the forms
    const courseTypes = [
     'Functional Skills Maths', 'Functional Skills English', 'BTEC', 'Diploma','RQF'
    ];

    const courseLevels = [
      'Entry Level', 'Level 1', 'Level 2', 'Level 3', 'Level 4',
      'Level 5', 'Level 6', 'Level 7', 'Level 8'
    ];

    switch (courseData.course_core_type) {
      case 'Standard':
        return (
          <StandardForm
            courseData={courseData}
            courseHandler={courseHandler}
            handleAutocompleteChange={handleAutocompleteChange}
            validationErrors={validationErrors}
            edit={edit}
            courseType={courseTypes}
            courseLevels={courseLevels}
            gatewayCourses={activeGateways}
          />
        );
      case 'Gateway':
        return (
          <GatewayForm
            courseData={courseData}
            courseHandler={courseHandler}
            handleAutocompleteChange={handleAutocompleteChange}
            validationErrors={validationErrors}
            edit={edit}
            courseDispatch={courseDispatch}
          />
        );
      default:
        return (
          <QualificationForm
            courseData={courseData}
            courseHandler={courseHandler}
            handleAutocompleteChange={handleAutocompleteChange}
            validationErrors={validationErrors}
            edit={edit}
            courseType={courseTypes}
            courseLevels={courseLevels}
          />
        );
    }
  };

  // Course type options for the global filter
  const courseTypeOptions = [
    { value: "Qualification", label: "Qualification" },
    { value: "Standard", label: "Standard" },
    { value: "Gateway", label: "Gateway" }
  ];

  // Handle global course type change
  const handleGlobalCourseTypeChange = (event: SelectChangeEvent) => {
    if (edit === 'view' || courseSaved) {
      // In view mode or after saving, just show a message
      dispatch(showMessage({
        message: "Cannot change course type after saving or in view mode.",
        variant: "info"
      }));
      return;
    }

    const newCourseType = event.target.value;
    courseDispatch({
      type: 'UPDATE_COURSE_FIELD',
      field: 'course_core_type',
      value: newCourseType
    });
  };

  // Function to navigate to course listing and clear step data
  const navigateToListing = () => {
    clearStepData();
    navigate('/courseBuilder');
  };

  return (
    <Box className="p-4">
      {/* Header with Back to Listing and Course Type Filter */}
      <Box
        className="flex justify-between mb-2"
        sx={{
          position: 'relative',
          zIndex: 1,
          padding: '16px 0'
        }}
      >
        <SecondaryButton
          name="Back to Listing"
          onClick={navigateToListing}
          startIcon={<ArrowBackIcon />}
        />

        <FormControl size="small" sx={{ width: '200px' }}>
          <InputLabel id="global-course-type-label">Course Type</InputLabel>
          <Select
            labelId="global-course-type-label"
            id="global-course-type"
            value={courseData.course_core_type}
            label="Course Type"
            onChange={handleGlobalCourseTypeChange}
            disabled={edit === 'view' || courseSaved}
          >
            {courseTypeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Stepper */}
      <StepperComponent
        steps={steps}
        activeStep={activeStep}
        completedSteps={completedSteps}
        handleStepClick={handleStepClick}
        isStepClickable={isStepClickable}
        getTooltipTitle={getTooltipTitle}
      />

      {/* Step 1: Course Details */}
      {activeStep === 0 && (
        <Paper elevation={0} className="p-6 border border-gray-200 mb-6">
          <Typography variant="h6" gutterBottom>
            Course Details
          </Typography>

          <Typography variant="body2" color="textSecondary" className="mb-4">
            Enter the details for your {courseData.course_core_type} course.
          </Typography>

          {renderCourseForm()}
          {edit !== 'view' && (
            <Box className="flex justify-end mt-4">
              <SecondaryButton
                name={courseSaved ? "Update Course" : "Create Course"}
                onClick={saveCourse}
                disabled={loading}
                loading={loading}
              />
            </Box>
          )}
        </Paper>
      )}

      {/* Step 2: Units/Modules */}
      {activeStep === 1 && courseData.course_core_type !== 'Gateway' && courseSaved && (
        <Paper elevation={0} className="p-6 border border-gray-200 mb-6">
          <Typography variant="h6" gutterBottom>
           Learning Outcomes
          </Typography>

          {courseData.course_core_type === 'Standard' ? (
            <>
              {/* @ts-ignore - Type issues will be fixed in a future update */}
              <ModuleEditor
                courseId={courseId || ''}
                showModuleEditor={showModuleEditor}
                setShowModuleEditor={setShowModuleEditor}
                mandatoryUnit={mandatoryUnit}
                courseDispatch={courseDispatch}
                savedUnits={savedUnits}
                setCourseSaved={setCourseSaved}
                edit={edit}
              />
            </>
          ) : (
            <>
              {/* @ts-ignore - Type issues will be fixed in a future update */}
              <UnitRenderer
                courseId={courseId || ''}
                mandatoryUnit={mandatoryUnit}
                courseDispatch={courseDispatch}
                savedUnits={savedUnits}
                setCourseSaved={setCourseSaved}
                edit={edit}
                saveCourse={saveCourse}
                courseType={courseData.course_core_type}
              />
            </>
          )}

          {/* <Box className="flex justify-end mt-4">
            {Object.values(savedUnits).some(saved => saved) && (
              <SecondaryButton
                name={`Continue to ${courseData.course_core_type === 'Standard' ? 'Topics' : 'Criteria'}`}
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
              />
            )}
          </Box> */}
        </Paper>
      )}

      {/* Message when course is not saved */}
      {activeStep === 1 && courseData.course_core_type !== 'Gateway' && !courseSaved && (
        <Paper elevation={0} className="p-6 border border-gray-200 mb-6">
          <Alert severity="info">
            Please save your course details first before adding {courseData.course_core_type === 'Standard' ? 'modules' : 'units'}.
          </Alert>
          <Box className="flex justify-start mt-4">
            <SecondaryButton
              name="Back to Course Details"
              onClick={handleBack}
              startIcon={<ArrowBackIcon />}
            />
          </Box>
        </Paper>
      )}

      {/* Step 3: Criteria/Topics */}
      {activeStep === 2 && courseData.course_core_type === 'Standard' && (
        <Paper elevation={0} className="p-6 border border-gray-200 mb-6">
          <Typography variant="h6" gutterBottom>
          Assessment Criteria
          </Typography>

          {/* @ts-ignore - Type issues will be fixed in a future update */}
          <StandardTopicEditor
            courseId={courseId || ''}
            showTopicEditor={showTopicEditor}
            setShowTopicEditor={setShowTopicEditor}
            mandatoryUnit={mandatoryUnit}
            courseDispatch={courseDispatch}
            savedUnits={savedUnits}
            edit={edit}
            saveCourse={saveCourse}
          />
        </Paper>
      )}

      {activeStep === 2 && courseData.course_core_type === 'Qualification' && courseSaved && Object.values(savedUnits).some(saved => saved) && (
        <Paper elevation={0} className="p-6 border border-gray-200 mb-6">
          <Typography variant="h6" gutterBottom>
          Assessment Criteria
          </Typography>

          {Object.values(mandatoryUnit).length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Select a unit to manage its assessment criteria:
              </Typography>
              {Object.values(mandatoryUnit).map((unit: any) => (
                <Accordion key={unit.id}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography>
                      <strong>{unit.title || 'Untitled Unit'}</strong> {unit.unit_ref ? `(${unit.unit_ref})` : ''}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <QualificationCriteriaTable
                      unitId={unit.id}
                      learningOutcomes={unit.learning_outcomes || []}
                      onChange={handleLearningOutcomesChange}
                      readOnly={edit === "view"}
                      saveCourse={saveCourse}
                      renderUpdateButton={false}
                    />
                  </AccordionDetails>
                </Accordion>
              ))}

              {/* Update Criteria button outside the accordion */}
              {edit !== "view" && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                  <SecondaryButton
                    name="Update Criteria"
                    onClick={async () => {
                      try {
                        const result = await saveCourse();
                        if (result) {
                          dispatch(showMessage({
                            message: "All criteria updated and saved successfully.",
                            variant: "success"
                          }));
                        } else {
                          dispatch(showMessage({
                            message: "Failed to save criteria to the server. Please try again.",
                            variant: "error"
                          }));
                        }
                      } catch (error) {
                        console.error('Error saving course:', error);
                        dispatch(showMessage({
                          message: "An error occurred while saving criteria.",
                          variant: "error"
                        }));
                      }
                    }}
                    sx={{ backgroundColor: '#4caf50', color: 'white', '&:hover': { backgroundColor: '#388e3c' } }}
                  />
                </Box>
              )}
            </Box>
          ) : (
            <Box className="p-6 border border-gray-200 rounded-md bg-gray-50 text-center">
              <Typography className="opacity-50">
                No units available. Please add units first.
              </Typography>
            </Box>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default CourseBuilder;
