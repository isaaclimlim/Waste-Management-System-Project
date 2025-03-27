# Smart Trash Management System

A modern web application for managing waste collection and monitoring smart trash bins.

## Features

- Real-time monitoring of trash bin levels
- Smart analytics and reporting
- Collection scheduling and management
- User settings and notifications
- Modern and responsive UI

## Tech Stack

### Frontend

- React.js
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Setup Instructions

1. Clone the repository:

```bash
git clone <repository-url>
cd smart-trash
```

2. Install frontend dependencies:

```bash
cd frontend
npm install
```

3. Install backend dependencies:

```bash
cd ../backend
npm install
```

4. Create a `.env` file in the backend directory:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smarttrash
```

5. Start the backend server:

```bash
cd backend
npm run dev
```

6. Start the frontend development server:

```bash
cd frontend
npm run dev
```

7. Open your browser and navigate to `http://localhost:5173`

## API Endpoints

### Bins

- GET `/api/bins` - Get all bins
- GET `/api/bins/:id` - Get a single bin
- POST `/api/bins` - Create a new bin
- PATCH `/api/bins/:id` - Update a bin
- DELETE `/api/bins/:id` - Delete a bin

### Collections

- GET `/api/collections` - Get all collections
- GET `/api/collections/:id` - Get a single collection
- POST `/api/collections` - Create a new collection
- PATCH `/api/collections/:id` - Update a collection
- DELETE `/api/collections/:id` - Delete a collection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
