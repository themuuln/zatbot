const express = require('express');
const body_parser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express().use(body_parser.json());

const token = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
const webhook_verify_token = process.env.WEBHOOK_VERIFY_TOKEN;

app.listen(process.env.PORT || 1337, () => console.log('webhook is listening'));

app.get('/webhook', (req, res) => {
  if (req.query['hub.verify_token'] === webhook_verify_token) {
    res.send(req.query['hub.challenge']);
  } else {
    res.sendStatus(400);
  }
});

app.post('/webhook', (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message) {
          handleMessage(event);
        }
      });
    });
    res.sendStatus(200);
  }
});

function handleMessage(event) {
  const sender_psid = event.sender.id;
  const message = event.message.text;

  // Echo the received message
  sendTextMessage(sender_psid, `You said: ${message}`);
}

function sendTextMessage(sender_psid, text) {
  const request_body = {
    recipient: {
      id: sender_psid,
    },
    message: {
      text: text,
    },
  };

  axios
    .post(`https://graph.facebook.com/v11.0/me/messages?access_token=${token}`, request_body)
    .then(() => console.log('Message sent successfully'))
    .catch((err) => console.error('Unable to send message:', err));
}
