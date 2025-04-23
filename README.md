# Social Network Platform

## Features

- **User Authentication**: Register, login, and logout functionality
- **Post Management**:
  - Create new text posts
  - Delete posts (owner only)
  - View posts with pagination (10 posts/page)
- **Social Features**:
  - Follow/Unfollow other users
  - Like/Unlike posts
  - View follower/following counts
- **Feed Customization**:
  - All Posts (global feed)
  - Following (personalized feed)
  - Profile-specific posts
- **Real-time Updates**: AJAX-based interactions for likes, edits, and follows

--- 

## 🧰 Tech Stack

- **Backend:** Django (Python)
- **Frontend:** HTML5, CSS3, Bootstrap 5
- **JavaScript:** Vanilla JS with Fetch API
- **Database:** SQLite (default)
- **Authentication:** Django built-in user auth
- **Async Actions:** AJAX using Fetch

---

## ⚙️ Setup Instructions

```bash
# Clone the repository
git clone https://github.com/your-username/django-social-network.git
cd django-social-network

# Set up a virtual environment
python3 -m venv venv
source venv/bin/activate  # For Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations and start server
python manage.py migrate
python manage.py runserver
```

---

## 🌐 Deployment

You can deploy this project on platforms like:
- **Heroku**
- **Render**
- **PythonAnywhere**
- **Vercel (for static frontend)**

Use environment variables to manage sensitive data like SECRET_KEY.



