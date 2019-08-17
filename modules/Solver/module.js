"use strict";

// @IMPORTS
const Application = require("../../lib/Application");
const Module = require("../../lib/Module");
const Promise = require("bluebird");
const Tools = require("../../lib/Tools");
var Algebrite = require('algebrite');

module.exports = class Solver extends Module {
    start() {
        return new Promise((resolve, reject) => {
            this.log.debug("Starting...");

            this.smileEmoji = Application.modules.Discord.getEmoji('smile');

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

                if (msg.isMemberMentioned(Application.getClient().user)) {
                    if (Tools.msg_starts_mentioned(msg,"solve")) {
                        if (Tools.msg_starts_mentioned(msg,"solve multi")) {
                            return this.simple_multi_parse(msg);
                        } else if (Tools.msg_starts_mentioned(msg,"solver info")) {
                            return this.info(msg);
                        } else {
                            return this.simple_parse(msg);
                        }
                    }
                }
            });
            return resolve(this);
        });
    }

    info(msg) {
        msg.channel.send(Tools.parseReply(this.config.solver_info, [msg.author,this.smileEmoji]));
        Application.modules.Discord.setMessageSent();
    }

    simple_parse(msg) {
        var res;
        var alg = msg.content.split("solve");
        if (alg.length > 1 && alg[1] !== "") {
            res = this.do_clac(alg[1]);
            msg.channel.send(Tools.parseReply(this.config.simple_solve, [msg.author, res]));
            Algebrite.clearall();
        } else {
            msg.channel.send(Tools.parseReply(this.config.solver_nothing, [msg.author]));
        }
        Application.modules.Discord.setMessageSent();
    }

    simple_multi_parse(msg) {
        var res = "";
        var alg = msg.content.split("multi");
        if (alg.length > 1 && alg[1] !== "") {
            alg = this.prepareMulti(alg[1].split(",")).forEach(item => res = this.do_clac(item));
            msg.channel.send(Tools.parseReply(this.config.simple_multi_solve, [msg.author, res]));
            Algebrite.clearall();
        } else {
            msg.channel.send(Tools.parseReply(this.config.solver_nothing, [msg.author]));
        }
        Application.modules.Discord.setMessageSent();
    }

    prepareMulti(pre) {
        var data = [];
        var append_string = "";
        var append_status = 0;
        for (var i = 0; i < pre.length; i++) {
            var state = 0;
            for (var a = 0; a < pre[i].length; a++) {
                if (pre[i][a] === '(') {
                    state++;
                }
                if (pre[i][a] === ')') {
                    state--;
                }
            }
            if (state === 0 && append_status === 0) {
                data.push(pre[i])
            } else if (state > 0) {
                append_status = 1
            } else if (state < 0) {
                append_status = 0;
                append_string += pre[i];
                data.push(append_string);
                append_string = "";
            }
            if (append_status === 1) {
                append_string += pre[i] + ",";
            }
        }
        return data;
    }

    do_clac(item) {
        return Algebrite.run(item).toString();
    }

    stop() {
        return new Promise((resolve, reject) => {
            this.log.debug("Stopping...");
            return resolve(this);
        })
    }
};