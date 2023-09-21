from flask import Flask, render_template, request, redirect, session, jsonify, flash
import datetime
from flask_socketio import SocketIO, emit
import json

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
socketio = SocketIO(app)

def load_messages(channel):
    messages = []
    channels = load_channels()

    # Find the messages file associated with the specified channel
    messages_file = next((channel_info["messages_file"] for channel_info in channels if channel_info["name"] == channel), None)

    if messages_file:
        try:
            with open(f'messages/{messages_file}', 'r') as f:
                messages = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            pass

    return messages


def save_message(username, message, channel):
    timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    message_data = {
        "username": username,
        "message": message,
        "timestamp": timestamp
    }

    channels = load_channels()

    # Find the messages file associated with the specified channel
    messages_file = next((channel_info["messages_file"] for channel_info in channels if channel_info["name"] == channel), None)

    if messages_file:
        try:
            with open(f'messages/{messages_file}', 'r') as f:
                messages = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            messages = []

        messages.append(message_data)

        with open(f'messages/{messages_file}', 'w') as f:
            json.dump(messages, f, indent=4)


def load_users():
    with open('users.json', 'r') as f:
        users = json.load(f)
    return users
def save_users(users):
    with open('users.json', 'w') as f:
        json.dump(users, f, indent=4)

def load_channels():
    try:
        with open('channels.json', 'r') as f:
            channels_data = json.load(f)
            return channels_data['channels']
    except (FileNotFoundError, json.JSONDecodeError) as e:
        print("Error loading channels:", e)
        return []

def is_verified(username):
    users = load_users()  # Load user data from users.json
    user_info = users.get(username, {})
    return user_info.get("verified", False)


@app.route('/')
def index():
    if 'username' in session:
        users = load_users()
        user_info = users.get(session['username'], {})
        if user_info.get("verified", False):
            # User is verified, continue with the regular behavior
            channels = load_channels()
            if channels:
                messages = load_messages(channels[0]['name'])
            else:
                messages = []
            return render_template('index.html', username=session['username'], channels=channels, messages=messages)

    # If the user is either not logged in or not verified, show the "Not Logged In" page
    return render_template('not_logged_in.html')



@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        users = load_users()
        user_info = users.get(username)

        if user_info and user_info["password"] == password:
            session['username'] = username
            if user_info.get("verified", False):
                return redirect('/')
            else:
                return render_template('not_verified.html')  # Render the not_verified.html template for non-verified users
        else:
            return render_template('login.html', invalid_credentials=True)

    return render_template('login.html', invalid_credentials=False)

@app.route('/create_channel', methods=['GET'])
def create_channel():
    new_channel_name = request.args.get('channel')
    if new_channel_name:
        channels = load_channels()
        new_channel = {"name": new_channel_name, "messages_file": f"{new_channel_name}_messages.json"}
        channels.append(new_channel)
        save_message(session['username'], f"Channel '{new_channel_name}' created.", "general")  # Save a message to general channel
        save_channels(channels)  # Save the updated list of channels
        # Create an empty messages file for the new channel
        with open(f'messages/{new_channel["messages_file"]}', 'w') as f:
            json.dump([], f)
        return jsonify({"success": True})
    return jsonify({"success": False})

def save_channels(channels):
    channels_data = {"channels": channels}
    with open('channels.json', 'w') as f:
        json.dump(channels_data, f, indent=4)


@socketio.on('send_message_event')
def handle_send_message(data):
    if 'username' in session:
        message = data.get('message')
        selected_channel = data.get('selected_channel')
        if message and selected_channel:
            save_message(session['username'], message, selected_channel)
            timestamp = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            emit('new_message', {'username': session['username'], 'message': message, 'selected_channel': selected_channel, 'timestamp': timestamp}, broadcast=True)




@app.route('/load_messages', methods=['GET'])
def load_messages_ajax():
    channel = request.args.get('channel')
    messages = load_messages(channel)
    return jsonify({'messages': messages, 'channel': channel})




