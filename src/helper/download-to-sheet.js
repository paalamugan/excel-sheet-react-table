import exportFromJSON from 'export-from-json';
import { EXPORT_SHEET_DEFAULT_NAME, EXPORT_SHEET_DEFAULT_TYPE } from '../config';

export default function downloadToSheet(
  data,
  fileName = EXPORT_SHEET_DEFAULT_NAME,
  exportType = EXPORT_SHEET_DEFAULT_TYPE
) {
  try {
    exportFromJSON({
      data,
      fileName,
      exportType,
    });
  } catch (err) {
    console.error(err);
  }
}
