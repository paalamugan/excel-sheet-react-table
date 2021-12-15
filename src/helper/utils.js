import { isFinite, round, cloneDeep, template, find } from 'lodash-es';
import {
  AVERAGE_CALCULATED_COLUMNS,
  DISABLED_CELL_COLUMNS,
  DISABLED_HEADER_COLUMNS,
  INDEX_TEXT,
  DEFAULT_HEADER_COLUMNS,
  SUM_TEXT,
  FILTER_BY_COLUMN_OPTIONS,
} from '../config';
import { DataTypes, RecordType } from '../contants';
import { defaultTableState } from '../reducers/tableReducer';
import { grey } from './colors';

const DISABLED_COLUMN_HEADER_NAME = 'header';
const DISABLED_COLUMN_CELL_NAME = 'cell';

const globalVariableColumns = [];

const lodashTemplateSettings = {
  evaluate: /\{\{(.+?)\}\}/g,
  interpolate: /\{\{=(.+?)\}\}/g,
  escape: /\{\{-(.+?)\}\}/g,
};

export const lodashTemplate = (string) => {
  return template(string, lodashTemplateSettings);
};

export const isAverageColumn = (key) => {
  return (
    AVERAGE_CALCULATED_COLUMNS.findIndex(
      (col) => generateColumnId(col) === generateColumnId(key)
    ) !== -1
  );
};

export const shortId = () => {
  return '_' + Math.random().toString(36).substring(2, 9);
};

export const randomColor = () => {
  return `hsl(${Math.floor(Math.random() * 360)}, 95%, 90%)`;
};

export const generateColumnId = (label = '') => {
  return label.toString().replace(/\s+/g, '_').toLowerCase();
};

export const createFilterOptions = (options = []) => {
  return options.map((option) => ({ label: option, backgroundColor: grey(600) }));
};

export const recordReCalculation = (columns = [], data = []) => {
  let getCalculatedColumns = calculateRowRecord(columns);
  let records = data.map(getCalculatedColumns);
  let totalSumRecord = sumColumnCalculation(records)(columns);

  let lastIndex = records.length - 1;
  records[lastIndex] = { ...totalSumRecord };

  return records;
};

export const sumColumnCalculation = (records) => {
  let cloneRecords = cloneDeep(records);
  cloneRecords = cloneRecords.slice(0, -1); // Get all records except the last record

  return (columns) => sumColumnRecord(columns)(cloneRecords);
};

export const getGlobalColumnValue = (columnLabel, record, firstRecord) => {
  return +(record[columnLabel] || firstRecord[columnLabel]) || 0;
};

export const validateCalcExpression = (calc = '', columnObj, record, firstRecord) => {
  let result = {};

  let expression = calc.trim().replace(/([a-zA-Z0-9_]+)/g, (value) => {
    let key = generateColumnId(value);
    let columnLabel = columnObj[key];

    if (!columnLabel) {
      return (+key || 0).toString();
    }

    if (globalVariableColumns.includes(key)) {
      record[columnLabel] = getGlobalColumnValue(columnLabel, record, firstRecord);
    } else {
      record[columnLabel] = +record[columnLabel] || 0;
    }

    result[key] = record[columnLabel];

    return key;
  });

  return { expression, result };
};

export const calculateRowSum = (expression, result) => {
  try {
    let compiledTemplate = lodashTemplate(expression);
    let value = +compiledTemplate(result);
    return value || 0;
  } catch (err) {
    console.error(err);
    return 0;
  }
};

export const getSumRowRecord = (columns) => {
  let columnObj = columns.reduce((result, column) => {
    result[column.id] = column.label;
    return result;
  }, {});

  return (record, calc, firstRecord = {}) => {
    try {
      let data = { ...record };

      let { expression, result } = validateCalcExpression(calc, columnObj, data, firstRecord);

      return calculateRowSum(expression, result);
    } catch (err) {
      console.error(err);
      return 0;
    }
  };
};

export const sumColumnRecord = (columns) => {
  let label = columns[1].label;
  let result = {
    [label]: SUM_TEXT,
  };

  return (records = []) => {
    let length = records.length;

    return records.reduce((result, currentValue, index) => {
      for (let [key, value] of Object.entries(currentValue)) {
        value = +value;

        if (key !== label && isFinite(+value)) {
          result[key] = +result[key] || 0;
          result[key] += value || 0;

          let isAvgColumn = isAverageColumn(key);

          if (isAvgColumn && index === length - 1) {
            result[key] = result[key] / length;
          }

          result[key] = round(result[key], 3);
        }
      }
      return result;
    }, result);
  };
};

