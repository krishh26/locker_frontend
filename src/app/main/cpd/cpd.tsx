import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid
} from "@mui/material";
import {
  selectCpdPlanning,
  getCpdEntriesAPI,
  createCpdEntryAPI,
  updateCpdEntryAPI,
  deleteCpdEntryAPI,
  CpdEntry
} from "app/store/cpdPlanning";
import { useDispatch, useSelector } from "react-redux";
import { selectstoreDataSlice } from "app/store/reloadData";
import { selectUser } from "app/store/userSlice";
import EditableTable from "./EditableTable";
import { showMessage } from "app/store/fuse/messageSlice";

const Cpd = () => {
  const dispatch: any = useDispatch();
  const { data, dataFetchLoading } = useSelector(selectCpdPlanning);
  const { user_id } = useSelector(selectstoreDataSlice);
  const user = JSON.parse(sessionStorage.getItem('learnerToken'))?.user || useSelector(selectUser)?.data;

  const [userInfo] = useState({
    name: user?.name || '',
    jobTitle: user?.job_title || '',
    workplace: user?.workplace || ''
  });

  // Fetch CPD entries on component mount
  useEffect(() => {
    const userId = user_id || user?.user_id;
    if (userId) {
      dispatch(getCpdEntriesAPI(userId));
    }
  }, [dispatch, user_id, user?.user_id]);

  const handleAddRow = async (newRow: Partial<CpdEntry>): Promise<boolean> => {
    // Only save if at least one field has data
    if (!newRow.activity && !newRow.date && !newRow.method && !newRow.learning && !newRow.impact) {
      return true; // Don't save completely empty rows
    }

    const userId = user_id || user?.user_id;
    if (!userId) {
      dispatch(showMessage({ message: "User ID not found", variant: "error" }));
      return false;
    }

    const rowWithId = {
      ...newRow,
      user_id: userId
    };

    try {
      await dispatch(createCpdEntryAPI(rowWithId as CpdEntry));
      dispatch(showMessage({ message: "CPD entry added successfully", variant: "success" }));
      return true;
    } catch (error) {
      dispatch(showMessage({ message: "Failed to add CPD entry", variant: "error" }));
      return false;
    }
  };

  const handleUpdateRow = async (rowId: string, updatedRow: Partial<CpdEntry>): Promise<boolean> => {
    try {
      await dispatch(updateCpdEntryAPI(rowId, updatedRow));
      dispatch(showMessage({ message: "CPD entry updated successfully", variant: "success" }));
      return true;
    } catch (error) {
      dispatch(showMessage({ message: "Failed to update CPD entry", variant: "error" }));
      return false;
    }
  };

  const handleDeleteRow = async (rowId: string): Promise<boolean> => {
    try {
      await dispatch(deleteCpdEntryAPI(rowId));
      dispatch(showMessage({ message: "CPD entry deleted successfully", variant: "success" }));
      return true;
    } catch (error) {
      dispatch(showMessage({ message: "Failed to delete CPD entry", variant: "error" }));
      return false;
    }
  };

  return (
    <div>
      <Box sx={{ width: "100%", p: 2 }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            backgroundColor: "#f0f0f0",
            textAlign: "center"
          }}
        >
          <Typography variant="h6" component="h1" fontWeight="bold">
            Continuing Professional Development (CPD) – Learning log
          </Typography>
        </Paper>

        {/* User Info */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 3,
            border: "1px solid #ccc"
          }}
        >
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1" fontWeight="bold">
                Name: {userInfo.name}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" fontWeight="bold">
                Job title: {userInfo.jobTitle}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body1" fontWeight="bold">
                Workplace: {userInfo.workplace}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Editable Table */}
        <EditableTable
          data={data || []}
          onAddRow={handleAddRow}
          onUpdateRow={handleUpdateRow}
          onDeleteRow={handleDeleteRow}
          loading={dataFetchLoading}
        />
      </Box>
    </div>
  );
};

export default Cpd;
