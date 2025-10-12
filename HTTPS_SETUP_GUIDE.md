# HTTPS Setup Guide

Quick reference for enabling HTTPS support in the Family Expense Tracker backend API.

## Quick Start (Development)

### 1. Generate Self-Signed Certificates

```bash
cd marriage_billing_backend
npm run generate-certs
```

This will create:
- `certs/server.crt` - SSL certificate
- `certs/server.key` - Private key

### 2. Enable HTTPS

Create or update `.env` file:

```env
USE_HTTPS=true
HTTPS_PORT=5443
```

### 3. Start Server

```bash
npm start
```

### 4. Access Your API

- **HTTP:** `http://localhost:5000/api/health`
- **HTTPS:** `https://localhost:5443/api/health`

### 5. Handle Browser Warning

When accessing `https://localhost:5443` in your browser:
1. You'll see "Your connection is not private" warning
2. Click **Advanced**
3. Click **Proceed to localhost (unsafe)**

This is normal for self-signed certificates in development.

## Configuration Options

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_HTTPS` | `false` | Enable/disable HTTPS server |
| `HTTPS_PORT` | `5443` | HTTPS port number |
| `SSL_CERT_PATH` | `./certs/server.crt` | Path to SSL certificate |
| `SSL_KEY_PATH` | `./certs/server.key` | Path to private key |

### Example `.env` Configurations

**HTTP Only (Default):**
```env
PORT=5000
USE_HTTPS=false
```

**HTTPS Enabled with Default Paths:**
```env
PORT=5000
USE_HTTPS=true
HTTPS_PORT=5443
```

**HTTPS with Custom Certificate Paths:**
```env
PORT=5000
USE_HTTPS=true
HTTPS_PORT=443
SSL_CERT_PATH=/etc/ssl/certs/mycert.crt
SSL_KEY_PATH=/etc/ssl/private/mykey.key
```

## Testing HTTPS

### Using curl

```bash
# Test HTTPS endpoint (ignore certificate validation)
curl -k https://localhost:5443/api/health

# Test with verbose output
curl -kv https://localhost:5443/api/health

# Expected response:
# {
#   "status": "OK",
#   "message": "Server is running",
#   "database": "MySQL",
#   "protocol": "https",
#   "secure": true
# }
```

### Using Browser

1. Open `https://localhost:5443/api/health`
2. Accept the security warning
3. You should see the health check JSON response

### Using Postman/Insomnia

1. Disable SSL certificate verification in settings
2. Make request to `https://localhost:5443/api/health`

## Production Deployment

### Option 1: Let's Encrypt (Recommended)

**Free, automated, trusted SSL certificates**

```bash
# Install Certbot (Ubuntu/Debian)
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Update .env
USE_HTTPS=true
HTTPS_PORT=443
SSL_CERT_PATH=/etc/letsencrypt/live/yourdomain.com/fullchain.pem
SSL_KEY_PATH=/etc/letsencrypt/live/yourdomain.com/privkey.pem

# Start server (requires sudo for port 443)
sudo npm start
```

**Auto-renewal:**
```bash
# Test renewal
sudo certbot renew --dry-run

# Set up cron job for auto-renewal
sudo crontab -e

# Add this line:
0 0 * * * certbot renew --quiet && systemctl restart your-app-service
```

### Option 2: Reverse Proxy (Recommended for Production)

Use Nginx or Apache to handle SSL termination:

**Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**With Nginx, your .env stays simple:**
```env
PORT=5000
USE_HTTPS=false  # Nginx handles HTTPS
```

### Option 3: Cloud Platform

**Heroku:**
- Automatic SSL on all paid plans
- No configuration needed
- Just deploy normally

**AWS (with ALB/CloudFront):**
- Use AWS Certificate Manager
- Attach certificate to Load Balancer
- App runs HTTP behind load balancer

**Google Cloud (with Load Balancer):**
- Managed SSL certificates
- Auto-renewal
- Configure in Cloud Console

**Railway/Render:**
- Automatic SSL certificates
- No configuration needed

## Security Best Practices

### ✅ DO

