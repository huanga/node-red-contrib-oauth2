module.exports = function(RED) {
    const OAuth2 = require('simple-oauth2');
    const StateMachine = require('javascript-state-machine');
    const util = require('util');

    function OAuth2CredentialsNode(config) {
        RED.nodes.createNode(this, config);
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.tokenHost = config.tokenHost;
    }
    RED.nodes.registerType("oauth2-credentials", OAuth2CredentialsNode);

    function OAuth2Node(config) {
        RED.nodes.createNode(this, config);
        this.account = config.account;
        this.scope = config.scope;
        const node = this;
        node.credentials = RED.nodes.getNode(config.account);
        const credentials = {
            client: {
                id: node.credentials.clientId,
                secret: node.credentials.clientSecret
            },
            auth: {
                tokenHost: node.credentials.tokenHost,
                tokenPath: '/api/oauth.access' // TODO make it configurable
            }
        };
        const oauth2 = OAuth2.create(credentials);
        const fsm = new StateMachine({
            init: 'noToken',
            transitions: [
                { name: 'obtain', from: 'noToken', to: 'hasToken' },
                { name: 'invalidate', from: 'hasToken', to: 'tokenExpired' },
                { name: 'renew', from: 'tokenExpired', to: 'hasToken' },
                { name: 'renewFailed', from: 'tokenExpired', to: 'noToken' }
            ],
            methods: {
                onInit: function() {
                    node.status({fill: "red", shape: "dot", text: "uninitialized token"});
                },
                onObtain: function(transition, code) {
                    var tokenConfig = {
                        code: code,
                        redirect_uri: node.context().get('callback_url')
                    };
                    node.log(util.inspect(tokenConfig));
                    return new Promise(function(resolve, reject) {
                        oauth2.authorizationCode.getToken(tokenConfig)
                            .then((result) => {
                                node.log('accessToken: ' + util.inspect(oauth2.accessToken.create(result)));
                                node.status({fill: "green", shape: "dot", text: "has token"});
                                resolve();
                            })
                            .catch((error) => {
                                node.error('Access Token Error: ' + error.message);
                                node.log(util.inspect(error));
                                reject(error);
                            });
                    });
                },
                onInvalidate: function() {

                },
                onRenew: function() {

                },
                onRenewFailed: function() {

                }
            }
        });
        node.on('input', function(msg) {
            let event = {
                payload: {
                    foo: 'bar',
                    clientId: node.credentials.clientId,
                    clientSecret: node.credentials.clientSecret
                }
            };
            node.send(event);
        });
        node.getStateMachine = function() {
            return fsm;
        };
        node.getAuthorizationUrl = function(protocol, hostname, port) {
            let callbackUrl = protocol + '//' + hostname + (port ? ':' + port : '')
                + '/oauth2/node/' + node.id + '/auth/callback';
            node.context().set('callback_url', callbackUrl);
            return oauth2.authorizationCode.authorizeURL({
                redirect_uri: callbackUrl,
                scope: node.scope,
                state: '1234' // TODO add CSRF token
            });
        };
    }
    RED.nodes.registerType("oauth2", OAuth2Node, {
        credentials: {
            account: {type: "text"}
        }
    });

    RED.httpAdmin.get('/oauth2/node/:id/auth/url', function(req, res) {
        if (!req.params.id || !req.query.protocol || !req.query.hostname || !req.query.port) {
            res.sendStatus(400);
            return;
        }

        let node = RED.nodes.getNode(req.params.id);
        if (!node) {
            res.sendStatus(404);
            return;
        }

        res.send({
            'url': node.getAuthorizationUrl(req.query.protocol, req.query.hostname, req.query.port)
        });
    });

    RED.httpAdmin.get('/oauth2/node/:id/auth/callback', function(req, res) {
        if (!req.params.id || !req.query.code || !req.query.state) {
            res.sendStatus(400);
            return;
        }

        let node = RED.nodes.getNode(req.params.id);
        if (!node) {
            res.sendStatus(404);
            return;
        }

        node.getStateMachine().obtain(req.query.code);
        res.sendStatus(200);
    });
}
