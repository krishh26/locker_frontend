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
import {
  useGetResponsesQuery,
  useGetQuestionsQuery,
  useDeleteResponseMutation,
  type Response,
} from 'app/store/api/survey-api';

interface ResponsesTableProps {
  surveyId: string;
}

const ResponsesTable: React.FC<ResponsesTableProps> = ({ surveyId }) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  
  // Fetch responses from API
  const { data: responsesResponse, isLoading: isLoadingResponses } = useGetResponsesQuery({
    surveyId,
    params: { page, limit },
  },{
    refetchOnMountOrArgChange: true,
    skip: !surveyId,
  });
  const responses = responsesResponse?.data?.responses || [];
  
  // Fetch questions from API
  const { data: questionsResponse } = useGetQuestionsQuery(surveyId, {
    skip: !surveyId,
    refetchOnMountOrArgChange: true,
  });
  const questions = questionsResponse?.data?.questions || [];
  
  const [deleteResponse, { isLoading: isDeleting }] = useDeleteResponseMutation();
  const [selectedResponse, setSelectedResponse] = useState<Response | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  const handleViewResponse = (response: Response) => {
    setSelectedResponse(response);
    setDetailDialogOpen(true);
  };

  const handleDeleteResponse = async (responseId: string) => {
    if (confirm('Are you sure you want to delete this response?')) {
      try {
        await deleteResponse({
          surveyId,
          responseId,
        }).unwrap();
        // You can add a toast notification here if you have a toast system
      } catch (error: unknown) {
        console.error('Failed to delete response:', error);
        // You can add error toast notification here
      }
    }
  };

  if (isLoadingResponses) {
    return (
      <Paper sx={{ p: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">Loading responses...</Typography>
      </Paper>
    );
  }

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

