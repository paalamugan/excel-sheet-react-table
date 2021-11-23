import { isFinite } from 'lodash-es';
import update from 'immutability-helper';
import downloadToSheet from '../helper/download-to-sheet';

import {
  randomColor,
  calculateRowRecord,
  recordReCalculation,
  sumColumnCalculation,
  generateColumnId,
  createDefaultRow,
  isAverageColumn,
  shortId,
} from '../helper/utils';
import { ActionTypes, DataTypes } from '../contants';
import { CURRENCY, FILTER_BY_COLUMN } from '../config';

const getColumnIndex = (columns, columnId) => {
  return columns.findIndex((column) => column.id === columnId);
};

export const defaultTableState = () => ({
  columns: [],
  data: [],
  cloneData: [],
  skipReset: false,
});

export function tableReducer(state, action) {
  switch (action.type) {
    case ActionTypes.FILTER_BY_OPTIONS: {
      let filters = action.filters || [];

      const filterObj = filters.reduce((result, filter) => {
        result[filter.name] = true;
        return result;
      }, {});

      const lastIndex = state.cloneData.length - 1;

      const data = state.cloneData.filter((record, index) => {
        if (!filters.length) return true;

        var value = record[FILTER_BY_COLUMN];
        return !!filterObj[value] || index === lastIndex;
      });

      return update(state, {
        skipReset: { $set: true },
        data: {
          $apply: () => {
            return recordReCalculation(state.columns, data);
          },
        },
      });
    }
    case ActionTypes.ADD_OPTION_TO_COLUMN:
      const optionIndex = getColumnIndex(state.columns, action.columnId);
      return update(state, {
        skipReset: { $set: true },
        columns: {
          [optionIndex]: {
            options: {
              $push: [
                {
                  label: action.option,
                  backgroundColor: action.backgroundColor,
                },
              ],
            },
          },
        },
      });

    case ActionTypes.INITIALIZE_DATA:
      action.payload.cloneData = action.payload.data;
      return update(state, { $set: action.payload });

    case ActionTypes.CLONE_PREVIOUS_DATA:
      return update(state, {
        cloneData: {
          $set: state.data,
        },
      });

    case ActionTypes.ADD_ROW: {
      let lastIndex = state.data.length - 1;
      let defaultRow = createDefaultRow(state.columns);

      return update(state, {
        skipReset: { $set: true },
        data: { $splice: [[lastIndex, 0, defaultRow]] },
      });
    }

    case ActionTypes.DELETE_ROW: {
      state.cloneData = state.cloneData.filter((record) => {
        return record.rowId !== action.rowId;
      });

      return update(state, {
        skipReset: { $set: true },
        data: {
          $apply: () => {
            return state.data.filter((record) => {
              return record.rowId !== action.rowId;
            });
          },
        },
      });
    }

    case ActionTypes.TOTAL_SUM_CALCULATION: {
      const totalSumRecord = sumColumnCalculation(state.data)(state.columns);
      let lastIndex = state.data.length - 1;

      return update(state, {
        skipReset: { $set: true },
        data: {
          [lastIndex]: {
            $set: { ...totalSumRecord },
          },
        },
      });
    }

    case ActionTypes.UPDATE_COLUMN_TYPE: {
      const typeIndex = getColumnIndex(state.columns, action.columnId);
      let columnObj = state.columns[typeIndex] || {};

      switch (action.dataType) {
        case DataTypes.NUMBER:
          if (state.columns[typeIndex].dataType === DataTypes.NUMBER) {
            return state;
          } else {
            return update(state, {
              skipReset: { $set: true },
              columns: { [typeIndex]: { dataType: { $set: action.dataType } } },
              data: {
                $apply: (data) =>
                  data.map((row) => ({
                    ...row,
                    [columnObj.label]: isNaN(+row[columnObj.label])
                      ? ''
                      : (+row[columnObj.label] || 0).toString(),
                  })),
              },
            });
          }

        case DataTypes.CALC:
          if (state.columns[typeIndex].calc === action.calc) {
            return state;
          } else {
            return update(state, {
              skipReset: { $set: true },
              columns: { [typeIndex]: { dataType: { $set: action.dataType } } },
              data: {
                $apply: (data) => {
                  let columns = [...state.columns];
                  columns[typeIndex].calc = action.calc;

                  return recordReCalculation(columns, data);
                },
              },
            });
          }

        case DataTypes.SELECT:
          if (state.columns[typeIndex].dataType === DataTypes.SELECT) {
            return state;
          } else {
            let options = [];
            state.data.forEach((row) => {
              if (row[action.columnId]) {
                options.push({
                  label: row[action.columnId],
                  backgroundColor: randomColor(),
                });
              }
            });
            return update(state, {
              skipReset: { $set: true },
              columns: {
                [typeIndex]: {
                  dataType: { $set: action.dataType },
                  options: { $push: options },
                },
              },
            });
          }

        case DataTypes.TEXT:
          if (state.columns[typeIndex].dataType === DataTypes.TEXT) {
            return state;
          } else if (state.columns[typeIndex].dataType === DataTypes.SELECT) {
            return update(state, {
              skipReset: { $set: true },
              columns: { [typeIndex]: { dataType: { $set: action.dataType } } },
            });
          } else {
            return update(state, {
              skipReset: { $set: true },
              columns: { [typeIndex]: { dataType: { $set: action.dataType } } },
              data: {
                $apply: (data) =>
                  data.map((row) => ({
                    ...row,
                    [columnObj.label]: row[columnObj.label] + '',
                  })),
              },
            });
          }
        default:
          return state;
      }
    }

    case ActionTypes.UPDATE_COLUMN_HEADER:
      const index = getColumnIndex(state.columns, action.columnId);

      return update(state, {
        skipReset: { $set: true },
        columns: {
          [index]: { label: { $set: action.label }, id: { $set: generateColumnId(action.label) } },
        },
      });

    case ActionTypes.UPDATE_CELL: {
      const columnIndex = getColumnIndex(state.columns, action.columnId);
      let columnObj = state.columns[columnIndex] || {};

      if (action.dataType === DataTypes.NUMBER && isFinite(+action.value)) {
        let lastIndex = state.data.length - 1;

        let currentRecord = state.data[action.rowIndex];
        currentRecord[columnObj.label] = action.value;

        let getCalculatedColumns = calculateRowRecord(state.columns);
        let updatedRecord = getCalculatedColumns(currentRecord, action.rowIndex, state.data);

        const totalSumRecord = sumColumnCalculation(state.data)(state.columns);

        return update(state, {
          skipReset: { $set: true },
          data: {
            [action.rowIndex]: { $set: updatedRecord },
            [lastIndex]: {
              $set: {
                ...totalSumRecord,
              },
            },
          },
        });
      }

      return update(state, {
        skipReset: { $set: true },
        data: {
          [action.rowIndex]: { [columnObj.label]: { $set: action.value } },
        },
      });
    }

    case ActionTypes.ADD_COLUMN_TO_LEFT:
      const leftIndex = getColumnIndex(state.columns, action.columnId);
      let leftLabel = `Column ${shortId()}`;
      let leftId = generateColumnId(leftLabel);

      return update(state, {
        skipReset: { $set: true },
        columns: {
          $splice: [
            [
              leftIndex,
              0,
              {
                id: leftId,
                label: leftLabel,
                accessor: leftLabel,
                dataType: DataTypes.TEXT,
                created: action.focus && true,
                options: [],
              },
            ],
          ],
        },
      });

    case ActionTypes.ADD_COLUMN_TO_RIGHT:
      const rightIndex = getColumnIndex(state.columns, action.columnId);
      const rightLabel = `Column ${shortId()}`;
      const rightId = generateColumnId(rightLabel);

      return update(state, {
        skipReset: { $set: true },
        columns: {
          $splice: [
            [
              rightIndex + 1,
              0,
              {
                id: rightId,
                label: rightLabel,
                accessor: rightLabel,
                dataType: DataTypes.TEXT,
                created: action.focus && true,
                options: [],
              },
            ],
          ],
        },
      });

    case ActionTypes.DELETE_COLUMN:
      const deleteIndex = getColumnIndex(state.columns, action.columnId);
      return update(state, {
        skipReset: { $set: true },
        columns: { $splice: [[deleteIndex, 1]] },
      });

    case ActionTypes.ENABLE_RESET:
      return update(state, { skipReset: { $set: true } });

    case ActionTypes.DOWNLOAD_TO_SHEET: {
      let columns = state.columns.filter((column) => !!column.label);

      let columnLabels = columns.map((column) => column.label);

      let result = [[...columnLabels]];
      let lastIndex = state.data.length - 1;
      state.data.forEach((record, index) => {
        let i = index + 1;

        result[i] = result[i] || [];

        columns.forEach((column, columnIndex) => {
          let text = record[column.label] || '';

          if (column.dataType === DataTypes.CALC) {
            text = text || 0;
          }

          if (column.dataType === DataTypes.NUMBER || column.dataType === DataTypes.CALC) {
            if (lastIndex === index && columnIndex !== 0) {
              text =
                (isAverageColumn(column.label) ? 'Avg = "' : 'Sum = "') +
                CURRENCY +
                (text || 0) +
                '"';
            }
          }

          result[i].push(text);
        });
      });

      downloadToSheet(result);

      return state;
    }

    default:
      return state;
  }
}
