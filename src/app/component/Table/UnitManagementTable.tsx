import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { IconButton, Tooltip } from "@mui/material";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import Style from "./style.module.css";

export default function UnitManagementTable(props) {
  const { rows, setUnitData, removeUnitHandler, edit } = props;

  const columns = props.columns
    .map((column) => {
      if (!edit) {
        return column;
      } else {
        if (column.id === "actions") {
          return null;
        } else {
          return column;
        }
      }
    })
    .filter((column) => column !== null); // Remove any null values (i.e., removed 'actions' column)

  const addLearningOutcomes = (id) => {
    const data = {
      id: Date.now(),
      title: "",
    };
    setUnitData(id, data, "ALC");
  };
  return (
    <>
      <div style={{ width: "100%", overflow: "hidden", marginTop: "0.5rem" }}>
        <TableContainer>
          <Table stickyHeader aria-label="sticky table" size="small">
            <TableHead>
              <TableRow>
                {columns?.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={{ backgroundColor: "#F8F8F8" }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows?.map((row) => {
                return (
                  <TableRow role="checkbox" tabIndex={-1} key={row.id}>
                    {columns?.map((column) => {
                      const value = row[column.id];
                      if (column.id === "actions") {
                        return (
                          <TableCell
                            key={column.id}
                            align={column.align}
                            sx={{ padding: "0px" }}
                          >
                            <div
                              style={{
                                borderBottom: "1px solid lightgray",
                                width: "100%",
                                height: "100%",
                                padding: "0.5rem",
                              }}
                            >
                              <IconButton
                                size="small"
                                sx={{ color: "maroon" }}
                                onClick={() => removeUnitHandler(row.id)}
                              >
                                <DeleteOutlineOutlinedIcon fontSize="small" />
                              </IconButton>
                              <Tooltip title="Add Learning Outcomes">
                                <IconButton
                                  size="small"
                                  sx={{ color: "#5B718F", marginLeft: "4px" }}
                                  onClick={() => addLearningOutcomes(row.id)}
                                >
                                  <AddIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align}
                          sx={{ padding: "0px" }}
                        >
                          <input
                            type="text"
                            value={value}
                            name={column.id}
                            placeholder={`Enter ${column.label}`}
                            onChange={(e) => setUnitData(row.id, e.target)}
                            style={{
                              borderRadius: 0,
                              borderBottom: "1px solid lightgray",
                              borderRight: "1px solid lightgray",
                              width: "100%",
                              padding: "1rem",
                            }}
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </div>
    </>
  );
}
