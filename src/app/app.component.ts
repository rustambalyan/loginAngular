import { Component, OnInit } from '@angular/core';
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import M from './aps.js'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'loginAngular';

  constructor() {
  }

  firebaseConfig = {
    apiKey: "AIzaSyBh5JdB6XoUSNLkd1rm6R_HpOGLUFYJobo",
    authDomain: "tasks-19850.firebaseapp.com",
    databaseURL: "https://tasks-19850-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "tasks-19850",
    storageBucket: "tasks-19850.appspot.com",
    messagingSenderId: "51202419101",
    appId: "1:51202419101:web:a7a17a5966ae83fe4f6774"
  };


  firebaseApp = firebase.initializeApp(this.firebaseConfig);

  db = this.firebaseApp.firestore();
  auth = this.firebaseApp.auth();

  signupForm: FormGroup = new FormGroup<any>({
    email: new FormControl,
    password: new FormControl
  })


  ngOnInit() {
    //listen for auth status changes
    this.auth.onAuthStateChanged(user => {
      if (user) {
        //get data
        this.db.collection('guides').onSnapshot(snapshot => {
          setupGuides(snapshot.docs);
          setupUI(user);
        })
      } else {
        // @ts-ignore
        setupUI()
        setupGuides([])
      }
    });

    //signup
    const signupForm = document.querySelector('#signup-form') as any;
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let email = signupForm['signup-email'].value;
      let password = signupForm['signup-password'].value;
      this.auth.createUserWithEmailAndPassword(email, password).then(cred => {
        const modal = document.querySelector('#modal-signup');
        M.Modal.getInstance(modal).close();
        signupForm.reset();
      })
    })
    //logout
    const logout = document.querySelector('#logout');
    logout.addEventListener('click', (e) => {
      e.preventDefault();
      this.auth.signOut()
    })

    //login
    const loginForm = document.querySelector('#login-form');
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let email = loginForm['login-email'].value;
      let password = loginForm['login-password'].value;
      this.auth.signInWithEmailAndPassword(email, password).then(cred => {
        const modal = document.querySelector('#modal-login');
        M.Modal.getInstance(modal).close();
        loginForm['login-email'].value = null;
        loginForm['login-password'].value = null
      })
    })


    //main data
    const guideList = document.querySelector('.guides');
    const setupGuides = (data) => {

      if (data.length) {
        let html = '';
        data.forEach(doc => {
          const guide = doc.data();
          const li = `
        <li>
            <div class="collapsible-header grey lighten-4">${guide.title}</div>
            <div class="collapsible-body white">${guide.content}</div>
        </li>
        `;
          html += li
        });

        guideList.innerHTML = html;
      } else {
        guideList.innerHTML = `<h5 class="center-align">Login to view guides</h5>`
      }
    };
    const loggedOutLinks = document.querySelectorAll('.logged-out') as any;
    const loggedInLinks = document.querySelectorAll('.logged-in') as any;
    const accountDetails = document.querySelector('.account-details') as any


    const setupUI = (user) => {
      if (user) {
        const html = `
        <div>Logged in as ${user.email}</div>
        `;
        accountDetails.innerHTML = html;
        loggedInLinks.forEach(item => {
          item.style.display = 'block'
        });
        loggedOutLinks.forEach(item => {
          item.style.display = 'none'
        })
      } else {
        // accountDetails.innerHTML = '';
        loggedInLinks.forEach(item => {
          item.style.display = 'none'
        });
        loggedOutLinks.forEach(item => {
          item.style.display = 'block'
        })
      }
    };

    //create new guide

    const createForm = document.querySelector('#create-form') as any;
    createForm.addEventListener('submit', (e) => {
      e.preventDefault();
      this.db.collection('guides').add({
        title: createForm['title'].value,
        content: createForm['content'].value
      }).then(() => {
        const modal = document.querySelector('#modal-create');
        M.Modal.getInstance(modal).close();
        createForm.reset();
      }).catch(err => {
        console.log(err.message)
      })
    });
  }

}
