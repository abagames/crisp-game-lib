export function clamp(v: number, low = 0, high = 1) {
  return Math.max(low, Math.min(v, high));
}

export function wrap(v: number, low: number, high: number) {
  const w = high - low;
  const o = v - low;
  if (o >= 0) {
    return (o % w) + low;
  } else {
    let wv = w + (o % w) + low;
    if (wv >= high) {
      wv -= w;
    }
    return wv;
  }
}

export function isInRange(v: number, low: number, high: number) {
  return low <= v && v < high;
}

export function range(v: number) {
  return [...Array(v).keys()];
}

export function times<T>(count: number, func: (index: number) => T): T[] {
  return range(count).map((i) => func(i));
}

export function remove<T>(array: T[], func: (v: T, index?: number) => any) {
  let removed = [];
  for (let i = 0, index = 0; i < array.length; index++) {
    if (func(array[i], index)) {
      removed.push(array[i]);
      array.splice(i, 1);
    } else {
      i++;
    }
  }
  return removed;
}

export function fromEntities(v: any[][]) {
  return [...v].reduce((obj, [key, value]) => {
    obj[key] = value;
    return obj;
  }, {});
}

export function entries(obj) {
  return Object.keys(obj).map((p) => [p, obj[p]]);
}

export function addWithCharCode(char: string, offset: number) {
  return String.fromCharCode(char.charCodeAt(0) + offset);
}

export function stableSort(values: any[], compareFunc?: Function) {
  if (compareFunc == null) {
    compareFunc = (a, b) => a - b;
  }
  const indexedValues = values.map((v, i) => [v, i]);
  indexedValues.sort((a, b) => {
    const cmp = compareFunc(a[0], b[0]);
    return cmp !== 0 ? cmp : a[1] - b[1];
  });
  return indexedValues.map((v) => v[0]);
}
