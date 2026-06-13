#!/usr/bin/env python3
"""
Moult AI Web — Serveur de développement local
Lance un serveur HTTP simple pour servir les fichiers du site.

Usage:
    python3 server.py                  # Lance sur le port 8000
    python3 server.py 3000             # Lance sur le port 3000
    python3 server.py --host 0.0.0.0   # Écoute sur toutes les interfaces
"""

import http.server
import socketserver
import os
import sys
import signal
import argparse
from functools import partial
from pathlib import Path

# Dossier racine du projet (là où se trouve ce script)
ROOT_DIR = Path(__file__).resolve().parent

# MIME types étendus
MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png':  'image/png',
    '.jpg':  'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif':  'image/gif',
    '.svg':  'image/svg+xml',
    '.ico':  'image/x-icon',
    '.webp': 'image/webp',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf':  'font/ttf',
    '.mp4':  'video/mp4',
    '.webm': 'video/webm',
    '.txt':  'text/plain; charset=utf-8',
    '.xml':  'application/xml; charset=utf-8',
    '.md':   'text/markdown; charset=utf-8',
    '.zip':  'application/zip',
    '.wasm': 'application/wasm',
}


class MoultAIHandler(http.server.SimpleHTTPRequestHandler):
    """Handler personnalisé avec gestion des SPA et en-têtes CORS."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT_DIR), **kwargs)

    def end_headers(self):
        # En-têtes utiles pour le développement
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

    def guess_type(self, path):
        """Retourne le type MIME basé sur l'extension."""
        ext = Path(path).suffix.lower()
        return MIME_TYPES.get(ext, super().guess_type(path))

    def log_message(self, format, *args):
        """Format de log coloré."""
        status = args[1] if len(args) > 1 else ''
        status_str = str(status)

        # Couleurs ANSI
        GREEN = '\033[92m'
        YELLOW = '\033[93m'
        RED = '\033[91m'
        CYAN = '\033[96m'
        RESET = '\033[0m'
        BOLD = '\033[1m'

        if status_str.startswith('2'):
            color = GREEN
        elif status_str.startswith('3'):
            color = CYAN
        elif status_str.startswith('4'):
            color = YELLOW
        else:
            color = RED

        method = args[0] if args else ''
        print(f"  {BOLD}{method}{RESET}  {color}{status}{RESET}  {args[2] if len(args) > 2 else ''}")

    def do_GET(self):
        """Redirige vers index.html pour les routes SPA (chemins sans extension)."""
        # Si le chemin pointe vers un fichier existant, le servir normalement
        file_path = ROOT_DIR / self.path.lstrip('/')
        if file_path.is_file():
            super().do_GET()
            return

        # Si le chemin n'a pas d'extension et n'est pas un dossier existant,
        # servir index.html (mode SPA)
        if '.' not in Path(self.path).name and not file_path.is_dir():
            self.path = '/index.html'

        super().do_GET()


def main():
    parser = argparse.ArgumentParser(
        description='🖥️  Moult AI Web — Serveur de développement local'
    )
    parser.add_argument(
        'port',
        nargs='?',
        type=int,
        default=8000,
        help='Port du serveur (défaut: 8000)'
    )
    parser.add_argument(
        '--host',
        default='localhost',
        help='Adresse d\'écoute (défaut: localhost)'
    )
    parser.add_argument(
        '--open',
        action='store_true',
        default=False,
        help='Ouvrir le navigateur automatiquement'
    )

    args = parser.parse_args()

    # Couleurs
    GREEN = '\033[92m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    DIM = '\033[2m'
    RESET = '\033[0m'

    # Changer le répertoire de travail
    os.chdir(ROOT_DIR)

    # Créer le serveur
    handler = partial(MoultAIHandler)

    with socketserver.TCPServer((args.host, args.port), handler) as httpd:
        httpd.allow_reuse_address = True

        url = f"http://{args.host}:{args.port}"

        print()
        print(f"  {BOLD}╔══════════════════════════════════════╗{RESET}")
        print(f"  {BOLD}║{RESET}  🌐  {CYAN}{BOLD}Moult AI Web{RESET}                    {BOLD}║{RESET}")
        print(f"  {BOLD}║{RESET}  {GREEN}{BOLD}Serveur de développement local{RESET}     {BOLD}║{RESET}")
        print(f"  {BOLD}╚══════════════════════════════════════╝{RESET}")
        print()
        print(f"  {BOLD}→ URL :{RESET}  {GREEN}{url}{RESET}")
        print(f"  {BOLD}→ Dossier :{RESET}  {DIM}{ROOT_DIR}{RESET}")
        print(f"  {BOLD}→ Ctrl+C pour arrêter{RESET}")
        print()

        # Ouvrir le navigateur si demandé
        if args.open:
            import webbrowser
            webbrowser.open(url)

        # Gestion de Ctrl+C proprement
        def signal_handler(sig, frame):
            print(f"\n\n  {CYAN}👋 Serveur arrêté.{RESET}\n")
            sys.exit(0)

        signal.signal(signal.SIGINT, signal_handler)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print(f"\n\n  {CYAN}👋 Serveur arrêté.{RESET}\n")


if __name__ == '__main__':
    main()
