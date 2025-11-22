
type Argument = string | Mapping | Argument[] | ReadonlyArray<Argument>;
type Mapping = Record<string, boolean>;

const hasOwn = Object.prototype.hasOwnProperty;

export default function classNames(...args: Argument[]): string {
  let classes = '';

  for (const arg of args) {
    classes = appendClass(classes, parseValue(arg));
  }

  return classes;
}

function parseValue(arg: Argument): string {
  if (typeof arg === 'string') {
    return arg;
  }

  if (Array.isArray(arg)) {
    return classNames(...arg);
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
  if (newClass === '') {
    return value;
  }

  return value ? `${value} ${newClass}` : newClass;
}
