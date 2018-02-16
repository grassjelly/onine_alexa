'use strict';
const Alexa = require("alexa-sdk");
const PubNub = require("pubnub");

const pubnub = new PubNub({
    ssl: true,
    publish_key: "pub-c-",
    subscribe_key: "sub-c-"
});

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

const responseArr = [
    'Hi, You can ask me to feed the fish, get you a soda, or check out what\'s happening in the house!',
    'Okay! Moving the robot to feed the fish',
    'Okay! Moving the robot to get you a soda',
    'Okay! Moving the robot to the living room'
];

const handlers = {
    'LaunchRequest': function () {
        const speechOutput = responseArr[0];
        this.response.speak(speechOutput);
    },
    'FeedFishIntent': function () {
        this.emit('SendToRobot', 1);
    },
    'GetSodaIntent': function () {
        this.emit('SendToRobot', 2);
    },
    'SnapLivingRoomIntent': function () {
        this.emit('SendToRobot', 3);
    },
    'AMAZON.HelpIntent': function () {
        const speechOutput = 'Hello I am Onine';
        const reprompt = 'Say hello, to hear me speak.';

        this.response.speak(speechOutput).listen(reprompt);
        this.emit(':responseReady');
    },
    'AMAZON.CancelIntent': function () {
        this.response.speak('Goodbye!');
        this.emit(':responseReady');
    },
    'AMAZON.StopIntent': function () {
        this.response.speak('See you later!');
        this.emit(':responseReady');
    },
    'SendToRobot': function (taskID) {   
        var pubConfig = {
            channel: "onine",
            message : {
                "action" : taskID
            }
        };
   
        pubnub.publish(pubConfig)
            .then(
                (response) => {
                    console.log(response);
                    const speechOutput = responseArr[taskID];
                    this.emit(':tell',speechOutput);
                },
                (error) => {
                    console.log("error");
                }
            );
    }
};
