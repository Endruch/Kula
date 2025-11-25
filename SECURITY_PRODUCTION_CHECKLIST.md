# 🔐 KULA - Чеклист безопасности для продакшена

> **Статус**: В разработке (localhost)  
> **Дата создания**: 25 ноября 2024  
> **Цель**: Подготовить приложение к безопасному запуску на AWS

---

## ✅ Что уже сделано (localhost)

### Backend:
- [x] JWT токены (access + refresh)
- [x] Валидация входных данных (email, password, username)
- [x] Санитизация от XSS атак
- [x] bcrypt с 12 rounds
- [x] Rate limiting (общий + auth)
- [x] Helmet.js (HTTP заголовки)
- [x] CORS настроен
- [x] .env удалён из Git
- [x] Timing-attack protection
- [x] Refresh token механизм

### Mobile:
- [x] Хранение токенов в AsyncStorage
- [x] Автоматическое обновление токенов
- [x] Interceptor для 401 ошибок
- [x] Обработка истечения токенов

---

## 🚨 КРИТИЧНО для продакшена

### 1. HTTPS/SSL сертификаты ⭐⭐⭐
**Почему критично**: Без HTTPS токены передаются в открытом виде!

**Что делать**:
```bash
# На AWS EC2 установить Nginx с SSL
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Получить SSL сертификат (Let's Encrypt)
sudo certbot --nginx -d api.kula.app -d www.api.kula.app

# Автообновление сертификата
sudo certbot renew --dry-run
```

**Конфиг Nginx** (`/etc/nginx/sites-available/kula`):
```nginx
server {
    listen 443 ssl http2;
    server_name api.kula.app;

    ssl_certificate /etc/letsencrypt/live/api.kula.app/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.kula.app/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3000;
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

# Редирект HTTP -> HTTPS
server {
    listen 80;
    server_name api.kula.app;
    return 301 https://$server_name$request_uri;
}
```

**Проверка**:
```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

### 2. Secrets в AWS Secrets Manager ⭐⭐⭐
**Почему критично**: .env файл может утечь!

**Что делать**:
```bash
# Установить AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Настроить credentials
aws configure
```

**Создать секреты**:
```bash
# JWT Secret
aws secretsmanager create-secret \
    --name kula/prod/jwt-secret \
    --description "KULA Production JWT Secret" \
    --secret-string "ГЕНЕРИРУЙ_НОВЫЙ_СУПЕР_ДЛИННЫЙ_СЕКРЕТ_64_СИМВОЛА_МИНИМУМ"

# JWT Refresh Secret
aws secretsmanager create-secret \
    --name kula/prod/jwt-refresh-secret \
    --secret-string "ГЕНЕРИРУЙ_ДРУГОЙ_СУПЕР_ДЛИННЫЙ_СЕКРЕТ_64_СИМВОЛА"

# Database URL
aws secretsmanager create-secret \
    --name kula/prod/database-url \
    --secret-string "postgresql://username:password@kula-db.xxxxx.rds.amazonaws.com:5432/kula_prod"
```

**Обновить backend/server.js**:
```javascript
// В начале файла
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'us-east-1' });

async function getSecret(secretName) {
  const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();
  return data.SecretString;
}

// При запуске сервера
(async () => {
  process.env.JWT_SECRET = await getSecret('kula/prod/jwt-secret');
  process.env.JWT_REFRESH_SECRET = await getSecret('kula/prod/jwt-refresh-secret');
  process.env.DATABASE_URL = await getSecret('kula/prod/database-url');
  
  // Запустить сервер
  app.listen(PORT, () => {
    console.log('Server started with secrets from AWS');
  });
})();
```

**Установить пакет**:
```bash
npm install aws-sdk
```

---

### 3. PostgreSQL на AWS RDS ⭐⭐⭐
**Почему критично**: localhost БД исчезнет после деплоя!

**Что делать на AWS Console**:
1. Перейти в RDS
2. Create Database
3. Выбрать PostgreSQL 15+
4. **Production template** (НЕ Free Tier!)
5. Настройки:
   - DB Instance: `kula-prod-db`
   - Master username: `kulaadmin`
   - Master password: **СГЕНЕРИРУЙ СЛОЖНЫЙ** (30+ символов)
   - DB instance class: `db.t3.micro` (для старта)
   - Storage: 20 GB (auto-scaling enabled)
   - **Multi-AZ deployment**: YES (для надёжности)
   - VPC: Default
   - Public access: **NO** (только из EC2!)
   - VPC Security Group: Создать новый `kula-db-sg`

**Security Group настройки**:
```
Inbound Rules:
Type: PostgreSQL
Protocol: TCP
Port: 5432
Source: <Security Group вашего EC2 инстанса>
```

**Миграция данных**:
```bash
# На localhost сделать бэкап
pg_dump mysterymeet > kula_backup.sql

