import app from 'firebase/app';
import 'firebase/auth';
import 'firebase/database';

var config = {
    apiKey: "AIzaSyCNxmWwOl08ZOJccx179FG4de2Ubql527M",
    authDomain: "midasbrewpie.firebaseapp.com",
    databaseURL: "https://midasbrewpie.firebaseio.com",
    projectId: "midasbrewpie",
    storageBucket: "midasbrewpie.appspot.com",
    messagingSenderId: "687577017760"
};

class Firebase {
    constructor() {
        app.initializeApp(config);
        this.auth = app.auth();
        this.db = app.database();
    }

    // *** Auth API ***
    doCreateUserWithEmailAndPassword = (email, password) =>
        this.auth.createUserWithEmailAndPassword(email, password);
    doSignInWithEmailAndPassword = (email, password) =>
        this.auth.signInWithEmailAndPassword(email, password);
    doSignOut = () => this.auth.signOut();
    doPasswordReset = email => this.auth.sendPasswordResetEmail(email);
    doPasswordUpdate = password =>
      this.auth.currentUser.updatePassword(password);    

  // *** DB API ***
  user = uid => this.db.ref(`users/${uid}`);
  users = () => this.db.ref('users');      
  fermentations = () => this.db.ref('fermentations');      
}
  
export default Firebase;