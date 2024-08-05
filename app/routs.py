from app import app, db, bcrypt
from flask import render_template, url_for, send_from_directory, request, redirect, flash, make_response, abort, jsonify, session
from flask_login import login_required, login_user, logout_user, current_user
from app.db_classes import User
from app.forms import LoginForm, PgnForm
from sqlalchemy import func
from .utils import fens_from_pgn
import chess
import random

@app.route("/train")
def train():
    if 'positions' not in session:
        return redirect(url_for("upload_pgn"))
    positions = session['positions']
    fens = list(positions.keys())
    moves = list(positions.values())
    index = random.randint(0, len(fens)-1)
    fen, move = fens[index], moves[index]
    print(move)
    return render_template('train.html', fen=fen, move=move)

@app.route("/upload_pgn", methods=['GET', 'POST'])
def upload_pgn():
    form = PgnForm()
    if form.validate_on_submit():
        pgn = form.pgn.data
        color = chess.WHITE if form.color.data == 'white' else chess.BLACK
        start = form.start.data
        positions = fens_from_pgn(pgn, color, start=start)
        session['positions'] = positions
        return redirect(url_for('train'))
    return render_template('upload_pgn.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(username=form.username.data).first()
        if user and bcrypt.check_password_hash(user.password, form.password.data):
            login_user(user, remember=form.remember.data)
            return redirect('/')
        #flash('Přihlášení se nezdařilo - zkontrolujte jméno a heslo', 'danger')
    return render_template('login.html', form=form)

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))