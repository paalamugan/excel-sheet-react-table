export const ActionTypes = {
  INITIALIZE_DATA: 'initialize_data',
  CLONE_PREVIOUS_DATA: 'CLONE_PREVIOUS_DATA',
  ADD_OPTION_TO_COLUMN: 'add_option_to_column',
  ADD_ROW: 'add_row',
  DELETE_ROW: 'delete_row',
  UPDATE_COLUMN_TYPE: 'update_column_type',
  UPDATE_COLUMN_HEADER: 'update_column_header',
  UPDATE_CELL: 'update_cell',
  ADD_COLUMN_TO_LEFT: 'add_column_to_left',
  ADD_COLUMN_TO_RIGHT: 'add_column_to_right',
  DELETE_COLUMN: 'delete_column',
  ENABLE_RESET: 'enable_reset',
  DOWNLOAD_TO_SHEET: 'download_to_sheet',
  TOTAL_SUM_CALCULATION: 'total_sum_calculation',
  FILTER_BY_OPTIONS: 'filter_by_options',
};

export const DataTypes = {
  NUMBER: 'number',
  TEXT: 'text',
  SELECT: 'select',
  CALC: 'calc',
};

export const RecordType = {
  EXIST_SHEET: 'exist_sheet',
  NEW_SHEET: 'new_sheet',
};
