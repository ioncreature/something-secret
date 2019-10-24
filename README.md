# Agata - The microservice framework
Hybrid* dependency injection framework for server-side applications
 
[![Build Status](https://travis-ci.org/ioncreature/agata.svg?branch=master)](https://travis-ci.org/ioncreature/agata)
[![Coverage Status](https://coveralls.io/repos/github/ioncreature/agata/badge.svg?branch=master)](https://coveralls.io/github/ioncreature/agata?branch=master)

`Hybrid` here means that it got best parts both from microservices and monoliths

There was few main points to create this framework

### Precise dependency tracking
Every dependency described declaratively and gathered before service start

So it is possible to build dependency trees, check what does service use, 
automatically build documentation, and etc.

### Get any business logic locally instead of calling other microservice   
The idea here is not to make redundant communications between microservices.

### Test every piece of business logic
Unit tests seems redundant in microservices, their place inside libraries. 
It is better to test business units(actions), contracts(handlers) and user scenarios.


## Examples

For complex example which uses most of framework features take a look at [example-with-agata](https://github.com/ioncreature/example-with-agata) 


### Service without dependencies
```javascript
const {Broker} = require('agata');

const broker = Broker({
    services: {
        serviceOne: {
            start({state}) {
                console.log('Service started');
                state.interval = setInterval(() => console.log('Hello!'), 1000);
            },
            stop({state}) {
                clearInterval(state.interval);
                console.log('Bye!');
            },
        },
    },
});

broker
    .startService('serviceOne')
    .then(() => {
        setTimeout(() => broker.stopService('serviceOne'), 3000);    
    });
```


## Lifecycle

- Load 
  - broker
  - service
  - singletons
  - plugins
  - actions
- Start
  - singletons
  - plugins
  - actions
  - service
- Stop
  - singletons
  - service
  