import React from 'react';
import { TextField, FormControl, MenuItem, Select, Box, Tooltip, IconButton, Typography, Card, CardContent } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SecondaryButton } from '../Buttons';

interface StandardUnitFormProps {
  unit: any;
  setUnitData: (unitId: string | number, data: { name: string, value: any }) => void;
  removeUnitHandler: (unitId: string | number) => void;
  addSubUnitHandler: (unitId: string | number) => void;
  edit: string;
}

const inputStyle = {
  borderRadius: 0,
  padding: "1rem",
};

const StandardUnitForm: React.FC<StandardUnitFormProps> = ({
  unit,
  setUnitData,
  removeUnitHandler,
  addSubUnitHandler,
  edit
}) => {
  return (
    <Card variant="outlined" className="mb-4" key={unit.id}>
      <CardContent>
        <Typography variant="subtitle1" gutterBottom>
          <strong>Module Details</strong>
        </Typography>

        <div className="w-full flex gap-24 items-center mb-4">
          <TextField
            size="small"
            type="text"
            value={unit?.component_ref || unit?.unit_ref || ''}
            name="component_ref"
            label="Module Reference"
            placeholder={`Enter a Module Reference`}
            onChange={(e) => setUnitData(unit?.id, {
              name: "component_ref",
              value: e.target.value,
            })}
            className="w-1/3"
            disabled={edit === "view"}
            required
          />
          <TextField
            size="small"
            type="text"
            value={unit?.title || ''}
            name="title"
            label="Module Title"
            placeholder={`Enter a title`}
            onChange={(e) => setUnitData(unit?.id, {
              name: "title",
              value: e.target.value,
            })}
            className="w-2/3"
            disabled={edit === "view"}
            required
          />
        </div>

        <div className="w-full flex gap-24 items-center">
          <FormControl variant="outlined" size="small" className="w-1/2">
            <Select
              labelId={`select-label-${unit?.id}`}
              value={unit?.mandatory || "false"}
              onChange={(e) =>
                setUnitData(unit?.id, {
                  name: "mandatory",
                  value: e.target.value,
                })
              }
              disabled={edit === "view"}
              displayEmpty
            >
              <MenuItem value={"true"}>Mandatory Component</MenuItem>
              <MenuItem value={"false"}>Optional Component</MenuItem>
            </Select>
          </FormControl>

          <FormControl variant="outlined" size="small" className="w-1/2">
            <Select
              labelId={`module-type-${unit?.id}`}
              value={unit?.moduleType || 'core'}
              onChange={(e) =>
                setUnitData(unit?.id, {
                  name: "moduleType",
                  value: e.target.value,
                })
              }
              disabled={edit === "view"}
              displayEmpty
            >
              <MenuItem value={'core'}>Core Module</MenuItem>
              <MenuItem value={'optional'}>Optional Module</MenuItem>
            </Select>
          </FormControl>
        </div>

        <Box className="flex justify-between mt-4">
          {edit !== "view" && (
            <>
              <SecondaryButton
                name="Add Knowledge/Skill/Behavior"
                onClick={() => addSubUnitHandler(unit?.id)}
              />

              <Tooltip title="Remove module">
                <IconButton
                  onClick={() => removeUnitHandler(unit?.id)}
                  color="error"
                  size="small"
                >
                  <CloseIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>

        {unit.assessment_criteria && unit.assessment_criteria.length > 0 && (
          <Box className="mt-4 pt-4 border-t">
            <Typography variant="subtitle2" gutterBottom>
              Topics: {unit.assessment_criteria.length}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              Use the "Edit Topics" button in the Standard Modules and Topics section to manage topics.
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StandardUnitForm;
