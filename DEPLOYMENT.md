# Deployment Information

## Production URL
🌍 **https://config.autocleaneeg.org**

## Cloudflare Pages Configuration

### Project Name
`autoclean-eeg-config`

### Build Settings
- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Node version:** 20

### Custom Domain Setup
1. Add custom domain in Cloudflare Pages settings
2. Domain: `config.autocleaneeg.org`
3. DNS will be automatically configured if domain is on Cloudflare

### Environment Variables
None required for production build

### Deployment Commands

#### Manual Deploy
```bash
./deploy.sh
```

#### Direct Wrangler Deploy
```bash
npm run build
wrangler pages deploy dist --project-name=autoclean-eeg-config
```

### Post-Deployment Checklist
- [ ] Verify site loads at https://config.autocleaneeg.org
- [ ] Test favicon appears in browser tab
- [ ] Verify all steps in wizard work correctly
- [ ] Test file download functionality
- [ ] Check browser console for errors
- [ ] Verify SSL certificate is active

### Monitoring
- Cloudflare Analytics: Available in dashboard
- Web Analytics: Automatically enabled
- Core Web Vitals: Tracked by Cloudflare