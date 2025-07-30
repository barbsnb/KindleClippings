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
cd ./frontend
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

If you are running for the first time migrate changes in the database:

```bash
python manage.py migrate  
```

Then add all the data from MyClippings.txt file using a following command:

```bash
python manage.py kindle-import
```


### Usage
- Use the sidebar to select a specific book or author.
- Filter clippings using the text input above the list.
- Click the pencil icon to edit a book or author name inline.
- Click the eye icon to hide a clipping from view.

---

## Automatic Kindle Clipping Import (Linux only)

This project supports automatic import of Kindle highlights and notes when a Kindle is plugged into a Linux machine. The mechanism relies on Linux `udev` rules and a custom Django management command.

### How It Works

1. When you plug in a Kindle device, Linux detects the USB event via `udev`.
2. A custom udev rule matches the Kindle by vendor/device ID and triggers a shell script.
3. The shell script:
   - Mounts the Kindle drive read-only.
   - Locates and copies the `My Clippings.txt` file from the Kindle.
   - Automatically runs a Django command to parse and save the highlights/notes to the database.
4. The data is saved under the appropriate `Book`, `Author`, and `Clipping` models.

This allows your application to instantly gain access to new Kindle notes and highlights — no manual uploads required.

### Files & Instructions Location

You can find the full setup instructions and source files here in the project:

-  `backend/api/management/commands/import_clippings.py`  
  → Django command for parsing and saving the clippings to the database.
  
-  `backend/api/management/commands/kindle-import.sh`  
  → Bash script executed on USB event to mount, copy, and trigger the import.
  
-  `backend/api/management/commands/notes.md`  
  → A detailed guide describing how to configure the udev rule, script, and everything needed to automate the process.

### Requirements

- Linux OS (udev available)
- Django backend with the provided models and command
- `udisksctl` available on the system
- Kindle device accessible via USB

> **Note:** You may need to adjust device vendor info or file paths depending on your Linux distro and Kindle model.

### TODO


---