import React from 'react';
import QualificationUnitForm from './QualificationUnitForm';
import { Box, TextField, Tooltip, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { SecondaryButton } from '../Buttons';

import { UnitRendererProps } from './componentTypes';

const inputStyle = {
  borderRadius: 0,
  padding: "1rem",
};

const UnitRenderer: React.FC<UnitRendererProps> = ({
  mandatoryUnit,
  courseDispatch,
  savedUnits,
  setCourseSaved,
  edit,
  setUnitData: externalSetUnitData,
  removeUnitHandler: externalRemoveUnitHandler,
  addSubUnitHandler: externalAddSubUnitHandler,
  setSubUnitData: externalSetSubUnitData,
  removeSubUnitHandler: externalRemoveSubUnitHandler,
  setSubTopicData: externalSetSubTopicData,
  removeSubTopicHandler: externalRemoveSubTopicHandler,
  addTopicHandler: externalAddTopicHandler,
  courseType = 'Qualification',
  saveCourse
}) => {
  const markUnitsSaved = async () => {
    courseDispatch({ type: 'MARK_UNITS_SAVED' });
    setCourseSaved(true);

    if (saveCourse) {
      try {
        const result = await saveCourse();
        if (!result) {
          console.error('Failed to save course');
        }
      } catch (error) {
        console.error('Error saving course:', error);
      }
    }
  };

  const areAllUnitsSaved = Object.keys(mandatoryUnit).length > 0 &&
    Object.keys(mandatoryUnit).every(unitId => savedUnits[unitId]);

  const setUnitData = externalSetUnitData || ((unitId: string | number, data: { name: string, value: any }) => {
    courseDispatch({
      type: 'UPDATE_MANDATORY_UNIT',
      unitId,
      field: data.name,
      value: data.value
    });
  });

  const removeUnitHandler = externalRemoveUnitHandler || ((unitId: string | number) => {
    courseDispatch({
      type: 'REMOVE_UNIT',
      unitId
    });
  });

  const addUnitHandler = () => {
    if (courseType === 'Gateway') {
      return;
    }

    const id = Date.now();

    const newUnit = {
      id,
      unit_ref: "",
      title: "",
      mandatory: "true",
      level: null,
      glh: null,
      credit_value: null,
      subUnit: [],
      learning_outcomes: []
    };
    // Prevent default behavior if this is a button click
    // This is to ensure we don't accidentally trigger a form submission
    try {
      courseDispatch({
        type: 'ADD_UNIT',
        unitId: id,
        unit: newUnit
      });
      console.log('Unit added successfully');
    } catch (error) {
      console.error('Error adding unit:', error);
    }
  };

  const addSubUnitHandler = externalAddSubUnitHandler || ((unitId: string | number) => {
    if (mandatoryUnit[unitId]) {
      const newTopicData = {
        id: Date.now() + Number((Math.random() * 10).toFixed(0)),
        description: "",
      };

      const newSubData = {
        id: Date.now(),
        subTitle: "",
        subTopic: [newTopicData],
      };

      courseDispatch({
        type: 'UPDATE_MANDATORY_UNIT',
        unitId,
        field: 'subUnit',
        value: [...mandatoryUnit[unitId].subUnit, newSubData]
      });
    }
  });

  const setSubUnitData = externalSetSubUnitData || ((unitId: string | number, subUnitId: string | number, data: { name: string, value: any }) => {
    if (mandatoryUnit[unitId]) {
      const updatedSubUnits = mandatoryUnit[unitId].subUnit.map((sub: any) => {
        if (sub.id === subUnitId) {
          return {
            ...sub,
            [data.name]: data.value
          };
        }
        return sub;
      });

      courseDispatch({
        type: 'UPDATE_MANDATORY_UNIT',
        unitId,
        field: 'subUnit',
        value: updatedSubUnits
      });
    }
  });

  const removeSubUnitHandler = externalRemoveSubUnitHandler || ((unitId: string | number, subUnitId: string | number) => {
    if (mandatoryUnit[unitId]) {
      const updatedSubUnits = mandatoryUnit[unitId].subUnit.filter((sub: any) => sub.id !== subUnitId);

      courseDispatch({
        type: 'UPDATE_MANDATORY_UNIT',
        unitId,
        field: 'subUnit',
        value: updatedSubUnits
      });
    }
  });

  const setSubTopicData = externalSetSubTopicData || ((unitId: string | number, subUnitId: string | number, subTopicId: string | number, data: { name: string, value: any }) => {
    if (mandatoryUnit[unitId]) {
      const updatedSubUnits = mandatoryUnit[unitId].subUnit.map((sub: any) => {
        if (sub.id === subUnitId) {
          const updatedSubTopics = sub.subTopic.map((topic: any) => {
            if (topic.id === subTopicId) {
              return {
                ...topic,
                [data.name]: data.value
              };
            }
            return topic;
          });
          return {
            ...sub,
            subTopic: updatedSubTopics
          };
        }
        return sub;
      });

      courseDispatch({
        type: 'UPDATE_MANDATORY_UNIT',
        unitId,
        field: 'subUnit',
        value: updatedSubUnits
      });
    }
  });

  const removeSubTopicHandler = externalRemoveSubTopicHandler || ((unitId: string | number, subUnitId: string | number, subTopicId: string | number) => {
    if (mandatoryUnit[unitId]) {
      const updatedSubUnits = mandatoryUnit[unitId].subUnit.map((sub: any) => {
        if (sub.id === subUnitId) {
          return {
            ...sub,
            subTopic: sub.subTopic.filter((topic: any) => topic.id !== subTopicId)
          };
        }
        return sub;
      });

      courseDispatch({
        type: 'UPDATE_MANDATORY_UNIT',
        unitId,
        field: 'subUnit',
        value: updatedSubUnits
      });
    }
  });

  const addTopicHandler = externalAddTopicHandler || ((unitId: string | number, subUnitId: string | number) => {
    if (mandatoryUnit[unitId]) {
      const newTopicData = {
        id: Date.now(),
        description: "",
      };

      const updatedSubUnits = mandatoryUnit[unitId].subUnit.map((sub: any) => {
        if (sub.id === subUnitId) {
          return {
            ...sub,
            subTopic: [...sub.subTopic, newTopicData]
          };
        }
        return sub;
      });

      courseDispatch({
        type: 'UPDATE_MANDATORY_UNIT',
        unitId,
        field: 'subUnit',
        value: updatedSubUnits
      });
    }
  });

  const units = Object.keys(mandatoryUnit).map((key) => {
    return {
      ...mandatoryUnit[key],
    };
  });

  return (
    <div className="units-container" style={{ height: 'auto', minHeight: '400px' }}>
      {edit !== "view" && (
        <Box className="flex justify-end mb-4">
          <SecondaryButton
            name="Add New Unit"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              addUnitHandler();
            }}
            type="button"
          />
        </Box>
      )}

      {units.length > 0 ? (
        units.map((unit) => (
          <div key={unit.id}>
            <QualificationUnitForm
              unit={unit}
              setUnitData={setUnitData}
              removeUnitHandler={removeUnitHandler}
              addSubUnitHandler={addSubUnitHandler}
              edit={edit}
            />

            {unit?.subUnit?.length > 0 &&
              unit?.subUnit.map((subItem: any) => (
                <React.Fragment key={subItem.id}>
                  <div className="w-full flex gap-24 ">
                    <div className="w-full">
                      <TextField
                        size="small"
                        type="text"
                        className="w-full"
                        name="subTitle"
                        placeholder={`Enter a sub-title`}
                        value={subItem?.subTitle}
                        onChange={(e) =>
                          setSubUnitData(unit?.id, subItem?.id, e.target)
                        }
                        style={inputStyle}
                        disabled={edit === "view"}
                      />
                    </div>
                    <Box className="flex justify-between pt-10 mr-auto">
                      {edit !== "view" && (
                        <>
                          <Tooltip title="Remove sub unit">
                            <CloseIcon
                              className="cursor-pointer"
                              onClick={() =>
                                removeSubUnitHandler(
                                  unit?.id,
                                  subItem?.id
                                )
                              }
                            />
                          </Tooltip>
                        </>
                      )}
                    </Box>
                    <div className="w-full flex flex-col">
                      {subItem?.subTopic?.length > 0 &&
                        subItem?.subTopic?.map((topicItem: any, index: number) => (
                          <React.Fragment key={topicItem.id}>
                            <div className="w-full flex flex-row gap-24 items-center ">
                              <TextField
                                size="small"
                                type="text"
                                className="w-full"
                                name="description"
                                placeholder={`Enter a description`}
                                value={topicItem?.description}
                                onChange={(e) =>
                                  setSubTopicData(
                                    unit?.id,
                                    subItem?.id,
                                    topicItem?.id,
                                    e.target
                                  )
                                }
                                style={inputStyle}
                                disabled={edit === "view"}
                              />
                              <div className="min-w-160">
                                <Box className="w-full flex items-center justify-between gap-24">
                                  {edit !== "view" && (
                                    <>
                                      <Tooltip title="Remove sub topic">
                                        <CloseIcon
                                          className="cursor-pointer "
                                          onClick={() =>
                                            removeSubTopicHandler(
                                              unit?.id,
                                              subItem?.id,
                                              topicItem?.id
                                            )
                                          }
                                        />
                                      </Tooltip>
                                      {index === 0 && (
                                        <SecondaryButton
                                          name="Add Topic"
                                          className="w-full"
                                          onClick={() =>
                                            addTopicHandler(
                                              unit?.id,
                                              subItem?.id
                                            )
                                          }
                                        />
                                      )}
                                    </>
                                  )}
                                </Box>
                              </div>
                            </div>
                          </React.Fragment>
                        ))}
                    </div>
                  </div>
                </React.Fragment>
              ))}
          </div>
        ))
      ) : (
        <Box className="p-6 border border-gray-200 rounded-md bg-gray-50 text-center">
          <Typography className="opacity-50 mb-4">
            No units have been added yet. Click "Add New Unit" to get started.
          </Typography>
          <SecondaryButton
            name="Add New Unit"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              addUnitHandler();
            }}
            type="button"
            disabled={edit === "view"}
          />
        </Box>
      )}

      {/* Save Units Button at the bottom */}
      {units.length > 0 && edit !== "view" && !areAllUnitsSaved && (
        <Box className="flex justify-end mt-4">
          <SecondaryButton
            name="Save Units"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              e.stopPropagation();
              markUnitsSaved();
            }}
            type="button"
          />
        </Box>
      )}
    </div>
  );
};

export default UnitRenderer;
