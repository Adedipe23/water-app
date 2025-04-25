# Water Reminder Button API

A FastAPI backend for the Water Reminder Button mobile application.
 gh auth login
  gh auth status5
## Features

- User authentication with JWT tokens
- Water intake tracking
- Daily water goals
- Streak tracking
- Statistics and history

## Tech Stack

- FastAPI: Web framework
- SQLModel: ORM and data validation
- OAuth2: Authentication
- SQLite/PostgreSQL: Database

## Project Structure

```
water_backend/
├── app/
│   ├── main.py                # FastAPI application entry point
│   ├── api/                   # Route handlers
│   ├── core/                  # Configuration and utilities
│   ├── db/                    # Database setup
│   ├── models/                # SQLModel definitions
│   ├── schemas/               # Pydantic schemas
│   └── services/              # Business logic
├── tests/                     # Test directory
├── .env                       # Environment variables
├── .env.example               # Example environment variables
└── requirements.txt           # Project dependencies
```

## Getting Started

### Prerequisites

- Python 3.8+
- pip

### Installation

1. Clone the repository
2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Copy `.env.example` to `.env` and update the values

### Running the Application

```bash
uvicorn app.main:app --reload
```

The API will be available at http://localhost:8000.

API documentation will be available at http://localhost:8000/docs.

## API Endpoints

### Authentication

- `POST /api/v1/auth/register`: Register a new user
- `POST /api/v1/auth/login`: Login and get access token

### Water Tracking

- `POST /api/v1/water/log`: Log water intake
- `GET /api/v1/water/today`: Get today's water logs
- `GET /api/v1/water/streak`: Get current streak data
- `GET /api/v1/water/goal`: Get current daily goal
- `POST /api/v1/water/goal`: Set/update daily water goal
- `GET /api/v1/water/history`: Get water logs over a time range
- `GET /api/v1/water/stats`: Get weekly or monthly summary

## License

MIT
