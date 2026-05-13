# SEC-Hostel

SEC-Hostel is a secure hostel management web application built to manage hostel-related workflows such as student profiles, warden assignments, authentication, approvals, and role-based access. The project is designed for a college hostel environment where students, wardens, and administrators can interact through a structured digital platform.

## Live Demo

Live Website: https://sec-hostel.vercel.app/login

GitHub Repository: https://github.com/Rohithsaravanan26/SEC-Hostel

## About the Project

Managing hostel records manually can be difficult, time-consuming, and error-prone. SEC-Hostel provides a digital solution for handling student hostel data, user authentication, profile management, warden assignment, and secure access control.

The application uses a modern full-stack architecture with Next.js, TypeScript, Supabase, and Vercel. It includes database schema files, Row Level Security policies, user synchronization logic, and role-based access management.

SEC-Hostel is built to improve hostel administration, reduce manual work, and provide a more organized system for managing student and warden data.

## Key Features

- Secure login system
- Student profile management
- Warden profile and assignment support
- Admin-controlled hostel management workflow
- Role-based access control
- Supabase authentication integration
- Supabase database integration
- Row Level Security policy support
- User synchronization logic
- Student import support
- Hostel-related database schema
- Approval and rejection workflow support
- Rejection reason tracking
- Biometric field support
- Responsive web interface
- Vercel deployment-ready setup

## Tech Stack

### Frontend

- Next.js
- React
- TypeScript
- JavaScript
- CSS

### Backend and Database

- Supabase
- PostgreSQL
- SQL
- PLpgSQL

### Authentication and Security

- Supabase Auth
- Row Level Security
- Middleware-based route protection

### Deployment

- Vercel

## User Roles

The project can support multiple user roles such as:

### Student

- Login to the system
- Manage personal hostel profile
- View assigned hostel-related information
- Submit or update required details

### Warden

- View assigned student details
- Manage hostel-related student information
- Review student records
- Handle assigned hostel responsibilities

### Admin

- Manage users
- Assign wardens
- Configure hostel data
- Control approval workflows
- Manage database-level operations

## Project Workflow

1. User opens the SEC-Hostel application.
2. User logs in through the authentication system.
3. The system identifies the user role.
4. Students can access their hostel profile and related details.
5. Wardens can view and manage assigned student information.
6. Admins can manage users, assignments, and hostel workflows.
7. Supabase Row Level Security helps protect data access.
8. The application is deployed and served through Vercel.

## Folder Structure

```text
SEC-Hostel/
│
├── app/
│   └── Next.js application routes and pages
│
├── components/
│   └── Reusable UI components
│
├── lib/
│   └── Utility functions, Supabase configuration, and helpers
│
├── types/
│   └── TypeScript type definitions
│
├── public/
│   └── Static assets
│
├── schema.sql
│   └── Main database schema
│
├── secure_rls_policies.sql
│   └── Supabase Row Level Security policies
│
├── seed_users.sql
│   └── User seed data
│
├── seed_wardens.sql
│   └── Warden seed data
│
├── add_biometric_fields.sql
│   └── Biometric-related database updates
│
├── add_rejection_reason.sql
│   └── Rejection reason field updates
│
├── add_student_profile_fields.sql
│   └── Student profile field updates
│
├── add_warden_assignment.sql
│   └── Warden assignment database updates
│
├── auto_user_sync_trigger.sql
│   └── Automatic user synchronization trigger
│
├── fix_user_sync.sql
│   └── User synchronization fixes
│
├── import_students.js
│   └── Student import script
│
├── middleware.ts
│   └── Route protection middleware
│
├── package.json
├── next.config.ts
└── README.md
```

## Installation and Setup

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/Rohithsaravanan26/SEC-Hostel.git
```

### 2. Navigate to the Project Folder

```bash
cd SEC-Hostel
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Create Environment File

Create a `.env.local` file in the root directory.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Do not upload `.env.local` to GitHub.

### 5. Run the Development Server

```bash
npm run dev
```

The project will run locally at:

```text
http://localhost:3000
```

## Supabase Setup

To set up the database:

1. Create a Supabase project.
2. Open the SQL editor in Supabase.
3. Run the required SQL files from the repository.
4. Start with the main schema file.
5. Apply additional migration files as needed.
6. Enable Row Level Security for protected tables.
7. Apply the secure RLS policies.
8. Add required environment variables in `.env.local`.

Recommended SQL setup order:

```text
schema.sql
add_student_profile_fields.sql
add_warden_assignment.sql
add_biometric_fields.sql
add_rejection_reason.sql
auto_user_sync_trigger.sql
secure_rls_policies.sql
seed_users.sql
seed_wardens.sql
```

## Available Scripts

### Start Development Server

```bash
npm run dev
```

Runs the application in development mode.

### Build for Production

```bash
npm run build
```

Creates an optimized production build.

### Start Production Server

```bash
npm start
```

Runs the production build locally.

### Run Lint Check

```bash
npm run lint
```

Checks the project for code quality and linting issues.

## Security Features

SEC-Hostel includes multiple security-focused components:

- Supabase authentication
- Row Level Security policies
- Protected application routes
- Middleware-based access control
- Role-based user permissions
- Secure database policy files
- User synchronization scripts
- Security testing scripts and documentation

## Security Testing

The repository includes security-related files such as:

```text
SECURITY_IMPLEMENTATION.md
QUICK_SECURITY_TEST.md
security-test.js
security-test-simple.js
security-test-ready.js
```

These files can be used to understand, test, and validate the security setup of the application.

## Deployment

The project is deployed on Vercel.

Live website:

```text
https://sec-hostel.vercel.app/login
```

To deploy your own version:

1. Push the project to GitHub.
2. Open Vercel.
3. Import the repository.
4. Add the required environment variables.
5. Deploy the project.
6. Test login and database access after deployment.

## Screenshots

Add your project screenshots inside a `docs` or `public/screenshots` folder and update the image paths below.

```markdown
![Login Page](docs/login.png)
![Student Dashboard](docs/student-dashboard.png)
![Warden Dashboard](docs/warden-dashboard.png)
![Admin Dashboard](docs/admin-dashboard.png)
```

## Use Cases

SEC-Hostel can be used for:

- College hostel management
- Student hostel profile tracking
- Warden assignment management
- Hostel administration workflows
- Secure student record management
- Digital hostel approval systems
- Role-based campus management portals

## Future Improvements

- Add room allocation management
- Add hostel fee tracking
- Add complaint management system
- Add leave request workflow
- Add visitor management system
- Add mess attendance tracking
- Add biometric attendance integration
- Add notification system
- Add email alerts
- Add admin analytics dashboard
- Add student search and filtering
- Add export reports as PDF or Excel
- Add mobile app version
- Improve UI and accessibility
- Add audit logs for admin actions

## Project Status

SEC-Hostel is currently under development. The project already includes the main application structure, Supabase integration, SQL schema files, security policies, user synchronization logic, and deployment configuration.

## Author

Rohith Saravanan

GitHub: https://github.com/Rohithsaravanan26

## Acknowledgement

This project was created to improve hostel administration through a secure, digital, and role-based management system. SEC-Hostel aims to reduce manual work and make hostel data management more efficient for students, wardens, and administrators.

## License

This project can be released under the MIT License.

You can add a `LICENSE` file to the repository if you want others to use, modify, and contribute to the project.

Recommended license:

```text
MIT License
```
