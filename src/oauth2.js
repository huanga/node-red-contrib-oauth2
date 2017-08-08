module.exports = function(RED) {
    const OAuth2 = require('simple-oauth2');
    const StateMachine = require('javascript-state-machine');

    function OAuth2CredentialsNode(config) {
        RED.nodes.createNode(this, config);
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
    }
    RED.nodes.registerType("oauth2-credentials", OAuth2CredentialsNode);

    function OAuth2Node(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.credentials = RED.nodes.getNode(config.account);
        const credentials = {
            client: {
                id: node.credentials.clientId,
                secret: node.credentials.clientSecret
            },
            auth: {
                tokenHost: config.tokenHost
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
                onObtain: function() {

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
            var event = {
                payload: {
                    foo: 'bar',
                    clientId: node.credentials.clientId,
                    clientSecret: node.credentials.clientSecret
                }
            };
            node.send(event);
        });
    }
    RED.nodes.registerType("oauth2", OAuth2Node, {
        credentials: {
            account: {type: "text"}
        }
    });
}
