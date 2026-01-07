import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from '@mui/material';
import { Eye, Trash2 } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { selectResponsesBySurveyId, deleteResponse, type Response } from 'app/store/responseSlice';
import { selectQuestionsBySurveyId } from 'app/store/surveySlice';

interface ResponsesTableProps {
  surveyId: string;
}

const ResponsesTable: React.FC<ResponsesTableProps> = ({ surveyId }) => {
  const dispatch = useDispatch();
  const responses = useSelector((state: any) => selectResponsesBySurveyId(state, surveyId));
  const questions = useSelector((state: any) => selectQuestionsBySurveyId(state, surveyId));
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleViewResponse = (response: Response) => {
    setSelectedResponse(response);
    setDetailDialogOpen(true);
  };

  const handleDeleteResponse = (responseId: string) => {
    if (confirm('Are you sure you want to delete this response?')) {
      dispatch(deleteResponse({ id: responseId, surveyId }) as any);
    }
  };

  if (responses.length === 0) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">No responses yet</Typography>
      </Paper>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Response ID</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell>Answers</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responses.map((response: Response) => (
              <TableRow key={response.id}>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {response.id.substring(0, 12)}...
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {format(new Date(response.submittedAt), 'MMM d, yyyy h:mm a')}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {Object.keys(response.answers).length} answers
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleViewResponse(response)}>
                    <Eye size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteResponse(response.id)}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Response Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Response Details</DialogTitle>
        <DialogContent>
          {selectedResponse && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Submitted At
                </Typography>
                <Typography variant="body2">
                  {format(new Date(selectedResponse.submittedAt), 'MMMM d, yyyy h:mm a')}
                </Typography>
              </Box>
              <Divider />
              {questions.map((question: any, index: number) => {
                const answer = selectedResponse.answers[question.id];
                return (
                  <Box key={question.id}>
                    <Typography variant="subtitle2" fontWeight="medium" sx={{ mb: 1 }}>
                      {index + 1}. {question.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {Array.isArray(answer)
                        ? answer.join(', ')
                        : answer || <em>(No answer)</em>}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ResponsesTable;

