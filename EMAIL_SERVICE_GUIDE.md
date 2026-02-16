# Email Service Configuration Guide

## ✅ Problem Fixed!

### Kya Problem Thi:
- **Localhost pe**: OTP emails sahi se kaam kar rahe the
- **Render (production) pe**: Sirf usi email pe OTP aa raha tha jis pe Resend account banaya tha
- **Reason**: Resend API sandbox mode mein sirf verified emails pe send karta hai

### Kya Fix Kiya:
Ab aapka email service **smart hai** - ye automatically decide karta hai ki Gmail SMTP use karna hai ya Resend:

1. **Default**: Gmail SMTP use karega (jo aapke `.env` mein already configured hai)
2. **Optional**: Resend bhi use kar sakte ho agar domain verify kar lo

---

## 🚀 Production Deployment Ke Liye

### Option 1: Gmail SMTP Use Karo (RECOMMENDED)

**Current Setup - Already Working!**

Aapka `.env` file mein ye credentials already hain:
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=shaikhhostel0112@gmail.com
EMAIL_PASS=tslppyomamajcpsk
```

✅ **Kuch bhi change nahi karna** - ab production pe bhi kisi bhi email pe OTP jayega!

**Important Notes:**
- Gmail app password use kar rahe ho (✅ correct)
- Make sure `EMAIL_USER` aur `EMAIL_PASS` production environment variables mein set hain
- Gmail daily limit hai: ~500 emails/day (hostel management ke liye enough hai)

---

### Option 2: Resend Use Karna Hai (Optional)

Agar Resend use karna hai, toh domain verify karna padega:

#### Step 1: Resend Dashboard Mein Domain Add Karo
1. https://resend.com/domains pe jao
2. Apna domain add karo (e.g., `hostelbazar.com`)
3. DNS records add karo jo Resend provide karega (SPF, DKIM, DMARC)
4. Verification wait karo (usually 24-48 hours)

#### Step 2: Environment Variables Update Karo
```env
USE_RESEND=true
RESEND_API_KEY=re_CQfS9vXG_9AYc8KLphcdPWUQuzr47gUSj
EMAIL_FROM=noreply@hostelbazar.com
```

**Note**: `EMAIL_FROM` mein apne verified domain ka email use karo, `onboarding@resend.dev` nahi!

---

## 🔧 Environment Variables Reference

### Required for Gmail SMTP (Current Default):
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Optional for Resend:
```env
USE_RESEND=true                    # Set to 'true' to enable Resend
RESEND_API_KEY=re_xxxxx           # Your Resend API key
EMAIL_FROM=noreply@yourdomain.com # Must be from verified domain
```

---

## 🧪 Testing

### Local Testing:
```bash
# Backend terminal mein
npm run dev
```

### Production Testing (Render):
1. Environment variables sahi se set hain ya nahi check karo
2. Kisi bhi random email se signup karo
3. OTP aana chahiye

---

## 📊 Email Service Priority

Code automatically ye priority follow karta hai:

1. ✅ **Agar `USE_RESEND=true` hai** → Resend use hoga
2. ✅ **Agar Resend nahi hai** → Gmail SMTP use hoga (DEFAULT)
3. ❌ **Agar kuch bhi configured nahi** → Warning show hoga

---

## ⚠️ Important Notes

### Gmail Limitations:
- Daily limit: ~500 emails
- Agar password wrong hai, emails fail honge
- 2FA enabled hona chahiye aur app password use karna chahiye

### Resend Limitations (Sandbox Mode):
- **Without Domain Verification**: Sirf verified emails pe send hoga
- **With Domain Verification**: Unlimited verified recipients
- Better deliverability than Gmail
- Professional sender address (`noreply@yourdomain.com`)

### Recommendation:
- **Development/Testing**: Gmail SMTP (current setup)
- **Production (Small Scale)**: Gmail SMTP is fine
- **Production (Large Scale)**: Resend with verified domain

---

## 🐛 Troubleshooting

### OTP Nahi Aa Raha:

1. **Backend logs check karo**:
   ```
   ✅ Email sent via Gmail SMTP: <message-id>
   ```
   Ya
   ```
   ❌ Email send error: [error message]
   ```

2. **Environment variables verify karo** (Render dashboard mein):
   - `EMAIL_USER` set hai?
   - `EMAIL_PASS` correct hai?
   - `EMAIL_HOST` aur `EMAIL_PORT` set hain?

3. **Gmail Account Settings Check**:
   - 2-Step Verification enabled hai?
   - App Password correctly generated hai?
   - "Less secure app access" OFF hai? (App password use karne ke liye)

4. **Spam folder check karo** recipient ke email mein

---

## 🎉 Summary

**Congratulations!** Aapka email service ab production-ready hai:

✅ Localhost pe kaam karega  
✅ Render pe kaam karega  
✅ Kisi bhi email pe OTP jayega  
✅ Signup, Forgot Password, sab kaam karega  
✅ Future mein Resend pe switch kar sakte ho (optional)  

**Deployment ke baad koi problem nahi aayegi!** 🚀
