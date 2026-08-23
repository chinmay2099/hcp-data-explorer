import { useState, useCallback } from "react";
import { type HcpRow } from "../types/hcp";

interface EditCommand {
  rowKey: string;
  field: keyof HcpRow;
  oldValue: number | string;
  newValue: number | string;
}

export function useEditHistory() {
  const [history, setHistory] = useState<EditCommand[]>([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

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

  const undo = useCallback(
    (data: HcpRow[]): HcpRow[] => {
      if (currentIndex < 0) return data;

      const command = history[currentIndex];
      const updatedData = data.map((row) =>
        row.rowKey === command.rowKey
          ? { ...row, [command.field]: command.oldValue }
          : row,
      );

      setCurrentIndex((prev) => prev - 1);
      return updatedData;
    },
    [currentIndex, history],
  );

  const redo = useCallback(
    (data: HcpRow[]): HcpRow[] => {
      if (currentIndex >= history.length - 1) return data;

      const command = history[currentIndex + 1];
      const updatedData = data.map((row) =>
        row.rowKey === command.rowKey
          ? { ...row, [command.field]: command.newValue }
          : row,
      );

      setCurrentIndex((prev) => prev + 1);
      return updatedData;
    },
    [currentIndex, history],
  );

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
