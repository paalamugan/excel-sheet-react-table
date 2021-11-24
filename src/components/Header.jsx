import React, { useState, useEffect } from 'react';
import { usePopper } from 'react-popper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { grey } from '../helper/colors';
import { shortId } from '../helper/utils';
import ArrowUpIcon from '../assets/img/ArrowUp';
import ArrowDownIcon from '../assets/img/ArrowDown';
import ArrowLeftIcon from '../assets/img/ArrowLeft';
import ArrowRightIcon from '../assets/img/ArrowRight';
import TrashIcon from '../assets/img/Trash';
import TextIcon from '../assets/img/Text';
import MultiIcon from '../assets/img/Multi';
import HashIcon from '../assets/img/Hash';
import { INDEX_TEXT } from '../config';
import { ActionTypes, DataTypes } from '../contants';

function getPropertyIcon(dataType) {
  switch (dataType) {
    case DataTypes.NUMBER:
      return <HashIcon />;
    case DataTypes.TEXT:
      return <TextIcon />;
    case DataTypes.SELECT:
      return <MultiIcon />;
    case DataTypes.CALC:
      return <FontAwesomeIcon icon="calculator" className="mt-1" />;
    default:
      return <TextIcon />;
  }
}

export default function Header({
  column: { id, created, label, dataType, isDisabledHeader, calc, getResizerProps, getHeaderProps },
  setSortBy,
  dataDispatch,
}) {
  const [expanded, setExpanded] = useState(created || false);
  const [referenceElement, setReferenceElement] = useState(null);
  const [popperElement, setPopperElement] = useState(null);
  const [inputRef, setInputRef] = useState(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'bottom',
    strategy: 'absolute',
  });
  const [header, setHeader] = useState(label);

  const [typeReferenceElement, setTypeReferenceElement] = useState(null);
  const [typePopperElement, setTypePopperElement] = useState(null);
  const typePopper = usePopper(typeReferenceElement, typePopperElement, {
    placement: 'right',
    strategy: 'absolute',
  });
  const [showType, setShowType] = useState(false);

  const [showTypeCalc, setShowTypeCalc] = useState(false);
  const [calcInputRef, setCalcInputRef] = useState(null);
  const [calculation, setCalculation] = useState(calc || '');
  const [typeCalcReferenceElement, setTypeCalcReferenceElement] = useState(null);
  const [typeCalcPopperElement, setTypeCalcPopperElement] = useState(null);
  const typeCalcPopper = usePopper(typeCalcReferenceElement, typeCalcPopperElement, {
    placement: 'right',
    strategy: 'absolute',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 0],
        },
      },
    ],
  });

  const propertyIcon = getPropertyIcon(dataType);

  const buttons = [
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionTypes.UPDATE_COLUMN_HEADER,
          columnId: id,
          label: header,
        });
        setSortBy([{ id: id, desc: false }]);
        setExpanded(false);
      },
      icon: <ArrowUpIcon />,
      label: 'Sort ascending',
    },
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionTypes.UPDATE_COLUMN_HEADER,
          columnId: id,
          label: header,
        });
        setSortBy([{ id: id, desc: true }]);
        setExpanded(false);
      },
      icon: <ArrowDownIcon />,
      label: 'Sort descending',
    },
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionTypes.UPDATE_COLUMN_HEADER,
          columnId: id,
          label: header,
        });
        dataDispatch({
          type: ActionTypes.ADD_COLUMN_TO_LEFT,
          columnId: id,
          focus: false,
        });
        setExpanded(false);
      },
      icon: <ArrowLeftIcon />,
      label: 'Insert left',
    },
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionTypes.UPDATE_COLUMN_HEADER,
          columnId: id,
          label: header,
        });
        dataDispatch({
          type: ActionTypes.ADD_COLUMN_TO_RIGHT,
          columnId: id,
          focus: false,
        });
        setExpanded(false);
      },
      icon: <ArrowRightIcon />,
      label: 'Insert right',
    },
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionTypes.UPDATE_COLUMN_HEADER,
          columnId: id,
          label: header,
        });
        dataDispatch({ type: ActionTypes.DELETE_COLUMN, columnId: id });
        setExpanded(false);
      },
      icon: <TrashIcon />,
      label: 'Delete',
    },
  ];

  const types = [
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionTypes.UPDATE_COLUMN_TYPE,
          columnId: id,
          dataType: DataTypes.SELECT,
        });
        setShowType(false);
        setExpanded(false);
      },
      icon: <MultiIcon />,
      label: 'Select',
    },
    {
      onClick: (e) => {},
      icon: <FontAwesomeIcon icon="calculator" size="lg" />,
      label: 'Calc',
    },
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionTypes.UPDATE_COLUMN_TYPE,
          columnId: id,
          dataType: DataTypes.TEXT,
        });
        setShowType(false);
        setExpanded(false);
      },
      icon: <TextIcon />,
      label: 'Text',
    },
    {
      onClick: (e) => {
        dataDispatch({
          type: ActionTypes.UPDATE_COLUMN_TYPE,
          columnId: id,
          dataType: DataTypes.NUMBER,
        });
        setShowType(false);
        setExpanded(false);
      },
      icon: <HashIcon />,
      label: 'Number',
    },
  ];

  const updateCalculation = () => {
    dataDispatch({
      type: ActionTypes.UPDATE_COLUMN_TYPE,
      columnId: id,
      dataType: DataTypes.CALC,
      calc: calculation,
    });
    setShowTypeCalc(false);
    setShowType(false);
    setExpanded(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      dataDispatch({
        type: ActionTypes.UPDATE_COLUMN_HEADER,
        columnId: id,
        label: header,
      });
      setExpanded(false);
    }
  };

  const handleChange = (e) => {
    setHeader(e.target.value);
  };

  const handleBlur = (e) => {
    e.preventDefault();
    dataDispatch({
      type: ActionTypes.UPDATE_COLUMN_HEADER,
      columnId: id,
      label: header,
    });
  };

  const handleCalcKeyDown = (e) => {
    if (e.key === 'Enter') {
      updateCalculation();
    }
  };

  const handleCalcChange = (e) => {
    setCalculation(e.target.value);
  };

  const onMouseEnterTypeCalc = (typeLabel) => {
    return () => {
      if (typeLabel !== 'Calc') return;
      setShowTypeCalc(true);
    };
  };

  const onMouseLeaveTypeCalc = (typeLabel) => {
    return () => {
      if (typeLabel !== 'Calc') return;
      setShowTypeCalc(false);
    };
  };

  useEffect(() => {
    if (created) {
      setExpanded(true);
    }
  }, [created]);

  useEffect(() => {
    setHeader(label);
  }, [label]);

  useEffect(() => {
    setCalculation(calc);
  }, [calc]);

  useEffect(() => {
    if (inputRef) {
      inputRef.focus();
      inputRef.select();
    }
  }, [inputRef]);

  useEffect(() => {
    if (calcInputRef) {
      calcInputRef.focus();
      // calcInputRef.select();
    }
  }, [calcInputRef]);

  function getHeader() {
    if (id !== 999999 && id !== INDEX_TEXT) {
      return (
        <>
          <div {...getHeaderProps()} className="th noselect d-inline-block">
            <div
              className={`th-content ${isDisabledHeader ? 'cell-disabled' : ''}`}
              onClick={() => !isDisabledHeader && setExpanded(true)}
              ref={setReferenceElement}
            >
              <div className="svg-icon svg-gray icon-margin">{propertyIcon}</div>
              <div className="text-ellipsis" title={calc ? `Formula: ${calc}` : ''}>
                {label}
              </div>
            </div>
            <div {...getResizerProps()} className="resizer" />
          </div>
          {expanded && <div className="overlay" onClick={() => setExpanded(false)}></div>}
          {expanded && (
            <div
              ref={setPopperElement}
              style={{ ...styles.popper, zIndex: 3 }}
              {...attributes.popper}
            >
              <div
                className="bg-white shadow-5 border-radius-md"
                style={{
                  width: 240,
                }}
              >
                <div
                  style={{
                    padding: '0.75rem 0.75rem 0',
                  }}
                >
                  <div className="w-100" style={{ marginBottom: 12 }}>
                    <input
                      className="form-input"
                      ref={setInputRef}
                      type="text"
                      value={header}
                      style={{ width: '100%' }}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      onKeyDown={handleKeyDown}
                    />
                  </div>
                  <span className="font-weight-600 font-size-75 color-grey-500 text-transform-uppercase">
                    Property Type
                  </span>
                </div>
                <div className="list-padding">
                  <button
                    className="sort-button"
                    type="button"
                    onMouseEnter={() => setShowType(true)}
                    onMouseLeave={() => setShowType(false)}
                    ref={setTypeReferenceElement}
                  >
                    <span className="svg-icon svg-text icon-margin">{propertyIcon}</span>
                    <span className="text-transform-capitalize">{dataType}</span>
                  </button>
                  {showType && (
                    <div
                      className="bg-white shadow-5 border-radius-md list-padding"
                      ref={setTypePopperElement}
                      onMouseEnter={() => setShowType(true)}
                      onMouseLeave={() => setShowType(false)}
                      {...typePopper.attributes.popper}
                      style={{
                        ...typePopper.styles.popper,
                        width: 200,
                        backgroundColor: 'white',
                        zIndex: 4,
                        top: '5rem',
                      }}
                    >
                      {types.map((type, index) => (
                        <button
                          key={index}
                          className="sort-button"
                          onClick={type.onClick}
                          ref={setTypeCalcReferenceElement}
                          onMouseEnter={onMouseEnterTypeCalc(type.label)}
                          onMouseLeave={onMouseLeaveTypeCalc(type.label)}
                        >
                          <span className="svg-icon svg-text icon-margin">{type.icon}</span>
                          {type.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {showTypeCalc && (
                    <div
                      className="bg-white shadow-5 border-radius-md list-padding"
                      ref={setTypeCalcPopperElement}
                      onMouseEnter={() => {
                        setShowType(true);
                        setShowTypeCalc(true);
                      }}
                      onMouseLeave={() => {
                        setShowType(false);
                        setShowTypeCalc(false);
                      }}
                      {...typeCalcPopper.attributes.popper}
                      style={{
                        ...typeCalcPopper.styles.popper,
                        width: 200,
                        backgroundColor: 'white',
                        zIndex: 5,
                      }}
                    >
                      <div className="px-2 mt-2 mb-3">
                        <label className="mb-1 color-grey-600 font-size-85">Calculation:</label>
                        <input
                          className="form-input"
                          ref={setCalcInputRef}
                          type="text"
                          value={calculation}
                          placeholder="{{= col1 + col2 }}"
                          style={{ width: '100%' }}
                          onChange={handleCalcChange}
                          onKeyDown={handleCalcKeyDown}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div
                  className="list-padding"
                  key={shortId()}
                  style={{
                    borderTop: `2px solid ${grey(200)}`,
                  }}
                >
                  {buttons.map((button, index) => (
                    <button
                      key={index}
                      type="button"
                      className="sort-button"
                      onMouseDown={button.onClick}
                    >
                      <span className="svg-icon svg-text icon-margin">{button.icon}</span>
                      {button.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      );
    }
    return (
      <div {...getHeaderProps()} className="cursor-default th noselect d-inline-block bg-none">
        <div className="th-content d-flex justify-content-center">
          <span>{INDEX_TEXT === id ? id : ''}</span>
        </div>
      </div>
    );
  }

  return getHeader();
}
