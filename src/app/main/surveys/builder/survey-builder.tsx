import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Eye, FileText, ArrowLeft } from 'lucide-react';
import {
  Box,
  Button,
  Typography,
  Paper,
  IconButton,
  Divider,
} from '@mui/material';
import { useDispatch } from 'react-redux';
import {
  setQuestions,
  updateSurvey,
} from 'app/store/surveySlice';
import {
  useGetSurveyByIdQuery,
  useGetQuestionsQuery,
  useReorderQuestionsMutation,
} from 'app/store/api/survey-api';
import QuestionSettings from './components/question-settings';
import TemplateSelector from './components/template-selector';
import SurveyPreview from './components/survey-preview';
import LivePreviewQuestion from './components/live-preview-question';
import { type Question } from 'app/store/api/survey-api';
import { type SurveyTemplate } from './components/templates';

const SurveyBuilder = () => {
  const { surveyId } = useParams<{ surveyId: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Fetch survey from API
  const { data: surveyResponse, isLoading: isLoadingSurvey, error: surveyError } = useGetSurveyByIdQuery(surveyId || '', {
    skip: !surveyId,
  });
  const survey = surveyResponse?.data?.survey;
  
  // Fetch questions from API
  const { data: questionsResponse, isLoading: isLoadingQuestions } = useGetQuestionsQuery(surveyId || '', {
    skip: !surveyId,
  });
  const questions = questionsResponse?.data?.questions || [];
  
  const [reorderQuestions] = useReorderQuestionsMutation();
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor));

  if (!surveyId) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Survey ID not provided</Typography>
      </Box>
    );
  }

  // Loading state
  if (isLoadingSurvey || isLoadingQuestions) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/surveys')}>
            <ArrowLeft size={20} />
          </IconButton>
          <Typography variant="h5">Loading Survey...</Typography>
        </Box>
        <Typography color="text.secondary">Please wait while we load the survey</Typography>
      </Box>
    );
  }

  // Error or not found state
  if (surveyError || !survey) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <IconButton onClick={() => navigate('/surveys')}>
            <ArrowLeft size={20} />
          </IconButton>
          <Typography variant="h5">Survey Not Found</Typography>
        </Box>
        <Typography color="text.secondary">
          {surveyError ? 'Failed to load the survey. Please try again.' : 'The survey you\'re looking for doesn\'t exist'}
        </Typography>
      </Box>
    );
  }

  const sortedQuestions = [...questions].sort((a: Question, b: Question) => a.order - b.order);

  const backgroundStyle = survey.background
    ? survey.background.type === 'gradient'
      ? { background: survey.background.value }
      : {
          backgroundImage: `url(${survey.background.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }
    : {};

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && surveyId) {
      const oldIndex = sortedQuestions.findIndex((q) => q.id === active.id);
      const newIndex = sortedQuestions.findIndex((q) => q.id === over.id);

      const newOrder = arrayMove(sortedQuestions, oldIndex, newIndex);
      const questionIds = newOrder.map((q) => q.id);

      try {
        await reorderQuestions({
          surveyId,
          questionIds,
        }).unwrap();
        // You can add a toast notification here if you have a toast system
      } catch (error: unknown) {
        console.error('Failed to reorder questions:', error);
        // You can add error toast notification here
      }
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setSettingsOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setSettingsOpen(true);
  };

  const handleSelectTemplate = (template: SurveyTemplate) => {
    // Clear existing questions and add template questions
    const templateQuestions: Question[] = template.questions.map((q, index) => ({
      ...q,
      id: `question-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      surveyId,
      order: index,
    }));

    // Replace all questions with template questions
    dispatch(setQuestions({ surveyId, questions: templateQuestions }) as any);

    // Apply template background to survey
    if (survey) {
      dispatch(
        updateSurvey({
          id: survey.id,
          updates: {
            background: template.background,
          },
        }) as any
      );
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <IconButton onClick={() => navigate('/surveys')}>
          <ArrowLeft size={20} />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h5" fontWeight="bold">
            {survey.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {survey.description || 'Build your survey questions'}
          </Typography>
        </Box>
      </Box>

      {/* Actions Bar */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6">Questions</Typography>
          <Typography variant="body2" color="text.secondary">
            {sortedQuestions.length} question{sortedQuestions.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Eye size={18} />}
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
          <Button
            variant="outlined"
            startIcon={<FileText size={18} />}
            onClick={() => setTemplateSelectorOpen(true)}
          >
            Use Template
          </Button>
          <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleAddQuestion}>
            Add Question
          </Button>
        </Box>
      </Box>

      {/* Questions List */}
      {sortedQuestions.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', border: '2px dashed', borderColor: 'divider' }}>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            No questions yet. Get started by using a template or adding your own questions.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FileText size={18} />}
              onClick={() => setTemplateSelectorOpen(true)}
            >
              Use Template
            </Button>
            <Button variant="contained" startIcon={<Plus size={18} />} onClick={handleAddQuestion}>
              Add Question
            </Button>
          </Box>
        </Paper>
      ) : (
        <Paper
          sx={{
            p: 4,
            minHeight: 600,
            ...backgroundStyle,
          }}
        >
          <Box
            sx={{
              mx: 'auto',
              maxWidth: '800px',
              bgcolor: 'background.paper',
              borderRadius: 2,
              p: 4,
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            }}
          >
            {/* Survey Header */}
            <Box sx={{ mb: 4, pb: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h4" fontWeight="bold" sx={{ mb: 1 }}>
                {survey.name}
              </Typography>
              {survey.description && (
                <Typography variant="body2" color="text.secondary">
                  {survey.description}
                </Typography>
              )}
            </Box>

            {/* Questions with Drag & Drop */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedQuestions.map((q) => q.id)}
                strategy={verticalListSortingStrategy}
              >
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {sortedQuestions.map((question, index) => (
                    <LivePreviewQuestion
                      key={question.id}
                      question={question}
                      surveyId={surveyId}
                      index={index}
                      onEdit={handleEditQuestion}
                    />
                  ))}
                </Box>
              </SortableContext>
            </DndContext>

            {/* Submit Button Preview */}
            {sortedQuestions.length > 0 && (
              <Box sx={{ mt: 4, pt: 3, borderTop: 1, borderColor: 'divider' }}>
                <Button variant="contained" fullWidth disabled>
                  Submit
                </Button>
              </Box>
            )}
          </Box>
        </Paper>
      )}

      {/* Dialogs */}
      <QuestionSettings
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        surveyId={surveyId}
        question={editingQuestion}
      />

      <TemplateSelector
        open={templateSelectorOpen}
        onOpenChange={setTemplateSelectorOpen}
        onSelectTemplate={handleSelectTemplate}
      />

      <SurveyPreview open={previewOpen} onOpenChange={setPreviewOpen} surveyId={surveyId} />
    </Box>
  );
};

export default SurveyBuilder;

