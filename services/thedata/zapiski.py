import secrets
from flask import Flask, render_template, redirect, url_for, request, flash
from flask_bootstrap import Bootstrap5

from flask_wtf import FlaskForm, CSRFProtect
from wtforms import Label, IntegerField, StringField, SubmitField
from wtforms.validators import DataRequired, Length

from time import sleep

import encryptor
import db

app = Flask(__name__)
app.secret_key = secrets.token_urlsafe(16)

bootstrap = Bootstrap5(app)
csrf = CSRFProtect(app)

app.config['WTF_CSRF_ENABLED'] = False


class IndexForm(FlaskForm):
    message = StringField('Your message: ', validators=[DataRequired(), Length(1, 120)])
    submit = SubmitField('Submit')

class ViewForm(FlaskForm):
    message = StringField('Message: ', render_kw={'readonly':True}) # encrypted if the key is wrong
    messageId = IntegerField('Message ID: ', validators=[DataRequired()])
    key = StringField('Key: ', validators=[DataRequired(), Length(1, 120)])
    showMessage = SubmitField('Show message')

@app.context_processor
def utility_processor():
    highestId = None
    try:
        highestId = db.getHighestId()
    except Exception as ex:
        pass
    if highestId is None:
        highestId = 0
    return dict(highestId = highestId)


@app.route('/', methods=['GET', 'POST'])
def index():
    print('in index') # TODO: REMOVE
    form = IndexForm()
    message = ''
    if form.validate_on_submit():
        message = form.message.data
        result = encryptor.encrypt(message)
        (error, encryptedMessage, key) = result
        if error != '':
            return render_template('index.html', form=form, error_msg=error)
        messageId = None
        try:
            messageId = db.insertIntoDatabase(encryptedMessage)
        except Exception as ex:
            return render_template('index.html', form=form, error_msg=ex.args)
        if messageId is None:
            return render_template('index.html', form=form, error_msg='id is None')
        return redirect(url_for('view', id=messageId, key=key))
    
    return render_template('index.html', form=form, error_msg=request.args.get('error_msg', ''))

@app.route('/view', methods=['GET', 'POST'])
def view():
    # print(f"Viewing message with id {id} with key {key}")
    form = ViewForm()
    messageId = request.args.get('id')
    key = request.args.get('key')
    message = ''
    if form.messageId.data is None and messageId is not None:
        form.messageId.data = messageId
    if form.key.data is None and key is not None:
        form.key.data = key
    messageId = form.messageId.data
    key = form.key.data

    if messageId is not None and int(messageId) >= 0:
        form.messageId.data = messageId
        encryptedMessage = None
        try:
            encryptedMessage = db.getEncryptedMessageById(messageId)
            form.message.data = encryptedMessage
        except Exception as ex:
            return render_template('view.html', form=form, error_msg=ex.args)
        if encryptedMessage is not None:
            message = encryptedMessage
            form.message.data = message
            (error, message) = encryptor.decrypt(encryptedMessage, key)
            if error != '':
                return render_template('view.html', form=form, error_msg=error)
            form.message.data = message
        
    if form.validate_on_submit():
        return redirect(url_for('view', id=messageId, key=key))
    return render_template('view.html', form=form, error_msg=request.args.get('error_msg', ''))

