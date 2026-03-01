# Backend Repository Development

## Setup environment

### Installing Python version manager
To develop in Python, you need a virtual environment. I recommend uv as the manager

https://docs.astral.sh/uv/getting-started/installation/
macOS/Linux
`curl -LsSf https://astral.sh/uv/install.sh | sh`

Windows
`powershell -c "irm https://astral.sh/uv/install.ps1 | more"`

### Setup virtual environment
We will be using Python 3.13
To install Python: `uv python install 3.13`
Initialize environment: `uv venv`
Activate environment: `source .venv/bin/activate`
Install all necessary libraries: `pip install -r requirements.txt`

## Running the project
After activate virtual enviroment
run main.py
Go to http://localhost:8000/docs