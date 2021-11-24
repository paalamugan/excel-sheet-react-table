import './styles/app.css';

import React, { useState, useEffect, useReducer, useCallback, useRef } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import xlsxParser from 'xlsx-parse-json';
import Table from './components/Table';
import DragDrop from './components/DragDrop';
import { Multiselect } from 'multiselect-react-dropdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ToastContainer, toast } from 'react-toastify';
import { makeRecords } from './helper/utils';
import { tableReducer } from './reducers/index';
import { APP_NAME } from './config';
import { ActionTypes, RecordType } from './contants';
import { defaultTableState } from './reducers/tableReducer';

const App = () => {
  const [state, dispatch] = useReducer(tableReducer, defaultTableState());
  const [showFilterInput, setShowFilterInput] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    dispatch({ type: ActionTypes.ENABLE_RESET });
  }, [state.data, state.columns]);

  const addColumn = () => {
    dispatch({
      type: ActionTypes.ADD_COLUMN_TO_LEFT,
      columnId: 999999,
      focus: true,
    });
  };

  const addRow = () => {
    dispatch({
      type: ActionTypes.ADD_ROW,
    });
    dispatch({
      type: ActionTypes.CLONE_PREVIOUS_DATA,
    });
  };

  const handleUpload = () => {
    inputRef.current?.click();
  };

  const downloadFile = () => {
    dispatch({
      type: ActionTypes.DOWNLOAD_TO_SHEET,
    });
  };

  const handleUploadFile = () => onUploadFile(inputRef.current?.files?.[0]);

  const onUploadFile = useCallback(async (file) => {
    if (!file) return;

    try {
      const result = await xlsxParser.onFileSelection(file);
      let key = Object.keys(result)[0];
      let records = result[key];

      let payload = makeRecords(records);
      setShowFilterInput(false);
      dispatch({ type: ActionTypes.INITIALIZE_DATA, payload });
      toast.success('Successfully Parsed.');
    } catch (err) {
      // console.error(err);
      toast.error('Please upload a valid xlsx file with data!');
      dispatch({ type: ActionTypes.INITIALIZE_DATA, payload: makeRecords([]) });
    }
  }, []);

  const createNewSheet = () => {
    let payload = makeRecords([], RecordType.NEW_SHEET);
    setShowFilterInput(true);
    dispatch({ type: ActionTypes.INITIALIZE_DATA, payload });
  };

  const onChangeFilterOption = (data) => {
    dispatch({ type: ActionTypes.FILTER_BY_OPTIONS, filters: data });
    dispatch({ type: ActionTypes.TOTAL_SUM_CALCULATION });
  };

  const resetData = () => {
    dispatch({ type: ActionTypes.INITIALIZE_DATA, payload: defaultTableState() });
  };

  return (
    <>
      <Container fluid>
        <Row className="pt-4 my-4">
          <h1 className="d-flex justify-content-center align-items-center">
            <FontAwesomeIcon icon="file-excel" className="mr-2" />
            {APP_NAME}
          </h1>
        </Row>

        {state.data.length ? (
          <Container fluid>
            <Row>
              <div className="mb-2 d-flex justify-content-between align-items-center min-height-3rem">
                <div>
                  <input
                    ref={inputRef}
                    className="d-none"
                    id="uploadFile"
                    name="uploadFile"
                    onChange={handleUploadFile}
                    type="file"
                    accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  />
                  <Button onClick={handleUpload} variant="success" className="mr-4">
                    <FontAwesomeIcon icon="upload" className="mr-2" />
                    Upload New XLSX
                  </Button>
                  <Button variant="primary" className="mr-4" onClick={downloadFile}>
                    <FontAwesomeIcon icon="download" className="mr-2" />
                    Download XLSX
                  </Button>
                  <Button variant="outline-success" onClick={addRow} className="mr-4">
                    <FontAwesomeIcon icon="plus" className="mr-2" />
                    Add Row
                  </Button>
                  <Button variant="outline-primary" onClick={addColumn}>
                    <FontAwesomeIcon icon="plus" className="mr-2" />
                    Add Column
                  </Button>
                </div>
                <div className="d-inline-block">
                  <div className="d-flex align-items-center">
                    {showFilterInput && (
                      <div className="mr-4 d-flex">
                        <Multiselect
                          options={state.filterOptions}
                          selectedValues={state.selectedFilterValue}
                          avoidHighlightFirstOption={true}
                          placeholder={`Filters`}
                          onSelect={onChangeFilterOption}
                          onRemove={onChangeFilterOption}
                          displayValue="name"
                        />
                      </div>
                    )}

                    <Button variant="light" onClick={resetData}>
                      <FontAwesomeIcon icon="redo" className="mr-2" />
                      RESET
                    </Button>
                  </div>
                </div>
              </div>
            </Row>
            <Row style={{ overflow: 'auto', display: 'flex' }}>
              <Col
                style={{
                  flex: '1 1 auto',
                  padding: '1rem',
                }}
              >
                <Table
                  columns={state.columns}
                  data={state.data}
                  dispatch={dispatch}
                  skipReset={state.skipReset}
                />
              </Col>
            </Row>
          </Container>
        ) : (
          <Container>
            <Row className="my-4 d-flex flex-column justify-content-center">
              <Col>
                <DragDrop uploadFile={onUploadFile} />
              </Col>
              <Col className="my-5 text-center text-black-50 font-weight-600 font-size-120">
                <div className="border-line">OR</div>
              </Col>
              <Col className="mb-4 text-center">
                <Button variant="success" onClick={createNewSheet}>
                  <FontAwesomeIcon icon="plus" className="mr-2" />
                  Create a New Sheet
                </Button>
              </Col>
            </Row>
          </Container>
        )}
      </Container>
      <ToastContainer />
    </>
  );
};

export default App;
