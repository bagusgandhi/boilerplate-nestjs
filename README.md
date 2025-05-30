# Legal Integrated System API

A robust and scalable API system built with NestJS for managing legal documents, business permits, contracts, and related legal processes.

## 🚀 Features

- **Business Permits Management**
  - Create, read, update, and delete business permits
  - Track permit status and progress
  - File uploads and document management
  - Search functionality across titles, permit numbers, and descriptions
  - User-specific permit views

- **Contract Management**
  - Comprehensive contract lifecycle management
  - Contract history tracking
  - Document versioning
  - Status tracking and progress monitoring

- **User Management**
  - Role-based access control
  - User authentication and authorization
  - User-specific views and permissions

- **Document Management**
  - Secure file uploads
  - Document categorization
  - File type validation
  - Document history tracking

## 🛠️ Tech Stack

- **Framework:** NestJS
- **Database:** PostgreSQL with TypeORM
- **Authentication:** JWT (JSON Web Tokens)
- **File Storage:** Local/Cloud Storage
- **API Documentation:** Swagger/OpenAPI

## 📋 Prerequisites

- Node.js (v20.19.1 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn package manager

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/ucoal/lis-api.git
   cd lis-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=legal_system_db

   # JWT
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRATION=24h

   # Server
   PORT=3000
   NODE_ENV=development
   ```

4. **Database Migration**
   ```bash
   npm run migration:run
   # or
   yarn migration:run
   ```

5. **Start the application**
   ```bash
   # Development
   npm run start:dev
   # or
   yarn start:dev

   # Production
   npm run start:prod
   # or
   yarn start:prod
   ```

## 📚 API Documentation

Once the application is running, you can access the API documentation at:
```
http://localhost:3000/api/docs
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer your_jwt_token
```

## 📁 Project Structure

```
src/
├── modules/
│   ├── business_permits/     # Business permits management
│   ├── contract/            # Contract management
│   ├── user/               # User management
│   ├── uploads/           # File upload handling
│   └── step_progress/    # Progress tracking
├── global/               # Global utilities and configurations
├── decorators/         # Custom decorators
└── main.ts            # Application entry point
```

## 🔄 API Endpoints

### Business Permits
- `GET /business-permits` - List all business permits
- `GET /business-permits/:id` - Get specific permit
- `POST /business-permits` - Create new permit
- `PUT /business-permits/:id` - Update permit
- `DELETE /business-permits/:id` - Delete permit
- `POST /business-permits/:id/uploads` - Upload documents

### Contracts
- `GET /contracts` - List all contracts
- `GET /contracts/:id` - Get specific contract
- `POST /contracts` - Create new contract
- `PUT /contracts/:id` - Update contract
- `DELETE /contracts/:id` - Delete contract

### Users
- `GET /users` - List users
- `GET /users/:id` - Get user details
- `POST /users` - Create user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- NestJS team for the amazing framework
- All contributors who have helped shape this project
