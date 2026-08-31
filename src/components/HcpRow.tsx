// Component: Renders individual HCP data row with inline editing
// Supports editing the "calls" field via popover modal
// Shows hover effects and edit icon for editable cells
import { type HcpRow } from "../types/hcp";
import { calculateCPI, normalizeCalls } from "../utils/hcp-utils";
import { useState } from "react";
import {
  TextField,
  IconButton,
  CircularProgress,
  Popover,
  Box,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

interface HcpRowProps {
  row: HcpRow;
  onEdit: (rowKey: string, field: keyof HcpRow, value: number) => Promise<void>;
  pendingEdits: Set<string>;
}

type EditableField = "calls";

export function HcpRowComponent({ row, onEdit, pendingEdits }: HcpRowProps) {
  // Edit state: which field is being edited, current value, loading, error, popover anchor
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  // Calculate derived values for display
  const normalizedCalls = normalizeCalls(row.calls);
  const cpi = calculateCPI(normalizedCalls || 0, row.trx);
  const displayCPI = cpi === null ? "—" : cpi.toFixed(2);
  const displayCalls = normalizedCalls === null ? row.calls : normalizedCalls;

  // Start editing a field (opens popover)
  const handleStartEdit = (
    field: EditableField,
    currentValue: number | string,
    event: React.MouseEvent<HTMLElement>,
  ) => {
    if (pendingEdits.has(row.rowKey)) {
      return; // Prevent concurrent edits on same row
    }
    setEditingField(field);
    setEditValue(String(currentValue));
    setError(null);
    setAnchorEl(event.currentTarget);
  };

  // Cancel edit (close popover without saving)
  const handleCancelEdit = () => {
    setEditingField(null);
    setEditValue("");
    setError(null);
    setAnchorEl(null);
  };

  // Save edit (validate and call parent handler)
  const handleSaveEdit = async () => {
    if (!editingField) return;

    const numValue = Number(editValue);
    if (isNaN(numValue)) {
      setError("Please enter a valid number");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      await onEdit(row.rowKey, editingField, numValue);
      setEditingField(null);
      setEditValue("");
      setAnchorEl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Validation failed");
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcuts: Enter to save, Escape to cancel
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  // Render editable cell with hover effect and edit icon
  const renderEditableCell = (
    field: EditableField,
    displayValue: string | number,
    width: string,
  ) => {
    const isEditing = editingField === field;

    return (
      <>
        <div
          style={{
            width,
            flexShrink: 0,
            fontWeight: field === "calls" ? 600 : "normal",
            color: field === "calls" ? "#0B5FA5" : "#333",
            textAlign: "right",
            cursor: "pointer",
            position: "relative",
          }}
          onClick={(e) => handleStartEdit(field, displayValue, e)}
          title="Click to edit"
        >
          {displayValue}
          <EditIcon
            fontSize="small"
            sx={{
              position: "absolute",
              right: "-20px",
              top: "50%",
              transform: "translateY(-50%)",
              opacity: 0,
              transition: "opacity 0.2s",
              fontSize: "14px",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: 0,
              bottom: 0,
              opacity: 0,
              transition: "opacity 0.2s",
              backgroundColor: "rgba(0,0,0,0.04)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "1";
              e.currentTarget.parentElement
                ?.querySelector(".MuiSvgIcon-root")
                ?.setAttribute("style", "opacity: 1");
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "0";
              e.currentTarget.parentElement
                ?.querySelector(".MuiSvgIcon-root")
                ?.setAttribute("style", "opacity: 0");
            }}
          />
        </div>

        <Popover
          open={isEditing}
          anchorEl={anchorEl}
          onClose={handleCancelEdit}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "center",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "center",
          }}
        >
          <Box sx={{ p: 2, minWidth: "200px" }}>
            <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
              Edit {field.toUpperCase()}
            </Typography>
            <TextField
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              size="small"
              type="number"
              error={!!error}
              helperText={error}
              fullWidth
              disabled={isSaving}
              autoFocus
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
              {isSaving ? (
                <CircularProgress size={20} />
              ) : (
                <>
                  <IconButton
                    size="small"
                    onClick={handleSaveEdit}
                    color="primary"
                  >
                    <CheckIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={handleCancelEdit}
                    color="error"
                  >
                    <CloseIcon />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
        </Popover>
      </>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        borderBottom: "1px solid",
        borderColor: "rgba(224, 224, 224, 1)",
        padding: "0 16px",
        transition: "background-color 0.2s ease",
        cursor: "default",
        height: "53px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0, 0, 0, 0.04)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div
        style={{
          width: "140px",
          flexShrink: 0,
          fontFamily: "monospace",
          fontSize: "0.875rem",
          color: "#666",
          textAlign: "left",
        }}
      >
        {row.id}
      </div>
      <div
        style={{
          flex: 1,
          minWidth: 0,
          fontWeight: 500,
          color: "#333",
          textAlign: "left",
        }}
      >
        {row.name}
      </div>
      <div
        style={{
          width: "160px",
          flexShrink: 0,
          color: "#666",
          textAlign: "left",
        }}
      >
        {row.specialty || "-"}
      </div>
      <div
        style={{
          width: "130px",
          flexShrink: 0,
          color: "#333",
          textAlign: "left",
        }}
      >
        {row.region}
      </div>
      <div
        style={{
          width: "160px",
          flexShrink: 0,
          color: "#333",
          textAlign: "left",
        }}
      >
        {row.territory}
      </div>
      {renderEditableCell("calls", displayCalls, "90px")}
      <div
        style={{
          width: "90px",
          flexShrink: 0,
          color: "#333",
          textAlign: "right",
        }}
      >
        {row.trx}
      </div>
      <div
        style={{
          width: "90px",
          flexShrink: 0,
          color: "#333",
          textAlign: "right",
        }}
      >
        {row.nrx}
      </div>
      <div
        style={{
          width: "90px",
          flexShrink: 0,
          color: "#666",
          textAlign: "right",
        }}
      >
        {displayCPI}
      </div>
    </div>
  );
}
