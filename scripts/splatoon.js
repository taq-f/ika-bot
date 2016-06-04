// Description:
//   Splatoon information
//
// Dependencies:
//   "request": "^2.72.0"
//   "cron": "^1.1.0"
//   "jsdom": "^9.2.1"
//
// Commands:
//   ika-bot stage - respond current turf war stages

'use strict';

const jsdom = require('jsdom').jsdom;
const fs = require('fs');
const request = require('request');
const Cron = require("cron").CronJob

const room = process.env.HUBOT_ENV_SPLATOON_ROOM;

module.exports = (robot) => {

	new Cron("0 5 7,19 * * *", () => {
		robot.messageRoom(room, "定期更新をする");
		saveStageInfo().then(() => {
			robot.messageRoom(room, "半日のステージ情報保存した");
		}).catch((err) => {
			robot.messageRoom(room, "保存失敗した...");
			fs.writeFileSync('data/stage.json', JSON.stringify({error: true}));
		});
	}, null, true, "Asia/Tokyo");

	robot.respond(/stage$/i, (msg) => {

		fs.readFile('data/stage.json', 'utf-8', (err, data) => {
			if (err) {
				robot.messageRoom(room, "保存したステージ情報が読めなかった..." + JSON.stringify(err));
				return;
			}

			const stages = JSON.parse(data);

			if (data.error) {
				robot.messageRoom(room, "前回の保存が失敗している模様...");
				return;
			}

			if (stages.festival) {
				// TODO
			}
			else{
				const now = new Date().getTime();
				let currentSchedule = null;
				for (let schedule of stages.schedule) {
					const begin = new Date(schedule.datetime_begin).getTime();
					const end = new Date(schedule.datetime_end).getTime();
					if (begin <= now || now <= end) {
						currentSchedule = schedule;
						break;
					}
				}
				if (! currentSchedule) {
					robot.messageRoom(room, "今の時間のステージが取れ...ぬ...？");
					return;
				}

				let message = "";
				message += parseTime(currentSchedule.datetime_begin);
				message += ' ～ ';
				message += parseTime(currentSchedule.datetime_end);
				message += '\r\n\r\n';
				message += '▼ナワバリ\r\n  ';
				message += currentSchedule.stages.regular.map(s => s.name).join('  ');
				message += '\r\n\r\n';
				message += '▼ガチ(' + currentSchedule.gachi_rule + ')\r\n  ';
				message += currentSchedule.stages.gachi.map(s => s.name).join('  ');

				robot.messageRoom(room, message);
			}
		});
	});

	robot.respond(/save$/i, (msg) => {

		robot.messageRoom(room, "手動で更新する");

		saveStageInfo().then(() => {
			robot.messageRoom(room, "保存した");
		}).catch((err) => {
			robot.messageRoom(room, "保存失敗した...");
			fs.writeFileSync('data/stage.json', JSON.stringify({
				error: true,
				content: JSON.stringify(err)
			}));
		});
	});
};

function saveStageInfo() {

	const username = process.env.HUBOT_ENV_SPLATOON_NID_USERNAME;
	const password = process.env.HUBOT_ENV_SPLATOON_NID_PASSWORD;
	if (! username || ! password) {
		return Promise.reject('either username or passwor is not set.');
	}
	const credentials = {username: username, password: password};

	return getStageInfo(credentials).then((data) => {
		return new Promise((resolve, reject) => {
			if (! data) {
				reject();
				return;
			}
			try {
				fs.writeFileSync('data/stage.json', JSON.stringify(data));
			} catch (e) {
				reject(e);
			}
			resolve();
		});
	}).catch((err) => {
		return Promise.reject(err);
	});
}

function getStageInfo(credentials) {

	// reset cookie jar
	const jar = request.jar();
	const req = request.defaults({jar: jar});

	return new Promise((resolve, reject) => { // dummy
		resolve(credentials);
	}).then((credentials) => { // get proper auth information
		return new Promise((resolve, reject) => {
			req.get('https://splatoon.nintendo.net/users/auth/nintendo', (err, res, body) => {
				if (err || res.statusCode !== 200) {
					reject(res);
					return;
				}

				try {
					const html = jsdom(body);
					const form = html.getElementsByTagName('form')[0];
					const inputs = html.querySelectorAll('form input[type=hidden]');

					const params = {};
					for (let input of inputs) {
						params[input.name] = input.value;
					}

					params.username = credentials.username;
					params.password = credentials.password;

					resolve({url: form.action, params: params});
				} catch (e) {
					reject(e);
				}
			});
		})
	}).then((data) => { // auth
		return new Promise((resolve, reject) => {
			req.post({url: data.url, form: data.params}, (err, res, body) => {
				if (res.statusCode !== 303) {
					reject(res);
				}
				resolve(res.headers.location);
			});
		});
	}).then((url) => { // access "see other" location once, then api can be called.

		return new Promise((resolve, reject) => {

			req.get(url, (err, res, body) => {
				if (err || res.statusCode !== 200) {
					reject(res);
					return;
				}
				resolve();
			});
		});
	}).then(() => { // call stage api
		return new Promise((resolve, reject) => {
			req.get({url: 'https://splatoon.nintendo.net/schedule.json', json: true}, (err, res, body) => {
				if (err || res.statusCode !== 200) {
					reject(res);
					return;
				}
				resolve(body)
			});
		});
	});
}

function parseTime(val) {
	// TODO
	return val.substring(0, 16);
}
