# HTTPS Support Added to server-cpanel.js

## Summary

HTTPS functionality has been added to `server-cpanel.js` with flexibility for both standard cPanel SSL and advanced direct HTTPS configurations.

## What Was Added

### Updated server-cpanel.js

**New Features:**
- ✅ Dual HTTP/HTTPS server support
- ✅ Automatic SSL certificate loading
- ✅ Environment-based HTTPS configuration
- ✅ Graceful fallback if certificates missing
- ✅ Detailed logging and warnings
- ✅ Error handling for SSL issues

**Key Components:**
```javascript
const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// HTTP server (always runs)
http.createServer(app).listen(PORT, '0.0.0.0');

// HTTPS server (conditional - based on USE_HTTPS)
if (USE_HTTPS) {
  https.createServer(httpsOptions, app).listen(HTTPS_PORT, '0.0.0.0');
}
```

## Configuration

### Default Setup (Recommended for cPanel)

**Leave HTTPS disabled:**
```env
# Don't set USE_HTTPS or set to false
NODE_ENV=production
DB_HOST=localhost
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
```

**Why?**
- cPanel handles SSL via Apache/nginx reverse proxy
- No SSL certificates needed in your app
- Automatic certificate management
- Easier to maintain

**Console Output:**
```
HTTP Server is running on port 12345
ℹ️  HTTPS is disabled (recommended for cPanel)
   cPanel handles SSL via reverse proxy at Apache/nginx level
```

### Direct HTTPS Setup (Advanced)

**Enable HTTPS:**
```env
NODE_ENV=production
USE_HTTPS=true
HTTPS_PORT=5443
SSL_CERT_PATH=/home/username/family-expenses-api/certs/certificate.crt
SSL_KEY_PATH=/home/username/family-expenses-api/certs/private.key
DB_HOST=localhost
DB_NAME=your_database
DB_USER=your_user
DB_PASSWORD=your_password
```

**Console Output:**
```
HTTP Server is running on port 12345
HTTPS Server is running on port 5443
SSL Certificate: /home/username/family-expenses-api/certs/certificate.crt
⚠️  Note: cPanel usually handles SSL via reverse proxy.
   Make sure this configuration doesn't conflict with cPanel's SSL setup.
```

## When to Use Each Option

### Option 1: cPanel SSL (Default - 95% of cases)

**Use When:**
- You're on shared hosting
- You want simple setup
- You want automatic certificate renewal
- You're using standard cPanel

**Pros:**
- ✅ Zero configuration in Node.js
- ✅ Automatic certificate management
- ✅ Free Let's Encrypt certificates
- ✅ Works with subdomains automatically
- ✅ Managed by cPanel

**Cons:**
- ❌ Less control over SSL configuration
- ❌ Tied to cPanel's SSL system

**Setup:**
1. Install AutoSSL in cPanel → SSL/TLS Status
2. Don't set USE_HTTPS environment variable
3. Access via https://yourdomain.com
4. Done!

### Option 2: Direct HTTPS (5% of cases)

**Use When:**
- VPS/dedicated server with full control
- Hosting provider requires it
- Need custom SSL configuration
- cPanel reverse proxy issues

**Pros:**
- ✅ Full control over SSL configuration
- ✅ Custom certificate options
- ✅ Direct SSL termination

**Cons:**
- ❌ Manual certificate management
- ❌ More complex configuration
- ❌ Need to handle renewals
- ❌ Potential port conflicts

**Setup:**
1. Upload SSL certificates to app folder
2. Set USE_HTTPS=true
3. Configure certificate paths
4. Ensure HTTPS port is accessible
5. Manage certificate renewals

## Environment Variables

### New Variables for HTTPS

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `USE_HTTPS` | Boolean | `false` | Enable direct HTTPS support |
| `HTTPS_PORT` | Number | `5443` | Port for HTTPS server |
| `SSL_CERT_PATH` | String | `./certs/server.crt` | SSL certificate file path |
| `SSL_KEY_PATH` | String | `./certs/server.key` | SSL private key file path |

