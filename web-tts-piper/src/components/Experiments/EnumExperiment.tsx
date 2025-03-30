// https://www.reddit.com/r/typescript/comments/yyssmq/stringsymbol_map_keys_as_union_type/
// const makeEnum = <TKey>(...entries: TKey[]): Record<TKey, Symbol> => {
//   const result = {};
//   entries.forEach(entry => result[entry] = Symbol(entry));
//   return Object.freeze(result) as Record<TKey, Symbol>;
// }
// const ResourceTypes = makeEnum('IRON', 'GOLD', 'COPPER', 'ALUMINUM');
// type ResourceType = keyof typeof ResourceTypes;

// https://www.reddit.com/r/typescript/comments/yyssmq/stringsymbol_map_keys_as_union_type/
// const makeEnum = <TKey extends string>(...entries: TKey[]): Readonly<Partial<Record<TKey, Symbol>>> => {
//   const result: Partial<Record<TKey, symbol>> = {};
//   entries.forEach(entry => result[entry] = Symbol(entry));
//   return Object.freeze(result);
// }
// const ResourceTypes = makeEnum('IRON', 'GOLD', 'COPPER', 'ALUMINUM');
// type ResourceType = keyof typeof ResourceTypes;

// final?
const makeEnum = <TKey extends string>(...entries: TKey[]): Readonly<Record<TKey, symbol>> => {
  const result: Record<TKey, symbol> = {} as Record<TKey, symbol>;
  entries.forEach(entry => {
      result[entry] = Symbol(entry);
  });
  return Object.freeze(result);
};
const ResourceTypes = makeEnum('IRON', 'GOLD', 'COPPER', 'ALUMINUM');
type ResourceType = keyof typeof ResourceTypes;
