type DeepReadonly<Type> = Type extends (...args: readonly any[]) => any
  ? Type
  : { readonly [Prop in keyof Type]: DeepReadonly<Type[Prop]> }