export const calculateRowRecord = (columns) => {
  let calculateCols = columns.filter((col) => !!col.calc);
  let totalSumRowRecord = getSumRowRecord(columns);

  return (record = {}, index, records = []) => {
    calculateCols.forEach((column) => {
      if (column.label) {
        let total = totalSumRowRecord(record, column.calc, records[0]);
        record[column.label] = round(total, 3);
      }
    });

    record.rowId = record.rowId || shortId();

    return record;
  };
};

const findColumnIndex = (id, columnId) => generateColumnId(id) === columnId;

export function isDisabledColumn(type, columnId) {
  let cols = type === DISABLED_COLUMN_CELL_NAME ? DISABLED_CELL_COLUMNS : DISABLED_HEADER_COLUMNS;
  let index = cols.findIndex((id) => findColumnIndex(id, columnId));
  return index !== -1;
}

const getHeaderColumns = (columnHeaders, firstRecord = {}) => {
  let columns = [];

  columnHeaders.forEach((header) => {
    let headerName = header.name;
    let calc = header.calc || '';
    let dataType =
      header.type ||
      (calc
        ? DataTypes.CALC
        : isFinite(+firstRecord[headerName])
        ? DataTypes.NUMBER
        : DataTypes.TEXT);

    let options = header.options || [];
    options = createFilterOptions(options);

    let headerId = generateColumnId(headerName);

    let column = {
      id: headerId,
      label: headerName,
      accessor: headerName,
      minwidth: 100,
      isDisabledHeader: header.disabled || isDisabledColumn(DISABLED_COLUMN_HEADER_NAME, headerId),
      isDisabledCell: header.disabledCell || isDisabledColumn(DISABLED_COLUMN_CELL_NAME, headerId),
      dataType: dataType,
      calc: calc,
      options: options,
    };

    columns.push(column);
  });

  if (columns.length) {
    columns.unshift({
      id: INDEX_TEXT,
      width: 20,
      label: '',
      disableResizing: true,
    });

    columns.push({
      id: 999999,
      width: 20,
      label: '',
      disableResizing: true,
    });
  }

  return columns;
};

const generateColumnHeadersFromSheet = (records) => {
  let firstRecord = records[0] || {};
  let columnHeaders = Object.keys(firstRecord);

  columnHeaders = columnHeaders.map((headerName) => {
    let foundColumn = find(DEFAULT_HEADER_COLUMNS, (column) => {
      return headerName === column.name;
    });

    if (foundColumn) {
      return foundColumn;
    }

    return {
      name: headerName,
    };
  });

  return getHeaderColumns(columnHeaders, firstRecord);
};

export function makeRecords(records = [], recordType = RecordType.EXIST_SHEET) {
  let result = defaultTableState();

  if (!records.length && recordType === RecordType.EXIST_SHEET) return result;

  let columns = [];

  if (RecordType.EXIST_SHEET === recordType) {
    columns = generateColumnHeadersFromSheet(records);
    let lastRecord = records[records.length - 1];
    let lastRecordValues = Object.values(lastRecord);

    if (lastRecordValues.includes(SUM_TEXT)) {
      records.pop(); // Remove last record
    }
  } else {
    columns = generateColumnHeaders();
    let firstRecord = createDefaultRow(columns);
    records.push(firstRecord);
  }

  let getCalculateColumns = calculateRowRecord(columns);
  records = records.map(getCalculateColumns);

  let totalSumRecord = sumColumnRecord(columns)(records);
  records.push(totalSumRecord);

  result.columns = columns;
  result.data = records;

  return result;
}

export const createDefaultRow = (cols = [], defaultRecord = {}) => {
  let newColumns = [...cols];
  let result = newColumns.reduce((result, column) => {
    if (!column.label) return result;

    result[column.label] =
      defaultRecord[column.label] ||
      (column.dataType === DataTypes.CALC
        ? '0'
        : column.dataType === DataTypes.SELECT || column.type === DataTypes.SELECT
        ? FILTER_BY_COLUMN_OPTIONS[0]
        : '');
    return result;
  }, {});

  result.rowId = shortId();

  return result;
};

export function generateColumnHeaders() {
  let cols = [...DEFAULT_HEADER_COLUMNS];
  return getHeaderColumns(cols);
}

export function sampleXlsxData() {
  let columns = generateColumnHeaders();
  columns = columns.slice(1, columns.length - 1);

  let defaultRecord = columns.reduce((accumulator, column, index) => {
    if (column.dataType === DataTypes.NUMBER) {
      accumulator[column.label] = (index + 1) * 1;
    } else {
      accumulator[column.label] = '';
    }
    return accumulator;
  }, {});

  let records = [];
  for (let i = 0; i < 10; i++) {
    defaultRecord[columns[0].label] = `Item ${i + 1}`;

    let row = createDefaultRow(columns, defaultRecord);
    records.push(row);
  }

  records = makeRecords(records).data;

  records.forEach((record) => delete record.rowId);

  return records;
}
