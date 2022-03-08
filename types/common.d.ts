export type PropType<TObj, TProp extends keyof TObj> = TObj[TProp];

export type KeyValueSet<T> = {
    [key: string]: T | any
};

type StrapiMap<Type> = {
    [key: string]: Type
};

export interface Strapi {
    config: StrapiConfigContainer
    EE(): Function
    services(): StrapiMap<StrapiService>
    service(uid: string): StrapiService
    controllers(): StrapiMap<StrapiController>
    controller(uid: string): StrapiController
    contentTypes(): StrapiMap<StrapiContentType>
    contentType(name: string): StrapiContentType
    policies(): StrapiMap<StrapiPolicy>
    policy(name: string): StrapiPolicy
    middlewares(): StrapiMap<StrapiMiddleware>
    middleware(name: string): StrapiMiddleware
    plugins(): StrapiMap<StrapiPlugin>
    plugin(name: string): StrapiPlugin
    hooks(): StrapiMap<StrapiHook>
    hook(name: string): StrapiHook
    api(): StrapiMap<StrapiApi>
    api(name: string): StrapiApi
    auth(): StrapiAuth
    getModel(uid: string): StrapiContentType
    query<T>(uid: string): StrapiDBQuery<T>
    store(props: StrapiStoreQuery): StrapiStore
    

    start: Function
    destroy: Function
    sendStartupTelemetry: Function
    openAdmin: Function
    postListen: Function
    listen: Function
    stopWithError: Function
    stop: Function
    loadAdmin: Function
    loadPlugins: Function
    loadPolicies: Function
    loadAPIs: Function
    loadComponents: Function
    loadMiddlewares: Function
    loadApp: Function
    registerInternalHooks: Function
    register: Function
    bootstrap: Function
    load: Function
    startWebhooks: Function
    reload: Function
    runLifecyclesFunctions: Function

    db: StrapiDB
    admin: StrapiAdmin
    log: StrapiLog
}

export type StrapiService = any;
export type StrapiController = any;
export type StrapiMiddleware = Object;
export type StrapiContentType = Object;
export type StrapiPolicy = Object;
export type StrapiHook = Object;
export type StrapiApi = Object;
export type StrapiAuth = Object;
export type StrapiPlugin = {
    service(name: string): StrapiService
    controller(name: string): StrapiController
    config: StrapiConfigContainer
};

export type StrapiConfigContainer = StrapiMap<any> & {
    get: Function
}

export type StrapiStore = {
    get: Function
}

export type StrapiStoreQuery = {
    type: string
    name?: string
};

export type StrapiDB = {
    query<T>(uid: string): StrapiDBQuery<T>
};

export type StrapiDBQuery<T> = {
    findOne(args: StrapiDBQueryArgs): Promise<T>
    findMany(args: StrapiDBQueryArgs): Promise<Array<T>>
    findWithCount(args: StrapiDBQueryArgs): Promise<[items: Array<T>, count: number]>
    create(args: StrapiDBQueryArgs): Promise<T>
    createMany(args: StrapiDBQueryArgs): Promise<Array<T>>
    update(args: StrapiDBQueryArgs): Promise<T>
    updateMany(args: StrapiDBQueryArgs): Promise<Array<T>>
    delete(args: StrapiDBQueryArgs): Promise<T>
    deleteMany(args: StrapiDBQueryArgs): Promise<Array<T>>
    count(args: StrapiDBQueryArgs): number
};

export type StrapiDBQueryArgs = any

export type StrapiAdmin = any

export type StrapiLog = {
    log: Function
    error: Function
    warn: Function 
};

export type Context = {
    strapi: Strapi
}

export type StrapiAdminUser = any;

export type StrapiUser = any;

export type ToBeFixed = any;