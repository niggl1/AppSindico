// Sistema de Compressão de Dados Offline
// App Síndico - Plataforma Digital para Condomínios
// Implementação de compressão LZ-String otimizada

// Tabela de caracteres para compressão
const keyStrBase64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
const keyStrUriSafe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$';

// Função auxiliar para criar dicionário de caracteres
function getBaseValue(alphabet: string, character: string): number {
  const index = alphabet.indexOf(character);
  return index === -1 ? -1 : index;
}

// Compressão LZ para UTF-16
export function compress(input: string | null): string {
  if (input == null) return '';
  if (input === '') return '';
  
  const contextDictionary: Record<string, number> = {};
  const contextDictionaryToCreate: Record<string, boolean> = {};
  let contextW = '';
  let contextWC = '';
  let contextEnlargeIn = 2;
  let contextDictSize = 3;
  let contextNumBits = 2;
  const contextData: string[] = [];
  let contextDataVal = 0;
  let contextDataPosition = 0;
  
  for (let ii = 0; ii < input.length; ii++) {
    const contextC = input.charAt(ii);
    
    if (!Object.prototype.hasOwnProperty.call(contextDictionary, contextC)) {
      contextDictionary[contextC] = contextDictSize++;
      contextDictionaryToCreate[contextC] = true;
    }
    
    contextWC = contextW + contextC;
    
    if (Object.prototype.hasOwnProperty.call(contextDictionary, contextWC)) {
      contextW = contextWC;
    } else {
      if (Object.prototype.hasOwnProperty.call(contextDictionaryToCreate, contextW)) {
        if (contextW.charCodeAt(0) < 256) {
          for (let i = 0; i < contextNumBits; i++) {
            contextDataVal = contextDataVal << 1;
            if (contextDataPosition === 15) {
              contextDataPosition = 0;
              contextData.push(String.fromCharCode(contextDataVal));
              contextDataVal = 0;
            } else {
              contextDataPosition++;
            }
          }
          let value = contextW.charCodeAt(0);
          for (let i = 0; i < 8; i++) {
            contextDataVal = (contextDataVal << 1) | (value & 1);
            if (contextDataPosition === 15) {
              contextDataPosition = 0;
              contextData.push(String.fromCharCode(contextDataVal));
              contextDataVal = 0;
            } else {
              contextDataPosition++;
            }
            value = value >> 1;
          }
        } else {
          let value = 1;
          for (let i = 0; i < contextNumBits; i++) {
            contextDataVal = (contextDataVal << 1) | value;
            if (contextDataPosition === 15) {
              contextDataPosition = 0;
              contextData.push(String.fromCharCode(contextDataVal));
              contextDataVal = 0;
            } else {
              contextDataPosition++;
            }
            value = 0;
          }
          value = contextW.charCodeAt(0);
          for (let i = 0; i < 16; i++) {
            contextDataVal = (contextDataVal << 1) | (value & 1);
            if (contextDataPosition === 15) {
              contextDataPosition = 0;
              contextData.push(String.fromCharCode(contextDataVal));
              contextDataVal = 0;
            } else {
              contextDataPosition++;
            }
            value = value >> 1;
          }
        }
        contextEnlargeIn--;
        if (contextEnlargeIn === 0) {
          contextEnlargeIn = Math.pow(2, contextNumBits);
          contextNumBits++;
        }
        delete contextDictionaryToCreate[contextW];
      } else {
        let value = contextDictionary[contextW];
        for (let i = 0; i < contextNumBits; i++) {
          contextDataVal = (contextDataVal << 1) | (value & 1);
          if (contextDataPosition === 15) {
            contextDataPosition = 0;
            contextData.push(String.fromCharCode(contextDataVal));
            contextDataVal = 0;
          } else {
            contextDataPosition++;
          }
          value = value >> 1;
        }
      }
      contextEnlargeIn--;
      if (contextEnlargeIn === 0) {
        contextEnlargeIn = Math.pow(2, contextNumBits);
        contextNumBits++;
      }
      contextDictionary[contextWC] = contextDictSize++;
      contextW = String(contextC);
    }
  }
  
  if (contextW !== '') {
    if (Object.prototype.hasOwnProperty.call(contextDictionaryToCreate, contextW)) {
      if (contextW.charCodeAt(0) < 256) {
        for (let i = 0; i < contextNumBits; i++) {
          contextDataVal = contextDataVal << 1;
          if (contextDataPosition === 15) {
            contextDataPosition = 0;
            contextData.push(String.fromCharCode(contextDataVal));
            contextDataVal = 0;
          } else {
            contextDataPosition++;
          }
        }
        let value = contextW.charCodeAt(0);
        for (let i = 0; i < 8; i++) {
          contextDataVal = (contextDataVal << 1) | (value & 1);
          if (contextDataPosition === 15) {
            contextDataPosition = 0;
            contextData.push(String.fromCharCode(contextDataVal));
            contextDataVal = 0;
          } else {
            contextDataPosition++;
          }
          value = value >> 1;
        }
      } else {
        let value = 1;
        for (let i = 0; i < contextNumBits; i++) {
          contextDataVal = (contextDataVal << 1) | value;
          if (contextDataPosition === 15) {
            contextDataPosition = 0;
            contextData.push(String.fromCharCode(contextDataVal));
            contextDataVal = 0;
          } else {
            contextDataPosition++;
          }
          value = 0;
        }
        value = contextW.charCodeAt(0);
        for (let i = 0; i < 16; i++) {
          contextDataVal = (contextDataVal << 1) | (value & 1);
          if (contextDataPosition === 15) {
            contextDataPosition = 0;
            contextData.push(String.fromCharCode(contextDataVal));
            contextDataVal = 0;
          } else {
            contextDataPosition++;
          }
          value = value >> 1;
        }
      }
      contextEnlargeIn--;
      if (contextEnlargeIn === 0) {
        contextEnlargeIn = Math.pow(2, contextNumBits);
        contextNumBits++;
      }
      delete contextDictionaryToCreate[contextW];
    } else {
      let value = contextDictionary[contextW];
      for (let i = 0; i < contextNumBits; i++) {
        contextDataVal = (contextDataVal << 1) | (value & 1);
        if (contextDataPosition === 15) {
          contextDataPosition = 0;
          contextData.push(String.fromCharCode(contextDataVal));
          contextDataVal = 0;
        } else {
          contextDataPosition++;
        }
        value = value >> 1;
      }
    }
    contextEnlargeIn--;
    if (contextEnlargeIn === 0) {
      contextNumBits++;
    }
  }
  
  // Mark the end of the stream
  let value = 2;
  for (let i = 0; i < contextNumBits; i++) {
    contextDataVal = (contextDataVal << 1) | (value & 1);
    if (contextDataPosition === 15) {
      contextDataPosition = 0;
      contextData.push(String.fromCharCode(contextDataVal));
      contextDataVal = 0;
    } else {
      contextDataPosition++;
    }
    value = value >> 1;
  }
  
  // Flush the last char
  while (true) {
    contextDataVal = contextDataVal << 1;
    if (contextDataPosition === 15) {
      contextData.push(String.fromCharCode(contextDataVal));
      break;
    } else {
      contextDataPosition++;
    }
  }
  
  return contextData.join('');
}

