'use strict';


const
    {isObject, isString} = require('lodash'),
    Service = require('./service'),
    Singleton = require('./singleton'),
    Action = require('./action'),
    Plugin = require('./plugin');


/**
 * Dependencies broker
 */
class Broker {

    /**
     * @param {string} [singletonsPath]
     * @param {string} [actionsPath]
     * @param {string} [pluginsPath]
     * @param {string} [servicesPath]
     * @param {Object} [singletons]
     * @param {Object} [actions]
     * @param {Object} [plugins]
     * @param {Object} [services]
     */
    constructor({singletons, actions, plugins, services, singletonsPath, actionsPath, pluginsPath, servicesPath}) {
        this.singletons = {};
        this.actions = {};
        this.plugins = {};
        this.services = {};

        this.singletonsPath = singletonsPath;
        this.actionsPath = actionsPath;
        this.pluginsPath = pluginsPath;
        this.servicesPath = servicesPath;

        if (singletons) {
            if (!isObject(singletons))
                throw new Error('Parameter "singletons" have to be an object');

            Object.values(singletons).forEach(s => s instanceof Singleton || Singleton.validateConfig(s));
            this.singletons = Object
                .entries(singletons)
                .reduce((res, [name, s]) => {
                    res[name] = s instanceof Singleton ? s : new Singleton(s);
                    return res;
                }, {});
        }

        if (actions) {
            if (!isObject(actions))
                throw new Error('Parameter "actions" have to be an object');

            Object.values(actions).forEach(a => a instanceof Action || Action.validateConfig(a));
            this.actions = Object
                .entries(actions)
                .reduce((res, [name, a]) => {
                    res[name] = a instanceof Action ? a : new Action(a);
                    return res;
                }, {});
        }

        if (plugins) {
            if (!isObject(plugins))
                throw new Error('Parameter "plugins" have to be an object');

            Object.values(plugins).forEach(a => a instanceof Plugin || Plugin.validateConfig(a));
            this.plugins = Object
                .entries(plugins)
                .reduce((res, [name, p]) => {
                    res[name] = p instanceof Plugin ? p : new Plugin(p);
                    return res;
                }, {});
        }

        if (services) {
            if (!isObject(services))
                throw new Error('Parameter "services" have to be an object');

            Object.values(services).forEach(s => s instanceof Service || Service.validateConfig(s));
            this.services = Object
                .entries(services)
                .reduce((res, [name, s]) => {
                    res[name] = s instanceof Service ? s : new Service(s);
                    return res;
                }, {});
        }
    }


    /**
     * Starts microservice
     * @param {string} name
     * @returns {Promise<void>}
     */
    async startService(name) {
        if (!isString(name))
            throw new Error('Parameter "service" have to be a string or instance of Service class');

        const service = this.getServiceByName(name);

        if (service.isRunning())
            return;

        const singletons = service.singletons;
        this.loadSingletons(service.singletons);
        service.loadHandlers();
        // this.load


        const registry = await prepareRegistry(service);



        await service.start(registry);
    }


    /**
     * Stops service
     * @param {string|Service} service
     * @returns {Promise<void>}
     */
    async stopService(service) {}


    /**
     * @param {string|Service} script
     * @returns {Promise<void>}
     */
    async runScript(script) {}


    async stopAll() {}


    /**
     * @param {string} name
     * @returns {Service}
     */
    getServiceByName(name) {
        if (!isString(name))
            throw new Error('Parameter "name" have to be a string');

        const srv = this.services[name];

        if (!srv)
            throw new Error(`Service with name "${name}" not found`);

        return srv;
    }
}

module.exports = Broker;
