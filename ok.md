cd frontend
npm create vite@latest . -- --template react-ts
Framework: react
Variant: TypeScript

npm install
npm install @radix-ui/react-alert-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-slot
npm install @radix-ui/react-tabs
npm install @tanstack/react-table
npm install recharts
npm install lucide-react
npm install class-variance-authority
npm install clsx
npm install tailwindcss-animate
npm install tailwindcss
npm install @types/node
npm install clsx tailwind-merge
npm install @vitejs/plugin-react --save-dev
npm install @tanstack/react-query    # For data fetching
npm install axios                    # For HTTP requests
npm install zustand                  # For state management
npm install react-router-dom         # For routing

cd backend
# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate
# OR for Unix/Mac
source venv/bin/activate

# Install dependencies
pip install fastapi
pip install uvicorn
pip install python-multipart
pip install pandas
pip install numpy
pip install aiofiles uuid
pip install pydantic-settings