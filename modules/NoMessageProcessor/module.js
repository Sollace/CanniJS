"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");

module.exports = class BestPony extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            Application.modules.Discord.client.on('message', (msg) => {
                if (msg.author.bot) {
                    return;
                }

                if (Application.modules.Discord.isUserBlocked(msg.author.id)) {
                    return;
                }

                if (Application.modules.Discord.isMessageSent()) {
                    return;
                }

                // When no message was sent, Canni either says she doesn't understand, or boops someone at random if she's not mentioned.
                if (msg.isMemberMentioned(Application.modules.Discord.client.user)) {
                    msg.channel.send(Tools.parseReply(this.config.stillLearningAnswer, [Application.modules.Discord.getEmoji('shy')]));
                } else {
                    let random = Tools.getRandomIntFromInterval(0, 200);
                    if (random === 10) {
                        msg.channel.send(Tools.parseReply(this.config.randomBoopAnswer, [msg.author]));
                    }
                }
            })

            return resolve(this);
        });
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
}