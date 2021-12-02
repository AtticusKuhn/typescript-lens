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
const view = <s, a>(l: Lens<s, a>) => (s: s) => l((s) => makeConst(s)(s))(s).value;//l(makeConst(s))(a).value;
const set = <s, a>(l: Lens<s, a>) => (a: a) => (s1: s): s => l(() => makeIdentity(a))(s1).value;//l(() => makeIdentity(s1))(a).value

type Get<T, Path extends string> = Path extends `${infer K}.${infer R}`
    ? K extends keyof T
    ? Get<T[K], R>
    : never
    : Path extends keyof T
    ? T[Path]
    : never;
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
type makeLenses<Type> = {
    [Property in keyof Type]: Lens<Type, Type[Property]>
};
const lensMaker = <structure>(): makeLenses<structure> => {
    const handler = {
        get: function (_target: any, prop: any, _receiver: any) {
            //@ts-ignore
            return makeLens<structure, any>((s: structure) => s[prop])((s: structure) => (a) => Object.assign(s, { [prop]: a }))
        }
    };
    const proxy = new Proxy({}, handler);
    return proxy
}
const fooLensCreator = createLens<foo>()
const { bar, baz } = lensMaker<foo>()
const lens2 = fooLensCreator("bar.1")

function compose<T, U, R>(g: (y: U) => R, f: (x: T) => U): (x: T) => R {
    return x => g(f(x));
}
const myFoo: foo = {
    baz: "hi",
    bar: [1, 2]
}
function main() {
    const lens: Lens<foo, number> = lens2
    const viewFoo = view<foo, number>(lens)
    const setFoo = set<foo, number>(lens)
    console.log("the 2nd element of the bar field is", viewFoo(myFoo))
    console.log("myFoo updated with 100 is", setFoo(100)(myFoo))
    console.log("the bar is", view(baz)(myFoo))
}
main()