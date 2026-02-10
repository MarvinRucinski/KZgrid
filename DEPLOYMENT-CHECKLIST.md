# Quick Deployment Checklist

Use this checklist to ensure a smooth deployment of KZgrid.

## Pre-Deployment

- [ ] Supabase project created and configured
- [ ] Database migration run successfully (`00001_initial_schema.sql`)
- [ ] Sample data loaded in database (categories, users, user_categories)
- [ ] Supabase URL and anon key copied
- [ ] Code pushed to GitHub
- [ ] All tests passing locally (`npm run build` and `npm run lint`)

## Vercel Deployment

### First-Time Setup

- [ ] Sign up/login to [Vercel](https://vercel.com)
- [ ] Click "Add New Project"
- [ ] Import `MarvinRucinski/KZgrid` from GitHub
- [ ] Add environment variables:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Click "Deploy"
- [ ] Wait for deployment to complete (2-3 minutes)

### Post-Deployment

- [ ] Visit deployed URL (provided by Vercel)
- [ ] Test grid loads with categories
- [ ] Test cell click opens search modal
- [ ] Test user search returns results
- [ ] Test answer validation (green/red cells)
- [ ] Check browser console for errors
- [ ] Test on mobile device
- [ ] (Optional) Configure custom domain

## Continuous Deployment

Once set up, Vercel will automatically deploy:
- ✅ Every push to `main` branch → Production
- ✅ Every pull request → Preview deployment

## Troubleshooting

If deployment fails:

1. **Check build logs in Vercel dashboard**
   - Look for error messages
   - Verify environment variables are set

2. **Test locally first**
   ```bash
   npm run build
   npm run start
   ```

3. **Verify Supabase connection**
   - Test in Supabase SQL Editor
   - Check API keys are correct
   - Ensure database has data

4. **Clear build cache**
   - In Vercel: Project Settings → Clear Cache
   - Redeploy

## Quick Reference

| Resource | URL |
|----------|-----|
| Vercel Dashboard | https://vercel.com/dashboard |
| Supabase Dashboard | https://supabase.com/dashboard |
| GitHub Repository | https://github.com/MarvinRucinski/KZgrid |
| Deployment Guide | [DEPLOYMENT.md](DEPLOYMENT.md) |
| Setup Guide | [SETUP.md](SETUP.md) |

## Success Criteria

Your deployment is successful when:
- ✅ Application loads without errors
- ✅ Grid displays 3x3 with categories
- ✅ Search functionality works
- ✅ Answer validation works
- ✅ No console errors
- ✅ Mobile responsive

## Next Steps After Deployment

1. Share the deployment URL with team
2. Set up custom domain (optional)
3. Enable Vercel Analytics (optional)
4. Monitor Supabase usage
5. Plan for adding more categories/users

## Support

Need help? Check:
- [DEPLOYMENT.md](DEPLOYMENT.md) - Full deployment guide
- [SETUP.md](SETUP.md) - Setup instructions
- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
