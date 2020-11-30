const EventSource = require('eventsource');
const { IncomingWebhook } = require('@slack/webhook');

const config = require('./config')
const watchedPageUrls = config.WATCHED_PAGE_URLS;
const eventSource = new EventSource(config.EVENT_SOURCE_URL);
const webhook = new IncomingWebhook(config.SLACK_WEBHOOK_URL);

function formatMessage(event) {
    const revId = event.rev_id;
    const oldId = event.rev_parent_id;
    const title = event.page_title;
    const domain = event.meta.domain;
    const pageUrl = event.meta.uri;
    const diffUrl = `${pageUrl}?type=revision&diff=${revId}&oldid=${oldId}`
    return `Revision created for page <${pageUrl}|${title}> on ${domain} (<${diffUrl}|diff>)`;
}

eventSource.onmessage = (message) => {
    const event = JSON.parse(message.data);
    if (watchedPageUrls.includes(event.meta.uri)) {
        (async () => { await webhook.send({ text: formatMessage(event) }) })();
    }
}