### Complete Environment Variables List

**Minimal (Recommended):**
```env
NODE_ENV=production
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cpanelusername_family_expenses
DB_USER=cpanelusername_appuser
DB_PASSWORD=your_password
```

**With Direct HTTPS (Advanced):**
```env
NODE_ENV=production
USE_HTTPS=true
HTTPS_PORT=5443
SSL_CERT_PATH=/home/username/family-expenses-api/certs/certificate.crt
SSL_KEY_PATH=/home/username/family-expenses-api/certs/private.key
DB_HOST=localhost
DB_PORT=3306
DB_NAME=cpanelusername_family_expenses
DB_USER=cpanelusername_appuser
DB_PASSWORD=your_password
```

## Testing

### Test Default Setup (cPanel SSL)

```bash
# HTTP internally, HTTPS externally via cPanel
curl https://yourdomain.com/api/health

# Response:
{
  "status": "OK",
  "message": "Server is running",
  "protocol": "https",  # Terminated by Apache/nginx
  "secure": true,
  "host": "yourdomain.com"
}
```

### Test Direct HTTPS

```bash
# Test HTTP
curl http://yourdomain.com:12345/api/health

# Test HTTPS
curl https://yourdomain.com:5443/api/health

# Both should work
```

## Documentation Files

### Quick Reference
- **`CPANEL_CHECKLIST.md`** - Quick deployment checklist
- **`CPANEL_QUICK_FIX.md`** - Troubleshooting ERR_CONNECTION_REFUSED
- **`HTTPS_CPANEL_GUIDE.md`** - Complete HTTPS configuration guide

### Detailed Guides
- **`CPANEL_DEPLOYMENT_GUIDE.md`** - Full cPanel deployment documentation
- **`HTTPS_SETUP_GUIDE.md`** - Local development HTTPS
- **`ENVIRONMENT_SETUP.md`** - All environment variables

## Security Considerations

### With cPanel SSL (Default)

**Secure by default:**
- SSL certificates managed by cPanel
- Automatic renewal (Let's Encrypt)
- No certificates stored in app code
- Standard security practices

### With Direct HTTPS

**Additional security requirements:**

1. **File Permissions:**
   ```bash
   chmod 600 ~/family-expenses-api/certs/private.key
   chmod 644 ~/family-expenses-api/certs/certificate.crt
   ```

2. **Certificate Security:**
   - Never commit certificates to Git (already in .gitignore)
   - Store outside public_html if possible
   - Use strong file permissions
   - Rotate certificates before expiration

3. **Monitoring:**
   - Set up certificate expiration alerts
   - Monitor SSL Labs rating
   - Check logs for SSL errors

## Migration Path

### From HTTP to cPanel SSL

**Currently using HTTP:**
```env
# No SSL configuration
```

**Enable cPanel SSL:**
1. Go to cPanel → SSL/TLS Status
2. Click "Run AutoSSL"
3. Wait for completion
4. Test: https://yourdomain.com/api/health
5. Update frontend to use HTTPS URL

**No Node.js app changes needed!**

### From cPanel SSL to Direct HTTPS

**Currently using cPanel SSL:**
```env
# No SSL in Node.js
USE_HTTPS not set
```

**Enable Direct HTTPS:**
1. Obtain SSL certificates
2. Upload to `~/family-expenses-api/certs/`
3. Set environment variables:
   ```env
   USE_HTTPS=true
   HTTPS_PORT=5443
   SSL_CERT_PATH=/home/username/family-expenses-api/certs/certificate.crt
   SSL_KEY_PATH=/home/username/family-expenses-api/certs/private.key
   ```
4. Restart Node.js app in cPanel
5. Update Application URL to include port (if needed)
6. Test both HTTP and HTTPS ports

## Troubleshooting HTTPS

### Issue: "Failed to start HTTPS server: ENOENT"

**Error:** Certificate files not found

**Solution:**
```bash
# Check if files exist
ls -la ~/family-expenses-api/certs/

# Verify paths in environment variables match actual file locations
```

### Issue: "Failed to start HTTPS server: EACCES"

**Error:** Permission denied reading certificates

**Solution:**
```bash
# Fix file permissions
chmod 644 ~/family-expenses-api/certs/certificate.crt
chmod 600 ~/family-expenses-api/certs/private.key

# Ensure app user can read the files
```

### Issue: HTTPS Port Not Accessible

**Error:** Can connect internally but not externally

**Solution:**
1. Contact hosting provider to open HTTPS port
2. Use standard port 443 (may require root)
3. Or revert to cPanel SSL (easier)

### Issue: Certificate Errors in Browser

**With self-signed certificates:**
- Normal for development
- Click "Advanced" → "Proceed"
- Not suitable for production

**With purchased/Let's Encrypt certificates:**
- Check certificate matches domain exactly
- Verify certificate chain is complete
- Test on SSL Labs: https://www.ssllabs.com/ssltest/

## Best Practices

### ✅ Recommended Approach

**For 95% of cPanel users:**
1. Use cPanel's AutoSSL (Let's Encrypt)
2. Don't enable HTTPS in Node.js (USE_HTTPS=false)
3. Let cPanel handle all SSL/TLS
4. Focus on your application logic

