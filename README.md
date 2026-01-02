# PM Internship Prototype

A comprehensive HR management system for internship programs with automated candidate matching, interview scheduling, and selection processes across multiple industry sectors.

## 🚀 Features

### Core Functionality
- **Multi-Sector Support**: 8 industry sectors with dedicated HR departments
- **HR Authentication**: Secure login/register with JWT-like token system
- **Department Isolation**: Each HR can only access their department's data
- **Automated Candidate Matching**: AI-powered scoring based on skills, qualifications, location, and diversity factors
- **Interview Management**: Schedule interviews with auto-generated meeting links
- **Selection Process**: Select/reject candidates with automated email notifications
- **Analytics Dashboard**: Real-time insights on applications, selections, and department performance
- **Export Functionality**: CSV export of selected candidates

### Advanced Features
- **Tie-Break Tests**: Automated test generation for candidates with identical scores
- **Bulk Operations**: Auto-select top candidates, bulk email notifications
- **Past Internships**: Archive completed internships and restore if needed
- **Notification System**: Real-time updates for HR managers
- **Affirmative Action**: Bonus scoring for rural candidates and reserved categories
- **Position Tracking**: Monitor available vs filled positions
- **Application Counter**: Track number of applications per posting
- **Auto-archiving**: Move completed postings to past posts

## 🏗️ Architecture

### Frontend (React + Vite)
- **Framework**: React 18 with Vite build tool
- **Styling**: Tailwind CSS for responsive design
- **State Management**: React hooks and context
- **HTTP Client**: Axios with interceptors
- **Routing**: React Router DOM
- **Charts**: Chart.js for analytics visualization
- **Icons**: Lucide React and React Icons

### Backend (FastAPI + Python)
- **Framework**: FastAPI for high-performance async API
- **Authentication**: JWT-like tokens with Bearer authentication
- **CORS**: Configured for cross-origin requests
- **Data Storage**: In-memory dictionaries with pre-loaded sample data
- **Email Simulation**: Mock email sending functionality
- **File Export**: CSV generation for reports
- **RESTful API**: Clean REST endpoints with proper HTTP methods
- **Data Validation**: Pydantic models for request/response validation
- **Error Handling**: Comprehensive HTTP exception handling

## 📁 Project Structure

```
pm-internship-prototype/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── utils/          # API configuration and utilities
│   │   └── App.jsx         # Main application component
│   ├── public/             # Static assets
│   ├── package.json        # Frontend dependencies
│   └── vite.config.js      # Vite configuration
├── backend/                 # FastAPI backend application
│   ├── main.py             # Main application file
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Docker configuration
├── k8s/                    # Kubernetes deployment files
├── mobile/                 # Mobile app components
└── docker-compose.yml      # Docker compose configuration
```

## 🛠️ Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **Python** (v3.8 or higher)
- **npm** or **yarn**

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
python main.py
```
The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```
The frontend will run on `http://localhost:5173`

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:8000
```

### API Configuration
The frontend API client is configured in `src/utils/api.js`:
- Base URL: `http://localhost:8000` (development)
- Authentication: Bearer token from localStorage
- CORS: Enabled with credentials

## 👥 Pre-configured HR Accounts

The system comes with pre-configured HR users for testing:

| Department | Email | Password | Department ID |
|------------|-------|----------|---------------|
| IT & Software | it.hr@example.com | it12345 | it_software |
| Banking & Finance | bank.hr@example.com | bank12345 | banking_finance |
| FMCG | fmcg.hr@example.com | fmcg12345 | fmcg |
| Oil & Gas | oil.hr@example.com | oil12345 | oil_gas |
| Manufacturing | mfg.hr@example.com | mfg12345 | manufacturing |
| Healthcare | health.hr@example.com | health12345 | healthcare |
| Retail | retail.hr@example.com | retail12345 | retail |
| Hospitality | hospitality.hr@example.com | hosp12345 | hospitality |

### Available Sectors
- `it_software` - IT & Software
- `banking_finance` - Banking & Finance  
- `fmcg` - FMCG
- `oil_gas` - Oil & Gas
- `manufacturing` - Manufacturing
- `healthcare` - Healthcare
- `retail` - Retail
- `hospitality` - Hospitality

## 📊 Sample Data

The system includes pre-populated data:
- **24 sample applicants** per internship posting
- **9 internship positions** across different sectors
- **Realistic candidate profiles** with skills, qualifications, and demographics

## 🔄 API Endpoints

