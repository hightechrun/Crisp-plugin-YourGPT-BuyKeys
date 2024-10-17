const express = require("express");
const PongPlugin = require("./pong_plugin");

const pluginUrn = "urn:jossan.silva:buykeys:0";
const crispAPIIdentifier = "93635fab-09e9-4011-ae4a-ce10d105b7c4";
const crispAPIKey = "66a84c3345614c168cef6d8972c98451f3eec7ec9b3eb2f855f6d055a7ae539c";

const app = express();
const port = 1235;

const plugin = PongPlugin(
  pluginUrn,
  crispAPIIdentifier,
  crispAPIKey
);

app.use(express.json());

app.use("/", express.static("public"));

app.use("/config/update", ((req) => {
  const websiteId = req.body.website_id;
  const message = req.body.message;
  const token = req.body.token;

  plugin.updateMessageForWebsite(websiteId, token, message)
}));

app.listen(port, () => {
  console.log(`Plugin now listening on port :${port}`)
});
