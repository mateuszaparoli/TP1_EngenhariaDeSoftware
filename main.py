import sys
import subprocess

def run_django_command(*args):
    """
    Executes a Django management command using manage.py, preferring the venv Python if available.
    Args:
        *args: Arguments to pass to manage.py (e.g., 'makemigrations', 'runserver', etc.)
    Returns:
        The exit code of the command.
    """
    import os
    venv_python = None
    # Look for venv in common locations
    possible_venvs = [
        os.path.join(os.getcwd(), 'venv', 'bin', 'python'),
        os.path.join(os.getcwd(), '.venv', 'bin', 'python'),
        os.path.join(os.getcwd(), 'django', 'venv', 'bin', 'python'),
        os.path.join(os.getcwd(), 'django', '.venv', 'bin', 'python'),
    ]
    for venv_path in possible_venvs:
        if os.path.isfile(venv_path) and os.access(venv_path, os.X_OK):
            venv_python = venv_path
            break
    python_exec = venv_python if venv_python else sys.executable
    command = [python_exec, 'django/manage.py'] + list(args)
    try:
        result = subprocess.run(command)
        return result.returncode
    except Exception as e:
        print(f"Error running command: {e}")
        return 1

def main():
    if len(sys.argv) < 2:
        print("Usage: python main.py <django management command> [args...]")
        print("Example: python main.py runserver 8000")
        sys.exit(1)
    
    exit_code = run_django_command(*sys.argv[1:])
    sys.exit(exit_code)

if __name__ == "__main__":
    main()
