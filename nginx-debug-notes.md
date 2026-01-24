# Nginx Configuration check
I am checking the Nginx configuration to ensure it passes the `X-Forwarded-Proto` header.
If this header is missing, Express (even with `trust proxy`) won't know the request is secure (HTTPS), 
and `secure: true` cookies will be rejected by the browser.

I need to see:
`proxy_set_header X-Forwarded-Proto $scheme;`
in the `location /` block.
