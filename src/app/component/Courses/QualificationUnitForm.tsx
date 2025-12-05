import React from 'react';
import { TextField, FormControl, MenuItem, Select, Box, Tooltip, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SecondaryButton } from '../Buttons';

interface QualificationUnitFormProps {
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

const QualificationUnitForm: React.FC<QualificationUnitFormProps> = ({
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
          value={unit?.unit_ref}
          name="unit_ref"
          placeholder={`Enter a Unit Ref`}
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
        <FormControl variant="standard" className="w-1/5">
          <Select
            labelId={`select-label-${unit?.id}`}
            value={unit?.mandatory}
            onChange={(e) =>
              setUnitData(unit?.id, {
                name: "mandatory",
                value: e.target.value,
              })
            }
            disabled={edit === "view"}
          >
            <MenuItem value={"true"}>Mandatory Unit</MenuItem>
            <MenuItem value={"false"}>Optional Unit</MenuItem>
          </Select>
        </FormControl>
        <Box className="flex items-center justify-between">
          {edit !== "view" && (
            <Tooltip title="Remove unit">
              <IconButton onClick={() => removeUnitHandler(unit?.id)}>
                <CloseIcon className="cursor-pointer" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </div>
      <div className="w-full flex gap-24 items-center ">
        <TextField
          size="small"
          type="number"
          className="w-1/3"
          value={unit?.level}
          name="level"
          placeholder={`Enter a Level`}
          onChange={(e) => setUnitData(unit?.id, e.target)}
          style={inputStyle}
          disabled={edit === "view"}
          required
        />

        <TextField
          size="small"
          type="number"
          className="w-1/3"
          value={unit?.credit_value}
          name="credit_value"
          placeholder={`Enter a credit value`}
          onChange={(e) => setUnitData(unit?.id, e.target)}
          style={inputStyle}
          disabled={edit === "view"}
        />

        <TextField
          size="small"
          type="number"
          className="w-1/3"
          value={unit?.glh}
          name="glh"
          placeholder={`Enter a GLH`}
          onChange={(e) => setUnitData(unit?.id, e.target)}
          style={inputStyle}
          disabled={edit === "view"}
        />

        <Box className="flex items-center justify-between gap-2">
          {/* Add Sub Outcomes button removed */}
        </Box>
      </div>
    </div>
  );
};

export default QualificationUnitForm;