### Authentication
```http
POST /auth/login
Content-Type: application/json

{
  "email": "it.hr@example.com",
  "password": "it12345"
}
```

```http
POST /auth/register
Content-Type: application/json

{
  "email": "new.hr@example.com",
  "password": "password123",
  "name": "HR Manager",
  "department_id": "it_software"
}
```

### Authorization
Include the token in requests using either:
- Header: `Authorization: Bearer <token>`
- Header: `token: <token>`

### Internship Management
- `GET /departments/{dept_id}/posts` - Get active internships
- `GET /departments/{dept_id}/past` - Get past internships
- `POST /departments/{dept_id}/past/{post_id}/restore` - Restore past internship
- `GET /posts/{post_id}` - Get internship details
- `GET /posts/{post_id}/applicants` - Get applicants

### Candidate Management
- `POST /posts/{post_id}/match` - Run candidate matching algorithm
- `POST /posts/{post_id}/select` - Select candidate
- `POST /posts/{post_id}/reject` - Reject candidate
- `POST /posts/{post_id}/auto_select` - Auto-select top candidates
- `GET /applicants/{applicant_id}` - Get applicant profile
- `GET /departments/{dept_id}/selected` - Get selected candidates
- `GET /departments/{dept_id}/rejected` - Get rejected candidates

### Interview & Communication
- `POST /posts/{post_id}/schedule` - Schedule interview
- `GET /posts/{post_id}/meetings` - List scheduled meetings
- `POST /posts/{post_id}/email` - Send email to candidate
- `POST /posts/{post_id}/tiebreak` - Generate tie-break tests
- `POST /posts/{post_id}/tiebreak/send` - Send tie-break test emails
- `POST /posts/{post_id}/send_top_emails` - Send emails to top candidates

### Analytics & Export
- `GET /departments/{dept_id}/analytics` - Get department analytics
- `GET /departments/{dept_id}/selected/export` - Export selected candidates
- `GET /departments/{dept_id}/notifications` - Get notifications

## 🎯 Candidate Scoring Algorithm

The system uses a comprehensive scoring algorithm (max 100 points):

- **Skills Match** (50 points): Overlap with required skills
- **Qualifications** (15 points): Relevant degree/certification
- **Location Preference** (10 points): Matches preferred location
- **Sector Interest** (15 points): Interest in the sector
- **Affirmative Action Bonus** (10 points): Rural background + reserved category
- **Past Participation Penalty** (-5 points): Previous internship participation

## 🚀 Deployment

### Local Development
1. Start backend: `python main.py` (runs on port 8000)
2. Start frontend: `npm run dev` (runs on port 5173)

### Docker Deployment
```bash
docker-compose up -d
```

### Kubernetes Deployment
```bash
kubectl apply -f k8s/
```

### Production Build
Frontend:
```bash
npm run build
```

### API Documentation
Visit `http://localhost:8000/docs` for interactive Swagger documentation.

## 🔒 Security Features

- JWT-based authentication
- CORS protection
- Input validation with Pydantic
- SQL injection prevention (when using databases)
- XSS protection through React

## 💾 Data Storage

Currently uses in-memory storage with the following data structures:
- `HR_USERS` - HR account credentials
- `POSTS` - Active internship postings
- `PAST_POSTS` - Completed internships
- `APPLICANTS` - Application data (24 per posting)
- `SELECTED` - Selected candidates
- `REJECTED` - Rejected candidates
- `MEETINGS` - Scheduled interviews
- `NOTIFICATIONS` - System notifications
- `TIE_TESTS` - Tie-break test links

## 🧪 Testing

### Frontend Testing
```bash
npm test
```

### Backend Testing
```bash
pytest
```

## 📈 Performance

- **Frontend**: Vite for fast development and optimized builds
- **Backend**: FastAPI for high-performance async operations
- **Caching**: Browser caching for static assets
- **Lazy Loading**: Components loaded on demand

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for frontend URL (`http://localhost:5173`)
2. **Port Conflicts**: Backend runs on 8000, frontend on 5173
3. **Dependencies**: Run `npm install` and `pip install -r requirements.txt`
4. **Authentication**: Clear localStorage and login with provided credentials
5. **Server Not Starting**: Check if ports are available and dependencies installed

### Support

For issues and questions:
- Check the console for error messages
- Verify both servers are running on correct ports
- Ensure API endpoints are accessible at `http://localhost:8000`
- Check network connectivity and firewall settings

## 🔮 Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Real email service integration
- Advanced analytics and reporting
- Mobile application
- Multi-language support
- Advanced search and filtering
- Integration with external HR systems
