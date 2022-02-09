#!/bin/bash
NGINX_CONFIG_FILE="/etc/nginx/nginx.conf"

if [[ "$IPV4_ONLY" == "true" ]]
then
  NGINX_CONFIG_FILE="/etc/nginx/nginx-ipv4-only.conf"
fi

sed -i "s|<\!-- apiurl -->|<script>window.apiUrl = '$API_URL'</script>|" index.html
sed -i "s|HARNESS_ENABLE_NG_AUTH_UI_PLACEHOLDER|$HARNESS_ENABLE_NG_AUTH_UI_PLACEHOLDER|" index.html
sed -i "s|HARNESS_ENABLE_FULL_STORY_PLACEHOLDER|$HARNESS_ENABLE_FULL_STORY_PLACEHOLDER|" index.html
sed -i "s|HARNESS_ENABLE_APPDY_EUM_PLACEHOLDER|$HARNESS_ENABLE_APPDY_EUM_PLACEHOLDER|" index.html
sed -i "s|<\!-- segmentToken -->|<script>window.segmentToken = '$SEGMENT_TOKEN'</script>|" index.html
sed -i "s|<\!-- bugsnagToken -->|<script>window.bugsnagToken = '$BUGSNAG_TOKEN'</script>|" index.html
sed -i "s|<\!-- appDyEUMToken -->|<script>window.appDyEUMToken = '$APPDY_EUM_TOKEN'</script>|" index.html
sed -i "s|<\!-- deploymentType -->|<script>window.deploymentType = '$DEPLOYMENT_TYPE'</script>|" index.html
echo "Using $NGINX_CONFIG_FILE for nginx"
nginx -c $NGINX_CONFIG_FILE -g 'daemon off;'
