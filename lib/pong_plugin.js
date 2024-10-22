"use strict";

const Crisp = require("crisp-api");
const path = require('path');
const axios = require('axios');
const Yourgpt = require("./yourgpt");
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });



async function PongPlugin(pluginUrn, crispAPIIdentifier, crispAPIKey) {

  var CrispClient = new Crisp();
  CrispClient.authenticateTier("plugin", crispAPIIdentifier, crispAPIKey)
  var customData = customData || {};
  var sayHuman = sayHuman || {};

  CrispClient.on("message:received", async (event) => {
    // console.log("Got \"message:received\" event:", event);
    if (!event.user?.type) {
      sayHuman[event.session_id.match(/\d+/g).join('').toString()] = true;
    }
  })

  CrispClient.on("message:send", async (event) => {
    // console.log("Got \"message:send\" event1:", event);
    let assign;
    if (!event.content?.type && event.content.toLowerCase().includes("falar com")) {
      await CrispClient.website.listWebsiteOperators(event.website_id)
        .then(operators => {
          operators.map(operator => {
            if (operator.details.first_name == process.env.CRISP_ASSIGN) {
              const assignUserId = operator.details.user_id;
              assign = {
                "assigned": {
                  "user_id": assignUserId
                }
              };
            }
          })
        })
      await CrispClient.website.assignConversationRouting(event.website_id, event.session_id, assign);
      CrispClient.website.sendMessageInConversation(
        event.website_id,
        event.session_id,
        {
          type: "text",
          from: "operator",
          origin: pluginUrn,
          content: "Claro! Vou transferi-lo para um de nossos atendentes. Enquanto isso, sinta-se à vontade para descrever seu problema com o máximo de detalhes possível.",
          user: {
            type: "participant",
            nickname: "YourGPT",
            avatar: "https://crisp.chat/favicon-512x512.png",
          }
        }
      )
      sayHuman[event.session_id.match(/\d+/g).join('').toString()] = true;
    } else {
      const sessionId = event.session_id.match(/\d+/g).join('').toString();

      if (customData[sessionId] != true && sayHuman[sessionId] != true) {
        try {
          let status = false;
          do {
            const conversation = await CrispClient.website.getConversation(event.website_id, event.session_id)
            if (Object.keys(conversation.meta.data).length != 0) { status = true }
            console.log("custom data:", conversation.meta.data);
            if (conversation.meta.data?.BOT2 == "WHATSAPP2") {
              customData[sessionId] = true;
            }
          } while (!status)
        } catch (err) { console.log(err) }
      }

      if (customData[sessionId] == true && sayHuman[sessionId] != true) {
        const response = await Yourgpt(event.content, event.session_id);
        console.log("response", response);
        CrispClient.website.sendMessageInConversation(
          event.website_id,
          event.session_id,
          {
            type: "text",
            from: "operator",
            origin: pluginUrn,
            content: response,
            user: {
              type: "participant",
              nickname: "YourGPT",
              avatar: "https://crisp.chat/favicon-512x512.png",
            }
          }
        )
          .then(response => {
            console.log(response);
          })
          .catch(error => {
            console.error(error);
          });
      }
    }
  });
  console.log("Now listening for events...");
}

module.exports = PongPlugin;
