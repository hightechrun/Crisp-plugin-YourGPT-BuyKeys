const axios = require('axios');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
var gptSessionId = gptSessionId || {};
const sessionUrl = 'https://api.yourgpt.ai/chatbot/v1/createSession';
const messageUrl = 'https://api.yourgpt.ai/chatbot/v1/sendMessage';
const headers = {
  'Content-Type': 'application/x-www-form-urlencoded',
  'api-key': process.env.YOURGPT_API_KEY
};
// var flag = flag || {};

// async function createSession(openai, threadId, assistantId, content, sessionId) {
//   await openai.beta.threads.messages.create(threadId, {
//     role: "user",
//     content: content
//   });
//   const run = await openai.beta.threads.runs.create(threadId, {
//     assistant_id: assistantId
//   });
//   // Polling for completion
//   let status;
//   do {
//     const response = await openai.beta.threads.runs.retrieve(threadId, run.id);
//     status = response.status;
//     console.log('STATUS:', status);
//     // console.log("response:", response);
//     if (status !== 'completed') {
//       await new Promise(resolve => setTimeout(resolve, 3000)); // Wait before polling again
//     }
//   } while (status !== 'completed');
//   flag[sessionId.match(/\d+/g).join('').toString()] = true;
// }





async function Yourgpt(content, sessionId) {
  let responseMessage;
  if (!gptSessionId[sessionId.match(/\d+/g).join('').toString()]) {
    // Step 1: Create a yourgpt session
    const sessionCreateData = await new URLSearchParams({
      'widget_uid': process.env.YOURGPT_WIDGET_UID
    });
    await axios.post(sessionUrl, sessionCreateData, { headers })
      .then(response => {
        console.log('Response111:', response.data);
        gptSessionId[sessionId.match(/\d+/g).join('').toString()] = response.data.data.session_uid;
        // console.log(gptSessionId[sessionId.match(/\d+/g).join('').toString()]);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }

  const responseCreateData = new URLSearchParams({
    'widget_uid': process.env.YOURGPT_WIDGET_UID,
    'session_uid': gptSessionId[sessionId.match(/\d+/g).join('').toString()],
    'message': content
  });

  await axios.post(messageUrl, responseCreateData, { headers })
    .then(response => {
      console.log('messageResponse:', response.data);
      responseMessage = response.data.data.message;
    })
    .catch(error => {
      console.error('Error:', error);
    });

  return responseMessage;
}

module.exports = Yourgpt;