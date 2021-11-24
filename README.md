# Lens
This is a typescript library for lenses, an immutable way to access and mutate fields of datastructures. It is based on
haskell lenses [https://hackage.haskell.org/package/lens](https://hackage.haskell.org/package/lens)

# Example
Here is an example for accessing and modyfying a datastructure
```ts
type foo = {
    bar: [number, number],
    baz: string,
}
const barLens: Lens<foo, [number, number]> = makeLens((foo: foo) => foo.bar)((n: foo) => (x) => Object.assign(n, { bar: x }))
const _2lens: Lens<[number, number], number> = makeLens((foo: [number, number]) => foo[1])((foo: [number, number]) => (n: number) => [foo[0], n])
const myFoo: foo = {
    baz: "hi",
    bar: [1, 2]
}
const composed: Lens<foo, number> = compose(barLens, _2lens)
const viewFoo = view<foo, number>(composed)
const setFoo = set<foo, number>(composed)
console.log("the 2nd element of the bar field is", viewFoo(myFoo)) // "2"
console.log("myFoo updated with 100 is", setFoo(100)(myFoo)) // "{ baz: 'hi', bar: [ 1, 100 ] }"
```