// Descompressão LZ
export function decompress(compressed: string | null): string | null {
  if (compressed == null) return null;
  if (compressed === '') return null;
  
  const dictionary: string[] = [];
  let enlargeIn = 4;
  let dictSize = 4;
  let numBits = 3;
  let entry = '';
  const result: string[] = [];
  let w: string;
  let c: string;
  
  const data = {
    val: compressed.charCodeAt(0),
    position: 32768,
    index: 1,
  };
  
  for (let i = 0; i < 3; i++) {
    dictionary[i] = String(i);
  }
  
  let bits = 0;
  let maxpower = Math.pow(2, 2);
  let power = 1;
  
  while (power !== maxpower) {
    const resb = data.val & data.position;
    data.position >>= 1;
    if (data.position === 0) {
      data.position = 32768;
      data.val = compressed.charCodeAt(data.index++);
    }
    bits |= (resb > 0 ? 1 : 0) * power;
    power <<= 1;
  }
  
  const next = bits;
  switch (next) {
    case 0:
      bits = 0;
      maxpower = Math.pow(2, 8);
      power = 1;
      while (power !== maxpower) {
        const resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = 32768;
          data.val = compressed.charCodeAt(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      c = String.fromCharCode(bits);
      break;
    case 1:
      bits = 0;
      maxpower = Math.pow(2, 16);
      power = 1;
      while (power !== maxpower) {
        const resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = 32768;
          data.val = compressed.charCodeAt(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      c = String.fromCharCode(bits);
      break;
    case 2:
      return '';
    default:
      return null;
  }
  
  dictionary[3] = c;
  w = c;
  result.push(c);
  
  while (true) {
    if (data.index > compressed.length) {
      return '';
    }
    
    bits = 0;
    maxpower = Math.pow(2, numBits);
    power = 1;
    
    while (power !== maxpower) {
      const resb = data.val & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = 32768;
        data.val = compressed.charCodeAt(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }
    
    const cc = bits;
    switch (cc) {
      case 0:
        bits = 0;
        maxpower = Math.pow(2, 8);
        power = 1;
        while (power !== maxpower) {
          const resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = 32768;
            data.val = compressed.charCodeAt(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        dictionary[dictSize++] = String.fromCharCode(bits);
        cc === dictSize - 1;
        enlargeIn--;
        break;
      case 1:
        bits = 0;
        maxpower = Math.pow(2, 16);
        power = 1;
        while (power !== maxpower) {
          const resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = 32768;
            data.val = compressed.charCodeAt(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        dictionary[dictSize++] = String.fromCharCode(bits);
        cc === dictSize - 1;
        enlargeIn--;
        break;
      case 2:
        return result.join('');
    }
    
    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }
    
    if (dictionary[cc]) {
      entry = dictionary[cc];
    } else {
      if (cc === dictSize) {
        entry = w + w.charAt(0);
      } else {
        return null;
      }
    }
    result.push(entry);
    
    dictionary[dictSize++] = w + entry.charAt(0);
    enlargeIn--;
    
    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }
    
    w = entry;
  }
}

// Compressão para Base64 (seguro para armazenamento)
export function compressToBase64(input: string): string {
  if (input == null) return '';
  const res = _compress(input, 6, (a: number) => keyStrBase64.charAt(a));
  switch (res.length % 4) {
    case 0:
      return res;
    case 1:
      return res + '===';
    case 2:
      return res + '==';
    case 3:
      return res + '=';
    default:
      return res;
  }
}

// Descompressão de Base64
export function decompressFromBase64(input: string): string | null {
  if (input == null) return null;
  if (input === '') return null;
  return _decompress(input.length, 32, (index: number) => getBaseValue(keyStrBase64, input.charAt(index)));
}

// Compressão para URI (seguro para URLs)
export function compressToEncodedURIComponent(input: string): string {
  if (input == null) return '';
  return _compress(input, 6, (a: number) => keyStrUriSafe.charAt(a));
}

// Descompressão de URI
export function decompressFromEncodedURIComponent(input: string): string | null {
  if (input == null) return null;
  if (input === '') return null;
  input = input.replace(/ /g, '+');
  return _decompress(input.length, 32, (index: number) => getBaseValue(keyStrUriSafe, input.charAt(index)));
}

// Função interna de compressão
function _compress(uncompressed: string, bitsPerChar: number, getCharFromInt: (a: number) => string): string {
  let i: number;
  let value: number;
  const contextDictionary: Record<string, number> = {};
  const contextDictionaryToCreate: Record<string, boolean> = {};
  let contextC = '';
  let contextWC = '';
  let contextW = '';
  let contextEnlargeIn = 2;
  let contextDictSize = 3;
  let contextNumBits = 2;
  const contextData: string[] = [];
  let contextDataVal = 0;
  let contextDataPosition = 0;
  
  for (let ii = 0; ii < uncompressed.length; ii++) {
    contextC = uncompressed.charAt(ii);
    if (!Object.prototype.hasOwnProperty.call(contextDictionary, contextC)) {
      contextDictionary[contextC] = contextDictSize++;
      contextDictionaryToCreate[contextC] = true;
    }
    
    contextWC = contextW + contextC;
    if (Object.prototype.hasOwnProperty.call(contextDictionary, contextWC)) {
      contextW = contextWC;
    } else {
      if (Object.prototype.hasOwnProperty.call(contextDictionaryToCreate, contextW)) {
        if (contextW.charCodeAt(0) < 256) {
          for (i = 0; i < contextNumBits; i++) {
            contextDataVal = contextDataVal << 1;
            if (contextDataPosition === bitsPerChar - 1) {
              contextDataPosition = 0;
              contextData.push(getCharFromInt(contextDataVal));
              contextDataVal = 0;
            } else {
              contextDataPosition++;
            }
          }
          value = contextW.charCodeAt(0);
          for (i = 0; i < 8; i++) {
            contextDataVal = (contextDataVal << 1) | (value & 1);
            if (contextDataPosition === bitsPerChar - 1) {
              contextDataPosition = 0;
              contextData.push(getCharFromInt(contextDataVal));
              contextDataVal = 0;
            } else {
              contextDataPosition++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i = 0; i < contextNumBits; i++) {
            contextDataVal = (contextDataVal << 1) | value;
            if (contextDataPosition === bitsPerChar - 1) {
              contextDataPosition = 0;
              contextData.push(getCharFromInt(contextDataVal));
              contextDataVal = 0;
            } else {
              contextDataPosition++;
            }
            value = 0;
          }
          value = contextW.charCodeAt(0);
          for (i = 0; i < 16; i++) {
            contextDataVal = (contextDataVal << 1) | (value & 1);
            if (contextDataPosition === bitsPerChar - 1) {
              contextDataPosition = 0;
              contextData.push(getCharFromInt(contextDataVal));
              contextDataVal = 0;
            } else {
              contextDataPosition++;
            }
            value = value >> 1;
          }
        }
        contextEnlargeIn--;
        if (contextEnlargeIn === 0) {
          contextEnlargeIn = Math.pow(2, contextNumBits);
          contextNumBits++;
        }
        delete contextDictionaryToCreate[contextW];
      } else {
        value = contextDictionary[contextW];
        for (i = 0; i < contextNumBits; i++) {
          contextDataVal = (contextDataVal << 1) | (value & 1);
          if (contextDataPosition === bitsPerChar - 1) {
            contextDataPosition = 0;
            contextData.push(getCharFromInt(contextDataVal));
            contextDataVal = 0;
          } else {
            contextDataPosition++;
          }
          value = value >> 1;
        }
      }
      contextEnlargeIn--;
      if (contextEnlargeIn === 0) {
        contextEnlargeIn = Math.pow(2, contextNumBits);
        contextNumBits++;
      }
      contextDictionary[contextWC] = contextDictSize++;
      contextW = String(contextC);
    }
  }
  
  if (contextW !== '') {
    if (Object.prototype.hasOwnProperty.call(contextDictionaryToCreate, contextW)) {
      if (contextW.charCodeAt(0) < 256) {
        for (i = 0; i < contextNumBits; i++) {
          contextDataVal = contextDataVal << 1;
          if (contextDataPosition === bitsPerChar - 1) {
            contextDataPosition = 0;
            contextData.push(getCharFromInt(contextDataVal));
            contextDataVal = 0;
          } else {
            contextDataPosition++;
          }
        }
        value = contextW.charCodeAt(0);
        for (i = 0; i < 8; i++) {
          contextDataVal = (contextDataVal << 1) | (value & 1);
          if (contextDataPosition === bitsPerChar - 1) {
            contextDataPosition = 0;
            contextData.push(getCharFromInt(contextDataVal));
            contextDataVal = 0;
          } else {
            contextDataPosition++;
          }
          value = value >> 1;
        }
      } else {
        value = 1;
        for (i = 0; i < contextNumBits; i++) {
          contextDataVal = (contextDataVal << 1) | value;
          if (contextDataPosition === bitsPerChar - 1) {
            contextDataPosition = 0;
            contextData.push(getCharFromInt(contextDataVal));
            contextDataVal = 0;
          } else {
            contextDataPosition++;
          }
          value = 0;
        }
        value = contextW.charCodeAt(0);
        for (i = 0; i < 16; i++) {
          contextDataVal = (contextDataVal << 1) | (value & 1);
          if (contextDataPosition === bitsPerChar - 1) {
            contextDataPosition = 0;
            contextData.push(getCharFromInt(contextDataVal));
            contextDataVal = 0;
          } else {
            contextDataPosition++;
          }
          value = value >> 1;
        }
      }
      contextEnlargeIn--;
      if (contextEnlargeIn === 0) {
        contextNumBits++;
      }
      delete contextDictionaryToCreate[contextW];
    } else {
      value = contextDictionary[contextW];
      for (i = 0; i < contextNumBits; i++) {
        contextDataVal = (contextDataVal << 1) | (value & 1);
        if (contextDataPosition === bitsPerChar - 1) {
          contextDataPosition = 0;
          contextData.push(getCharFromInt(contextDataVal));
          contextDataVal = 0;
        } else {
          contextDataPosition++;
        }
        value = value >> 1;
      }
    }
    contextEnlargeIn--;
    if (contextEnlargeIn === 0) {
      contextNumBits++;
    }
  }
  
  value = 2;
  for (i = 0; i < contextNumBits; i++) {
    contextDataVal = (contextDataVal << 1) | (value & 1);
    if (contextDataPosition === bitsPerChar - 1) {
      contextDataPosition = 0;
      contextData.push(getCharFromInt(contextDataVal));
      contextDataVal = 0;
    } else {
      contextDataPosition++;
    }
    value = value >> 1;
  }
  
  while (true) {
    contextDataVal = contextDataVal << 1;
    if (contextDataPosition === bitsPerChar - 1) {
      contextData.push(getCharFromInt(contextDataVal));
      break;
    } else {
      contextDataPosition++;
    }
  }
  
  return contextData.join('');
}

// Função interna de descompressão
function _decompress(length: number, resetValue: number, getNextValue: (index: number) => number): string | null {
  const dictionary: string[] = [];
  let enlargeIn = 4;
  let dictSize = 4;
  let numBits = 3;
  let entry = '';
  const result: string[] = [];
  let w: string;
  let bits: number;
  let resb: number;
  let maxpower: number;
  let power: number;
  let c: string;
  
  const data = {
    val: getNextValue(0),
    position: resetValue,
    index: 1,
  };
  
  for (let i = 0; i < 3; i++) {
    dictionary[i] = String(i);
  }
  
  bits = 0;
  maxpower = Math.pow(2, 2);
  power = 1;
  while (power !== maxpower) {
    resb = data.val & data.position;
    data.position >>= 1;
    if (data.position === 0) {
      data.position = resetValue;
      data.val = getNextValue(data.index++);
    }
    bits |= (resb > 0 ? 1 : 0) * power;
    power <<= 1;
  }
  
  switch (bits) {
    case 0:
      bits = 0;
      maxpower = Math.pow(2, 8);
      power = 1;
      while (power !== maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      c = String.fromCharCode(bits);
      break;
    case 1:
      bits = 0;
      maxpower = Math.pow(2, 16);
      power = 1;
      while (power !== maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position === 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb > 0 ? 1 : 0) * power;
        power <<= 1;
      }
      c = String.fromCharCode(bits);
      break;
    case 2:
      return '';
    default:
      return null;
  }
  
  dictionary[3] = c;
  w = c;
  result.push(c);
  
  while (true) {
    if (data.index > length) {
      return '';
    }
    
    bits = 0;
    maxpower = Math.pow(2, numBits);
    power = 1;
    while (power !== maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position === 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb > 0 ? 1 : 0) * power;
      power <<= 1;
    }
    
    let cc = bits;
    switch (cc) {
      case 0:
        bits = 0;
        maxpower = Math.pow(2, 8);
        power = 1;
        while (power !== maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        dictionary[dictSize++] = String.fromCharCode(bits);
        cc = dictSize - 1;
        enlargeIn--;
        break;
      case 1:
        bits = 0;
        maxpower = Math.pow(2, 16);
        power = 1;
        while (power !== maxpower) {
          resb = data.val & data.position;
          data.position >>= 1;
          if (data.position === 0) {
            data.position = resetValue;
            data.val = getNextValue(data.index++);
          }
          bits |= (resb > 0 ? 1 : 0) * power;
          power <<= 1;
        }
        dictionary[dictSize++] = String.fromCharCode(bits);
        cc = dictSize - 1;
        enlargeIn--;
        break;
      case 2:
        return result.join('');
    }
    
    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }
    
    if (dictionary[cc]) {
      entry = dictionary[cc];
    } else {
      if (cc === dictSize) {
        entry = w + w.charAt(0);
      } else {
        return null;
      }
    }
    result.push(entry);
    
    dictionary[dictSize++] = w + entry.charAt(0);
    enlargeIn--;
    
    if (enlargeIn === 0) {
      enlargeIn = Math.pow(2, numBits);
      numBits++;
    }
    
    w = entry;
  }
}

// Utilitários de compressão para objetos
export function compressObject(obj: any): string {
  const json = JSON.stringify(obj);
  return compressToBase64(json);
}

export function decompressObject<T = any>(compressed: string): T | null {
  const json = decompressFromBase64(compressed);
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// Calcular taxa de compressão
export function getCompressionRatio(original: string, compressed: string): number {
  if (!original || !compressed) return 0;
  return ((original.length - compressed.length) / original.length) * 100;
}

// Calcular tamanho em bytes
export function getByteSize(str: string): number {
  return new Blob([str]).size;
}

// Formatar tamanho
export function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
