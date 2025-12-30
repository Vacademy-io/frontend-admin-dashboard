// functions/send-alert.js

export async function onRequestPost(context) {
  try {
    // 1. Get the Webhook URL from Cloudflare Environment Variables
    const SLACK_WEBHOOK_URL = context.env.SLACK_WEBHOOK_URL;

    if (!SLACK_WEBHOOK_URL) {
      return new Response("Server Configuration Error: Missing Slack URL", { status: 500 });
    }

    // 2. Parse the incoming JSON
    const payload = await context.request.json();
    let slackMessage = {};

    // --- LOGIC TO HANDLE DIFFERENT SOURCES ---

    // CASE A: It's coming from Sentry (Webhook)
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
    // CASE B: It's coming from your React App (User Report)
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
    // CASE C: Test / Unknown
    else {
       slackMessage = { text: "⚠️ Received a ping, but couldn't parse the error details." };
    }

    // 3. Send to Slack
    const slackResponse = await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackMessage),
    });

    if (slackResponse.ok) {
      return new Response("Alert sent to Slack", { status: 200 });
    } else {
      return new Response("Failed to send to Slack", { status: 500 });
    }

  } catch (err) {
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
