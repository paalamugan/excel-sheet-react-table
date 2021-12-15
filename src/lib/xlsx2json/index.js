import xlsxParser from 'xlsx-parse-json';

export default async function (file) {
  if (!(file instanceof File)) {
    throw new Error('Please upload a valid *.xlsx, *.xls and *.csv files!');
  }

  let fileType = file.type;
  if (
    !fileType ||
    (!fileType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') &&
      !fileType.includes('application/vnd.ms-excel'))
  ) {
    throw new Error('Please upload a valid *.xlsx, *.xls and *.csv files!');
  }

  const result = await xlsxParser.onFileSelection(file);
  let key = Object.keys(result)[0]; // Get first sheet name
  let records = result[key]; // Get data from first sheet

  return records;
}
