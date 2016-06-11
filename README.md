# ika-bot

posts Splatoon stage information to Slack.

## install

```
git clone https://github.com/taq-f/ika-bot.git
cd ika-bot
npm install
```

## run locally

### Environment Variables

Environment variables listed below are required.

| Name                            | Value                     |
|:--------------------------------|:--------------------------|
| HUBOT_ENV_SPLATOON_ROOM         | Specify channel to post   |
| HUBOT_ENV_SPLATOON_NID_USERNAME | Nintendo Network ID       |
| HUBOT_ENV_SPLATOON_NID_PASSWORD | Nintendo Network password |

* Nintendo Network ID is used to log in to SplatNet in order to retrieve stage schedule.

Windows
```
set HUBOT_ENV_SPLATOON_ROOM=xxxxxxx
set HUBOT_ENV_SPLATOON_NID_USERNAME=xxxxxxx
set HUBOT_ENV_SPLATOON_NID_PASSWORD=xxxxxxx
```

Linux
```
export HUBOT_ENV_SPLATOON_ROOM=xxxxxxx
export HUBOT_ENV_SPLATOON_NID_USERNAME=xxxxxxx
export HUBOT_ENV_SPLATOON_NID_PASSWORD=xxxxxxx
```

### Start Hubot

Windows
```
bin\hubot
```

Linux
```
./bin/hubot
```

try <code>@ika-bot save</code> and <code>stage</code>, and check to see if ika-bot replies.

## Post to Slack

### Environment Variables

In addition to environment variables set above, you need HUBOT_SLACK_TOKEN. Add Hubot integration to your slack and get a token. Then set environment variable: HUBOT_SLACK_TOKEN=xoxb-48181107169-tSHgPoyohS3NAXsy10j69D9u.

### Start Hubot

Add an adapter option, so that ika-bot will connect to your Slack team. Make sure that ika-bot has joined the channel you specify.

```
./bin/hubot --adapter slack
```
