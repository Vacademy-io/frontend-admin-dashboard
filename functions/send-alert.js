export async function onRequestPost(context) {
  const SLACK_WEBHOOK_URL = context.env.SLACK_WEBHOOK_URL;
  if (!SLACK_WEBHOOK_URL) return new Response("Missing Slack URL", { status: 500 });

  const payload = await context.request.json();
  let slackMessage = {};

  // 1. Real Sentry Issue
  if (payload.data && payload.data.issue) {
    slackMessage = {
      text: `✅ [NEW-VERSION-V2] Sentry Alert: ${payload.data.issue.title}`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*Project:* ${payload.data.issue.project.name}\n*Error:* ${payload.data.issue.title}`
          }
        }
      ]
    };
  }
  // 2. Fallback (The Noise Filter)
  else {
     // This stops the spam. We just acknowledge it silently or print the type.
     const type = payload.action || "unknown-action";
     slackMessage = {
        text: `🔍 [NEW-VERSION-V2] Ignored noise: ${type}`
     };
  }

  await fetch(SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(slackMessage),
  });

  return new Response("OK", { status: 200 });
}
