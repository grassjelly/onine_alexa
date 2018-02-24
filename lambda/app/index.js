'use strict';
const Alexa = require("alexa-sdk");
const PubNub = require("pubnub");

const pubnub = new PubNub({
    ssl: true,
    publish_key: "pub-c-", // PLACE YOUR PUBNUB PUBLISH KEY HERE
    subscribe_key: "sub-c-" // PLACE YOUR PUBNUB SUBSCRIBE KEY HERE
});

exports.handler = function(event, context, callback) {
    const alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

//this are the responses for each Intent. Task ID will be the index of each reponse in the array
const responseArr = [
    'Hi, You can ask me to feed the fish, get you a soda, or check out what\'s happening in the house!',
    'Okay! Moving the robot to feed the fish',
    'Okay! Moving the robot to get you a soda',
    'Okay! Moving the robot to the living room'
    //Append your own response here
];

const handlers = {
    'LaunchRequest': function () {
        //this is O'nine's default response when the skill is called yet no Intent matched
        const speechOutput = responseArr[0];
        this.response.speak(speechOutput);
    },
    'FeedFishIntent': function () {
        //tell MQTT broker that user wants to feed the fish 
        //send task id 1
        this.emit('SendToRobot', 1);
    },
    'GetSodaIntent': function () {
        //tell MQTT broker that user wants to a soda
        //send task id 1
        this.emit('SendToRobot', 2);
    },
    'SnapLivingRoomIntent': function () {
        //tell MQTT broker that user wants to check out what's up in the living room
        //send task id 1
        this.emit('SendToRobot', 3);
    },
    // 'AdditionalIntent': function () {
    //     //this is a sample function how to add your additional Intent
    //     this.emit('SendToRobot', 4); // remember to increment the task id as you add more 
    // },
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
        // create the payload that will be sent to the MQTT broker
        var pubConfig = {
            channel: "onine",
            message : {
                //pass the index number of the Intent as task id
                "action" : taskID
            }
        };
   
        //send the task id to the MQTT broker
        pubnub.publish(pubConfig)
            .then(
                (response) => {
                    //send a respone to the Alexa skill if MQTT acknowledge
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
