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
const myFoo: foo = {
    baz: "hi",
    bar: [1, 2]
}
// lensMaker function automatically generates lenses
const { bar, baz } = lensMaker<foo>()
console.log("bar is", view(bar)(myFoo))
// createLens automatically creates lenses from strings
const fooLensCreator = createLens<foo>()
const lens2 = fooLensCreator("bar.1")
console.log("the 2nd element of bar is is", view(lens2)(myFoo))

```