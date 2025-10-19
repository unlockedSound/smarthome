# Deploying to AWS S3 (and CloudFront) for smarthomes.chorvinsky.com

This guide walks you through hosting the static site in this folder on Amazon S3, with an optional CloudFront distribution for HTTPS and custom domain `smarthomes.chorvinsky.com`.

---

## Option A: S3 Static Website Hosting (fastest to launch)

Good for quick testing. Note: S3 website endpoints are HTTP only. For HTTPS and production, use Option B.

### 1) Create S3 bucket
- Region: your preferred (you can use us-east-1 or any)
- Bucket name: `smarthomes.chorvinsky.com`
- Uncheck "Block all public access" (you will add a read-only policy)

### 2) Enable static website hosting
- Open the bucket → Properties → Static website hosting → "Enable"
- Index document: `index.html`
- Error document: `index.html` (so deep links resolve)
- Save and note the "Bucket website endpoint"

### 3) Add public read policy (if not using CloudFront)
Replace `YOUR_BUCKET_NAME` with `smarthomes.chorvinsky.com`.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::smarthomes.chorvinsky.com/*"
    }
  ]
}
```

### 4) Upload the site files
From the project root (`/Users/key/myproject/smarthomeWebsite`):

```bash
aws s3 sync . s3://smarthomes.chorvinsky.com \
  --exclude ".git/*" \
  --exclude ".DS_Store" \
  --delete \
  --cache-control "max-age=300"
```

Optionally set longer cache for static assets:
```bash
aws s3 cp components/ s3://smarthomes.chorvinsky.com/components/ \
  --recursive --cache-control "max-age=86400"
aws s3 cp loader.js s3://smarthomes.chorvinsky.com/ \
  --cache-control "max-age=86400"
aws s3 cp form-handler.js s3://smarthomes.chorvinsky.com/ \
  --cache-control "max-age=300"
```

Make sure content types are correct (S3 usually detects):
- `.html` → `text/html`
- `.js` → `application/javascript`

### 5) Test
- Open the S3 website endpoint shown in the bucket Properties
- Verify the site loads and the contact form works (EmailJS requires no extra backend)

---

## Option B: S3 + CloudFront + HTTPS + Custom Domain (recommended for production)

Delivers the same content over HTTPS with your domain. Steps use Route 53; if your DNS is elsewhere, create equivalent records there.

### 1) Request an ACM certificate (us-east-1)
- Go to AWS Certificate Manager in `us-east-1`
- Request a public certificate for:
  - `smarthomes.chorvinsky.com`
- Choose DNS validation; add validation CNAME(s) to Route 53 and wait until "Issued"

### 2) Create S3 origin
- Use the same S3 bucket `smarthomes.chorvinsky.com`
- In CloudFront, set the Origin to the S3 Website Endpoint (ends with `.s3-website-<region>.amazonaws.com`), NOT the REST endpoint

### 3) Create CloudFront distribution
- Origin domain: S3 website endpoint for the bucket
- Viewer protocol policy: Redirect HTTP → HTTPS
- Default root object: `index.html`
- Alternate domain name (CNAME): `smarthomes.chorvinsky.com`
- Custom SSL certificate: select the ACM cert you issued
- Caching (suggested):
  - `index.html` — low TTL (e.g., 300s)
  - `components/*`, `loader.js`, images — higher TTL (e.g., 86400s)

Optional: Use an Origin Access Control (OAC) with the S3 REST endpoint instead of website endpoint if you prefer private bucket + CloudFront only. For single-page apps, the website endpoint is simpler because it handles `index.html` by default.

### 4) Route 53 DNS
- Hosted zone: `chorvinsky.com`
- Create an `A` (and AAAA) Alias record pointing `smarthomes.chorvinsky.com` to the CloudFront distribution
- Wait for DNS to propagate

### 5) Upload files to S3
Same commands as in Option A. CloudFront will fetch from S3.

### 6) Invalidation on updates (optional)
After deploying an update, invalidate cached paths so changes appear immediately:
```bash
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/index.html" "/form-handler.js"
```
(You can also invalidate `/*` during early iterations.)

---

## Notes for this project
- The components are fetched via `loader.js` using `fetch(..., { cache: 'no-store' })`, so component updates appear immediately.
- EmailJS works fine from S3/CloudFront with no backend.
- If you later move to a build pipeline, keep `index.html` at the root and ensure all assets paths remain relative.

---

## Troubleshooting
- 403/AccessDenied on S3 website: ensure public read policy (or use CloudFront OAC with private bucket).
- Mixed content warnings: use CloudFront HTTPS URL (not the S3 website HTTP URL) when you go live.
- File not updating: Lower TTLs or run an invalidation; also verify `Cache-Control` headers on uploads.
- MIME type issues: Manually set `--content-type` for any misdetected files via `aws s3 cp ... --content-type ...`.

---

## Prerequisites
- AWS CLI installed and configured: `aws configure`
- Permissions to create S3 buckets, CloudFront distributions, Route53 records, and ACM certs.
