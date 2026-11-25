FROM caddy:2-alpine

COPY Caddyfile.container /etc/caddy/Caddyfile
COPY index.html styles.css main.js favicon.svg share.jpg /srv/
COPY icons/ /srv/icons/

EXPOSE 8080
