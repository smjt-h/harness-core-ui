# NG Custom Dasbhoards

### Running against local dashboard-service

Update the two dashboard routes in `devServerProxy.config.js` so that the target points to your local dashboard-service.  
For example,

```json
  '/dashboard': {
    target: 'http://localhost:5000'
  },
  '/gateway/dashboard': {
    pathRewrite: { '^/gateway/dashboard': '/dashboard' },
    target: 'http://localhost:5000'
  },
```

Then run

```shell
$ TARGET_LOCALHOST=false yarn dev
```
