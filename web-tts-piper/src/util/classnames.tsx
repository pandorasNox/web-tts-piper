type Value = string | boolean | undefined | null;
type Mapping = Record<string, boolean>;

type Argument = Value | Mapping | Argument[] | ReadonlyArray<Argument>;

const hasOwn = Object.prototype.hasOwnProperty;

export default function classNames(...args: Argument[]): string {
  let classes = '';

  for (const arg of args) {
    if (arg) {
      classes = appendClass(classes, parseValue(arg));
    }
  }

  return classes;
}

function parseValue(arg: Argument): string {
  if (arg === null) {
    return '';
  }

  if (typeof arg === 'string') {
    return arg;
  }

  if (typeof arg !== 'object') {
    return '';
  }

  if (Array.isArray(arg)) {
    return classNames(...arg);
  }

  if (
    arg.toString !== Object.prototype.toString &&
    !arg.toString.toString().includes('[native code]')
  ) {
    return arg.toString();
  }

  let classes = '';
  const mapping = arg as Mapping;

  for (const key in mapping) {
    if (hasOwn.call(mapping, key) && mapping[key]) {
      classes = appendClass(classes, key);
    }
  }

  return classes;
}

function appendClass(value: string, newClass: string): string {
  if (!newClass) {
    return value;
  }

  return value ? `${value} ${newClass}` : newClass;
}
