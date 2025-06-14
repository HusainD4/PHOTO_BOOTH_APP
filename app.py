import os
import io
import json
import base64
from functools import wraps
from datetime import datetime

from flask import (
    Flask, render_template, request, redirect,
    url_for, flash, session, jsonify
)
from werkzeug.utils import secure_filename
from PIL import Image
import qrcode
from flask import current_app

app = Flask(__name__)
app.secret_key = 'supersecretkey123'  # Pastikan ini rahasia di production
now = datetime.now()

# Folder konfigurasi
UPLOAD_FOLDER = 'static/img/templates'
POSITIONS_DIR = os.path.join('data', 'positions')
USER_PHOTO_DIR = 'static/photos'

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(POSITIONS_DIR, exist_ok=True)
os.makedirs(USER_PHOTO_DIR, exist_ok=True)

ALLOWED_EXTENSIONS = {'png'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Dummy login system dengan username dan password yang kamu minta
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not session.get('logged_in'):
            flash("Harap login terlebih dahulu")
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        # Login validasi user yang kamu inginkan
        if username == 'Husain' and password == 'Husain281005!':
            session['logged_in'] = True
            session['username'] = username
            flash('Login berhasil!')
            return redirect(url_for('admin_dashboard'))
        else:
            flash('Login gagal, coba lagi')
            return redirect(url_for('login'))
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('Logout berhasil')
    return redirect(url_for('login'))

# ====== ADMIN =======

from flask import render_template, current_app, session
from datetime import datetime
from collections import Counter
import os

@app.route('/admin')
@login_required
def admin_dashboard():
    # Lokasi direktori
    photos_dir = os.path.join(current_app.root_path, 'static', 'photos')
    templates_dir = os.path.join(current_app.root_path, 'static', 'img', 'templates')

    # Ambil semua file foto
    photos = [
        f for f in os.listdir(photos_dir)
        if f.lower().endswith(('.png', '.jpg', '.jpeg', '.gif'))
    ]

    # Hitung total template
    templates = [
        f for f in os.listdir(templates_dir)
        if f.lower().endswith('.png')
    ]
    total_templates = len(templates)
    total_photos = len(photos)

    # Statistik per hari dan per bulan
    daily_counter = Counter()
    monthly_counter = Counter()

    for filename in photos:
        try:
            # Asumsikan format nama: namatemplate_YYYYMMDD_HHmmss.png
            parts = filename.split('_')
            if len(parts) < 2:
                continue
            date_str = parts[1][:8]  # Ambil YYYYMMDD
            date_obj = datetime.strptime(date_str, '%Y%m%d')
            daily_counter[date_obj.date()] += 1
            monthly_counter[date_obj.strftime('%Y-%m')] += 1
        except Exception as e:
            continue  # Abaikan file yang tidak sesuai format

    # Format data untuk dikirim ke template
    daily_photos = [
        {'date': date.strftime('%Y-%m-%d'), 'count': count}
        for date, count in sorted(daily_counter.items())
    ]

    monthly_photos = [
        {'date': month, 'count': count}
        for month, count in sorted(monthly_counter.items())
    ]

    # Ambil nama user dari session (jika tersedia)
    username = session.get('username', 'Admin')

    return render_template(
        'admin/index.html',
        total_photos=total_photos,
        total_templates=total_templates,
        daily_photos=daily_photos,
        monthly_photos=monthly_photos,
        username=username
    )


@app.route('/admin/templates')
@login_required
def view_all_templates():
    templates = [f for f in os.listdir(UPLOAD_FOLDER) if allowed_file(f)]
    return render_template('admin/view_all_templates.html', templates=templates)

@app.route('/admin/templates/upload', methods=['GET', 'POST'])
@login_required
def upload_template():
    if request.method == 'POST':
        template_name = request.form.get('template_name', '').strip()
        file = request.files.get('file')
        if not template_name:
            flash('Nama template harus diisi')
            return redirect(request.url)
        if not file or file.filename == '':
            flash('File template PNG harus dipilih')
            return redirect(request.url)
        if file and allowed_file(file.filename):
            filename = secure_filename(template_name + '.png')
            save_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(save_path)
            flash('Template berhasil diupload')
            return redirect(url_for('view_all_templates'))
        else:
            flash('File harus PNG')
            return redirect(request.url)
    return render_template('admin/upload_template.html')

@app.route('/admin/photos/<photo_id>/qrcode')
@login_required
def generate_qrcode(photo_id):
    # photo_id di sini adalah filename foto
    photo_path = os.path.join(USER_PHOTO_DIR, photo_id)

    if not os.path.exists(photo_path):
        flash('Foto tidak ditemukan')
        return redirect(url_for('manage_photos'))

    photo_url = url_for('static', filename='photos/' + photo_id, _external=True)
    qr_img = qrcode.make(photo_url)
    buf = io.BytesIO()
    qr_img.save(buf, format='PNG')
    buf.seek(0)

    return (
        buf.read(),
        200,
        {
            'Content-Type': 'image/png',
            'Content-Disposition': f'inline; filename="{photo_id}_qrcode.png"'
        }
    )


@app.route('/admin/templates/delete/<template_name>')
@login_required
def delete_template(template_name):
    template_path = os.path.join(UPLOAD_FOLDER, template_name)
    position_path = os.path.join(POSITIONS_DIR, template_name + '.json')

    if os.path.exists(template_path):
        os.remove(template_path)
    if os.path.exists(position_path):
        os.remove(position_path)
    flash(f'Template {template_name} dan posisi terkait telah dihapus')
    return redirect(url_for('view_all_templates'))

@app.route('/admin/templates/edit/<template_name>', methods=['GET', 'POST'])
@login_required
def edit_template(template_name):
    template_path = os.path.join(UPLOAD_FOLDER, template_name)
    if not os.path.exists(template_path):
        flash('Template tidak ditemukan.')
        return redirect(url_for('view_all_templates'))

    position_file = os.path.join(POSITIONS_DIR, template_name + '.json')

    if request.method == 'POST':
        try:
            positions = json.loads(request.form['positions'])
            with open(position_file, 'w') as f:
                json.dump(positions, f)
            flash('Tata letak berhasil disimpan.')
        except Exception as e:
            flash('Gagal menyimpan tata letak: ' + str(e))
        return redirect(url_for('edit_template', template_name=template_name))

    initial_positions = []
    if os.path.exists(position_file):
        with open(position_file, 'r') as f:
            initial_positions = json.load(f)

    return render_template('admin/edit_template.html',
                           template_name=template_name,
                           initial_positions=initial_positions)
    
@app.route('/admin/photos')
@login_required
def manage_photos():
    photos_dir = os.path.join(current_app.root_path, 'static', 'photos')
    photos = []

    # List semua file gambar di folder photos
    for filename in os.listdir(photos_dir):
        if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
            photos.append({
                'filename': filename,
                'name': filename,  # bisa kamu ubah sesuai kebutuhan, misal dari DB
                'id': filename  # kalau belum ada id unik, sementara pakai filename
            })

    return render_template('admin/manage_photos.html', photos=photos)


# ====== USER =======# ====== USER =======

@app.route('/')
def index():
    """
    Halaman utama user yang menampilkan semua template yang tersedia.
    """
    templates = [f for f in os.listdir(UPLOAD_FOLDER) if allowed_file(f)]
    return render_template('user/index.html', templates=templates)


@app.route('/user')
def view_user():
    """
    Halaman user utama, sama seperti index, menampilkan semua template.
    """
    templates = [f for f in os.listdir(UPLOAD_FOLDER) if allowed_file(f)]
    return render_template('user/index.html', templates=templates)


@app.route('/user/template/<template_name>')
def user_template(template_name):
    """
    Halaman untuk mengambil foto sesuai template yang dipilih user.
    Membaca posisi dari file JSON.
    """
    # Pastikan template_name punya ekstensi .png
    if not template_name.lower().endswith('.png'):
        template_name += '.png'

    position_file = os.path.join(POSITIONS_DIR, template_name + '.json')

    if not os.path.exists(position_file):
        flash('Template tidak ditemukan atau belum disiapkan posisi kamera')
        return redirect(url_for('index'))

    with open(position_file, 'r') as f:
        positions = json.load(f)

    return render_template('user/take_photo.html', template_name=template_name, positions=positions)


@app.route('/user/save_photo', methods=['POST'])
def save_photo():
    """
    Menerima data foto base64 dari user, 
    menggabungkan ke template sesuai posisi, 
    menyimpan hasilnya, lalu buat QR code untuk download.
    """
    data = request.json
    if not data:
        return jsonify({'status': 'error', 'message': 'Request body kosong atau bukan JSON'})

    template_name = data.get('template_name')
    photos_base64 = data.get('photos')

    if not template_name or not photos_base64:
        return jsonify({'status': 'error', 'message': 'Data tidak lengkap'})

    # Pastikan ekstensi .png
    if not template_name.lower().endswith('.png'):
        template_name += '.png'

    position_file = os.path.join(POSITIONS_DIR, template_name + '.json')
    template_path = os.path.join(UPLOAD_FOLDER, template_name)

    if not os.path.exists(template_path) or not os.path.exists(position_file):
        return jsonify({'status': 'error', 'message': 'Template atau posisi tidak ditemukan'})

    # Load posisi frame
    with open(position_file, 'r') as f:
        positions = json.load(f)

    template_img = Image.open(template_path).convert("RGBA")

    # Loop setiap foto, resize dan paste ke posisi yang benar
    for i, photo_b64 in enumerate(photos_base64):
        if i >= len(positions):
            break
        try:
            header, encoded = photo_b64.split(',', 1)
        except ValueError:
            return jsonify({'status': 'error', 'message': 'Format foto base64 tidak benar'})

        img_data = base64.b64decode(encoded)
        photo_img = Image.open(io.BytesIO(img_data)).convert("RGBA")

        slot = positions[i]
        w, h = int(slot['width']), int(slot['height'])
        photo_img = photo_img.resize((w, h))

        template_img.paste(photo_img, (int(slot['x']), int(slot['y'])), photo_img)

    # Tempatkan di sini: buat nama file dengan timestamp saat ini
    now = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"{template_name}_{now}.png"
    save_path = os.path.join(USER_PHOTO_DIR, filename)
    template_img.save(save_path)

    # URL untuk download foto hasil
    download_url = url_for('static', filename='photos/' + filename, _external=True)

    # Generate QR code dari URL download
    qr = qrcode.make(download_url)
    buffered = io.BytesIO()
    qr.save(buffered, format="PNG")
    qr_b64 = "data:image/png;base64," + base64.b64encode(buffered.getvalue()).decode()

    # Kirim response ke client
    return jsonify({'status': 'success', 'photo_url': download_url, 'qr_code': qr_b64})



if __name__ == '__main__':
    app.run("0.0.0.0",5000)
