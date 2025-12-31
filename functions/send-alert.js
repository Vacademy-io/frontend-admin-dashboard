// functions/send-alert.js

export async function onRequestPost(context) {
    
  try {
    const SLACK_WEBHOOK_URL = context.env.SLACK_WEBHOOK_URL;
    if (!SLACK_WEBHOOK_URL) return new Response("Missing Slack URL", { status: 500 });

    const payload = await context.request.json();
    let slackMessage = {};

    // CASE A: Real Sentry Error
    if (payload.data && payload.data.issue) {
      const issue = payload.data.issue;
      slackMessage = {
        text: `🚨 *Sentry Alert: ${issue.title}*`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Project:* ${issue.project.name}\n*Level:* ${issue.level}\n*Error:* ${issue.culprit || issue.title}\n*Link:* <${issue.permalink}|View in Sentry>`
            }
          }
        ]
      };
    }
    // CASE B: User Report (React App)
    else if (payload.errorDetails) {
      slackMessage = {
        text: "🚨 *User Reported Issue*",
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Reporter:* ${payload.userEmail || "Anonymous"}\n*Error:* ${payload.errorDetails}`
            }
          }
        ]
      };
    }
    // CASE C: DEBUGGING (The "Catch-All")
    else {
       // We convert the unknown payload to a string so we can read it in Slack
       const debugInfo = JSON.stringify(payload, null, 2);

       slackMessage = {
          text: "⚠️ Debug Payload Received",
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: "*Received unknown JSON structure:*\n```" + debugInfo + "```"
              }
            }
          ]
       };
    }

    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });

    return new Response("OK", { status: 200 });

  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