- **Use Let's Encrypt** for free, trusted certificates in production
- **Use reverse proxy** (Nginx/Apache) for production SSL
- **Keep certificates private** - never commit to Git
- **Set proper file permissions:**
  ```bash
  chmod 600 /path/to/private.key
  chmod 644 /path/to/certificate.crt
  ```
- **Monitor certificate expiration** - set up alerts
- **Use strong ciphers** - TLS 1.2 or higher
- **Redirect HTTP to HTTPS** in production

### ❌ DON'T

- **Don't use self-signed certificates** in production
- **Don't commit certificate files** to version control
- **Don't use weak encryption** (SSL 3.0, TLS 1.0)
- **Don't share private keys**
- **Don't forget to renew** certificates before expiration
- **Don't run as root** unless necessary (port 443)

## Troubleshooting

### Issue: "SSL certificates not found"

**Error:**
```
⚠️  HTTPS is enabled but SSL certificates not found!
Looking for:
  - Certificate: C:\...\certs\server.crt
  - Key: C:\...\certs\server.key
Run 'npm run generate-certs' to create self-signed certificates
```

**Solution:**
```bash
npm run generate-certs
```

### Issue: "Port 443 requires elevated privileges"

**Error:**
```
Error: listen EACCES: permission denied 0.0.0.0:443
```

**Solutions:**

**Option 1: Use non-privileged port (Development)**
```env
HTTPS_PORT=5443  # Use port > 1024
```

**Option 2: Run with sudo (Not recommended)**
```bash
sudo npm start
```

**Option 3: Use reverse proxy (Recommended for Production)**
- Let Nginx/Apache listen on 443
- Proxy to your app on port 5000

**Option 4: Grant Node.js capability (Linux)**
```bash
sudo setcap 'cap_net_bind_service=+ep' $(which node)
npm start  # Now can bind to port 443 without sudo
```

### Issue: "OpenSSL not found"

**Error:**
```
❌ OpenSSL is not installed or not in PATH
```

**Solutions:**

**Windows:**
- Download from: https://slproweb.com/products/Win32OpenSSL.html
- Or use Git Bash (includes OpenSSL)

**macOS:**
- OpenSSL is pre-installed
- If missing: `brew install openssl`

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install openssl

# CentOS/RHEL
sudo yum install openssl
```

### Issue: Browser shows "NET::ERR_CERT_AUTHORITY_INVALID"

This is normal for self-signed certificates in development.

**For Development:**
- Click "Advanced" → "Proceed to localhost"
- Or use curl with `-k` flag: `curl -k https://localhost:5443`

**For Production:**
- Use Let's Encrypt or purchased certificate
- Browser will trust automatically

### Issue: "EADDRINUSE - Port already in use"

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5443
```

**Solution:**

**Windows:**
```powershell
# Find process using port
netstat -ano | findstr :5443

# Kill process (replace PID)
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
# Find and kill process
lsof -ti:5443 | xargs kill -9
```

## Frontend Integration

Update your frontend API configuration:

### Development (Self-Signed)

**Option 1: Use HTTP**
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
```

**Option 2: Use HTTPS (with certificate warning)**
```javascript
const API_BASE_URL = 'https://localhost:5443/api';
```

### Production

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.yourdomain.com/api';
```

**Environment variables:**
```env
# .env.development
REACT_APP_API_URL=http://localhost:5000/api

# .env.production
REACT_APP_API_URL=https://api.yourdomain.com/api
```

## Additional Resources

- [Let's Encrypt](https://letsencrypt.org/) - Free SSL certificates
- [SSL Labs Test](https://www.ssllabs.com/ssltest/) - Test your SSL configuration
- [Certbot](https://certbot.eff.org/) - Let's Encrypt client
- [MDN: HTTPS](https://developer.mozilla.org/en-US/docs/Glossary/HTTPS)
- [Node.js HTTPS Module](https://nodejs.org/api/https.html)

## Summary

| Environment | Recommended Approach |
|-------------|---------------------|
| **Development** | Self-signed certificates (`npm run generate-certs`) |
| **Staging** | Let's Encrypt certificates |
| **Production** | Reverse proxy (Nginx) + Let's Encrypt |
| **Cloud** | Platform-managed SSL (Heroku, AWS, etc.) |

---

**Need help?** Check the full documentation in `ENVIRONMENT_SETUP.md`