@app.route('/profile')
def profile():
    if 'username' in session:
        users = load_users()
        user_info = users.get(session['username'])
        if user_info:
            is_admin = user_info.get('admin', False)
            return render_template('profile.html', username=session['username'], is_admin=is_admin, user_info=user_info)
    return redirect('/login')


@app.errorhandler(Exception)
def handle_error(error):
    # Log the error for debugging
    app.logger.error(f"An error occurred: {str(error)}")

    # Return a custom error page or JSON response
    return render_template('error.html'), 500


@app.route('/logout')
def logout():
    session.pop('username', None)
    return redirect('/')

@app.route('/about')
def about():
    if 'username' in session:
        users = load_users()
        username = session['username']
        return render_template('about.html', users=users, username=username)
    return redirect('/login')

@app.route('/change_username', methods=['POST'])
def change_username():
    if 'username' in session:
        new_username = request.form.get('new_username')
        if new_username:
            if len(new_username) > 32:
                return render_template('profile.html', username=session['username'], username_error='Username cannot exceed 32 characters')
            else:
                users = load_users()
                if new_username not in users:
                    users[new_username] = users.pop(session['username'])
                    save_users(users)
                    session['username'] = new_username
                    return render_template('profile.html', username=new_username, username_success='Username changed successfully')
                else:
                    return render_template('profile.html', username=session['username'], username_error='Username is already taken')
    return redirect('/profile')


@app.route('/change_password', methods=['POST'])
def change_password():
    if 'username' in session:
        current_password = request.form.get('current_password')
        print(current_password)
        new_password = request.form.get('new_password')
        users = load_users()

        if users.get(session['username'])["password"] == current_password:
            users[session['username']]["password"] = new_password
            save_users(users)
            return render_template('profile.html', username=session['username'], password_change_success=True)
        else:
            return render_template('profile.html', username=session['username'], password_change_error=True)

    return redirect('/login')

@app.route('/toggle_dark_mode', methods=['POST'])
def toggle_dark_mode():
    if 'username' in session:
        session['dark_mode'] = not session.get('dark_mode', False)
    return redirect(request.referrer)



@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        users = load_users()

        if username in users:
            return render_template('register.html', username_taken=True)
        elif len(username) > 32:
            return render_template('register.html', username_length_exceeded=True)
        else:
            users[username] = {"password": password, "admin": False, "verified": False}  # Set verified to False
            save_users(users)
            return render_template('register.html', registration_success=True)

    return render_template('register.html')

@app.route('/update_identity', methods=['POST'])
def update_identity():
    if 'username' in session:
        new_identity = request.form.get('identity')
        users = load_users()
        user_info = users.get(session['username'])

        if new_identity:
            if len(new_identity) > 72:
                return render_template('profile.html', username=session['username'], is_admin=user_info.get('admin', False), user_info=user_info, identity_error='Identity information cannot exceed 200 characters.')
            else:
                user_info['identity'] = new_identity
                save_users(users)
                return render_template('profile.html', username=session['username'], is_admin=user_info.get('admin', False), user_info=user_info, identity_success='Identity information updated successfully.')
    return redirect('/login')

@app.route('/update_about_me', methods=['POST'])
def update_about_me():
    if 'username' in session:
        new_about_me = request.form.get('about_me')
        users = load_users()
        user_info = users.get(session['username'])

        if new_about_me:
            if len(new_about_me) > 200:
                return render_template('profile.html', username=session['username'], is_admin=user_info.get('admin', False), user_info=user_info, about_me_error='About Me information cannot exceed 200 characters.')
            else:
                user_info['about_me'] = new_about_me
                save_users(users)
                return render_template('profile.html', username=session['username'], is_admin=user_info.get('admin', False), user_info=user_info, about_me_success='About Me information updated successfully.')
    return redirect('/login')




if __name__ == '__main__':
    socketio.run(app,host="0.0.0.0", port="80",debug=True, allow_unsafe_werkzeug=True)
