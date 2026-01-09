import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MoreVertical, Pencil, Copy, Trash2 } from 'lucide-react';
import {
  Box,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import {
  useDeleteQuestionMutation,
  useCreateQuestionMutation,
  type Question,
} from 'app/store/api/survey-api';

interface LivePreviewQuestionProps {
  question: Question;
  surveyId: string;
  index: number;
  onEdit: (question: Question) => void;
}

const LivePreviewQuestion: React.FC<LivePreviewQuestionProps> = ({
  question,
  surveyId,
  index,
  onEdit,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [deleteQuestion, { isLoading: isDeleting }] = useDeleteQuestionMutation();
  const [createQuestion] = useCreateQuestionMutation();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDuplicate = async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id: _id, order: _order, createdAt: _createdAt, updatedAt: _updatedAt, ...questionData } = question;
    try {
      await createQuestion({
        surveyId,
        question: {
          ...questionData,
          title: `${question.title} (Copy)`,
        },
      }).unwrap();
      // You can add a toast notification here if you have a toast system
      setAnchorEl(null);
    } catch (error: unknown) {
      console.error('Failed to duplicate question:', error);
      // You can add error toast notification here
    }
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
    setAnchorEl(null);
  };

  const confirmDelete = async () => {
    try {
      await deleteQuestion({
        surveyId,
        questionId: question.id,
      }).unwrap();
      // You can add a toast notification here if you have a toast system
      setDeleteDialogOpen(false);
    } catch (error: unknown) {
      console.error('Failed to delete question:', error);
      // You can add error toast notification here
    }
  };

  const renderQuestionField = () => {
    switch (question.type) {
      case 'short-text':
        return (
          <TextField
            placeholder="Short text answer"
            disabled
            fullWidth
            size="small"
            sx={{ bgcolor: 'action.disabledBackground' }}
          />
        );
      case 'long-text':
        return (
          <TextField
            placeholder="Long text answer"
            disabled
            fullWidth
            multiline
            rows={4}
            size="small"
            sx={{ bgcolor: 'action.disabledBackground' }}
          />
        );
      case 'multiple-choice':
        return (
          <RadioGroup>
            {question.options?.map((option) => (
              <FormControlLabel
                key={option}
                value={option}
                control={<Radio disabled />}
                label={option}
                disabled
              />
            ))}
          </RadioGroup>
        );
      case 'checkbox':
        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {question.options?.map((option) => (
              <FormControlLabel
                key={option}
                control={<Checkbox disabled />}
                label={option}
                disabled
              />
            ))}
          </Box>
        );
      case 'rating':
        return (
          <RadioGroup row>
            {[1, 2, 3, 4, 5].map((rating) => (
              <FormControlLabel
                key={rating}
                value={String(rating)}
                control={<Radio disabled />}
                label={String(rating)}
                disabled
              />
            ))}
          </RadioGroup>
        );
      case 'date':
        return (
          <TextField
            type="date"
            disabled
            fullWidth
            size="small"
            sx={{ bgcolor: 'action.disabledBackground' }}
            InputLabelProps={{ shrink: true }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Box
        ref={setNodeRef}
        style={style}
        sx={{
          display: 'flex',
          gap: 2,
          alignItems: 'flex-start',
          '&:hover .drag-handle': { opacity: 1 },
          '&:hover .more-menu': { opacity: 1 },
          '&:hover .question-card': { borderColor: 'primary.main' },
        }}
      >
        {/* Drag Handle */}
        <Box
          {...attributes}
          {...listeners}
          className="drag-handle"
          sx={{
            mt: 2,
            cursor: 'grab',
            '&:active': { cursor: 'grabbing' },
            color: 'text.secondary',
            opacity: 0.4,
            transition: 'opacity 0.2s',
            flexShrink: 0,
          }}
        >
          <GripVertical size={24} />
        </Box>

        {/* Question Card */}
        <Paper
          className="question-card"
          sx={{
            flex: 1,
            p: 3,
            position: 'relative',
            border: 2,
            borderColor: 'transparent',
            transition: 'border-color 0.2s',
          }}
        >
          {/* 3-dot Menu */}
          <Box
            className="more-menu"
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              opacity: 0.4,
              transition: 'opacity 0.2s',
              zIndex: 10,
            }}
          >
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                setAnchorEl(e.currentTarget);
              }}
            >
              <MoreVertical size={18} />
            </IconButton>
          </Box>

          {/* Question Content */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body1" fontWeight="medium">
                {index + 1}. {question.title}
                {question.required && (
                  <Typography component="span" color="error" sx={{ ml: 0.5 }}>
                    *
                  </Typography>
                )}
              </Typography>
              {question.description && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {question.description}
                </Typography>
              )}
            </Box>
            <Box>{renderQuestionField()}</Box>
          </Box>
        </Paper>
      </Box>

      {/* Actions Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            onEdit(question);
            setAnchorEl(null);
          }}
        >
          <Pencil size={16} style={{ marginRight: 8 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleDuplicate();
          }}
        >
          <Copy size={16} style={{ marginRight: 8 }} />
          Duplicate
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          sx={{ color: 'error.main' }}
        >
          <Trash2 size={16} style={{ marginRight: 8 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This action cannot be undone. This will permanently delete the question.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default LivePreviewQuestion;

