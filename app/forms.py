from collections.abc import Sequence
from typing import Any, Mapping
from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, BooleanField, BooleanField, SelectField, IntegerField, TextAreaField
from wtforms.validators import DataRequired, NumberRange, ValidationError
from .utils import check_pgn

class LoginForm(FlaskForm):
    username = StringField('Username', validators=[DataRequired()])
    password = PasswordField('Heslo', validators=[DataRequired()])
    remember = BooleanField('Pamatuj si mě')
    submit = SubmitField('Přihlásit')

class PgnForm(FlaskForm):
    pgn = TextAreaField('png', validators=[DataRequired()])
    color = SelectField('color', validators=[DataRequired()], choices=['black', 'white'])
    start = IntegerField('start', validators=[DataRequired(), NumberRange(min=1, max=30)], default=1)
    submit = SubmitField('Submit')

    def validate_pgn(form, pgn):
        res, move = check_pgn(pgn.data, form.color.data)
        if res: return
        if move == "invalid pgn":
            raise ValidationError("Invalid pgn")
        raise ValidationError("Your pgn has more than one variant for selected color on move"+str(move))