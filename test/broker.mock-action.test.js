'use strict';

const
    {Broker} = require('../index');


describe('Broker#mockAction()', () => {

    it('should throw if action is unknown', async() => {
        const broker = Broker({});

        await expect(broker.mockAction('a', {})).rejects.toThrow('Unknown action');
    });


    it.each([
        [undefined, undefined],
        [undefined, {}],
        ['doIt', undefined],
        ['doIt', {actions: 1}],
        ['doIt', {singletons: 1}],
        ['doIt', {plugins: 1}],
    ])(
        'should throw on invalid params, path: %p %p',
        async(name, params) => {
            const broker = Broker({
                actions: {
                    doIt: {fn: () => () => {}},
                },
            });
            await expect(broker.mockAction(name, params)).rejects.toThrow();
        },
    );


    it('should mock with nothing', async() => {
        const broker = Broker({
            actions: {
                doIt: {fn: () => () => 1},
            },
        });

        const action = await broker.mockAction('doIt', {});
        expect(typeof action === 'function').toBeTruthy();
        expect(action()).toEqual(1);
    });


    it('should mock one action', async() => {
        const broker = Broker({
            actions: {
                doIt: {fn: () => () => 1},
                doThat: {
                    actions: ['doIt'],
                    fn: ({actions: {doIt}}) => () => doIt() + 1,
                },
            },
        });

        const action = await broker.mockAction('doThat', {});
        expect(action()).toEqual(2);

        const action2 = await broker.mockAction('doThat', {
            actions: {doIt: () => 5},
        });
        expect(action2()).toEqual(6);
    });


    it('should mock singleton for action', async() => {
        const broker = Broker({
            singletons: {
                s1: {
                    start() {
                        return 1;
                    },
                },
            },
            actions: {
                doThat: {
                    singletons: ['s1'],
                    fn: ({singletons: {s1}}) => () => s1 + 2,
                },
            },
        });

        const action = await broker.mockAction('doThat', {});
        expect(action()).toEqual(3);

        const action2 = await broker.mockAction('doThat', {singletons: {s1: 3}});
        expect(action2()).toEqual(5);
    });


    it('should mock plugin for action', async() => {
        const broker = Broker({
            plugins: {
                p1: {
                    start() {
                        return p => p;
                    },
                },
            },
            actions: {
                doThat: {
                    plugins: {p1: 5},
                    fn: ({plugins: {p1}}) => () => p1 + 2,
                },
            },
        });

        const action = await broker.mockAction('doThat', {});
        expect(action()).toEqual(7);

        const action2 = await broker.mockAction('doThat', {plugins: {p1: 10}});
        expect(action2()).toEqual(12);
    });


    it('should mock everything', async() => {
        const broker = Broker({
            plugins: {
                p1: {
                    start() {
                        return p => p;
                    },
                },
            },
            singletons: {
                s1: {
                    start() {
                        return 2;
                    },
                },
            },
            actions: {
                a1: {
                    plugins: {p1: 4},
                    fn: ({plugins: {p1}}) => () => p1 + 8,
                },
                doThat: {
                    plugins: {p1: 16},
                    actions: ['a1'],
                    singletons: ['s1'],
                    fn: ({plugins: {p1}, singletons: {s1}, actions: {a1}}) => () => a1() + p1 + s1,
                    // fn: ({plugins: {p1}, singletons: {s1}, actions: {a1}}) => () => {
                    //     console.log(a1(), p1,s1);
                    //     return a1() + p1 + s1
                    // },
                },
            },
        });

        const action = await broker.mockAction('doThat', {});
        expect(action()).toEqual(7);

        throw new Error('implement mocking everything here');

    });
});
