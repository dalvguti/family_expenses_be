# HTTPS Configuration for cPanel Node.js Apps

## Understanding SSL on cPanel

### How cPanel Handles SSL (Default - Recommended)

```
Browser → HTTPS (443) → Apache/nginx (SSL termination) → HTTP → Node.js App (internal port)
```

**Benefits:**
- ✅ cPanel manages SSL certificates automatically (Let's Encrypt)
- ✅ No SSL configuration needed in your Node.js app
- ✅ Certificate renewal is automatic
- ✅ Better security isolation
- ✅ Standard cPanel workflow

**Your app configuration:**
- HTTP only on internal port (what you have now)
- cPanel handles the HTTPS externally
- Users access via HTTPS, app sees HTTP
- **Recommended for 95% of cPanel setups**

### Direct HTTPS in Node.js (Advanced)

```
Browser → HTTPS (custom port) → Node.js App with SSL
```

**When to use:**
- Your hosting provider specifically requires it
- You're on a VPS/dedicated server
- cPanel reverse proxy isn't working
- You need custom SSL configuration

**Your app configuration:**
- Node.js app loads SSL certificates
- App binds to HTTPS port directly
- More complex certificate management

## Configuration Options

### Option 1: Let cPanel Handle SSL (Recommended)

**Environment Variables:**
```env
NODE_ENV=production
DB_HOST=localhost
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password

# DO NOT SET THESE - let cPanel handle it
# USE_HTTPS=false (or don't set)
# No SSL certificate paths needed
```

**In cPanel:**
1. Go to SSL/TLS Status
2. Install AutoSSL (Let's Encrypt) for your domain
3. Your app runs on HTTP internally
4. Users access via HTTPS externally

**Console output:**
```
HTTP Server is running on port 12345
ℹ️  HTTPS is disabled (recommended for cPanel)
   cPanel handles SSL via reverse proxy at Apache/nginx level
```

### Option 2: Direct HTTPS in Node.js (Advanced)

**Step 1: Upload SSL Certificates**

Upload to your app directory:
```
~/family-expenses-api/
  ├── certs/
  │   ├── certificate.crt
  │   └── private.key
```

**Step 2: Set Environment Variables**

In cPanel → Setup Node.js App → Environment variables:
```env
NODE_ENV=production
DB_HOST=localhost
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password

# Enable HTTPS
USE_HTTPS=true
HTTPS_PORT=5443
SSL_CERT_PATH=/home/username/family-expenses-api/certs/certificate.crt
SSL_KEY_PATH=/home/username/family-expenses-api/certs/private.key
```

**Step 3: Configure Application URL**

In cPanel Node.js App:
```
Application URL: yourdomain.com:5443
or
Application URL: api.yourdomain.com:5443
```

**Step 4: Firewall/Port Configuration**

May need to open the HTTPS port (contact hosting support):
```
Port 5443 needs to be open for HTTPS
```

**Console output:**
```
HTTP Server is running on port 12345
HTTPS Server is running on port 5443
SSL Certificate: /home/username/family-expenses-api/certs/certificate.crt
⚠️  Note: cPanel usually handles SSL via reverse proxy.
   Make sure this configuration doesn't conflict with cPanel's SSL setup.
```

## How to Get SSL Certificates

### For cPanel Default Setup (Option 1)

**Let's Encrypt via cPanel:**
1. Go to cPanel → SSL/TLS Status
2. Click "Run AutoSSL"
3. Wait for certificate installation
4. Done! Your site is now HTTPS

**No configuration needed in your Node.js app!**

### For Direct HTTPS (Option 2)

**Option A: Let's Encrypt (via SSH/Terminal)**

```bash
# Install certbot (if not available)
# Contact hosting provider for assistance

# Generate certificate
certbot certonly --standalone -d yourdomain.com

# Copy to your app directory
cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ~/family-expenses-api/certs/certificate.crt
cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ~/family-expenses-api/certs/private.key

# Set environment variables
USE_HTTPS=true
SSL_CERT_PATH=/home/username/family-expenses-api/certs/certificate.crt
SSL_KEY_PATH=/home/username/family-expenses-api/certs/private.key
```

**Option B: Purchase SSL Certificate**

1. Purchase from provider (GoDaddy, Namecheap, etc.)
2. Download certificate and private key
3. Upload to `~/family-expenses-api/certs/`
4. Set environment variables as above

**Option C: Self-Signed (Development Only)**

```bash
# SSH into your server
cd ~/family-expenses-api

# Generate self-signed certificate
npm run generate-certs

# Set environment variables
USE_HTTPS=true
SSL_CERT_PATH=./certs/server.crt
SSL_KEY_PATH=./certs/server.key
```

⚠️ **Warning:** Self-signed certificates will show browser warnings!

## Testing HTTPS Configuration

### Test Option 1 (cPanel SSL - Recommended)

```bash
# Test HTTPS (handled by cPanel)
curl https://yourdomain.com/api/health

# Should return:
{
  "status": "OK",
  "message": "Server is running",
  "protocol": "https",  # Apache/nginx terminated SSL
  "secure": true
}
```

### Test Option 2 (Direct HTTPS)

```bash
# Test HTTP
curl http://yourdomain.com:12345/api/health

# Test HTTPS
curl https://yourdomain.com:5443/api/health

# Both should work
```

## Troubleshooting HTTPS

### Issue: Mixed Content Warnings

**Problem:** Frontend on HTTPS, API on HTTP

**Solution with cPanel SSL (Recommended):**
```javascript
// Frontend api.js
const API_BASE_URL = 'https://yourdomain.com/api';
```

cPanel handles the HTTPS, app runs HTTP internally - no problem!

**Solution with Direct HTTPS:**
```javascript
// Frontend api.js
const API_BASE_URL = 'https://yourdomain.com:5443/api';
```

### Issue: SSL Certificate Errors

**With cPanel SSL:**
- Check SSL/TLS Status in cPanel
- Ensure AutoSSL ran successfully
- Verify domain DNS is correct

**With Direct HTTPS:**
- Verify certificate paths are correct
- Check certificate file permissions (644)
- Check private key permissions (600)
- Ensure certificates aren't expired

```bash
# Check certificate expiration
openssl x509 -in /path/to/certificate.crt -noout -enddate

# Check certificate details
openssl x509 -in /path/to/certificate.crt -noout -text
```

### Issue: HTTPS Server Won't Start

**Check logs in cPanel Node.js App:**

```
⚠️  Failed to start HTTPS server: ENOENT
```
**Solution:** Certificate files not found, check paths

```
⚠️  Failed to start HTTPS server: EACCES
```
**Solution:** Permission denied, fix file permissions

```
⚠️  Failed to start HTTPS server: EADDRINUSE
```
**Solution:** Port already in use, change HTTPS_PORT

### Issue: Port Not Accessible

**Problem:** Can't access HTTPS port from outside

**Solutions:**
1. Contact hosting provider to open port
2. Use cPanel's built-in SSL instead (recommended)
3. Use standard port 443 (requires root/sudo)

## Best Practices

### For Shared Hosting (Most cPanel)

**✅ DO:**
- Use cPanel's AutoSSL (Let's Encrypt)
- Let Apache/nginx handle SSL termination
- Run Node.js app on HTTP internally
- Keep SSL configuration simple

**❌ DON'T:**
- Try to handle SSL in Node.js (unnecessary complexity)
- Use custom HTTPS ports (may be blocked)
- Upload SSL certificates to app folder (not needed)

### For VPS/Dedicated Server

**✅ DO:**
- Consider direct HTTPS if you have full control
- Use proper SSL certificates (not self-signed)
- Set up certificate auto-renewal
- Configure firewall rules properly
- Monitor certificate expiration

**❌ DON'T:**
- Use self-signed certificates in production
- Forget to renew certificates
- Expose unnecessary ports

## Security Recommendations

### File Permissions

If using direct HTTPS:

```bash
# Certificate (readable by all)
chmod 644 ~/family-expenses-api/certs/certificate.crt

# Private key (readable only by owner)
chmod 600 ~/family-expenses-api/certs/private.key

# Directory
chmod 755 ~/family-expenses-api/certs
```

### Certificate Storage

**For cPanel SSL:**
- ✅ Certificates managed by cPanel
- ✅ Automatically renewed
- ✅ Secure storage

**For Direct HTTPS:**
- ✅ Store outside web root if possible
- ✅ Never commit to Git (already in .gitignore)
- ✅ Restrict file permissions
- ✅ Use environment variables for paths

### HTTPS Enforcement

**With cPanel SSL:**
```javascript
// In server-cpanel.js (if needed)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  });
}
```

**With Direct HTTPS:**
```javascript
// Redirect HTTP to HTTPS
app.use((req, res, next) => {
  if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
    return res.redirect('https://' + req.get('host') + req.url);
  }
  next();
});
```

## Quick Decision Guide

**Use cPanel SSL (Option 1) if:**
- ✅ You're on shared hosting
- ✅ You want simple configuration
- ✅ You want automatic renewal
- ✅ You don't need custom SSL setup
- ✅ Standard cPanel hosting (95% of cases)

**Use Direct HTTPS (Option 2) if:**
- ⚠️ Hosting provider requires it
- ⚠️ You're on VPS/dedicated server
- ⚠️ You need custom SSL configuration
- ⚠️ cPanel reverse proxy doesn't work
- ⚠️ You have specific compliance requirements

## Summary

### Current Configuration (Recommended)

**`server-cpanel.js` now supports both:**

```javascript
// Default: HTTP only (cPanel handles SSL)
USE_HTTPS=false or not set

// Advanced: Direct HTTPS
USE_HTTPS=true
HTTPS_PORT=5443
SSL_CERT_PATH=/path/to/cert.crt
SSL_KEY_PATH=/path/to/key.key
```

### Recommendation

**For most cPanel users:**
1. Don't set USE_HTTPS (leave disabled)
2. Install AutoSSL in cPanel
3. Access your API via HTTPS
4. Everything just works!

**For advanced users:**
1. Set USE_HTTPS=true
2. Upload SSL certificates
3. Configure paths
4. Ensure ports are open
5. Monitor and renew certificates

---

**Need help deciding?** Contact your hosting provider and ask:
> "Should I handle SSL in my Node.js application, or does cPanel manage it via reverse proxy?"

Most will say cPanel handles it - use Option 1! 🎉

