# Drug Effects Tracker

A comprehensive drug effects tracking application that helps doctors and patients monitor medication side effects, detect drug interactions, and provide real-time analytics for improved patient care.

## Features

### For Patients
- **Prescription Management**: View active prescriptions assigned by doctors
- **Side Effect Reporting**: Report and track medication side effects with detailed descriptions
- **AI-Powered Analysis**: Automatic analysis of reported side effects using LLM technology
- **Real-time Notifications**: Receive alerts for concerning side effects
- **Anonymous Data Contribution**: Contribute to anonymous database for better drug safety insights

### For Doctors
- **Patient Management**: Assign prescriptions to patients
- **Side Effect Monitoring**: Monitor patient-reported side effects in real-time
- **Analytics Dashboard**: Comprehensive analytics on drug effects and interactions
- **Alert System**: Automated alerts for concerning patterns and drug interactions
- **Patient Communication**: Respond to patient concerns and provide guidance

### Analytics & Safety
- **Pattern Detection**: Automatically detect spikes in side effects for specific drugs
- **Drug Interaction Analysis**: Identify previously unknown drug interactions
- **Real-time Monitoring**: Continuous monitoring of drug safety data
- **Anonymous Database**: Centralized, anonymous database of drug effects
- **Predictive Analytics**: Early warning system for potential drug safety issues

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MySQL** database with Sequelize ORM
- **JWT** authentication
- **OpenAI GPT-4** for LLM analysis
- **Socket.io** for real-time notifications
- **Rate limiting** and security middleware

### Frontend
- **React 18** with modern hooks
- **Material-UI (MUI)** for responsive design
- **React Query** for data fetching
- **React Router** for navigation
- **Recharts** for data visualization
- **Socket.io Client** for real-time updates

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd drug-effects-tracker
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your MySQL configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=drug_effects_tracker
   DB_USER=your_mysql_user
   DB_PASSWORD=your_mysql_password

   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key_here
   JWT_EXPIRES_IN=7d

   # OpenAI Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

4. **Database Setup**
   
   **Option A: Local MySQL**
   ```bash
   # Create local MySQL database
   node setup-mysql.js
   ```
   
   **Option B: AWS RDS MySQL**
   ```bash
   # Follow AWS-RDS-SETUP.md guide first
   # Then test AWS RDS connection
   node setup-aws-rds.js
   ```
   
   # The application will automatically create tables on first run

5. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## Usage

### Getting Started

1. **Register an Account**
   - Visit `http://localhost:3000/register`
   - Choose between Doctor or Patient account
   - Fill in required information

2. **Login**
   - Use your credentials to login at `http://localhost:3000/login`

3. **For Doctors**
   - Create prescriptions for patients
   - Monitor side effect reports
   - View analytics dashboard
   - Respond to concerning side effects

4. **For Patients**
   - View your prescriptions
   - Report side effects
   - Track your medication history

### Key Features

#### Side Effect Reporting
- Patients can report side effects with detailed descriptions
- AI analysis provides immediate feedback on concern levels
- Automatic notifications to doctors for concerning reports

#### Analytics Dashboard
- Real-time monitoring of drug safety data
- Pattern detection for unusual side effect spikes
- Drug interaction analysis
- Comprehensive reporting and visualization

#### Real-time Notifications
- Instant alerts for concerning side effects
- Doctor notifications for patient reports
- System-wide alerts for safety issues

## API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Prescriptions
- `GET /api/prescriptions` - Get prescriptions
- `POST /api/prescriptions` - Create prescription (doctors only)
- `PUT /api/prescriptions/:id` - Update prescription
- `PUT /api/prescriptions/:id/deactivate` - Deactivate prescription

### Side Effects
- `GET /api/side-effects` - Get side effects
- `POST /api/side-effects` - Report side effect (patients only)
- `PUT /api/side-effects/:id` - Update side effect
- `PUT /api/side-effects/:id/doctor-response` - Doctor response

### Analytics
- `GET /api/analytics/dashboard` - Get analytics dashboard
- `GET /api/analytics/alerts` - Get analytics alerts
- `POST /api/analytics/analyze` - Run analytics analysis
- `GET /api/analytics/trends` - Get trend data

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for doctors and patients
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive input validation and sanitization
- **Helmet.js**: Security headers
- **CORS Protection**: Cross-origin request protection

## Data Privacy

- **Anonymous Data Collection**: Side effects are stored anonymously for analytics
- **Patient Privacy**: Personal information is protected and encrypted
- **HIPAA Compliance**: Designed with healthcare privacy standards in mind
- **Data Encryption**: Sensitive data is encrypted at rest and in transit

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## MySQL Database Setup

### Quick MySQL Setup

1. **Make sure MySQL is running:**
   ```bash
   # Check if MySQL is running
   mysql --version
   ```

2. **Configure your .env file:**
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=drug_effects_tracker
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   ```

3. **Create the database:**
   ```bash
   node setup-mysql.js
   ```

4. **Start the application:**
   ```bash
   npm run dev
   ```

### Manual MySQL Setup (Alternative)

If you prefer to set up the database manually:

1. **Connect to MySQL:**
   ```bash
   mysql -u root -p
   ```

2. **Create database:**
   ```sql
   CREATE DATABASE drug_effects_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. **Create user (optional):**
   ```sql
   CREATE USER 'drugtracker'@'localhost' IDENTIFIED BY 'your_password';
   GRANT ALL PRIVILEGES ON drug_effects_tracker.* TO 'drugtracker'@'localhost';
   FLUSH PRIVILEGES;
   ```

4. **Update .env with new credentials if using custom user**

## Support

For support, email support@drugeffectstracker.com or create an issue in the repository.

## Roadmap

- [ ] Mobile app development
- [ ] Integration with EHR systems
- [ ] Advanced machine learning models
- [ ] Multi-language support
- [ ] API rate limiting improvements
- [ ] Enhanced security features
- [ ] Real-time chat between doctors and patients
- [ ] Medication adherence tracking
- [ ] Integration with pharmacy systems
