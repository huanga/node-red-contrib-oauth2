module.exports = function(RED) {
    function OAuth2Node(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        node.on('input', function(msg) {
            msg.payload.clientId = node.credentials.id;
            node.send(msg);
        });
    }
    RED.nodes.registerType("oauth2", OAuth2Node, {
        credentials: {
            id: {"type": "text"},
            secret: {"type": "password"}
        }
    });
}
