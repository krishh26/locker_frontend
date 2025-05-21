import React from 'react';
import { TextField, FormControl, MenuItem, Select, Box, Tooltip, IconButton, Switch, FormControlLabel } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SecondaryButton } from '../Buttons';

interface GatewayUnitFormProps {
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

const GatewayUnitForm: React.FC<GatewayUnitFormProps> = ({
  unit,
  setUnitData,
  removeUnitHandler,
  addSubUnitHandler,
  edit
}) => {
  return (
    <div key={unit.id}>
      <div className="w-full flex gap-24 items-center ">
        <TextField
          size="small"
          type="text"
          value={unit?.section_ref || unit?.unit_ref}
          name="section_ref"
          placeholder={`Enter a Section Ref`}
          onChange={(e) => setUnitData(unit?.id, e.target)}
          className=" w-1/3"
          style={inputStyle}
          disabled={edit === "view"}
          required
        />
        <TextField
          size="small"
          type="text"
          value={unit?.title}
          name="title"
          placeholder={`Enter a title`}
          onChange={(e) => setUnitData(unit?.id, e.target)}
          className="w-2/3"
          style={inputStyle}
          disabled={edit === "view"}
          required
        />
        <FormControlLabel
          control={
            <Switch
              checked={unit?.isRequired === true || unit?.mandatory === "true"}
              onChange={(e) =>
                setUnitData(unit?.id, {
                  name: "isRequired",
                  value: e.target.checked,
                })
              }
              disabled={edit === "view"}
            />
          }
          label="Required"
        />
        <Box className="flex items-center justify-between">
          {edit !== "view" && (
            <Tooltip title="Remove section">
              <IconButton onClick={() => removeUnitHandler(unit?.id)}>
                <CloseIcon className="cursor-pointer" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </div>
      <div className="w-full flex gap-24 items-center ">
        <Box className="flex items-center justify-between gap-2">
          {edit !== "view" && (
            <SecondaryButton
              name="Add Checkpoint"
              className="min-w-112"
              onClick={() => addSubUnitHandler(unit?.id)}
            />
          )}
        </Box>
      </div>
    </div>
  );
};

export default GatewayUnitForm;
