type foo = {
    bar: [number, number],
    baz: string,
}
// type functor<a> = {
//     fmap: <b>(f: (a: a) => b) => functor<b>
// }
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
//@ts-ignore
const view = <s, a>(l: Lens<s, a>) => (s: s): a => l(makeConst)(s).value;//l(makeConst(s))(a).value;
const set = <s, a>(l: Lens<s, a>) => (a: a) => (s1: s): s => l(() => makeIdentity(a))(s1).value;//l(() => makeIdentity(s1))(a).value
const compose = <a, b, c>(f1: (b: b) => c) => (f2: (a: a) => b) => (a: a) => f1(f2(a));
const myFoo: foo = {
    baz: "hi",
    bar: [1, 2]
}
function main() {
    //@ts-ignore
    const composed: Lens<foo, number> = compose(barLens)(_2lens)
    const prop: (f: foo) => number = view<foo, number>(composed)
    console.log(prop(myFoo))
}
main()