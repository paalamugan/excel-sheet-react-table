import exportFromJSON from 'export-from-json';
import { EXPORT_SHEET_DEFAULT_FILE_NAME, EXPORT_SHEET_DEFAULT_FILE_TYPE } from '../config';

export default function downloadToSheet(
  data,
  fileName = EXPORT_SHEET_DEFAULT_FILE_NAME,
  exportType = EXPORT_SHEET_DEFAULT_FILE_TYPE
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