# Залить на AWS RDS
psql -h kula-db.xxxxx.rds.amazonaws.com -U kulaadmin -d kula_prod < kula_backup.sql
```

**Обновить .env**:
```bash
DATABASE_URL="postgresql://kulaadmin:PASSWORD@kula-db.xxxxx.rds.amazonaws.com:5432/kula_prod"
```

---

### 4. AWS S3 для видео ⭐⭐
**Почему нужно**: Видео не должны храниться на сервере!

**Что делать**:
```bash
# Создать bucket
aws s3api create-bucket \
    --bucket kula-videos-prod \
    --region us-east-1

# Настроить CORS
aws s3api put-bucket-cors \
    --bucket kula-videos-prod \
    --cors-configuration file://s3-cors.json
```

**s3-cors.json**:
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://kula.app", "https://www.kula.app"],
      "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

**Создать IAM роль для EC2**:
```bash
# Политика для S3 доступа
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::kula-videos-prod/*"
    }
  ]
}
```

**Обновить backend/services/s3.js**:
```javascript
const AWS = require('aws-sdk');
const s3 = new AWS.S3({ region: 'us-east-1' });

const uploadVideo = async (file, eventId) => {
  const key = `videos/${eventId}/${Date.now()}-${file.name}`;
  
  await s3.putObject({
    Bucket: 'kula-videos-prod',
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read', // или private + CloudFront
  }).promise();

  return `https://kula-videos-prod.s3.amazonaws.com/${key}`;
};
```

---

### 5. Cloudflare для CDN + защита ⭐⭐
**Почему нужно**: Ускорение видео + защита от DDoS!

**Что делать**:
1. Зарегистрировать домен `kula.app` на Cloudflare
2. Настроить DNS:
   ```
   A     @              <IP вашего EC2>        Proxied ON
   A     www            <IP вашего EC2>        Proxied ON
   CNAME api            api.kula.app           Proxied ON
   CNAME videos         kula-videos-prod.s3... Proxied ON
   ```
3. Включить:
   - SSL/TLS: **Full (strict)**
   - Firewall: Block bad bots
   - Rate Limiting: 100 req/min per IP
   - WAF (Web Application Firewall)
   - DDoS Protection (Auto)

**Правила Firewall**:
```
Rate Limiting:
- /api/auth/login: 5 req / 15 min per IP
- /api/auth/register: 3 req / 15 min per IP
- /api/*: 100 req / min per IP

Challenge:
- Known bot user-agents
- Suspicious IPs from threat intelligence
```

---

## ⚠️ ВАЖНО, но не критично

### 6. Email верификация 📧
**Когда**: После базового запуска

**Что делать**:
```bash
# Использовать AWS SES (Simple Email Service)
npm install nodemailer aws-sdk
```

**backend/services/email.js**:
```javascript
const nodemailer = require('nodemailer');
const AWS = require('aws-sdk');

const ses = new AWS.SES({ region: 'us-east-1' });

const transporter = nodemailer.createTransport({
  SES: { ses, aws: AWS },
});

const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `https://kula.app/verify?token=${token}`;
  
  await transporter.sendMail({
    from: 'noreply@kula.app',
    to: email,
    subject: 'Подтвердите email - KULA',
    html: `
      <h1>Добро пожаловать в KULA!</h1>
      <p>Нажмите на ссылку для подтверждения:</p>
      <a href="${verificationUrl}">Подтвердить email</a>
    `,
  });
};
```

**Обновить backend/routes/auth.js**:
```javascript
// После регистрации
const verificationToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '24h' });
await sendVerificationEmail(email, verificationToken);

// Новый endpoint
router.post('/verify', async (req, res) => {
  const { token } = req.body;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  
  await prisma.user.update({
    where: { email: decoded.email },
    data: { emailVerified: true },
  });
  
  res.json({ message: 'Email verified' });
});
```

**Обновить Prisma schema**:
```prisma
model User {
  // ...
  emailVerified Boolean @default(false)
}
```

---

### 7. 2FA (Two-Factor Authentication) 🔐
**Когда**: Для PREMIUM/BUSINESS аккаунтов

**Что делать**:
```bash
npm install speakeasy qrcode
```

**backend/routes/auth.js**:
```javascript
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Включить 2FA
router.post('/2fa/enable', authenticate, async (req, res) => {
  const secret = speakeasy.generateSecret({
    name: `KULA (${req.user.email})`,
  });

  await prisma.user.update({
    where: { id: req.user.id },
    data: { twoFactorSecret: secret.base32 },
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url);
  res.json({ qrCode });
});

// Проверить 2FA при логине
router.post('/2fa/verify', async (req, res) => {
  const { token, userId } = req.body;
  const user = await prisma.user.findUnique({ where: { id: userId } });

  const verified = speakeasy.totp.verify({
    secret: user.twoFactorSecret,
    encoding: 'base32',
    token,
  });

  if (!verified) {
    return res.status(401).json({ error: 'Invalid 2FA code' });
  }

  // Выдать токены
  // ...
});
```

---

### 8. Логирование и мониторинг 📊
**Когда**: Сразу после запуска

**Что делать**:
```bash
npm install winston morgan
```

**backend/services/logger.js**:
```javascript
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

module.exports = logger;
```

**Использование**:
```javascript
const logger = require('./services/logger');

// Логировать каждый запрос
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`, {
    ip: req.ip,
    userAgent: req.get('user-agent'),
  });
  next();
});

// Логировать ошибки
app.use((err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    url: req.url,
  });
  res.status(500).json({ error: 'Internal server error' });
});
```

**AWS CloudWatch**:
```bash
# Установить CloudWatch agent на EC2
wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# Настроить логи
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -s \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json
```

---

### 9. Система банов (автоматическая) 🚫
**Когда**: После запуска

**backend/middleware/checkBan.js**:
```javascript
const checkBan = async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
  });

  if (user.isBanned) {
    return res.status(403).json({
      error: 'Ваш аккаунт заблокирован',
      reason: user.banReason,
      until: user.banUntil,
    });
  }

  next();
};
```

**Автобан за плохие рейтинги**:
```javascript
// После события - проверить рейтинг
const avgRating = await prisma.rating.aggregate({
  where: { toUserId: userId },
  _avg: { overall: true },
});

if (avgRating._avg.overall < 2.0) {
  // Предупреждение
  await prisma.user.update({
    where: { id: userId },
    data: { warnings: { increment: 1 } },
  });
}

if (user.warnings >= 3) {
  // Временный бан на 7 дней
  await prisma.user.update({
    where: { id: userId },
    data: {
      isBanned: true,
      banReason: 'Низкий рейтинг (< 2.0) после 3 предупреждений',
      banUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
}
```

---

### 10. Push уведомления 🔔
**Когда**: Через месяц после запуска

**Для мобилки**:
```bash
cd /Users/a00/mysterymeet/mobile
npx expo install expo-notifications expo-device expo-constants
```

**mobile/services/notifications.ts**:
```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

export const registerForPushNotifications = async () => {
  if (!Device.isDevice) {
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  return token;
};
```

**Backend с Firebase Cloud Messaging**:
```bash
npm install firebase-admin
```

---

## 🔒 Дополнительные меры безопасности

### 11. Обфускация кода мобилки
```bash
cd mobile
npm install --save-dev babel-plugin-transform-remove-console
```

**babel.config.js**:
```javascript
module.exports = {
  presets: ['babel-preset-expo'],
  plugins: [
    ['transform-remove-console', { exclude: ['error', 'warn'] }],
  ],
};
```

---

### 12. Root Detection
```bash
npx expo install expo-secure-store
npm install react-native-root-detection
```

---

### 13. SSL Pinning
```bash
npm install react-native-ssl-pinning
```

---

### 14. Backup стратегия
**AWS RDS автоматические бэкапы**:
- Retention period: 7 дней
- Backup window: 3:00-4:00 AM UTC

**Manual snapshots**:
```bash
aws rds create-db-snapshot \
    --db-instance-identifier kula-prod-db \
    --db-snapshot-identifier kula-manual-$(date +%Y%m%d)
```

---

## 📋 Чеклист перед запуском

```
Перед деплоем на AWS:
□ Все секреты в AWS Secrets Manager
□ .env файл НЕ в Git
□ SSL сертификат настроен
□ RDS создан и настроен
□ S3 bucket создан
□ Cloudflare настроен
□ Rate limiting работает
□ Логирование настроено
□ Бэкапы автоматизированы
□ Мониторинг CloudWatch
□ Security Groups настроены
□ Firewall rules добавлены

После деплоя:
□ Протестировать регистрацию
□ Протестировать логин
□ Протестировать создание события
□ Протестировать загрузку видео
□ Проверить rate limiting
□ Проверить SSL (https://)
□ Проверить logs в CloudWatch
□ Проверить метрики RDS
```

---

## 🚨 Контакты для экстренных ситуаций

**Если что-то сломалось**:
1. Проверить CloudWatch Logs
2. Проверить RDS metrics
3. Проверить EC2 health
4. Проверить S3 access logs

**Команды для быстрой диагностики**:
```bash
# Логи сервера
tail -f /var/log/kula/error.log

# Статус сервиса
sudo systemctl status kula

# Проверить порты
sudo netstat -tulpn | grep :3000

# CPU/Memory
htop

# Disk space
df -h
```

---

## 💰 Примерная стоимость AWS (для старта)

- EC2 t3.micro: ~$8/месяц
- RDS db.t3.micro: ~$15/месяц
- S3 (100 GB): ~$3/месяц
- CloudWatch: ~$5/месяц
- Secrets Manager: ~$1/месяц
- **ИТОГО**: ~$32/месяц

При росте пользователей:
- EC2 t3.medium: ~$30/месяц
- RDS db.t3.small: ~$30/месяц
- S3 (1 TB): ~$25/месяц
- **ИТОГО**: ~$100/месяц

---

## 📚 Полезные ссылки

- [AWS Security Best Practices](https://docs.aws.amazon.com/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Node.js Security Checklist](https://blog.risingstack.com/node-js-security-checklist/)
- [React Native Security](https://reactnative.dev/docs/security)

---

**Дата последнего обновления**: 25 ноября 2024  
**Статус**: 📝 В разработке