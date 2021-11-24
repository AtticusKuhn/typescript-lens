type foo = {
    bar: [number, number],
    baz: string,
}
type Lens<s, a> = (f: ((a: a) => functor<a>)) => (s: s) => functor<s>
type functor<a> = {
    value: a,
    fmap: <b>(f: (a: a) => b) => functor<b>
}
const makeIdentity = <a>(a: a): functor<a> => ({
    value: a,
    fmap: (f) => makeIdentity(f(a))
})
const makeConst = <b>(bthing: b) => (__a: any): functor<b> => ({
    value: bthing,
    ///@ts-ignore
    fmap: (_f) => makeConst(bthing)(1123132)
})
const makeLens = <s, a>(sa: (s: s) => a) => (sas: (s: s) => (a: a) => s): Lens<s, a> => {
    return (afa: ((a: a) => functor<a>)) => (s: s) => afa(sa(s)).fmap(sas(s));
}
const barLens: Lens<foo, [number, number]> = makeLens((foo: foo) => foo.bar)((n: foo) => (x) => Object.assign(n, { bar: x }))
const _2lens: Lens<[number, number], number> = makeLens((foo: [number, number]) => foo[1])((foo: [number, number]) => (n: number) => [foo[0], n])
const view = <s, a>(l: Lens<s, a>) => (s: s) => l((s) => makeConst(s)(s))(s).value;//l(makeConst(s))(a).value;
const set = <s, a>(l: Lens<s, a>) => (a: a) => (s1: s): s => l(() => makeIdentity(a))(s1).value;//l(() => makeIdentity(s1))(a).value

type Get<T, Path extends string> = Path extends `${infer K}.${infer R}`
    ? K extends keyof T
    ? Get<T[K], R>
    : never
    : Path extends keyof T
    ? T[Path]
    : never;
type test = Get<foo, "bar.1">
const createLens = <structure>() => <locationString extends string>(locationString: locationString): Lens<structure, Get<structure, locationString>> => {
    const path = locationString.split(".")
    //@ts-ignore
    return makeLens((structure: structure) => {
        let f = structure;
        for (const p of path) {
            //@ts-ignore
            f = f[p]
        }
        return f;
        //@ts-ignore
    })((n: structure) => (x: DeepPick<structure, locationString>) => {
        let a = { [path[0]]: x };
        if (path.length > 1) {
            for (const p of path.slice(1).reverse()) {
                //@ts-ignore
                a = { [p]: a }
            }
        }
        return a
    })
}
const fooLensCreator = createLens<foo>()
const barL = fooLensCreator("bar")
const L2 = createLens<[number, number]>()("1")

function compose<T, U, R>(g: (y: U) => R, f: (x: T) => U): (x: T) => R {
    return x => g(f(x));
}
const myFoo: foo = {
    baz: "hi",
    bar: [1, 2]
}
function main() {
    const composed: Lens<foo, number> = compose(barL, L2)
    const viewFoo = view<foo, number>(composed)
    const setFoo = set<foo, number>(composed)
    console.log("the 2nd element of the bar field is", viewFoo(myFoo))
    console.log("myFoo updated with 100 is", setFoo(100)(myFoo))
}
main()