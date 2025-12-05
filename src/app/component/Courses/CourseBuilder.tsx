import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react';
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
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
import { fetchActiveGatewayCourses } from '../../store/courseManagement';
import { 
  COURSE_TYPE_OPTIONS, 
  COURSE_TYPES, 
  COURSE_LEVELS,
  GatewayCourse 
} from './courseConstants';
import { ModuleEditorProps, StandardTopicEditorProps, UnitRendererProps } from './componentTypes';

// Define the props interface
interface CourseBuilderProps {
  edit?: 'create' | 'edit' | 'view';
  handleClose?: () => void;
}

const CourseBuilder: React.FC<CourseBuilderProps> = (props) => {
  const { edit = 'create', handleClose } = props;
  const { courseId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeGateways, setActiveGateways] = useState<GatewayCourse[]>([]);

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
    handleBack,
    handleStepClick,
    clearStepData
  } = useCourseBuilder(edit);

  // Destructure state for easier access
  const { courseData, mandatoryUnit, savedUnits, loading } = state;

  // Simplified navigation cleanup logic
  useEffect(() => {
    const currentPath = location.pathname;
    const prevPath = prevLocationRef.current;
    
    // Store current path for next comparison
    prevLocationRef.current = currentPath;

    // Clear step data when navigating away from course builder
    const shouldClearData = 
      currentPath === '/courses' ||
      currentPath === '/courseBuilder' ||
      (prevPath && 
       prevPath.includes('/courseBuilder/course/') && 
       !currentPath.includes('/courseBuilder/course/'));

    if (shouldClearData) {
      clearStepData();
    }
  }, [location.pathname, clearStepData]);

  // Fetch active gateway courses when component mounts
  useEffect(() => {
    let isMounted = true;

    const getActiveGateways = async () => {
      try {
        const gateways = await fetchActiveGatewayCourses();
        
        if (!isMounted) return;
        
        setActiveGateways(gateways);
      } catch (error) {
        if (!isMounted) return;
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : 'Failed to fetch gateway courses. Please try again later.';
        
        dispatch(showMessage({
          message: errorMessage,
          variant: "error"
        }));
      }
    };

    getActiveGateways();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  // Get steps based on course type
  const steps = useMemo(() => {
    if (courseData.course_core_type === 'Gateway') {
      return ['Course Details'];
    } else if (courseData.course_core_type === 'Standard') {
      return ['Course Details', 'Module'];
    } else {
      return ['Course Details', 'Unit'];
    }
  }, [courseData.course_core_type]);

  // Memoized check for saved units
  const hasSavedUnits = useMemo(() => {
    return Object.values(savedUnits).some(saved => saved);
  }, [savedUnits]);

  // Determine if a step is clickable (memoized for performance)
  const isStepClickable = useCallback((index: number) => {
    // Step 0 (Course Details) is always clickable
    if (index === 0) {
      return true;
    }
    // Step 1 (Units/Modules) is clickable if course is saved
    if (index === 1 && courseSaved) {
      return true;
    }
    // Step 2 (Criteria/Topics) is clickable if units are saved
    if (index === 2 && hasSavedUnits) {
      return true;
    }
    return false;
  }, [courseSaved, hasSavedUnits]);

  // Get tooltip title for a step (memoized for performance)
  const getTooltipTitle = useCallback((index: number) => {
    if (index === 2 && !hasSavedUnits && courseData.course_core_type !== 'Gateway') {
      return "Please save your units before accessing criteria";
    }
    if (index === 1 && !courseSaved) {
      return "Please save your course details first";
    }
    return "";
  }, [courseSaved, hasSavedUnits, courseData.course_core_type]);

  // Handle autocomplete changes
  const handleAutocompleteChange = useCallback((field: string, value: string | null) => {
    if (value !== null) {
      courseDispatch({
        type: 'UPDATE_COURSE_FIELD',
        field,
        value
      });
    }
  }, [courseDispatch]);

  // Render the appropriate form based on course type
  const renderCourseForm = useCallback(() => {
    const courseCoreType = courseData.course_core_type || 'Qualification';

    switch (courseCoreType) {
      case 'Standard':
        return (
          <StandardForm
            courseData={courseData}
            courseHandler={courseHandler}
            handleAutocompleteChange={handleAutocompleteChange}
            validationErrors={validationErrors}
            edit={edit}
            courseType={COURSE_TYPES as unknown as string[]}
            courseLevels={COURSE_LEVELS as unknown as string[]}
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
            courseType={COURSE_TYPES as unknown as string[]}
            courseLevels={COURSE_LEVELS as unknown as string[]}
          />
        );
    }
  }, [courseData, courseHandler, handleAutocompleteChange, validationErrors, edit, activeGateways, courseDispatch]);

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
    handleClose?.();
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
            value={courseData.course_core_type || 'Qualification'}
            label="Course Type"
            onChange={handleGlobalCourseTypeChange}
            disabled={edit === 'view' || courseSaved}
          >
            {COURSE_TYPE_OPTIONS.map((option) => (
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
            Enter the details for your {courseData.course_core_type || 'Qualification'} course.
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
           {courseData.course_core_type === 'Standard' ? 'Modules' : 'Units'}
          </Typography>

          {courseData.course_core_type === 'Standard' ? (
            <>
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

              {/* Assessment Criteria (Topics) for Standard */}
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                  Assessment Criteria
                </Typography>
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
              </Box>
            </>
          ) : (
            <UnitRenderer
              courseId={courseId || ''}
              mandatoryUnit={mandatoryUnit}
              courseDispatch={courseDispatch}
              savedUnits={savedUnits}
              setCourseSaved={setCourseSaved}
              edit={edit}
              saveCourse={saveCourse}
              courseType={courseData.course_core_type || 'Qualification'}
            />
          )}
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
    </Box>
  );
};

export default CourseBuilder;
