import { DataTypes } from '../contants';

export const APP_NAME = 'Excel Read & Write';

export const INDEX_TEXT = 'No.';
export const INDEX_TEXT_WIDTH = 20;
export const SUM_TEXT = 'Count';
export const CURRENCY = '$';

export const EXPORT_SHEET_DEFAULT_NAME = 'download';
export const EXPORT_SHEET_DEFAULT_TYPE = 'xls'; // Available options: xls, csv, xml, txt, json

export const AVERAGE_CALCULATED_COLUMNS = []; // Calculate the average of the columns.
export const DISABLED_HEADER_COLUMNS = []; // If you want you can disabled your header cell.
export const DISABLED_CELL_COLUMNS = []; // If you want you can disabled your row cell.

export const FILTER_BY_COLUMN = 'Column 9';
export const FILTER_OPTIONS = ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

export const DEFAULT_HEADER_COLUMNS = [
  {
    type: DataTypes.TEXT,
    name: 'Column1',
    disabled: false, // disabled the header column
    // disabledCell: false, // disabled the row cell
  },
  {
    type: DataTypes.NUMBER,
    name: 'Column2',
    disabled: false, // disabled the header column
  },
  {
    type: DataTypes.NUMBER,
    name: 'Column3',
    disabled: false, // disabled the header column
  },
  {
    type: DataTypes.CALC,
    name: 'Column4',
    calc: '{{= Column2 + Column3 }}', // You can do any kind arthimetic calculation inside the curly braces.
    disabled: false, // disabled the header column
  },
  {
    type: DataTypes.NUMBER,
    name: 'Column 5',
    disabled: false, // disabled the header column
  },
  {
    type: DataTypes.TEXT,
    name: 'Column 6',
    disabled: false, // disabled the header column
  },
  {
    type: DataTypes.NUMBER,
    name: 'Column 7',
    disabled: false, // disabled the header column
  },
  {
    type: DataTypes.CALC,
    name: 'Column 8',
    calc: '{{= Column2 + Column_7 }}', // Remember one thing if column name has a space separated value like `Column 5`. you have to use like this `Column_5`
    disabled: false, // disabled the header column
  },
  {
    type: DataTypes.SELECT,
    name: 'Column 9',
    options: FILTER_OPTIONS,
    disabled: false, // disabled the header column
  },
];
