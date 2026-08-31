// Hook: Manages undo/redo functionality for data edits
// Uses command pattern to track changes and revert/apply them
import { useState, useCallback, useRef } from "react";
import { type HcpRow } from "../types/hcp";

// Command object stores what changed (row, field, old value, new value)
interface EditCommand {
  rowKey: string;
  field: keyof HcpRow;
  oldValue: number | string;
  newValue: number | string;
}

export function useEditHistory() {
  // History array stores all edit commands
  const [history, setHistory] = useState<EditCommand[]>([]);
  // currentIndex tracks current position in history (for undo/redo)
  const [currentIndex, setCurrentIndex] = useState(-1);
  // Ref to prevent concurrent undo/redo operations (synchronous guard)
  const isOperationInProgress = useRef(false);

  // Add a new edit command to history
  // If we're in middle of history, truncates after current position
  const addCommand = useCallback(
    (command: EditCommand) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1);
        newHistory.push(command);
        return newHistory;
      });
      setCurrentIndex((prev) => prev + 1);
    },
    [currentIndex],
  );

  // Undo: revert the most recent change
  // Restores oldValue to the specified field
  const undo = useCallback(
    (data: HcpRow[]): HcpRow[] => {
      if (isOperationInProgress.current) {
        return data;
      }

      if (currentIndex < 0) {
        return data;
      }

      const command = history[currentIndex];
      if (!command) {
        return data;
      }

      isOperationInProgress.current = true;

      const updatedData = data.map((row) =>
        row.rowKey === command.rowKey
          ? { ...row, [command.field]: command.oldValue }
          : row,
      );

      setCurrentIndex((prev) => Math.max(-1, prev - 1));

      // Reset flag after state update completes
      setTimeout(() => {
        isOperationInProgress.current = false;
      }, 0);

      return updatedData;
    },
    [currentIndex, history],
  );

  // Redo: re-apply the next change in history
  // Restores newValue to the specified field
  const redo = useCallback(
    (data: HcpRow[]): HcpRow[] => {
      if (isOperationInProgress.current) {
        return data;
      }

      if (currentIndex >= history.length - 1) {
        return data;
      }

      const command = history[currentIndex + 1];
      if (!command) {
        return data;
      }

      isOperationInProgress.current = true;

      const updatedData = data.map((row) =>
        row.rowKey === command.rowKey
          ? { ...row, [command.field]: command.newValue }
          : row,
      );

      setCurrentIndex((prev) => Math.min(history.length - 1, prev + 1));

      // Reset flag after state update completes
      setTimeout(() => {
        isOperationInProgress.current = false;
      }, 0);

      return updatedData;
    },
    [currentIndex, history],
  );

  // Derived state: whether undo/redo is available
  const canUndo = currentIndex >= 0;
  const canRedo = currentIndex < history.length - 1;

  return {
    addCommand,
    undo,
    redo,
    canUndo,
    canRedo,
    historyLength: history.length,
  };
}
