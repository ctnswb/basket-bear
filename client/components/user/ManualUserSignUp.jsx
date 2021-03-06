import React from 'react';
import firebase from 'firebase';
import axios from 'axios';

class ManualUserSignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      username: '',
      password: '',
      messages: '',
    };

    this.handleUsername = this.handleUsername.bind(this);
    this.handlePassword = this.handlePassword.bind(this);
    this.handleSignup = this.handleSignup.bind(this);
  }

  handleUsername(event) {
    this.setState({ username: event.target.value });
  }

  handlePassword(event) {
    this.setState({password: event.target.value});
  }
  

  handleSignup(event) {
    event.preventDefault(); 
    axios.get('/checkemail?email='+this.state.username+'&auth=noBadMail').then( result =>{
      if(!result.data){
          firebase.auth().createUserWithEmailAndPassword(this.state.username, this.state.password)
      .then((value) => {
        this.setState({ messages: `A verification email has been sent to: ${event.target.value.email}` });
      })
      .catch((error) => {
        this.setState({ messages: `ERROR: ${error.message}` });
      });
      } else {
        this.setState({ messages: `ERROR:  Cannot use this type of web mail` });
      }
    }).catch(error =>{
      this.setState({ messages: `ERROR: ${error.message}` });
    })



  }

  render() {
    return (
      <div>
      {this.state.messages && <div className="api-user-error">{this.state.messages}</div>}
      <form >
      <div className="manual-login">

            <div className="email-form">
            <label><b>Email</b></label>
            <input
              className="login-input"
              name="email"
              type="email"
              value={this.state.username}
              onChange={this.handleUsername}
              required />
            </div>
            <div className="password-form">
            <label htmlFor="password"><b>Password</b></label>
            <input className="login-input"
              type="password"
              autoComplete="new-password"
              value={this.state.password}
              onChange={this.handlePassword}
              required
             />
           </div>
           <div className="button-wrapper">
             <button className="button button-signup button--homeout"onClick={ this.handleSignup } >Sign Up</button>
            </div>
          </div>
          <div className="toggle-login" onClick={this.props.toggleView}>
            <a>Already have a Basket Bear Account? Login instead</a>
          </div>
          </form>
          </div>
    );
  }
}
export default ManualUserSignUp;
