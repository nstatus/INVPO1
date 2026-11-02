# -*- coding: utf-8 -*-
"""
нейро.5 — AI-дайджест для новичков.

Запуск:
    pip install -r requirements.txt
    python app.py

После запуска откройте http://127.0.0.1:5000
"""

import os
import re
from datetime import date
from pathlib import Path

from flask import (
    Flask,
    abort,
    flash,
    redirect,
    render_template,
    request,
    url_for,
)

from materials import MATERIALS

# ---------------------------------------------------------------------------
# Настройки приложения
# ---------------------------------------------------------------------------

app = Flask(__name__)

# Секретный ключ нужен для сообщений после отправки формы.
# В настоящем проекте его стоит хранить в переменной окружения.
app.secret_key = os.environ.get("SECRET_KEY", "dev-key-change-me")

# Файл, куда складываются подписки. Папка data создастся сама.
DATA_DIR = Path(__file__).parent / "data"
SUBSCRIBERS_FILE = DATA_DIR / "subscribers.txt"

EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


# ---------------------------------------------------------------------------
# Вспомогательные функции
# ---------------------------------------------------------------------------

def find_material(slug: str):
    """Ищет материал по короткому адресу (slug)."""
    for item in MATERIALS:
        if item["slug"] == slug:
            return item
    return None


# ---------------------------------------------------------------------------
# Страницы
# ---------------------------------------------------------------------------

@app.route("/")
def index():
    """Главная страница с карточками материалов."""
    return render_template(
        "index.html",
        materials=MATERIALS,
        materials_count=len(MATERIALS),
    )


@app.route("/material/<slug>")
def material_page(slug):
    """Отдельная страница материала."""
    material = find_material(slug)
    if material is None:
        abort(404)

    # Сначала показываем материалы из той же категории, потом остальные.
    same_category = [
        item
        for item in MATERIALS
        if item["slug"] != slug and item["category"] == material["category"]
    ]
    other_materials = [
        item
        for item in MATERIALS
        if item["slug"] != slug and item["category"] != material["category"]
    ]
    related = (same_category + other_materials)[:3]

    return render_template("material.html", material=material, related=related)


@app.post("/subscribe")
def subscribe():
    """Принимает email из формы подписки."""
    email = request.form.get("email", "").strip().lower()

    if not EMAIL_PATTERN.match(email):
        flash("Похоже, в адресе почты ошибка. Проверьте и попробуйте ещё раз.", "error")
        return redirect(url_for("index") + "#subscribe")

    DATA_DIR.mkdir(exist_ok=True)

    # Читаем уже сохранённые адреса, чтобы не добавлять дубликаты.
    saved = set()
    if SUBSCRIBERS_FILE.exists():
        saved = {
            line.strip()
            for line in SUBSCRIBERS_FILE.read_text(encoding="utf-8").splitlines()
            if line.strip()
        }

    if email not in saved:
        with SUBSCRIBERS_FILE.open("a", encoding="utf-8") as file:
            file.write(email + "\n")

    flash("Готово! Первый выпуск уже летит на вашу почту.", "success")
    return redirect(url_for("index") + "#subscribe")


@app.errorhandler(404)
def page_not_found(error):
    """Красивая страница вместо стандартной ошибки Flask."""
    return render_template("404.html"), 404


# ---------------------------------------------------------------------------
# Мелочи для всех шаблонов
# ---------------------------------------------------------------------------

@app.context_processor
def add_common_values():
    return {"current_year": date.today().year}


# ---------------------------------------------------------------------------
# Запуск
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5000, debug=True)
