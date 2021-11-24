import React, { useEffect, useState } from 'react';
import ContentEditable from 'react-contenteditable';
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isFinite } from 'lodash-es';

import Badge from './Badge';
import { usePopper } from 'react-popper';
import { grey } from '../helper/colors';
import PlusIcon from '../assets/img/Plus';
import { isAverageColumn, randomColor } from '../helper/utils';
import { ActionTypes, DataTypes } from '../contants';
import { CURRENCY, INDEX_TEXT, SUM_TEXT } from '../config';

export default function Cell({
  value: initialValue,
  row: {
    index,
    original: { rowId },
  },
  column: { id, dataType, options, isDisabledCell },
  dataDispatch,
  data,
  columns,
}) {
  const lastIndex = data.length - 1;
  const firstColumnId = columns?.[1]?.id || '';
  const [value, setValue] = useState({ value: initialValue, update: false });
  const [selectRef, setSelectRef] = useState(null);
  const [selectPop, setSelectPop] = useState(null);
  const [showSelect, setShowSelect] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [addSelectRef, setAddSelectRef] = useState(null);
  const { styles, attributes } = usePopper(selectRef, selectPop, {
    placement: 'bottom-start',
    strategy: 'fixed',
  });

  function handleOptionKeyDown(e) {
    if (e.key === 'Enter') {
      if (e.target.value !== '') {
        dataDispatch({
          type: ActionTypes.ADD_OPTION_TO_COLUMN,
          option: e.target.value,
          // backgroundColor: randomColor(),
          columnId: id,
        });
      }
      setShowAdd(false);
    } else if (e.key === 'Escape') {
      setShowAdd(false);
    }
  }

  function handleAddOption(e) {
    setShowAdd(true);
  }

  function handleOptionBlur(e) {
    if (e.target.value !== '') {
      dataDispatch({
        type: ActionTypes.ADD_OPTION_TO_COLUMN,
        option: e.target.value,
        // backgroundColor: randomColor(),
        columnId: id,
      });
    }
    setShowAdd(false);
  }

  function getColor() {
    let match = options.find((option) => option.label === value.value);
    return (match && match.backgroundColor) || grey(600);
  }

  const onChange = (e, type) => {
    let value = e.target.value;

    // remove character and symbols in number box
    if (type === DataTypes.NUMBER && !isFinite(+value)) {
      value = value.replace(/([^0-9.,]+)/g, '');
    }

    setValue({ value: value, update: type === DataTypes.NUMBER });
  };

  const onDelete = () => {
    dataDispatch({ type: ActionTypes.DELETE_ROW, rowId: rowId });
    dataDispatch({ type: ActionTypes.TOTAL_SUM_CALCULATION });
  };

  function handleOptionClick(option) {
    setValue({ value: option.label, update: true });
    setShowSelect(false);
  }

  useEffect(() => {
    if (addSelectRef && showAdd) {
      addSelectRef.focus();
    }
  }, [addSelectRef, showAdd]);

  useEffect(() => {
    setValue({ value: initialValue, update: false });
  }, [initialValue]);

  useEffect(() => {
    if (value.update) {
      dataDispatch({
        type: ActionTypes.UPDATE_CELL,
        columnId: id,
        dataType: dataType,
        rowIndex: index,
        value: value.value,
      });
      dataDispatch({
        type: ActionTypes.CLONE_PREVIOUS_DATA,
      });
    }
  }, [value, dataDispatch, id, index]);

  const textString = (text) => {
    return lastIndex === index ? (text === SUM_TEXT ? text : '') : text.toString();
  };

  const defaultCellText = (text, isDisabled = false, style = {}) => {
    return (
      <div
        style={style}
        className={`data-input h-100 ${
          dataType === DataTypes.CALC || isDisabled ? 'cell-disabled' : ''
        } ${dataType === DataTypes.CALC ? 'text-align-right' : ''}`}
      >
        {text}
      </div>
    );
  };

  function getCellElement() {
    if (INDEX_TEXT === id) return defaultCellText(index + 1, false, { fontWeight: '400' });

    if (lastIndex === index) {
      return (
        id !== 999999 && (
          <div className="cell-disabled h-100">
            <div className={`data-input h-100`}>
              {DataTypes.TEXT !== dataType && DataTypes.SELECT !== dataType ? (
                <div className="d-flex justify-content-between align-items-center">
                  <div>{isAverageColumn(id) ? 'Avg' : 'Sum'}</div>
                  <div className="ms-2 text-ellipsis text-align-right">
                    {CURRENCY}
                    {value.value || 0}
                  </div>
                </div>
              ) : null}
              {firstColumnId === id && value.value}
            </div>
          </div>
        )
      );
    }

    if (isDisabledCell) return defaultCellText(value.value, isDisabledCell);

    switch (dataType) {
      case DataTypes.CALC:
        return defaultCellText(value.value);

      case DataTypes.TEXT:
        return (
          <ContentEditable
            html={textString(value?.value || '')}
            onChange={(e) => onChange(e, dataType)}
            onBlur={() => setValue((old) => ({ value: old.value, update: true }))}
            className="data-input"
          />
        );

      case DataTypes.NUMBER:
        return (
          <ContentEditable
            html={(value.value && value.value.toString()) || ''}
            onChange={(e) => onChange(e, dataType)}
            className="data-input text-align-right"
          />
        );
      case DataTypes.SELECT:
        return (
          <>
            <div
              ref={setSelectRef}
              className="flex-1 cursor-default cell-padding d-flex align-items-center h-100"
              onClick={() => setShowSelect(true)}
            >
              {value.value && (
                <Badge
                  value={value.value}
                  backgroundColor={getColor()}
                  className="text-white cursor-pointer"
                />
              )}
            </div>
            {showSelect && <div className="overlay" onClick={() => setShowSelect(false)} />}
            {showSelect &&
              createPortal(
                <div
                  className="bg-white shadow-5 border-radius-md"
                  ref={setSelectPop}
                  {...attributes.popper}
                  style={{
                    ...styles.popper,
                    zIndex: 4,
                    minWidth: 200,
                    maxWidth: 320,
                    maxHeight: 400,
                    padding: '0.75rem',
                    overflow: 'auto',
                  }}
                >
                  <div
                    className="d-flex flex-wrap-wrap align-items-center"
                    style={{ marginTop: '-0.5rem' }}
                  >
                    {options.length
                      ? options.map((option, index) => (
                          <div
                            key={index}
                            className="mt-2 mr-2 cursor-pointer"
                            onClick={() => handleOptionClick(option)}
                          >
                            <Badge
                              value={option.label}
                              backgroundColor={option.backgroundColor || getColor()}
                            />
                          </div>
                        ))
                      : !showAdd && (
                          <div className="mt-2 text-muted fa-sm me-2">No options available!</div>
                        )}
                    {showAdd && (
                      <div
                        className="mt-2 mr-2 bg-grey-200 border-radius-sm"
                        style={{
                          width: 120,
                          padding: '2px 4px',
                        }}
                      >
                        <input
                          type="text"
                          className="option-input"
                          onBlur={handleOptionBlur}
                          ref={setAddSelectRef}
                          onKeyDown={handleOptionKeyDown}
                        />
                      </div>
                    )}
                    <div className="mt-1 mr-2 cursor-pointer" onClick={handleAddOption}>
                      <Badge
                        value={
                          <div className="d-flex align-items-center">
                            <span className="svg-icon-sm svg-text">
                              <PlusIcon />
                            </span>
                            <span className="text-black fa-sm">{showAdd ? 'Save' : 'New'}</span>
                          </div>
                        }
                        backgroundColor={grey(200)}
                      />
                    </div>
                  </div>
                </div>,
                document.querySelector('#popper-portal')
              )}
          </>
        );
      default:
        return lastIndex !== index ? (
          <div
            className="cursor-pointer d-flex align-items-center justify-content-center h-100 hover:text-danger"
            onClick={onDelete}
          >
            <FontAwesomeIcon icon="trash" />
          </div>
        ) : null;
    }
  }

  return getCellElement();
}
