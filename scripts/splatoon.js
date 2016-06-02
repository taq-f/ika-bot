// Description:
//   Splatoon information
//
// Dependencies:
//   "request": "^2.72.0"
//
// Commands:
//   ika-bot stage - respond current turf war stages

'use strict';

module.exports = (robot) => {

	robot.respond(/stage$/i, (msg) => {

		const urlBase = "http://s3-ap-northeast-1.amazonaws.com/splatoon-data.nintendo.net/stages_info.json";
		const token = parseInt((new Date()) / 1000);
		const url = urlBase + '?' + token;
		const request = require('request');

		request.get({url: url, json: true}, (err, res, json) => {

			if (err || res.statusCode !== 200) {
				robot.messageRoom("private", "error", err);
				return;
			}

			if (json.length <= 0) {
				robot.messageRoom("private", "something wrong...");
				return;
			}

			const info = json[0];
			const stages = info.stages;
			const stageNames = stages.map((stage, i) => stage.name);

			robot.messageRoom("private", stageNames.join("  "));
		});
	});
};
