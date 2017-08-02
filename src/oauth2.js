module.exports = function(RED) {
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
            name: {type: "text"}
        }
    });
}
