# SEO Configuration Usage Examples

This guide shows how to use the SEO utilities created for page-specific SEO optimization.

## Basic Page SEO Setup

Here's how to add SEO to individual pages using the utilities:

### Example 1: Services Page

```tsx
// apps/web/src/routes/_marketing/services.tsx
import { createFileRoute } from '@tanstack/react-router';
import { generateSEOConfig, generateStructuredData } from '@/utils/seo';

export const Route = createFileRoute('/_marketing/services')({
  component: ServicesPage,
  head: () => {
    const seoConfig = generateSEOConfig('services');
    const structuredData = generateStructuredData('Service');

    return {
      meta: [
        {
          title: seoConfig.title,
        },
        {
          name: 'description',
          content: seoConfig.description,
        },
        {
          name: 'keywords',
          content: seoConfig.keywords?.join(', '),
        },
        {
          property: 'og:title',
          content: seoConfig.ogTitle,
        },
        {
          property: 'og:description',
          content: seoConfig.ogDescription,
        },
        {
          property: 'og:url',
          content: seoConfig.canonical,
        },
      ],
      links: [
        {
          rel: 'canonical',
          href: seoConfig.canonical,
        },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify(structuredData),
        },
      ],
    };
  },
});
```

### Example 2: Fleet Page with Custom SEO

```tsx
// apps/web/src/routes/_marketing/fleet.tsx
import { createFileRoute } from '@tanstack/react-router';
import { generateSEOConfig } from '@/utils/seo';

export const Route = createFileRoute('/_marketing/fleet')({
  component: FleetPage,
  head: () => {
    const customSEO = generateSEOConfig('fleet', {
      title: 'Premium Luxury Fleet - Mercedes, BMW, Audi | Down Under Chauffeurs',
      description: 'Browse our premium fleet of luxury vehicles including Mercedes S-Class, BMW 7 Series, and Audi A8. Professional chauffeur service with top-tier vehicles.',
      keywords: ['luxury fleet', 'Mercedes chauffeur', 'BMW rental', 'Audi hire', 'premium vehicles Australia'],
    });

    return {
      meta: [
        {
          title: customSEO.title,
        },
        {
          name: 'description',
          content: customSEO.description,
        },
        // ... other meta tags
      ],
    };
  },
});
```

## Current SEO Status

### ✅ Completed Features:

1. **robots.txt** - Properly configured with sitemap reference
2. **sitemap.xml** - All main pages included with priorities
3. **site.webmanifest** - PWA manifest for mobile "Add to Home Screen"
4. **browserconfig.xml** - Microsoft browser tiles configuration
5. **Comprehensive Meta Tags** - Title, description, keywords, Open Graph, Twitter Cards
6. **Performance Optimizations** - Preconnect and DNS prefetch for external resources
7. **SEO Utilities** - Helper functions for page-specific SEO

### 📋 Page-Specific SEO Configurations Available:

- **Home** (`/`) - Main landing page optimization
- **Services** (`/services`) - Service-focused keywords
- **Fleet** (`/fleet`) - Vehicle and luxury car keywords
- **Calculate Quote** (`/calculate-quote`) - Pricing and quote-related terms
- **Contact** (`/contact-us`) - Contact and booking keywords
- **About** (`/about`) - Company and brand keywords

### 🎯 SEO Features Included:

- **Title Tag Optimization** - Descriptive, keyword-rich titles
- **Meta Descriptions** - Compelling descriptions under 160 characters
- **Keywords Meta Tags** - Relevant keyword targeting
- **Open Graph Tags** - Social media sharing optimization
- **Twitter Card Tags** - Twitter-specific sharing optimization
- **Canonical URLs** - Prevent duplicate content issues
- **Structured Data** - Schema.org markup for search engines
- **Mobile Optimization** - Responsive design meta tags
- **Performance** - Preconnect and DNS prefetch optimizations

### 🔧 Technical SEO Improvements:

1. **Favicon Configuration** - Multiple formats for browser compatibility
2. **Theme Colors** - Consistent branding across devices
3. **Apple Touch Icons** - iOS home screen optimization
4. **Windows Tiles** - Microsoft browser integration
5. **Web App Manifest** - PWA capabilities

### 📱 Mobile & PWA Features:

- **Apple Mobile Web App** - iOS optimization
- **Theme Color** - Brand color for mobile browsers
- **Viewport Configuration** - Proper mobile scaling
- **Web App Manifest** - "Add to Home Screen" functionality

## Next Steps

1. **Generate Missing Favicon Files** - Follow instructions in FAVICON-INSTRUCTIONS.md
2. **Apply Page-Specific SEO** - Use examples above for individual pages
3. **Update Business Information** - Add real contact details in SEO config
4. **Test SEO** - Use Google Search Console and other SEO tools
5. **Monitor Performance** - Track search rankings and traffic

## Testing Your SEO

### Tools to verify SEO implementation:

1. **Google Search Console** - Submit sitemap and monitor indexing
2. **Facebook Debugger** - Test Open Graph tags
3. **Twitter Card Validator** - Test Twitter sharing
4. **Google PageSpeed Insights** - Performance and SEO audit
5. **SEMrush or Ahrefs** - Comprehensive SEO analysis

### Quick Checks:

```bash
# Check robots.txt
curl https://yourdomain.com/robots.txt

# Check sitemap
curl https://yourdomain.com/sitemap.xml

# Check web manifest
curl https://yourdomain.com/site.webmanifest
```