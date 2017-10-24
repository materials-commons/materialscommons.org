import axios from 'axios';

let mcuser = null;

if (window.sessionStorage.getItem("mcuser")) {
    try {
        mcuser = JSON.parse(window.sessionStorage.getItem("mcuser"));
    } catch (err) {
        console.log('Error parsing mcuser in sessionStorage');
        mcuser = null;
    }
}

export function isAuthenticated() {
    return mcuser !== null;
}

export function user() {
    return mcuser ? mcuser : null;
}

export function apikey() {
    return mcuser ? mcuser.apikey : null;
}

export function login(email, password) {
    return axios.put(`/api/user/${email}/apikey`, {password: password}).then(
        (result) => {
            window.sessionStorage.setItem('mcuser', JSON.stringify(result.data));
            mcuser = result.data;
        }
    );
}

export function logout() {
    window.sessionStorage.removeItem("mcuser");
}