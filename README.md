# Clippings Manager

A web application to view, filter, and edit text clippings (highlights and notes) from books. Includes features to:

- Display clippings grouped by book or author
- Edit book titles and author names inline
- Filter clippings by text content
- Hide clippings from view
- Update and reflect changes in real time in the sidebar

## Technologies

- **Frontend**: React, React Router, Lucide Icons, CSS Modules
- **Backend**: Python (e.g., Django or Flask)
- **API Communication**: Fetch & Axios
- **State Management**: React Context API

---

## Installation

### Frontend (React)

1. Clone the repository:

```bash
git clone https://github.com/barbsnb/KindleClippings.git
```

2. (Optional but recommended) Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Navigate to the frontend directory:

```bash
cd clippings-manager/frontend
```

5. Install dependencies:

```bash
npm install
```

6. Start the development server:

```bash
npm start
```

### Backend (Python API)

7. Navigate to the backend directory:

```bash
cd ../backend
```

8. Run the development server:

```bash
python manage.py runserver  # For Django
```

Ensure your backend runs on http://localhost:8000/api/, which is expected by the frontend. You can configure this with environment variables if needed.

### Usage
- Use the sidebar to select a specific book or author.
- Filter clippings using the text input above the list.
- Click the pencil icon to edit a book or author name inline.
- Click the eye icon to hide a clipping from view.