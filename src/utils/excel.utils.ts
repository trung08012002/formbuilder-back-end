import { Cell, Column, ValueType, Worksheet } from 'exceljs';
import { format } from 'ssf';

export const adjustColumnWidth = (worksheet: Worksheet) => {
  worksheet.columns.forEach((column) => autoFitColumn(column));
};

// Convert Date object to Microsoft serial date aka ms date aka OA date
const dateToSerial = (date: Date): number => {
  const timezoneOffset = date.getTimezoneOffset() / (60 * 24);
  const msDate = date.getTime() / 86400000 + (25569 - timezoneOffset);
  return msDate;
};

export const autoFitColumn = (column: Partial<Column>) => {
  const numFmt = column.numFmt;
  let maxLength = 6;
  if (!column) return;
  (column as Column).eachCell({ includeEmpty: true }, (cell: Cell) => {
    let columnLength: number;
    if (numFmt && cell.value != undefined) {
      switch (cell.type) {
        case ValueType.Date: {
          const serialDate = dateToSerial(cell.value as Date);
          const formattedDate = format(numFmt, serialDate);
          columnLength = formattedDate.length;
          break;
        }
        case ValueType.Number: {
          const formattedNumber = format(numFmt, cell.value as number);
          columnLength = formattedNumber.length;
          break;
        }
        default: {
          const formatted = format(numFmt, cell.value);
          columnLength = formatted.length;
          break;
        }
      }
    } else {
      columnLength = cell.text.length;
    }
    maxLength = Math.max(maxLength, columnLength);
  });
  column.width = maxLength + 2;
};
