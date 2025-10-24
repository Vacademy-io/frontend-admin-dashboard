/**
 * Strip query parameters from any AWS S3 URLs as these are public assets and
 * temporary signatures can be expired/stale. We only target hosts containing
 * "amazonaws.com" and remove everything after the first '?' character.
 */
export const stripAwsQueryParamsFromUrls = (htmlString: string): string => {
    const awsSignedUrlRegex = /https?:\/\/[^"'()<>\s]*amazonaws\.com[^"'()<>\s]*\?[^"'()<>\s]*/gi;
    return htmlString.replace(awsSignedUrlRegex, (matched: string): string => {
        const qIndex = matched.indexOf('?');
        return qIndex === -1 ? matched : matched.slice(0, qIndex);
    });
};

export const formatHTMLString = (htmlString: string) => {
    // Remove the body tag and its attributes
    let cleanedHtml = htmlString.replace(/<body[^>]*>|<\/body>/g, '');

    // Remove data-meta attributes and style from paragraphs
    cleanedHtml = cleanedHtml.replace(/<p[^>]*data-meta[^>]*style="[^"]*"[^>]*>/g, '<p>');

    // Strip expired query params from public S3 URLs
    cleanedHtml = stripAwsQueryParamsFromUrls(cleanedHtml);

    // Add proper HTML structure
    const formattedHtml = `<html>
    <head></head>
    <body>
        <div>
            ${cleanedHtml}
        </div>
    </body>
</html>`;

    return formattedHtml;
};
