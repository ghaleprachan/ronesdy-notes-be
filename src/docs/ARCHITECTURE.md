# Ronesdy Note Product Backend Architecture Documentation

## Overview
This is a TypeScript-based Express.js backend application that serves as the backend for the Ronesdy Note Product. The application follows a modular architecture with clear separation of concerns and uses MongoDB as its database.

## Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB (using Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens)
- **Testing**: Jest
- **API Documentation**: Swagger
- **Additional Services**: AWS SDK, Stripe, PDF Processing

## Project Structure
```
src/
├── config/         # Configuration files and database connection
├── controllers/    # Request handlers and business logic
├── dto/           # Data Transfer Objects for request/response validation
├── middleware/     # Custom middleware (auth, error handling, etc.)
├── models/        # MongoDB/Mongoose models
├── repositories/  # Data access layer
├── routes/        # API route definitions
├── services/      # Business logic and external service integration
├── utils/         # Utility functions and helpers
├── validation/    # Request validation schemas
├── app.ts         # Main application setup
└── index.ts       # Application entry point
```

## Key Modules and Components

### 1. Authentication Module
- **Routes**: `/api/v1/auth`
- **Key Features**:
  - User registration and login
  - JWT token generation and validation
  - Password hashing using bcrypt
- **Important Files**:
  - `routes/auth.ts`
  - `middleware/authMiddleware.ts`
  - `controllers/authController.ts`

### 2. User Management Module
- **Routes**: `/api/v1/user`
- **Key Features**:
  - User profile management
  - User settings
  - Protected routes with authentication
- **Important Files**:
  - `routes/user.ts`
  - `controllers/userController.ts`
  - `models/userModel.ts`

### 3. Path Module
- **Routes**: `/api/v1/path`
- **Key Features**:
  - Path creation and management
  - Path progression tracking
- **Important Files**:
  - `routes/path.ts`
  - `controllers/pathController.ts`
  - `models/pathModel.ts`

### 4. Canvas Module
- **Routes**: `/api/v1/canvas`
- **Key Features**:
  - Canvas creation and management
  - Canvas content handling
- **Important Files**:
  - `routes/canvas.ts`
  - `controllers/canvasController.ts`
  - `models/canvasModel.ts`

### 5. Marketplace Module
- **Routes**: `/api/v1/marketplace`
- **Key Features**:
  - Product listing and management
  - Transaction handling
- **Important Files**:
  - `routes/marketplace.ts`
  - `controllers/marketplaceController.ts`
  - `models/marketplaceModel.ts`

### 6. Wallet Module
- **Routes**: `/api/v1/wallet`
- **Key Features**:
  - Wallet management
  - Transaction history
- **Important Files**:
  - `routes/wallet.ts`
  - `controllers/walletController.ts`
  - `models/walletModel.ts`

### 7. Admin Module
- **Routes**: `/api/v1/admin`
- **Key Features**:
  - Administrative functions
  - Protected admin-only routes
- **Important Files**:
  - `routes/admin.ts`
  - `controllers/adminController.ts`
  - `middleware/authMiddleware.ts` (admin authentication)

## Important Functions and Middleware

### Authentication Middleware
- `authenticate`: Verifies JWT tokens for protected routes
- `authenticateAdmin`: Verifies admin privileges
- `errorHandler`: Global error handling middleware

### Database Operations
- `connectDb`: Establishes MongoDB connection
- Repository pattern for data access
- Mongoose models for data validation

### Utility Functions
- File upload handling
- PDF processing
- AWS S3 integration
- Stripe payment processing

## Development Setup

1. **Prerequisites**
   - Node.js
   - MongoDB
   - Environment variables (see dev.env)

2. **Installation**
   ```bash
   npm install
   ```

3. **Development**
   ```bash
   npm run dev
   ```

4. **Testing**
   ```bash
   npm test
   ```

5. **Linting**
   ```bash
   npm run lint
   npm run lint:fix
   ```

## Environment Variables
Required environment variables are defined in `dev.env`:
- Database connection string
- JWT secret
- AWS credentials
- Stripe API keys
- Other service configurations

## API Documentation
The API is documented using Swagger. Access the documentation at:
```
/api-docs
```

## Best Practices
1. Follow TypeScript best practices
2. Use proper error handling
3. Implement input validation
4. Follow the repository pattern for data access
5. Write unit tests for new features
6. Use proper logging
7. Follow RESTful API design principles

## Deployment
The application can be deployed using PM2:
```bash
npm run prod_start  # For production deployment
npm run prod       # For production restart
```

## Security Considerations
1. JWT token validation
2. Password hashing
3. Input validation
4. CORS configuration
5. Rate limiting
6. Secure headers

## Error Handling
The application uses a centralized error handling middleware that:
1. Logs errors
2. Returns appropriate HTTP status codes
3. Provides meaningful error messages
4. Handles both operational and programming errors

## Monitoring and Logging
- PM2 for process management
- Error logging
- Request logging
- Performance monitoring

## Contributing
1. Follow the existing code structure
2. Write tests for new features
3. Update documentation
4. Follow the established coding standards
5. Use proper commit messages 