import React, { useMemo } from 'react';
import clsx from 'clsx';
import { useTable, useBlockLayout, useResizeColumns, useSortBy } from 'react-table';
import { FixedSizeList } from 'react-window';
import Cell from './Cell';
import Header from './Header';
import scrollbarWidth from '../helper/scrollbarWidth';
import { SUM_TEXT } from '../config';

const defaultColumn = {
  minWidth: 50,
  width: 150,
  maxWidth: 400,
  Cell: Cell,
  Header: Header,
  sortType: 'alphanumericFalsyLast',
};

export default function Table({ columns, data, dispatch: dataDispatch, skipReset }) {
  const sortTypes = useMemo(
    () => ({
      alphanumericFalsyLast(rowA, rowB, columnId, desc) {
        // Skip the last row from sorting
        if (rowA.values[columns[0].id] === SUM_TEXT || rowB.values[columns[0].id] === SUM_TEXT) {
          return desc ? -1 : 1;
        }

        if (!rowA.values[columnId] && !rowB.values[columnId]) {
          return 0;
        }

        if (!rowA.values[columnId]) {
          return desc ? -1 : 1;
        }

        if (!rowB.values[columnId]) {
          return desc ? 1 : -1;
        }

        return isNaN(rowA.values[columnId])
          ? rowA.values[columnId].localeCompare(rowB.values[columnId])
          : rowA.values[columnId] - rowB.values[columnId];
      },
    }),
    []
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow, totalColumnsWidth } =
    useTable(
      {
        columns,
        data,
        defaultColumn,
        dataDispatch,
        autoResetSortBy: !skipReset,
        autoResetFilters: !skipReset,
        autoResetRowState: !skipReset,
        sortTypes,
      },
      useBlockLayout,
      useResizeColumns,
      useSortBy
    );

  const RenderRow = ({ index, style }) => {
    const row = rows[index];
    prepareRow(row);
    return (
      <div {...row.getRowProps({ style })} className="tr">
        {row.cells.map((cell, index) => (
          <div key={index} {...cell.getCellProps()} className="td">
            {cell.render('Cell')}
          </div>
        ))}
      </div>
    );
  };

  function isTableResizing() {
    for (let headerGroup of headerGroups) {
      for (let column of headerGroup.headers) {
        if (column.isResizing) {
          return true;
        }
      }
    }

    return false;
  }

  return (
    <div
      className="overflow-y-hidden"
      style={{
        width: 'auto',
        height: '100%',
      }}
    >
      <div {...getTableProps()} className={clsx('custom-table', isTableResizing() && 'noselect')}>
        {headerGroups.map((headerGroup, index) => (
          <div {...headerGroup.getHeaderGroupProps()} className="tr" key={index}>
            {headerGroup.headers.map((column, index) => {
              return <div key={index}>{column.render('Header')}</div>;
            })}
          </div>
        ))}
        <div {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            return (
              <div key={index} {...row.getRowProps()} className="tr">
                {row.cells.map((cell) => (
                  <div {...cell.getCellProps()} className="td">
                    {cell.render('Cell')}
                  </div>
                ))}
              </div>
            );
          })}
          {/* <FixedSizeList
            height={window.innerHeight - 265}
            itemCount={rows.length}
            itemSize={40}
            width={totalColumnsWidth + scrollbarWidth}
            className="hide-scrollbar"
          >
            {RenderRow}
          </FixedSizeList> */}
        </div>
      </div>
      <div id="popper-portal"></div>
    </div>
  );
}