**Benefits:**
- Simpler deployment
- Automatic certificate renewal
- Better security isolation
- Standard cPanel workflow
- Less maintenance

### ⚠️ Advanced Approach

**Only if you have specific needs:**
1. Enable USE_HTTPS=true
2. Manage certificates manually
3. Handle renewals yourself
4. Configure firewall rules

**When needed:**
- VPS/dedicated server
- Custom SSL requirements
- Compliance requirements
- Provider-specific setup

## Quick Decision Flowchart

```
Are you on shared cPanel hosting?
├─ YES → Use cPanel SSL (don't enable USE_HTTPS)
└─ NO → Are you on VPS/dedicated?
    ├─ YES → Direct HTTPS might be useful
    └─ NO → Use cPanel SSL

Does your hosting provider require direct HTTPS?
├─ YES → Enable USE_HTTPS=true
└─ NO → Use cPanel SSL (simpler)

Do you have specific SSL compliance requirements?
├─ YES → Consider direct HTTPS
└─ NO → Use cPanel SSL
```

**90% answer:** Use cPanel SSL, don't enable USE_HTTPS

## Files Modified/Created

### Modified
1. ✅ `server-cpanel.js` - Added HTTPS support
2. ✅ `CPANEL_CHECKLIST.md` - Added HTTPS environment variables
3. ✅ `CPANEL_QUICK_FIX.md` - Added HTTPS troubleshooting
4. ✅ `README.md` - Added cPanel HTTPS documentation link

### Created
1. ✅ `HTTPS_CPANEL_GUIDE.md` - Complete HTTPS configuration guide
2. ✅ `CPANEL_HTTPS_SUMMARY.md` - This file (summary)

## Summary

✅ **HTTPS functionality added to server-cpanel.js**

**Features:**
- Dual HTTP/HTTPS server support
- Environment-based configuration
- Automatic certificate loading
- Graceful error handling
- Compatible with cPanel's SSL
- Detailed logging and warnings

**Default behavior:**
- HTTP only (cPanel handles SSL externally)
- Simple, recommended configuration
- Zero SSL management needed

**Optional behavior:**
- Enable USE_HTTPS=true for direct HTTPS
- Manage your own SSL certificates
- Full control over SSL configuration

**Recommendation:**
- Use cPanel SSL for simplicity (default)
- Only enable direct HTTPS if specifically needed

---

**Next Steps:**
1. Review `CPANEL_CHECKLIST.md` for deployment
2. Read `HTTPS_CPANEL_GUIDE.md` if you need HTTPS
3. Test your API deployment

Your API now supports HTTPS on cPanel with flexible configuration! 🚀

