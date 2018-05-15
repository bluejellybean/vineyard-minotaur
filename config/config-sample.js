"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ethereumConfig = {
    database: {
        host: "localhost",
        database: "vineyard_minotaur_dev",
        devMode: true,
        username: "",
        password: "",
        dialect: "postgres"
    },
    ethereum: {
        client: {
            http: "http://35.160.177.94:8545"
        }
    },
    cronInterval: 15000
};
//# sourceMappingURL=config-sample.js.map