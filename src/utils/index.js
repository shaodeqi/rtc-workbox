export const generateID = (len = 16) =>
  Array.from(new Array(len), () => Math.floor(Math.random() * 256)).join();

export const precacheName = 'rtc_precache';

export const idBytes = 16;
export const headersLengthBytes = 4;

// response.headers 转换为 json
export const headers2Json = (response) => {
  const json = {};
  response.headers.forEach((value, key) => {
    json[key] = value;
  });
  return json;
};

// json 转 typedArray
export const encodeJson = (json) => {
  try {
    return new TextEncoder().encode(JSON.stringify(json));
    // eslint-disable-next-line no-empty
  } catch {}
};

// typedArray 转 json
export const decodeJson = (typedArray) => {
  try {
    return JSON.parse(new TextDecoder().decode(typedArray));
    // eslint-disable-next-line no-empty
  } catch {}
};

// 将数字转换为 Uint8Array，字节数量作为一个参数
export const numberToUint8Array = (number, numBytes) => {
  const uint8Array = new Uint8Array(numBytes);

  for (let i = 0; i < numBytes; i++) {
    const shiftAmount = 8 * (numBytes - i - 1);
    const mask = 0xff << shiftAmount;
    uint8Array[i] = (number & mask) >>> shiftAmount;
  }

  return uint8Array;
};

// 将 Uint8Array 转换回数字
export const uint8ArrayToNumber = (uint8Array) => {
  let reconstructedNumber = 0;

  for (let i = 0; i < uint8Array.length; i++) {
    const shiftAmount = 8 * (uint8Array.length - i - 1);
    reconstructedNumber |= uint8Array[i] << shiftAmount;
  }

  return reconstructedNumber;
};

// 将 response 信息转化为 typedArray ([id][headersLength][headers][body])
export const wrap = async (response, id) => {
  const bodyArrayBuffer = await response.arrayBuffer();

  const idUint8Array = new Uint8Array(id.split(','));
  const headersUint8Array = encodeJson(headers2Json(response));

  // headers 过长
  if (headersUint8Array.byteLength > Math.pow(2, headersLengthBytes * 8)) {
    return;
  }

  const headersLengthUint8Array = numberToUint8Array(
    headersUint8Array.byteLength,
    4
  );
  const bodyUintArray = new Uint8Array(bodyArrayBuffer);

  const combineUint8Array = new Uint8Array(
    idBytes +
      headersLengthBytes +
      headersUint8Array.byteLength +
      bodyArrayBuffer.byteLength
  );

  combineUint8Array.set(idUint8Array);
  combineUint8Array.set(headersLengthUint8Array, idBytes);
  combineUint8Array.set(headersUint8Array, idBytes + headersLengthBytes);
  combineUint8Array.set(
    bodyUintArray,
    idBytes + headersLengthBytes + headersUint8Array.byteLength
  );
  return combineUint8Array;
};

export const unwrap = async (buffer) => {
  const combineUint8Array = new Uint8Array(buffer);

  const id = combineUint8Array.slice(0, idBytes).toString();
  const headersLength = uint8ArrayToNumber(
    combineUint8Array.slice(idBytes, idBytes + headersLengthBytes)
  );
  const headers = decodeJson(
    combineUint8Array.slice(
      idBytes + headersLengthBytes,
      idBytes + headersLengthBytes + headersLength
    )
  );
  console.log(headers);
  const response = combineUint8Array.slice(
    idBytes + headersLengthBytes + headersLength
  );
  console.log(response, '123')
  return {
    id,
    headers,
    response,
  };
};
