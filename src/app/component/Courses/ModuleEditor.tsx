import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { SecondaryButton, SecondaryButtonOutlined, LoadingButton } from '../Buttons';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import styles from './style.module.css';
import { useDispatch } from 'react-redux';
import { updateCourseAPI } from 'app/store/courseManagement';
import { showMessage } from 'app/store/fuse/messageSlice';
import axios from 'axios';
import jsonData from 'src/url.json';

import { ModuleEditorProps } from './componentTypes';
import ModuleFormDialog from './ModuleFormDialog';

const ModuleEditor: React.FC<ModuleEditorProps> = ({
  courseId,
  mandatoryUnit,
  courseDispatch,
  savedUnits,
  setCourseSaved,
  edit,
  showModuleEditor,
  setShowModuleEditor
}) => {
  const modules = Object.values(mandatoryUnit);
  const readOnly = edit === 'view';
  const [localModules, setLocalModules] = useState<any[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [moduleFormOpen, setModuleFormOpen] = useState(false);
  const [currentModule, setCurrentModule] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const dispatch: any = useDispatch();

  useEffect(() => {
    // Ensure modules is an array and has valid data
    if (modules && modules.length > 0) {
      // Check if any module is missing required fields and log it
      modules.forEach((module, index) => {
        if (!module.id || !module.title) {
          console.warn(`Module at index ${index} is missing required fields:`, module);
        }
      });

      // Ensure all modules have the required fields with default values if missing
      const processedModules = modules.map((module, idx) => ({
        ...module,
        id: module.id,
        title: module.title || `Module ${idx + 1}`,
        component_ref: module.component_ref || '',
        mandatory: module.mandatory || 'true',
        moduleType: module.moduleType || 'core',
        subUnit: module.subUnit || [],
        learning_outcomes: module.learning_outcomes || [],
        description: module.description || '',
        delivery_method: module.delivery_method || '',
        otj_hours: module.otj_hours || '0',
        delivery_lead: module.delivery_lead || '',
        sort_order: module.sort_order || '0',
        active: module.active || 'true'
      }));

      setLocalModules(processedModules);
    } else {
      setLocalModules([]);
    }
  }, [modules]); // Update localModules whenever modules prop changes

  const openAddModuleDialog = () => {
    setCurrentModule(null);
    setIsEditMode(false);
    setModuleFormOpen(true);
  };

  const openEditModuleDialog = (module: any) => {
    setCurrentModule(module);
    setIsEditMode(true);
    setModuleFormOpen(true);
  };

  const closeModuleDialog = () => {
    setModuleFormOpen(false);
    setCurrentModule(null);
  };

  const handleModuleSave = (moduleData: any) => {
    const formattedModuleData = {
      ...moduleData,
      id: moduleData.id.startsWith('module_') ? moduleData.id : `module_${moduleData.id}`
    };

    if (isEditMode) {
      // Normalize IDs for comparison to handle both with and without 'module_' prefix
      const updatedModules = localModules.map(module => {
        const normalizedModuleId = module.id.replace(/^module_/, '');
        const normalizedDataId = moduleData.id.replace(/^module_/, '');

        return normalizedModuleId === normalizedDataId ? formattedModuleData : module;
      });
      setLocalModules(updatedModules);

      // Update the module in the parent component's state
      if (courseDispatch) {
        courseDispatch({
          type: 'UPDATE_MANDATORY_UNIT',
          unitId: formattedModuleData.id,
          field: 'all',
          value: formattedModuleData
        });
      }
    } else {
      const newModules = [...localModules, formattedModuleData];
      setLocalModules(newModules);

      // Add the new module to the parent component's state
      if (courseDispatch) {
        courseDispatch({
          type: 'ADD_UNIT',
          unitId: formattedModuleData.id,
          unit: formattedModuleData
        });
      }
    }
  };

  const deleteModule = (moduleId: string) => {
    const updatedModules = localModules.filter(module => module.id !== moduleId);
    setLocalModules(updatedModules);

    if (expandedModule === moduleId) {
      setExpandedModule(null);
    }

    // If the module form is open and we're deleting the current module, close it
    if (moduleFormOpen && currentModule && currentModule.id === moduleId) {
      closeModuleDialog();
    }

    // Remove the module from the parent component's state
    if (courseDispatch) {
      courseDispatch({
        type: 'REMOVE_UNIT',
        unitId: moduleId
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // First, clear existing modules in the parent state to avoid stale data
      if (courseDispatch) {
        // Create a fresh object with all modules
        const modulesObject = {};
        localModules.forEach(module => {
          const moduleId = module.id.startsWith('module_') ? module.id : `module_${module.id}`;
          const unitData = {
            ...module,
            id: moduleId,
            title: module.title,
            component_ref: module.component_ref || '',
            mandatory: module.mandatory || 'true',
            moduleType: module.moduleType || 'core',
            subUnit: module.subUnit || [],
            learning_outcomes: module.learning_outcomes || [],
            description: module.description || '',
            delivery_method: module.delivery_method || '',
            otj_hours: module.otj_hours || '0',
            delivery_lead: module.delivery_lead || '',
            sort_order: module.sort_order || '0',
            active: module.active || 'true'
          };
          modulesObject[moduleId] = unitData;
        });

        // Set all modules at once
        courseDispatch({
          type: 'SET_MANDATORY_UNIT',
          payload: modulesObject
        });

        // Mark all units as saved
        courseDispatch({ type: 'MARK_UNITS_SAVED' });
        setCourseSaved(true);
      }

      // Format modules for API
      const units = localModules.map((module: any) => {
        const moduleId = module.id.startsWith('module_') ? module.id : `module_${module.id}`;
        return {
          id: moduleId,
          title: module.title,
          component_ref: module.component_ref || '',
          mandatory: module.mandatory || 'true',
          moduleType: module.moduleType || 'core',
          subUnit: module.subUnit || [],
          learning_outcomes: module.learning_outcomes || [],
          description: module.description || '',
          delivery_method: module.delivery_method || '',
          otj_hours: module.otj_hours || '0',
          delivery_lead: module.delivery_lead || '',
          sort_order: module.sort_order || '0',
          active: module.active || 'true'
        };
      });

      // Save to API if courseId exists
      if (courseId) {
        try {
          const fetchCourseResponse = await axios.get(`${jsonData.API_LOCAL_URL}/course/get/${courseId}`);
          const currentCourse = fetchCourseResponse.data.data;
          const payload = {
            ...currentCourse,
            units: units
          };

          dispatch(updateCourseAPI(courseId, payload))
            .then((response: boolean) => {
              if (response) {
                dispatch(showMessage({
                  message: "Modules updated successfully",
                  variant: "success"
                }));
              }
            })
            .catch((error: any) => {
              dispatch(showMessage({
                message: "Error updating modules",
                variant: "error"
              }));
            });
        } catch (error) {
          dispatch(showMessage({
            message: "Error updating modules: Could not fetch current course data",
            variant: "error"
          }));
        }
      }

      // Close module editor if needed
      if (setShowModuleEditor) {
        setShowModuleEditor(false);
      }
    } catch (error) {
      dispatch(showMessage({
        message: "Error updating modules",
        variant: "error"
      }));
    } finally {
      setIsSaving(false);
    }
  };
  return (
    <Paper elevation={0} className={styles.container}>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          {!readOnly && (
            <SecondaryButton
              name="Add Module"
              startIcon={<AddIcon />}
              onClick={openAddModuleDialog}
            />
          )}
        </Box>

        {localModules.length === 0 ? (
          <Typography align="center" color="textSecondary" sx={{ py: 4 }}>
            No modules yet. Click the "Add Module" button to create one.
          </Typography>
        ) : (
          localModules.map((module) => (
            <Accordion
              key={module.id}
              expanded={expandedModule === module.id}
              onChange={() => setExpandedModule(expandedModule === module.id ? null : module.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography>
                      <strong>Duty {module.component_ref}</strong> - {module.title}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      {module.moduleType === 'core' ? 'Core Module' :
                       module.moduleType === 'optional' ? 'Optional Module' :
                       module.moduleType === 'behaviour' ? 'Behaviour' :
                       module.moduleType === 'knowledge' ? 'Knowledge' :
                       module.moduleType === 'skill' ? 'Skill' : 'Module'}
                      {module.mandatory === 'true' ? ' • Mandatory' : ' • Optional'}
                    </Typography>
                  </Box>
                  {!readOnly && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditModuleDialog(module);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteModule(module.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography sx={{ width: '30%' }}>
                      <strong>Module Reference:</strong> {module.component_ref}
                    </Typography>
                    <Typography sx={{ width: '70%' }}>
                      <strong>Title:</strong> {module.title}
                    </Typography>
                  </Box>

                  {module.description && (
                    <Typography>
                      <strong>Description:</strong> {module.description}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Typography sx={{ width: '50%' }}>
                      <strong>Module Type:</strong> {
                        module.moduleType === 'core' ? 'Core Module' :
                        module.moduleType === 'optional' ? 'Optional Module' :
                        module.moduleType === 'behaviour' ? 'Behaviour' :
                        module.moduleType === 'knowledge' ? 'Knowledge' :
                        module.moduleType === 'skill' ? 'Skill' : 'Module'
                      }
                    </Typography>
                    <Typography sx={{ width: '50%' }}>
                      <strong>Mandatory:</strong> {module.mandatory === 'true' ? 'Yes' : 'No'}
                    </Typography>
                  </Box>

                  {module.delivery_method && (
                    <Typography>
                      <strong>Delivery Method/Evidence Requirement:</strong> {module.delivery_method}
                    </Typography>
                  )}

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {module.otj_hours && (
                      <Typography sx={{ width: '50%' }}>
                        <strong>OTJ Hours:</strong> {module.otj_hours}
                      </Typography>
                    )}
                    {module.delivery_lead && (
                      <Typography sx={{ width: '50%' }}>
                        <strong>Delivery Lead:</strong> {module.delivery_lead}
                      </Typography>
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {module.sort_order && (
                      <Typography sx={{ width: '50%' }}>
                        <strong>Sort Order:</strong> {module.sort_order}
                      </Typography>
                    )}
                    <Typography sx={{ width: '50%' }}>
                      <strong>Active:</strong> {module.active}
                    </Typography>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
        {/* <SecondaryButtonOutlined
          name="Cancel"
          onClick={() => setShowModuleEditor && setShowModuleEditor(false)}
        /> */}
        {!readOnly && (
          isSaving ? (
            <LoadingButton />
          ) : (
            <SecondaryButton
              name="Save Modules"
              onClick={handleSave}
            />
          )
        )}
      </Box>
      <ModuleFormDialog
        open={moduleFormOpen}
        onClose={closeModuleDialog}
        onSave={handleModuleSave}
        moduleData={currentModule}
        existingModules={localModules}
        isEdit={isEditMode}
      />
    </Paper>
  );
};

export default ModuleEditor;
