import XMLParser from './xml-parser';

const convertXMLToJson = (data) => {
  if (!data.length) return data || [];

  let headerNames = data[0]; // data[0].map((val) => camelCase(val));
  let result = [];

  for (const rows of data.slice(1)) {
    let row = {};

    for (let j = 0; j < rows.length; j++) {
      let key = headerNames[j];
      let value = rows[j];
      key && (row[key] = value || '');
    }

    result.push(row);
  }

  return result;
};

const sanitizeXML = (parent, result, index) => {
  let children = parent.children || [];

  if (!children.length) {
    return result;
  }

  for (let i = 0; i < children.length; i++) {
    let child = children[i];
    result = sanitizeXML(child, result, i);

    if (child.value) {
      result[index] = result[index] || [];
      result[index][i] = child.value;
    }
  }

  return result;
};

const capitalize = (string) => {
  string = (string || '').toString();

  const char = string.charAt(0);
  const trailing = string.slice(1);
  return char.toUpperCase() + trailing;
};

const getMatches = (string) => {
  string = string || '';
  const reAsciiWord = /[^\x00-\x2f\x3a-\x40\x5b-\x60\x7b-\x7f]+/g; // Used to match words composed of alphanumeric characters
  const matches = string.match(reAsciiWord) || [];
  return (callback, initialValue = '') => {
    return matches.reduce(callback, initialValue);
  };
};

const camelCase = (string) => {
  const matches = getMatches(string);

  const result = matches((result, word, index) => {
    word = word.toLowerCase();
    return result + (index ? capitalize(word) : word);
  });

  return result;
};

const kebabCase = (string) => {
  const matches = getMatches(string);

  const result = matches((result, word, index) => {
    return result + (index ? '-' : '') + word.toLowerCase();
  });

  return result;
};

export default async function xml2json(data) {
  let xmlText = data;

  if (!xmlText) {
    throw new Error('Invalid XML data!');
  }

  if (xmlText instanceof File) {
    if (!xmlText?.type || !xmlText.type.includes('xml')) {
      throw new Error('Please upload a valid *.xml file with data!');
    }

    xmlText = await xmlText.text();
  }

  let xmlParser = new XMLParser().parseFromString(xmlText);
  const sanitizedXMl = sanitizeXML(xmlParser, [], 0);
  return convertXMLToJson(sanitizedXMl);
}
