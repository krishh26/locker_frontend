import { useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import capitalize from "@mui/utils/capitalize";
import withReducer from "app/store/withReducer";
import { showMessage } from "app/store/fuse/messageSlice";

import EditableTable from "./EditableTable";
import {
  selectCpdLearner,
  getCpdLearnerListAPI,
  createCpdLearnerEntryAPI,
  updateCpdLearnerEntryAPI,
  deleteCpdLearnerEntryAPI,
  CpdLearnerEntry
} from "app/store/cpdLearner";
import reducer from "app/store/cpdLearner";

import { selectUser } from "app/store/userSlice";
import { selectLearnerManagement } from "app/store/learnerManagement";

const Cpd = () => {
  const dispatch: any = useDispatch();
  const { data, dataFetchLoading } = useSelector(selectCpdLearner);
  const user = JSON.parse(sessionStorage.getItem("learnerToken") || "null")?.user 
    || useSelector(selectUser)?.data || {};
  const { learner } = useSelector(selectLearnerManagement);
  
  const theme = useTheme();

  useEffect(() => {
    dispatch(getCpdLearnerListAPI());
  }, [dispatch]);

  const mapRow = (row: Partial<CpdLearnerEntry>) => ({
    what_training: row.activity || "",
    date: row.date || "",
    how_you_did: row.method || "",
    what_you_learned: row.learning || "",
    how_it_improved_work: row.impact || ""
  });

  const handleAddRow = async (newRow: Partial<CpdLearnerEntry>): Promise<boolean> => {
    const mappedRow = mapRow(newRow);

    if (Object.values(mappedRow).every(val => !val)) return true;

    try {
      const result = await dispatch(createCpdLearnerEntryAPI(mappedRow));
      if (result) dispatch(showMessage({ message: "CPD entry added successfully", variant: "success" }));
      return result;
    } catch {
      dispatch(showMessage({ message: "Failed to add CPD entry", variant: "error" }));
      return false;
    }
  };

  const handleUpdateRow = async (rowId: string, updatedRow: Partial<CpdLearnerEntry>): Promise<boolean> => {
    try {
      const result = await dispatch(updateCpdLearnerEntryAPI(rowId, mapRow(updatedRow)));
      if (result) dispatch(showMessage({ message: "CPD entry updated successfully", variant: "success" }));
      return result;
    } catch {
      dispatch(showMessage({ message: "Failed to update CPD entry", variant: "error" }));
      return false;
    }
  };

  const handleDeleteRow = async (rowId: string): Promise<boolean> => {
    try {
      const result = await dispatch(deleteCpdLearnerEntryAPI(rowId));
      if (result) dispatch(showMessage({ message: "CPD entry deleted successfully", variant: "success" }));
      return result;
    } catch {
      dispatch(showMessage({ message: "Failed to delete CPD entry", variant: "error" }));
      return false;
    }
  };

  const formattedData = (data || []).map((item: CpdLearnerEntry) => ({
    id: item.id,
    activity: item.what_training,
    date: item.date,
    method: item.how_you_did,
    learning: item.what_you_learned,
    impact: item.how_it_improved_work
  }));

  return (
    <Box sx={{ width: "100%", p: 1 }}>
      <Paper
        elevation={2}
        sx={{
          mb: 2,
          borderRadius: 2,
          boxShadow: theme.shadows[2],
          border: `1px solid ${theme.palette.divider}`,
          overflow: "hidden"
        }}
      >
        <Box
          sx={{
            bgcolor: theme.palette.primary.light,
            color: theme.palette.primary.contrastText,
            p: 2,
            textAlign: "center"
          }}
        >
          <Typography variant="h4" fontWeight={600}>
            Continuing Professional Development (CPD) – Learning log
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            p: 1.5,
            bgcolor: theme.palette.mode === "light" ? theme.palette.grey[100] : theme.palette.background.paper,
            borderTop: `1px solid ${theme.palette.divider}`
          }}
        >
          {[
            { label: "Name", value: capitalize(user.displayName || "") },
            { label: "Job title", value: learner?.job_title },
            { label: "Employer", value: learner?.employer_name }
          ].map(({ label, value }) => (
            <Box key={label} sx={{ display: "flex", alignItems: "center", minWidth: 200 }}>
              <Typography variant="body1" fontWeight="bold" sx={{ mr: 1 }}>{label}:</Typography>
              <Typography variant="body1">{value}</Typography>
            </Box>
          ))}
        </Box>
      </Paper>

      <EditableTable
        data={formattedData}
        onAddRow={handleAddRow}
        onUpdateRow={handleUpdateRow}
        onDeleteRow={handleDeleteRow}
        loading={dataFetchLoading}
      />
    </Box>
  );
};

export default withReducer("cpdLearner", reducer)(Cpd);
