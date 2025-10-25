# AWS RDS MySQL Setup Guide

This guide will help you set up AWS RDS MySQL for the Drug Effects Tracker application.

## 🚀 **Step 1: Create AWS RDS MySQL Instance**

### **1.1 Access AWS Console**
1. Go to [AWS Console](https://console.aws.amazon.com)
2. Sign in to your AWS account
3. Navigate to **RDS** service

### **1.2 Create Database**
1. Click **"Create database"**
2. Choose **"Standard create"**
3. Select **"MySQL"** as engine
4. Choose **"MySQL 8.0"** version
5. Select **"Free tier"** (for testing) or **"Production"** (for production)

### **1.3 Database Configuration**
```
DB instance identifier: drug-effects-tracker
Master username: admin (or your preferred username)
Master password: [Create a strong password]
```

### **1.4 Instance Configuration**
```
DB instance class: db.t3.micro (Free tier) or db.t3.small (Production)
Storage type: General Purpose SSD (gp2)
Allocated storage: 20 GB (minimum)
```

### **1.5 Connectivity Settings**
```
VPC: Default VPC
Subnet group: default
Public access: Yes (for development) / No (for production)
VPC security groups: Create new
Security group name: drug-effects-tracker-sg
```

### **1.6 Additional Configuration**
```
Initial database name: drug_effects_tracker
Backup retention: 7 days
Monitoring: Enable enhanced monitoring (optional)
```

## 🔒 **Step 2: Configure Security Groups**

### **2.1 Edit Security Group**
1. Go to **EC2** → **Security Groups**
2. Find your RDS security group
3. Click **"Edit inbound rules"**
4. Add rule:
   ```
   Type: MySQL/Aurora
   Port: 3306
   Source: My IP (for development) or 0.0.0.0/0 (for production)
   ```

## 📝 **Step 3: Update Environment Variables**

### **3.1 Get RDS Endpoint**
1. Go to **RDS** → **Databases**
2. Click on your database instance
3. Copy the **"Endpoint"** (e.g., `drug-effects-tracker.abc123.us-east-1.rds.amazonaws.com`)

### **3.2 Update .env File**
```env
# Database Configuration (AWS RDS MySQL)
DB_HOST=your-rds-endpoint.region.rds.amazonaws.com
DB_PORT=3306
DB_NAME=drug_effects_tracker
DB_USER=admin
DB_PASSWORD=your_rds_password

# AWS RDS Configuration
AWS_REGION=us-east-1
RDS_ENDPOINT=your-rds-endpoint.region.rds.amazonaws.com

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Server Configuration
PORT=5000
NODE_ENV=production
```

## 🛠 **Step 4: Test Connection**

### **4.1 Install Dependencies**
```bash
npm install
```

### **4.2 Test RDS Connection**
```bash
node setup-aws-rds.js
```

### **4.3 Start Application**
```bash
npm run dev
```

## 🔧 **Step 5: Production Considerations**

### **5.1 Security Best Practices**
- Use **private subnets** for production
- Enable **encryption at rest**
- Use **IAM database authentication**
- Regular **backup schedules**

### **5.2 Performance Optimization**
- Choose appropriate **instance class**
- Enable **read replicas** for scaling
- Configure **parameter groups**
- Monitor **CloudWatch metrics**

### **5.3 Cost Optimization**
- Use **Reserved Instances** for long-term usage
- Enable **auto-scaling**
- Monitor **billing alerts**

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Connection Timeout**
   - Check security group rules
   - Verify VPC configuration
   - Ensure public access is enabled

2. **SSL Certificate Issues**
   - The application is configured to handle SSL
   - Check if RDS SSL is enabled

3. **Authentication Failed**
   - Verify username/password
   - Check if user has proper permissions

4. **Database Not Found**
   - Ensure initial database name is set
   - Check if database was created successfully

## 📊 **Monitoring and Maintenance**

### **CloudWatch Metrics**
- CPU utilization
- Database connections
- Free storage space
- Read/Write IOPS

### **Backup and Recovery**
- Automated backups
- Point-in-time recovery
- Manual snapshots

## 💰 **Cost Estimation**

### **Free Tier (12 months)**
- 750 hours of db.t3.micro
- 20 GB of storage
- 20 GB of backup storage

### **Production Costs**
- db.t3.small: ~$25/month
- db.t3.medium: ~$50/month
- Storage: ~$2.30/GB/month

## 🔐 **Security Checklist**

- [ ] Database is in private subnet
- [ ] Security groups restrict access
- [ ] SSL/TLS encryption enabled
- [ ] Regular security updates
- [ ] Access logging enabled
- [ ] Backup encryption enabled
