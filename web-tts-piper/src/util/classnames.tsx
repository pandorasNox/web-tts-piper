type Value = string | boolean | undefined | null;
type Mapping = Record<string, any>;
interface ArgumentArray extends Array<Argument> {}
interface ReadonlyArgumentArray extends ReadonlyArray<Argument> {}
type Argument = Value | Mapping | ArgumentArray | ReadonlyArgumentArray;

const hasOwn = {}.hasOwnProperty;

// export default function classNames () {
export default function classNames(...args: ArgumentArray): string {

	let classes = '';

	for (let i = 0; i < arguments.length; i++) {
		const arg = arguments[i];
		if (arg) {
			classes = appendClass(classes, parseValue(arg));
		}
	}

	return classes;
}

function parseValue (arg: Argument) {
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
		return classNames.apply(null, arg);
	}

	if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes('[native code]')) {
		return arg.toString();
	}

	let classes = '';

    arg = arg as Mapping //TODO

	for (const key in arg) {
		if (hasOwn.call(arg, key) && arg[key]) {
			classes = appendClass(classes, key);
		}
	}

	return classes;
}

function appendClass (value: string, newClass: string) {
	if (!newClass) {
		return value;
	}

	return value ? (value + ' ' + newClass) : newClass;
}
