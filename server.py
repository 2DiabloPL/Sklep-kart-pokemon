from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# połączenie z bazą
import os

db = mysql.connector.connect(
    host=os.getenv("DB_HOST"),
    user=os.getenv("DB_USER"),
    password=os.getenv("DB_PASSWORD"),
    database=os.getenv("DB_NAME"),
    port=int(os.getenv("DB_PORT"))
)

# endpoint: produkty
@app.route("/api/products", methods=["GET"])
def get_products():
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM products")
    result = cursor.fetchall()
    return jsonify(result)

# endpoint: login
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    cursor = db.cursor(dictionary=True)
    cursor.execute(
        "SELECT * FROM users WHERE username=%s AND password=%s",
        (username, password)
    )
    result = cursor.fetchall()

    return jsonify({"success": len(result) > 0})

# endpoint: zmiana ilości produktów w bazie
@app.route("/api/products/<int:product_id>/stock", methods=["PATCH"])
def update_stock(product_id):
    data = request.get_json()
    quantity = data.get("quantity")

    # ❌ walidacja danych
    if not product_id or not quantity or quantity <= 0:
        return jsonify({"message": "Nieprawidłowe dane."}), 400

    cursor = db.cursor(dictionary=True)

    # 🔍 sprawdź czy produkt istnieje
    cursor.execute("SELECT * FROM products WHERE id=%s", (product_id,))
    product = cursor.fetchone()

    if not product:
        return jsonify({"message": "Produkt nie istnieje."}), 404

    # 🔻 sprawdź stan magazynu
    if product["stock"] < quantity:
        return jsonify({
            "message": "Brak wystarczającej liczby sztuk w magazynie."
        }), 409

    # 🔻 oblicz nowy stan
    new_stock = product["stock"] - quantity

    # 💾 update w bazie
    cursor.execute(
        "UPDATE products SET stock=%s WHERE id=%s",
        (new_stock, product_id)
    )
    db.commit()

    return jsonify({
        "id": product_id,
        "stock": new_stock
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    app.run(host="0.0.0.0", port=port)